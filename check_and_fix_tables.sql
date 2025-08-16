-- Script para verificar e corrigir as tabelas no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar quais tabelas existem
SELECT 
    'equipes' as tabela,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'equipes') 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as status
UNION ALL
SELECT 
    'clientes' as tabela,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clientes') 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as status
UNION ALL
SELECT 
    'tipo_servico' as tabela,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tipo_servico') 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as status
UNION ALL
SELECT 
    'tipo_padrao' as tabela,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tipo_padrao') 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as status
UNION ALL
SELECT 
    'gerentes' as tabela,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'gerentes') 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as status;

-- 2. Se a tabela equipes não existir, criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'equipes') THEN
        RAISE NOTICE 'Criando tabela equipes...';
        
        CREATE TABLE equipes (
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

        -- Criar índices
        CREATE INDEX idx_equipes_nome ON equipes(nome);
        CREATE INDEX idx_equipes_ativo ON equipes(ativo);

        -- Função para atualizar updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        -- Trigger para equipes
        CREATE TRIGGER update_equipes_updated_at
            BEFORE UPDATE ON equipes
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        -- Inserir dados padrão
        INSERT INTO equipes (nome, lider, telefone, email) VALUES
            ('Tecsol 01', 'Rondinele', '(11) 99999-9999', 'tecsol01@empresa.com'),
            ('Tecsol 02', 'Walter', '(11) 88888-8888', 'tecsol02@empresa.com'),
            ('Tecsol 03', 'Sem Lider', '(11) 77777-7777', 'tecsol03@empresa.com'),
            ('Tecsol Macapa 01', 'Rondinele', '(11) 66666-6666', 'tecsol.macapa01@empresa.com')
        ON CONFLICT (nome) DO NOTHING;

        RAISE NOTICE 'Tabela equipes criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela equipes já existe.';
    END IF;
END $$;

-- 3. Se a tabela clientes existir mas não tiver a coluna equipe_id, adicionar
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clientes') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'clientes' AND column_name = 'equipe_id') THEN
            RAISE NOTICE 'Adicionando coluna equipe_id à tabela clientes...';
            
            ALTER TABLE clientes ADD COLUMN equipe_id UUID REFERENCES equipes(id);
            CREATE INDEX idx_clientes_equipe ON clientes(equipe_id);
            
            RAISE NOTICE 'Coluna equipe_id adicionada com sucesso!';
        ELSE
            RAISE NOTICE 'Coluna equipe_id já existe na tabela clientes.';
        END IF;
    ELSE
        RAISE NOTICE 'Tabela clientes não existe ainda.';
    END IF;
END $$;

-- 4. Verificar estrutura final da tabela clientes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;

-- 5. Verificar se há dados nas tabelas
SELECT 
    'equipes' as tabela,
    COUNT(*) as quantidade_registros
FROM equipes
UNION ALL
SELECT 
    'clientes' as tabela,
    COUNT(*) as quantidade_registros
FROM clientes;
