-- Script de teste para verificar o sistema de Lista de Material
-- Execute este script APÓS executar os scripts de criação

-- 1. Verificar se as tabelas foram criadas
SELECT '=== VERIFICAÇÃO DAS TABELAS ===' as info;
SELECT table_name, table_type, table_schema
FROM information_schema.tables 
WHERE table_name IN ('lista_material', 'itens_material')
ORDER BY table_name;

-- 2. Verificar estrutura das tabelas
SELECT '=== ESTRUTURA DA TABELA lista_material ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'lista_material'
ORDER BY ordinal_position;

SELECT '=== ESTRUTURA DA TABELA itens_material ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'itens_material'
ORDER BY ordinal_position;

-- 3. Verificar foreign keys
SELECT '=== VERIFICAÇÃO DAS FOREIGN KEYS ===' as info;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('lista_material', 'itens_material');

-- 4. Verificar índices
SELECT '=== VERIFICAÇÃO DOS ÍNDICES ===' as info;
SELECT 
    tablename, 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename IN ('lista_material', 'itens_material')
ORDER BY tablename, indexname;

-- 5. Verificar se RLS está habilitado
SELECT '=== VERIFICAÇÃO DO RLS ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename IN ('lista_material', 'itens_material');

-- 6. Verificar políticas RLS
SELECT '=== VERIFICAÇÃO DAS POLÍTICAS RLS ===' as info;
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename IN ('lista_material', 'itens_material')
ORDER BY tablename, policyname;

-- 7. Verificar funções
SELECT '=== VERIFICAÇÃO DAS FUNÇÕES ===' as info;
SELECT 
    proname as nome_funcao,
    prosrc as codigo_fonte
FROM pg_proc 
WHERE proname IN ('update_updated_at_column', 'criar_lista_material_com_itens');

-- 8. Verificar triggers
SELECT '=== VERIFICAÇÃO DOS TRIGGERS ===' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('lista_material', 'itens_material')
ORDER BY event_object_table, trigger_name;

-- 9. Teste de inserção (apenas se houver dados de teste)
SELECT '=== TESTE DE INSERÇÃO ===' as info;
-- Este teste só funcionará se houver um cliente válido na tabela clientes
-- e se o usuário atual tiver permissões adequadas

-- Verificar se existe pelo menos um cliente
SELECT 'Clientes disponíveis:' as info, COUNT(*) as total_clientes FROM clientes;

-- Verificar se existe pelo menos um usuário no perfil
SELECT 'Usuários no perfil:' as info, COUNT(*) as total_usuarios FROM profiles;

-- 10. Resumo final
SELECT '=== RESUMO FINAL ===' as info;
SELECT 
    'Tabelas criadas' as item,
    COUNT(*) as quantidade
FROM information_schema.tables 
WHERE table_name IN ('lista_material', 'itens_material')
UNION ALL
SELECT 
    'Políticas RLS' as item,
    COUNT(*) as quantidade
FROM pg_policies 
WHERE tablename IN ('lista_material', 'itens_material')
UNION ALL
SELECT 
    'Índices criados' as item,
    COUNT(*) as quantidade
FROM pg_indexes 
WHERE tablename IN ('lista_material', 'itens_material');
