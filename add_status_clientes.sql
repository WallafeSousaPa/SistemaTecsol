-- Script para adicionar campo status à tabela clientes
-- Execute este script no SQL Editor do Supabase se a tabela clientes já existir

-- 1. Adicionar coluna status se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'status'
    ) THEN
        ALTER TABLE clientes ADD COLUMN status VARCHAR(20) DEFAULT 'pendente';
        
        -- Adicionar constraint CHECK para valores válidos
        ALTER TABLE clientes ADD CONSTRAINT check_status_cliente 
        CHECK (status IN ('pendente', 'em_andamento', 'finalizado', 'validado'));
        
        -- Adicionar comentário
        COMMENT ON COLUMN clientes.status IS 'Status do cliente: pendente, em_andamento, finalizado, validado';
        
        -- Criar índice para melhor performance
        CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);
        
        RAISE NOTICE 'Coluna status adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna status já existe na tabela clientes.';
    END IF;
END $$;

-- 2. Atualizar registros existentes para ter status 'pendente'
UPDATE clientes SET status = 'pendente' WHERE status IS NULL;

-- 3. Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'clientes' AND column_name = 'status';

-- 4. Verificar dados atualizados
SELECT id, nome_cliente, status FROM clientes LIMIT 10; 