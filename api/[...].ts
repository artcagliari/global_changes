// Vercel Serverless Function - Catch-all route
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Importar o app Express diretamente
let app: any = null

async function getApp() {
  if (!app) {
    try {
      console.log('📦 Carregando servidor Express...')
      
      // Verificar se DATABASE_URL está configurado antes de importar
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
      console.error('Nome:', error.name)
      throw error
    }
  }
  return app
}

// Exportar como handler do Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = await getApp()
    
    // Construir a URL correta
    // No Vercel com api/[...].ts, a URL pode vir como /login ou /api/login
    // Precisamos garantir que o Express receba /api/login
    let url = req.url || ''
    
    // Se a URL não começar com /api, adicionar
    if (!url.startsWith('/api')) {
      url = `/api${url}`
    }
    
    console.log(`📨 ${req.method} ${url} (original: ${req.url})`)
    
    // Criar um objeto de request compatível com Express
    const expressReq = {
      ...req,
      url: url,
      originalUrl: url,
      path: url.split('?')[0],
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
    } as any
    
    // Converter Vercel request/response para Express usando uma Promise
    return new Promise<void>((resolve) => {
      // Adicionar handler de erro para capturar erros não tratados
      const originalEnd = res.end.bind(res)
      res.end = function(chunk?: any, encoding?: any, cb?: any) {
        originalEnd(chunk, encoding, cb)
        resolve()
      }
      
      expressApp(expressReq, res, (err: any) => {
        if (err) {
          console.error('❌ Erro no Express middleware:', err)
          if (!res.headersSent) {
            res.status(500).json({
              error: 'Erro interno do servidor',
              message: err.message
            })
          }
        }
        resolve()
      })
    })
  } catch (error: any) {
    console.error('❌ Erro no handler do Vercel:', error.message)
    console.error('Stack:', error.stack)
    console.error('Nome:', error.name)
    
    // Retornar erro mais informativo
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Erro ao processar requisição',
        message: error.message,
        name: error.name,
        hint: 'Verifique os logs do servidor para mais detalhes'
      })
    }
  }
}

