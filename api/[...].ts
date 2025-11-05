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
    console.log(`📨 ${req.method} ${req.url || req.path}`)
    
    // Converter Vercel request/response para Express
    return expressApp(req as any, res as any)
  } catch (error: any) {
    console.error('❌ Erro no handler do Vercel:', error.message)
    console.error('Stack:', error.stack)
    console.error('Nome:', error.name)
    
    // Retornar erro mais informativo
    return res.status(500).json({
      error: 'Erro ao processar requisição',
      message: error.message,
      name: error.name,
      hint: 'Verifique os logs do servidor para mais detalhes'
    })
  }
}

