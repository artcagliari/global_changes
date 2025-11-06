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

    // handleUpload recebe body e token, e lida com o multipart internamente
    // O body pode ser JSON (com dados do upload) ou undefined
    const body = req.body ? (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) : {}
    
    const jsonResponse = await handleUpload({
      body,
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

