# ⚠️ Problema com SQLite no Vercel

## Problema
SQLite **não funciona** no Vercel porque:
- O sistema de arquivos do Vercel é **read-only** em produção
- SQLite precisa escrever no disco para funcionar
- Isso causa erro 500 ao tentar acessar o banco de dados

## Solução: Migrar para PostgreSQL

### Opção 1: Vercel Postgres (Recomendado)

1. **No dashboard do Vercel:**
   - Vá em seu projeto → "Storage" → "Create Database"
   - Escolha "Postgres"
   - Crie o banco

2. **Copie a connection string:**
   - Vá em "Settings" → "Environment Variables"
   - Copie a variável `POSTGRES_URL` ou `DATABASE_URL`

3. **Atualize o schema.prisma:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

4. **Execute migrations:**
```bash
cd server
npx prisma migrate deploy
```

### Opção 2: Supabase (Gratuito)

1. Crie conta em https://supabase.com
2. Crie um novo projeto
3. Copie a connection string (formato: `postgresql://...`)
4. Configure como `DATABASE_URL` no Vercel
5. Atualize o schema.prisma como acima
6. Execute migrations

### Opção 3: Railway, Neon, ou PlanetScale

Qualquer serviço de PostgreSQL gerenciado funciona. Siga os passos acima.

## Após migrar

1. Configure `DATABASE_URL` no Vercel
2. Faça redeploy
3. O erro 500 deve ser resolvido




