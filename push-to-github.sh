#!/bin/bash

# Script para enviar as alterações para o GitHub
echo "Iniciando push para o GitHub..."

# Configurando o Git se necessário
if [ -z "$(git config --global user.email)" ]; then
  echo "Configurando email do Git..."
  git config --global user.email "lucasleal.developer@gmail.com"
fi
if [ -z "$(git config --global user.name)" ]; then
  echo "Configurando nome do Git..."
  git config --global user.name "lucasleal-developer"
fi

# Adicionando arquivos se houver mudanças
git add -A
git status

# Fazendo commit se houver mudanças
if git diff-index --quiet HEAD --; then
  echo "Não há mudanças para fazer commit"
else
  echo "Fazendo commit das mudanças..."
  COMMIT_MSG="Atualização: $(date +%d-%m-%Y)"
  git commit -m "$COMMIT_MSG"
fi

# Tentando fazer push
echo "Enviando para o GitHub..."
git pull --rebase origin main && git push origin main

# Verificando resultado
if [ $? -eq 0 ]; then
  echo "Push concluído com sucesso!"
else
  echo "Erro ao fazer push. Verifique as credenciais ou use o script push-with-token.sh."
  echo "O push com --force não foi realizado por questões de segurança."
  echo "Por favor, resolva o conflito ou use um token para autenticação."
fi

echo "Script concluído!"
