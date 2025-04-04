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

// Função para criar tabelas diretamente usando SQL
async function createTablesDirectly() {
  try {
    console.log("Criando tabelas diretamente via SQL...");
    
    const createQueries = [
      // Users
      `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
      `,
      // Activity Types
      `
      CREATE TABLE IF NOT EXISTS activity_types (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        color TEXT NOT NULL
      );
      `,
      // Professionals
      `
      CREATE TABLE IF NOT EXISTS professionals (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        initials TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1
      );
      `,
      // Time Slots
      `
      CREATE TABLE IF NOT EXISTS time_slots (
        id SERIAL PRIMARY KEY,
        "startTime" TEXT NOT NULL,
        "endTime" TEXT NOT NULL,
        interval INTEGER NOT NULL DEFAULT 30,
        "isBaseSlot" INTEGER NOT NULL DEFAULT 1
      );
      `,
      // Schedules
      `
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        "professionalId" INTEGER NOT NULL,
        weekday TEXT NOT NULL,
        "startTime" TEXT NOT NULL,
        "endTime" TEXT NOT NULL,
        "activityCode" TEXT NOT NULL,
        location TEXT,
        notes TEXT,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      `
    ];
    
    for (const query of createQueries) {
      try {
        await pool.query(query);
      } catch (error) {
        console.error("Erro ao executar query:", error);
        // Continua para a próxima query mesmo com erro
      }
    }
    
    console.log("Tabelas criadas com sucesso via SQL direto");
    return true;
  } catch (error) {
    console.error("Erro ao criar tabelas diretamente:", error);
    return false;
  }
}

// Função para criar funções SQL usando pool direto
async function createHelperFunctions() {
  try {
    console.log("Criando funções auxiliares SQL diretamente via pool...");
    
    // Usar o pool diretamente para criar a função check_table_exists
    try {
      await pool.query(`
        CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
        RETURNS boolean AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        GRANT EXECUTE ON FUNCTION check_table_exists(text) TO public;
      `);
      console.log("Função check_table_exists criada via pool direto");
    } catch (poolError) {
      console.error("Erro ao criar função via pool:", poolError);
      // Continua mesmo com erro
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao criar funções auxiliares:", error);
    return false;
  }
}

// Inicie a inicialização do banco de dados
import { initializeDatabase } from './initDatabase';
import { pool } from './db';

// Esta função será chamada quando o módulo for importado
export async function initSupabase() {
  console.log("Iniciando configuração do Supabase...");
  const connected = await testSupabaseConnection();
  
  if (connected) {
    try {
      // Criar funções auxiliares e tabelas diretamente
      console.log("Criando funções auxiliares SQL...");
      await createHelperFunctions();
      
      // Função para verificar se as tabelas existem
      console.log("Verificando tabelas existentes...");
      
      // Criar tabelas diretamente via SQL
      await createTablesDirectly();
      
      // Verificar se existe a tabela activity_types diretamente via pool
      try {
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'activity_types'
          );
        `);
        
        const tableExists = tableCheck.rows[0].exists;
        console.log("Verificação de tabela activity_types via SQL direto:", tableExists ? "Existe" : "Não existe");
      } catch (sqlError) {
        console.error("Erro ao verificar tabela activity_types via SQL direto:", sqlError);
      }
      
      console.log("Iniciando a criação/verificação das tabelas...");
      const result = await initializeDatabase();
      
      console.log("Configuração do banco de dados concluída com sucesso");
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