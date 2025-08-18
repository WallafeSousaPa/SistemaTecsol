-- Script para testar inserção na tabela clientes_usuarios
-- Execute este script no SQL Editor do Supabase para identificar problemas

-- 1. Verificar se a tabela existe e sua estrutura
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes_usuarios'
ORDER BY ordinal_position;

-- 2. Verificar se há dados de teste disponíveis
SELECT 'Clientes disponíveis:' as info;
SELECT id, nome_cliente FROM clientes LIMIT 3;

SELECT 'Profiles instaladores disponíveis:' as info;
SELECT id, nome, role FROM profiles WHERE role ILIKE 'instalador' LIMIT 3;

-- 3. Testar inserção simples
-- DESCOMENTE AS LINHAS ABAIXO PARA TESTAR
/*
-- Primeiro, vamos tentar inserir um registro de teste
INSERT INTO clientes_usuarios (cliente_id, profile_id, tipo_relacao, ativo)
VALUES (
    (SELECT id FROM clientes LIMIT 1),
    (SELECT id FROM profiles WHERE role ILIKE 'instalador' LIMIT 1),
    'instalador',
    true
);

-- Verificar se foi inserido
SELECT * FROM clientes_usuarios ORDER BY data_associacao DESC LIMIT 1;
*/

-- 4. Verificar se há problemas de constraint
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

-- 5. Verificar se há problemas de tipo de dados
-- A tabela deve aceitar UUIDs para cliente_id e profile_id
SELECT 
    'Verificando tipos de dados:' as info,
    'cliente_id deve ser UUID' as expectativa,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'clientes_usuarios' 
            AND column_name = 'cliente_id' 
            AND data_type = 'uuid'
        ) THEN '✅ Correto'
        ELSE '❌ Incorreto'
    END as status;

SELECT 
    'Verificando tipos de dados:' as info,
    'profile_id deve ser UUID' as expectativa,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'clientes_usuarios' 
            AND column_name = 'profile_id' 
            AND data_type = 'uuid'
        ) THEN '✅ Correto'
        ELSE '❌ Incorreto'
    END as status;

-- 6. Verificar se há problemas de unique constraint
SELECT 
    'Verificando unique constraint:' as info,
    'Deve ter constraint única em (cliente_id, profile_id, tipo_relacao)' as expectativa,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'clientes_usuarios' 
            AND constraint_type = 'UNIQUE'
        ) THEN '✅ Existe'
        ELSE '❌ Não existe'
    END as status;

-- 7. Verificar se há problemas de foreign key
SELECT 
    'Verificando foreign keys:' as info,
    'cliente_id deve referenciar clientes(id)' as expectativa,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
            WHERE tc.table_name = 'clientes_usuarios' 
            AND tc.constraint_type = 'FOREIGN KEY'
            AND kcu.column_name = 'cliente_id'
            AND ccu.table_name = 'clientes'
        ) THEN '✅ Existe'
        ELSE '❌ Não existe'
    END as status;

SELECT 
    'Verificando foreign keys:' as info,
    'profile_id deve referenciar profiles(id)' as expectativa,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
            WHERE tc.table_name = 'clientes_usuarios' 
            AND tc.constraint_type = 'FOREIGN KEY'
            AND kcu.column_name = 'profile_id'
            AND ccu.table_name = 'profiles'
        ) THEN '✅ Existe'
        ELSE '❌ Não existe'
    END as status;
