# 🚨 CONFIGURAÇÃO URGENTE NO VERCEL

## ⚠️ O LOGIN NÃO FUNCIONA SEM ISSO!

### 1. Configure DATABASE_URL no Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto: **global_changes**
3. Vá em: **Settings** → **Environment Variables**
4. Clique em: **Add New**
5. Configure:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgres://de868de246bf1d3a6a60060f13fa6f4974be311097d8a6635ab91e7207c761bc:sk_zSE9Sku6Gk5v4l7I5QUY0@db.prisma.io:5432/postgres?sslmode=require`
   - **Environment**: Marque TODOS (Production, Preview, Development)
6. Clique em **Save**

### 2. Faça um Novo Deploy

1. Vá em **Deployments**
2. Clique nos **3 pontos** do último deploy
3. Clique em **Redeploy**
4. Aguarde o deploy completar

### 3. Teste o Login

**Credenciais:**
- Email: `admin@escola.com`
- Senha: `123`

### 4. Se Ainda Não Funcionar

1. Veja os logs: **Deployments** → **Functions** → `api/[...]`
2. Procure por mensagens como:
   - `❌ DATABASE_URL não configurado`
   - `❌ Erro ao conectar Prisma`
   - `✅ Prisma conectado ao banco`

### ✅ Verificação

Após configurar, os logs devem mostrar:
- `✅ Prisma conectado ao banco de dados`
- `🔐 Tentativa de login:`
- `✅ Login bem-sucedido:`

**SEM DATABASE_URL CONFIGURADO, O LOGIN NÃO FUNCIONA!**




