-- Script para verificar a tabela clientes_usuarios e identificar problemas
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela clientes_usuarios existe
SELECT 
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'clientes_usuarios'
    ) AS tabela_existe;

-- 2. Verificar a estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'clientes_usuarios'
ORDER BY ordinal_position;

-- 3. Verificar constraints da tabela
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

-- 4. Verificar se há dados na tabela
SELECT COUNT(*) as total_registros FROM clientes_usuarios;

-- 5. Verificar alguns registros de exemplo
SELECT * FROM clientes_usuarios LIMIT 5;

-- 6. Verificar se há problemas com UUIDs
SELECT 
    cliente_id,
    profile_id,
    tipo_relacao,
    ativo,
    data_associacao
FROM clientes_usuarios 
WHERE cliente_id IS NULL OR profile_id IS NULL
LIMIT 10;

-- 7. Verificar se há problemas de referência
SELECT 
    cu.cliente_id,
    cu.profile_id,
    CASE 
        WHEN c.id IS NULL THEN '❌ Cliente não existe'
        ELSE '✅ Cliente existe'
    END as status_cliente,
    CASE 
        WHEN p.id IS NULL THEN '❌ Profile não existe'
        ELSE '✅ Profile existe'
    END as status_profile
FROM clientes_usuarios cu
LEFT JOIN clientes c ON cu.cliente_id = c.id
LEFT JOIN profiles p ON cu.profile_id = p.id
WHERE c.id IS NULL OR p.id IS NULL
LIMIT 10;

-- 8. Verificar se há registros duplicados
SELECT 
    cliente_id,
    profile_id,
    tipo_relacao,
    COUNT(*) as total_duplicados
FROM clientes_usuarios
GROUP BY cliente_id, profile_id, tipo_relacao
HAVING COUNT(*) > 1
ORDER BY total_duplicados DESC;

-- 9. Testar inserção de um registro de teste
-- DESCOMENTE AS LINHAS ABAIXO APÓS VERIFICAR QUE A ESTRUTURA ESTÁ CORRETA
/*
INSERT INTO clientes_usuarios (cliente_id, profile_id, tipo_relacao, ativo)
VALUES (
    (SELECT id FROM clientes LIMIT 1),
    (SELECT id FROM profiles WHERE role = 'instalador' LIMIT 1),
    'instalador',
    true
) ON CONFLICT (cliente_id, profile_id, tipo_relacao) DO NOTHING;

-- Verificar se foi inserido
SELECT * FROM clientes_usuarios ORDER BY data_associacao DESC LIMIT 1;
*/
