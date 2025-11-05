// Vercel Serverless Function - Catch-all route
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Importar o app Express diretamente
let app: any = null

async function getApp() {
  if (!app) {
    try {
      console.log('📦 Carregando servidor Express...')
      
      if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL não configurado!')
      } else {
        console.log('✅ DATABASE_URL configurado')
      }
      
      const serverModule = await import('../server/src/index.js')
      app = serverModule.default
      console.log('✅ Servidor Express carregado')
    } catch (error: any) {
      console.error('❌ Erro ao carregar servidor:', error.message)
      console.error('Stack:', error.stack)
      throw error
    }
  }
  return app
}

// Exportar como handler do Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = await getApp()
    
    // No Vercel com api/[...].ts, req.url já vem com o path completo
    // Exemplo: /api/users/123 -> req.url = '/api/users/123'
    // Ou pode vir como /users/123 quando o rewrite remove /api
    let url = req.url || ''
    
    // Se não tiver URL, tentar construir a partir do query
    // Quando usa [...], os segmentos podem vir em req.query
    if (!url || url === '/') {
      if (req.query && Object.keys(req.query).length > 0) {
        // Os segmentos vêm como '0', '1', '2', etc.
        const segments: string[] = []
        let i = 0
        while (req.query[String(i)]) {
          segments.push(String(req.query[String(i)]))
          i++
        }
        if (segments.length > 0) {
          url = '/' + segments.join('/')
        }
      }
    }
    
    // Garantir que comece com /api
    if (!url.startsWith('/api')) {
      url = '/api' + (url.startsWith('/') ? url : '/' + url)
    }
    
    // Separar path e query string
    const [path, queryString] = url.split('?')
    const finalUrl = path + (queryString ? '?' + queryString : '')
    
    console.log(`📨 ${req.method} ${path}`)
    console.log(`   URL original: ${req.url}`)
    console.log(`   URL final: ${finalUrl}`)
    
    // Usar o req do Vercel diretamente, apenas ajustando propriedades essenciais
    // O Express precisa que url, originalUrl, path estejam corretos
    const expressReq = req as any
    
    // Ajustar propriedades que o Express precisa
    expressReq.url = finalUrl
    expressReq.originalUrl = finalUrl
    expressReq.path = finalPath
    expressReq.baseUrl = ''
    
    // Garantir que method esteja presente
    if (!expressReq.method) {
      expressReq.method = req.method || 'GET'
    }
    
    // Garantir que query esteja presente
    if (!expressReq.query) {
      expressReq.query = {}
    }
    
    // Garantir que params esteja presente (será preenchido pelo Express router)
    if (!expressReq.params) {
      expressReq.params = {}
    }
    
    // Métodos do Express Request
    if (!expressReq.get) {
      expressReq.get = function(name: string) {
        const headers = this.headers || {}
        return headers[name.toLowerCase()]
      }
    }
    
    if (!expressReq.header) {
      expressReq.header = function(name: string) {
        return this.get(name)
      }
    }
    
    // Processar no Express usando callback
    return new Promise<void>((resolve) => {
      let finished = false
      
      const finish = () => {
        if (!finished) {
          finished = true
          resolve()
        }
      }
      
      // Interceptar métodos de resposta para saber quando terminar
      const originalEnd = res.end.bind(res)
      res.end = function(chunk?: any, encoding?: any, cb?: any) {
        const result = originalEnd(chunk, encoding, cb)
        setTimeout(finish, 50) // Dar tempo para o Express processar
        return result
      }
      
      const originalJson = res.json.bind(res)
      res.json = function(body?: any) {
        const result = originalJson(body)
        setTimeout(finish, 50)
        return result
      }
      
      const originalSend = res.send.bind(res)
      res.send = function(body?: any) {
        const result = originalSend(body)
        setTimeout(finish, 50)
        return result
      }
      
      // Processar com Express - o callback é chamado quando termina
      expressApp(expressReq, res, (err?: any) => {
        if (err) {
          console.error('❌ Erro no Express middleware:', err)
          console.error('Stack:', err?.stack)
          if (!res.headersSent) {
            try {
              res.status(500).json({
                error: 'Erro interno do servidor',
                message: err?.message || 'Erro desconhecido'
              })
            } catch (sendError) {
              console.error('Erro ao enviar resposta de erro:', sendError)
            }
          }
        } else {
          // Se não houve erro mas a resposta não foi enviada, o Express não encontrou a rota
          if (!res.headersSent) {
            console.error('❌ Rota não encontrada!')
            console.error(`   Método: ${req.method}`)
            console.error(`   Path: ${path}`)
            console.error(`   URL: ${finalUrl}`)
            console.error(`   req.url original: ${req.url}`)
            console.error(`   req.query:`, req.query)
            
            res.status(404).json({
              error: 'Rota não encontrada',
              path: path,
              method: req.method,
              originalUrl: req.url
            })
          } else {
            finish()
          }
        }
      })
      
      // Timeout de segurança
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
    console.error('❌ Erro no handler:', error.message)
    console.error('Stack:', error.stack)
    
    if (!res.headersSent) {
      try {
        return res.status(500).json({
          error: 'Erro ao processar requisição',
          message: error.message
        })
      } catch (sendError) {
        console.error('Erro ao enviar resposta:', sendError)
      }
    }
  }
}

