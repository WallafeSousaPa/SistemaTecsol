-- Script para testar a consulta de clientes e identificar problemas
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela clientes existe e tem dados
SELECT 
    'Tabela clientes existe' as verificação,
    COUNT(*) as total_registros
FROM clientes;

-- 2. Verificar se a tabela status_clientes existe e tem dados
SELECT 
    'Tabela status_clientes existe' as verificação,
    COUNT(*) as total_registros
FROM status_clientes;

-- 3. Verificar se a tabela tipo_servico existe e tem dados
SELECT 
    'Tabela tipo_servico existe' as verificação,
    COUNT(*) as total_registros
FROM tipo_servico;

-- 4. Verificar se a tabela tipo_padrao existe e tem dados
SELECT 
    'Tabela tipo_padrao existe' as verificação,
    COUNT(*) as total_registros
FROM tipo_padrao;

-- 5. Verificar se a tabela equipes existe e tem dados
SELECT 
    'Tabela equipes existe' as verificação,
    COUNT(*) as total_registros
FROM equipes;

-- 6. Testar a consulta completa que está sendo usada no código
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
ORDER BY c.created_at DESC
LIMIT 10;

-- 7. Verificar se há problemas com foreign keys
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'clientes';

-- 8. Verificar se há registros órfãos (sem referências válidas)
SELECT 
    'Clientes sem tipo_servico válido' as problema,
    COUNT(*) as quantidade
FROM clientes c
LEFT JOIN tipo_servico ts ON c.tipo_servico_id = ts.id
WHERE c.tipo_servico_id IS NOT NULL AND ts.id IS NULL

UNION ALL

SELECT 
    'Clientes sem tipo_padrao válido' as problema,
    COUNT(*) as quantidade
FROM clientes c
LEFT JOIN tipo_padrao tp ON c.tipo_padrao_id = tp.id
WHERE c.tipo_padrao_id IS NOT NULL AND tp.id IS NULL

UNION ALL

SELECT 
    'Clientes sem equipe válida' as problema,
    COUNT(*) as quantidade
FROM clientes c
LEFT JOIN equipes e ON c.equipe_id = e.id
WHERE c.equipe_id IS NOT NULL AND e.id IS NULL

UNION ALL

SELECT 
    'Clientes sem status válido' as problema,
    COUNT(*) as quantidade
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id_status IS NOT NULL AND sc.id IS NULL;

-- 9. Verificar estrutura atual da tabela clientes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;
