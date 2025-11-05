// Vercel Serverless Function - Catch-all route para Express
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { IncomingMessage } from 'http'

// Log quando o módulo é carregado
console.log('📦 Módulo api/[...].ts carregado')

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
      let serverModule: any = null
      
      try {
        serverModule = await import('../server/src/index.js')
        console.log('✅ Importado de ../server/src/index.js')
      } catch (error: any) {
        console.log('⚠️  Tentando ../server/dist/index.js')
        try {
          serverModule = await import('../server/dist/index.js')
          console.log('✅ Importado de ../server/dist/index.js')
        } catch (error2: any) {
          console.error('❌ Não conseguiu importar de nenhum caminho')
          throw error
        }
      }
      
      app = serverModule.default
      
      if (!app) {
        throw new Error('App Express não foi exportado corretamente')
      }
      
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
  // Log IMEDIATO quando o handler é chamado
  console.log('🚀 Handler do Vercel chamado!')
  console.log(`   Método: ${req.method}`)
  console.log(`   URL: ${req.url}`)
  console.log(`   Query:`, JSON.stringify(req.query))
  
  try {
    const expressApp = await getApp()
    console.log('✅ Express app obtido')
    
    // Extrair path do URL
    let path = req.url || ''
    
    console.log('🔍 DEBUG Vercel Request:')
    console.log(`   req.url original: ${req.url}`)
    console.log(`   req.method: ${req.method}`)
    
    // Se não tiver URL, construir a partir do query (quando usa [...])
    if (!path || path === '/') {
      if (req.query && Object.keys(req.query).length > 0) {
        const segments: string[] = []
        let i = 0
        while (req.query[String(i)]) {
          segments.push(String(req.query[String(i)]))
          i++
        }
        if (segments.length > 0) {
          path = '/' + segments.join('/')
          console.log(`   Path construído do query: ${path}`)
        }
      }
    }
    
    // Garantir que comece com /api
    if (!path.startsWith('/api')) {
      path = '/api' + (path.startsWith('/') ? path : '/' + path)
    }
    
    // Separar path e query string
    const [pathOnly] = path.split('?')
    const fullUrl = path
    
    console.log(`📨 ${req.method} ${pathOnly}`)
    console.log(`   URL completa: ${fullUrl}`)
    
    // Criar um objeto request que seja mais compatível com Express
    // Usar req do Vercel como base mas garantir todas as propriedades necessárias
    const expressReq = Object.create(req) as any
    
    // Definir propriedades essenciais
    Object.defineProperty(expressReq, 'url', {
      value: fullUrl,
      writable: true,
      enumerable: true,
      configurable: true
    })
    
    Object.defineProperty(expressReq, 'originalUrl', {
      value: fullUrl,
      writable: true,
      enumerable: true,
      configurable: true
    })
    
    Object.defineProperty(expressReq, 'path', {
      value: pathOnly,
      writable: true,
      enumerable: true,
      configurable: true
    })
    
    Object.defineProperty(expressReq, 'baseUrl', {
      value: '',
      writable: true,
      enumerable: true,
      configurable: true
    })
    
    // Garantir método
    if (!expressReq.method) {
      expressReq.method = req.method || 'GET'
    }
    
    // Garantir query
    if (!expressReq.query) {
      expressReq.query = req.query || {}
    }
    
    // Params será preenchido pelo Express router
    if (!expressReq.params) {
      expressReq.params = {}
    }
    
    // Métodos do Express Request
    expressReq.get = function(name: string) {
      return this.headers?.[name.toLowerCase()]
    }
    
    expressReq.header = function(name: string) {
      return this.get(name)
    }
    
    // Para multipart, remover body parseado
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      delete expressReq.body
      console.log('   Multipart detectado - body removido para Multer')
    }
    
    console.log('🔧 Express Request configurado:')
    console.log(`   url: ${expressReq.url}`)
    console.log(`   path: ${expressReq.path}`)
    console.log(`   method: ${expressReq.method}`)
    
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
        const result = originalEnd(...args)
        finish()
        return result
      }
      
      const originalJson = res.json.bind(res)
      res.json = function(body?: any) {
        const result = originalJson(body)
        finish()
        return result
      }
      
      const originalSend = res.send.bind(res)
      res.send = function(body?: any) {
        const result = originalSend(body)
        finish()
        return result
      }
      
      // Chamar Express app diretamente
      expressApp(expressReq, res, (err?: any) => {
        if (err) {
          console.error('❌ Erro no Express:', err.message)
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
          finish()
        } else {
          // Se não houve erro mas resposta não foi enviada, rota não encontrada
          if (!res.headersSent) {
            console.error('❌ Rota não encontrada pelo Express!')
            console.error(`   Método: ${req.method}`)
            console.error(`   Path: ${pathOnly}`)
            console.error(`   expressReq.url: ${expressReq.url}`)
            console.error(`   expressReq.path: ${expressReq.path}`)
            
            res.status(404).json({
              error: 'Rota não encontrada',
              path: pathOnly,
              method: req.method,
              debug: {
                reqUrl: req.url,
                expressReqPath: expressReq.path,
                expressReqUrl: expressReq.url
              }
            })
          }
          finish()
        }
      })
      
      // Timeout
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
