// Rota para handleUpload do Vercel Blob
// Usa handleUpload que não depende do body raw
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleUpload } from '@vercel/blob/client'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verificar se tem o token do Blob
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      return res.status(500).json({ 
        error: 'BLOB_READ_WRITE_TOKEN não configurado',
        message: 'Configure BLOB_READ_WRITE_TOKEN nas variáveis de ambiente do Vercel'
      })
    }

    // Criar um objeto Request do Fetch API a partir do VercelRequest
    // O handleUpload precisa do request para acessar a URL
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers.host || req.headers['x-forwarded-host'] || 'localhost'
    const url = `${protocol}://${host}${req.url || '/api/upload'}`
    
    const request = new Request(url, {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: req.body ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : undefined,
    })

    // handleUpload recebe request e token
    const jsonResponse = await handleUpload({
      request,
      body: req.body ? (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) : {},
      token,
      onBeforeGenerateToken: async (pathname) => {
        // Validar se é um vídeo
        if (!pathname.startsWith('videos/')) {
          throw new Error('Apenas uploads na pasta videos/ são permitidos')
        }
        
        return {
          allowedContentTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mov'],
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('✅ Upload concluído:', blob.url)
      },
    })

    res.json(jsonResponse)
  } catch (error: any) {
    console.error('Erro no handler:', error)
    res.status(400).json({ 
      error: 'Erro ao processar upload',
      message: error.message 
    })
  }
}

