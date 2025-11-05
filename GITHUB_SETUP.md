# 🔐 Configuração de Autenticação GitHub

## Opção 1: Personal Access Token (Recomendado)

1. **Criar Token:**
   - Acesse: https://github.com/settings/tokens/new
   - Nome: `global-changes-push`
   - Expiração: escolha (recomendo 90 dias ou sem expiração)
   - Permissões: marque `repo` (acesso completo aos repositórios)
   - Clique em "Generate token"
   - **COPIE O TOKEN** (você só verá uma vez!)

2. **Fazer Push com Token:**
```bash
cd /Users/artcagliari/Documents/ecopontos-escolar/ecopontos-escolar

# Usar token no push (substitua SEU_TOKEN pelo token copiado)
git push https://SEU_TOKEN@github.com/artcagliari/global_changes.git main
```

## Opção 2: SSH (Mais Seguro - Configuração Única)

1. **Gerar Chave SSH:**
```bash
ssh-keygen -t ed25519 -C "seu-email@example.com"
# Pressione Enter para aceitar local padrão
# Digite uma senha (opcional)
```

2. **Adicionar Chave ao GitHub:**
```bash
# Copiar chave pública
cat ~/.ssh/id_ed25519.pub
# Copie toda a saída
```

3. **No GitHub:**
   - Acesse: https://github.com/settings/keys
   - Clique em "New SSH key"
   - Cole a chave pública
   - Salve

4. **Trocar Remote para SSH:**
```bash
cd /Users/artcagliari/Documents/ecopontos-escolar/ecopontos-escolar
git remote set-url origin git@github.com:artcagliari/global_changes.git
git push -u origin main
```

## Opção 3: GitHub CLI (Mais Fácil)

1. **Instalar GitHub CLI:**
```bash
brew install gh
```

2. **Fazer Login:**
```bash
gh auth login
# Siga as instruções
```

3. **Fazer Push:**
```bash
cd /Users/artcagliari/Documents/ecopontos-escolar/ecopontos-escolar
git push -u origin main
```

## ✅ Verificar se Funcionou

Após o push, acesse: https://github.com/artcagliari/global_changes

Você deve ver todos os arquivos do projeto lá!

