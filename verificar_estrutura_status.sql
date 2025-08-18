-- Script para verificar a estrutura atual das tabelas relacionadas ao status
-- Execute este script no SQL Editor do Supabase para diagnosticar antes da migração

-- 1. Verificar estrutura atual da tabela clientes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'clientes' 
AND column_name IN ('status', 'id_status')
ORDER BY ordinal_position;

-- 2. Verificar valores únicos na coluna status atual
SELECT DISTINCT status, COUNT(*) as quantidade
FROM clientes
GROUP BY status
ORDER BY status;

-- 3. Verificar se já existe a tabela status_cliente
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'status_cliente'
) as tabela_status_cliente_existe;

-- 4. Verificar se já existe a coluna id_status
SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'clientes' 
    AND column_name = 'id_status'
) as coluna_id_status_existe;

-- 5. Verificar constraints existentes na tabela clientes
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'clientes'
AND tc.constraint_type = 'FOREIGN KEY';

-- 6. Verificar dados de exemplo para migração
SELECT 
    id,
    nome_cliente,
    status,
    data_cadastro
FROM clientes
ORDER BY id
LIMIT 10;
