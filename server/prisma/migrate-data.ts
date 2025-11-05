#!/usr/bin/env ts-node-esm
/**
 * Script para migrar dados do SQLite para PostgreSQL
 * 
 * IMPORTANTE: Execute este script ANTES de fazer deploy no Vercel
 * 
 * Uso:
 * 1. Configure DATABASE_URL para PostgreSQL
 * 2. Instale: npm install better-sqlite3 @types/better-sqlite3
 * 3. Execute: npx ts-node-esm prisma/migrate-data.ts
 */

import { PrismaClient } from '@prisma/client'
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function migrateData() {
  console.log('🔄 Iniciando migração de dados...\n')

  // Conectar ao SQLite (local)
  const sqlitePath = path.join(__dirname, 'dev.db')
  
  if (!require('fs').existsSync(sqlitePath)) {
    console.error('❌ Arquivo dev.db não encontrado!')
    console.error(`   Procurando em: ${sqlitePath}`)
    process.exit(1)
  }

  const sqlite = new Database(sqlitePath)
  console.log('✅ Conectado ao SQLite local')

  // Verificar se DATABASE_URL está configurado para PostgreSQL
  const postgresUrl = process.env.DATABASE_URL
  if (!postgresUrl || !postgresUrl.includes('postgres')) {
    console.error('❌ DATABASE_URL não está configurado para PostgreSQL!')
    console.error('   Configure: export DATABASE_URL="postgresql://..."')
    sqlite.close()
    process.exit(1)
  }

  const postgres = new PrismaClient({
    datasources: {
      db: {
        url: postgresUrl
      }
    }
  })

  console.log('✅ Conectado ao PostgreSQL\n')

  try {
    // Migrar Users
    console.log('📦 Migrando usuários...')
    const users = sqlite.prepare('SELECT * FROM User').all() as any[]
    for (const user of users) {
      await postgres.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          points: user.points,
          createdAt: new Date(user.createdAt)
        }
      })
    }
    console.log(`   ✅ ${users.length} usuários migrados`)

    // Migrar Rewards
    console.log('📦 Migrando recompensas...')
    const rewards = sqlite.prepare('SELECT * FROM Reward').all() as any[]
    for (const reward of rewards) {
      await postgres.reward.upsert({
        where: { id: reward.id },
        update: {},
        create: {
          id: reward.id,
          name: reward.name,
          pointCost: reward.pointCost
        }
      })
    }
    console.log(`   ✅ ${rewards.length} recompensas migradas`)

    // Migrar Submissions
    console.log('📦 Migrando submissões...')
    const submissions = sqlite.prepare('SELECT * FROM Submission').all() as any[]
    for (const submission of submissions) {
      await postgres.submission.upsert({
        where: { id: submission.id },
        update: {},
        create: {
          id: submission.id,
          userId: submission.userId,
          videoUrl: submission.videoUrl,
          status: submission.status,
          submittedAt: new Date(submission.submittedAt)
        }
      })
    }
    console.log(`   ✅ ${submissions.length} submissões migradas`)

    // Migrar RewardRedemptions
    console.log('📦 Migrando resgates de recompensas...')
    const redemptions = sqlite.prepare('SELECT * FROM RewardRedemption').all() as any[]
    for (const redemption of redemptions) {
      await postgres.rewardRedemption.upsert({
        where: { id: redemption.id },
        update: {},
        create: {
          id: redemption.id,
          userId: redemption.userId,
          rewardId: redemption.rewardId,
          pointsSpent: redemption.pointsSpent,
          redeemedAt: new Date(redemption.redeemedAt)
        }
      })
    }
    console.log(`   ✅ ${redemptions.length} resgates migrados`)

    console.log('\n✅ Migração concluída com sucesso!')
    console.log('\n📋 Próximos passos:')
    console.log('   1. Verifique os dados no PostgreSQL (npx prisma studio)')
    console.log('   2. Faça backup do SQLite (dev.db)')
    console.log('   3. Atualize o schema.prisma para PostgreSQL')
    console.log('   4. Configure DATABASE_URL no Vercel')
    console.log('   5. Faça deploy no Vercel')

  } catch (error: any) {
    console.error('❌ Erro durante migração:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    sqlite.close()
    await postgres.$disconnect()
  }
}

migrateData()

