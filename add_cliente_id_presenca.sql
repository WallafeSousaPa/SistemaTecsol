-- Script para adicionar o campo cliente_id à tabela presenca
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar o campo cliente_id à tabela presenca
ALTER TABLE presenca 
ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE;

-- 2. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_presenca_cliente ON presenca(cliente_id);

-- 3. Adicionar comentário sobre o campo
COMMENT ON COLUMN presenca.cliente_id IS 'Referência ao cliente da presença';

-- 4. Verificar se o campo foi adicionado corretamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'presenca' 
AND column_name = 'cliente_id';

-- 5. Verificar a estrutura atual da tabela presenca
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'presenca' 
ORDER BY ordinal_position; 