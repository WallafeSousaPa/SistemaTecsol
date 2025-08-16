-- Script para adicionar campos de conclusão da obra na tabela clientes
-- Execute este script no SQL Editor do Supabase

-- Adicionar campo de devolução de material
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS devolucao_material BOOLEAN DEFAULT false;
COMMENT ON COLUMN clientes.devolucao_material IS 'Indica se houve devolução de material';

-- Adicionar campo de quantidade de módulos
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS quantidade_modulos INTEGER;
COMMENT ON COLUMN clientes.quantidade_modulos IS 'Quantidade de módulos instalados';

-- Adicionar campo de inversor configurado
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS configuracao_inversor BOOLEAN DEFAULT false;
COMMENT ON COLUMN clientes.configuracao_inversor IS 'Indica se o inversor foi configurado';

-- Adicionar campo de deslocamento para buscar material
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS deslocamento_buscar_material BOOLEAN DEFAULT false;
COMMENT ON COLUMN clientes.deslocamento_buscar_material IS 'Indica se houve deslocamento para buscar material';

-- Adicionar campo de obra civil
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS obra_civil BOOLEAN DEFAULT false;
COMMENT ON COLUMN clientes.obra_civil IS 'Indica se houve obra civil';

-- Adicionar campo de observações
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS observacoes TEXT;
COMMENT ON COLUMN clientes.observacoes IS 'Observações sobre a conclusão da obra';

-- Verificar se as colunas foram criadas
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name IN (
    'devolucao_material',
    'quantidade_modulos', 
    'configuracao_inversor',
    'deslocamento_buscar_material',
    'obra_civil',
    'observacoes'
)
ORDER BY column_name;
