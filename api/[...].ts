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
  console.log(`   Método (uppercase): ${req.method?.toUpperCase()}`)
  console.log(`   URL: ${req.url}`)
  console.log(`   Query:`, JSON.stringify(req.query))
  console.log(`   Content-Type:`, req.headers['content-type'])
  console.log(`   Body presente:`, !!req.body)
  console.log(`   Body tipo:`, typeof req.body)
  
  try {
    const expressApp = await getApp()
    console.log('✅ Express app obtido')
    
    // Extrair path do URL
    // No Vercel com [...], o path pode vir de várias formas:
    // 1. req.url diretamente (mais comum)
    // 2. req.query como objeto {0: 'api', 1: 'users', 2: 'id123'}
    
    let path = req.url || ''
    
    console.log('🔍 DEBUG Vercel Request:')
    console.log(`   req.url original: ${req.url}`)
    console.log(`   req.method: ${req.method}`)
    console.log(`   req.query keys:`, Object.keys(req.query || {}))
    
    // Se req.url não tiver path útil, tentar construir do query (quando usa [...])
    if (!path || path === '/' || (!path.startsWith('/api') && !path.startsWith('/'))) {
      if (req.query && Object.keys(req.query).length > 0) {
        // Verificar se é um catch-all route (query com índices numéricos)
        const segments: string[] = []
        let i = 0
        while (req.query[String(i)]) {
          segments.push(String(req.query[String(i)]))
          i++
        }
        if (segments.length > 0) {
          path = '/' + segments.join('/')
          console.log(`   Path construído do query: ${path}`)
        } else {
          // Se não for catch-all, pode ser query string normal
          // Manter o path original
          path = req.url || '/'
        }
      }
    }
    
    // Garantir que comece com /api
    // IMPORTANTE: No Vercel, o handler já recebe /api no path
    // Mas vamos garantir que sempre tenha /api
    if (!path.startsWith('/api')) {
      if (path.startsWith('/')) {
        path = '/api' + path
      } else {
        path = '/api/' + path
      }
    }
    
    // Separar path e query string
    const [pathOnly] = path.split('?')
    // Manter query string se existir
    const queryString = path.includes('?') ? '?' + path.split('?')[1] : ''
    const fullUrl = pathOnly + queryString
    
    console.log(`📨 ${req.method} ${pathOnly}`)
    console.log(`   URL completa: ${fullUrl}`)
    
    // Criar um objeto request compatível com Express
    // IMPORTANTE: O Express precisa de um objeto que seja tratado como IncomingMessage
    // Para rotas dinâmicas e multipart, precisamos garantir todas as propriedades
    
    const expressReq = Object.assign(Object.create(Object.getPrototypeOf(req)), req, {
      // Garantir método HTTP correto (CRÍTICO para POST funcionar)
      method: (req.method || 'GET').toUpperCase(),
      // URLs e paths - ESSENCIAIS para o Express router fazer match
      url: fullUrl,
      originalUrl: fullUrl,
      path: pathOnly,
      baseUrl: '',
      // Query e params (params será preenchido pelo Express router para rotas dinâmicas)
      query: req.query || {},
      params: {},
      // Headers preservados
      headers: req.headers || {},
      // Body será parseado pelo Express ou Multer
      // Para multipart, não devemos ter body parseado
      body: req.headers['content-type']?.includes('multipart/form-data') ? undefined : (req.body || {}),
      // Métodos do Express Request
      get: function(name: string) {
        return this.headers?.[name.toLowerCase()]
      },
      header: function(name: string) {
        return this.get(name)
      },
      // Propriedades adicionais do Express
      protocol: 'https',
      secure: true,
      hostname: req.headers?.host?.split(':')[0] || '',
      ip: req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || req.headers?.['x-real-ip'] || '',
      // Stream properties (importante para Multer processar multipart)
      readable: true,
      readableEnded: false,
      // Preservar outras propriedades
      cookies: req.cookies || {},
      // Para compatibilidade com IncomingMessage
      socket: null,
      httpVersion: '1.1',
      httpVersionMajor: 1,
      httpVersionMinor: 1,
      rawHeaders: req.headers ? Object.entries(req.headers).flat() : [],
      rawTrailers: []
    }) as any
    
    // Para multipart, garantir que body não esteja parseado e que o request seja tratado como stream
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      delete expressReq.body
      // Garantir que o request seja tratado como stream para Multer
      expressReq.readable = true
      expressReq.readableEnded = false
      console.log('   Multipart detectado - body removido para Multer')
      console.log('   Content-Type:', req.headers['content-type'])
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
      
      // Log final antes de passar para Express
      console.log('🚀 Passando para Express:')
      console.log(`   method: ${expressReq.method}`)
      console.log(`   path: ${expressReq.path}`)
      console.log(`   url: ${expressReq.url}`)
      console.log(`   originalUrl: ${expressReq.originalUrl}`)
      
      // Chamar Express app diretamente
      // O Express processará o request e chamará a rota correspondente
      expressApp(expressReq, res, (err?: any) => {
        if (err) {
          console.error('❌ Erro no Express:', err.message)
          console.error('   Stack:', err.stack)
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
            console.error(`   Método recebido: ${req.method}`)
            console.error(`   Método no expressReq: ${expressReq.method}`)
            console.error(`   Path recebido: ${pathOnly}`)
            console.error(`   Path no expressReq: ${expressReq.path}`)
            console.error(`   URL no expressReq: ${expressReq.url}`)
            console.error(`   originalUrl no expressReq: ${expressReq.originalUrl}`)
            console.error(`   Params:`, expressReq.params)
            console.error(`   Query:`, expressReq.query)
            
            // Tentar listar rotas registradas (para debug)
            try {
              const routes = (expressApp as any)._router?.stack || []
              console.error('📋 Rotas registradas no Express:')
              routes.forEach((layer: any, idx: number) => {
                if (layer.route) {
                  console.error(`   ${layer.route.methods} ${layer.route.path}`)
                } else if (layer.name === 'router') {
                  console.error(`   Router montado em: ${layer.regexp}`)
                }
              })
            } catch (routesError) {
              console.error('   Não foi possível listar rotas:', routesError)
            }
            
            res.status(404).json({
              error: 'Rota não encontrada',
              path: pathOnly,
              method: req.method,
              debug: {
                reqUrl: req.url,
                expressReqPath: expressReq.path,
                expressReqUrl: expressReq.url,
                expressReqMethod: expressReq.method
              }
            })
          } else {
            console.log('✅ Resposta enviada pelo Express')
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
