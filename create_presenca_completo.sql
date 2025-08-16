-- Script completo para criar o sistema de presença com múltiplos colaboradores
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela equipes (se não existir)
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

-- 2. Criar tabela colaboradores (se não existir)
CREATE TABLE IF NOT EXISTS colaboradores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cargo VARCHAR(100),
    email VARCHAR(255),
    chave_pix VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela veiculos (se não existir)
CREATE TABLE IF NOT EXISTS veiculos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    veiculo VARCHAR(255) NOT NULL,
    placa VARCHAR(12),
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela presenca principal
CREATE TABLE IF NOT EXISTS presenca (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data_presenca DATE NOT NULL,
    data_cadastro_preenchido DATE DEFAULT CURRENT_DATE,
    equipe_id UUID REFERENCES equipes(id),
    tipo_presenca VARCHAR(20) DEFAULT 'individual' CHECK (tipo_presenca IN ('individual', 'grupo')),
    veiculo_id UUID REFERENCES veiculos(id),
    km_inicial INTEGER,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela de relacionamento para múltiplos colaboradores
CREATE TABLE IF NOT EXISTS presenca_colaboradores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    presenca_id UUID REFERENCES presenca(id) ON DELETE CASCADE,
    colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
    presente BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(presenca_id, colaborador_id)
);

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_equipes_nome ON equipes(nome);
CREATE INDEX IF NOT EXISTS idx_equipes_ativo ON equipes(ativo);

CREATE INDEX IF NOT EXISTS idx_colaboradores_nome ON colaboradores(nome);
CREATE INDEX IF NOT EXISTS idx_colaboradores_ativo ON colaboradores(ativo);
CREATE INDEX IF NOT EXISTS idx_colaboradores_cargo ON colaboradores(cargo);

CREATE INDEX IF NOT EXISTS idx_veiculos_veiculo ON veiculos(veiculo);
CREATE INDEX IF NOT EXISTS idx_veiculos_ativo ON veiculos(ativo);
CREATE INDEX IF NOT EXISTS idx_veiculos_placa ON veiculos(placa);

CREATE INDEX IF NOT EXISTS idx_presenca_data ON presenca(data_presenca);
CREATE INDEX IF NOT EXISTS idx_presenca_equipe ON presenca(equipe_id);
CREATE INDEX IF NOT EXISTS idx_presenca_tipo ON presenca(tipo_presenca);
CREATE INDEX IF NOT EXISTS idx_presenca_veiculo ON presenca(veiculo_id);

