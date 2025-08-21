// Script de diagnóstico para problemas na tela de login
// Execute este script no console do navegador para identificar problemas

console.log('🔍 INICIANDO DIAGNÓSTICO DA TELA DE LOGIN...')

// 1. Verificar se o React está funcionando
console.log('✅ React disponível:', typeof React !== 'undefined')
console.log('✅ React Router disponível:', typeof useNavigate !== 'undefined')

// 2. Verificar variáveis de ambiente
console.log('🔧 Variáveis de ambiente:')
console.log('  - NODE_ENV:', process.env.NODE_ENV)
console.log('  - REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL)
console.log('  - REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Configurada' : 'NÃO CONFIGURADA')

// 3. Verificar configuração do Supabase
try {
  // Tentar acessar o cliente Supabase
  if (typeof window !== 'undefined' && window.supabase) {
    console.log('✅ Cliente Supabase disponível no window')
  } else {
    console.log('❌ Cliente Supabase NÃO disponível no window')
  }
} catch (error) {
  console.error('❌ Erro ao verificar Supabase:', error)
}

// 4. Verificar erros no console
console.log('🔍 Verificando erros no console...')
const originalError = console.error
const errors = []

console.error = function(...args) {
  errors.push(args)
  originalError.apply(console, args)
}

// 5. Verificar se há problemas de rede
console.log('🌐 Verificando conectividade...')
fetch('https://ozttgvcetxxzdqfzeylt.supabase.co/rest/v1/', {
  method: 'GET',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96dHRndmNldHh4emRxZnpleWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NDM0MzQsImV4cCI6MjA3MDQxOTQzNH0.OBWJDbyBszSE_zw-LVMB2t8iypFTKSVXDbnDoVeMwYU'
  }
})
.then(response => {
  console.log('✅ Conexão com Supabase:', response.status, response.statusText)
})
.catch(error => {
  console.error('❌ Erro de conexão com Supabase:', error)
})

// 6. Verificar elementos da página
setTimeout(() => {
  console.log('🔍 Verificando elementos da página...')
  
  const elements = {
    'Container de autenticação': document.querySelector('.auth-container'),
    'Card de autenticação': document.querySelector('.auth-card'),
    'Campo de email': document.querySelector('#email'),
    'Campo de senha': document.querySelector('#password'),
    'Botão de login': document.querySelector('.auth-button'),
    'Logo da empresa': document.querySelector('.company-logo'),
    'Mensagens de erro': document.querySelector('.error-message')
  }
  
  Object.entries(elements).forEach(([name, element]) => {
    if (element) {
      console.log(`✅ ${name}:`, element.tagName, element.className)
    } else {
      console.log(`❌ ${name}: NÃO ENCONTRADO`)
    }
  })
  
  // 7. Verificar estilos CSS
  console.log('🎨 Verificando estilos CSS...')
  const authContainer = document.querySelector('.auth-container')
  if (authContainer) {
    const styles = window.getComputedStyle(authContainer)
    console.log('  - Display:', styles.display)
    console.log('  - Visibility:', styles.visibility)
    console.log('  - Opacity:', styles.opacity)
    console.log('  - Position:', styles.position)
    console.log('  - Z-index:', styles.zIndex)
  }
  
  // 8. Verificar se há JavaScript errors
  console.log('📋 Erros capturados durante o diagnóstico:')
  if (errors.length > 0) {
    errors.forEach((error, index) => {
      console.log(`  Erro ${index + 1}:`, error)
    })
  } else {
    console.log('  ✅ Nenhum erro JavaScript capturado')
  }
  
  // 9. Verificar localStorage e sessionStorage
  console.log('💾 Verificando armazenamento local...')
  try {
    console.log('  - localStorage disponível:', typeof localStorage !== 'undefined')
    console.log('  - sessionStorage disponível:', typeof sessionStorage !== 'undefined')
    
    if (typeof localStorage !== 'undefined') {
      const supabaseKeys = Object.keys(localStorage).filter(key => key.includes('supabase'))
      console.log('  - Chaves do Supabase no localStorage:', supabaseKeys)
    }
  } catch (error) {
    console.error('  ❌ Erro ao verificar armazenamento:', error)
  }
  
  // 10. Verificar se há problemas de CORS
  console.log('🌐 Verificando problemas de CORS...')
  const corsTest = document.createElement('img')
  corsTest.onload = () => console.log('✅ CORS funcionando para imagens')
  corsTest.onerror = () => console.log('❌ Possível problema de CORS para imagens')
  corsTest.src = 'https://ozttgvcetxxzdqfzeylt.supabase.co/favicon.ico'
  
  console.log('🎯 DIAGNÓSTICO COMPLETO! Verifique os resultados acima.')
  
}, 1000)

// Restaurar console.error original
setTimeout(() => {
  console.error = originalError
}, 2000)

// Função para testar login manualmente
window.testLogin = async (email, password) => {
  console.log('🧪 Testando login manualmente...')
  
  try {
    const response = await fetch('https://ozttgvcetxxzdqfzeylt.supabase.co/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96dHRndmNldHh4emRxZnpleWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NDM0MzQsImV4cCI6MjA3MDQxOTQzNH0.OBWJDbyBszSE_zw-LVMB2t8iypFTKSVXDbnDoVeMwYU'
      },
      body: JSON.stringify({
        email: email || 'teste@exemplo.com',
        password: password || '123456'
      })
    })
    
    const data = await response.json()
    console.log('📡 Resposta da API:', data)
    
    if (data.access_token) {
      console.log('✅ Login bem-sucedido! Token recebido.')
    } else {
      console.log('❌ Login falhou:', data.error_description || data.msg)
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar login:', error)
  }
}

// Função para verificar se o Supabase está funcionando
window.testSupabase = async () => {
  console.log('🧪 Testando Supabase...')
  
  try {
    const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js')
    
    const supabase = createClient(
      'https://ozttgvcetxxzdqfzeylt.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96dHRndmNldHh4emRxZnpleWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NDM0MzQsImV4cCI6MjA3MDQxOTQzNH0.OBWJDbyBszSE_zw-LVMB2t8iypFTKSVXDbnDoVeMwYU'
    )
    
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.log('❌ Erro Supabase:', error)
    } else {
      console.log('✅ Supabase funcionando! Dados recebidos:', data)
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar Supabase:', error)
  }
}

console.log('🚀 Funções de teste disponíveis:')
console.log('  - testLogin(email, password): Testa login manualmente')
console.log('  - testSupabase(): Testa conexão com Supabase')
console.log('')
console.log('💡 Use estas funções para testar manualmente se necessário.')
