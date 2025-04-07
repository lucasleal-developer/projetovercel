import { createClient } from '@neondatabase/serverless';

// Esta função será executada como uma Function de API na Vercel
export default async function handler(req, res) {
  // Verifica se é um método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido. Use GET.' });
  }

  // Prepara o objeto de resposta
  const status = {
    api: "ok",
    database: "desconhecido",
    checks: [],
    errors: [],
    environment: process.env.NODE_ENV || 'unknown'
  };

  // Verifica se temos as variáveis de ambiente necessárias
  if (!process.env.DATABASE_URL) {
    status.errors.push('Variável de ambiente DATABASE_URL não configurada');
    status.database = "erro";
    return res.status(500).json(status);
  }

  status.checks.push('DATABASE_URL está configurado');
  
  // Tenta conectar ao banco de dados
  try {
    console.log("Tentando conectar ao banco de dados Neon...");
    const client = createClient({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    // Executa uma consulta simples para verificar a conexão
    const result = await client.query('SELECT NOW() as now');
    
    if (result.rows && result.rows.length > 0) {
      status.database = "ok";
      status.checks.push(`Conexão com banco de dados estabelecida em: ${result.rows[0].now}`);
      
      // Tenta acessar algumas tabelas para verificar acesso completo
      try {
        // Verifica a tabela de profissionais
        const professionals = await client.query('SELECT COUNT(*) as count FROM professionals');
        status.checks.push(`Tabela 'professionals' acessível com ${professionals.rows[0].count} registros`);
        
        // Verifica a tabela de tipos de atividades
        const activityTypes = await client.query('SELECT COUNT(*) as count FROM activity_types');
        status.checks.push(`Tabela 'activity_types' acessível com ${activityTypes.rows[0].count} registros`);
        
        // Verifica a tabela de slots de tempo
        const timeSlots = await client.query('SELECT COUNT(*) as count FROM time_slots');
        status.checks.push(`Tabela 'time_slots' acessível com ${timeSlots.rows[0].count} registros`);
        
        // Verifica a tabela de agendamentos
        const schedules = await client.query('SELECT COUNT(*) as count FROM schedules');
        status.checks.push(`Tabela 'schedules' acessível com ${schedules.rows[0].count} registros`);
      } catch (tableError) {
        status.errors.push(`Erro ao acessar tabelas: ${tableError.message}`);
      }
    } else {
      status.database = "erro";
      status.errors.push("Consulta ao banco de dados não retornou resultados");
    }
    
    // Fecha a conexão
    await client.end();
    
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
    status.database = "erro";
    status.errors.push(`Erro na conexão com banco de dados: ${error.message}`);
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
  
  // Responde com o status completo
  return res.status(200).json(status);
}