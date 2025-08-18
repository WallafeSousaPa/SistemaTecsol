-- Script para verificar como está armazenado o role na tabela profiles
-- para usuários instaladores

-- Verificar todos os usuários com role relacionado a instalador
SELECT 
    id,
    nome,
    role,
    status,
    CASE 
        WHEN role = 'instalador' THEN '✅ Minúsculo'
        WHEN role = 'Instalador' THEN '⚠️ Primeira letra maiúscula'
        WHEN role = 'INSTALADOR' THEN '⚠️ Tudo maiúsculo'
        ELSE '❓ Outro formato: ' || role
    END as formato_role
FROM profiles 
WHERE role ILIKE '%instalador%'
ORDER BY role;

-- Verificar se há diferenças de case
SELECT 
    role,
    COUNT(*) as quantidade,
    STRING_AGG(nome, ', ') as usuarios
FROM profiles 
WHERE role ILIKE '%instalador%'
GROUP BY role
ORDER BY role;

-- Verificar usuários ativos com role de instalador
SELECT 
    id,
    nome,
    role,
    status
FROM profiles 
WHERE role ILIKE '%instalador%' 
    AND status = 'ativo'
ORDER BY nome;

-- Verificar se há usuários instaladores associados a clientes
SELECT 
    p.id as profile_id,
    p.nome,
    p.role,
    p.status,
    cu.cliente_id,
    cu.ativo as cliente_usuario_ativo
FROM profiles p
LEFT JOIN clientes_usuarios cu ON p.id = cu.profile_id
WHERE p.role ILIKE '%instalador%'
ORDER BY p.nome;
