// Vercel Serverless Function - Catch-all route
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Importar o app Express
let app: any = null

async function handler(req: VercelRequest, res: VercelResponse) {
  // Lazy load para evitar problemas de inicialização
  if (!app) {
    try {
      // Tentar importar do build primeiro, depois do source
      try {
        const serverModule = await import('../server/dist/index.js')
        app = serverModule.default
      } catch {
        const serverModule = await import('../server/src/index')
        app = serverModule.default
      }
    } catch (error: any) {
      console.error('Erro ao importar servidor:', error)
      return res.status(500).json({ 
        error: 'Erro ao carregar servidor',
        message: error.message 
      })
    }
  }
  
  // Repassar requisição para Express
  return app(req as any, res as any)
}

export default handler

