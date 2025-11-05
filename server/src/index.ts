import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import videoRoutes from './routes/videos.js'
import apiRoutes from './routes/api.js'
import { prisma } from './lib/prisma.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : true))
    : true, // Permite qualquer origem em desenvolvimento (localhost em qualquer porta)
  credentials: true
}))

// Middleware de debug para verificar rotas no Vercel
if (process.env.VERCEL === '1' || process.env.VERCEL_URL) {
  app.use((req, res, next) => {
    console.log(`🔍 Express: ${req.method} ${req.path} (originalUrl: ${req.originalUrl}, url: ${req.url})`)
    next()
  })
}

// Parse JSON apenas para rotas que não são uploads
// Multer precisa processar multipart/form-data antes do body ser parseado
app.use((req, res, next) => {
  // Não parsear JSON se for upload de vídeo (multer vai processar)
  if (req.path.includes('/videos/upload') && req.method === 'POST') {
    return next()
  }
  express.json({ limit: '50mb' })(req, res, next)
})

app.use(express.urlencoded({ extended: true, limit: '50mb' }))

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Servir vídeos estáticos (uploads) com headers de cache
// No Vercel, não servimos arquivos estáticos do sistema de arquivos (read-only)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_URL
if (!isVercel) {
  app.use('/uploads/videos', (req, res, next) => {
    // Headers para controlar cache de vídeos
    res.set({
      'Cache-Control': 'public, max-age=3600',
      'ETag': `"${req.path}-${Date.now()}"`
    })
    next()
  }, express.static(path.join(__dirname, '../uploads/videos')))
} else {
  // No Vercel, retornar erro 404 ou mensagem informativa
  app.use('/uploads/videos', (req, res) => {
    res.status(404).json({ 
      error: 'Vídeo não disponível',
      message: 'No Vercel, arquivos devem ser servidos via CDN ou storage externo (S3, Vercel Blob, etc.)'
    })
  })
}

// Servir vídeos do front (public/videos) - para desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  app.use('/public/videos', express.static(path.join(__dirname, '../../public/videos')))
}

// Rotas da API
app.use('/api/videos', videoRoutes) // Rotas específicas de vídeos
app.use('/api', apiRoutes) // Rotas de gerenciamento (users, rewards, submissions)

// Health check
app.get('/health', (_req, res) => res.json({ 
  ok: true, 
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development'
}))

// Rota para servir o frontend em produção (apenas localmente, não no Vercel)
if (process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1') {
  app.use(express.static(path.join(__dirname, '../../dist')))
  
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'))
  })
}

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Algo deu errado!' })
})

const PORT = process.env.PORT || 4000

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Fechando conexão com o banco...')
  await prisma.$disconnect()
  process.exit(0)
})

// Iniciar servidor apenas se não estiver em ambiente serverless (Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
    console.log(`📁 Ambiente: ${process.env.NODE_ENV || 'development'}`)
  })
}

// Exportar app para Vercel serverless functions
export default app
export { prisma }