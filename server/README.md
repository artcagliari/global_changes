# EcoPontos Escolar - Backend

Backend da aplicação EcoPontos Escolar com Node.js, Express, Prisma e SQLite.

## 🚀 Tecnologias

- **Node.js** + **Express** - Servidor web
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados (desenvolvimento)
- **Multer** - Upload de arquivos
- **TypeScript** - Tipagem estática

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# Iniciar servidor de desenvolvimento
npm run dev
```

## 🗄️ Banco de Dados

### Desenvolvimento (SQLite)
```bash
# Criar migração
npx prisma migrate dev --name nome_da_migracao

# Resetar banco
npx prisma migrate reset

# Visualizar banco
npx prisma studio
```

### Produção (PostgreSQL)
1. Configure `DATABASE_URL` no `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ecopontos_db"
```

2. Execute as migrações:
```bash
npx prisma migrate deploy
```

## 🌐 Deploy

### Opção 1: Vercel
1. Conecte o repositório no Vercel
2. Configure as variáveis de ambiente:
   - `DATABASE_URL` (PostgreSQL)
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://seu-dominio.com`

### Opção 2: Railway
1. Conecte o repositório no Railway
2. Adicione PostgreSQL addon
3. Configure as variáveis de ambiente

### Opção 3: DigitalOcean App Platform
1. Conecte o repositório
2. Configure PostgreSQL database
3. Configure variáveis de ambiente

## 📁 Estrutura

```
server/
├── src/
│   ├── routes/
│   │   └── videos.ts      # Rotas de upload
│   └── index.ts           # Servidor principal
├── prisma/
│   ├── schema.prisma     # Schema do banco
│   └── migrations/       # Migrações
├── uploads/
│   └── videos/           # Vídeos enviados
└── package.json
```

## 🔧 Scripts

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm start` - Servidor de produção
- `npm run prisma:migrate` - Executar migrações
- `npm run prisma:generate` - Gerar cliente Prisma

## 📡 API Endpoints

- `POST /api/videos/upload` - Upload de vídeo
- `GET /uploads/videos/:filename` - Servir vídeo
- `GET /health` - Health check

## 🔒 Variáveis de Ambiente

```env
DATABASE_URL="file:./dev.db"
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5174
```
