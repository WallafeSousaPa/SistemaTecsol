-- Script para remover a coluna status antiga que pode estar causando conflito
-- Execute este script no SQL Editor do Supabase APÓS verificar que id_status está funcionando

-- 1. Primeiro, verificar se a coluna status antiga ainda existe
SELECT 
    'Verificando se coluna status antiga existe' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'clientes' AND column_name = 'status'
        ) THEN '⚠️ SIM - Coluna status antiga ainda existe'
        ELSE '✅ NÃO - Coluna status antiga não existe mais'
    END as status_coluna;

-- 2. Se a coluna existir, verificar se há dados nela
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'status'
    ) THEN
        RAISE NOTICE 'Verificando dados na coluna status antiga...';
        
        -- Verificar se há dados na coluna status
        IF EXISTS (
            SELECT 1 FROM clientes WHERE status IS NOT NULL
        ) THEN
            RAISE NOTICE '⚠️ ATENÇÃO: Coluna status antiga contém dados!';
            RAISE NOTICE 'Verifique se todos os dados foram migrados para id_status antes de remover.';
        ELSE
            RAISE NOTICE '✅ Coluna status antiga não contém dados.';
            RAISE NOTICE 'Pode ser removida com segurança.';
        END IF;
    END IF;
END $$;

-- 3. Verificar se id_status está funcionando corretamente
SELECT 
    'Verificando se id_status está funcionando' as info,
    COUNT(*) as total_clientes,
    COUNT(CASE WHEN id_status IS NOT NULL THEN 1 END) as com_id_status,
    COUNT(CASE WHEN id_status IS NULL THEN 1 END) as sem_id_status,
    COUNT(CASE WHEN id_status = 1 THEN 1 END) as status_pendente,
    COUNT(CASE WHEN id_status = 2 THEN 1 END) as status_em_andamento,
    COUNT(CASE WHEN id_status = 3 THEN 1 END) as status_finalizado,
    COUNT(CASE WHEN id_status = 4 THEN 1 END) as status_validado
FROM clientes;

-- 4. Verificar se a foreign key está funcionando
SELECT 
    'Verificando foreign key' as info,
    COUNT(*) as total_clientes,
    COUNT(CASE WHEN sc.status IS NOT NULL THEN 1 END) as fk_funcionando,
    COUNT(CASE WHEN sc.status IS NULL THEN 1 END) as fk_quebrada
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id;

-- 5. Se tudo estiver funcionando, remover a coluna status antiga
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'status'
    ) THEN
        -- Verificar se id_status está funcionando
        IF EXISTS (
            SELECT 1 FROM clientes c
            LEFT JOIN status_clientes sc ON c.id_status = sc.id
            WHERE sc.status IS NULL
        ) THEN
            RAISE NOTICE '❌ NÃO REMOVER: id_status ainda não está funcionando corretamente!';
            RAISE NOTICE 'Corrija os problemas com id_status primeiro.';
        ELSE
            RAISE NOTICE '✅ id_status está funcionando corretamente.';
            RAISE NOTICE 'Removendo coluna status antiga...';
            
            -- Remover a coluna status antiga
            ALTER TABLE clientes DROP COLUMN status;
            
            RAISE NOTICE '✅ Coluna status antiga removida com sucesso!';
        END IF;
    ELSE
        RAISE NOTICE '✅ Coluna status antiga já foi removida.';
    END IF;
END $$;

-- 6. Verificar resultado final
SELECT 
    'Estrutura final da tabela clientes' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name IN ('id_status')
ORDER BY column_name;

-- 7. Teste final: verificar se tudo ainda está funcionando
SELECT 
    'Teste final - Verificando funcionamento' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
ORDER BY c.id
LIMIT 5;
