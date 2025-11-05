import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { prisma } from '../lib/prisma.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

// Verificar se estamos no Vercel (sistema de arquivos read-only)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_URL

let upload: multer.Multer
let uploadsDir: string

if (isVercel) {
  // No Vercel, usar storage em memória (não podemos escrever no sistema de arquivos)
  console.log('⚠️  Vercel detectado: usando storage em memória para uploads')
  upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
  })
} else {
  // Em desenvolvimento/local, usar disk storage
  uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'videos')
  
  // Criar diretório apenas se não estiver no Vercel
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
      console.log('✅ Diretório de uploads criado:', uploadsDir)
    }
  } catch (error: any) {
    console.warn('⚠️  Não foi possível criar diretório de uploads:', error.message)
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

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' })
    }

    // No Vercel, o arquivo está em memória (req.file.buffer)
    // Em desenvolvimento, o arquivo está no disco (req.file.filename)
    let videoUrl: string
    
    if (isVercel) {
      // No Vercel, não podemos salvar arquivos localmente
      // Por enquanto, vamos usar um nome único baseado no timestamp
      // Em produção real, você deveria fazer upload para S3, Vercel Blob, etc.
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const ext = path.extname(req.file.originalname || '.mp4')
      videoUrl = `video-${uniqueSuffix}${ext}`
      
      console.log('⚠️  Upload no Vercel: arquivo em memória (não salvo no disco)')
      console.log('💡 Recomendação: use Vercel Blob Storage ou S3 para uploads em produção')
    } else {
      videoUrl = req.file.filename
    }

    // Criar submissão no banco com o userId correto
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
  } catch (error) {
    console.error('Erro no upload:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

export default router