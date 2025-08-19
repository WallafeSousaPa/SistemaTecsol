// Script de debug para testar a consulta de clientes
// Execute este código no console do navegador (F12 -> Console)

console.log('🔍 Iniciando debug da consulta de clientes...');

// 1. Verificar se o Supabase está funcionando
console.log('📡 Testando conexão com Supabase...');
try {
  const { data, error } = await supabase.from('profiles').select('count').limit(1);
  if (error) {
    console.error('❌ Erro na conexão:', error);
  } else {
    console.log('✅ Conexão com Supabase funcionando');
  }
} catch (err) {
  console.error('❌ Erro ao testar conexão:', err);
}

// 2. Verificar se o usuário está autenticado
console.log('👤 Verificando autenticação...');
try {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    console.log('✅ Usuário autenticado:', user.id);
    console.log('📧 Email:', user.email);
  } else {
    console.log('❌ Nenhum usuário autenticado');
  }
} catch (err) {
  console.error('❌ Erro ao verificar usuário:', err);
}

// 3. Verificar perfil do usuário
console.log('📋 Verificando perfil do usuário...');
try {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('nome, role, status')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao carregar perfil:', profileError);
    } else {
      console.log('✅ Perfil carregado:', profile);
      console.log('🔑 Role:', profile.role);
      console.log('📊 Status:', profile.status);
    }
  }
} catch (err) {
  console.error('❌ Erro ao verificar perfil:', err);
}

// 4. Testar consulta básica de clientes
console.log('📊 Testando consulta básica de clientes...');
try {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .limit(5);
  
  if (error) {
    console.error('❌ Erro na consulta básica:', error);
  } else {
    console.log('✅ Consulta básica funcionando');
    console.log('📈 Total de clientes retornados:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('📋 Primeiro cliente:', data[0]);
    }
  }
} catch (err) {
  console.error('❌ Erro ao executar consulta básica:', err);
}

// 5. Testar consulta completa de clientes (como no código)
console.log('🔍 Testando consulta completa de clientes...');
try {
  const { data, error } = await supabase
    .from('clientes')
    .select(`
      *,
      tipo_servico:tipo_servico(nome),
      tipo_padrao:tipo_padrao(nome),
      equipe:equipes(nome),
      status_info:status_clientes(status)
    `)
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('❌ Erro na consulta completa:', error);
  } else {
    console.log('✅ Consulta completa funcionando');
    console.log('📈 Total de clientes retornados:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('📋 Primeiro cliente com relacionamentos:', data[0]);
    }
  }
} catch (err) {
  console.error('❌ Erro ao executar consulta completa:', err);
}

// 6. Verificar se as tabelas relacionadas existem
console.log('🗂️ Verificando tabelas relacionadas...');
const tabelas = ['tipo_servico', 'tipo_padrao', 'equipes', 'status_clientes'];

for (const tabela of tabelas) {
  try {
    const { data, error } = await supabase
      .from(tabela)
      .select('count')
      .limit(1);
    
    if (error) {
      console.error(`❌ Erro ao acessar ${tabela}:`, error);
    } else {
      console.log(`✅ Tabela ${tabela} acessível`);
    }
  } catch (err) {
    console.error(`❌ Erro ao verificar ${tabela}:`, err);
  }
}

// 7. Verificar permissões RLS (Row Level Security)
console.log('🔐 Verificando permissões RLS...');
try {
  const { data, error } = await supabase
    .from('clientes')
    .select('id, nome_cliente')
    .limit(1);
  
  if (error && error.code === '42501') {
    console.error('❌ Erro de permissão (RLS):', error.message);
    console.log('💡 Isso pode indicar que as políticas RLS estão bloqueando o acesso');
  } else if (error) {
    console.error('❌ Outro erro:', error);
  } else {
    console.log('✅ Permissões RLS OK');
  }
} catch (err) {
  console.error('❌ Erro ao verificar permissões:', err);
}

console.log('🏁 Debug concluído. Verifique os resultados acima.');
