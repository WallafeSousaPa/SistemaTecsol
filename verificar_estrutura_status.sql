-- Script para verificar a estrutura atual das tabelas de status
-- Execute este script no SQL Editor do Supabase para diagnosticar o problema

-- 1. Verificar estrutura da tabela status_clientes
SELECT 
    'status_clientes' as tabela,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'status_clientes' 
ORDER BY ordinal_position;

-- 2. Verificar dados da tabela status_clientes
SELECT 
    'Dados da tabela status_clientes' as info,
    id,
    status,
    ativo,
    data_atualizacao
FROM status_clientes
ORDER BY id;

-- 3. Verificar estrutura da tabela clientes (campo id_status)
SELECT 
    'clientes - campo id_status' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' AND column_name = 'id_status';

-- 4. Verificar se há foreign key funcionando
SELECT 
    'Foreign Key status_clientes' as info,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'clientes'
    AND kcu.column_name = 'id_status';

-- 5. Verificar alguns clientes com seus status
SELECT 
    'Clientes e seus status' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome,
    c.created_at
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
ORDER BY c.id
LIMIT 10;

-- 6. Verificar se há triggers na tabela clientes
SELECT 
    'Triggers na tabela clientes' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'clientes';

-- 7. Verificar se há constraints CHECK na tabela clientes
SELECT 
    'Constraints CHECK na tabela clientes' as info,
    constraint_name,
    check_clause
FROM information_schema.check_constraints cc
JOIN information_schema.table_constraints tc ON cc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'clientes';
