-- Script para criar a tabela 'equipes' no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela equipes
CREATE TABLE IF NOT EXISTS equipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    descricao TEXT,
    lider VARCHAR(255),
    telefone VARCHAR(20),
    email VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_equipes_nome ON equipes(nome);
CREATE INDEX IF NOT EXISTS idx_equipes_ativo ON equipes(ativo);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_equipes_updated_at 
    BEFORE UPDATE ON equipes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados padrão na tabela equipes
INSERT INTO equipes (nome, lider, telefone, email) VALUES
    ('Tecsol 01', 'Rondinele', '(11) 99999-9999', 'tecsol01@empresa.com'),
    ('Tecsol 02', 'Walter', '(11) 88888-8888', 'tecsol02@empresa.com'),
    ('Tecsol 03', 'Sem Lider', '(11) 77777-7777', 'tecsol03@empresa.com'),
    ('Tecsol Macapa 01', 'Rondinele', '(11) 66666-6666', 'tecsol.macapa01@empresa.com')
ON CONFLICT (nome) DO NOTHING;

-- Comentários sobre a tabela
COMMENT ON TABLE equipes IS 'Tabela para armazenar informações das equipes de trabalho';
COMMENT ON COLUMN equipes.nome IS 'Nome da equipe';
COMMENT ON COLUMN equipes.descricao IS 'Descrição da função da equipe';
COMMENT ON COLUMN equipes.lider IS 'Nome do líder da equipe';
COMMENT ON COLUMN equipes.telefone IS 'Telefone de contato da equipe';
COMMENT ON COLUMN equipes.email IS 'Email de contato da equipe';
COMMENT ON COLUMN equipes.ativo IS 'Indica se a equipe está ativa';

-- Políticas de segurança RLS (Row Level Security)
-- Desabilitar RLS por padrão - você pode habilitar e configurar conforme necessário
ALTER TABLE equipes DISABLE ROW LEVEL SECURITY;

-- Exemplo de política RLS (descomente se quiser usar):
-- ALTER TABLE equipes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Usuários autenticados podem ver equipes" ON equipes
--     FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "Usuários autenticados podem inserir equipes" ON equipes
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Usuários autenticados podem atualizar equipes" ON equipes
--     FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Usuários autenticados podem deletar equipes" ON equipes
--     FOR DELETE USING (auth.role() = 'authenticated');
