import express from 'express';
import path from 'path';
import { log } from './vite';
import fs from 'fs';

export function setupStaticServing(app: express.Express) {
  // Primeiramente, verificamos o diretório de build para produção
  const distPath = path.resolve(process.cwd(), 'dist/public');
  const indexPath = path.join(distPath, 'index.html');
  
  // Verificar se o diretório dist/public existe
  if (!fs.existsSync(distPath)) {
    log(`AVISO: Diretório de build não encontrado: ${distPath}`);
    log('Tentando buscar em caminho alternativo...');
    
    // Tentar caminho alternativo
    const altDistPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(altDistPath)) {
      log(`Encontrado diretório alternativo: ${altDistPath}`);
      serveStaticFiles(app, altDistPath);
      return;
    }
    
    log('Não foi possível encontrar diretório de build. O frontend não será servido corretamente.');
    return;
  }
  
  serveStaticFiles(app, distPath);
}

function serveStaticFiles(app: express.Express, distPath: string) {
  const indexPath = path.join(distPath, 'index.html');
  
  // Verificar se o arquivo index.html existe
  if (!fs.existsSync(indexPath)) {
    log(`ALERTA: Arquivo index.html não encontrado em: ${indexPath}`);
    log('O frontend não será servido corretamente');
    return;
  }
  
  log(`Servindo arquivos estáticos de: ${distPath}`);
  
  // Servir arquivos estáticos - configuração detalhada
  app.use(express.static(distPath, {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (path.extname(filePath) === '.html') {
        // Sem cache para arquivos HTML
        res.setHeader('Cache-Control', 'no-cache');
      } else if (path.extname(filePath).match(/(\.js|\.css|\.svg|\.ttf|\.woff|\.woff2|\.eot)$/)) {
        // Cache para recursos estáticos
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    }
  }));
  
  // Adicionar middleware para debug de rotas
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api/') && req.method === 'GET') {
      log(`Recebendo requisição para: ${req.path} [${req.method}]`);
    }
    next();
  });
  
  // Enviar index.html para todas as rotas que não são da API (Single Page Application)
  app.get('*', (req, res, next) => {
    // Ignorar rotas de API
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Verificar se o arquivo existe para recursos estáticos
    const filePath = path.join(distPath, req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return next();
    }
    
    log(`Servindo index.html para rota SPA: ${req.path}`);
    res.sendFile(indexPath);
  });
}