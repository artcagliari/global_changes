// Vercel Serverless Function - Catch-all route para Express
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Cache do app Express
let app: any = null

async function getApp() {
  if (!app) {
    try {
      console.log('📦 Inicializando servidor Express...')
      
      if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL não configurado!')
      } else {
        console.log('✅ DATABASE_URL configurado')
      }
      
      // Importar o app Express
      const serverModule = await import('../server/src/index.js')
      app = serverModule.default
      
      console.log('✅ Servidor Express carregado com sucesso')
    } catch (error: any) {
      console.error('❌ Erro ao carregar servidor:', error.message)
      console.error('Stack:', error.stack)
      throw error
    }
  }
  return app
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = await getApp()
    
    // No Vercel com api/[...].ts, o path vem completo em req.url
    // Exemplo: requisição para /api/users/123 resulta em req.url = '/users/123' ou '/api/users/123'
    // Dependendo da configuração do vercel.json
    
    let path = req.url || ''
    
    // Se a URL estiver vazia ou for apenas '/', tentar construir a partir do query
    // Quando usa [...], os segmentos podem vir em req.query como '0', '1', etc.
    if (!path || path === '/') {
      if (req.query && Object.keys(req.query).length > 0) {
        const segments: string[] = []
        let i = 0
        while (req.query[String(i)]) {
          segments.push(String(req.query[String(i)]))
          i++
        }
        if (segments.length > 0) {
          path = '/' + segments.join('/')
        }
      }
    }
    
    // Garantir que o path comece com /api
    // Se o rewrite no vercel.json já adicionou /api, não adicionar novamente
    if (!path.startsWith('/api')) {
      path = '/api' + (path.startsWith('/') ? path : '/' + path)
    }
    
    // Separar query string do path
    const [pathOnly, queryString] = path.split('?')
    const fullUrl = pathOnly + (queryString ? '?' + queryString : '')
    
    console.log(`📨 ${req.method} ${pathOnly}`)
    console.log(`   req.url original: ${req.url}`)
    console.log(`   path final: ${pathOnly}`)
    
    // Criar um objeto request compatível com Express
    // Modificar o req diretamente (não criar novo objeto)
    const expressReq = req as any
    
    // Ajustar propriedades essenciais que o Express precisa
    expressReq.url = fullUrl
    expressReq.originalUrl = fullUrl
    expressReq.path = pathOnly
    expressReq.baseUrl = ''
    
    // Garantir que propriedades essenciais existam
    if (!expressReq.method) {
      expressReq.method = req.method || 'GET'
    }
    if (!expressReq.query) {
      expressReq.query = {}
    }
    if (!expressReq.params) {
      expressReq.params = {}
    }
    
    // Adicionar métodos do Express Request se não existirem
    if (typeof expressReq.get !== 'function') {
      expressReq.get = function(name: string) {
        const headers = this.headers || {}
        return headers[name.toLowerCase()]
      }
    }
    
    if (typeof expressReq.header !== 'function') {
      expressReq.header = function(name: string) {
        return this.get(name)
      }
    }
    
    // Processar a requisição no Express
    return new Promise<void>((resolve) => {
      let finished = false
      
      const finish = () => {
        if (!finished) {
          finished = true
          resolve()
        }
      }
      
      // Interceptar métodos de resposta para detectar quando terminar
      const originalEnd = res.end.bind(res)
      res.end = function(...args: any[]) {
        const result = originalEnd(...args)
        finish()
        return result
      }
      
      const originalJson = res.json.bind(res)
      res.json = function(body?: any) {
        const result = originalJson(body)
        finish()
        return result
      }
      
      const originalSend = res.send.bind(res)
      res.send = function(body?: any) {
        const result = originalSend(body)
        finish()
        return result
      }
      
      // Processar com Express
      // O callback é chamado quando o Express termina de processar (ou quando não encontra rota)
      expressApp(expressReq, res, (err?: any) => {
        if (err) {
          console.error('❌ Erro no Express:', err)
          if (!res.headersSent) {
            try {
              res.status(500).json({
                error: 'Erro interno do servidor',
                message: err.message
              })
            } catch (sendError) {
              console.error('Erro ao enviar resposta de erro:', sendError)
            }
          }
          finish()
        } else {
          // Se não houve erro mas a resposta não foi enviada, o Express não encontrou a rota
          if (!res.headersSent) {
            console.error('❌ Rota não encontrada pelo Express!')
            console.error(`   Método: ${req.method}`)
            console.error(`   Path: ${pathOnly}`)
            console.error(`   URL: ${fullUrl}`)
            console.error(`   req.url original: ${req.url}`)
            console.error(`   req.query:`, req.query)
            
            res.status(404).json({
              error: 'Rota não encontrada',
              path: pathOnly,
              method: req.method,
              originalUrl: req.url
            })
          }
          finish()
        }
      })
      
      // Timeout de segurança (30 segundos)
      setTimeout(() => {
        if (!finished) {
          console.warn('⚠️  Timeout após 30s')
          if (!res.headersSent) {
            res.status(504).json({ error: 'Timeout' })
          }
          finish()
        }
      }, 30000)
    })
  } catch (error: any) {
    console.error('❌ Erro no handler do Vercel:', error.message)
    console.error('Stack:', error.stack)
    
    if (!res.headersSent) {
      try {
        res.status(500).json({
          error: 'Erro ao processar requisição',
          message: error.message
        })
      } catch (sendError) {
        console.error('Erro ao enviar resposta:', sendError)
      }
    }
  }
}
