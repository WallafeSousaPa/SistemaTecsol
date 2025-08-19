-- Script para testar a operação completa de atualização de status
-- Execute este script no SQL Editor do Supabase para simular o que o frontend está fazendo

-- 1. Primeiro, verificar o estado atual
SELECT 
    'Estado atual dos clientes' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome,
    c.created_at
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
ORDER BY c.id
LIMIT 5;

-- 2. Verificar se há algum problema com a tabela status_clientes
SELECT 
    'Dados da tabela status_clientes' as info,
    id,
    status,
    ativo,
    data_atualizacao
FROM status_clientes
ORDER BY id;

-- 3. Simular exatamente o que o frontend está fazendo
-- Primeiro, pegar um cliente para teste
SELECT 
    'Cliente para teste completo' as info,
    id,
    nome_cliente,
    id_status,
    status as status_antigo
FROM clientes
LIMIT 1;

-- 4. Simular a operação de edição do frontend
-- O frontend está enviando id_status = 1 (Pendente)
-- Vamos simular isso diretamente
UPDATE clientes 
SET id_status = 1 
WHERE id = (SELECT id FROM clientes LIMIT 1);

-- 5. Verificar o resultado imediatamente após a atualização
SELECT 
    'Resultado imediato da atualização' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome,
    c.status as status_antigo
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id = (SELECT id FROM clientes LIMIT 1);

-- 6. Verificar se há algum problema com a foreign key
SELECT 
    'Teste de foreign key após atualização' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    CASE 
        WHEN sc.status IS NULL THEN '❌ PROBLEMA: id_status não encontrado em status_clientes'
        ELSE '✅ OK: Foreign key funcionando'
    END as status_fk,
    sc.status as status_nome
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id = (SELECT id FROM clientes LIMIT 1);

-- 7. Verificar se há algum problema com a estrutura da tabela
SELECT 
    'Estrutura da tabela clientes' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name IN ('id_status', 'status')
ORDER BY column_name;

-- 8. Verificar se há algum problema com constraints
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

-- 9. Verificar se há algum problema com triggers
SELECT 
    'Triggers na tabela clientes' as info,
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'clientes'
ORDER BY trigger_name;

-- 10. Verificar se há algum problema com a foreign key
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

-- 11. Testar com diferentes valores para ver se há padrão
-- Testar com status 2 (Em andamento)
UPDATE clientes 
SET id_status = 2 
WHERE id = (SELECT id FROM clientes LIMIT 1);

SELECT 
    'Teste com status 2' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id = (SELECT id FROM clientes LIMIT 1);

-- 12. Testar com status 3 (Finalizado) - o valor que está sendo salvo incorretamente
UPDATE clientes 
SET id_status = 3 
WHERE id = (SELECT id FROM clientes LIMIT 1);

SELECT 
    'Teste com status 3' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id = (SELECT id FROM clientes LIMIT 1);

-- 13. Voltar para status 1 (Pendente) para finalizar o teste
UPDATE clientes 
SET id_status = 1 
WHERE id = (SELECT id FROM clientes LIMIT 1);

SELECT 
    'Resultado final do teste' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id = (SELECT id FROM clientes LIMIT 1);
