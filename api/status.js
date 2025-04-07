// Serverless API para verificar o status do serviço
export default async function handler(req, res) {
  try {
    // Informações básicas do sistema
    const statusInfo = {
      status: "online",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      service: "Sistema de Gerenciamento de Escalas",
      version: "1.0.0"
    };
    
    // Responder com informações de status
    return res.status(200).json(statusInfo);
  } catch (error) {
    console.error("Erro ao verificar status:", error);
    return res.status(500).json({ 
      status: "error", 
      message: "Erro ao verificar status do serviço",
      timestamp: new Date().toISOString()
    });
  }
}