# Global Changes 🌍

Aplicação web desenvolvida para conscientização ambiental e ações ecológicas, alinhada com o **ODS 13 (Ação contra a Mudança Global do Clima)**.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool e dev server ultra-rápido
- **React Router DOM** - Roteamento de páginas
- **Zustand** - Gerenciamento de estado leve e simples
- **CSS-in-JS (Inline Styles)** - Estilização dinâmica e responsiva

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web para Node.js
- **TypeScript** - Tipagem estática
- **Prisma** - ORM moderno para banco de dados
- **SQLite** - Banco de dados relacional embutido
- **Multer** - Middleware para upload de arquivos
- **CORS** - Configuração de Cross-Origin Resource Sharing

### DevOps
- **Vercel** - Plataforma de deploy e hosting
- **Git** - Controle de versão
- **Concurrently** - Execução simultânea de scripts

## 🎨 Design e Animações

### Cores e Tema
- **Cores principais**: Verde claro (#10b981, #059669) e Azul (#0ea5e9, #0284c7)
- **Tema**: ODS 13 - Ação contra a Mudança Global do Clima
- **Estilo**: Design "cute" e vibrante com elementos naturais

### Animações CSS
Todas as animações foram criadas usando `@keyframes` no arquivo `src/index.css`:

1. **`floatCloud`** - Nuvens flutuantes animadas
2. **`bounce`** - Efeito de pulo suave
3. **`sparkle`** - Brilho e cintilação
4. **`pulse`** - Pulsação suave
5. **`shimmer`** - Efeito de brilho deslizante
6. **`rainbow`** - Gradiente animado em arco-íris
7. **`float`** - Flutuação vertical suave
8. **`rotate`** - Rotação contínua
9. **`slideInUp`** - Entrada deslizante de baixo para cima
10. **`fadeIn`** - Fade-in suave
11. **`gradientShift`** - Transição de gradiente animado

### Elementos Visuais
- **Background animado**: Gradiente que muda de cor continuamente
- **Nuvens flutuantes**: Elementos decorativos com animação `floatCloud`
- **Emojis naturais**: 🌍🌿💧🍃🌱 para reforçar o tema ambiental
- **Cards estilizados**: Com blur, bordas arredondadas e sombras suaves
- **Botões animados**: Com efeitos hover e transições suaves

## 📁 Estrutura do Projeto

```
ecopontos-escolar/
├── src/                    # Código fonte do frontend
│   ├── components/         # Componentes React reutilizáveis
│   ├── pages/              # Páginas da aplicação
│   ├── stores/             # Zustand stores (estado global)
│   ├── types/              # TypeScript types
│   └── config.ts           # Configurações do frontend
├── server/                 # Código fonte do backend
│   ├── src/
│   │   ├── routes/         # Rotas da API
│   │   ├── lib/            # Bibliotecas (Prisma)
│   │   └── index.ts        # Entry point do servidor
│   └── prisma/             # Schema e migrations do Prisma
├── public/                 # Arquivos estáticos
└── vercel.json             # Configuração do Vercel
```

## 🗄️ Banco de Dados

### Modelos (Prisma Schema)

1. **User** - Usuários do sistema
   - Campos: id, name, email, role, points, createdAt
   - Relações: submissions, redeemedRewards

2. **Submission** - Submissões de vídeos
   - Campos: id, userId, videoUrl, status, submittedAt
   - Relação: user (User)

3. **Reward** - Recompensas disponíveis
   - Campos: id, name, pointCost
   - Relação: redemptions

4. **RewardRedemption** - Histórico de resgates
   - Campos: id, userId, rewardId, pointsSpent, redeemedAt
   - Relações: user (User), reward (Reward)

## 🔌 API Endpoints

### Autenticação
- `POST /api/login` - Login de usuário
- `POST /api/register` - Registro de novo usuário

### Usuários
- `GET /api/users` - Listar usuários (admin)
- `GET /api/users/:id` - Obter usuário específico
- `GET /api/users/:id/redeemed-rewards` - Recompensas resgatadas por usuário

### Submissões
- `POST /api/submissions` - Criar nova submissão
- `GET /api/submissions` - Listar submissões
- `PATCH /api/submissions/:id/approve` - Aprovar submissão
- `PATCH /api/submissions/:id/reject` - Rejeitar submissão

### Recompensas
- `GET /api/rewards` - Listar recompensas
- `POST /api/rewards` - Criar recompensa (admin)
- `PUT /api/rewards/:id` - Atualizar recompensa (admin)
- `DELETE /api/rewards/:id` - Deletar recompensa (admin)
- `POST /api/rewards/:id/redeem` - Resgatar recompensa

### Vídeos
- `POST /api/videos/upload` - Upload de vídeo
- `GET /uploads/videos/:filename` - Servir vídeo

## 🚀 Como Executar

### Desenvolvimento Local

1. **Instalar dependências:**
```bash
npm install
cd server && npm install
```

2. **Configurar banco de dados:**
```bash
cd server
npx prisma generate
npx prisma migrate dev
```

3. **Executar em desenvolvimento:**
```bash
npm run dev
```
Isso iniciará tanto o frontend (porta 5173) quanto o backend (porta 4000) simultaneamente.

### Build para Produção

```bash
npm run build:prod
```

## 🌐 Deploy no Vercel

### Pré-requisitos
1. Conta no [Vercel](https://vercel.com)
2. Repositório no GitHub
3. Variáveis de ambiente configuradas no Vercel

### Variáveis de Ambiente no Vercel

Configure as seguintes variáveis no painel do Vercel:

- `FRONTEND_URL` - URL do frontend (ex: `https://seu-projeto.vercel.app`)
- `VITE_API_URL` - URL da API (ex: `https://seu-projeto.vercel.app/api`)
- `NODE_ENV` - `production`
- `DATABASE_URL` - URL do banco de dados (para produção, considere PostgreSQL)

### Passos para Deploy

1. **Conecte o repositório ao Vercel:**
   - Acesse o dashboard do Vercel
   - Clique em "New Project"
   - Importe seu repositório do GitHub

2. **Configure o build:**
   - O arquivo `vercel.json` já está configurado
   - Build Command: `npm run build && cd server && npm run prisma:generate && npm run build`
   - Output Directory: `dist`

3. **Configure as variáveis de ambiente:**
   - Adicione todas as variáveis listadas acima
   - Certifique-se de usar URLs de produção

4. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build concluir

### ⚠️ Nota Importante sobre Banco de Dados

O projeto atual usa SQLite, que **não é recomendado para produção no Vercel** porque:
- O sistema de arquivos do Vercel é read-only em produção
- Dados podem ser perdidos entre deploys

**Recomendações para produção:**
- Use PostgreSQL com Prisma (ex: Vercel Postgres, Supabase, Railway)
- Atualize o `schema.prisma` para usar `provider = "postgresql"`
- Configure a variável `DATABASE_URL` no Vercel

## 📝 Funcionalidades

### Para Alunos
- ✅ Cadastro e login
- ✅ Upload de vídeos de ações ecológicas
- ✅ Visualização de pontos acumulados
- ✅ Resgate de recompensas (vale água, vale lanche)
- ✅ Histórico de recompensas resgatadas
- ✅ Dashboard com estatísticas pessoais

### Para Administradores
- ✅ Aprovação/rejeição de vídeos submetidos
- ✅ Gerenciamento de usuários
- ✅ Gerenciamento de recompensas
- ✅ Visualização de banco de dados
- ✅ Estatísticas gerais do sistema

## 🎯 Objetivos do Projeto

Este projeto visa conscientizar estudantes sobre práticas ambientais sustentáveis através de:

1. **Gamificação**: Sistema de pontos por ações ecológicas
2. **Recompensas**: Incentivos tangíveis (vale água, vale lanche)
3. **Visualização**: Dashboard com progresso e histórico
4. **Moderação**: Sistema de aprovação para garantir qualidade das ações

Tudo isso alinhado com os **Objetivos de Desenvolvimento Sustentável (ODS)**, especificamente o **ODS 13: Ação contra a Mudança Global do Clima**.

## 👨‍💻 Desenvolvido com

- React + TypeScript
- Express.js + Prisma
- Vite + Vercel
- Muito amor pelo meio ambiente 🌱

## 📄 Licença

Este projeto é parte de uma iniciativa educacional para conscientização ambiental.
