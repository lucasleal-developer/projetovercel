#!/bin/bash

# Script para acionar o deploy no Vercel após um push para o GitHub
echo "Enviando solicitação de deploy para o Vercel..."

# URL do Deploy Hook fornecido pelo Vercel
DEPLOY_HOOK_URL="https://api.vercel.com/v1/integrations/deploy/prj_XR6MIRdbqeLvm0FZjY0eMv3eR4aZ/Exk2kVEeF5"

# Fazendo a requisição HTTP para iniciar o deploy
echo "Acionando webhook de deploy do Vercel..."
RESPONSE=$(curl -s -X POST "$DEPLOY_HOOK_URL")

# Verificando resposta
if [[ $RESPONSE == *"jobId"* ]]; then
  echo "✅ Deploy iniciado com sucesso no Vercel!"
  echo "Você pode acompanhar o progresso no dashboard do Vercel."
  echo "Resposta: $RESPONSE"
else
  echo "❌ Erro ao acionar o deploy."
  echo "Resposta: $RESPONSE"
  exit 1
fi

echo "Script concluído!"
