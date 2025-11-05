# 🔍 Debug: Problema de Login

## ✅ Verificação Local

Os usuários estão no banco PostgreSQL:
- ✅ admin@escola.com (admin)
- ✅ arturcagliari2018@gmail.com (student)
- ✅ aluno@escola.com (student)

## 🔍 Possíveis Problemas no Vercel

### 1. DATABASE_URL não configurado

**Verificar:**
1. Dashboard Vercel → Settings → Environment Variables
2. Procure por `DATABASE_URL`
3. Deve ter este valor:
   ```
   postgres://de868de246bf1d3a6a60060f13fa6f4974be311097d8a6635ab91e7207c761bc:sk_zSE9Sku6Gk5v4l7I5QUY0@db.prisma.io:5432/postgres?sslmode=require
   ```

**Se não existir:**
- Adicione a variável
- Marque todos os ambientes (Production, Preview, Development)
- Faça um novo deploy

### 2. Verificar Logs do Vercel

1. Vá em **Deployments** no dashboard do Vercel
2. Clique no último deploy
3. Vá em **Functions** → `api/[...]`
4. Veja os logs de erro

**Erros comuns:**
- `DATABASE_URL is not defined` → Variável não configurada
- `Can't reach database server` → Problema de conexão
- `P1001: Can't reach database server` → URL incorreta ou banco inacessível

### 3. Testar Endpoint Manualmente

Abra o console do navegador e teste:

```javascript
// Teste 1: Verificar se a API está acessível
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)

// Teste 2: Tentar login
fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'admin@escola.com', 
    password: '123' 
  })
})
  .then(r => {
    console.log('Status:', r.status)
    return r.json()
  })
  .then(console.log)
  .catch(console.error)
```

### 4. Verificar CORS

O CORS pode estar bloqueando. Verifique se `FRONTEND_URL` está configurado no Vercel.

### 5. Verificar Roteamento

A rota `/api/login` deve estar sendo capturada pelo `api/[...].ts`.

**Verificar:**
- O arquivo `api/[...].ts` existe?
- O `vercel.json` está configurado corretamente?

## 🔧 Solução Rápida

1. **Adicione DATABASE_URL no Vercel:**
   - Settings → Environment Variables
   - Nome: `DATABASE_URL`
   - Valor: `postgres://de868de246bf1d3a6a60060f13fa6f4974be311097d8a6635ab91e7207c761bc:sk_zSE9Sku6Gk5v4l7I5QUY0@db.prisma.io:5432/postgres?sslmode=require`
   - Ambiente: Todos

2. **Faça um novo deploy:**
   - Deployments → 3 pontos → Redeploy

3. **Aguarde o build completar**

4. **Teste novamente**

## 📞 Se ainda não funcionar

1. Compartilhe os logs do Vercel
2. Compartilhe o erro do console do navegador
3. Verifique se o DATABASE_URL está correto

