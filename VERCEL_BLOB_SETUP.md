# 🔧 Configuração do Vercel Blob Storage

## ⚠️ IMPORTANTE: Variável de Ambiente Obrigatória

Para que o upload de vídeos funcione, você **DEVE** configurar a variável de ambiente `BLOB_READ_WRITE_TOKEN` no Vercel.

## 📋 Passo a Passo

### 1. Acesse o Dashboard do Vercel
- Vá em: https://vercel.com/dashboard
- Selecione seu projeto

### 2. Configure a Variável de Ambiente

1. Vá em: **Settings** → **Environment Variables**
2. Clique em **Add New**
3. Configure:

   **Nome:**
   ```
   BLOB_READ_WRITE_TOKEN
   ```

   **Valor:**
   ```
   vercel_blob_rw_h8TXpLMkzLdnNvRf_5GhRho9t2o44e4tZkAWWuZb3njUi9c
   ```

   **Environment:**
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
   (Marque TODOS)

4. Clique em **Save**

### 3. Faça Redeploy

Após adicionar a variável:
1. Vá em **Deployments**
2. Clique nos **3 pontos** do último deploy
3. Clique em **Redeploy**
4. Ou faça um novo commit/push

## ✅ Verificação

Após o redeploy, teste o upload de vídeo. Se ainda der erro, verifique:
- ✅ A variável está configurada corretamente
- ✅ O redeploy foi feito após adicionar a variável
- ✅ O token está correto (sem espaços extras)

## 🔍 Como Verificar se Está Configurado

Se a variável não estiver configurada, você verá o erro:
```
BLOB_READ_WRITE_TOKEN não configurado
```

Se estiver configurada mas ainda der erro, verifique os logs do Vercel para mais detalhes.

