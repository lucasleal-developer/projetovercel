#!/bin/bash

# Script para preparar o build para deploy no Vercel
echo "Iniciando build para Vercel..."

# Executar o build padrão
npm run build

# Copiar arquivos estáticos
echo "Copiando arquivos estáticos..."
mkdir -p dist/assets
cp -r dist/public/* dist/ || true
cp client/index.html dist/ || true

# Verificar se os arquivos necessários estão presentes
echo "Verificando arquivos:"
if [ -f dist/index.html ]; then
  echo "✓ index.html está presente"
else
  echo "✗ index.html não foi encontrado!"
fi

if [ -d dist/assets ]; then
  echo "✓ Diretório assets está presente"
else
  echo "✗ Diretório assets não foi encontrado!"
fi

echo "Build para Vercel concluído!"