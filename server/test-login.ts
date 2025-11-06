#!/usr/bin/env ts-node-esm
/**
 * Script para testar o login e verificar usuários no banco
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testLogin() {
  console.log('🔍 Testando conexão e login...\n')

  try {
    // Verificar conexão
    await prisma.$connect()
    console.log('✅ Conectado ao banco de dados\n')

    // Listar usuários
    console.log('📋 Usuários no banco:')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true
      }
    })

    if (users.length === 0) {
      console.log('   ⚠️  Nenhum usuário encontrado!')
      console.log('\n💡 Criando usuário admin padrão...')
      
      const admin = await prisma.user.create({
        data: {
          name: 'Admin Mestre',
          email: 'admin@escola.com',
          role: 'admin',
          points: 0
        }
      })
      
      console.log('✅ Usuário admin criado:')
      console.log(`   Email: ${admin.email}`)
      console.log(`   Senha: 123`)
    } else {
      users.forEach((user, index) => {
        console.log(`\n   ${index + 1}. ${user.name}`)
        console.log(`      Email: ${user.email}`)
        console.log(`      Role: ${user.role}`)
        console.log(`      Pontos: ${user.points}`)
      })
    }

    // Testar login
    console.log('\n🔐 Testando login...')
    const testEmail = 'admin@escola.com'
    const testPassword = '123'
    
    const user = await prisma.user.findUnique({
      where: { email: testEmail }
    })

    if (user) {
      console.log(`✅ Usuário encontrado: ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log('\n💡 Para fazer login:')
      console.log(`   Email: ${testEmail}`)
      console.log(`   Senha: ${testPassword}`)
    } else {
      console.log(`❌ Usuário ${testEmail} não encontrado`)
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()




