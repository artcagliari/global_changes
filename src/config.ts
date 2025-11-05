// Detectar URL da API baseado no ambiente
const getApiUrl = () => {
  // Se VITE_API_URL estiver definida, usar ela
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Em produção no Vercel, usar a mesma URL do site (relativa)
  // As rotas da API começam com /api, então não incluímos aqui
  if (import.meta.env.PROD) {
    return ''
  }
  
  // Em desenvolvimento, usar localhost (sem /api pois as rotas já incluem)
  return 'http://localhost:4000'
}

export const API_URL = getApiUrl()
