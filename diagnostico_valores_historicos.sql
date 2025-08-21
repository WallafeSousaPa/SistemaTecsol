-- 🔍 DIAGNÓSTICO: Valores Históricos - Lista de Material
-- Execute este script para verificar se os dados estão sendo salvos corretamente

-- 1. Verificar se existem listas de material
SELECT '=== LISTAS DE MATERIAL ===' as info;
SELECT 
    id,
    cliente_id,
    data_criacao,
    observacoes,
    total_resolve,
    total_tecsol
FROM lista_material 
ORDER BY data_criacao DESC 
LIMIT 5;

-- 2. Verificar se existem itens com valores
SELECT '=== ITENS COM VALORES ===' as info;
SELECT 
    id,
    lista_material_id,
    material,
    quantidade,
    classe,
    valor_unitario,
    resolve_forneceu,
    tecsol_forneceu
FROM itens_material 
WHERE valor_unitario > 0
ORDER BY id DESC 
LIMIT 10;

-- 3. Verificar estrutura da tabela itens_material
SELECT '=== ESTRUTURA DA TABELA ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'itens_material'
ORDER BY ordinal_position;

-- 4. Verificar se há materiais duplicados com valores diferentes
SELECT '=== MATERIAIS DUPLICADOS ===' as info;
SELECT 
    material,
    COUNT(*) as total_registros,
    COUNT(DISTINCT valor_unitario) as valores_diferentes,
    MIN(valor_unitario) as valor_minimo,
    MAX(valor_unitario) as valor_maximo,
    COUNT(CASE WHEN valor_unitario > 0 THEN 1 END) as registros_com_valor
FROM itens_material 
WHERE valor_unitario > 0
GROUP BY material
HAVING COUNT(*) > 1
ORDER BY total_registros DESC;

-- 5. Verificar materiais sem valores
SELECT '=== MATERIAIS SEM VALORES ===' as info;
SELECT 
    material,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN valor_unitario > 0 THEN 1 END) as com_valor,
    COUNT(CASE WHEN valor_unitario = 0 OR valor_unitario IS NULL THEN 1 END) as sem_valor
FROM itens_material 
GROUP BY material
HAVING COUNT(CASE WHEN valor_unitario > 0 THEN 1 END) = 0
ORDER BY total_registros DESC
LIMIT 10;

-- 6. Testar busca por material específico (substitua 'NOME_DO_MATERIAL' pelo nome real)
SELECT '=== TESTE DE BUSCA POR MATERIAL ===' as info;
-- Exemplo: buscar por um material que você sabe que tem valor
SELECT 
    material,
    valor_unitario,
    lista_material_id
FROM itens_material 
WHERE material ILIKE '%inversor%'  -- Ajuste o nome do material
  AND valor_unitario > 0
ORDER BY lista_material_id DESC 
LIMIT 5;

-- 7. Verificar se há problemas de case sensitivity
SELECT '=== PROBLEMAS DE CASE SENSITIVITY ===' as info;
SELECT 
    material,
    LENGTH(material) as tamanho_nome,
    valor_unitario,
    lista_material_id
FROM itens_material 
WHERE valor_unitario > 0
  AND (material LIKE '%Inversor%' OR material LIKE '%inversor%' OR material LIKE '%INVERSOR%')
ORDER BY lista_material_id DESC 
LIMIT 5;

-- 8. Resumo final
SELECT '=== RESUMO FINAL ===' as info;
SELECT 
    'Total de listas' as tipo,
    COUNT(*) as quantidade
FROM lista_material
UNION ALL
SELECT 
    'Total de itens' as tipo,
    COUNT(*) as quantidade
FROM itens_material
UNION ALL
SELECT 
    'Itens com valores > 0' as tipo,
    COUNT(*) as quantidade
FROM itens_material
WHERE valor_unitario > 0
UNION ALL
SELECT 
    'Itens sem valores' as tipo,
    COUNT(*) as quantidade
FROM itens_material
WHERE valor_unitario = 0 OR valor_unitario IS NULL;
