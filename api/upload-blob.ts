// API route para upload direto para Vercel Blob
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { put } from '@vercel/blob'
import { Readable } from 'stream'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const isMultipart = req.headers['content-type']?.includes('multipart/form-data')
    
    if (!isMultipart) {
      return res.status(400).json({ error: 'Content-Type deve ser multipart/form-data' })
    }

    // Processar multipart usando busboy
    const busboy = (await import('busboy')).default
    const bb = busboy({ headers: req.headers as any })
    
    let fileBuffer: Buffer | null = null
    let fileName: string = ''
    let fileMimeType: string = 'video/mp4'
    
    return new Promise<void>((resolve) => {
      bb.on('file', (name, file, info) => {
        const { filename, mimeType } = info
        fileName = filename || 'video.mp4'
        fileMimeType = mimeType || 'video/mp4'
        
        const chunks: Buffer[] = []
        
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
          // Fazer upload para Vercel Blob
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
      
      // No Vercel, o body pode não estar disponível diretamente
      // Precisamos acessar de forma diferente
      let bodyStream: Readable | null = null
      
      // Tentar várias formas de acessar o body
      if (req.body) {
        if (Buffer.isBuffer(req.body)) {
          bodyStream = Readable.from(req.body)
        } else if (typeof req.body === 'string') {
          bodyStream = Readable.from(Buffer.from(req.body))
        } else if (req.body instanceof Uint8Array) {
          bodyStream = Readable.from(Buffer.from(req.body))
        }
      }
      
      // Tentar acessar rawBody se disponível
      if (!bodyStream && (req as any).rawBody) {
        bodyStream = Readable.from((req as any).rawBody)
      }
      
      if (!bodyStream) {
        console.error('Body não disponível. req.body type:', typeof req.body)
        return res.status(400).json({ 
          error: 'Body não disponível',
          message: 'O Vercel pode não expor o body raw para multipart. Tente usar uma abordagem diferente.'
        })
      }
      
      bodyStream.pipe(bb)
    })
  } catch (error: any) {
    console.error('Erro no handler:', error)
    res.status(500).json({ error: 'Erro interno do servidor', message: error.message })
  }
}

