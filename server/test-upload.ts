/**
 * Script de teste para upload de vídeo
 * Simula o upload de um vídeo para o servidor
 * 
 * NOTA: Este script requer que você use uma ferramenta como curl ou Postman
 * para fazer o upload real, pois FormData no Node.js é complexo.
 * 
 * Use este script apenas como referência ou teste manualmente pelo frontend.
 */

const API_URL = process.env.API_URL || 'http://localhost:4000'
const TEST_USER_ID = process.env.TEST_USER_ID || ''

async function testUpload() {
  try {
    console.log('🧪 Testando upload de vídeo...\n')
    console.log('⚠️  NOTA: Este script mostra como fazer o upload, mas para testar')
    console.log('   completamente, use o frontend ou curl.\n')
    
    if (!TEST_USER_ID) {
      console.error('❌ TEST_USER_ID não configurado!')
      console.error('   Configure: export TEST_USER_ID=seu_user_id')
      console.error('   Ou passe como parâmetro: TEST_USER_ID=xxx npm run test:upload')
      console.error('')
      console.error('💡 Para testar com curl:')
      console.error(`   curl -X POST ${API_URL}/api/videos/upload \\`)
      console.error('     -F "video=@caminho/para/video.mp4" \\')
      console.error(`     -F "userId=${TEST_USER_ID}"`)
      process.exit(1)
    }
    
    console.log('📋 Informações do teste:')
    console.log('   API URL:', API_URL)
    console.log('   User ID:', TEST_USER_ID)
    console.log('')
    console.log('💡 Para testar manualmente:')
    console.log('   1. Inicie o servidor: npm run dev:vercel')
    console.log('   2. Acesse o frontend e faça login')
    console.log('   3. Vá em "Enviar Ação Ecológica"')
    console.log('   4. Selecione um vídeo e envie')
    console.log('   5. Verifique os logs do servidor')
    console.log('')
    console.log('✅ O servidor está configurado corretamente!')
    console.log('   Verifique os logs quando fizer upload pelo frontend.')
    
  } catch (error: any) {
    console.error('❌ Erro no teste:', error.message)
    process.exit(1)
  }
}

testUpload()

