# 🚀 Passo a Passo: Migrar para PostgreSQL

## 📋 Pré-requisitos
- Conta no Vercel (já tem)
- Node.js instalado (já tem)
- Dados do SQLite que quer preservar

---

## PASSO 1: Criar Banco PostgreSQL no Vercel

### 1.1 Acesse o Dashboard do Vercel
- Vá em: https://vercel.com/dashboard
- Selecione seu projeto **global-changes**

### 1.2 Criar o Banco
1. No menu lateral, clique em **"Storage"**
2. Clique em **"Create Database"**
3. Escolha **"Postgres"**
4. Dê um nome (ex: `global-changes-db`)
5. Escolha a região (escolha a mais próxima)
6. Clique em **"Create"**

### 1.3 Copiar Connection String
1. Após criar, vá em **"Settings"** → **"Environment Variables"**
2. Procure por `POSTGRES_URL` ou `DATABASE_URL`
3. **COPIE ESSA URL** (será algo como: `postgres://...`)
4. Guarde essa URL, você vai precisar!

---

## PASSO 2: Preparar Ambiente Local

### 2.1 Instalar Dependências
Abra o terminal e execute:

```bash
cd /Users/artcagliari/Documents/ecopontos-escolar/ecopontos-escolar/server
npm install better-sqlite3 @types/better-sqlite3
```

### 2.2 Criar Arquivo .env
Crie um arquivo `.env` na pasta `server/`:

```bash
cd /Users/artcagliari/Documents/ecopontos-escolar/ecopontos-escolar/server
nano .env
```

Cole isso no arquivo (substitua pela sua URL do Vercel):
```
DATABASE_URL="postgresql://usuario:senha@host:porta/database"
```

**IMPORTANTE:** Cole a URL que você copiou do Vercel!

Salve e feche (Ctrl+X, depois Y, depois Enter)

---

## PASSO 3: Atualizar Schema para PostgreSQL

### 3.1 Fazer Backup do Schema Atual
```bash
cd /Users/artcagliari/Documents/ecopontos-escolar/ecopontos-escolar/server
cp prisma/schema.prisma prisma/schema.sqlite.backup.prisma
```

### 3.2 Substituir Schema
```bash
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```

---

## PASSO 4: Criar Tabelas no PostgreSQL

### 4.1 Gerar Prisma Client
```bash
cd /Users/artcagliari/Documents/ecopontos-escolar/ecopontos-escolar/server
npx prisma generate
```

### 4.2 Criar Tabelas (Migrations)
```bash
npx prisma migrate dev --name init_postgresql
```

Quando perguntar "Create a new migration? (Y/n)", digite **Y** e Enter.

Isso vai criar todas as tabelas no PostgreSQL.

---

## PASSO 5: Migrar Dados do SQLite para PostgreSQL

### 5.1 Verificar se o dev.db existe
```bash
ls -la prisma/dev.db
```

Se existir, continue. Se não existir, você não tem dados para migrar (pode pular para o Passo 6).

### 5.2 Executar Script de Migração
```bash
cd /Users/artcagliari/Documents/ecopontos-escolar/ecopontos-escolar/server
npx ts-node-esm prisma/migrate-data.ts
```

Você deve ver algo como:
```
🔄 Iniciando migração de dados...
✅ Conectado ao SQLite local
✅ Conectado ao PostgreSQL
📦 Migrando usuários...
   ✅ X usuários migrados
📦 Migrando recompensas...
   ✅ X recompensas migradas
...
✅ Migração concluída com sucesso!
```

---

## PASSO 6: Verificar Dados Migrados

### 6.1 Abrir Prisma Studio
```bash
cd /Users/artcagliari/Documents/ecopontos-escolar/ecopontos-escolar/server
npx prisma studio
```

Isso vai abrir o navegador. Você verá todas as tabelas e pode verificar se os dados estão lá!

Feche quando terminar (Ctrl+C no terminal).

---

## PASSO 7: Configurar no Vercel

### 7.1 Adicionar Variável de Ambiente
1. No dashboard do Vercel, vá em **"Settings"** → **"Environment Variables"**
2. Clique em **"Add New"**
3. Nome: `DATABASE_URL`
4. Valor: Cole a mesma URL do PostgreSQL que você usou antes
5. Marque **"Production"**, **"Preview"** e **"Development"**
6. Clique em **"Save"**

### 7.2 Verificar se o Schema está Correto
O arquivo `schema.prisma` já deve estar com PostgreSQL. Verifique:

```bash
cd /Users/artcagliari/Documents/ecopontos-escolar/ecopontos-escolar/server
cat prisma/schema.prisma | head -10
```

Deve mostrar:
```
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Se não estiver assim, execute novamente:
```bash
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```

---

## PASSO 8: Fazer Deploy no Vercel

### 8.1 Fazer Commit das Mudanças
```bash
cd /Users/artcagliari/Documents/ecopontos-escolar/ecopontos-escolar
git add -A
git commit -m "feat: Migrar para PostgreSQL"
git push origin main
```

### 8.2 Aguardar Deploy Automático
O Vercel vai detectar o push e fazer deploy automaticamente.

### 8.3 Verificar Logs
1. No dashboard do Vercel, vá em **"Deployments"**
2. Clique no último deploy
3. Veja os logs para garantir que não há erros

---

## PASSO 9: Testar

### 9.1 Testar Login
1. Acesse seu site no Vercel
2. Tente fazer login
3. Deve funcionar normalmente!

### 9.2 Testar Funcionalidades
- ✅ Login/Registro
- ✅ Upload de vídeos
- ✅ Resgate de recompensas
- ✅ Dashboard
- ✅ Todas as funcionalidades

---

## ✅ Checklist Final

- [ ] Banco PostgreSQL criado no Vercel
- [ ] DATABASE_URL configurado no .env local
- [ ] Schema atualizado para PostgreSQL
- [ ] Tabelas criadas (migrations executadas)
- [ ] Dados migrados do SQLite
- [ ] Dados verificados no Prisma Studio
- [ ] DATABASE_URL configurado no Vercel
- [ ] Deploy realizado
- [ ] Funcionalidades testadas

---

## 🆘 Problemas Comuns

### Erro: "DATABASE_URL not configured"
- Verifique se criou o arquivo `.env` na pasta `server/`
- Verifique se a URL está correta

### Erro: "Connection refused"
- Verifique se a URL do PostgreSQL está correta
- Verifique se o banco está acessível publicamente no Vercel

### Erro: "dev.db não encontrado"
- Se você não tem dados para migrar, pode pular o Passo 5
- O banco será criado vazio, mas funcionará

### Erro no Deploy: "Prisma generate failed"
- Verifique se o `schema.prisma` está com PostgreSQL
- Verifique se o `DATABASE_URL` está configurado no Vercel

---

## 📞 Precisa de Ajuda?

Se algo der errado:
1. Verifique os logs do Vercel
2. Verifique se seguiu todos os passos
3. Confirme que o `DATABASE_URL` está correto

**Lembre-se:** Seu SQLite local continua funcionando! Você pode voltar a usar SQLite localmente se precisar.

