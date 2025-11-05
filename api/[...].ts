// Vercel Serverless Function - Catch-all route
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Importar o app Express diretamente
let app: any = null

async function getApp() {
  if (!app) {
    try {
      console.log('📦 Carregando servidor Express...')
      
      // Verificar se DATABASE_URL está configurado antes de importar
      if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL não configurado!')
      } else {
        console.log('✅ DATABASE_URL configurado')
      }
      
      const serverModule = await import('../server/src/index.js')
      app = serverModule.default
      console.log('✅ Servidor Express carregado')
    } catch (error: any) {
      console.error('❌ Erro ao carregar servidor:', error.message)
      console.error('Stack:', error.stack)
      console.error('Nome:', error.name)
      throw error
    }
  }
  return app
}

// Exportar como handler do Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = await getApp()
    
    // No Vercel com api/[...].ts, a URL vem como /api/login, /api/users/:id, etc.
    // A URL já vem correta do Vercel, não precisamos modificar
    let url = req.url || ''
    const path = url.split('?')[0]
    
    // Garantir que a URL sempre comece com /api (segurança)
    const finalPath = path.startsWith('/api') ? path : `/api${path}`
    const finalUrl = finalPath + (url.includes('?') ? '?' + url.split('?')[1] : '')
    
    console.log(`📨 ${req.method} ${finalPath}`)
    
    // Parse do body se necessário (Vercel já parseia JSON, mas garantimos)
    let body = req.body
    if (!body && req.method && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers?.['content-type'] || ''
      if (contentType.includes('application/json')) {
        try {
          // Se o body é uma string, tentar parsear
          if (typeof req.body === 'string') {
            body = JSON.parse(req.body)
          }
        } catch (e) {
          console.warn('⚠️  Erro ao parsear body JSON:', e)
        }
      }
    }
    
    // Criar um objeto de request compatível com Express
    const expressReq = {
      ...req,
      url: finalUrl,
      originalUrl: finalUrl,
      path: finalPath,
      baseUrl: '',
      method: req.method || 'GET',
      headers: req.headers || {},
      body: body || req.body,
      query: req.query || {},
      params: {},
      // Propriedades necessárias para o Express
      protocol: 'https',
      secure: true,
      hostname: req.headers?.['host'] || 'localhost',
      ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'] || '0.0.0.0',
      // Métodos do Express
      get: (name: string) => req.headers?.[name.toLowerCase()],
      header: (name: string) => req.headers?.[name.toLowerCase()],
    } as any
    
    // Converter Vercel request/response para Express
    // Usar uma abordagem mais simples e direta
    return new Promise<void>((resolve) => {
      let resolved = false
      
      // Wrapper para garantir que resolve seja chamado apenas uma vez
      const resolveOnce = () => {
        if (!resolved) {
          resolved = true
          resolve()
        }
      }
      
      // Adicionar handler para quando a resposta terminar
      const originalEnd = res.end.bind(res)
      res.end = function(chunk?: any, encoding?: any, cb?: any) {
        const result = originalEnd(chunk, encoding, cb)
        resolveOnce()
        return result
      }
      
      // Adicionar handler para quando a resposta for enviada
      const originalSend = res.send.bind(res)
      res.send = function(body?: any) {
        const result = originalSend(body)
        // Aguardar um pouco antes de resolver para garantir que tudo foi enviado
        setTimeout(resolveOnce, 10)
        return result
      }
      
      // Processar a requisição no Express
      expressApp(expressReq, res, (err: any) => {
        if (err) {
          console.error('❌ Erro no Express middleware:', err)
          if (!res.headersSent) {
            try {
              res.status(500).json({
                error: 'Erro interno do servidor',
                message: err.message
              })
            } catch (sendError) {
              console.error('Erro ao enviar resposta de erro:', sendError)
            }
          }
        }
        resolveOnce()
      })
      
      // Timeout de segurança (30 segundos)
      setTimeout(() => {
        if (!resolved) {
          console.warn('⚠️  Timeout no handler do Vercel')
          resolveOnce()
        }
      }, 30000)
    })
  } catch (error: any) {
    console.error('❌ Erro no handler do Vercel:', error.message)
    console.error('Stack:', error.stack)
    console.error('Nome:', error.name)
    
    // Retornar erro mais informativo
    if (!res.headersSent) {
      try {
        return res.status(500).json({
          error: 'Erro ao processar requisição',
          message: error.message,
          name: error.name,
          hint: 'Verifique os logs do servidor para mais detalhes'
        })
      } catch (sendError) {
        console.error('Erro ao enviar resposta de erro:', sendError)
      }
    }
  }
}

