-- Script para verificar se a migração do status foi bem-sucedida
-- Execute este script no SQL Editor do Supabase após executar create_status_cliente_table.sql

-- 1. Verificar se a tabela status_cliente foi criada
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'status_cliente';

-- 2. Verificar se os status foram inseridos corretamente
SELECT 
    id,
    status,
    ativo,
    data_atualizacao
FROM status_cliente
ORDER BY id;

-- 3. Verificar se a coluna id_status foi adicionada na tabela clientes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'clientes' 
AND column_name = 'id_status';

-- 4. Verificar se a foreign key foi criada
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
AND tc.constraint_type = 'FOREIGN KEY'
AND kcu.column_name = 'id_status';

-- 5. Verificar se os dados foram migrados corretamente
SELECT 
    c.id,
    c.nome_cliente,
    c.status as status_antigo,
    c.id_status,
    sc.status as status_novo
FROM clientes c
LEFT JOIN status_cliente sc ON c.id_status = sc.id
ORDER BY c.id
LIMIT 20;

-- 6. Verificar se há clientes sem status definido
SELECT 
    COUNT(*) as clientes_sem_status
FROM clientes 
WHERE id_status IS NULL;

-- 7. Verificar se há clientes com status inválidos
SELECT 
    COUNT(*) as clientes_status_invalido
FROM clientes c
LEFT JOIN status_cliente sc ON c.id_status = sc.id
WHERE c.id_status IS NOT NULL AND sc.id IS NULL;

-- 8. Contar clientes por status
SELECT 
    sc.status,
    COUNT(c.id) as quantidade_clientes
FROM status_cliente sc
LEFT JOIN clientes c ON sc.id = c.id_status
GROUP BY sc.id, sc.status
ORDER BY sc.id;
