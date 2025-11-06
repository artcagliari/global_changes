// API route para upload direto para Vercel Blob
// Processa multipart usando busboy
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { put } from '@vercel/blob'
import { Readable } from 'stream'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verificar se tem o token do Blob
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ 
        error: 'BLOB_READ_WRITE_TOKEN não configurado',
        message: 'Configure BLOB_READ_WRITE_TOKEN nas variáveis de ambiente do Vercel. Token: vercel_blob_rw_h8TXpLMkzLdnNvRf_5GhRho9t2o44e4tZkAWWuZb3njUi9c'
      })
    }

    const isMultipart = req.headers['content-type']?.includes('multipart/form-data')
    
    if (!isMultipart) {
      return res.status(400).json({ error: 'Content-Type deve ser multipart/form-data' })
    }

    // Processar multipart usando busboy
    const busboy = (await import('busboy')).default
    const bb = busboy({ headers: req.headers as any })
    
    let fileBuffer: Buffer | null = null
    let fileName = 'video.mp4'
    let fileMimeType = 'video/mp4'
    
    return new Promise<void>((resolve) => {
      bb.on('file', (name, file, info) => {
        fileName = info.filename || 'video.mp4'
        fileMimeType = info.mimeType || 'video/mp4'
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
      
      // Criar stream do body - tentar várias formas
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
      
      // Tentar acessar rawBody se disponível
      if (!bodyStream && (req as any).rawBody) {
        bodyStream = Readable.from((req as any).rawBody)
      }
      
      if (!bodyStream) {
        console.error('Body não disponível. req.body type:', typeof req.body, 'isBuffer:', Buffer.isBuffer(req.body))
        return res.status(400).json({ 
          error: 'Body não disponível',
          message: 'O Vercel não está expondo o body raw para multipart. Verifique se BLOB_READ_WRITE_TOKEN está configurado e faça redeploy.'
        })
      }
      
      bodyStream.pipe(bb)
    })
  } catch (error: any) {
    console.error('Erro no handler:', error)
    res.status(500).json({ error: 'Erro interno do servidor', message: error.message })
  }
}

