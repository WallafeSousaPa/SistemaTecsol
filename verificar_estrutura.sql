-- Script para verificar se a estrutura da tabela clientes foi atualizada
-- Execute este script para confirmar que as mudanças foram aplicadas

-- 1. Verificar se a coluna usuario_instalador_id existe
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
  AND column_name = 'usuario_instalador_id';

-- 2. Verificar se a coluna gerente_id foi removida
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
  AND column_name = 'gerente_id';

-- 3. Verificar se a tabela gerentes foi removida
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'gerentes'
) AS tabela_gerentes_existe;

-- 4. Verificar se o índice foi criado
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'clientes' 
  AND indexname LIKE '%usuario_instalador%';

-- 5. Verificar estrutura completa da tabela clientes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;

-- 6. Verificar se há dados na tabela clientes
SELECT COUNT(*) as total_clientes FROM clientes;

-- 7. Verificar se há usuários com cargo de instalador
SELECT 
  p.id,
  p.nome,
  p.email,
  c.cargo
FROM profiles p
INNER JOIN cargos c ON p.cargo_id = c.id
WHERE c.cargo = 'Instalador'
  AND p.ativo = true
ORDER BY p.nome;
