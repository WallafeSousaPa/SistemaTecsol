-- 🚀 Solução Simples para Erro "data_atualizacao"
-- Execute este script para resolver o problema ao editar valores na medição

-- 1. Adicionar campo data_atualizacao na tabela clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Verificar se foi adicionado
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name = 'data_atualizacao';

-- 3. Atualizar registros existentes
UPDATE clientes 
SET data_atualizacao = NOW()
WHERE data_atualizacao IS NULL;

-- 4. Verificar estrutura completa dos campos relacionados
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes'
AND column_name IN ('obra_civil', 'valor_obra', 'valor_material', 'data_atualizacao')
ORDER BY column_name;
