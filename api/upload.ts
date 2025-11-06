// Rota especial para upload do Vercel Blob SDK do cliente
// Esta rota é usada automaticamente pelo @vercel/blob quando usado no frontend
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

    // O SDK do cliente envia o arquivo como FormData
    // No Vercel, req.body pode estar disponível como Buffer ou string
    const isMultipart = req.headers['content-type']?.includes('multipart/form-data')
    
    if (!isMultipart) {
      return res.status(400).json({ error: 'Content-Type deve ser multipart/form-data' })
    }

    // Processar multipart usando busboy
    const busboy = (await import('busboy')).default
    const { Readable } = await import('stream')
    
    return new Promise<void>((resolve) => {
      const bb = busboy({ headers: req.headers as any })
      let fileBuffer: Buffer | null = null
      let fileName = 'file'
      let fileMimeType = 'application/octet-stream'
      
      bb.on('file', (name, file, info) => {
        fileName = info.filename || 'file'
        fileMimeType = info.mimeType || 'application/octet-stream'
        const chunks: Buffer[] = []
        
        file.on('data', (chunk) => {
          chunks.push(chunk)
        })
        
        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks)
        })
      })
      
      bb.on('field', (name, value) => {
        // Campos do form (como filename, contentType, etc)
        if (name === 'filename') fileName = value
        if (name === 'contentType') fileMimeType = value
      })
      
      bb.on('finish', async () => {
        if (!fileBuffer) {
          return res.status(400).json({ error: 'Nenhum arquivo recebido' })
        }
        
        try {
          // Pegar filename do query ou usar o do form
          const blobFileName = req.query.filename as string || fileName
          
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
      
      // Criar stream do body
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
          message: 'O Vercel não está expondo o body raw. Verifique a configuração.'
        })
      }
      
      bodyStream.pipe(bb)
    })
  } catch (error: any) {
    console.error('Erro no handler:', error)
    res.status(500).json({ error: 'Erro interno do servidor', message: error.message })
  }
}

