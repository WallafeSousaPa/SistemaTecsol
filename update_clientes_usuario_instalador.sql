-- Script para associar usuários instaladores diretamente aos clientes
-- Substituindo o campo gerente_id por usuario_instalador_id

-- 1. Adicionar nova coluna usuario_instalador_id
ALTER TABLE clientes 
ADD COLUMN usuario_instalador_id UUID REFERENCES auth.users(id);

-- 2. Copiar dados existentes (se houver) do gerente_id para usuario_instalador_id
-- NOTA: Esta etapa só deve ser executada se houver dados existentes que precisam ser migrados
-- UPDATE clientes 
-- SET usuario_instalador_id = (
--   SELECT u.id 
--   FROM auth.users u 
--   INNER JOIN profiles p ON u.id = p.id 
--   WHERE p.cargo_id = (
--     SELECT c.id FROM cargos c WHERE c.cargo = 'Instalador'
--   )
--   LIMIT 1
-- ) 
-- WHERE gerente_id IS NOT NULL;

-- 3. Remover a coluna antiga gerente_id
ALTER TABLE clientes DROP COLUMN IF EXISTS gerente_id;

-- 4. Remover a tabela gerentes (não será mais necessária)
DROP TABLE IF EXISTS gerentes;

-- 5. Adicionar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_clientes_usuario_instalador ON clientes(usuario_instalador_id);

-- 6. Adicionar constraint para garantir que o usuário seja um instalador
-- (opcional, pode ser implementado via trigger ou validação na aplicação)
-- ALTER TABLE clientes 
-- ADD CONSTRAINT check_usuario_instalador 
-- CHECK (
--   usuario_instalador_id IN (
--     SELECT u.id 
--     FROM auth.users u 
--     INNER JOIN profiles p ON u.id = p.id 
--     INNER JOIN cargos c ON p.cargo_id = c.id 
--     WHERE c.cargo = 'Instalador'
--   )
-- );

-- Verificar a nova estrutura
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;
