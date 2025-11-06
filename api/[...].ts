// Vercel Serverless Function - Catch-all route para Express
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Cache do app Express
let app: any = null

async function getApp() {
  if (!app) {
    try {
      console.log('📦 Inicializando servidor Express...')
      
      // Importar o app Express
      let serverModule: any = null
      
      try {
        serverModule = await import('../server/src/index.js')
      } catch (error: any) {
        serverModule = await import('../server/dist/index.js')
      }
      
      app = serverModule.default
      
      if (!app) {
        throw new Error('App Express não foi exportado corretamente')
      }
      
      console.log('✅ Servidor Express carregado')
    } catch (error: any) {
      console.error('❌ Erro ao carregar servidor:', error.message)
      throw error
    }
  }
  return app
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = await getApp()
    
    // Extrair path do URL
    let path = req.url || '/'
    
    // Se não tiver /api, adicionar
    if (!path.startsWith('/api')) {
      path = '/api' + (path.startsWith('/') ? path : '/' + path)
    }
    
    // Criar request simples para Express
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
    
    // Para multipart, remover body
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
      res.end = function(...args: any[]) {
        finish()
        return originalEnd(...args)
      }
      
      const originalJson = res.json.bind(res)
      res.json = function(body?: any) {
        finish()
        return originalJson(body)
      }
      
      const originalSend = res.send.bind(res)
      res.send = function(body?: any) {
        finish()
        return originalSend(body)
      }
      
      // Chamar Express
      expressApp(expressReq, res, (err?: any) => {
        if (err) {
          console.error('❌ Erro no Express:', err.message)
          if (!res.headersSent) {
            res.status(500).json({ error: 'Erro interno do servidor', message: err.message })
          }
          finish()
        } else if (!res.headersSent) {
          res.status(404).json({ error: 'Rota não encontrada', path: path })
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
    console.error('❌ Erro no handler:', error.message)
    console.error('Stack:', error.stack)
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Erro ao processar requisição',
        message: error.message
      })
    }
  }
}