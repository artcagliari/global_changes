import { Router, type Request, type Response } from 'express'
import { prisma, ensureConnection } from '../lib/prisma.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }
    
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ 
        error: 'Banco de dados não configurado',
        message: 'DATABASE_URL não está definido'
      })
    }
    
    const connected = await ensureConnection()
    if (!connected) {
      return res.status(500).json({ 
        error: 'Erro de conexão com banco de dados',
        message: 'Não foi possível conectar ao banco'
      })
    }
    
    // Validação de senha (em produção, usar hash)
    if (password !== '123') {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
      createdAt: user.createdAt
    })
  } catch (error: any) {
    console.error('Erro no login:', error.message)
    
    let userMessage = 'Erro ao fazer login'
    if (error.code === 'P1001' || error.code === 'P1000') {
      userMessage = 'Erro de conexão com banco de dados'
    }
    
    res.status(500).json({ 
      error: userMessage,
      message: error.message
    })
  }
})

// Listar usuários
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    })
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Buscar usuário específico
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (error: any) {
    console.error('Erro ao buscar usuário:', error.message)
    res.status(500).json({ error: 'Failed to fetch user', message: error.message })
  }
})

// Criar usuário
router.post('/users', async (req, res) => {
  try {
    const { name, email, role, points = 0 } = req.body
    
    // Validações
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' })
    }
    
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }
    
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    })
    
    if (existingUser) {
      return res.status(409).json({ error: 'Este email já está em uso' })
    }
    
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role || 'student',
        points: points || 0
      }
    })

    res.json(user)
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Este email já está em uso' })
    }
    res.status(500).json({ error: 'Erro ao criar usuário' })
  }
})

// Atualizar usuário
router.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, role, points } = req.body
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role: role }),
        ...(points !== undefined && { points })
      }
    })

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// Deletar usuário
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Deletar submissões primeiro (cascade)
    await prisma.submission.deleteMany({
      where: { userId: id }
    })
    
    // Deletar redemptions também
    await prisma.rewardRedemption.deleteMany({
      where: { userId: id }
    })
    
    await prisma.user.delete({
      where: { id }
    })

    console.log('✅ Usuário deletado:', id)
    res.json({ success: true })
  } catch (error: any) {
    console.error('❌ Erro ao deletar usuário:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }
    res.status(500).json({ 
      error: 'Erro ao deletar usuário',
      message: error.message 
    })
  }
})

// Listar recompensas
router.get('/rewards', async (req, res) => {
  try {
    const rewards = await prisma.reward.findMany({
      orderBy: { pointCost: 'asc' }
    })
    res.json(rewards)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rewards' })
  }
})

// Criar recompensa
router.post('/rewards', async (req, res) => {
  try {
    const { name, pointCost } = req.body
    
    // Validações
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da recompensa é obrigatório' })
    }
    
    if (pointCost === undefined || pointCost === null || pointCost < 0) {
      return res.status(400).json({ error: 'Custo em pontos deve ser um número positivo' })
    }
    
    console.log('📝 Criando recompensa:', { name, pointCost })
    
    const reward = await prisma.reward.create({
      data: { name: name.trim(), pointCost: Number(pointCost) }
    })

    console.log('✅ Recompensa criada:', reward.id)
    res.json(reward)
  } catch (error: any) {
    console.error('❌ Erro ao criar recompensa:', error)
    res.status(500).json({ 
      error: 'Erro ao criar recompensa',
      message: error.message 
    })
  }
})

// Atualizar recompensa
router.patch('/rewards/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, pointCost } = req.body
    
    console.log('📝 Atualizando recompensa:', { id, name, pointCost })
    
    const updateData: any = {}
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ error: 'Nome da recompensa não pode ser vazio' })
      }
      updateData.name = name.trim()
    }
    if (pointCost !== undefined) {
      if (pointCost < 0) {
        return res.status(400).json({ error: 'Custo em pontos deve ser um número positivo' })
      }
      updateData.pointCost = Number(pointCost)
    }
    
    const reward = await prisma.reward.update({
      where: { id },
      data: updateData
    })

    console.log('✅ Recompensa atualizada:', reward.id)
    res.json(reward)
  } catch (error: any) {
    console.error('❌ Erro ao atualizar recompensa:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Recompensa não encontrada' })
    }
    res.status(500).json({ 
      error: 'Erro ao atualizar recompensa',
      message: error.message 
    })
  }
})

