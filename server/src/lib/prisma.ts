import { PrismaClient } from '@prisma/client'

// Singleton pattern para serverless functions (Vercel)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

// Verificar se DATABASE_URL está configurado
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não está configurado!')
  console.error('Configure no Vercel: Settings → Environment Variables')
  console.error('Valor esperado: postgres://...')
}

// Configuração otimizada para serverless
const prismaOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}

export const prisma =
  global.__prisma ??
  new PrismaClient(prismaOptions)

// Sempre manter instância global (especialmente importante para Vercel serverless)
// Em serverless, precisamos manter a instância global para evitar múltiplas conexões
global.__prisma = prisma

// Função auxiliar para garantir conexão
export async function ensureConnection() {
  try {
    await prisma.$connect()
    return true
  } catch (error: any) {
    console.error('❌ Erro ao conectar Prisma:', error.message)
    console.error('Código:', error.code)
    return false
  }
}

// Não conectar na inicialização em serverless (conexão lazy)
// A conexão será feita quando necessário
