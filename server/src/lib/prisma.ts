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

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// Sempre manter instância global (especialmente importante para Vercel serverless)
global.__prisma = prisma

// Testar conexão na inicialização
prisma.$connect()
  .then(() => {
    console.log('✅ Prisma conectado ao banco de dados')
  })
  .catch((error: any) => {
    console.error('❌ Erro ao conectar Prisma:', error.message)
    console.error('Verifique se DATABASE_URL está configurado corretamente')
  })
