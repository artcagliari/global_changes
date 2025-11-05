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
    
    // No Vercel com api/[...].ts, o req.url pode vir de diferentes formas:
    // 1. Se o rewrite no vercel.json mantém /api: req.url = '/api/users/123'
    // 2. Se o rewrite remove /api: req.url = '/users/123'
    // 3. Os segmentos podem vir em req.query quando usa [...]
    
    let url = req.url || ''
    
    console.log('🔍 DEBUG Vercel Request:')
    console.log(`   req.url: ${req.url}`)
    console.log(`   req.method: ${req.method}`)
    console.log(`   req.query:`, JSON.stringify(req.query))
    
    // Se não tiver URL ou for apenas '/', construir a partir do query
    // Quando usa [...], os segmentos vêm em req.query como '0', '1', etc.
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
    
    // IMPORTANTE: No Vercel com api/[...].ts, o path pode não incluir /api
    // Precisamos adicionar /api se não tiver
    if (!url.startsWith('/api')) {
      url = '/api' + (url.startsWith('/') ? url : '/' + url)
    }
    
    // Separar path e query string
    const [pathOnly, queryString] = url.split('?')
    const fullUrl = pathOnly + (queryString ? '?' + queryString : '')
    
    console.log(`📨 ${req.method} ${pathOnly}`)
    console.log(`   URL final: ${fullUrl}`)
    
    // Criar um objeto request que o Express possa processar
    // O Express precisa que o request tenha propriedades específicas
    const expressReq = {
      ...req,
      url: fullUrl,
      originalUrl: fullUrl,
      path: pathOnly,
      baseUrl: '',
      method: req.method || 'GET',
      query: req.query || {},
      params: {},
      body: req.body,
      headers: req.headers || {},
      // Métodos do Express Request
      get: function(name: string) {
        const headers = this.headers || {}
        return headers[name.toLowerCase()]
      },
      header: function(name: string) {
        return this.get(name)
      },
      // Propriedades adicionais necessárias
      protocol: 'https',
      secure: true,
      hostname: req.headers?.['host']?.split(':')[0] || 'localhost',
      ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'] || '0.0.0.0',
      // Propriedades do Express
      route: undefined,
      res: res,
      // Propriedades do Node.js IncomingMessage (para compatibilidade)
      httpVersion: '1.1',
      httpVersionMajor: 1,
      httpVersionMinor: 1,
      complete: false,
      rawHeaders: [],
      rawTrailers: [],
      trailers: {},
      upgrade: false,
      aborted: false,
      read: function() {},
      setEncoding: function() {},
      pause: function() {},
      resume: function() {},
      destroy: function() {},
    } as any
    
    // Processar a requisição no Express usando Promise
    return new Promise<void>((resolve) => {
      let finished = false
      let responseSent = false
      
      const checkFinished = () => {
        if (res.headersSent || responseSent) {
          if (!finished) {
            finished = true
            resolve()
          }
        }
      }
      
      // Interceptar métodos de resposta
      const originalEnd = res.end.bind(res)
      res.end = function(...args: any[]) {
        responseSent = true
        const result = originalEnd(...args)
        setTimeout(checkFinished, 10)
        return result
      }
      
      const originalJson = res.json.bind(res)
      res.json = function(body?: any) {
        responseSent = true
        const result = originalJson(body)
        setTimeout(checkFinished, 10)
        return result
      }
      
      const originalSend = res.send.bind(res)
      res.send = function(body?: any) {
        responseSent = true
        const result = originalSend(body)
        setTimeout(checkFinished, 10)
        return result
      }
      
      // Processar com Express
      expressApp(expressReq, res, (err?: any) => {
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
              console.error('Erro ao enviar resposta de erro:', sendError)
            }
          }
          checkFinished()
        } else {
          // Se não houve erro mas a resposta não foi enviada, o Express não encontrou a rota
          if (!res.headersSent && !responseSent) {
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
              originalUrl: req.url,
              debug: {
                reqUrl: req.url,
                query: req.query,
                finalPath: pathOnly
              }
            })
            responseSent = true
          }
          checkFinished()
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
          finished = true
          resolve()
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
