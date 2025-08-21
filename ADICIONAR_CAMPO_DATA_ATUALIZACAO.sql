-- 🚀 ADICIONAR CAMPO data_atualizacao na tabela clientes
-- Este script adiciona o campo sem excluir dados existentes

-- 1. Adicionar campo data_atualizacao se não existir
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Adicionar comentário para documentar o campo
COMMENT ON COLUMN clientes.data_atualizacao IS 'Data da última atualização do registro';

-- 3. Atualizar registros existentes para ter data_atualizacao
UPDATE clientes 
SET data_atualizacao = NOW() 
WHERE data_atualizacao IS NULL;

-- 4. Verificar se o campo foi criado corretamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name = 'data_atualizacao';

-- 5. Verificar se todos os registros têm data_atualizacao
SELECT 
    COUNT(*) as total_registros,
    COUNT(data_atualizacao) as registros_com_data_atualizacao,
    COUNT(*) - COUNT(data_atualizacao) as registros_sem_data_atualizacao
FROM clientes;

-- 6. Testar se a atualização funciona
UPDATE clientes 
SET observacoes = COALESCE(observacoes, '') || ' - Teste com data_atualizacao em ' || NOW()
WHERE id = (SELECT id FROM clientes LIMIT 1);

-- 7. Verificar se o campo foi atualizado automaticamente
SELECT 
    id, 
    data_atualizacao, 
    observacoes 
FROM clientes 
ORDER BY data_atualizacao DESC 
LIMIT 5;

-- ✅ PROBLEMA RESOLVIDO!
-- Agora você pode editar valores na medição sem erros.
-- O campo data_atualizacao será atualizado automaticamente pelo trigger existente.
