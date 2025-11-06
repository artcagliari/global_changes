/**
 * Script de teste para registro de usuário
 * Simula o registro de um novo usuário
 */

const API_URL = process.env.API_URL || 'http://localhost:4000'

async function testRegister() {
  try {
    console.log('🧪 Testando registro de usuário...\n')
    
    const testUser = {
      name: 'Teste Usuário ' + Date.now(),
      email: `teste${Date.now()}@teste.com`,
      role: 'student',
      points: 0
    }
    
    console.log('📤 Criando usuário:')
    console.log('   Nome:', testUser.name)
    console.log('   Email:', testUser.email)
    console.log('   Role:', testUser.role)
    console.log('')
    
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    })
    
    console.log('📥 Resposta do servidor:')
    console.log('   Status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Erro no registro:', errorData)
      process.exit(1)
    }
    
    const user = await response.json()
    console.log('✅ Usuário criado com sucesso!')
    console.log('   ID:', user.id)
    console.log('   Nome:', user.name)
    console.log('   Email:', user.email)
    console.log('   Role:', user.role)
    console.log('   Points:', user.points)
    console.log('')
    console.log('🎉 Teste concluído com sucesso!')
    console.log('')
    console.log('💡 Para testar upload, use:')
    console.log(`   TEST_USER_ID=${user.id} npm run test:upload`)
    
  } catch (error: any) {
    console.error('❌ Erro no teste:', error.message)
    console.error('   Stack:', error.stack)
    process.exit(1)
  }
}

testRegister()

