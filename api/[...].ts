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
    
    // No Vercel, a URL já vem como /api/... quando usando api/[...].ts
    const url = req.url || ''
    const path = url.split('?')[0]
    const finalPath = path.startsWith('/api') ? path : `/api${path}`
    const finalUrl = finalPath + (url.includes('?') ? '?' + url.split('?')[1] : '')
    
    console.log(`📨 ${req.method} ${finalPath}`)
    
    // Criar objeto request compatível com Express
    // Copiar todas as propriedades do req do Vercel
    const expressReq = {
      ...req,
      url: finalUrl,
      originalUrl: finalUrl,
      path: finalPath,
      baseUrl: '',
      method: req.method || 'GET',
      query: req.query || {},
      params: {},
      body: req.body,
      headers: req.headers || {},
      // Métodos do Express
      get: function(name: string) {
        return this.headers?.[name.toLowerCase()]
      },
      header: function(name: string) {
        return this.headers?.[name.toLowerCase()]
      },
      // Propriedades adicionais
      protocol: 'https',
      secure: true,
      hostname: req.headers?.['host'] || 'localhost',
      ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'] || '0.0.0.0',
    } as any
    
    // Processar no Express
    return new Promise<void>((resolve) => {
      let finished = false
      
      const finish = () => {
        if (!finished) {
          finished = true
          resolve()
        }
      }
      
      // Interceptar métodos de resposta
      const originalEnd = res.end.bind(res)
      res.end = function(chunk?: any, encoding?: any, cb?: any) {
        const result = originalEnd(chunk, encoding, cb)
        finish()
        return result
      }
      
      const originalJson = res.json.bind(res)
      res.json = function(body?: any) {
        const result = originalJson(body)
        setTimeout(finish, 10)
        return result
      }
      
      const originalSend = res.send.bind(res)
      res.send = function(body?: any) {
        const result = originalSend(body)
        setTimeout(finish, 10)
        return result
      }
      
      // Processar com Express
      expressApp(expressReq, res, (err: any) => {
        if (err) {
          console.error('❌ Erro no Express:', err)
          if (!res.headersSent) {
            try {
              res.status(500).json({
                error: 'Erro interno do servidor',
                message: err.message
              })
            } catch (sendError) {
              console.error('Erro ao enviar resposta:', sendError)
            }
          }
        }
        finish()
      })
      
      // Timeout de segurança
      setTimeout(() => {
        if (!finished) {
          console.warn('⚠️  Timeout')
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