// Deletar recompensa
router.delete('/rewards/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await prisma.reward.delete({
      where: { id }
    })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reward' })
  }
})

// Trocar recompensa por pontos
router.post('/rewards/:id/redeem', async (req, res) => {
  try {
    const { id: rewardId } = req.params
    const { userId } = req.body
    
    if (!userId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }
    
    // Buscar recompensa e usuário
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId }
    })
    
    if (!reward) {
      return res.status(404).json({ error: 'Recompensa não encontrada' })
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }
    
    // Verificar se o usuário tem pontos suficientes
    if (user.points < reward.pointCost) {
      return res.status(400).json({ error: 'Saldo de pontos insuficiente' })
    }
    
    // Criar registro da troca e atualizar pontos do usuário em uma transação
    const [redemption, updatedUser] = await prisma.$transaction([
      prisma.rewardRedemption.create({
        data: {
          userId,
          rewardId,
          pointsSpent: reward.pointCost
        },
        include: {
          reward: true,
          user: true
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { points: { decrement: reward.pointCost } }
      })
    ])
    
    res.json({
      success: true,
      redemption,
      updatedUser
    })
  } catch (error) {
    console.error('Erro ao trocar recompensa:', error)
    res.status(500).json({ error: 'Erro ao trocar recompensa' })
  }
})

// Listar recompensas trocadas por um usuário
router.get('/users/:id/redeemed-rewards', async (req, res) => {
  try {
    const { id: userId } = req.params
    
    const redemptions = await prisma.rewardRedemption.findMany({
      where: { userId },
      include: {
        reward: true
      },
      orderBy: {
        redeemedAt: 'desc'
      }
    })
    
    res.json(redemptions)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar recompensas trocadas' })
  }
})

// Listar submissões
router.get('/submissions', async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      include: {
        user: true
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })
    res.json(submissions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' })
  }
})

// Criar submissão
router.post('/submissions', async (req: Request, res: Response) => {
  try {
    const { userId, videoUrl } = req.body
    
    if (!userId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'URL do vídeo é obrigatória' })
    }
    
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const submission = await prisma.submission.create({
      data: {
        userId,
        videoUrl,
        status: 'pending'
      },
      include: {
        user: true
      }
    })

    console.log('✅ Submissão criada:', submission.id, 'URL:', videoUrl)
    res.json(submission)
  } catch (error: any) {
    console.error('❌ Erro ao criar submissão:', error)
    res.status(500).json({ 
      error: 'Failed to create submission',
      message: error.message 
    })
  }
})

// Aprovar submissão
router.patch('/submissions/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { user: true }
    })
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    // Adicionar 1 ponto ao usuário
    await prisma.user.update({
      where: { id: submission.userId },
      data: { points: { increment: 1 } }
    })

    // Deletar o arquivo de vídeo (apenas em desenvolvimento)
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_URL
    
    if (!isVercel) {
      // Em desenvolvimento, deletar do disco
      const videoPath = path.join(__dirname, '..', '..', 'uploads', 'videos', submission.videoUrl)
      try {
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath)
          console.log('✅ Arquivo de vídeo deletado:', submission.videoUrl)
        }
      } catch (fileError) {
        console.error('Erro ao deletar arquivo de vídeo:', fileError)
        // Não falhar a aprovação
      }
    }

    // Deletar o registro do banco de dados (remove o vídeo do sistema)
    await prisma.submission.delete({
      where: { id }
    })
    console.log('✅ Submissão deletada do banco de dados')

    // Headers para invalidar cache do vídeo
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Video-Url': submission.videoUrl,
      'X-Cache-Invalidated': 'true'
    })

    res.json({ 
      success: true,
      message: 'Vídeo aprovado, pontos adicionados e vídeo removido do sistema'
    })
  } catch (error) {
    console.error('Erro ao aprovar submissão:', error)
    res.status(500).json({ error: 'Failed to approve submission' })
  }
})

// Rejeitar submissão
router.patch('/submissions/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    await prisma.submission.update({
      where: { id },
      data: { status: 'REJECTED' }
    })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject submission' })
  }
})

export default router
