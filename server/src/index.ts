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
  origin: function (origin, callback) {
    // Em desenvolvimento, permitir qualquer origem
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true)
    }
    
    // Em produção no Vercel, permitir:
    // 1. A URL do frontend configurada
    // 2. A URL do Vercel (se disponível)
    // 3. Qualquer origem se não tiver origin (alguns casos especiais)
    const allowedOrigins = []
    
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL)
    }
    
    if (process.env.VERCEL_URL) {
      allowedOrigins.push(`https://${process.env.VERCEL_URL}`)
      allowedOrigins.push(`https://*.vercel.app`)
    }
    
    // Se não tiver origin (ex: requisições do mesmo domínio), permitir
    if (!origin) {
      return callback(null, true)
    }
    
    // Verificar se a origem está permitida
    if (allowedOrigins.length === 0 || allowedOrigins.some(allowed => origin.includes(allowed.replace('*.', '')))) {
      callback(null, true)
    } else {
      callback(null, true) // Permitir por enquanto para debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Middleware de debug para verificar rotas no Vercel
if (process.env.VERCEL === '1' || process.env.VERCEL_URL) {
  app.use((req, res, next) => {
    console.log(`🔍 Express: ${req.method} ${req.path}`)
    console.log(`   originalUrl: ${req.originalUrl}`)
    console.log(`   url: ${req.url}`)
    console.log(`   baseUrl: ${req.baseUrl}`)
    console.log(`   query:`, req.query)
    console.log(`   body:`, req.body ? JSON.stringify(req.body).substring(0, 200) : 'empty')
    next()
  })
}

// Parse JSON e URL-encoded para todas as rotas
// O multer vai sobrescrever o body parsing para rotas de upload
app.use(express.json({ limit: '50mb' }))
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

// Middleware para garantir que todas as requisições passem pelo Express
// No Vercel, isso ajuda a garantir que as rotas sejam processadas
app.use((req, res, next) => {
  // Garantir que req.url e req.path estejam corretos
  if (!req.path && req.url) {
    req.path = req.url.split('?')[0]
  }
  if (!req.originalUrl && req.url) {
    req.originalUrl = req.url
  }
  
  // Log detalhado no Vercel
  if (process.env.VERCEL === '1' || process.env.VERCEL_URL) {
    console.log(`🔍 Express Middleware: ${req.method} ${req.path}`)
    console.log(`   url: ${req.url}`)
    console.log(`   originalUrl: ${req.originalUrl}`)
    console.log(`   baseUrl: ${req.baseUrl}`)
  }
  
  next()
})

// Rotas da API
// IMPORTANTE: A ordem importa - rotas mais específicas primeiro
// No Vercel, o handler já adiciona /api, então as rotas devem ser montadas sem /api
// Mas também precisamos suportar com /api para desenvolvimento local
if (process.env.VERCEL === '1' || process.env.VERCEL_URL) {
  // No Vercel, o handler já adiciona /api, então montamos com /api
  app.use('/api/videos', videoRoutes)
  app.use('/api', apiRoutes)
} else {
  // Em desenvolvimento, também montar com /api
  app.use('/api/videos', videoRoutes)
  app.use('/api', apiRoutes)
}

// Log de rotas registradas (apenas no Vercel)
if (process.env.VERCEL === '1' || process.env.VERCEL_URL) {
  console.log('✅ Rotas registradas no Express:')
  console.log('   /api/videos/upload (POST)')
  console.log('   /api/login (POST)')
  console.log('   /api/users (GET, POST)')
  console.log('   /api/users/:id (GET, PATCH, DELETE)')
  console.log('   /api/users/:id/redeemed-rewards (GET)')
  console.log('   /api/rewards (GET, POST)')
  console.log('   /api/rewards/:id (PATCH, DELETE)')
  console.log('   /api/rewards/:id/redeem (POST)')
  console.log('   /api/submissions (GET, POST)')
  console.log('   /api/submissions/:id/approve (PATCH)')
  console.log('   /api/submissions/:id/reject (PATCH)')
}

// Debug: listar todas as rotas registradas (apenas no Vercel)
if (process.env.VERCEL === '1' || process.env.VERCEL_URL) {
  console.log('📋 Rotas registradas:')
  console.log('   GET  /api/users')
  console.log('   GET  /api/users/:id')
  console.log('   POST /api/users')
  console.log('   PATCH /api/users/:id')
  console.log('   DELETE /api/users/:id')
  console.log('   GET  /api/rewards')
  console.log('   POST /api/rewards')
  console.log('   PATCH /api/rewards/:id')
  console.log('   DELETE /api/rewards/:id')
  console.log('   POST /api/rewards/:id/redeem')
  console.log('   GET  /api/users/:id/redeemed-rewards')
  console.log('   GET  /api/submissions')
  console.log('   POST /api/submissions')
  console.log('   PATCH /api/submissions/:id/approve')
  console.log('   PATCH /api/submissions/:id/reject')
  console.log('   POST /api/videos/upload')
  console.log('   POST /api/login')
}

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