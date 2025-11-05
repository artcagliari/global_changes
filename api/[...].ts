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
    
    // No Vercel com api/[...].ts, o path vem em req.url
    // Mas pode vir de diferentes formas dependendo do rewrite
    let url = req.url || ''
    
    console.log('🔍 DEBUG Vercel Request:')
    console.log(`   req.url: ${req.url}`)
    console.log(`   req.method: ${req.method}`)
    console.log(`   Content-Type: ${req.headers['content-type']}`)
    
    // Se não tiver URL, construir a partir do query (quando usa [...])
    if (!url || url === '/') {
      if (req.query && Object.keys(req.query).length > 0) {
        const segments: string[] = []
        let i = 0
        while (req.query[String(i)]) {
          segments.push(String(req.query[String(i)]))
          i++
        }
        if (segments.length > 0) {
          url = '/' + segments.join('/')
          console.log(`   URL construída do query: ${url}`)
        }
      }
    }
    
    // Garantir que comece com /api
    if (!url.startsWith('/api')) {
      url = '/api' + (url.startsWith('/') ? url : '/' + url)
    }
    
    // Separar path e query string
    const [pathOnly, queryString] = url.split('?')
    const fullUrl = pathOnly + (queryString ? '?' + queryString : '')
    
    console.log(`📨 ${req.method} ${pathOnly}`)
    console.log(`   URL final: ${fullUrl}`)
    
    // Usar req do Vercel diretamente, apenas ajustando propriedades essenciais
    // O Express precisa que url, originalUrl, path estejam corretos
    const expressReq = req as any
    
    // Ajustar propriedades que o Express precisa para fazer match com rotas
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
    
    // Métodos do Express Request
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
    
    // Para multipart/form-data, remover body parseado se existir
    // O Multer precisa processar o body raw
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      delete expressReq.body
    }
    
    // Processar no Express usando handle diretamente
    return new Promise<void>((resolve) => {
      let finished = false
      let responseSent = false
      
      const finish = () => {
        if (!finished) {
          finished = true
          resolve()
        }
      }
      
      // Interceptar métodos de resposta
      const originalEnd = res.end.bind(res)
      res.end = function(...args: any[]) {
        responseSent = true
        const result = originalEnd(...args)
        finish()
        return result
      }
      
      const originalJson = res.json.bind(res)
      res.json = function(body?: any) {
        responseSent = true
        const result = originalJson(body)
        finish()
        return result
      }
      
      const originalSend = res.send.bind(res)
      res.send = function(body?: any) {
        responseSent = true
        const result = originalSend(body)
        finish()
        return result
      }
      
      // Usar handle do Express diretamente
      // Isso garante que o Express processe o request corretamente
      expressApp.handle(expressReq, res, (err?: any) => {
        if (err) {
          console.error('❌ Erro no Express:', err)
          if (!res.headersSent) {
            try {
              res.status(500).json({
                error: 'Erro interno do servidor',
                message: err.message
              })
              responseSent = true
            } catch (sendError) {
              console.error('Erro ao enviar resposta:', sendError)
            }
          }
          finish()
        } else {
          // Se não houve erro mas a resposta não foi enviada, o Express não encontrou a rota
          if (!res.headersSent && !responseSent) {
            console.error('❌ Rota não encontrada pelo Express!')
            console.error(`   Método: ${req.method}`)
            console.error(`   Path: ${pathOnly}`)
            console.error(`   URL: ${fullUrl}`)
            console.error(`   req.url original: ${req.url}`)
            console.error(`   req.query:`, req.query)
            console.error(`   expressReq.path: ${expressReq.path}`)
            console.error(`   expressReq.url: ${expressReq.url}`)
            
            res.status(404).json({
              error: 'Rota não encontrada',
              path: pathOnly,
              method: req.method,
              originalUrl: req.url,
              debug: {
                reqUrl: req.url,
                query: req.query,
                finalPath: pathOnly,
                expressReqPath: expressReq.path,
                expressReqUrl: expressReq.url
              }
            })
            responseSent = true
          }
          finish()
        }
      })
      
      // Timeout de segurança
      setTimeout(() => {
        if (!finished) {
          console.warn('⚠️  Timeout após 30s')
          if (!res.headersSent && !responseSent) {
            res.status(504).json({ error: 'Timeout' })
            responseSent = true
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
