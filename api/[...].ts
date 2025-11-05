// Vercel Serverless Function - Catch-all route
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Importar o app Express diretamente
import app from '../server/src/index.js'

// Exportar como handler do Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Converter Vercel request/response para Express
  return app(req as any, res as any)
}

