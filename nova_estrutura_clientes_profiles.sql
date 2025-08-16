-- Script para nova estrutura: associar clientes a usuários via id_profile
-- Permite associar um cliente a múltiplos usuários

-- 1. Remover a coluna usuario_instalador_id (se existir)
ALTER TABLE clientes DROP COLUMN IF EXISTS usuario_instalador_id;

-- 2. Adicionar nova coluna id_profile
ALTER TABLE clientes 
ADD COLUMN id_profile UUID REFERENCES profiles(id);

-- 3. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_clientes_id_profile ON clientes(id_profile);

-- 4. Verificar a nova estrutura
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;

-- 5. Verificar se o índice foi criado
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'clientes' 
  AND indexname LIKE '%id_profile%';
