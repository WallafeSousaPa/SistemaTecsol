-- Script simples para adicionar campos de conclusão da obra
-- Execute este script no SQL Editor do Supabase

-- Adicionar campos um por um
ALTER TABLE clientes ADD COLUMN devolucao_material BOOLEAN DEFAULT false;
ALTER TABLE clientes ADD COLUMN quantidade_modulos INTEGER;
ALTER TABLE clientes ADD COLUMN configuracao_inversor BOOLEAN DEFAULT false;
ALTER TABLE clientes ADD COLUMN deslocamento_buscar_material BOOLEAN DEFAULT false;
ALTER TABLE clientes ADD COLUMN obra_civil BOOLEAN DEFAULT false;
ALTER TABLE clientes ADD COLUMN observacoes TEXT;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name IN ('devolucao_material', 'quantidade_modulos', 'configuracao_inversor', 'deslocamento_buscar_material', 'obra_civil', 'observacoes');
