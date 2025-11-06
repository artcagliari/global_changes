// Vercel Serverless Function - Catch-all route para Express
import type { VercelRequest, VercelResponse } from '@vercel/node'

let app: any = null

async function getApp() {
  if (!app) {
    try {
      let serverModule: any
      try {
        serverModule = await import('../server/src/index.js')
      } catch (error1: any) {
        try {
          // @ts-ignore
          serverModule = await import('../server/dist/index.js')
        } catch (error2: any) {
          throw error1
        }
      }
      app = serverModule.default
      if (!app) {
        throw new Error('App Express não foi exportado corretamente')
      }
    } catch (error: any) {
      console.error('Erro ao carregar servidor:', error.message)
      throw error
    }
  }
  return app
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`🚀 Handler chamado: ${req.method} ${req.url}`)
  console.log(`   Query:`, JSON.stringify(req.query))
  console.log(`   Headers:`, JSON.stringify(req.headers))
  
  try {
    const expressApp = await getApp()
    
    // Construir path do query (catch-all do Vercel)
    // O Vercel passa os segmentos do path como query params: {0: 'api', 1: 'videos', 2: 'upload'}
    let path = '/api'
    const segments: string[] = []
    
    if (req.query) {
      let i = 0
      while (req.query[String(i)] !== undefined) {
        segments.push(String(req.query[String(i)]))
        i++
      }
    }
    
    if (segments.length > 0) {
      path = '/' + segments.join('/')
    } else if (req.url) {
      // Fallback: usar req.url se disponível
      path = req.url.startsWith('/') ? req.url : '/' + req.url
    }
    
    // Garantir /api no início
    if (!path.startsWith('/api')) {
      path = '/api' + (path.startsWith('/') ? path : '/' + path)
    }
    
    const pathOnly = path.split('?')[0]
    console.log(`   Path construído: ${pathOnly}`)
    console.log(`   Segments:`, segments)
    console.log(`   Content-Type: ${req.headers['content-type']}`)
    
    // Criar request object compatível
    const expressReq: any = {
      ...req,
      method: (req.method || 'GET').toUpperCase(),
      url: path,
      originalUrl: path,
      path: pathOnly,
      baseUrl: '',
      query: req.query || {},
      params: {},
      get: (name: string) => req.headers?.[name.toLowerCase()],
      header: (name: string) => req.headers?.[name.toLowerCase()],
      protocol: 'https',
      secure: true,
      hostname: req.headers?.host?.split(':')[0] || '',
      ip: req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || ''
    }
    
    // Para multipart, remover body para o Multer processar
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      delete expressReq.body
    }
    
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
      const originalJson = res.json.bind(res)
      const originalSend = res.send.bind(res)
      
      res.end = function(...args: any[]) {
        finish()
        return originalEnd.apply(this, args)
      }
      
      res.json = function(body?: any) {
        finish()
        return originalJson.call(this, body)
      }
      
      res.send = function(body?: any) {
        finish()
        return originalSend.call(this, body)
      }
      
      // Chamar Express app
      console.log(`   Passando para Express: ${expressReq.method} ${expressReq.path}`)
      expressApp(expressReq, res as any, (err?: any) => {
        if (err) {
          console.error('Erro no Express:', err.message)
          if (!res.headersSent) {
            res.status(500).json({ error: 'Erro interno do servidor' })
          }
          finish()
        } else if (!res.headersSent) {
          // Rota não encontrada
          console.error(`404: ${req.method} ${pathOnly}`)
          res.status(404).json({ 
            error: 'Rota não encontrada',
            method: req.method,
            path: pathOnly,
            url: req.url
          })
          finish()
        } else {
          finish()
        }
      })
      
      // Timeout de segurança
      setTimeout(() => {
        if (!finished && !res.headersSent) {
          res.status(504).json({ error: 'Timeout' })
          finish()
        }
      }, 30000)
    })
  } catch (error: any) {
    console.error('Erro no handler:', error.message)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao processar requisição' })
    }
  }
}