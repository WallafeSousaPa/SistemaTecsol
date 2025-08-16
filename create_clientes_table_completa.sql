-- Script completo para criar tabela clientes com todos os campos
-- Execute este script no SQL Editor do Supabase

-- Primeiro, fazer backup dos dados existentes (se necessário)
-- CREATE TABLE clientes_backup AS SELECT * FROM clientes;

-- Dropar a tabela existente (CUIDADO: isso apagará todos os dados!)
-- DROP TABLE IF EXISTS clientes CASCADE;

-- Criar a tabela clientes completa
CREATE TABLE IF NOT EXISTS clientes (
    id BIGSERIAL PRIMARY KEY,
    nome_cliente VARCHAR(255) NOT NULL,
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(255),
    data_instalacao DATE,
    tipo_servico_id BIGINT REFERENCES tipos_servico(id),
    tipo_padrao_id BIGINT REFERENCES tipos_padrao(id),
    gerente_id BIGINT REFERENCES usuarios(id),
    equipe_id BIGINT REFERENCES equipes(id),
    data_cadastro DATE DEFAULT CURRENT_DATE,
    obra_cancelada BOOLEAN DEFAULT false,
    nota_material BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'finalizado', 'validado')),
    
    -- Campos de conclusão da obra
    devolucao_material BOOLEAN DEFAULT false,
    quantidade_modulos INTEGER,
    configuracao_inversor BOOLEAN DEFAULT false,
    deslocamento_buscar_material BOOLEAN DEFAULT false,
    obra_civil BOOLEAN DEFAULT false,
    observacoes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar comentários nas colunas
COMMENT ON TABLE clientes IS 'Tabela de clientes com campos para conclusão da obra';
COMMENT ON COLUMN clientes.nome_cliente IS 'Nome completo do cliente';
COMMENT ON COLUMN clientes.endereco IS 'Endereço completo do cliente';
COMMENT ON COLUMN clientes.telefone IS 'Telefone de contato';
COMMENT ON COLUMN clientes.email IS 'Email de contato';
COMMENT ON COLUMN clientes.data_instalacao IS 'Data prevista para instalação';
COMMENT ON COLUMN clientes.tipo_servico_id IS 'Referência ao tipo de serviço';
COMMENT ON COLUMN clientes.tipo_padrao_id IS 'Referência ao tipo de padrão';
COMMENT ON COLUMN clientes.gerente_id IS 'Referência ao gerente responsável';
COMMENT ON COLUMN clientes.equipe_id IS 'Referência à equipe responsável';
COMMENT ON COLUMN clientes.data_cadastro IS 'Data de cadastro do cliente';
COMMENT ON COLUMN clientes.obra_cancelada IS 'Indica se a obra foi cancelada';
COMMENT ON COLUMN clientes.nota_material IS 'Indica se foi emitida nota de material';
COMMENT ON COLUMN clientes.status IS 'Status atual da obra';
COMMENT ON COLUMN clientes.devolucao_material IS 'Indica se houve devolução de material';
COMMENT ON COLUMN clientes.quantidade_modulos IS 'Quantidade de módulos instalados';
COMMENT ON COLUMN clientes.configuracao_inversor IS 'Indica se o inversor foi configurado';
COMMENT ON COLUMN clientes.deslocamento_buscar_material IS 'Indica se houve deslocamento para buscar material';
COMMENT ON COLUMN clientes.obra_civil IS 'Indica se houve obra civil';
COMMENT ON COLUMN clientes.observacoes IS 'Observações sobre a conclusão da obra';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome_cliente);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_clientes_data_cadastro ON clientes(data_cadastro);
CREATE INDEX IF NOT EXISTS idx_clientes_tipo_servico ON clientes(tipo_servico_id);
CREATE INDEX IF NOT EXISTS idx_clientes_gerente ON clientes(gerente_id);

-- Função para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar automaticamente o timestamp
CREATE TRIGGER update_clientes_updated_at 
    BEFORE UPDATE ON clientes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar se a tabela foi criada corretamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;
