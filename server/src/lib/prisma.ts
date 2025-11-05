import { PrismaClient, Prisma } from '@prisma/client'

// Verificar se estamos usando Prisma Accelerate (URL começa com prisma+postgres://)
const databaseUrl = process.env.DATABASE_URL || ''
const isAccelerate = databaseUrl.startsWith('prisma+postgres://') || databaseUrl.includes('accelerate.prisma-data.net')
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_URL

// Singleton pattern para serverless functions (Vercel)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: any | undefined
}

// Verificar se DATABASE_URL está configurado
if (!databaseUrl) {
  console.error('❌ DATABASE_URL não está configurado!')
  console.error('Configure no Vercel: Settings → Environment Variables')
  console.error('Valor esperado: postgres://... ou prisma+postgres://...')
} else {
  const urlPreview = databaseUrl.substring(0, 30) + '...'
  console.log(`✅ DATABASE_URL configurado`)
  console.log(`   Tipo: ${isAccelerate ? '🚀 Accelerate' : '📊 PostgreSQL direto'}`)
  console.log(`   URL preview: ${urlPreview}`)
  
  if (!isAccelerate && isVercel) {
    console.log('💡 Dica: Para usar Accelerate, configure DATABASE_URL começando com prisma+postgres://')
  }
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
    // Carregar a extensão do Accelerate
    const { withAccelerate } = require('@prisma/extension-accelerate')
    prismaBase = prismaBase.$extends(withAccelerate())
    console.log('🚀 Prisma Accelerate ATIVADO!')
    console.log('   ✅ Cache automático habilitado')
    console.log('   ✅ Conexões otimizadas para serverless')
    console.log('   ✅ Performance melhorada')
  } catch (error: any) {
    console.error('❌ Erro ao carregar Prisma Accelerate:', error.message)
    console.error('   Stack:', error.stack)
    console.warn('   Continuando sem Accelerate (usando PostgreSQL direto)')
    console.warn('   Verifique se @prisma/extension-accelerate está instalado')
  }
} else {
  if (isVercel) {
    console.log('ℹ️  Accelerate não detectado - usando PostgreSQL direto')
    console.log('   Para ativar: configure DATABASE_URL com prisma+postgres://...')
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
