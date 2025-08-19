-- Script para verificar se há triggers ou funções alterando o valor do status
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se há triggers na tabela clientes
SELECT 
    'Triggers na tabela clientes' as info,
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing,
    action_orientation
FROM information_schema.triggers
WHERE event_object_table = 'clientes'
ORDER BY trigger_name;

-- 2. Verificar se há funções que podem estar sendo chamadas
SELECT 
    'Funções relacionadas a clientes ou status' as info,
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%clientes%'
   OR routine_definition LIKE '%status%'
   OR routine_definition LIKE '%id_status%'
ORDER BY routine_name;

-- 3. Verificar se há alguma regra (rule) na tabela
SELECT 
    'Regras na tabela clientes' as info,
    rule_name,
    definition
FROM information_schema.rules
WHERE table_name = 'clientes';

-- 4. Verificar se há alguma view que pode estar interferindo
SELECT 
    'Views relacionadas a clientes' as info,
    table_name,
    view_definition
FROM information_schema.views
WHERE table_name LIKE '%cliente%'
   OR view_definition LIKE '%clientes%'
   OR view_definition LIKE '%status%';

-- 5. Verificar se há alguma constraint que pode estar alterando valores
SELECT 
    'Constraints na tabela clientes' as info,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'clientes'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 6. Verificar se há alguma função de validação sendo chamada
SELECT 
    'Funções de validação' as info,
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%CHECK%'
   OR routine_definition LIKE '%VALIDATE%'
   OR routine_definition LIKE '%CONSTRAINT%'
ORDER BY routine_name;

-- 7. Verificar se há algum problema com a foreign key
SELECT 
    'Foreign Keys da tabela clientes' as info,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'clientes'
ORDER BY kcu.column_name;

-- 8. Verificar se há algum problema com RLS (Row Level Security)
SELECT 
    'RLS na tabela clientes' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'clientes';

-- 9. Verificar se há alguma política RLS ativa
SELECT 
    'Políticas RLS na tabela clientes' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'clientes';

-- 10. Verificar se há algum problema com o usuário atual
SELECT 
    'Usuário atual' as info,
    current_user,
    current_database(),
    session_user;

-- 11. Verificar se há algum problema com permissões
SELECT 
    'Permissões na tabela clientes' as info,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'clientes'
ORDER BY grantee, privilege_type;

-- 12. Testar se há algum problema com a inserção direta
-- Primeiro, verificar o valor atual de um cliente
SELECT 
    'Valor atual de um cliente' as info,
    id,
    nome_cliente,
    id_status
FROM clientes
LIMIT 1;

-- 13. Tentar uma atualização direta para ver se há erro
-- Substitua o ID pelo ID real do cliente retornado acima
UPDATE clientes 
SET id_status = 1 
WHERE id = (SELECT id FROM clientes LIMIT 1);

-- 14. Verificar se a atualização funcionou
SELECT 
    'Resultado da atualização direta' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id = (SELECT id FROM clientes LIMIT 1);

-- 15. Verificar se há algum problema com a sequência
SELECT 
    'Sequência do campo id_status' as info,
    column_name,
    column_default,
    is_nullable,
    data_type
FROM information_schema.columns
WHERE table_name = 'clientes' AND column_name = 'id_status';
