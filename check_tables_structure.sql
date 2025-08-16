-- Script para verificar a estrutura atual das tabelas no Supabase
-- Execute este script para ver o que já existe no seu banco

-- 1. Verificar quais tabelas existem
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('equipes', 'tipo_servico', 'tipo_padrao', 'gerentes', 'clientes')
ORDER BY table_name;

-- 2. Verificar estrutura da tabela equipes (se existir)
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'equipes') 
        THEN 'Tabela equipes EXISTE'
        ELSE 'Tabela equipes NÃO EXISTE'
    END as status_equipes;

-- 3. Verificar estrutura da tabela clientes (se existir)
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clientes') 
        THEN 'Tabela clientes EXISTE'
        ELSE 'Tabela clientes NÃO EXISTE'
    END as status_clientes;

-- 4. Se a tabela clientes existir, mostrar suas colunas
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clientes') THEN
        RAISE NOTICE 'Estrutura da tabela clientes:';
        PERFORM column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'clientes' 
        ORDER BY ordinal_position;
    ELSE
        RAISE NOTICE 'Tabela clientes não existe';
    END IF;
END $$;

-- 5. Verificar se há dados nas tabelas
SELECT 
    'equipes' as tabela,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'equipes') 
        THEN (SELECT COUNT(*) FROM equipes)
        ELSE 0
    END as quantidade_registros
UNION ALL
SELECT 
    'clientes' as tabela,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clientes') 
        THEN (SELECT COUNT(*) FROM clientes)
        ELSE 0
    END as quantidade_registros;
