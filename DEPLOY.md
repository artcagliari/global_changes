# 🚀 Guia de Deploy - Global Changes

## Pré-requisitos

1. Conta no [GitHub](https://github.com)
2. Conta no [Vercel](https://vercel.com)
3. Node.js 18+ instalado

## 📤 Passo 1: Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Crie um novo repositório (ex: `global-changes`)
3. **NÃO** inicialize com README, .gitignore ou licença (já temos)

## 📤 Passo 2: Conectar ao GitHub

Execute os seguintes comandos no terminal:

```bash
cd /Users/artcagliari/Documents/ecopontos-escolar/ecopontos-escolar

# Adicionar o repositório remoto (substitua SEU_USUARIO e SEU_REPO)
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git

# Renomear branch para main (se necessário)
git branch -M main

# Enviar código para o GitHub
git push -u origin main
```

## 🌐 Passo 3: Deploy no Vercel

### 3.1 Conectar Projeto

1. Acesse https://vercel.com/dashboard
2. Clique em **"Add New..."** → **"Project"**
3. Selecione **"Import Git Repository"**
4. Escolha seu repositório do GitHub
5. Clique em **"Import"**

### 3.2 Configurar Build

O Vercel detectará automaticamente as configurações do `vercel.json`, mas você pode verificar:

- **Framework Preset**: Vite
- **Root Directory**: `./` (raiz do projeto)
- **Build Command**: `npm run build && cd server && npm run prisma:generate && npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install && cd server && npm install`

### 3.3 Configurar Variáveis de Ambiente

No painel do Vercel, vá em **Settings** → **Environment Variables** e adicione:

```env
FRONTEND_URL=https://seu-projeto.vercel.app
VITE_API_URL=https://seu-projeto.vercel.app/api
NODE_ENV=production
```

**⚠️ IMPORTANTE**: 
- Substitua `seu-projeto.vercel.app` pela URL real que o Vercel fornecer após o primeiro deploy
- Você pode atualizar a variável `FRONTEND_URL` após o primeiro deploy

### 3.4 Fazer Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (pode levar alguns minutos)
3. Após o deploy, copie a URL fornecida
4. Atualize a variável `FRONTEND_URL` no Vercel com a URL real
5. Faça um novo deploy para aplicar as mudanças

## ⚠️ Problemas Comuns e Soluções

### Erro: "Cannot find module '@prisma/client'"

**Solução**: Certifique-se de que o `buildCommand` inclui `prisma:generate`:

```json
"buildCommand": "npm run build && cd server && npm run prisma:generate && npm run build"
```

### Erro: "Database connection failed"

**Solução**: SQLite não funciona bem no Vercel. Para produção, considere:

1. **Vercel Postgres** (recomendado):
   - Adicione Vercel Postgres no dashboard
   - Atualize `server/prisma/schema.prisma`:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - Execute migrations: `npx prisma migrate deploy`

2. **Supabase** (alternativa gratuita):
   - Crie conta em https://supabase.com
   - Crie um novo projeto
   - Copie a connection string
   - Configure como `DATABASE_URL` no Vercel

### Erro: "Uploads directory not found"

**Solução**: O Vercel não persiste arquivos. Para produção, considere:

- **Vercel Blob Storage** (para arquivos)
- **AWS S3** (alternativa)
- **Cloudinary** (para vídeos)

## 📝 Checklist Pós-Deploy

- [ ] Aplicação está acessível pela URL do Vercel
- [ ] Login e registro funcionam
- [ ] Upload de vídeos funciona (se configurado storage externo)
- [ ] API endpoints respondem corretamente
- [ ] Variáveis de ambiente estão configuradas
- [ ] Banco de dados está configurado (PostgreSQL recomendado)

## 🔄 Atualizações Futuras

Após fazer mudanças no código:

```bash
git add .
git commit -m "sua mensagem de commit"
git push origin main
```

O Vercel fará deploy automaticamente quando você fizer push para a branch `main`.

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do build no dashboard do Vercel
2. Verifique se todas as variáveis de ambiente estão configuradas
3. Certifique-se de que o banco de dados está acessível

