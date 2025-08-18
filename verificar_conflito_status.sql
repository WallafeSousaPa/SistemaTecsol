-- Script para verificar e resolver conflito de nome com status_cliente
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se existe uma tabela com esse nome
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'status_cliente';

-- 2. Verificar se existe um tipo com esse nome
SELECT 
    typname,
    typtype,
    typcategory
FROM pg_type 
WHERE typname = 'status_cliente';

-- 3. Verificar se existe uma sequência com esse nome
SELECT 
    schemaname,
    sequencename,
    sequenceowner
FROM pg_sequences 
WHERE sequencename = 'status_cliente';

-- 4. Verificar se existe uma view com esse nome
SELECT 
    schemaname,
    viewname,
    viewowner
FROM pg_views 
WHERE viewname = 'status_cliente';

-- 5. Se existir um tipo, vamos removê-lo
-- DESCOMENTE A LINHA ABAIXO APÓS VERIFICAR QUE É SEGURO REMOVER
-- DROP TYPE IF EXISTS status_cliente CASCADE;

-- 6. Se existir uma tabela, vamos removê-la
-- DESCOMENTE A LINHA ABAIXO APÓS VERIFICAR QUE É SEGURO REMOVER
-- DROP TABLE IF EXISTS status_cliente CASCADE;

-- 7. Após limpar, tentar criar a tabela novamente
-- DESCOMENTE AS LINHAS ABAIXO APÓS LIMPAR OS CONFLITOS
/*
CREATE TABLE IF NOT EXISTS status_cliente (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL UNIQUE,
    ativo BOOLEAN DEFAULT true,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir os status padrão
INSERT INTO status_cliente (status, ativo) VALUES
    ('Pendente', true),
    ('Em andamento', true),
    ('Finalizado', true),
    ('Validado', true)
ON CONFLICT (status) DO NOTHING;
*/
