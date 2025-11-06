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

// CORS
app.use(cors({
  origin: function (origin, callback) {
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true)
    }
    
    const allowedOrigins: string[] = []
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL)
    }
    if (process.env.VERCEL_URL) {
      allowedOrigins.push(`https://${process.env.VERCEL_URL}`)
    }
    
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.some(allowed => origin.includes(allowed))) {
      callback(null, true)
    } else {
      callback(null, true)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Body parsing - IMPORTANTE: Não aplicar para multipart/form-data
// O Multer precisa processar o stream original
app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    // Para multipart, não fazer parse do body - deixar para o Multer
    return next()
  }
  // Para outros tipos, usar os parsers padrão
  express.json({ limit: '50mb' })(req, res, next)
})

app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return next()
  }
  express.urlencoded({ extended: true, limit: '50mb' })(req, res, next)
})

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Arquivos estáticos (apenas em desenvolvimento)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_URL
if (!isVercel) {
  app.use('/uploads/videos', express.static(path.join(__dirname, '../uploads/videos')))
}
if (process.env.NODE_ENV !== 'production') {
  app.use('/public/videos', express.static(path.join(__dirname, '../../public/videos')))
}

// Middleware para normalizar request
app.use((req, res, next) => {
  if (!req.path && req.url) {
    req.path = req.url.split('?')[0]
  }
  if (!req.originalUrl && req.url) {
    req.originalUrl = req.url
  }
  if (req.method) {
    req.method = req.method.toUpperCase()
  }
  next()
})

// Rotas da API - IMPORTANTE: ordem importa!
// Rotas mais específicas primeiro (incluindo /watch)
app.use('/api/videos', videoRoutes)
app.use('/api', apiRoutes)

// Log de rotas registradas (apenas no Vercel)
if (process.env.VERCEL === '1' || process.env.VERCEL_URL) {
  console.log('✅ Rotas registradas:')
  console.log('   POST /api/videos/upload')
  console.log('   POST /api/login')
  console.log('   GET /api/users/:id')
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Frontend estático (apenas em produção local)
if (process.env.NODE_ENV === 'production' && !isVercel) {
  app.use(express.static(path.join(__dirname, '../../dist')))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'))
  })
}

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Erro:', err.stack)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

// Iniciar servidor apenas em desenvolvimento
if (!isVercel) {
  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
  })
}

export default app
export { prisma }