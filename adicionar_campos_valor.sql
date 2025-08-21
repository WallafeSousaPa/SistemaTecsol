-- Script para adicionar campos de valor às tabelas de lista de material
-- Execute este script para incluir os campos de valor unitário e totais

-- 1. Verificar estrutura atual da tabela lista_material
SELECT '=== ESTRUTURA ATUAL DA TABELA LISTA_MATERIAL ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'lista_material'
ORDER BY ordinal_position;

-- 2. Verificar estrutura atual da tabela itens_material
SELECT '=== ESTRUTURA ATUAL DA TABELA ITENS_MATERIAL ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'itens_material'
ORDER BY ordinal_position;

-- 3. Adicionar campo valor_unitario à tabela itens_material
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'itens_material' AND column_name = 'valor_unitario'
    ) THEN
        ALTER TABLE itens_material ADD COLUMN valor_unitario DECIMAL(10,2) DEFAULT 0.00;
        RAISE NOTICE 'Campo valor_unitario adicionado com sucesso à tabela itens_material!';
    ELSE
        RAISE NOTICE 'Campo valor_unitario já existe na tabela itens_material!';
    END IF;
END $$;

-- 4. Adicionar campo total_resolve à tabela lista_material
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lista_material' AND column_name = 'total_resolve'
    ) THEN
        ALTER TABLE lista_material ADD COLUMN total_resolve DECIMAL(10,2) DEFAULT 0.00;
        RAISE NOTICE 'Campo total_resolve adicionado com sucesso à tabela lista_material!';
    ELSE
        RAISE NOTICE 'Campo total_resolve já existe na tabela lista_material!';
    END IF;
END $$;

-- 5. Adicionar campo total_tecsol à tabela lista_material
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lista_material' AND column_name = 'total_tecsol'
    ) THEN
        ALTER TABLE lista_material ADD COLUMN total_tecsol DECIMAL(10,2) DEFAULT 0.00;
        RAISE NOTICE 'Campo total_tecsol adicionado com sucesso à tabela lista_material!';
    ELSE
        RAISE NOTICE 'Campo total_tecsol já existe na tabela lista_material!';
    END IF;
END $$;

-- 6. Verificar estrutura final da tabela lista_material
SELECT '=== ESTRUTURA FINAL DA TABELA LISTA_MATERIAL ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'lista_material'
ORDER BY ordinal_position;

-- 7. Verificar estrutura final da tabela itens_material
SELECT '=== ESTRUTURA FINAL DA TABELA ITENS_MATERIAL ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'itens_material'
ORDER BY ordinal_position;

-- 8. Atualizar registros existentes para definir valores padrão
SELECT '=== ATUALIZANDO REGISTROS EXISTENTES ===' as info;

-- Atualizar itens_material com valor_unitario = 0.00 se NULL
UPDATE itens_material 
SET valor_unitario = 0.00 
WHERE valor_unitario IS NULL;

SELECT 
    'Itens atualizados:' as status,
    COUNT(*) as total_itens
FROM itens_material 
WHERE valor_unitario = 0.00;

-- Atualizar lista_material com totais = 0.00 se NULL
UPDATE lista_material 
SET total_resolve = 0.00 
WHERE total_resolve IS NULL;

UPDATE lista_material 
SET total_tecsol = 0.00 
WHERE total_tecsol IS NULL;

SELECT 
    'Listas atualizadas:' as status,
    COUNT(*) as total_listas
FROM lista_material 
WHERE total_resolve = 0.00 OR total_tecsol = 0.00;

-- 9. Criar função para calcular totais automaticamente
CREATE OR REPLACE FUNCTION calcular_totais_lista(p_lista_id UUID)
RETURNS TABLE(total_resolve DECIMAL(10,2), total_tecsol DECIMAL(10,2)) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN resolve_forneceu THEN valor_unitario * quantidade ELSE 0 END), 0.00) as total_resolve,
        COALESCE(SUM(CASE WHEN tecsol_forneceu THEN valor_unitario * quantidade ELSE 0 END), 0.00) as total_tecsol
    FROM itens_material 
    WHERE lista_material_id = p_lista_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Criar trigger para atualizar totais automaticamente
CREATE OR REPLACE FUNCTION atualizar_totais_lista()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar totais na tabela lista_material
    UPDATE lista_material 
    SET 
        total_resolve = (SELECT total_resolve FROM calcular_totais_lista(NEW.lista_material_id)),
        total_tecsol = (SELECT total_tecsol FROM calcular_totais_lista(NEW.lista_material_id))
    WHERE id = NEW.lista_material_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS trigger_atualizar_totais ON itens_material;

CREATE TRIGGER trigger_atualizar_totais
    AFTER INSERT OR UPDATE OR DELETE ON itens_material
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_totais_lista();

-- 11. Teste da funcionalidade
SELECT '=== TESTE DA FUNCIONALIDADE ===' as info;

-- Verificar se há dados para testar
SELECT 
    'Dados disponíveis para teste:' as status,
    COUNT(*) as total_listas,
    (SELECT COUNT(*) FROM itens_material) as total_itens
FROM lista_material;

-- Testar função de cálculo de totais (se houver dados)
DO $$
DECLARE
    lista_id UUID;
    total_resolve DECIMAL(10,2);
    total_tecsol DECIMAL(10,2);
BEGIN
    -- Pegar primeira lista disponível
    SELECT id INTO lista_id FROM lista_material LIMIT 1;
    
    IF lista_id IS NOT NULL THEN
        SELECT * INTO total_resolve, total_tecsol FROM calcular_totais_lista(lista_id);
        RAISE NOTICE 'Teste da função: Lista % - Total Resolve: %, Total TecSol: %', 
                     lista_id, total_resolve, total_tecsol;
    ELSE
        RAISE NOTICE 'Nenhuma lista disponível para teste';
    END IF;
END $$;

-- 12. Resumo final
SELECT '=== RESUMO FINAL ===' as info;
SELECT 
    'Campo valor_unitario em itens_material' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'itens_material' AND column_name = 'valor_unitario') 
        THEN '✅ ADICIONADO' 
        ELSE '❌ NÃO ADICIONADO' 
    END as status
UNION ALL
SELECT 
    'Campo total_resolve em lista_material' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lista_material' AND column_name = 'total_resolve') 
        THEN '✅ ADICIONADO' 
        ELSE '❌ NÃO ADICIONADO' 
    END as status
UNION ALL
SELECT 
    'Campo total_tecsol em lista_material' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lista_material' AND column_name = 'total_tecsol') 
        THEN '✅ ADICIONADO' 
        ELSE '❌ NÃO ADICIONADO' 
    END as status
UNION ALL
SELECT 
    'Função calcular_totais_lista' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calcular_totais_lista') 
        THEN '✅ CRIADA' 
        ELSE '❌ NÃO CRIADA' 
    END as status
UNION ALL
SELECT 
    'Trigger atualizar_totais_lista' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_atualizar_totais') 
        THEN '✅ CRIADO' 
        ELSE '❌ NÃO CRIADO' 
    END as status;

-- 13. Instruções de uso
SELECT '=== INSTRUÇÕES DE USO ===' as info;
SELECT 
    'Para usar o sistema de valores:' as instrucao,
    '1. Adicione uma coluna "Valor" na sua planilha Excel com os valores unitários' as passo1,
    '2. O sistema detectará automaticamente e calculará os totais' as passo2,
    '3. Os totais serão salvos e atualizados automaticamente' as passo3;
