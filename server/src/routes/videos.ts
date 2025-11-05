import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { prisma } from '../lib/prisma.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'videos')

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
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

const upload = multer({ storage: storage })

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

    // Criar submissão no banco com o userId correto
    const submission = await prisma.submission.create({
      data: {
        userId: userId,
        videoUrl: req.file.filename,
        status: 'pending'
      }
    })

    res.status(200).json({ 
      message: 'Vídeo enviado com sucesso!', 
      fileName: req.file.filename,
      submissionId: submission.id
    })
  } catch (error) {
    console.error('Erro no upload:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

export default router