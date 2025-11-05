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
    
    // No Vercel com api/[...].ts, o path vem em req.query como um objeto
    // Exemplo: /api/users/123 -> req.query = { '0': 'users', '1': '123' }
    // Ou pode vir em req.url diretamente
    let url = req.url || ''
    
    // Se não tiver URL, construir a partir do query
    // No Vercel, quando usa [...], os segmentos vêm como req.query['0'], req.query['1'], etc.
    if (!url && req.query) {
      const queryKeys = Object.keys(req.query).sort()
      const pathSegments: string[] = []
      
      // Coletar todos os segmentos numéricos
      for (let i = 0; i < queryKeys.length; i++) {
        const key = String(i)
        if (req.query[key]) {
          pathSegments.push(String(req.query[key]))
        }
      }
      
      if (pathSegments.length > 0) {
        url = '/' + pathSegments.join('/')
      }
    }
    
    // Garantir que comece com /
    if (!url.startsWith('/')) {
      url = '/' + url
    }
    
    // Garantir que comece com /api
    const path = url.split('?')[0]
    const finalPath = path.startsWith('/api') ? path : `/api${path}`
    const queryString = url.includes('?') ? '?' + url.split('?')[1] : ''
    const finalUrl = finalPath + queryString
    
    console.log(`📨 ${req.method} ${finalPath}`)
    console.log(`   URL original do Vercel: ${req.url}`)
    console.log(`   URL construída: ${url}`)
    console.log(`   URL final para Express: ${finalUrl}`)
    console.log(`   Query params:`, req.query)
    
    // Criar objeto request compatível com Express
    // Usar o req do Vercel mas adicionar propriedades necessárias
    const expressReq = Object.create(req) as any
    
    // Sobrescrever propriedades essenciais
    Object.assign(expressReq, {
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
        return this.get(name)
      },
      // Propriedades adicionais
      protocol: 'https',
      secure: true,
      hostname: req.headers?.['host'] || 'localhost',
      ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'] || '0.0.0.0',
    })
    
    // Processar no Express usando callback
    return new Promise<void>((resolve) => {
      let finished = false
      
      const finish = () => {
        if (!finished) {
          finished = true
          resolve()
        }
      }
      
      // Interceptar métodos de resposta para saber quando terminar
      const originalEnd = res.end.bind(res)
      res.end = function(chunk?: any, encoding?: any, cb?: any) {
        const result = originalEnd(chunk, encoding, cb)
        setTimeout(finish, 50) // Dar tempo para o Express processar
        return result
      }
      
      const originalJson = res.json.bind(res)
      res.json = function(body?: any) {
        const result = originalJson(body)
        setTimeout(finish, 50)
        return result
      }
      
      const originalSend = res.send.bind(res)
      res.send = function(body?: any) {
        const result = originalSend(body)
        setTimeout(finish, 50)
        return result
      }
      
      // Processar com Express - o callback é chamado quando termina
      expressApp(expressReq, res, (err?: any) => {
        if (err) {
          console.error('❌ Erro no Express middleware:', err)
          console.error('Stack:', err?.stack)
          if (!res.headersSent) {
            try {
              res.status(500).json({
                error: 'Erro interno do servidor',
                message: err?.message || 'Erro desconhecido'
              })
            } catch (sendError) {
              console.error('Erro ao enviar resposta de erro:', sendError)
            }
          }
        } else {
          // Se não houve erro mas a resposta não foi enviada, o Express não encontrou a rota
          if (!res.headersSent) {
            console.error('❌ Rota não encontrada pelo Express!')
            console.error(`   Método: ${req.method}`)
            console.error(`   Path: ${finalPath}`)
            console.error(`   URL: ${finalUrl}`)
            console.error(`   Original URL: ${req.url}`)
            
            setTimeout(() => {
              if (!res.headersSent) {
                res.status(404).json({
                  error: 'Rota não encontrada',
                  path: finalPath,
                  method: req.method,
                  originalUrl: req.url,
                  hint: 'Verifique se a rota está registrada no Express'
                })
              }
              finish()
            }, 200)
          } else {
            finish()
          }
        }
      })
      
      // Timeout de segurança
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

