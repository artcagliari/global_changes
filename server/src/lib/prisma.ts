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

// Sempre manter instância global (especialmente importante para Vercel serverless)
global.__prisma = prisma
