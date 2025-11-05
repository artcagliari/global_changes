// Vercel Serverless Function - Catch-all route
// Este arquivo captura todas as rotas da API e repassa para o servidor Express

// Importar o app Express
import app from '../server/src/index'

// Exportar o app Express diretamente
// O Vercel automaticamente converte o Express app para serverless function
export default app

