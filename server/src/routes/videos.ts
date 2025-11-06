import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { prisma } from '../lib/prisma.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_URL

let upload: ReturnType<typeof multer>

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
    destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      cb(null, uploadsDir)
    },
    filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    },
  })

  upload = multer({ storage: storage })
}

router.post('/upload', upload.single('video'), async (req: Request, res: Response) => {
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

    if (isVercel && req.file.buffer) {
      // Em Vercel, fazer upload para o Blob Storage
      try {
        // Import dinâmico do Blob apenas quando necessário
        const { put } = await import('@vercel/blob')
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(req.file.originalname || '.mp4')
        const fileName = `videos/video-${uniqueSuffix}${ext}`
        
        const blob = await put(fileName, req.file.buffer, {
          access: 'public',
          contentType: req.file.mimetype || 'video/mp4',
        })
        
        videoUrl = blob.url
      } catch (blobError: any) {
        console.error('Erro ao fazer upload para Blob:', blobError)
        throw new Error(`Erro ao fazer upload para armazenamento: ${blobError.message}`)
      }
    } else {
      // Em desenvolvimento, usar nome do arquivo salvo localmente
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
      submissionId: submission.id,
      videoUrl: videoUrl
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
// Usar rota simples - Express 5 não suporta sintaxe complexa
router.get('/watch/:videoUrl', async (req: Request, res: Response) => {
  try {
    // Pegar o videoUrl do parâmetro
    const videoUrl = req.params.videoUrl ? decodeURIComponent(req.params.videoUrl) : ''
    
    // Se a URL já é uma URL completa (do Blob), redirecionar diretamente
    if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
      return res.redirect(videoUrl)
    }
    
    // Em desenvolvimento, servir do disco
    if (!isVercel) {
      const videoPath = path.join(__dirname, '..', '..', 'uploads', 'videos', videoUrl)
      if (fs.existsSync(videoPath)) {
        res.sendFile(videoPath)
      } else {
        res.status(404).json({ error: 'Vídeo não encontrado' })
      }
    } else {
      // Em produção, se não for uma URL completa, tentar buscar no banco
      // e redirecionar para a URL do Blob
      const submission = await prisma.submission.findFirst({
        where: {
          videoUrl: {
            contains: videoUrl
          }
        }
      })
      
      if (submission && submission.videoUrl && (submission.videoUrl.startsWith('http://') || submission.videoUrl.startsWith('https://'))) {
        return res.redirect(submission.videoUrl)
      }
      
      res.status(404).json({ error: 'Vídeo não encontrado' })
    }
  } catch (error: any) {
    console.error('Erro ao servir vídeo:', error.message)
    res.status(500).json({ error: 'Erro ao servir vídeo' })
  }
})

export default router