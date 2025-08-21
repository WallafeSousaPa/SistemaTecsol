-- Script de diagnóstico para problemas na tela de Lista de Material
-- Execute este script para identificar problemas específicos

-- 1. Verificar se o usuário está autenticado
SELECT '=== VERIFICAÇÃO DE AUTENTICAÇÃO ===' as info;
SELECT 
    'Usuário autenticado:' as status,
    auth.uid() as user_id,
    auth.role() as auth_role;

-- 2. Verificar se a tabela clientes existe e sua estrutura
SELECT '=== VERIFICAÇÃO DA TABELA CLIENTES ===' as info;
SELECT 
    table_name,
    table_type,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE table_name = 'clientes';

-- 3. Verificar estrutura da tabela clientes
SELECT '=== ESTRUTURA DA TABELA CLIENTES ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes'
ORDER BY ordinal_position;

-- 4. Verificar se RLS está habilitado
SELECT '=== STATUS DO RLS ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'clientes';

-- 5. Verificar políticas RLS ativas
SELECT '=== POLÍTICAS RLS ATIVAS ===' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'clientes'
ORDER BY policyname;

-- 6. Verificar se existem clientes na tabela
SELECT '=== CONTAGEM DE CLIENTES ===' as info;
SELECT 
    'Total de clientes:' as info,
    COUNT(*) as total_clientes
FROM clientes;

-- 7. Verificar clientes ativos
SELECT '=== CLIENTES ATIVOS ===' as info;
SELECT 
    'Clientes ativos:' as info,
    COUNT(*) as clientes_ativos
FROM clientes 
WHERE ativo = true;

-- 8. Verificar tabela profiles
SELECT '=== VERIFICAÇÃO DA TABELA PROFILES ===' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'profiles';

-- 9. Verificar se o usuário atual existe na tabela profiles
SELECT '=== VERIFICAÇÃO DO USUÁRIO ATUAL ===' as info;
SELECT 
    'Usuário no profiles:' as status,
    COUNT(*) as encontrado
FROM profiles 
WHERE id = auth.uid();

-- 10. Verificar role do usuário atual
SELECT '=== ROLE DO USUÁRIO ===' as info;
SELECT 
    id,
    role,
    nome,
    email
FROM profiles 
WHERE id = auth.uid();

-- 11. Verificar tabela clientes_usuarios
SELECT '=== VERIFICAÇÃO DA TABELA CLIENTES_USUARIOS ===' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'clientes_usuarios';

-- 12. Verificar relacionamentos do usuário atual
SELECT '=== RELACIONAMENTOS DO USUÁRIO ===' as info;
SELECT 
    'Relacionamentos ativos:' as info,
    COUNT(*) as total_relacionamentos
FROM clientes_usuarios cu
JOIN profiles p ON cu.profile_id = p.id
WHERE p.id = auth.uid()
AND cu.ativo = true;

-- 13. Teste de consulta direta (simular o que o frontend faz)
SELECT '=== TESTE DE CONSULTA DIRETA ===' as info;
SELECT 
    c.id,
    c.nome_cliente,
    c.ativo
FROM clientes c
WHERE c.ativo = true
ORDER BY c.nome_cliente
LIMIT 5;

-- 14. Teste de consulta com RLS (o que deveria funcionar)
SELECT '=== TESTE DE CONSULTA COM RLS ===' as info;
-- Esta consulta deve retornar apenas clientes autorizados
SELECT 
    'Consulta com RLS:' as status,
    COUNT(*) as clientes_autorizados
FROM clientes c
WHERE c.ativo = true;

-- 15. Verificar permissões do usuário
SELECT '=== PERMISSÕES DO USUÁRIO ===' as info;
SELECT 
    'Pode ver todos os clientes (admin):' as permissao,
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('administrador', 'administrativo')
    ) as tem_permissao;

-- 16. Verificar se há problemas de constraint
SELECT '=== VERIFICAÇÃO DE CONSTRAINTS ===' as info;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'clientes'
AND tc.constraint_type = 'FOREIGN KEY';

-- 17. Resumo final
SELECT '=== RESUMO FINAL ===' as info;
SELECT 
    'Tabela clientes existe' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clientes') 
        THEN '✅ SIM' 
        ELSE '❌ NÃO' 
    END as status
UNION ALL
SELECT 
    'RLS habilitado' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'clientes' AND rowsecurity = true) 
        THEN '✅ SIM' 
        ELSE '❌ NÃO' 
    END as status
UNION ALL
SELECT 
    'Políticas RLS criadas' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clientes') 
        THEN '✅ SIM' 
        ELSE '❌ NÃO' 
    END as status
UNION ALL
SELECT 
    'Usuário autenticado' as item,
    CASE 
        WHEN auth.uid() IS NOT NULL 
        THEN '✅ SIM' 
        ELSE '❌ NÃO' 
    END as status
UNION ALL
SELECT 
    'Usuário no profiles' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) 
        THEN '✅ SIM' 
        ELSE '❌ NÃO' 
    END as status
UNION ALL
SELECT 
    'Clientes existem' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM clientes) 
        THEN '✅ SIM' 
        ELSE '❌ NÃO' 
    END as status;
