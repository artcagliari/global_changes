// Vercel Serverless Function - Catch-all route para Express
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Readable } from 'stream'
import busboy from 'busboy'

let app: any = null

// Criar uma classe que herda de Readable para o request
class ExpressRequestStream extends Readable {
  private _expressData: any
  private _bodyStream?: Readable
  
  constructor(expressData: any, bodyStream?: Readable) {
    super()
    this._expressData = expressData
    this._bodyStream = bodyStream
    
    // Se tiver bodyStream, fazer pipe
    if (bodyStream) {
      bodyStream.on('data', (chunk) => {
        if (!this.destroyed) {
          this.push(chunk)
        }
      })
      bodyStream.on('end', () => {
        if (!this.destroyed) {
          this.push(null)
        }
      })
      bodyStream.on('error', (err) => {
        this.destroy(err)
      })
    } else {
      // Sem stream, finalizar imediatamente
      setImmediate(() => {
        if (!this.destroyed) {
          this.push(null)
        }
      })
    }
  }
  
  // Implementar métodos do Express Request
  get method() { return this._expressData.method }
  get url() { return this._expressData.url }
  get originalUrl() { return this._expressData.originalUrl }
  get path() { return this._expressData.path }
  get baseUrl() { return this._expressData.baseUrl }
  get query() { return this._expressData.query }
  get params() { return this._expressData.params }
  get headers() { return this._expressData.headers }
  get protocol() { return this._expressData.protocol }
  get secure() { return this._expressData.secure }
  get hostname() { return this._expressData.hostname }
  get ip() { return this._expressData.ip }
  get body() { return this._expressData.body }
  
  get(name: string) {
    return this._expressData.get(name)
  }
  
  header(name: string) {
    return this._expressData.header(name)
  }
  
  _read(size?: number) {
    // O stream é controlado pelo bodyStream via eventos
    // Este método é chamado quando alguém lê do stream
    if (this._bodyStream && !this._bodyStream.readableEnded) {
      // Deixar o bodyStream continuar enviando dados
      return
    }
  }
}

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
    
    // Para multipart/form-data, processar manualmente antes de passar para Express
    const isMultipart = req.headers['content-type']?.includes('multipart/form-data')
    const isUploadRoute = pathOnly === '/api/videos/upload'
    
    // Se for upload de vídeo, processar multipart manualmente
    if (isMultipart && isUploadRoute && req.body) {
      return new Promise<void>((resolve) => {
        const formData: any = {}
        const files: any = {}
        
        // Criar stream do body
        let bodyStream: Readable
        if (Buffer.isBuffer(req.body)) {
          bodyStream = Readable.from(req.body)
        } else if (typeof req.body === 'string') {
          bodyStream = Readable.from(Buffer.from(req.body))
        } else {
          return res.status(400).json({ error: 'Body inválido para multipart' })
        }
        
        const bb = busboy({ headers: req.headers as any })
        
        bb.on('file', (name, file, info) => {
          const { filename, encoding, mimeType } = info
          const chunks: Buffer[] = []
          
          file.on('data', (chunk) => {
            chunks.push(chunk)
          })
          
          file.on('end', () => {
            files[name] = {
              fieldname: name,
              originalname: filename,
              encoding,
              mimetype: mimeType,
              buffer: Buffer.concat(chunks),
              size: Buffer.concat(chunks).length
            }
          })
        })
        
        bb.on('field', (name, value) => {
          formData[name] = value
        })
        
        bb.on('finish', async () => {
          // Criar request object com dados processados
          const expressData: any = {
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
            body: formData
          }
          
          // Adicionar file e files como propriedades (não getters)
          expressData.file = files['video'] || null
          expressData.files = files
          
          // Processar no Express
          const expressApp = await getApp()
          expressApp(expressData, res as any, (err?: any) => {
            if (err) {
              console.error('Erro no Express:', err.message)
              if (!res.headersSent) {
                res.status(500).json({ error: 'Erro interno do servidor', message: err.message })
              }
            }
            resolve()
          })
        })
        
        bb.on('error', (err) => {
          console.error('Erro ao processar multipart:', err)
          if (!res.headersSent) {
            res.status(400).json({ error: 'Erro ao processar upload', message: err.message })
          }
          resolve()
        })
        
        bodyStream.pipe(bb)
      })
    }
    
    // Para outras rotas, criar request object normal
    const expressData = {
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
      body: req.body
    }
    
    const expressReq = expressData
    
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
