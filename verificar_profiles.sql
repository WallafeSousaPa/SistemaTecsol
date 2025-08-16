-- Script para verificar a estrutura real da tabela profiles
-- Execute este script para entender como os cargos estão relacionados

-- 1. Verificar estrutura da tabela profiles
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Verificar se existe alguma tabela de relacionamento
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name LIKE '%cargo%' 
   OR table_name LIKE '%profile%'
   OR table_name LIKE '%user%'
ORDER BY table_name, ordinal_position;

-- 3. Verificar tabela cargos
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'cargos' 
ORDER BY ordinal_position;

-- 4. Verificar se há alguma tabela de relacionamento entre profiles e cargos
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (tc.table_name = 'profiles' OR ccu.table_name = 'profiles')
  AND (tc.table_name LIKE '%cargo%' OR ccu.table_name LIKE '%cargo%');

-- 5. Verificar dados de exemplo na tabela profiles
SELECT * FROM profiles LIMIT 5;

-- 6. Verificar dados de exemplo na tabela cargos
SELECT * FROM cargos LIMIT 5;
