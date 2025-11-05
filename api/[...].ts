// Vercel Serverless Function - Catch-all route para Express
import type { VercelRequest, VercelResponse } from '@vercel/node'

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
      // Tentar diferentes caminhos dependendo do ambiente
      let serverModule: any = null
      let importError: any = null
      
      // Tentar primeiro o caminho direto (TypeScript/compilado)
      try {
        serverModule = await import('../server/src/index.js')
        console.log('✅ Importado de ../server/src/index.js')
      } catch (error: any) {
        importError = error
        console.log('⚠️  Não conseguiu importar de ../server/src/index.js')
        // Tentar caminho compilado
        try {
          serverModule = await import('../server/dist/index.js')
          console.log('✅ Importado de ../server/dist/index.js')
        } catch (error2: any) {
          console.error('❌ Não conseguiu importar de nenhum caminho')
          throw importError
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
    console.log('✅ Express app obtido com sucesso')
    
    // No Vercel com api/[...].ts, o path pode vir de diferentes formas:
    // - req.url pode ser '/api/videos/upload' (se o rewrite mantém /api)
    // - req.url pode ser '/videos/upload' (se o rewrite remove /api)
    // - req.query pode ter os segmentos quando usa [...]
    
    let path = req.url || ''
    
    console.log('🔍 DEBUG Vercel Request:')
    console.log(`   req.url original: ${req.url}`)
    console.log(`   req.method: ${req.method}`)
    console.log(`   req.query:`, JSON.stringify(req.query))
    console.log(`   Content-Type: ${req.headers['content-type']}`)
    
    // Se não tiver URL ou for apenas '/', construir a partir do query
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
    
    // Se o path não começar com /api, adicionar
    // Mas verificar primeiro se já tem /api para não duplicar
    if (!path.startsWith('/api')) {
      path = '/api' + (path.startsWith('/') ? path : '/' + path)
      console.log(`   Path ajustado para incluir /api: ${path}`)
    }
    
    // Separar path e query string
    const [pathOnly] = path.split('?')
    const fullUrl = path
    
    console.log(`📨 ${req.method} ${pathOnly}`)
    console.log(`   URL completa: ${fullUrl}`)
    
    // Usar req do Vercel diretamente, ajustando apenas as propriedades essenciais
    const expressReq = req as any
    
    // IMPORTANTE: O Express router faz match usando req.url e req.originalUrl
    // Para rotas com parâmetros (:id), precisamos garantir que o path esteja correto
    // O Express calcula req.path internamente, mas podemos ajudar definindo explicitamente
    expressReq.url = fullUrl
    expressReq.originalUrl = fullUrl
    // Definir path explicitamente para garantir match correto
    expressReq.path = pathOnly
    expressReq.baseUrl = ''
    
    console.log('🔧 Express Request configurado:')
    console.log(`   url: ${expressReq.url}`)
    console.log(`   originalUrl: ${expressReq.originalUrl}`)
    console.log(`   path: ${expressReq.path}`)
    console.log(`   method: ${expressReq.method}`)
    
    // Garantir propriedades essenciais
    if (!expressReq.method) {
      expressReq.method = req.method || 'GET'
    }
    if (!expressReq.query) {
      expressReq.query = {}
    }
    // Não inicializar params - o Express vai preencher automaticamente das rotas
    // expressReq.params será preenchido pelo Express router quando encontrar a rota
    if (!expressReq.params) {
      expressReq.params = {}
    }
    
    // Métodos do Express Request
    if (typeof expressReq.get !== 'function') {
      expressReq.get = function(name: string) {
        return this.headers?.[name.toLowerCase()]
      }
    }
    
    if (typeof expressReq.header !== 'function') {
      expressReq.header = function(name: string) {
        return this.get(name)
      }
    }
    
    // Para multipart/form-data, não passar body parseado
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      delete expressReq.body
      console.log('   Multipart detectado - body removido para Multer processar')
    }
    
    // Processar no Express usando handle
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
      
      // Usar o app Express diretamente (como função) ou handle
      // Tentar ambas as formas para garantir compatibilidade
      const expressHandler = expressApp.handle || expressApp
      
      expressHandler.call(expressApp, expressReq, res, (err?: any) => {
        if (err) {
          console.error('❌ Erro no Express:', err.message)
          console.error('Stack:', err.stack)
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
            console.error(`   Path esperado: ${pathOnly}`)
            console.error(`   expressReq.path: ${expressReq.path}`)
            console.error(`   expressReq.url: ${expressReq.url}`)
            console.error(`   expressReq.originalUrl: ${expressReq.originalUrl}`)
            console.error(`   req.url original: ${req.url}`)
            
            // Verificar se é uma rota que deveria existir
            const knownRoutes = [
              '/api/login',
              '/api/users',
              '/api/users/:id',
              '/api/videos/upload',
              '/api/rewards',
              '/api/submissions'
            ]
            const isKnownRoute = knownRoutes.some(route => {
              const routePattern = route.replace(':id', '[^/]+')
              const regex = new RegExp(`^${routePattern}$`)
              return regex.test(pathOnly)
            })
            
            if (isKnownRoute) {
              console.error('⚠️  Esta rota DEVERIA existir! Problema no roteamento do Express.')
            }
            
            res.status(404).json({
              error: 'Rota não encontrada',
              path: pathOnly,
              method: req.method,
              debug: {
                reqUrl: req.url,
                expressReqPath: expressReq.path,
                expressReqUrl: expressReq.url,
                expressReqOriginalUrl: expressReq.originalUrl,
                isKnownRoute: isKnownRoute
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
