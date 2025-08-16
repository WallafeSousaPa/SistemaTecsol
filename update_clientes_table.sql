-- Script para atualizar a tabela 'clientes' existente no Supabase
-- Execute este script no SQL Editor do Supabase APÓS criar a tabela equipes

-- 1. Primeiro, verificar se a tabela equipes existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'equipes') THEN
        RAISE EXCEPTION 'A tabela equipes deve ser criada primeiro! Execute o script create_equipes_table.sql';
    END IF;
END $$;

-- 2. Adicionar a coluna equipe_id à tabela clientes existente
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS equipe_id UUID REFERENCES equipes(id);

-- 3. Criar índice para a nova coluna
CREATE INDEX IF NOT EXISTS idx_clientes_equipe ON clientes(equipe_id);

-- 4. Atualizar comentários da tabela
COMMENT ON COLUMN clientes.equipe_id IS 'Referência à equipe responsável';

-- 5. Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clientes' AND column_name = 'equipe_id';

-- 6. Mostrar estrutura atual da tabela clientes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;
