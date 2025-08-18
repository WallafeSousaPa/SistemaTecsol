-- Script simples para testar inserção na tabela clientes_usuarios
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe
SELECT 'Tabela clientes_usuarios existe?' as pergunta,
       EXISTS (
           SELECT FROM information_schema.tables
           WHERE table_name = 'clientes_usuarios'
       ) as resposta;

-- 2. Verificar estrutura básica
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clientes_usuarios'
ORDER BY ordinal_position;

-- 3. Verificar se há dados de teste
SELECT 'Clientes disponíveis:' as info;
SELECT id, nome_cliente FROM clientes LIMIT 2;

SELECT 'Profiles instaladores disponíveis:' as info;
SELECT id, nome, role FROM profiles WHERE role ILIKE 'instalador' LIMIT 2;

-- 4. Testar inserção simples (DESCOMENTE PARA TESTAR)
/*
-- Pegar IDs de teste
DO $$
DECLARE
    cliente_test_id UUID;
    profile_test_id UUID;
BEGIN
    -- Pegar primeiro cliente
    SELECT id INTO cliente_test_id FROM clientes LIMIT 1;
    
    -- Pegar primeiro profile instalador
    SELECT id INTO profile_test_id FROM profiles WHERE role ILIKE 'instalador' LIMIT 1;
    
    -- Mostrar IDs que serão usados
    RAISE NOTICE 'Cliente ID: %', cliente_test_id;
    RAISE NOTICE 'Profile ID: %', profile_test_id;
    
    -- Tentar inserir
    INSERT INTO clientes_usuarios (cliente_id, profile_id, tipo_relacao, ativo)
    VALUES (cliente_test_id, profile_test_id, 'instalador', true);
    
    RAISE NOTICE 'Inserção realizada com sucesso!';
    
    -- Mostrar o registro inserido
    RAISE NOTICE 'Registro inserido: %', (SELECT * FROM clientes_usuarios ORDER BY data_associacao DESC LIMIT 1);
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro na inserção: %', SQLERRM;
        RAISE NOTICE 'Código do erro: %', SQLSTATE;
END $$;
*/

-- 5. Verificar se há registros na tabela
SELECT 'Total de registros na tabela:' as info, COUNT(*) as total FROM clientes_usuarios;

-- 6. Verificar últimos registros
SELECT 'Últimos registros:' as info;
SELECT * FROM clientes_usuarios ORDER BY data_associacao DESC LIMIT 3;
