// Vercel Serverless Function - Catch-all route para Express
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Readable } from 'stream'

let app: any = null

async function getApp() {
  if (!app) {
    try {
      const serverModule = await import('../server/dist/index.js')
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
    
    // Construir path - Vercel passa os segments no query como números
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
      path = '/api/' + segments.join('/')
    } else if (req.url) {
      const urlPath = req.url.split('?')[0]
      if (urlPath.startsWith('/api')) {
        path = urlPath
      }
    }
    
    const pathOnly = path.split('?')[0]
    
    // Para multipart/form-data, criar um stream fake para o Multer
    const isMultipart = req.headers['content-type']?.includes('multipart/form-data')
    let bodyStream: Readable | undefined
    
    if (isMultipart && req.body) {
      // Criar um stream a partir do body (se for Buffer ou string)
      if (Buffer.isBuffer(req.body)) {
        bodyStream = Readable.from(req.body)
      } else if (typeof req.body === 'string') {
        bodyStream = Readable.from(Buffer.from(req.body))
      } else if (req.body instanceof Uint8Array) {
        bodyStream = Readable.from(Buffer.from(req.body))
      }
    }
    
    // Criar request object compatível
    const expressReq: any = {
      method: (req.method || 'GET').toUpperCase(),
      url: path,
      originalUrl: path,
      path: pathOnly,
      baseUrl: '',
      query: req.query || {},
      params: {},
      headers: req.headers || {},
      get: (name: string) => req.headers?.[name.toLowerCase()],
      header: (name: string) => req.headers?.[name.toLowerCase()],
      protocol: 'https',
      secure: true,
      hostname: typeof req.headers?.host === 'string' ? req.headers.host.split(':')[0] : '',
      ip: typeof req.headers?.['x-forwarded-for'] === 'string' ? req.headers['x-forwarded-for'].split(',')[0]?.trim() : '',
      // Body - para multipart, passar stream; para outros, passar body processado
      body: isMultipart ? undefined : req.body,
      // Para multipart, adicionar o stream
      ...(isMultipart && bodyStream ? { 
        pipe: bodyStream.pipe.bind(bodyStream),
        on: bodyStream.on.bind(bodyStream),
        readable: true,
        readableEnded: false,
        readableFlowing: null,
        readableObjectMode: false
      } : {
        readable: false,
        readableEnded: true,
        readableFlowing: false,
        readableObjectMode: false
      })
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
      expressApp(expressReq, res as any, (err?: any) => {
        if (err) {
          console.error('Erro no Express:', err.message)
          console.error('Stack:', err.stack)
          if (!res.headersSent) {
            res.status(500).json({ error: 'Erro interno do servidor', message: err.message })
          }
          finish()
        } else if (!res.headersSent) {
          // Não retornar 404 automaticamente - deixar o Express lidar
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
    console.error('Stack:', error.stack)
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Erro ao processar requisição',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }
}
