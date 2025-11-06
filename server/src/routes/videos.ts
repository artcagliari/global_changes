import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { prisma } from '../lib/prisma.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_URL

let upload: multer.Multer

if (isVercel) {
  upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
  })
} else {
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'videos')
  
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
  } catch (error: any) {
    console.warn('Não foi possível criar diretório de uploads:', error.message)
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir)
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    },
  })

  upload = multer({ storage: storage })
}

// Função auxiliar para salvar no Blob (opcional, não quebra se não estiver configurado)
async function saveToBlob(fileName: string, buffer: Buffer, contentType: string): Promise<string | null> {
  if (!isVercel) {
    return null
  }
  
  // Verificar se o token está configurado
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn('⚠️  BLOB_READ_WRITE_TOKEN não configurado')
    return null
  }
  
  try {
    const { put } = await import('@vercel/blob')
    const blob = await put(fileName, buffer, {
      access: 'public',
      contentType: contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN
    })
    console.log('✅ Vídeo salvo no Blob Storage:', blob.url)
    return blob.url
  } catch (error: any) {
    console.error('❌ Erro ao salvar no Blob Storage:', error.message)
    return null
  }
}

router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo de vídeo enviado.' })
    }

    const { userId } = req.body
    if (!userId) {
      return res.status(400).json({ message: 'ID do usuário é obrigatório.' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' })
    }

    // Gerar URL do vídeo
    let videoUrl: string
    let blobUrl: string | null = null

    if (isVercel && req.file.buffer) {
      // Tentar salvar no Blob Storage (opcional)
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const ext = path.extname(req.file.originalname || '.mp4')
      const fileName = `videos/video-${uniqueSuffix}${ext}`
      
      blobUrl = await saveToBlob(fileName, req.file.buffer, req.file.mimetype || 'video/mp4')
      
      if (blobUrl) {
        videoUrl = blobUrl
        console.log('✅ Vídeo salvo no Blob Storage')
      } else {
        // Fallback: apenas nome do arquivo
        videoUrl = `video-${uniqueSuffix}${ext}`
        console.log('⚠️  Blob Storage não configurado, usando nome apenas')
      }
    } else {
      // Em desenvolvimento, usar nome do arquivo
      videoUrl = req.file.filename
    }

    // Criar submissão
    const submission = await prisma.submission.create({
      data: {
        userId: userId,
        videoUrl: videoUrl,
        status: 'pending'
      }
    })

    res.status(200).json({ 
      message: 'Vídeo enviado com sucesso!', 
      fileName: videoUrl,
      submissionId: submission.id
    })
  } catch (error: any) {
    console.error('Erro no upload:', error.message)
    res.status(500).json({ 
      message: 'Erro ao processar upload',
      error: error.message 
    })
  }
})

// Rota para servir vídeos
router.get('/watch/:videoUrl(*)', async (req, res) => {
  try {
    const videoUrl = decodeURIComponent(req.params.videoUrl)
    
    // Se for uma URL do Blob Storage, fazer proxy
    if (videoUrl.startsWith('http')) {
      try {
        const response = await fetch(videoUrl)
        if (!response.ok) {
          return res.status(404).json({ error: 'Vídeo não encontrado' })
        }
        
        const contentType = response.headers.get('content-type') || 'video/mp4'
        res.setHeader('Content-Type', contentType)
        res.setHeader('Cache-Control', 'public, max-age=3600')
        
        const buffer = await response.arrayBuffer()
        res.send(Buffer.from(buffer))
      } catch (fetchError: any) {
        console.error('Erro ao buscar vídeo do Blob:', fetchError.message)
        res.status(404).json({ error: 'Vídeo não encontrado' })
      }
    } else {
      // Em desenvolvimento, servir do disco
      const videoPath = path.join(__dirname, '..', '..', 'uploads', 'videos', videoUrl)
      if (fs.existsSync(videoPath)) {
        res.sendFile(videoPath)
      } else {
        res.status(404).json({ error: 'Vídeo não encontrado' })
      }
    }
  } catch (error: any) {
    console.error('Erro ao servir vídeo:', error.message)
    res.status(500).json({ error: 'Erro ao servir vídeo' })
  }
})

export default router