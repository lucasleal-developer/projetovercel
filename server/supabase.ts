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
export const supabase = createClient(supabaseUrl, supabaseKey);

// Função para verificar a conexão com o Supabase
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
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