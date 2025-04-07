// Script para preparar o build para deploy no Vercel
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log("Iniciando build para Vercel...");

// Executar o build padrão
try {
  console.log("Executando npm run build...");
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error("Erro ao executar o build:", error);
  process.exit(1);
}

// Copiar arquivos estáticos
console.log("Copiando arquivos estáticos...");

// Criar diretório de assets se não existir
try {
  if (!fs.existsSync(path.resolve('dist/assets'))) {
    fs.mkdirSync(path.resolve('dist/assets'), { recursive: true });
  }
} catch (error) {
  console.error("Erro ao criar diretório de assets:", error);
}

// Copiar arquivos do diretório public para o dist
try {
  if (fs.existsSync(path.resolve('dist/public'))) {
    const files = fs.readdirSync(path.resolve('dist/public'));
    for (const file of files) {
      const sourcePath = path.resolve(`dist/public/${file}`);
      const targetPath = path.resolve(`dist/${file}`);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        if (!fs.existsSync(targetPath)) {
          fs.mkdirSync(targetPath, { recursive: true });
        }
        execSync(`cp -r "${sourcePath}/"* "${targetPath}/"`);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  } else {
    console.warn("Diretório dist/public não encontrado!");
  }
} catch (error) {
  console.error("Erro ao copiar arquivos:", error);
}

// Copiar index.html se necessário
try {
  if (!fs.existsSync(path.resolve('dist/index.html')) && 
      fs.existsSync(path.resolve('client/index.html'))) {
    fs.copyFileSync(
      path.resolve('client/index.html'), 
      path.resolve('dist/index.html')
    );
  }
} catch (error) {
  console.error("Erro ao copiar index.html:", error);
}

// Verificar se os arquivos necessários estão presentes
console.log("Verificando arquivos:");
if (fs.existsSync(path.resolve('dist/index.html'))) {
  console.log("✓ index.html está presente");
} else {
  console.log("✗ index.html não foi encontrado!");
}

if (fs.existsSync(path.resolve('dist/assets'))) {
  console.log("✓ Diretório assets está presente");
} else {
  console.log("✗ Diretório assets não foi encontrado!");
}

console.log("Build para Vercel concluído!");