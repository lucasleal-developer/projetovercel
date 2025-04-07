// Serverless API para verificar o status do serviço
export default async function handler(req, res) {
  try {
    // Verificar o método HTTP
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Informações básicas do sistema
    const statusInfo = {
      status: "online",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      service: "Sistema de Gerenciamento de Escalas",
      version: "1.0.0",
      runtime: {
        node: process.version,
        platform: process.platform,
        hostname: process.env.VERCEL ? 'vercel-serverless' : process.env.HOSTNAME || 'unknown'
      },
      database: {
        type: "PostgreSQL (Neon)",
        connection: process.env.DATABASE_URL ? "configurado" : "não configurado"
      },
      buildInfo: {
        date: new Date().toISOString(),
        serverless: process.env.VERCEL ? true : false
      }
    };
    
    // Responder com informações de status
    return res.status(200).json(statusInfo);
  } catch (error) {
    console.error("Erro ao verificar status:", error);
    return res.status(500).json({ 
      status: "error", 
      message: "Erro ao verificar status do serviço",
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
    });
  }
}