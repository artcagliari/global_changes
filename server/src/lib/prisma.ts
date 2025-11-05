import { PrismaClient } from '@prisma/client'

// Singleton pattern para serverless functions (Vercel)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// Manter instância global em produção (Vercel serverless)
if (process.env.NODE_ENV === 'production') {
  global.__prisma = prisma
} else if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}
