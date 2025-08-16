-- Script para adicionar campos endereco e telefone à tabela clientes existente
-- Execute este script no SQL Editor do Supabase se você já executou o create_clientes_table.sql anterior

-- 1. Adicionar campo endereco (se não existir)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS endereco TEXT;

-- 2. Adicionar campo telefone (se não existir)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);

-- 3. Adicionar comentários para os novos campos
COMMENT ON COLUMN clientes.endereco IS 'Endereço completo do cliente';
COMMENT ON COLUMN clientes.telefone IS 'Telefone de contato do cliente';

-- 4. Verificar se os campos foram adicionados corretamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name IN ('endereco', 'telefone')
ORDER BY column_name;

-- 5. Verificar a estrutura completa da tabela clientes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes'
ORDER BY ordinal_position;
