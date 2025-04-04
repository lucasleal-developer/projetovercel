import { supabase } from './supabase';
import { defaultActivityTypes } from '@shared/schema';
import { pool } from './db';

// Função para criar as tabelas e inicializar dados
export async function initializeDatabase() {
  console.log("Iniciando criação das tabelas no banco de dados...");
  
  try {
    // Vamos usar a conexão direta do PostgreSQL para criar as tabelas, já importada do db.ts
    
    // Primeiro, vamos tentar o método SQL direto
    try {
      await createTablesWithSQL(pool);
      console.log("Tabelas criadas com sucesso via conexão direta PostgreSQL");
      await initializeData();
      console.log("Dados inicializados com sucesso");
      return true;
    } catch (error) {
      console.error("Erro ao criar tabelas via SQL direto:", error);
      console.log("Tentando método alternativo via Supabase API...");
      
      // Fallback para o método original se o SQL direto falhar
      try {
        await createTablesWithSupabaseRPC();
        await initializeData();
        return true;
      } catch (apiError) {
        console.error("Erro ao criar tabelas via Supabase API:", apiError);
        return false;
      }
    }
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
    return false;
  }
}

// Função para criar tabelas via direct SQL com Postgres
async function createTablesWithSQL(pool: any) {
  try {
    // 1. Tabela de usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);
    console.log("Tabela 'users' verificada/criada com SQL direto.");

    // 2. Tabela de tipos de atividades
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_types (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        color TEXT NOT NULL
      );
    `);
    console.log("Tabela 'activity_types' verificada/criada com SQL direto.");

    // 3. Tabela de profissionais
    await pool.query(`
      CREATE TABLE IF NOT EXISTS professionals (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        initials TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1
      );
    `);
    console.log("Tabela 'professionals' verificada/criada com SQL direto.");

    // 4. Tabela de slots de tempo
    await pool.query(`
      CREATE TABLE IF NOT EXISTS time_slots (
        id SERIAL PRIMARY KEY,
        "startTime" TEXT NOT NULL,
        "endTime" TEXT NOT NULL,
        interval INTEGER NOT NULL DEFAULT 30,
        "isBaseSlot" INTEGER NOT NULL DEFAULT 1
      );
    `);
    console.log("Tabela 'time_slots' verificada/criada com SQL direto.");

    // 5. Tabela de escalas
    await pool.query(`
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
    `);
    console.log("Tabela 'schedules' verificada/criada com SQL direto.");
  } catch (error) {
    console.error("Erro ao executar SQL:", error);
    throw error;
  }
}

// Função para criar tabelas via Supabase RPC
async function createTablesWithSupabaseRPC() {
  // 1. Criar tabela de usuários
  try {
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'users',
      table_definition: `
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      `
    });
    console.log("Tabela 'users' verificada/criada via RPC.");
  
    // 2. Criar tabela de tipos de atividades
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'activity_types',
      table_definition: `
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        color TEXT NOT NULL
      `
    });
    console.log("Tabela 'activity_types' verificada/criada via RPC.");

    // 3. Criar tabela de profissionais
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'professionals',
      table_definition: `
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        initials TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1
      `
    });
    console.log("Tabela 'professionals' verificada/criada via RPC.");

    // 4. Criar tabela de slots de tempo
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'time_slots',
      table_definition: `
        id SERIAL PRIMARY KEY,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        interval INTEGER NOT NULL DEFAULT 30,
        isBaseSlot INTEGER NOT NULL DEFAULT 1
      `
    });
    console.log("Tabela 'time_slots' verificada/criada via RPC.");

    // 5. Criar tabela de escalas
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'schedules',
      table_definition: `
        id SERIAL PRIMARY KEY,
        professionalId INTEGER NOT NULL,
        weekday TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        activityCode TEXT NOT NULL,
        location TEXT,
        notes TEXT,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      `
    });
    console.log("Tabela 'schedules' verificada/criada via RPC.");
  } catch (error) {
    console.error("Erro ao criar tabelas via RPC:", error);
    throw error;
  }
}

// Função para inicializar os dados
async function initializeData() {
  try {
    // Verificar e adicionar tipos de atividades padrão
    const { data: existingActivityTypes, error: activityTypesError } = await supabase
      .from('activity_types')
      .select('*');
    
    if (activityTypesError) {
      console.error("Erro ao verificar tipos de atividades:", activityTypesError);
    }
    
    if (!existingActivityTypes || existingActivityTypes.length === 0) {
      console.log("Inserindo tipos de atividades padrão...");
      await supabase.from('activity_types').insert(defaultActivityTypes);
    }

    // Verificar e adicionar slots de tempo padrão
    const { data: existingTimeSlots, error: timeSlotsError } = await supabase
      .from('time_slots')
      .select('*');
    
    if (timeSlotsError) {
      console.error("Erro ao verificar slots de tempo:", timeSlotsError);
    }
    
    if (!existingTimeSlots || existingTimeSlots.length === 0) {
      console.log("Inserindo slots de tempo padrão...");
      const defaultTimeSlots = [
        { startTime: "08:00", endTime: "08:30", interval: 30, isBaseSlot: 1 },
        { startTime: "08:30", endTime: "09:00", interval: 30, isBaseSlot: 1 },
        { startTime: "09:00", endTime: "09:30", interval: 30, isBaseSlot: 1 },
        { startTime: "09:30", endTime: "10:00", interval: 30, isBaseSlot: 1 },
        { startTime: "10:00", endTime: "10:30", interval: 30, isBaseSlot: 1 },
        { startTime: "10:30", endTime: "11:00", interval: 30, isBaseSlot: 1 },
        { startTime: "11:00", endTime: "11:30", interval: 30, isBaseSlot: 1 },
        { startTime: "11:30", endTime: "12:00", interval: 30, isBaseSlot: 1 },
        { startTime: "13:00", endTime: "13:30", interval: 30, isBaseSlot: 1 },
        { startTime: "13:30", endTime: "14:00", interval: 30, isBaseSlot: 1 },
        { startTime: "14:00", endTime: "14:30", interval: 30, isBaseSlot: 1 },
        { startTime: "14:30", endTime: "15:00", interval: 30, isBaseSlot: 1 },
        { startTime: "15:00", endTime: "15:30", interval: 30, isBaseSlot: 1 },
        { startTime: "15:30", endTime: "16:00", interval: 30, isBaseSlot: 1 },
        { startTime: "16:00", endTime: "16:30", interval: 30, isBaseSlot: 1 },
        { startTime: "16:30", endTime: "17:00", interval: 30, isBaseSlot: 1 }
      ];
      
      await supabase.from('time_slots').insert(defaultTimeSlots);
    }

    // Verificar e adicionar profissionais de exemplo
    const { data: existingProfessionals, error: professionalsError } = await supabase
      .from('professionals')
      .select('*');
    
    if (professionalsError) {
      console.error("Erro ao verificar profissionais:", professionalsError);
    }
    
    if (!existingProfessionals || existingProfessionals.length === 0) {
      console.log("Inserindo profissionais de exemplo...");
      const defaultProfessionals = [
        { name: "Prof. Paulo", initials: "PP", active: 1 },
        { name: "Profa. Ana Maria", initials: "AM", active: 1 },
        { name: "Prof. Carlos", initials: "CL", active: 1 },
        { name: "Prof. João", initials: "JM", active: 1 },
        { name: "Profa. Maria", initials: "MM", active: 1 }
      ];
      
      await supabase.from('professionals').insert(defaultProfessionals);
    }

    // Verificar e adicionar algumas escalas de exemplo
    const { data: existingSchedules, error: schedulesError } = await supabase
      .from('schedules')
      .select('*');
    
    if (schedulesError) {
      console.error("Erro ao verificar escalas:", schedulesError);
    }
    
    if (!existingSchedules || existingSchedules.length === 0) {
      console.log("Inserindo escalas de exemplo...");
      const defaultSchedules = [
        { professionalId: 1, weekday: "segunda", startTime: "08:00", endTime: "09:30", activityCode: "aula", location: "Sala 101", notes: "Matemática" },
        { professionalId: 2, weekday: "segunda", startTime: "08:00", endTime: "09:30", activityCode: "aula", location: "Sala 203", notes: "Português" },
        { professionalId: 3, weekday: "segunda", startTime: "08:00", endTime: "09:30", activityCode: "disponivel_horario", location: "", notes: "" },
        { professionalId: 4, weekday: "segunda", startTime: "08:00", endTime: "09:30", activityCode: "estudo", location: "Biblioteca", notes: "Preparação de aulas" },
        { professionalId: 5, weekday: "segunda", startTime: "08:00", endTime: "09:30", activityCode: "plantao", location: "Sala Professores", notes: "Plantão de dúvidas" },
        
        { professionalId: 1, weekday: "segunda", startTime: "09:45", endTime: "11:15", activityCode: "reuniao", location: "Sala Reuniões", notes: "Reunião pedagógica" },
        { professionalId: 2, weekday: "segunda", startTime: "09:45", endTime: "11:15", activityCode: "aula", location: "Sala 203", notes: "Português" },
        { professionalId: 3, weekday: "segunda", startTime: "09:45", endTime: "11:15", activityCode: "reuniao", location: "Sala Reuniões", notes: "Reunião pedagógica" },
        { professionalId: 4, weekday: "segunda", startTime: "09:45", endTime: "11:15", activityCode: "aula", location: "Lab Química", notes: "Química" },
        
        { professionalId: 1, weekday: "terca", startTime: "08:00", endTime: "09:30", activityCode: "aula", location: "Sala 102", notes: "Matemática" },
        { professionalId: 2, weekday: "terca", startTime: "08:00", endTime: "09:30", activityCode: "reuniao", location: "Sala Coordenação", notes: "Reunião de departamento" }
      ];
      
      await supabase.from('schedules').insert(defaultSchedules);
    }
    
    console.log("Configuração do banco de dados Supabase concluída com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao inicializar dados:", error);
    throw error;
  }
}