import express from 'express';
import path from 'path';
import { log } from './vite';
import fs from 'fs';

export function setupStaticServing(app: express.Express) {
  const distPath = path.resolve(process.cwd(), 'dist/public');
  
  // Verificar se o diretório dist/public existe
  if (!fs.existsSync(distPath)) {
    log(`ALERTA: Diretório de build não encontrado: ${distPath}`);
    log('O frontend não será servido corretamente');
    return;
  }
  
  // Verificar se o arquivo index.html existe no diretório
  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    log(`ALERTA: Arquivo index.html não encontrado em: ${indexPath}`);
    log('O frontend não será servido corretamente');
    return;
  }
  
  log(`Servindo arquivos estáticos de: ${distPath}`);
  
  // Servir arquivos estáticos
  app.use(express.static(distPath));
  
  // Enviar index.html para todas as rotas que não são da API
  app.get('*', (req, res, next) => {
    // Ignorar rotas de API
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    log(`Servindo index.html para rota: ${req.path}`);
    res.sendFile(indexPath);
  });
}