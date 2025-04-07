#!/bin/bash

# Configurações de usuário para o commit
git config --global user.name "Lucas Leal Developer"
git config --global user.email "lucasleal.developer@gmail.com"

# Verificar status atual
echo "Status do repositório:"
git status

# Adicionar todas as alterações
git add -A
git status

# Criar mensagem de commit
COMMIT_MSG="Melhorias para deploy no Vercel: rotas API otimizadas e diagnóstico aprimorado"

# Fazer commit (se houver alterações)
if git diff-index --quiet HEAD --; then
  echo "Não há alterações para commit"
else
  echo "Fazendo commit das alterações..."
  git commit -m "$COMMIT_MSG"
fi

# Configurar remote com token
REPO_URL="https://$GITHUB_TOKEN@github.com/lucasleal-developer/projetovercel.git"
git remote set-url origin "$REPO_URL"

# Verificar se o remote está corretamente configurado (sem mostrar o token)
echo "Remotes configurados:"
git remote -v | sed 's/https:\/\/[^@]*@/https:\/\/****@/g'

# Realizar pull com rebase para evitar conflitos
echo "Tentando pull com rebase para sincronizar alterações..."
git pull --rebase origin main

# Tentar fazer push
echo "Enviando alterações para o GitHub..."
git push origin main
