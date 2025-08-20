-- Script para testar o filtro de clientes por usuário
-- Execute este script no SQL Editor do Supabase para verificar se está funcionando

-- 1. Verificar se as políticas RLS estão ativas
SELECT 
    'Status das políticas RLS' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'clientes'
ORDER BY policyname;

-- 2. Verificar se RLS está habilitado
SELECT 
    'Status RLS da tabela clientes' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'clientes';

-- 3. Verificar estrutura da tabela clientes_usuarios
SELECT 
    'Estrutura da tabela clientes_usuarios' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes_usuarios'
ORDER BY ordinal_position;

-- 4. Verificar dados de relacionamento
SELECT 
    'Relacionamentos cliente-usuário' as info,
    c.nome_cliente,
    p.nome as usuario,
    p.role,
    cu.tipo_relacao,
    cu.ativo,
    cu.data_associacao
FROM clientes c
JOIN clientes_usuarios cu ON c.id = cu.cliente_id
JOIN profiles p ON cu.profile_id = p.id
WHERE cu.ativo = true
ORDER BY c.nome_cliente, p.nome;

-- 5. Contar clientes por usuário
SELECT 
    'Total de clientes por usuário' as info,
    p.nome as usuario,
    p.role,
    COUNT(cu.cliente_id) as total_clientes
FROM profiles p
LEFT JOIN clientes_usuarios cu ON p.id = cu.profile_id AND cu.ativo = true
WHERE p.role = 'instalador'
GROUP BY p.id, p.nome, p.role
ORDER BY p.nome;

-- 6. Verificar se há clientes sem usuários associados
SELECT 
    'Clientes sem usuários associados' as info,
    c.nome_cliente,
    c.endereco,
    c.status
FROM clientes c
WHERE NOT EXISTS (
    SELECT 1 FROM clientes_usuarios cu 
    WHERE cu.cliente_id = c.id 
    AND cu.ativo = true
);

-- 7. Testar consulta simulando usuário específico (substitua o UUID pelo ID real)
-- Esta consulta simula o que um usuário instalador veria
SELECT 
    'Simulação de acesso do usuário' as info,
    c.nome_cliente,
    c.endereco,
    c.status,
    c.created_at
FROM clientes c
WHERE EXISTS (
    SELECT 1 FROM clientes_usuarios cu
    JOIN profiles p ON cu.profile_id = p.id
    WHERE cu.cliente_id = c.id
    AND p.id = '6d28d7a6-2b4c-496b-b977-8b3a84985772' -- Substitua pelo ID do usuário
    AND cu.ativo = true
)
ORDER BY c.nome_cliente;

-- 8. Verificar permissões da tabela
SELECT 
    'Permissões da tabela clientes' as info,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'clientes'
ORDER BY grantee, privilege_type;

-- 9. Verificar se há problemas de constraint
SELECT 
    'Verificação de constraints' as info,
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name IN ('clientes', 'clientes_usuarios', 'profiles')
ORDER BY table_name, constraint_type;
