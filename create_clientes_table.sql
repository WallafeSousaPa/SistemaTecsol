-- Script para criar as tabelas relacionadas aos clientes no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela equipes PRIMEIRO (necessária para a foreign key)
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

-- 2. Criar tabela tipo_servico
CREATE TABLE IF NOT EXISTS tipo_servico (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela tipo_padrao
CREATE TABLE IF NOT EXISTS tipo_padrao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela gerentes
CREATE TABLE IF NOT EXISTS gerentes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(20),
    cargo VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela clientes com foreign keys (AGORA equipes já existe)
CREATE TABLE IF NOT EXISTS clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_cliente VARCHAR(255) NOT NULL,
    data_instalacao DATE,
    tipo_servico_id UUID REFERENCES tipo_servico(id),
    gerente_id UUID REFERENCES gerentes(id),
    devolucao_material BOOLEAN,
    quantidade_modulos INTEGER,
    tipo_padrao_id UUID REFERENCES tipo_padrao(id),
    configuracao_inversor BOOLEAN,
    deslocamento_buscar_material BOOLEAN,
    obra_civil BOOLEAN,
    equipe_id UUID REFERENCES equipes(id),
    data_cadastro DATE DEFAULT CURRENT_DATE,
    obra_cancelada BOOLEAN DEFAULT FALSE,
    nota_material BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_equipes_nome ON equipes(nome);
CREATE INDEX IF NOT EXISTS idx_equipes_ativo ON equipes(ativo);

CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome_cliente);
CREATE INDEX IF NOT EXISTS idx_clientes_data_cadastro ON clientes(data_cadastro);
CREATE INDEX IF NOT EXISTS idx_clientes_obra_cancelada ON clientes(obra_cancelada);
CREATE INDEX IF NOT EXISTS idx_clientes_tipo_servico ON clientes(tipo_servico_id);
CREATE INDEX IF NOT EXISTS idx_clientes_tipo_padrao ON clientes(tipo_padrao_id);
CREATE INDEX IF NOT EXISTS idx_clientes_gerente ON clientes(gerente_id);
CREATE INDEX IF NOT EXISTS idx_clientes_equipe ON clientes(equipe_id);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_equipes_updated_at 
    BEFORE UPDATE ON equipes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tipo_servico_updated_at 
    BEFORE UPDATE ON tipo_servico 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tipo_padrao_updated_at 
    BEFORE UPDATE ON tipo_padrao 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gerentes_updated_at 
    BEFORE UPDATE ON gerentes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at 
    BEFORE UPDATE ON clientes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados padrão na tabela equipes
INSERT INTO equipes (nome, lider, telefone, email) VALUES
    ('Tecsol 01', 'Rondinele', '(11) 99999-9999', 'tecsol01@empresa.com'),
    ('Tecsol 02', 'Walter', '(11) 88888-8888', 'tecsol02@empresa.com'),
    ('Tecsol 03', 'Sem Lider', '(11) 77777-7777', 'tecsol03@empresa.com'),
    ('Tecsol Macapa 01', 'Rondinele', '(11) 66666-6666', 'tecsol.macapa01@empresa.com')
ON CONFLICT (nome) DO NOTHING;

-- Inserir dados padrão na tabela tipo_servico
INSERT INTO tipo_servico (nome, descricao) VALUES
    ('Instalação', 'Instalação de sistema fotovoltaico'),
    ('Obra Cívil', 'Obra para executar a instalação'),
    ('Manutenção Corretiva', 'Realizado alguma manutenção no sistema'),
    ('Reinstalação', 'Reinstalar o sistema, modulos ou padrão'),
    ('Desinstalação/Reinstalação', 'Desinstalação/Reinstalação'),
    ('Padrão de Entrada', 'Instalado somente o padrão da concessionaria'),
    ('Instalação de Inversor', 'Somente instalação do inversor')
ON CONFLICT (nome) DO NOTHING;

-- Inserir dados padrão na tabela tipo_padrao
INSERT INTO tipo_padrao (nome, descricao) VALUES
    ('Fachada', 'Instalado o padrão no muro ou na frenteda casa do cliente.'),
    ('Poste Auxiliar', 'E instalado um poste de 5m ou 7m.'),
    ('Saga', 'Padrão de 3 compatimentos.'),
    ('Não Instalado', 'Por algum motivo não foi instalado o padrão.')
ON CONFLICT (nome) DO NOTHING;

-- Inserir dados padrão na tabela gerentes
INSERT INTO gerentes (nome, email, cargo) VALUES
    ('Rondinele Oliveira De Almeida', 'rondineleoliveira2@gmail.com', 'Coordenador'),
    ('Rafael Menezes Sants Da Silva', 'rafaelmenezes79660@gmail.com', 'Coordenador'),
    ('Walter Henrique Rocha Dos Santos', 'Walterhenrique83@gmail.com', 'Coordenador')
