-- Script para criar a tabela 'profiles' no Supabase
-- Execute este script no SQL Editor do Supabase se a tabela não existir

-- 1. Criar tabela profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'desativado')),
    role VARCHAR(50) DEFAULT 'instalador' CHECK (role IN ('administrador', 'administrativo', 'instalador')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- 3. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();

-- 5. Comentários sobre a tabela
COMMENT ON TABLE profiles IS 'Tabela para armazenar perfis dos usuários do sistema';
COMMENT ON COLUMN profiles.id IS 'ID do usuário (referência à tabela auth.users)';
COMMENT ON COLUMN profiles.email IS 'Email do usuário';
COMMENT ON COLUMN profiles.nome IS 'Nome completo do usuário';
COMMENT ON COLUMN profiles.status IS 'Status do usuário (ativo/desativado)';
COMMENT ON COLUMN profiles.role IS 'Perfil de acesso do usuário (administrador, administrativo, instalador)';
COMMENT ON COLUMN profiles.created_at IS 'Data de criação do perfil';
COMMENT ON COLUMN profiles.updated_at IS 'Data da última atualização do perfil';

-- 6. Políticas de segurança RLS (Row Level Security)
-- Desabilitar RLS por padrão - você pode habilitar e configurar conforme necessário
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Exemplo de política RLS (descomente se quiser usar):
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Usuários podem ver seus próprios perfis" ON profiles
--   FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON profiles
--   FOR UPDATE USING (auth.uid() = id);
-- CREATE POLICY "Administradores podem gerenciar todos os perfis" ON profiles
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM profiles 
--       WHERE id = auth.uid() AND role = 'administrador'
--     )
--   );

-- 7. Verificar se a tabela foi criada
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name = 'profiles';

-- 8. Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
