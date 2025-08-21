-- 🚨 REMOVER TRIGGER PROBLEMÁTICO - Erro "data_atualizacao"
-- Este script identifica e remove triggers que tentam acessar campo inexistente

-- 1. IDENTIFICAR triggers problemáticos
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'clientes'
AND action_statement LIKE '%data_atualizacao%';

-- 2. IDENTIFICAR funções que referenciam data_atualizacao
SELECT 
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_functiondef(p.oid) LIKE '%data_atualizacao%';

-- 3. VERIFICAR se existe algum RLS policy problemático
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'clientes'
AND (qual LIKE '%data_atualizacao%' OR with_check LIKE '%data_atualizacao%');

-- 4. REMOVER triggers problemáticos (execute apenas se encontrar algum)
-- Substitua 'NOME_DO_TRIGGER' pelo nome real encontrado na consulta 1
-- DROP TRIGGER IF EXISTS NOME_DO_TRIGGER ON clientes;

-- 5. VERIFICAR estrutura atual da tabela clientes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes'
ORDER BY ordinal_position;

-- 6. VERIFICAR se o trigger correto (updated_at) está funcionando
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'clientes'
AND trigger_name = 'update_clientes_updated_at';

-- 7. TESTAR atualização simples para verificar se o erro persiste
-- (Execute apenas se quiser testar)
-- UPDATE clientes 
-- SET observacoes = COALESCE(observacoes, '') || ' - Teste sem data_atualizacao'
-- WHERE id = (SELECT id FROM clientes LIMIT 1);

-- ✅ INSTRUÇÕES:
-- 1. Execute as consultas 1, 2 e 3 para identificar o problema
-- 2. Se encontrar trigger problemático, execute a consulta 4 (descomente e ajuste o nome)
-- 3. Execute as consultas 5 e 6 para verificar a estrutura
-- 4. Teste a funcionalidade na aplicação