ON CONFLICT (email) DO NOTHING;

-- Comentários sobre as tabelas
COMMENT ON TABLE equipes IS 'Tabela para armazenar informações das equipes de trabalho';
COMMENT ON COLUMN equipes.nome IS 'Nome da equipe';
COMMENT ON COLUMN equipes.descricao IS 'Descrição da função da equipe';
COMMENT ON COLUMN equipes.lider IS 'Nome do líder da equipe';
COMMENT ON COLUMN equipes.telefone IS 'Telefone de contato da equipe';
COMMENT ON COLUMN equipes.email IS 'Email de contato da equipe';
COMMENT ON COLUMN equipes.ativo IS 'Indica se a equipe está ativa';

COMMENT ON TABLE tipo_servico IS 'Tabela para armazenar tipos de serviços disponíveis';
COMMENT ON COLUMN tipo_servico.nome IS 'Nome do tipo de serviço';
COMMENT ON COLUMN tipo_servico.descricao IS 'Descrição detalhada do serviço';
COMMENT ON COLUMN tipo_servico.ativo IS 'Indica se o tipo de serviço está ativo';

COMMENT ON TABLE tipo_padrao IS 'Tabela para armazenar tipos de padrão disponíveis';
COMMENT ON COLUMN tipo_padrao.nome IS 'Nome do tipo de padrão';
COMMENT ON COLUMN tipo_padrao.descricao IS 'Descrição detalhada do padrão';
COMMENT ON COLUMN tipo_padrao.ativo IS 'Indica se o tipo de padrão está ativo';

COMMENT ON TABLE gerentes IS 'Tabela para armazenar informações dos gerentes responsáveis pelos projetos';
COMMENT ON COLUMN gerentes.nome IS 'Nome completo do gerente';
COMMENT ON COLUMN gerentes.email IS 'Email de contato do gerente';
COMMENT ON COLUMN gerentes.telefone IS 'Telefone de contato do gerente';
COMMENT ON COLUMN gerentes.cargo IS 'Cargo ou função do gerente';
COMMENT ON COLUMN gerentes.ativo IS 'Indica se o gerente está ativo';

COMMENT ON TABLE clientes IS 'Tabela para armazenar informações dos clientes do sistema';
COMMENT ON COLUMN clientes.nome_cliente IS 'Nome completo do cliente';
COMMENT ON COLUMN clientes.data_instalacao IS 'Data da instalação do serviço';
COMMENT ON COLUMN clientes.tipo_servico_id IS 'Referência ao tipo de serviço';
COMMENT ON COLUMN clientes.gerente_id IS 'Referência ao gerente responsável';
COMMENT ON COLUMN clientes.devolucao_material IS 'Indica se houve devolução de material (Sim/Não)';
COMMENT ON COLUMN clientes.quantidade_modulos IS 'Quantidade de módulos instalados';
COMMENT ON COLUMN clientes.tipo_padrao_id IS 'Referência ao tipo de padrão';
COMMENT ON COLUMN clientes.configuracao_inversor IS 'Status da configuração do inversor (Sim/Não)';
COMMENT ON COLUMN clientes.deslocamento_buscar_material IS 'Indica se houve deslocamento para buscar material (Sim/Não)';
COMMENT ON COLUMN clientes.obra_civil IS 'Indica se há obra civil envolvida (Sim/Não)';
COMMENT ON COLUMN clientes.equipe_id IS 'Referência à equipe responsável';
COMMENT ON COLUMN clientes.data_cadastro IS 'Data de cadastro do cliente no sistema';
COMMENT ON COLUMN clientes.obra_cancelada IS 'Indica se a obra foi cancelada';
COMMENT ON COLUMN clientes.nota_material IS 'Indica se há nota sobre material (Sim/Não)';

-- Políticas de segurança RLS (Row Level Security)
-- Desabilitar RLS por padrão - você pode habilitar e configurar conforme necessário
ALTER TABLE equipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE tipo_servico DISABLE ROW LEVEL SECURITY;
ALTER TABLE tipo_padrao DISABLE ROW LEVEL SECURITY;
ALTER TABLE gerentes DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;

-- Exemplo de política RLS (descomente se quiser usar):
-- ALTER TABLE tipo_servico ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tipo_padrao ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gerentes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Usuários autenticados podem ver tipos de serviço" ON tipo_servico
--     FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "Usuários autenticados podem ver tipos de padrão" ON tipo_padrao
--     FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "Usuários autenticados podem ver gerentes" ON gerentes
--     FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "Usuários autenticados podem ver todos os clientes" ON clientes
--     FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "Usuários autenticados podem inserir clientes" ON clientes
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Usuários autenticados podem atualizar clientes" ON clientes
--     FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Usuários autenticados podem deletar clientes" ON clientes
--     FOR DELETE USING (auth.role() = 'authenticated');
