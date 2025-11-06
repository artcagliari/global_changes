// Vercel Serverless Function - Catch-all route para Express
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { IncomingMessage, ServerResponse } from 'http'

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
  try {
    const expressApp = await getApp()
    
    // Construir path - no Vercel com catch-all, o path vem em req.query
    let path = req.url || '/'
    
    // Se req.url não tiver path, construir do query (catch-all)
    if (!path || path === '/') {
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
      }
    }
    
    // Garantir que comece com /api
    if (!path.startsWith('/api')) {
      path = '/api' + (path.startsWith('/') ? path : '/' + path)
    }
    
    const pathOnly = path.split('?')[0]
    
    // Criar um IncomingMessage-like object para o Express
    const expressReq = new IncomingMessage(req.socket as any) as any
    
    // Copiar propriedades essenciais do VercelRequest
    expressReq.method = (req.method || 'GET').toUpperCase()
    expressReq.url = path
    expressReq.originalUrl = path
    expressReq.path = pathOnly
    expressReq.query = req.query || {}
    expressReq.params = {}
    expressReq.headers = req.headers || {}
    expressReq.body = req.body
    
    // Para multipart, remover body
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      delete expressReq.body
    }
    
    // Métodos do Express Request
    expressReq.get = function(name: string) {
      return this.headers?.[name.toLowerCase()]
    }
    expressReq.header = expressReq.get
    expressReq.baseUrl = ''
    expressReq.protocol = 'https'
    expressReq.secure = true
    expressReq.hostname = req.headers?.host?.split(':')[0] || ''
    expressReq.ip = req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || ''
    
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
      
      // Chamar Express
      expressApp(expressReq, res as any, (err?: any) => {
        if (err) {
          console.error('Erro no Express:', err.message)
          if (!res.headersSent) {
            res.status(500).json({ error: 'Erro interno do servidor' })
          }
          finish()
        } else if (!res.headersSent) {
          console.error(`404: ${req.method} ${pathOnly}`)
          res.status(404).json({ 
            error: 'Rota não encontrada',
            method: req.method,
            path: pathOnly
          })
          finish()
        } else {
          finish()
        }
      })
      
      // Timeout
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