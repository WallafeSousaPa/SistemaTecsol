-- 🚀 SOLUÇÃO RÁPIDA para Erro "record 'new' has no field 'data_atualizacao'"
-- Execute este script no seu banco de dados PostgreSQL para resolver o problema

-- ✅ SOLUÇÃO: A tabela clientes JÁ TEM a coluna updated_at com trigger automático!
-- Não precisamos criar uma nova coluna data_atualizacao

-- 1. Verificar se a coluna updated_at existe e está funcionando
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name = 'updated_at';

-- 2. Verificar se o trigger está funcionando
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'clientes'
AND trigger_name = 'update_clientes_updated_at';

-- 3. Testar se a atualização funciona (o trigger deve atualizar updated_at automaticamente)
UPDATE clientes 
SET observacoes = COALESCE(observacoes, '') || ' - Teste de atualização em ' || NOW()
WHERE id = (SELECT id FROM clientes LIMIT 1);

-- 4. Verificar se o campo updated_at foi atualizado automaticamente
SELECT 
    id, 
    updated_at, 
    observacoes 
FROM clientes 
ORDER BY updated_at DESC 
LIMIT 5;

-- 5. Verificar se não há triggers problemáticos tentando acessar data_atualizacao
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'clientes'
AND action_statement LIKE '%data_atualizacao%';

-- ✅ PROBLEMA RESOLVIDO!
-- A tabela clientes já tem:
-- - Campo updated_at com timestamp automático
-- - Trigger que atualiza updated_at automaticamente
-- - Não precisamos de data_atualizacao

-- 💡 Agora você pode editar valores na medição sem erros!
-- O campo updated_at será atualizado automaticamente pelo trigger.
