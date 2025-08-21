-- 📊 Adicionar Campos de Valor para Obra Civil e Material
-- Script para adicionar campos de valor na tabela clientes

-- Adicionar campo valor_obra (valor da obra civil)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS valor_obra DECIMAL(10,2) DEFAULT 0.00;
COMMENT ON COLUMN clientes.valor_obra IS 'Valor da obra civil em reais';

-- Adicionar campo valor_material (valor do material)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS valor_material DECIMAL(10,2) DEFAULT 0.00;
COMMENT ON COLUMN clientes.valor_material IS 'Valor do material em reais';

-- Verificar se os campos foram adicionados
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    col_description((table_schema||'.'||table_name)::regclass, ordinal_position) as comment
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name IN ('valor_obra', 'valor_material')
ORDER BY column_name;

-- Atualizar registros existentes para ter valores padrão
UPDATE clientes 
SET 
    valor_obra = COALESCE(valor_obra, 0.00),
    valor_material = COALESCE(valor_material, 0.00)
WHERE valor_obra IS NULL OR valor_material IS NULL;

-- Verificar a estrutura atualizada da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name IN ('obra_civil', 'valor_obra', 'valor_material')
ORDER BY column_name;
