-- Script para criar tabela de status e refatorar sistema de status dos clientes
-- Execute este script no SQL Editor do Supabase
-- Usando nome alternativo para evitar conflitos

-- 1. Criar a nova tabela com nome alternativo
CREATE TABLE IF NOT EXISTS status_clientes (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL UNIQUE,
    ativo BOOLEAN DEFAULT true,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inserir os status padrão
INSERT INTO status_clientes (status, ativo) VALUES
    ('Pendente', true),
    ('Em andamento', true),
    ('Finalizado', true),
    ('Validado', true)
ON CONFLICT (status) DO NOTHING;

-- 3. Adicionar nova coluna id_status na tabela clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS id_status INTEGER;

-- 4. Criar foreign key para status_clientes
ALTER TABLE clientes
ADD CONSTRAINT fk_clientes_status
FOREIGN KEY (id_status) REFERENCES status_clientes(id);

-- 5. Migrar dados existentes da coluna status para id_status
UPDATE clientes
SET id_status = (
    SELECT id
    FROM status_clientes
    WHERE LOWER(status_clientes.status) = LOWER(clientes.status)
);

-- 6. Verificar se a migração foi bem-sucedida
SELECT
    c.id,
    c.nome_cliente,
    c.status as status_antigo,
    c.id_status,
    sc.status as status_novo
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
ORDER BY c.id;

-- 7. Após confirmar que a migração foi bem-sucedida, remover a coluna status antiga
-- DESCOMENTE A LINHA ABAIXO APÓS VERIFICAR QUE A MIGRAÇÃO FUNCIONOU
-- ALTER TABLE clientes DROP COLUMN status;
