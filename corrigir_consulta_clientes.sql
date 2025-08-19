-- Script para corrigir problemas na consulta de clientes
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar e corrigir estrutura da tabela clientes
DO $$
BEGIN
    -- Adicionar coluna created_at se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clientes' AND column_name = 'created_at') THEN
        ALTER TABLE clientes ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna created_at adicionada';
    END IF;
    
    -- Adicionar coluna id_status se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clientes' AND column_name = 'id_status') THEN
        ALTER TABLE clientes ADD COLUMN id_status INTEGER;
        RAISE NOTICE 'Coluna id_status adicionada';
    END IF;
    
    -- Adicionar coluna usuario_instalador_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clientes' AND column_name = 'usuario_instalador_id') THEN
        ALTER TABLE clientes ADD COLUMN usuario_instalador_id UUID REFERENCES profiles(id);
        RAISE NOTICE 'Coluna usuario_instalador_id adicionada';
    END IF;
END $$;

-- 2. Garantir que as tabelas relacionadas existem
CREATE TABLE IF NOT EXISTS tipo_servico (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ativo BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS tipo_padrao (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ativo BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS equipes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ativo BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS status_clientes (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL UNIQUE,
    ativo BOOLEAN DEFAULT true
);

-- 3. Inserir dados padrão se as tabelas estiverem vazias
INSERT INTO tipo_servico (nome, ativo) VALUES 
    ('Instalação Residencial', true),
    ('Instalação Comercial', true),
    ('Manutenção', true)
ON CONFLICT (nome) DO NOTHING;

INSERT INTO tipo_padrao (nome, ativo) VALUES 
    ('Padrão A', true),
    ('Padrão B', true),
    ('Padrão C', true)
ON CONFLICT (nome) DO NOTHING;

INSERT INTO equipes (nome, ativo) VALUES 
    ('Equipe 1', true),
    ('Equipe 2', true),
    ('Equipe 3', true)
ON CONFLICT (nome) DO NOTHING;

INSERT INTO status_clientes (status, ativo) VALUES 
    ('Pendente', true),
    ('Em andamento', true),
    ('Finalizado', true),
    ('Validado', true)
ON CONFLICT (status) DO NOTHING;

-- 4. Atualizar clientes existentes com valores padrão
UPDATE clientes 
SET id_status = (SELECT id FROM status_clientes WHERE status = 'Pendente' LIMIT 1)
WHERE id_status IS NULL;

-- 5. Verificar se há dados na tabela clientes
SELECT COUNT(*) as total_clientes FROM clientes;

-- 6. Testar a consulta que está sendo usada no código
SELECT 
    c.*,
    ts.nome as tipo_servico_nome,
    tp.nome as tipo_padrao_nome,
    e.nome as equipe_nome,
    sc.status as status_nome
FROM clientes c
LEFT JOIN tipo_servico ts ON c.tipo_servico_id = ts.id
LEFT JOIN tipo_padrao tp ON c.tipo_padrao_id = tp.id
LEFT JOIN equipes e ON c.equipe_id = e.id
LEFT JOIN status_clientes sc ON c.id_status = sc.id
ORDER BY COALESCE(c.created_at, c.data_cadastro) DESC
LIMIT 5;
