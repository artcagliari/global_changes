# 📦 Guia de Migração: SQLite → PostgreSQL

Este guia preserva todos os seus dados durante a migração.

## ⚠️ IMPORTANTE
- Faça backup do arquivo `server/prisma/dev.db` antes de começar!
- Execute tudo localmente primeiro para testar

## 📋 Passo a Passo

### 1. Criar Banco PostgreSQL

**Opção A: Vercel Postgres (Recomendado)**
1. Dashboard Vercel → Seu projeto → "Storage" → "Create Database"
2. Escolha "Postgres"
3. Copie a connection string (aparece em "Settings" → "Environment Variables")

**Opção B: Supabase (Gratuito)**
1. Crie conta em https://supabase.com
2. Crie novo projeto
3. Settings → Database → Connection string
4. Copie a connection string

### 2. Instalar Dependência (se necessário)

```bash
cd server
npm install better-sqlite3 @types/better-sqlite3
```

### 3. Configurar DATABASE_URL

```bash
# No terminal, exporte a URL do PostgreSQL
export DATABASE_URL="postgresql://usuario:senha@host:porta/database"
```

Ou crie um arquivo `.env` no `server/`:
```
DATABASE_URL="postgresql://usuario:senha@host:porta/database"
```

### 4. Criar Schema PostgreSQL

```bash
cd server

# Copiar schema para PostgreSQL
cp prisma/schema.prisma prisma/schema.sqlite.backup.prisma
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```

### 5. Criar Tabelas no PostgreSQL

```bash
cd server
npx prisma migrate dev --name init_postgresql
```

### 6. Migrar Dados

```bash
cd server

# Instalar better-sqlite3 se ainda não instalou
npm install better-sqlite3 @types/better-sqlite3

# Executar script de migração
npx ts-node-esm prisma/migrate-data.ts
```

### 7. Verificar Dados

```bash
cd server
npx prisma studio
```

Abra o Prisma Studio e verifique se todos os dados foram migrados.

### 8. Atualizar Vercel

1. **No dashboard do Vercel:**
   - Settings → Environment Variables
   - Adicione `DATABASE_URL` com a connection string do PostgreSQL

2. **O schema.prisma já está atualizado** (se seguiu o passo 4)

3. **Fazer deploy:**
   - O Vercel vai executar `prisma:generate` automaticamente
   - As migrations serão aplicadas automaticamente

### 9. Testar

Após o deploy, teste:
- Login
- Upload de vídeos
- Resgate de recompensas
- Todas as funcionalidades

## 🔄 Reverter (se necessário)

Se algo der errado, você pode voltar:

```bash
cd server
cp prisma/schema.sqlite.backup.prisma prisma/schema.prisma
npx prisma generate
```

E continue usando SQLite localmente.

## ✅ Checklist

- [ ] Backup do `dev.db` feito
- [ ] Banco PostgreSQL criado
- [ ] `DATABASE_URL` configurado
- [ ] Schema atualizado para PostgreSQL
- [ ] Migrations executadas
- [ ] Dados migrados
- [ ] Dados verificados no Prisma Studio
- [ ] `DATABASE_URL` configurado no Vercel
- [ ] Deploy realizado
- [ ] Funcionalidades testadas

## 🆘 Problemas Comuns

**Erro: "DATABASE_URL not configured"**
- Certifique-se de exportar a variável ou criar `.env`

**Erro: "Connection refused"**
- Verifique se a connection string está correta
- Verifique se o banco está acessível publicamente

**Dados não aparecem**
- Verifique os logs do script de migração
- Confirme que o `dev.db` tem dados
- Verifique no Prisma Studio




