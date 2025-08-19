-- Script para verificar e corrigir políticas RLS da tabela clientes
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se RLS está habilitado na tabela clientes
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'clientes';

-- 2. Verificar políticas RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'clientes';

-- 3. Desabilitar RLS temporariamente para teste (se necessário)
-- ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;

-- 4. Criar política RLS básica para permitir acesso a todos os usuários autenticados
DROP POLICY IF EXISTS "Permitir acesso a usuários autenticados" ON clientes;

CREATE POLICY "Permitir acesso a usuários autenticados" ON clientes
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Criar política específica para instaladores (ver apenas seus clientes)
DROP POLICY IF EXISTS "Instaladores veem apenas seus clientes" ON clientes;

CREATE POLICY "Instaladores veem apenas seus clientes" ON clientes
    FOR SELECT
    TO authenticated
    USING (
        -- Se o usuário tem role 'instalador', ver apenas clientes associados
        (SELECT role FROM profiles WHERE id = auth.uid()) != 'instalador'
        OR 
        usuario_instalador_id = auth.uid()
    );

-- 6. Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'clientes';

-- 7. Testar acesso com usuário autenticado
-- Esta consulta deve funcionar agora
SELECT COUNT(*) as total_clientes_acessivel FROM clientes;

-- 8. Verificar se há problemas de permissão específicos
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'clientes';

-- 9. Garantir que o usuário anônimo tem acesso básico (se necessário)
GRANT SELECT ON clientes TO anon;
GRANT SELECT ON tipo_servico TO anon;
GRANT SELECT ON tipo_padrao TO anon;
GRANT SELECT ON equipes TO anon;
GRANT SELECT ON status_clientes TO anon;

-- 10. Verificar se a tabela clientes tem dados
SELECT 
    'Total de clientes' as descricao,
    COUNT(*) as quantidade
FROM clientes

UNION ALL

SELECT 
    'Clientes com status definido' as descricao,
    COUNT(*) as quantidade
FROM clientes 
WHERE id_status IS NOT NULL

UNION ALL

SELECT 
    'Clientes sem status definido' as descricao,
    COUNT(*) as quantidade
FROM clientes 
WHERE id_status IS NULL;
