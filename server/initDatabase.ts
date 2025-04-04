import { supabase } from './supabase';
import { defaultActivityTypes } from '@shared/schema';

// Função para criar as tabelas e inicializar dados
export async function initializeDatabase() {
  console.log("Iniciando criação das tabelas no Supabase...");
  
  try {
    // 1. Criar tabela de usuários
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'users',
      table_definition: `
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      `
    });
    console.log("Tabela 'users' verificada/criada.");

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
    console.log("Tabela 'activity_types' verificada/criada.");

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
    console.log("Tabela 'professionals' verificada/criada.");

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
    console.log("Tabela 'time_slots' verificada/criada.");

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
    console.log("Tabela 'schedules' verificada/criada.");

    // Verificar se precisamos inicializar os dados
    await initializeData();

    console.log("Inicialização do banco de dados concluída com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
    
    // Como alternativa, vamos tentar executar os comandos SQL diretamente
    try {
      console.log("Tentando criar tabelas com SQL direto...");
      await createTablesWithSQL();
      await initializeData();
      return true;
    } catch (sqlError) {
      console.error("Erro ao criar tabelas com SQL direto:", sqlError);
      return false;
    }
  }
}

// Função para criar as tabelas usando SQL direto
async function createTablesWithSQL() {
  // 1. Tabela de usuários
  const { error: usersError } = await supabase.from('_sql').select(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);
  if (usersError) {
    console.error("Erro ao criar tabela 'users':", usersError);
  } else {
    console.log("Tabela 'users' verificada/criada com SQL direto.");
  }

  // 2. Tabela de tipos de atividades
  const { error: activityTypesError } = await supabase.from('_sql').select(`
    CREATE TABLE IF NOT EXISTS activity_types (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      color TEXT NOT NULL
    );
  `);
  if (activityTypesError) {
    console.error("Erro ao criar tabela 'activity_types':", activityTypesError);
  } else {
    console.log("Tabela 'activity_types' verificada/criada com SQL direto.");
  }

  // 3. Tabela de profissionais
  const { error: professionalsError } = await supabase.from('_sql').select(`
    CREATE TABLE IF NOT EXISTS professionals (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      initials TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );
  `);
  if (professionalsError) {
    console.error("Erro ao criar tabela 'professionals':", professionalsError);
  } else {
    console.log("Tabela 'professionals' verificada/criada com SQL direto.");
  }

  // 4. Tabela de slots de tempo
  const { error: timeSlotsError } = await supabase.from('_sql').select(`
    CREATE TABLE IF NOT EXISTS time_slots (
      id SERIAL PRIMARY KEY,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      interval INTEGER NOT NULL DEFAULT 30,
      isBaseSlot INTEGER NOT NULL DEFAULT 1
    );
  `);
  if (timeSlotsError) {
    console.error("Erro ao criar tabela 'time_slots':", timeSlotsError);
  } else {
    console.log("Tabela 'time_slots' verificada/criada com SQL direto.");
  }

  // 5. Tabela de escalas
  const { error: schedulesError } = await supabase.from('_sql').select(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      professionalId INTEGER NOT NULL,
      weekday TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      activityCode TEXT NOT NULL,
      location TEXT,
      notes TEXT,
      updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  if (schedulesError) {
    console.error("Erro ao criar tabela 'schedules':", schedulesError);
  } else {
    console.log("Tabela 'schedules' verificada/criada com SQL direto.");
  }
}

// Função para inicializar os dados
async function initializeData() {
  // Verificar e adicionar tipos de atividades padrão
  const { data: existingActivityTypes } = await supabase
    .from('activity_types')
    .select('*');
  
  if (!existingActivityTypes || existingActivityTypes.length === 0) {
    console.log("Inserindo tipos de atividades padrão...");
    await supabase.from('activity_types').insert(defaultActivityTypes);
  }

  // Verificar e adicionar slots de tempo padrão
  const { data: existingTimeSlots } = await supabase
    .from('time_slots')
    .select('*');
  
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
  const { data: existingProfessionals } = await supabase
    .from('professionals')
    .select('*');
  
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
  const { data: existingSchedules } = await supabase
    .from('schedules')
    .select('*');
  
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
}