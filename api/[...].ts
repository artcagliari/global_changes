// Vercel Serverless Function - Catch-all route para Express
import type { VercelRequest, VercelResponse } from '@vercel/node'

let app: any = null

async function getApp() {
  if (!app) {
    try {
      let serverModule: any
      try {
        serverModule = await import('../server/src/index.js')
      } catch {
        serverModule = await import('../server/dist/index.js')
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
  try {
    const expressApp = await getApp()
    
    // Construir path
    let path = req.url || '/'
    if (!path.startsWith('/api')) {
      path = '/api' + (path.startsWith('/') ? path : '/' + path)
    }
    
    // Criar request compatível com Express
    const expressReq = {
      ...req,
      method: (req.method || 'GET').toUpperCase(),
      url: path,
      originalUrl: path,
      path: path.split('?')[0],
      baseUrl: '',
      query: req.query || {},
      params: {},
      get: (name: string) => req.headers?.[name.toLowerCase()],
      header: (name: string) => req.headers?.[name.toLowerCase()]
    } as any
    
    // Remover body para multipart (Multer vai processar)
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
      
      res.end = (...args: any[]) => {
        finish()
        return originalEnd(...args)
      }
      
      res.json = (body?: any) => {
        finish()
        return originalJson(body)
      }
      
      res.send = (body?: any) => {
        finish()
        return originalSend(body)
      }
      
      // Chamar Express
      expressApp(expressReq, res, (err?: any) => {
        if (err) {
          console.error('Erro no Express:', err.message)
          if (!res.headersSent) {
            res.status(500).json({ error: 'Erro interno do servidor' })
          }
        } else if (!res.headersSent) {
          res.status(404).json({ error: 'Rota não encontrada' })
        }
        finish()
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