import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import videoRoutes from './routes/videos.ts'
import apiRoutes from './routes/api.ts'
import { prisma } from './lib/prisma.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : true)
    : true, // Permite qualquer origem em desenvolvimento (localhost em qualquer porta)
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Servir vídeos estáticos (uploads) com headers de cache
app.use('/uploads/videos', (req, res, next) => {
  // Headers para controlar cache de vídeos
  res.set({
    'Cache-Control': 'public, max-age=3600',
    'ETag': `"${req.path}-${Date.now()}"`
  })
  next()
}, express.static(path.join(__dirname, '../uploads/videos')))

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