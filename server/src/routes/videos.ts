import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { put } from '@vercel/blob'
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

router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    console.log('📤 Recebendo requisição de upload de vídeo')
    console.log('   File recebido:', req.file ? 'Sim' : 'Não')
    console.log('   Body:', JSON.stringify(req.body, null, 2))
    
    if (!req.file) {
      console.log('❌ Nenhum arquivo enviado')
      return res.status(400).json({ message: 'Nenhum arquivo de vídeo enviado.' })
    }

    console.log('   Arquivo:', req.file.originalname, `(${(req.file.size / 1024 / 1024).toFixed(2)} MB)`)
    console.log('   MIME type:', req.file.mimetype)

    const { userId } = req.body
    if (!userId) {
      console.log('❌ userId não fornecido')
      return res.status(400).json({ message: 'ID do usuário é obrigatório.' })
    }

    console.log('🔍 Verificando usuário:', userId)
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      console.log('❌ Usuário não encontrado:', userId)
      return res.status(404).json({ message: 'Usuário não encontrado.' })
    }
    
    console.log('✅ Usuário encontrado:', user.name, user.email)

    // Gerar URL do vídeo
    let videoUrl: string

    if (isVercel && req.file.buffer) {
      // Em Vercel, fazer upload para o Blob Storage
      try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const ext = path.extname(req.file.originalname || '.mp4')
        const fileName = `videos/video-${uniqueSuffix}${ext}`
        
        console.log('📤 Fazendo upload para Vercel Blob:', fileName)
        console.log('   Tamanho do arquivo:', (req.file.buffer.length / 1024 / 1024).toFixed(2), 'MB')
        console.log('   Token configurado:', process.env.BLOB_READ_WRITE_TOKEN ? 'Sim' : 'Não')
        
        // O Vercel Blob detecta automaticamente BLOB_READ_WRITE_TOKEN do ambiente
        // Não precisa passar explicitamente, mas verificamos se está configurado
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          console.warn('⚠️  BLOB_READ_WRITE_TOKEN não configurado! O upload pode falhar.')
        }
        
        const blob = await put(fileName, req.file.buffer, {
          access: 'public',
          contentType: req.file.mimetype || 'video/mp4',
        })
        
        videoUrl = blob.url
        console.log('✅ Upload para Blob concluído:', videoUrl)
      } catch (blobError: any) {
        console.error('❌ Erro ao fazer upload para Blob:', blobError)
        console.error('   Detalhes:', JSON.stringify(blobError, null, 2))
        throw new Error(`Erro ao fazer upload para armazenamento: ${blobError.message}`)
      }
    } else {
      // Em desenvolvimento, usar nome do arquivo salvo localmente
      videoUrl = req.file.filename
    }

    // Criar submissão
    console.log('💾 Salvando submissão no banco de dados...')
    console.log('   userId:', userId)
    console.log('   videoUrl:', videoUrl)
    
    const submission = await prisma.submission.create({
      data: {
        userId: userId,
        videoUrl: videoUrl,
        status: 'PENDING'
      }
    })

    console.log('✅ Submissão criada com sucesso:', submission.id)

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
router.get('/watch/:videoUrl(*)', async (req, res) => {
  try {
    const videoUrl = decodeURIComponent(req.params.videoUrl)
    
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