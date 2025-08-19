-- Script para verificar exatamente o que está sendo retornado pela consulta do frontend
-- Execute este script no SQL Editor do Supabase para simular a consulta do frontend

-- 1. Simular exatamente a consulta que o frontend está fazendo
SELECT 
    'Simulando consulta do frontend' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    c.status as status_antigo,
    sc.id as status_clientes_id,
    sc.status as status_clientes_nome,
    sc.ativo as status_clientes_ativo
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
ORDER BY c.id
LIMIT 10;

-- 2. Verificar se há algum problema com a estrutura dos dados
SELECT 
    'Verificando estrutura dos dados' as info,
    COUNT(*) as total_clientes,
    COUNT(CASE WHEN c.id_status IS NOT NULL THEN 1 END) as com_id_status,
    COUNT(CASE WHEN c.id_status IS NULL THEN 1 END) as sem_id_status,
    COUNT(CASE WHEN sc.status IS NOT NULL THEN 1 END) as com_status_info,
    COUNT(CASE WHEN sc.status IS NULL THEN 1 END) as sem_status_info
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id;

-- 3. Verificar se há algum problema com valores específicos
SELECT 
    'Verificando valores específicos' as info,
    c.id_status,
    COUNT(*) as quantidade,
    sc.status as status_nome
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
GROUP BY c.id_status, sc.status
ORDER BY c.id_status;

-- 4. Verificar se há algum problema com a tabela status_clientes
SELECT 
    'Verificando tabela status_clientes' as info,
    id,
    status,
    ativo,
    data_atualizacao
FROM status_clientes
ORDER BY id;

-- 5. Testar a consulta exata que o frontend está fazendo
-- Esta é a consulta que está sendo executada no loadClientes
WITH consulta_frontend AS (
    SELECT 
        c.*,
        ts.nome as tipo_servico_nome,
        tp.nome as tipo_padrao_nome,
        e.nome as equipe_nome,
        sc.id as status_info_id,
        sc.status as status_info_status
    FROM clientes c
    LEFT JOIN tipo_servico ts ON c.tipo_servico_id = ts.id
    LEFT JOIN tipo_padrao tp ON c.tipo_padrao_id = tp.id
    LEFT JOIN equipes e ON c.equipe_id = e.id
    LEFT JOIN status_clientes sc ON c.id_status = sc.id
    ORDER BY c.data_cadastro DESC
)
SELECT 
    'Resultado da consulta do frontend' as info,
    id,
    nome_cliente,
    id_status,
    status_info_id,
    status_info_status
FROM consulta_frontend
LIMIT 5;

-- 6. Verificar se há algum problema com a foreign key
SELECT 
    'Teste de foreign key' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    CASE 
        WHEN sc.status IS NULL THEN '❌ PROBLEMA: id_status não encontrado em status_clientes'
        ELSE '✅ OK: Foreign key funcionando'
    END as status_fk,
    sc.status as status_nome
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
ORDER BY c.id
LIMIT 10;

-- 7. Verificar se há algum problema com valores nulos ou inválidos
SELECT 
    'Verificando valores nulos ou inválidos' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    c.status as status_antigo,
    sc.status as status_novo
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id_status IS NULL 
   OR sc.status IS NULL
   OR c.id_status NOT IN (1, 2, 3, 4)
ORDER BY c.id;

-- 8. Testar uma atualização manual para ver se há erro
-- Primeiro, pegar um cliente para teste
SELECT 
    'Cliente para teste de atualização' as info,
    id,
    nome_cliente,
    id_status,
    status as status_antigo
FROM clientes
LIMIT 1;

-- 9. Fazer um teste de atualização manual
-- Substitua o ID pelo ID real do cliente retornado acima
UPDATE clientes 
SET id_status = 1 
WHERE id = (SELECT id FROM clientes LIMIT 1);

-- 10. Verificar se a atualização funcionou
SELECT 
    'Resultado do teste de atualização' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome,
    c.status as status_antigo
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id = (SELECT id FROM clientes LIMIT 1);
