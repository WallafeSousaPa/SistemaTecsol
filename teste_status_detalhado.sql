-- Script para testar detalhadamente o problema de status
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar exatamente como está a estrutura atual
SELECT 
    'Estrutura atual da tabela clientes' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name IN ('status', 'id_status')
ORDER BY column_name;

-- 2. Verificar se há dados na coluna status antiga
SELECT 
    'Dados na coluna status (se existir)' as info,
    status,
    COUNT(*) as quantidade
FROM clientes 
WHERE status IS NOT NULL
GROUP BY status
ORDER BY status;

-- 3. Verificar dados na coluna id_status
SELECT 
    'Dados na coluna id_status' as info,
    id_status,
    COUNT(*) as quantidade
FROM clientes 
GROUP BY id_status
ORDER BY id_status;

-- 4. Verificar se há algum problema com a foreign key
SELECT 
    'Teste de foreign key' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome,
    CASE 
        WHEN sc.status IS NULL THEN '❌ PROBLEMA: id_status não encontrado em status_clientes'
        ELSE '✅ OK: Foreign key funcionando'
    END as status_fk
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
ORDER BY c.id
LIMIT 10;

-- 5. Verificar se há algum problema com a tabela status_clientes
SELECT 
    'Dados da tabela status_clientes' as info,
    id,
    status,
    ativo,
    data_atualizacao
FROM status_clientes
ORDER BY id;

-- 6. Testar uma atualização manual para ver se há erro
-- Primeiro, pegar um cliente para teste
SELECT 
    'Cliente para teste de atualização' as info,
    id,
    nome_cliente,
    id_status,
    status as status_antigo
FROM clientes
LIMIT 1;

-- 7. Fazer um teste de atualização manual
-- Substitua o ID pelo ID real do cliente retornado acima
UPDATE clientes 
SET id_status = 1 
WHERE id = (SELECT id FROM clientes LIMIT 1);

-- 8. Verificar se a atualização funcionou
SELECT 
    'Resultado do teste de atualização' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome,
    c.status as status_antigo
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id = (SELECT id FROM clientes LIMIT 1);

-- 9. Verificar se há algum problema com a coluna status antiga
-- Se a coluna status ainda existir, verificar se há algum trigger ou constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'status'
    ) THEN
        RAISE NOTICE '⚠️ ATENÇÃO: Coluna status antiga ainda existe!';
        RAISE NOTICE 'Isso pode estar causando conflito com id_status.';
        RAISE NOTICE 'Considere remover esta coluna após verificar que id_status está funcionando.';
    ELSE
        RAISE NOTICE '✅ Coluna status antiga não existe mais.';
    END IF;
END $$;

-- 10. Verificar se há algum problema com a sequência
SELECT 
    'Sequência do campo id_status' as info,
    column_name,
    column_default,
    is_nullable,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns
WHERE table_name = 'clientes' AND column_name = 'id_status';

-- 11. Verificar se há algum problema com constraints
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

-- 12. Verificar se há algum problema com triggers
SELECT 
    'Triggers na tabela clientes' as info,
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'clientes'
ORDER BY trigger_name;

-- 13. Testar se a foreign key está funcionando corretamente
-- Tentar inserir um valor inválido para ver se a constraint funciona
DO $$
BEGIN
    BEGIN
        -- Tentar atualizar com um id_status que não existe
        UPDATE clientes 
        SET id_status = 999 
        WHERE id = (SELECT id FROM clientes LIMIT 1);
        
        RAISE NOTICE '❌ PROBLEMA: Foreign key não está funcionando!';
        RAISE NOTICE 'Permitiu inserir id_status = 999 que não existe em status_clientes';
        
        -- Reverter a mudança
        UPDATE clientes 
        SET id_status = 1 
        WHERE id = (SELECT id FROM clientes LIMIT 1);
        
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE '✅ Foreign key está funcionando corretamente!';
        RAISE NOTICE 'Bloqueou a inserção de id_status inválido';
    END;
END $$;
