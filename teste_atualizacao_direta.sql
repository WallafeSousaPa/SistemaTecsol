-- Script para testar a atualização direta e identificar onde está o problema
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, verificar o estado atual dos clientes
SELECT 
    'Estado atual dos clientes' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome,
    c.created_at
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
ORDER BY c.id
LIMIT 5;

-- 2. Verificar se há algum problema com a tabela status_clientes
SELECT 
    'Dados da tabela status_clientes' as info,
    id,
    status,
    ativo,
    data_atualizacao
FROM status_clientes
ORDER BY id;

-- 3. Testar uma atualização direta para ver se há erro
-- Primeiro, pegar um cliente para teste
SELECT 
    'Cliente para teste de atualização' as info,
    id,
    nome_cliente,
    id_status
FROM clientes
LIMIT 1;

-- 4. Fazer uma atualização direta para testar
-- Substitua o ID pelo ID real do cliente retornado acima
UPDATE clientes 
SET id_status = 1 
WHERE id = (SELECT id FROM clientes LIMIT 1);

-- 5. Verificar se a atualização funcionou
SELECT 
    'Resultado da atualização direta' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id = (SELECT id FROM clientes LIMIT 1);

-- 6. Testar com diferentes valores para ver se há padrão
-- Atualizar para status 2 (Em andamento)
UPDATE clientes 
SET id_status = 2 
WHERE id = (SELECT id FROM clientes LIMIT 1);

-- Verificar resultado
SELECT 
    'Teste com status 2' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id = (SELECT id FROM clientes LIMIT 1);

-- 7. Testar com status 3 (Finalizado) para ver se é sempre esse valor
UPDATE clientes 
SET id_status = 3 
WHERE id = (SELECT id FROM clientes LIMIT 1);

-- Verificar resultado
SELECT 
    'Teste com status 3' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id = (SELECT id FROM clientes LIMIT 1);

-- 8. Testar com status 4 (Validado)
UPDATE clientes 
SET id_status = 4 
WHERE id = (SELECT id FROM clientes LIMIT 1);

-- Verificar resultado
SELECT 
    'Teste com status 4' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id = (SELECT id FROM clientes LIMIT 1);

-- 9. Voltar para status 1 (Pendente) para finalizar o teste
UPDATE clientes 
SET id_status = 1 
WHERE id = (SELECT id FROM clientes LIMIT 1);

-- Verificar resultado final
SELECT 
    'Resultado final do teste' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id = (SELECT id FROM clientes LIMIT 1);

-- 10. Verificar se há algum problema com a foreign key
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
LIMIT 5;