CREATE INDEX IF NOT EXISTS idx_presenca_colaboradores_presenca ON presenca_colaboradores(presenca_id);
CREATE INDEX IF NOT EXISTS idx_presenca_colaboradores_colaborador ON presenca_colaboradores(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_presenca_colaboradores_presente ON presenca_colaboradores(presente);

-- 7. Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_equipes_updated_at 
    BEFORE UPDATE ON equipes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_colaboradores_updated_at 
    BEFORE UPDATE ON colaboradores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_veiculos_updated_at 
    BEFORE UPDATE ON veiculos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presenca_updated_at 
    BEFORE UPDATE ON presenca 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presenca_colaboradores_updated_at 
    BEFORE UPDATE ON presenca_colaboradores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Inserir dados padrão na tabela equipes
INSERT INTO equipes (nome, descricao, lider, telefone, email) VALUES 
    ('Equipe A', 'Equipe principal de instalação', 'João Silva', '(11) 99999-9999', 'equipea@empresa.com'),
    ('Equipe B', 'Equipe de manutenção', 'Maria Santos', '(11) 88888-8888', 'equipeb@empresa.com'),
    ('Equipe C', 'Equipe de suporte', 'Pedro Costa', '(11) 77777-7777', 'equipec@empresa.com')
ON CONFLICT (nome) DO NOTHING;

-- 10. Inserir dados padrão na tabela colaboradores
INSERT INTO colaboradores (nome, cargo, email, chave_pix) VALUES 
    ('João Silva', 'Instalador', 'joao.silva@empresa.com', 'joao.silva@empresa.com'),
    ('Maria Santos', 'Técnico', 'maria.santos@empresa.com', 'maria.santos@empresa.com'),
    ('Pedro Costa', 'Auxiliar', 'pedro.costa@empresa.com', 'pedro.costa@empresa.com'),
    ('Ana Oliveira', 'Instalador', 'ana.oliveira@empresa.com', 'ana.oliveira@empresa.com'),
    ('Carlos Lima', 'Técnico', 'carlos.lima@empresa.com', 'carlos.lima@empresa.com'),
    ('Fernanda Rocha', 'Auxiliar', 'fernanda.rocha@empresa.com', 'fernanda.rocha@empresa.com')
ON CONFLICT (nome) DO NOTHING;

-- 11. Inserir dados padrão na tabela veiculos
INSERT INTO veiculos (veiculo, placa, ativo) VALUES 
    ('Van Branca - ABC-1234', 'ABC-1234', true),
    ('Van Azul - XYZ-5678', 'XYZ-5678', true),
    ('Caminhão - DEF-9012', 'DEF-9012', true),
    ('Carro - GHI-3456', 'GHI-3456', true),
    ('Van Vermelha - JKL-7890', 'JKL-7890', true)
ON CONFLICT (veiculo) DO NOTHING;

-- 12. Comentários sobre as tabelas
COMMENT ON TABLE equipes IS 'Tabela para armazenar informações das equipes de trabalho';
COMMENT ON COLUMN equipes.nome IS 'Nome da equipe';
COMMENT ON COLUMN equipes.descricao IS 'Descrição da função da equipe';
COMMENT ON COLUMN equipes.lider IS 'Nome do líder da equipe';
COMMENT ON COLUMN equipes.telefone IS 'Telefone de contato da equipe';
COMMENT ON COLUMN equipes.email IS 'Email de contato da equipe';
COMMENT ON COLUMN equipes.ativo IS 'Indica se a equipe está ativa';

COMMENT ON TABLE colaboradores IS 'Tabela para armazenar informações dos colaboradores da empresa';
COMMENT ON COLUMN colaboradores.nome IS 'Nome completo do colaborador';
COMMENT ON COLUMN colaboradores.cargo IS 'Cargo ou função do colaborador';
COMMENT ON COLUMN colaboradores.email IS 'Email de contato do colaborador';
COMMENT ON COLUMN colaboradores.chave_pix IS 'Chave PIX para pagamentos';
COMMENT ON COLUMN colaboradores.ativo IS 'Indica se o colaborador está ativo';

COMMENT ON TABLE veiculos IS 'Tabela para armazenar informações dos veículos da empresa';
COMMENT ON COLUMN veiculos.veiculo IS 'Identificação do veículo (modelo, cor, placa)';
COMMENT ON COLUMN veiculos.placa IS 'Placa do veículo';
COMMENT ON COLUMN veiculos.ativo IS 'Indica se o veículo está ativo';
COMMENT ON COLUMN veiculos.data_cadastro IS 'Data de cadastro do veículo no sistema';

COMMENT ON TABLE presenca IS 'Tabela principal para armazenar o controle de presença das equipes';
COMMENT ON COLUMN presenca.data_presenca IS 'Data da presença';
COMMENT ON COLUMN presenca.data_cadastro_preenchido IS 'Data em que o registro foi preenchido';
COMMENT ON COLUMN presenca.equipe_id IS 'Referência à equipe';
COMMENT ON COLUMN presenca.tipo_presenca IS 'Tipo de presença: individual (um colaborador) ou grupo (múltiplos colaboradores)';
COMMENT ON COLUMN presenca.veiculo_id IS 'Referência ao veículo utilizado';
COMMENT ON COLUMN presenca.km_inicial IS 'Quilometragem inicial do veículo';
COMMENT ON COLUMN presenca.observacoes IS 'Observações gerais sobre a presença';

COMMENT ON TABLE presenca_colaboradores IS 'Tabela de relacionamento para controlar presença de múltiplos colaboradores';
COMMENT ON COLUMN presenca_colaboradores.presenca_id IS 'Referência ao registro de presença';
COMMENT ON COLUMN presenca_colaboradores.colaborador_id IS 'Referência ao colaborador';
COMMENT ON COLUMN presenca_colaboradores.presente IS 'Indica se o colaborador está presente';
COMMENT ON COLUMN presenca_colaboradores.observacoes IS 'Observações específicas para este colaborador';

-- 13. Exemplo de como usar a nova estrutura
-- Para criar uma presença com múltiplos colaboradores:
/*
-- 1. Criar o registro de presença
INSERT INTO presenca (data_presenca, data_cadastro_preenchido, equipe_id, veiculo_id, km_inicial, observacoes, tipo_presenca)
VALUES ('2024-01-15', CURRENT_DATE, 
        (SELECT id FROM equipes WHERE nome = 'Equipe A' LIMIT 1),
        (SELECT id FROM veiculos WHERE veiculo LIKE '%Van Branca%' LIMIT 1),
        50000, 'Presença da equipe completa', 'grupo')
RETURNING id;

-- 2. Inserir os colaboradores (substitua 'presenca-uuid' pelo ID retornado acima)
INSERT INTO presenca_colaboradores (presenca_id, colaborador_id, presente, observacoes)
VALUES 
    ('presenca-uuid', (SELECT id FROM colaboradores WHERE nome = 'João Silva' LIMIT 1), TRUE, 'Presente'),
    ('presenca-uuid', (SELECT id FROM colaboradores WHERE nome = 'Maria Santos' LIMIT 1), TRUE, 'Presente'),
    ('presenca-uuid', (SELECT id FROM colaboradores WHERE nome = 'Pedro Costa' LIMIT 1), FALSE, 'Ausente - Justificado');
*/

-- 14. Verificar se as tabelas foram criadas corretamente
SELECT 
    'equipes' as tabela,
    COUNT(*) as registros
FROM equipes
UNION ALL
SELECT 
    'colaboradores' as tabela,
    COUNT(*) as registros
FROM colaboradores
UNION ALL
SELECT 
    'veiculos' as tabela,
    COUNT(*) as registros
FROM veiculos
UNION ALL
SELECT 
    'presenca' as tabela,
    COUNT(*) as registros
FROM presenca
UNION ALL
SELECT 
    'presenca_colaboradores' as tabela,
    COUNT(*) as registros
FROM presenca_colaboradores
ORDER BY tabela;
