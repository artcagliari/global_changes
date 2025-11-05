import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Criar admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Mestre',
      email: 'admin@escola.com',
      role: 'admin',
      points: 0,
    },
  })
  console.log('Admin criado:', admin.email)

  // Criar recompensas
  const rewards = [
    { name: 'Garrafa de Água Ecológica', pointCost: 500 },
    { name: 'Vale-Lanche Cantina', pointCost: 300 },
    { name: 'Muda de Árvore (Plantio)', pointCost: 1000 },
  ]

  for (const reward of rewards) {
    await prisma.reward.create({ data: reward })
  }
  console.log('Recompensas criadas')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })