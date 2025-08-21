-- 🔧 Corrigir Erro: "record 'new' has no field 'data_atualizacao'"
-- Script para resolver o problema ao atualizar valores na tabela clientes

-- Opção 1: Adicionar campo data_atualizacao se não existir
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW();
COMMENT ON COLUMN clientes.data_atualizacao IS 'Data da última atualização do registro';

-- Opção 2: Verificar e remover triggers problemáticos (se necessário)
-- Primeiro, vamos ver quais triggers existem
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'clientes';

-- Se houver triggers problemáticos, você pode removê-los com:
-- DROP TRIGGER IF EXISTS nome_do_trigger ON clientes;

-- Opção 3: Criar trigger correto para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_clientes_data_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar data_atualizacao automaticamente
DROP TRIGGER IF EXISTS trigger_update_clientes_data_atualizacao ON clientes;
CREATE TRIGGER trigger_update_clientes_data_atualizacao
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_clientes_data_atualizacao();

-- Verificar se o campo foi adicionado corretamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name = 'data_atualizacao';

-- Atualizar registros existentes para ter data_atualizacao
UPDATE clientes 
SET data_atualizacao = COALESCE(data_atualizacao, NOW())
WHERE data_atualizacao IS NULL;

-- Verificar a estrutura final da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes'
AND column_name IN ('obra_civil', 'valor_obra', 'valor_material', 'data_atualizacao')
ORDER BY column_name;
