# 🧪 Como Testar Upload e Register Localmente

## ✅ Correções Aplicadas

1. **Upload de Vídeo:**
   - ✅ Corrigido erro de indentação
   - ✅ Status corrigido para 'PENDING' (maiúsculas)
   - ✅ Logs de debug adicionados
   - ✅ Melhor tratamento de erros

2. **Registro de Usuário:**
   - ✅ Logs de debug adicionados
   - ✅ Melhor tratamento de erros
   - ✅ Validações melhoradas

## 🚀 Como Testar

### 1. Iniciar o Servidor com Logs

```bash
cd server
VERCEL=1 VERCEL_URL=localhost-test BLOB_READ_WRITE_TOKEN=vercel_blob_rw_h8TXpLMkzLdnNvRf_5GhRho9t2o44e4tZkAWWuZb3njUi9c npm run dev:vercel
```

### 2. Testar Registro

Em outro terminal:

```bash
cd server
npm run test:register
```

**O que você deve ver:**
```
📝 Recebendo requisição de criação de usuário
💾 Criando usuário no banco de dados...
✅ Usuário criado com sucesso: [id] [email]
```

### 3. Testar Upload

**Opção A: Pelo Frontend (Recomendado)**

1. Inicie o frontend:
```bash
npm run dev
```

2. Acesse `http://localhost:5173`
3. Faça login (ou registre um novo usuário)
4. Vá em "Enviar Ação Ecológica"
5. Selecione um vídeo e envie

**O que você deve ver nos logs do servidor:**
```
📤 Recebendo requisição de upload de vídeo
   File recebido: Sim
   Arquivo: video.mp4 (2.45 MB)
🔍 Verificando usuário: [userId]
✅ Usuário encontrado: [nome] [email]
📤 Fazendo upload para Vercel Blob: videos/video-...
✅ Upload para Blob concluído: https://...
💾 Salvando submissão no banco de dados...
✅ Submissão criada com sucesso: [id]
```

**Opção B: Com curl**

```bash
# Primeiro, registre um usuário e pegue o ID
cd server
npm run test:register

# Use o ID retornado no comando abaixo
curl -X POST http://localhost:4000/api/videos/upload \
  -F "video=@caminho/para/seu/video.mp4" \
  -F "userId=ID_DO_USUARIO_AQUI"
```

## 🔍 Verificar se Funcionou

### Registro:
- ✅ Usuário aparece no banco de dados
- ✅ Logs mostram "Usuário criado com sucesso"
- ✅ Frontend mostra mensagem de sucesso

### Upload:
- ✅ Vídeo aparece no Blob Storage (dashboard Vercel)
- ✅ Submissão aparece no banco de dados
- ✅ URL do vídeo é uma URL completa do Blob
- ✅ Vídeo aparece na lista de submissões (Dashboard/Admin)

## 🐛 Troubleshooting

### Registro não funciona:
1. Verifique os logs do servidor - eles mostrarão o erro exato
2. Verifique se o banco de dados está conectado
3. Verifique se o email já existe (erro 409)

### Upload não funciona:
1. Verifique os logs do servidor - eles mostrarão cada etapa
2. Verifique se `BLOB_READ_WRITE_TOKEN` está configurado
3. Verifique se o usuário existe (userId correto)
4. Verifique se o arquivo está sendo recebido (tamanho > 0)

### Vídeo não aparece:
1. Verifique se a submissão foi criada no banco
2. Verifique se a URL do Blob está correta
3. Verifique os logs para erros do Prisma

## 📝 Logs Importantes

Os logs agora mostram:
- ✅ Cada etapa do processo
- ✅ Dados recebidos
- ✅ Erros detalhados
- ✅ Status de cada operação

**Use os logs para diagnosticar problemas!**

