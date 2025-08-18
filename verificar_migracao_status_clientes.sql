-- Execute este script no SQL Editor do Supabase após executar create_status_clientes_table.sql
-- Script para verificar se a migração para status_clientes foi bem-sucedida

-- 1. Verificar se a tabela status_clientes foi criada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'status_clientes'
ORDER BY ordinal_position;

-- 2. Verificar se os status padrão foram inseridos
SELECT 
    id,
    status,
    ativo,
    data_atualizacao
FROM status_clientes
ORDER BY id;

-- 3. Verificar se a coluna id_status foi adicionada na tabela clientes
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name IN ('status', 'id_status')
ORDER BY column_name;

-- 4. Verificar se a foreign key foi criada
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'clientes'
AND kcu.column_name = 'id_status';

-- 5. Verificar dados migrados (comparar status antigo com novo)
SELECT
    c.id,
    c.nome_cliente,
    c.status as status_antigo,
    c.id_status,
    sc.status as status_novo,
    CASE 
        WHEN c.id_status IS NOT NULL THEN '✅ Migrado'
        WHEN c.status IS NOT NULL THEN '⚠️ Pendente migração'
        ELSE '❌ Sem status'
    END as status_migracao
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
ORDER BY c.id;

-- 6. Contar clientes por status
SELECT 
    COALESCE(sc.status, 'Sem status') as status,
    COUNT(*) as total_clientes
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
GROUP BY sc.status
ORDER BY total_clientes DESC;

-- 7. Verificar se há clientes sem id_status (problema na migração)
SELECT 
    COUNT(*) as clientes_sem_id_status
FROM clientes 
WHERE id_status IS NULL;

-- 8. Verificar se há clientes com id_status inválido
SELECT 
    COUNT(*) as clientes_com_id_status_invalido
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id_status IS NOT NULL AND sc.id IS NULL;
