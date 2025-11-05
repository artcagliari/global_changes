import { PrismaClient, Prisma } from '@prisma/client'

// Verificar se estamos usando Prisma Accelerate (URL começa com prisma+postgres://)
const isAccelerate = process.env.DATABASE_URL?.startsWith('prisma+postgres://')
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_URL

// Singleton pattern para serverless functions (Vercel)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: any | undefined
}

// Verificar se DATABASE_URL está configurado
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não está configurado!')
  console.error('Configure no Vercel: Settings → Environment Variables')
  console.error('Valor esperado: postgres://... ou prisma+postgres://...')
} else {
  console.log(`✅ DATABASE_URL configurado (${isAccelerate ? 'Accelerate' : 'PostgreSQL direto'})`)
}

// Configuração otimizada para serverless
const prismaOptions: Prisma.PrismaClientOptions = {
  log: process.env.NODE_ENV === 'development' 
    ? (['query', 'error', 'warn'] as Prisma.LogLevel[])
    : (['error'] as Prisma.LogLevel[]),
}

// Criar instância base do Prisma
let prismaBase = global.__prisma ?? new PrismaClient(prismaOptions)

// Se estiver usando Accelerate, adicionar extensão
if (isAccelerate) {
  try {
    // Tentar carregar a extensão do Accelerate
    // Nota: O pacote pode ter um nome diferente ou estar incluído no @prisma/client
    const accelerateModule = await import('@prisma/extension-accelerate')
    if (accelerateModule && accelerateModule.withAccelerate) {
      prismaBase = prismaBase.$extends(accelerateModule.withAccelerate())
      console.log('🚀 Prisma Accelerate ativado (cache e otimizações)')
    } else {
      console.warn('⚠️  Accelerate module não encontrado, continuando sem Accelerate')
    }
  } catch (error: any) {
    console.warn('⚠️  Não foi possível carregar Prisma Accelerate:', error.message)
    console.warn('   Continuando sem Accelerate (usando PostgreSQL direto)')
    console.warn('   Para usar Accelerate, instale: npm install @prisma/extension-accelerate')
  }
}

export const prisma = prismaBase

// Sempre manter instância global (especialmente importante para Vercel serverless)
// Em serverless, precisamos manter a instância global para evitar múltiplas conexões
global.__prisma = prismaBase

// Função auxiliar para garantir conexão
export async function ensureConnection() {
  try {
    // No Accelerate, não precisamos conectar explicitamente
    // Mas vamos testar a conexão fazendo uma query simples
    if (isAccelerate) {
      // Testar conexão com uma query simples (cacheable)
      await prisma.$queryRaw`SELECT 1`
      return true
    } else {
      await prisma.$connect()
      return true
    }
  } catch (error: any) {
    console.error('❌ Erro ao conectar Prisma:', error.message)
    console.error('Código:', error.code)
    if (error.code) {
      console.error('Código de erro:', error.code)
    }
    return false
  }
}

// Não conectar na inicialização em serverless (conexão lazy)
// A conexão será feita quando necessário
// Com Accelerate, a conexão é gerenciada automaticamente
