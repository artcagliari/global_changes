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
    
    // No Vercel com api/[...].ts, req.url vem como /api/rewards, /api/users/:id, etc.
    // Mas precisamos garantir que o path esteja correto
    const url = req.url || req.query?.path || ''
    const path = typeof url === 'string' ? url.split('?')[0] : ''
    
    // Se a URL não começar com /api, adicionar
    const finalPath = path.startsWith('/api') ? path : `/api${path || ''}`
    const queryString = typeof url === 'string' && url.includes('?') ? '?' + url.split('?')[1] : ''
    const finalUrl = finalPath + queryString
    
    console.log(`📨 ${req.method} ${finalPath} (original: ${req.url})`)
    console.log('📋 Query:', req.query)
    console.log('📋 Body:', req.body ? JSON.stringify(req.body).substring(0, 100) : 'empty')
    
    // Criar um objeto request que o Express possa processar
    // Usar req diretamente mas sobrescrever propriedades necessárias
    const expressReq = Object.assign(req, {
      url: finalUrl,
      originalUrl: finalUrl,
      path: finalPath,
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
      hostname: req.headers?.['host'] || 'localhost',
      ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'] || '0.0.0.0',
      // Propriedades do Express
      route: undefined,
      res: undefined,
      next: undefined,
      // Garantir que seja reconhecido como request válido
      connection: {},
      socket: {},
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
    }) as any
    
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
          // Se não houve erro mas a resposta ainda não foi enviada, pode ser que o Express não encontrou a rota
          if (!res.headersSent) {
            console.warn('⚠️  Nenhuma rota encontrada para:', finalPath)
            setTimeout(() => {
              if (!res.headersSent) {
                res.status(404).json({
                  error: 'Rota não encontrada',
                  path: finalPath,
                  method: req.method
                })
              }
              finish()
            }, 100)
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

