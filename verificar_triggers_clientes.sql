-- 🔍 Verificar Triggers na Tabela clientes
-- Script para identificar triggers que podem estar causando erro de campo inexistente

-- 1. Verificar se existem triggers na tabela clientes
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'clientes'
ORDER BY trigger_name;

-- 2. Verificar se há funções de trigger sendo chamadas
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND pg_get_functiondef(p.oid) LIKE '%clientes%'
AND pg_get_functiondef(p.oid) LIKE '%data_atualizacao%';

-- 3. Verificar estrutura atual da tabela clientes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes'
ORDER BY ordinal_position;

-- 4. Verificar se há constraints ou regras que possam estar causando o problema
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'clientes'::regclass;

-- 5. Verificar se há regras (rules) na tabela
SELECT 
    rulename as rule_name,
    pg_get_ruledef(oid) as rule_definition
FROM pg_rewrite 
WHERE ev_class = 'clientes'::regclass;
