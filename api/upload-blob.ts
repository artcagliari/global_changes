// API route para upload direto para Vercel Blob
// Usa a API do Vercel Blob que aceita FormData diretamente
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { put } from '@vercel/blob'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verificar se tem o token do Blob
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ 
        error: 'BLOB_READ_WRITE_TOKEN não configurado',
        message: 'Configure BLOB_READ_WRITE_TOKEN nas variáveis de ambiente do Vercel'
      })
    }

    const isMultipart = req.headers['content-type']?.includes('multipart/form-data')
    
    if (!isMultipart) {
      return res.status(400).json({ error: 'Content-Type deve ser multipart/form-data' })
    }

    // No Vercel, para multipart, precisamos usar uma abordagem diferente
    // Vamos usar a API do Vercel Blob que aceita uploads via URL
    // Ou processar o multipart de forma que funcione
    
    // Tentar acessar o arquivo do body processado
    // O Vercel pode ter processado o multipart e colocado em req.body
    let fileBuffer: Buffer | null = null
    let fileName = 'video.mp4'
    let fileMimeType = 'video/mp4'
    
    // Se req.body é um objeto com o arquivo
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      // Pode estar em req.body.file ou similar
      const bodyAny = req.body as any
      if (bodyAny.file) {
        fileBuffer = Buffer.isBuffer(bodyAny.file) ? bodyAny.file : Buffer.from(bodyAny.file)
        fileName = bodyAny.filename || fileName
        fileMimeType = bodyAny.mimetype || fileMimeType
      }
    }
    
    // Se não encontrou, tentar processar com busboy
    if (!fileBuffer) {
      const busboy = (await import('busboy')).default
      const { Readable } = await import('stream')
      
      return new Promise<void>((resolve) => {
        const bb = busboy({ headers: req.headers as any })
        let chunks: Buffer[] = []
        
        bb.on('file', (name, file, info) => {
          fileName = info.filename || 'video.mp4'
          fileMimeType = info.mimeType || 'video/mp4'
          chunks = []
          
          file.on('data', (chunk) => {
            chunks.push(chunk)
          })
          
          file.on('end', () => {
            fileBuffer = Buffer.concat(chunks)
          })
        })
        
        bb.on('finish', async () => {
          if (!fileBuffer) {
            return res.status(400).json({ error: 'Nenhum arquivo recebido' })
          }
          
          try {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            const ext = fileName.includes('.') ? fileName.split('.').pop() : 'mp4'
            const blobFileName = `videos/video-${uniqueSuffix}.${ext}`
            
            const blob = await put(blobFileName, fileBuffer, {
              access: 'public',
              contentType: fileMimeType,
            })
            
            res.json({ url: blob.url })
            resolve()
          } catch (error: any) {
            console.error('Erro ao fazer upload para Blob:', error)
            res.status(500).json({ 
              error: 'Erro ao fazer upload para Blob Storage',
              message: error.message 
            })
            resolve()
          }
        })
        
        bb.on('error', (err) => {
          console.error('Erro ao processar multipart:', err)
          res.status(400).json({ error: 'Erro ao processar upload', message: err.message })
          resolve()
        })
        
        // Tentar criar stream do body
        let bodyStream: Readable | null = null
        
        if (req.body) {
          if (Buffer.isBuffer(req.body)) {
            bodyStream = Readable.from(req.body)
          } else if (typeof req.body === 'string') {
            bodyStream = Readable.from(Buffer.from(req.body))
          } else if (req.body instanceof Uint8Array) {
            bodyStream = Readable.from(Buffer.from(req.body))
          }
        }
        
        if (!bodyStream) {
          return res.status(400).json({ 
            error: 'Body não disponível',
            message: 'Configure BLOB_READ_WRITE_TOKEN no Vercel e verifique se o body está sendo enviado corretamente.'
          })
        }
        
        bodyStream.pipe(bb)
      })
    } else {
      // Já tem o arquivo processado
      try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = fileName.includes('.') ? fileName.split('.').pop() : 'mp4'
        const blobFileName = `videos/video-${uniqueSuffix}.${ext}`
        
        const blob = await put(blobFileName, fileBuffer, {
          access: 'public',
          contentType: fileMimeType,
        })
        
        res.json({ url: blob.url })
      } catch (error: any) {
        console.error('Erro ao fazer upload para Blob:', error)
        res.status(500).json({ 
          error: 'Erro ao fazer upload para Blob Storage',
          message: error.message 
        })
      }
    }
  } catch (error: any) {
    console.error('Erro no handler:', error)
    res.status(500).json({ error: 'Erro interno do servidor', message: error.message })
  }
}

