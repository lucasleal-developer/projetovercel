// Este é um arquivo de coletor que importa todas as rotas da API
// Ele é usado pela Vercel para identificar os endpoints da API

// Endpoint principal para verificar se a API está respondendo
export default function handler(req, res) {
  return res.status(200).json({
    status: "online",
    message: "API de Gerenciamento de Escalas está em funcionamento",
    timestamp: new Date().toISOString(),
    endpoints: [
      "/api/status",
      "/api/diagnose",
      "/api/professionals",
      "/api/activity-types",
      "/api/time-slots",
      "/api/schedules"
    ]
  });
}

// Exportando as funções serverless para a Vercel
export { default as professionals } from './professionals';
export { default as activityTypes } from './activity-types';
export { default as timeSlots } from './time-slots';
export { default as schedules } from './schedules';
export { default as status } from './status';
export { default as diagnose } from './diagnose';