-- Script para testar inserção detalhada na tabela clientes_usuarios
-- Execute este script no SQL Editor do Supabase para identificar problemas específicos

-- 1. Verificar se a tabela existe e sua estrutura atual
SELECT '=== ESTRUTURA DA TABELA ===' as info;
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'clientes_usuarios'
ORDER BY ordinal_position;

-- 2. Verificar constraints da tabela
SELECT '=== CONSTRAINTS ===' as info;
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
WHERE tc.table_name = 'clientes_usuarios'
ORDER BY tc.constraint_type, kcu.ordinal_position;

-- 3. Verificar dados existentes
SELECT '=== DADOS EXISTENTES ===' as info;
SELECT COUNT(*) as total_registros FROM clientes_usuarios;
SELECT * FROM clientes_usuarios LIMIT 5;

-- 4. Verificar se há dados de teste disponíveis
SELECT '=== DADOS DE TESTE DISPONÍVEIS ===' as info;

SELECT 'Clientes disponíveis:' as info;
SELECT id, nome_cliente FROM clientes LIMIT 3;

SELECT 'Profiles instaladores disponíveis:' as info;
SELECT id, nome, role FROM profiles WHERE role ILIKE 'instalador' LIMIT 3;

-- 5. Testar inserção passo a passo
SELECT '=== TESTE DE INSERÇÃO PASSO A PASSO ===' as info;

-- Primeiro, vamos tentar inserir um registro de teste simples
-- DESCOMENTE AS LINHAS ABAIXO PARA TESTAR

/*
-- Teste 1: Inserção básica
INSERT INTO clientes_usuarios (cliente_id, profile_id, tipo_relacao, ativo)
VALUES (
    (SELECT id FROM clientes LIMIT 1),
    (SELECT id FROM profiles WHERE role ILIKE 'instalador' LIMIT 1),
    'instalador',
    true
);

-- Verificar se foi inserido
SELECT 'Teste 1 - Inserção básica:' as info;
SELECT * FROM clientes_usuarios ORDER BY data_associacao DESC LIMIT 1;

-- Teste 2: Verificar se o constraint unique funciona
-- Tentar inserir o mesmo registro novamente (deve falhar)
INSERT INTO clientes_usuarios (cliente_id, profile_id, tipo_relacao, ativo)
VALUES (
    (SELECT id FROM clientes LIMIT 1),
    (SELECT id FROM profiles WHERE role ILIKE 'instalador' LIMIT 1),
    'instalador',
    true
);

-- Teste 3: Testar upsert
INSERT INTO clientes_usuarios (cliente_id, profile_id, tipo_relacao, ativo)
VALUES (
    (SELECT id FROM clientes LIMIT 1),
    (SELECT id FROM profiles WHERE role ILIKE 'instalador' LIMIT 1),
    'instalador',
    true
)
ON CONFLICT (cliente_id, profile_id, tipo_relacao) 
DO UPDATE SET 
    ativo = EXCLUDED.ativo,
    data_associacao = NOW();

-- Verificar resultado do upsert
SELECT 'Teste 3 - Upsert:' as info;
SELECT * FROM clientes_usuarios ORDER BY data_associacao DESC LIMIT 1;
*/

-- 6. Verificar tipos de dados específicos
SELECT '=== VERIFICAÇÃO DE TIPOS ===' as info;

-- Verificar se cliente_id é UUID
SELECT
    'Verificando cliente_id:' as info,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'clientes_usuarios'
            AND column_name = 'cliente_id'
            AND data_type = 'uuid'
        ) THEN '✅ cliente_id é UUID'
        ELSE '❌ cliente_id NÃO é UUID'
    END as status;

-- Verificar se profile_id é UUID
SELECT
    'Verificando profile_id:' as info,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'clientes_usuarios'
            AND column_name = 'profile_id'
            AND data_type = 'uuid'
        ) THEN '✅ profile_id é UUID'
        ELSE '❌ profile_id NÃO é UUID'
        END as status;

-- 7. Verificar se há problemas de foreign key
SELECT '=== VERIFICAÇÃO DE FOREIGN KEYS ===' as info;

-- Verificar se cliente_id referencia clientes(id)
SELECT
    'Verificando FK cliente_id -> clientes(id):' as info,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
            WHERE tc.table_name = 'clientes_usuarios'
            AND tc.constraint_type = 'FOREIGN KEY'
            AND kcu.column_name = 'cliente_id'
            AND ccu.table_name = 'clientes'
        ) THEN '✅ FK existe'
        ELSE '❌ FK NÃO existe'
    END as status;

-- Verificar se profile_id referencia profiles(id)
SELECT
    'Verificando FK profile_id -> profiles(id):' as info,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
            WHERE tc.table_name = 'clientes_usuarios'
            AND tc.constraint_type = 'FOREIGN KEY'
            AND kcu.column_name = 'profile_id'
            AND ccu.table_name = 'profiles'
        ) THEN '✅ FK existe'
        ELSE '❌ FK NÃO existe'
    END as status;

-- 8. Verificar se há problemas de unique constraint
SELECT '=== VERIFICAÇÃO DE UNIQUE CONSTRAINT ===' as info;

SELECT
    'Verificando unique constraint:' as info,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_name = 'clientes_usuarios'
            AND constraint_type = 'UNIQUE'
        ) THEN '✅ Existe'
        ELSE '❌ Não existe'
    END as status;

-- 9. Verificar se há problemas de dados
SELECT '=== VERIFICAÇÃO DE DADOS ===' as info;

-- Verificar se há registros com valores NULL
SELECT
    'Verificando registros com NULL:' as info,
    COUNT(*) as total_nulos
FROM clientes_usuarios
WHERE cliente_id IS NULL OR profile_id IS NULL;

-- Verificar se há problemas de referência
SELECT
    'Verificando problemas de referência:' as info,
    COUNT(*) as total_problemas
FROM clientes_usuarios cu
LEFT JOIN clientes c ON cu.cliente_id = c.id
LEFT JOIN profiles p ON cu.profile_id = p.id
WHERE c.id IS NULL OR p.id IS NULL;
