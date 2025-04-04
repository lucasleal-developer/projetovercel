import { createClient } from '@supabase/supabase-js';

// Essas variáveis de ambiente precisarão ser configuradas na Vercel
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

// Verificação para garantir que as variáveis de ambiente estão configuradas
if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: As variáveis de ambiente SUPABASE_URL e SUPABASE_KEY devem ser configuradas.');
  // Em produção, isso poderia causar uma falha de inicialização
}

// Criando o cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Função para verificar a conexão com o Supabase
export async function testSupabaseConnection() {
  try {
    // Apenas verifica se pode conectar ao Supabase sem depender de tabelas
    const { error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error.message);
      return false;
    }
    
    console.log('Conexão com o Supabase estabelecida com sucesso!');
    return true;
  } catch (err) {
    console.error('Exceção ao testar conexão com o Supabase:', err);
    return false;
  }
}

// Inicie a inicialização do banco de dados
import { initializeDatabase } from './initDatabase';

// Esta função será chamada quando o módulo for importado
export async function initSupabase() {
  console.log("Iniciando configuração do Supabase...");
  const connected = await testSupabaseConnection();
  
  if (connected) {
    try {
      console.log("Iniciando a criação/verificação das tabelas...");
      const result = await initializeDatabase();
      return result;
    } catch (err) {
      console.error("Falha na inicialização do banco de dados:", err);
      return false;
    }
  } else {
    console.error("Não foi possível inicializar o banco de dados porque a conexão falhou");
    return false;
  }
}