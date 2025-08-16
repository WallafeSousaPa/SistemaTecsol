import { createClient } from '@supabase/supabase-js'

// Configuração com variáveis de ambiente
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ozttgvcetxxzdqfzeylt.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96dHRndmNldHh4emRxZnpleWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NDM0MzQsImV4cCI6MjA3MDQxOTQzNH0.OBWJDbyBszSE_zw-LVMB2t8iypFTKSVXDbnDoVeMwYU'

// Validação das configurações
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configurações do Supabase estão incompletas. Verifique as variáveis de ambiente.')
}

// Validação da URL do Supabase
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error('URL do Supabase inválida. Deve ser uma URL HTTPS válida do Supabase.')
}

// Log de configuração apenas em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase configurado com URL:', supabaseUrl)
  console.log('Chave anônima configurada:', supabaseAnonKey ? 'Sim' : 'Não')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Função para verificar se o cliente está funcionando
export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1)
    if (error && error.code !== 'PGRST116') {
      console.error('Erro na conexão com Supabase:', error)
      return false
    }
    return true
  } catch (error) {
    console.error('Erro ao testar conexão:', error)
    return false
  }
}

// Função para verificar se o usuário está autenticado
export const isAuthenticated = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error)
    return false
  }
}
