-- Script para atualizar a tabela 'profiles' existente no Supabase
-- Execute este script no SQL Editor do Supabase para adicionar o campo role

-- 1. Adicionar a coluna role à tabela profiles existente
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'instalador';

-- 2. Criar índice para a nova coluna
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 3. Atualizar comentários da tabela
COMMENT ON COLUMN profiles.role IS 'Perfil de acesso do usuário (administrador, administrativo, instalador)';

-- 4. Atualizar usuários existentes para ter role padrão se não especificado
UPDATE profiles SET role = 'instalador' WHERE role IS NULL OR role = '';

-- 5. Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'role';

-- 6. Mostrar estrutura atual da tabela profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 7. Verificar dados existentes
SELECT id, email, nome, status, role, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;
