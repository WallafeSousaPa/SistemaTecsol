-- Script para atualizar a constraint do campo 'role' na tabela 'profiles'
-- Este script remove a constraint antiga que limitava os valores de role
-- Execute este script no SQL Editor do Supabase

-- 1. Remover a constraint antiga do campo role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Atualizar o campo role para aceitar qualquer valor (será validado pela aplicação)
ALTER TABLE profiles ALTER COLUMN role TYPE VARCHAR(100);

-- 3. Adicionar comentário explicativo
COMMENT ON COLUMN profiles.role IS 'Função/Cargo do usuário (referência à tabela cargos)';

-- 4. Verificar se a alteração foi aplicada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    constraint_name
FROM information_schema.columns c
LEFT JOIN information_schema.table_constraints tc ON 
    tc.table_name = c.table_name AND 
    tc.constraint_type = 'CHECK'
WHERE c.table_name = 'profiles' AND c.column_name = 'role';

-- 5. Verificar se não há mais constraints restritivas no campo role
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'profiles' AND cc.column_name = 'role';
