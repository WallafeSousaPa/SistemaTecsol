-- Script para verificar os status existentes na tabela clientes
-- Execute este script para entender quais status estão sendo usados

-- 1. Verificar todos os status únicos na tabela clientes
SELECT DISTINCT status, COUNT(*) as quantidade
FROM clientes 
GROUP BY status 
ORDER BY quantidade DESC;

-- 2. Verificar se existem clientes com status 'pendente' ou 'iniciar_obra'
SELECT 
  status,
  COUNT(*) as quantidade
FROM clientes 
WHERE status IN ('pendente', 'iniciar_obra')
GROUP BY status;

-- 3. Verificar se existem clientes associados a usuários
SELECT 
  COUNT(*) as total_clientes_usuarios
FROM clientes_usuarios 
WHERE ativo = true;

-- 4. Verificar relacionamentos específicos
SELECT 
  cu.profile_id,
  p.nome as nome_usuario,
  p.email as email_usuario,
  c.nome_cliente,
  c.status,
  c.data_cadastro
FROM clientes_usuarios cu
INNER JOIN profiles p ON cu.profile_id = p.id
INNER JOIN clientes c ON cu.cliente_id = c.id
WHERE cu.ativo = true
ORDER BY p.nome, c.status;

-- 5. Verificar se há clientes com status que podem ser considerados "pendentes"
SELECT 
  status,
  COUNT(*) as quantidade,
  'Possível status pendente' as observacao
FROM clientes 
WHERE status IN ('pendente', 'iniciar_obra', 'aguardando', 'novo', 'cadastrado')
GROUP BY status;

-- 6. Verificar estrutura da tabela clientes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
  AND column_name = 'status'
ORDER BY ordinal_position;
