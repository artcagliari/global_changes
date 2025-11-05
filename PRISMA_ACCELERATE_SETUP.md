# 🚀 Configuração do Prisma Accelerate no Vercel

## O que é Prisma Accelerate?

Prisma Accelerate é uma camada de cache e otimização que melhora significativamente a performance do Prisma em ambientes serverless como o Vercel.

## Como Configurar

### 1. Obter a DATABASE_URL do Prisma Accelerate

Você já tem duas URLs:

#### URL PostgreSQL Direta:
```
postgres://de868de246bf1d3a6a60060f13fa6f4974be311097d8a6635ab91e7207c761bc:sk_tJzBUPeqiU0g3TIwcp4yZ@db.prisma.io:5432/postgres?sslmode=require
```

#### URL Prisma Accelerate:
```
prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza185Y3gwbkVZa1dpa043d1dpbm9hY28iLCJhcGlfa2V5IjoiMDFLOUIzUFE1MjJENDFESDNaMUg5NVNTS0giLCJ0ZW5hbnRfaWQiOiJkZTg2OGRlMjQ2YmYxZDNhNmE2MDA2MGYxM2ZhNmY0OTc0YmUzMTEwOTdkOGE2NjM1YWI5MWU3MjA3Yzc2MWJjIiwiaW50ZXJuYWxfc2VjcmV0IjoiOTQ3Yzg0NmQtODE1Ni00NjA2LTkzNDctZmFhMzkxMTJmNmM0In0.QTYtPD0ZKU5SXVbRe8Nn4dg4NoHypYT50zqmN6T5VxA
```

### 2. Configurar no Vercel

1. Vá em **Settings** → **Environment Variables**
2. Adicione ou edite a variável `DATABASE_URL`:
   - **Para usar Accelerate (recomendado)**: Use a URL que começa com `prisma+postgres://`
   - **Para usar PostgreSQL direto**: Use a URL que começa com `postgres://`

### 3. Instalar a Extensão (Opcional)

Se quiser usar o Accelerate com extensões adicionais, você pode instalar:

```bash
cd server
npm install @prisma/extension-accelerate
```

**Nota**: O código atual já detecta automaticamente se você está usando Accelerate pela URL. Se a URL começar com `prisma+postgres://`, o código tentará carregar o Accelerate automaticamente.

## Como Funciona

O código em `server/src/lib/prisma.ts` detecta automaticamente:

- Se `DATABASE_URL` começa com `prisma+postgres://` → Usa Accelerate
- Se `DATABASE_URL` começa com `postgres://` → Usa PostgreSQL direto

## Benefícios do Accelerate

1. **Cache automático**: Queries frequentes são cacheadas
2. **Conexões otimizadas**: Menos overhead de conexão
3. **Melhor performance**: Especialmente em ambientes serverless
4. **Redução de custos**: Menos conexões ao banco

## Testando

Após configurar, você verá nos logs:

```
✅ DATABASE_URL configurado (Accelerate)
🚀 Prisma Accelerate ativado (cache e otimizações)
```

Ou se não estiver usando Accelerate:

```
✅ DATABASE_URL configurado (PostgreSQL direto)
```

## Troubleshooting

Se você ver:

```
⚠️  Não foi possível carregar Prisma Accelerate
```

Isso significa que a extensão não está instalada, mas o sistema continuará funcionando normalmente com PostgreSQL direto.

