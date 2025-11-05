// Vercel Serverless Function - Catch-all route
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Importar o app Express diretamente
let app: any = null

async function getApp() {
  if (!app) {
    try {
      console.log('📦 Carregando servidor Express...')
      const serverModule = await import('../server/src/index.js')
      app = serverModule.default
      console.log('✅ Servidor Express carregado')
    } catch (error: any) {
      console.error('❌ Erro ao carregar servidor:', error.message)
      console.error(error.stack)
      throw error
    }
  }
  return app
}

// Exportar como handler do Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = await getApp()
    console.log(`📨 ${req.method} ${req.url}`)
    // Converter Vercel request/response para Express
    return expressApp(req as any, res as any)
  } catch (error: any) {
    console.error('❌ Erro no handler:', error.message)
    return res.status(500).json({
      error: 'Erro ao processar requisição',
      message: error.message
    })
  }
}

