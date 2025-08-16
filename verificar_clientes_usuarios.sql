-- Script para verificar se a tabela clientes_usuarios existe e tem dados
-- Execute este script para diagnosticar o problema de carregamento de clientes

-- 1. Verificar se a tabela clientes_usuarios existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'clientes_usuarios'
) AS tabela_clientes_usuarios_existe;

-- 2. Se existir, verificar a estrutura
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'clientes_usuarios' 
ORDER BY ordinal_position;

-- 3. Verificar se há dados na tabela
SELECT COUNT(*) as total_relacionamentos FROM clientes_usuarios;

-- 4. Verificar dados de exemplo
SELECT * FROM clientes_usuarios LIMIT 5;

-- 5. Verificar se há relacionamentos ativos
SELECT 
  COUNT(*) as relacionamentos_ativos,
  COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
  COUNT(CASE WHEN ativo = false THEN 1 END) as inativos
FROM clientes_usuarios;

-- 6. Verificar relacionamentos por tipo
SELECT 
  tipo_relacao,
  COUNT(*) as quantidade
FROM clientes_usuarios 
GROUP BY tipo_relacao;

-- 7. Verificar se há clientes associados a usuários específicos
SELECT 
  cu.profile_id,
  p.nome as nome_usuario,
  p.email as email_usuario,
  COUNT(cu.cliente_id) as total_clientes
FROM clientes_usuarios cu
LEFT JOIN profiles p ON cu.profile_id = p.id
WHERE cu.ativo = true
GROUP BY cu.profile_id, p.nome, p.email
ORDER BY total_clientes DESC;

-- 8. Verificar se há clientes órfãos (sem relacionamentos)
SELECT 
  COUNT(*) as clientes_sem_relacionamento
FROM clientes c
LEFT JOIN clientes_usuarios cu ON c.id = cu.cliente_id
WHERE cu.cliente_id IS NULL;

-- 9. Verificar se há relacionamentos órfãos (cliente não existe)
SELECT 
  COUNT(*) as relacionamentos_orfãos
FROM clientes_usuarios cu
LEFT JOIN clientes c ON cu.cliente_id = c.id
WHERE c.id IS NULL;
