import { createClient } from '@neondatabase/serverless';
import { Pool } from 'pg';

// Esta função será executada como uma Function de API na Vercel
export default async function handler(req, res) {
  // Habilitar CORS para facilitar o acesso ao diagnóstico
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Verifica se é uma solicitação OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verifica se é um método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido. Use GET.' });
  }

  // Prepara o objeto de resposta
  const status = {
    api: "ok",
    timestamp: new Date().toISOString(),
    database: "desconhecido",
    checks: [],
    errors: [],
    environment: process.env.NODE_ENV || 'unknown',
    platform: {
      runtime: process.env.VERCEL ? "Vercel Serverless" : "Node.js",
      vercel: process.env.VERCEL ? true : false
    }
  };

  // Verifica se temos as variáveis de ambiente necessárias
  if (!process.env.DATABASE_URL) {
    status.errors.push('Variável de ambiente DATABASE_URL não configurada');
    status.database = "erro";
    return res.status(500).json(status);
  }

  status.checks.push('DATABASE_URL está configurado');
  
  // Tenta conectar ao banco de dados (primeiro com Neon Serverless)
  let dbClient = null;
  try {
    console.log("Tentando conectar ao banco de dados Neon (serverless)...");
    dbClient = createClient({ connectionString: process.env.DATABASE_URL });
    await dbClient.connect();

    // Executa uma consulta simples para verificar a conexão
    const result = await dbClient.query('SELECT NOW() as now');
    
    if (result.rows && result.rows.length > 0) {
      status.database = "ok";
      status.checks.push(`Conexão com banco de dados estabelecida em: ${result.rows[0].now}`);
      status.db_type = "neon_serverless";
      
      // Tenta acessar algumas tabelas para verificar acesso completo
      try {
        // Verifica a tabela de profissionais
        const professionals = await dbClient.query('SELECT COUNT(*) as count FROM professionals');
        status.checks.push(`Tabela 'professionals' acessível com ${professionals.rows[0].count} registros`);
        
        // Verifica a tabela de tipos de atividades
        const activityTypes = await dbClient.query('SELECT COUNT(*) as count FROM activity_types');
        status.checks.push(`Tabela 'activity_types' acessível com ${activityTypes.rows[0].count} registros`);
        
        // Verifica a tabela de slots de tempo
        const timeSlots = await dbClient.query('SELECT COUNT(*) as count FROM time_slots');
        status.checks.push(`Tabela 'time_slots' acessível com ${timeSlots.rows[0].count} registros`);
        
        // Verifica a tabela de agendamentos
        const schedules = await dbClient.query('SELECT COUNT(*) as count FROM schedules');
        status.checks.push(`Tabela 'schedules' acessível com ${schedules.rows[0].count} registros`);
      } catch (tableError) {
        status.errors.push(`Erro ao acessar tabelas: ${tableError.message}`);
      }
    } else {
      status.database = "erro";
      status.errors.push("Consulta ao banco de dados não retornou resultados");
    }
    
    // Fecha a conexão
    await dbClient.end();
    
  } catch (neonError) {
    console.error("Erro ao conectar com Neon Serverless, tentando com pool padrão:", neonError);
    status.errors.push(`Tentativa com Neon Serverless falhou: ${neonError.message}`);
    
    // Tenta conexão com PostgreSQL padrão se o serverless falhar
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const pgClient = await pool.connect();
      
      // Executa consulta para verificar conexão
      const result = await pgClient.query('SELECT NOW() as now');
      
      if (result.rows && result.rows.length > 0) {
        status.database = "ok";
        status.checks.push(`Conexão com banco de dados (Pool) estabelecida em: ${result.rows[0].now}`);
        status.db_type = "pg_standard";
        
        // Verifica tabelas com o cliente pg padrão também
        try {
          // Similares às verificações acima
          const professionals = await pgClient.query('SELECT COUNT(*) as count FROM professionals');
          status.checks.push(`Tabela 'professionals' acessível com pool: ${professionals.rows[0].count} registros`);
        } catch (tableError) {
          status.errors.push(`Erro ao acessar tabelas com pool: ${tableError.message}`);
        }
      }
      
      pgClient.release();
      await pool.end();
      
    } catch (pgError) {
      console.error("Erro ao conectar com Pool PostgreSQL padrão:", pgError);
      status.database = "erro";
      status.errors.push(`Tentativa com Pool PostgreSQL também falhou: ${pgError.message}`);
    }
  }

  // Adiciona informações sobre variáveis de ambiente (sem expor valores sensíveis)
  const envVariables = [
    'PGHOST', 'PGUSER', 'PGDATABASE', 'PGPORT', 
    'SUPABASE_URL', 'SUPABASE_KEY'
  ];
  
  const envStatus = envVariables.map(varName => {
    return {
      name: varName,
      configured: process.env[varName] ? true : false
    };
  });
  
  status.environment_variables = envStatus;
  
  // Adiciona informações sobre o build
  status.build_info = {
    node_version: process.version,
    deployed_at: new Date().toISOString(),
    vercel_region: process.env.VERCEL_REGION || 'unknown'
  };
  
  // Responde com o status completo
  return res.status(200).json(status);
}