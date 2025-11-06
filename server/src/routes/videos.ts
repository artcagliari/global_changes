import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { prisma } from '../lib/prisma.js'
import { put, del, head } from '@vercel/blob'

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

    if (isVercel) {
      // No Vercel, salvar no Blob Storage
      try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(req.file.originalname || '.mp4')
        const fileName = `videos/video-${uniqueSuffix}${ext}`
        
        const blob = await put(fileName, req.file.buffer, {
          access: 'public',
          contentType: req.file.mimetype || 'video/mp4',
        })
        
        blobUrl = blob.url
        videoUrl = blob.url // Usar a URL do Blob como identificador
        console.log('✅ Vídeo salvo no Vercel Blob:', blobUrl)
      } catch (blobError: any) {
        console.error('Erro ao salvar no Blob Storage:', blobError.message)
        // Fallback: usar nome do arquivo mesmo sem salvar
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(req.file.originalname || '.mp4')
        videoUrl = `video-${uniqueSuffix}${ext}`
        console.warn('⚠️  Usando fallback (vídeo não será acessível)')
      }
    } else {
      // Em desenvolvimento, salvar no disco
      videoUrl = req.file.filename
    }

    // Criar submissão
    const submission = await prisma.submission.create({
      data: {
        userId: userId,
        videoUrl: videoUrl, // URL completa do Blob ou nome do arquivo
        status: 'pending'
      }
    })

    res.status(200).json({ 
      message: 'Vídeo enviado com sucesso!', 
      fileName: videoUrl,
      submissionId: submission.id,
      videoUrl: blobUrl || videoUrl
    })
  } catch (error: any) {
    console.error('Erro no upload:', error.message)
    res.status(500).json({ 
      message: 'Erro ao processar upload',
      error: error.message 
    })
  }
})

// Rota para servir vídeos (proxy para Blob Storage)
router.get('/watch/:videoUrl(*)', async (req, res) => {
  try {
    const videoUrl = decodeURIComponent(req.params.videoUrl)
    
    // Se for uma URL do Blob Storage, fazer proxy
    if (videoUrl.startsWith('http')) {
      const response = await fetch(videoUrl)
      if (!response.ok) {
        return res.status(404).json({ error: 'Vídeo não encontrado' })
      }
      
      const contentType = response.headers.get('content-type') || 'video/mp4'
      res.setHeader('Content-Type', contentType)
      res.setHeader('Cache-Control', 'public, max-age=3600')
      
      const buffer = await response.arrayBuffer()
      res.send(Buffer.from(buffer))
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