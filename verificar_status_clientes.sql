-- Script simples para verificar se há dados na tabela status_clientes
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela status_clientes existe
SELECT 
    'Verificando tabela status_clientes' as info,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'status_clientes') 
        THEN '✅ Tabela EXISTE'
        ELSE '❌ Tabela NÃO EXISTE'
    END as status_tabela;

-- 2. Verificar se há dados na tabela
SELECT 
    'Dados na tabela status_clientes' as info,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativos
FROM status_clientes;

-- 3. Verificar os dados específicos
SELECT 
    'Dados específicos' as info,
    id,
    status,
    ativo,
    data_atualizacao
FROM status_clientes
ORDER BY id;

-- 4. Verificar se há algum problema com a estrutura
SELECT 
    'Estrutura da tabela' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'status_clientes'
ORDER BY ordinal_position;

-- 5. Testar inserção de dados se a tabela estiver vazia
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM status_clientes) THEN
        RAISE NOTICE 'Tabela status_clientes está vazia. Inserindo dados padrão...';
        
        INSERT INTO status_clientes (status, ativo) VALUES
            ('Pendente', true),
            ('Em andamento', true),
            ('Finalizado', true),
            ('Validado', true);
            
        RAISE NOTICE 'Dados padrão inseridos com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela status_clientes já possui dados.';
    END IF;
END $$;

-- 6. Verificar resultado final
SELECT 
    'Resultado final' as info,
    id,
    status,
    ativo
FROM status_clientes
ORDER BY id;
