-- 🚀 SOLUÇÃO DIRETA para Erro "data_atualizacao"
-- Execute este script para resolver o problema imediatamente

-- 1. VERIFICAR se existe trigger problemático
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'clientes'
AND action_statement LIKE '%data_atualizacao%';

-- 2. REMOVER TODOS os triggers da tabela clientes (cuidado!)
-- Isso remove triggers problemáticos, mas também os corretos
-- DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;

-- 3. RECRIAR apenas o trigger correto para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar o trigger correto
DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. VERIFICAR se o trigger foi criado corretamente
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'clientes';

-- 5. TESTAR se a atualização funciona
UPDATE clientes 
SET observacoes = COALESCE(observacoes, '') || ' - Teste após correção em ' || NOW()
WHERE id = (SELECT id FROM clientes LIMIT 1);

-- 6. VERIFICAR se updated_at foi atualizado
SELECT 
    id, 
    updated_at, 
    observacoes 
FROM clientes 
ORDER BY updated_at DESC 
LIMIT 3;

-- ✅ PROBLEMA RESOLVIDO!
-- Agora você pode editar valores na medição sem erros.
-- O campo updated_at será atualizado automaticamente pelo trigger correto.
