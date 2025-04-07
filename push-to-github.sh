#!/bin/bash

# Script para enviar as alterações para o GitHub
echo "Iniciando push para o GitHub..."

# Configurando o Git se necessário
if [ -z "$(git config --global user.email)" ]; then
  echo "Configurando email do Git..."
  git config --global user.email "automated@example.com"
fi
if [ -z "$(git config --global user.name)" ]; then
  echo "Configurando nome do Git..."
  git config --global user.name "Automated Commit"
fi

# Adicionando arquivos se houver mudanças
git add -A
git status

# Fazendo commit se houver mudanças
if git diff-index --quiet HEAD --; then
  echo "Não há mudanças para fazer commit"
else
  echo "Fazendo commit das mudanças..."
  git commit -m "Melhorias para deploy no Vercel: rotas API otimizadas e diagnóstico aprimorado"
fi

# Tentando fazer push
echo "Enviando para o GitHub..."
git push origin main

# Verificando resultado
if [ $? -eq 0 ]; then
  echo "Push concluído com sucesso!"
else
  echo "Erro ao fazer push. Tentando com --force..."
  # Não vamos usar force push por segurança
  echo "O push com force não foi realizado por questões de segurança."
  echo "Por favor, realize o push manualmente ou resolva o conflito."
fi

echo "Script concluído!"