-- Script para corrigir o problema de status dos clientes
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, verificar a situação atual
SELECT 
    'Situação atual' as info,
    COUNT(*) as total_clientes,
    COUNT(CASE WHEN id_status IS NOT NULL THEN 1 END) as com_id_status,
    COUNT(CASE WHEN id_status IS NULL THEN 1 END) as sem_id_status
FROM clientes;

-- 2. Verificar se há clientes com id_status incorreto
SELECT 
    'Clientes com status incorreto' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome,
    c.created_at
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id_status IS NULL OR sc.status IS NULL
ORDER BY c.id;

-- 3. Corrigir clientes sem id_status (definir como Pendente = ID 1)
UPDATE clientes 
SET id_status = 1 
WHERE id_status IS NULL;

-- 4. Verificar se a foreign key está funcionando corretamente
-- Se não estiver, recriar
DO $$
BEGIN
    -- Remover constraint existente se houver
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_clientes_status' 
        AND table_name = 'clientes'
    ) THEN
        ALTER TABLE clientes DROP CONSTRAINT fk_clientes_status;
    END IF;
    
    -- Recriar a foreign key
    ALTER TABLE clientes
    ADD CONSTRAINT fk_clientes_status
    FOREIGN KEY (id_status) REFERENCES status_clientes(id);
    
    RAISE NOTICE 'Foreign key recriada com sucesso!';
END $$;

-- 5. Verificar se há algum trigger ou constraint que está interferindo
-- Remover constraints CHECK antigas se existirem
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints cc
        JOIN information_schema.table_constraints tc ON cc.constraint_name = tc.constraint_name
        WHERE tc.table_name = 'clientes' 
        AND tc.constraint_type = 'CHECK'
        AND cc.check_clause LIKE '%status%'
    ) THEN
        -- Listar constraints para remoção manual
        RAISE NOTICE 'Encontradas constraints CHECK antigas. Remova manualmente se necessário.';
    END IF;
END $$;

-- 6. Verificar se a coluna status antiga ainda existe e remover se necessário
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'status'
    ) THEN
        RAISE NOTICE 'Coluna status antiga ainda existe. Considere removê-la após verificar que id_status está funcionando.';
    END IF;
END $$;

-- 7. Verificar resultado final
SELECT 
    'Resultado final' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
ORDER BY c.id
LIMIT 10;

-- 8. Testar inserção de um status específico
-- Este comando deve funcionar sem erros
UPDATE clientes 
SET id_status = 1 
WHERE id = (SELECT id FROM clientes LIMIT 1);

-- 9. Verificar se a atualização funcionou
SELECT 
    'Teste de atualização' as info,
    c.id,
    c.nome_cliente,
    c.id_status,
    sc.status as status_nome
FROM clientes c
LEFT JOIN status_clientes sc ON c.id_status = sc.id
WHERE c.id = (SELECT id FROM clientes LIMIT 1);
