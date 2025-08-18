-- Script para verificar problemas com usuários instaladores e clientes associados
-- Execute este script no SQL Editor do Supabase para diagnosticar os problemas

-- 1. Verificar usuários instaladores na tabela profiles
SELECT 
  id,
  nome,
  role,
  status,
  email
FROM profiles 
WHERE LOWER(role) = 'instalador'
ORDER BY nome;

-- 2. Verificar se há clientes na tabela clientes
SELECT 
  id,
  nome_cliente,
  status,
  data_cadastro
FROM clientes 
ORDER BY data_cadastro DESC
LIMIT 10;

-- 3. Verificar se há associações na tabela clientes_usuarios
SELECT 
  cu.id,
  cu.cliente_id,
  cu.profile_id,
  cu.tipo_relacao,
  cu.ativo,
  cu.data_associacao,
  c.nome_cliente,
  p.nome as nome_perfil,
  p.role
FROM clientes_usuarios cu
LEFT JOIN clientes c ON cu.cliente_id = c.id
LEFT JOIN profiles p ON cu.profile_id = p.id
ORDER BY cu.data_associacao DESC;

-- 4. Verificar se há clientes com status 'pendente' ou 'em andamento'
SELECT 
  id,
  nome_cliente,
  status,
  data_cadastro
FROM clientes 
WHERE status IN ('pendente', 'em andamento')
ORDER BY data_cadastro DESC;

-- 5. Verificar estrutura da tabela clientes_usuarios
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clientes_usuarios' 
ORDER BY ordinal_position;

-- 6. Verificar se há problemas de constraint na tabela clientes_usuarios
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'clientes_usuarios';

-- 7. Testar inserção de um registro de teste na tabela clientes_usuarios
-- (Descomente apenas se quiser testar)
/*
INSERT INTO clientes_usuarios (cliente_id, profile_id, tipo_relacao, ativo)
VALUES (
  (SELECT id FROM clientes LIMIT 1),
  (SELECT id FROM profiles WHERE LOWER(role) = 'instalador' LIMIT 1),
  'instalador',
  true
);
*/
