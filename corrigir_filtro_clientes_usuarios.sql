-- Script para corrigir o filtro de clientes por usuário instalador
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela clientes_usuarios existe e tem dados
SELECT 
    'Verificando tabela clientes_usuarios' as info,
    COUNT(*) as total_registros
FROM clientes_usuarios;

-- 2. Verificar se a coluna usuario_instalador_id ainda existe na tabela clientes
SELECT 
    'Verificando coluna usuario_instalador_id' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name = 'usuario_instalador_id';

-- 3. Se a coluna usuario_instalador_id ainda existir, migrar dados para clientes_usuarios
DO $$
BEGIN
    -- Verificar se a coluna existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' 
        AND column_name = 'usuario_instalador_id'
    ) THEN
        -- Migrar dados existentes para clientes_usuarios
        INSERT INTO clientes_usuarios (cliente_id, profile_id, tipo_relacao, data_associacao, ativo)
        SELECT 
            c.id as cliente_id,
            c.usuario_instalador_id as profile_id,
            'instalador' as tipo_relacao,
            COALESCE(c.created_at, NOW()) as data_associacao,
            true as ativo
        FROM clientes c
        WHERE c.usuario_instalador_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM clientes_usuarios cu 
            WHERE cu.cliente_id = c.id 
            AND cu.profile_id = c.usuario_instalador_id
        );
        
        RAISE NOTICE 'Dados migrados da coluna usuario_instalador_id para clientes_usuarios';
        
        -- Remover a coluna antiga
        ALTER TABLE clientes DROP COLUMN usuario_instalador_id;
        RAISE NOTICE 'Coluna usuario_instalador_id removida';
    ELSE
        RAISE NOTICE 'Coluna usuario_instalador_id não existe, pulando migração';
    END IF;
END $$;

-- 4. Verificar se RLS está habilitado na tabela clientes
SELECT 
    'Verificando RLS na tabela clientes' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'clientes';

-- 5. Habilitar RLS na tabela clientes
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- 6. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir acesso a usuários autenticados" ON clientes;
DROP POLICY IF EXISTS "Instaladores veem apenas seus clientes" ON clientes;

-- 7. Criar nova política RLS para filtrar clientes por usuário
CREATE POLICY "Usuários veem apenas clientes associados" ON clientes
    FOR SELECT
    TO authenticated
    USING (
        -- Administradores veem todos os clientes
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'administrador'
        )
        OR
        -- Usuários administrativos veem todos os clientes
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'administrativo'
        )
        OR
        -- Instaladores veem apenas clientes associados a eles
        EXISTS (
            SELECT 1 FROM clientes_usuarios cu
            JOIN profiles p ON cu.profile_id = p.id
            WHERE cu.cliente_id = clientes.id
            AND p.id = auth.uid()
            AND cu.ativo = true
        )
    );

-- 8. Criar política para inserção (apenas administradores e administrativos)
CREATE POLICY "Apenas administradores podem inserir clientes" ON clientes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('administrador', 'administrativo')
        )
    );

-- 9. Criar política para atualização (apenas usuários associados ao cliente)
CREATE POLICY "Usuários podem atualizar clientes associados" ON clientes
    FOR UPDATE
    TO authenticated
    USING (
        -- Administradores podem atualizar todos
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'administrador'
        )
        OR
        -- Usuários administrativos podem atualizar todos
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'administrativo'
        )
        OR
        -- Instaladores podem atualizar apenas clientes associados
        EXISTS (
            SELECT 1 FROM clientes_usuarios cu
            JOIN profiles p ON cu.profile_id = p.id
            WHERE cu.cliente_id = clientes.id
            AND p.id = auth.uid()
            AND cu.ativo = true
        )
    )
    WITH CHECK (
        -- Mesma lógica para verificação
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'administrador'
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'administrativo'
        )
        OR
        EXISTS (
            SELECT 1 FROM clientes_usuarios cu
            JOIN profiles p ON cu.profile_id = p.id
            WHERE cu.cliente_id = clientes.id
            AND p.id = auth.uid()
            AND cu.ativo = true
        )
    );

-- 10. Criar política para exclusão (apenas administradores)
CREATE POLICY "Apenas administradores podem excluir clientes" ON clientes
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'administrador'
        )
    );

-- 11. Verificar se as políticas foram criadas
SELECT 
    'Políticas RLS criadas' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename = 'clientes'
ORDER BY policyname;

-- 12. Testar a consulta filtrada por usuário
-- Esta consulta deve retornar apenas os clientes associados ao usuário logado
SELECT 
    'Teste de consulta filtrada' as info,
    c.nome_cliente,
    c.endereco,
    c.status,
    p.nome as usuario_associado
FROM clientes c
JOIN clientes_usuarios cu ON c.id = cu.cliente_id
JOIN profiles p ON cu.profile_id = p.id
WHERE cu.ativo = true
ORDER BY c.nome_cliente;

-- 13. Verificar total de clientes por usuário
SELECT 
    'Total de clientes por usuário' as info,
    p.nome as usuario,
    p.role,
    COUNT(cu.cliente_id) as total_clientes
FROM profiles p
LEFT JOIN clientes_usuarios cu ON p.id = cu.profile_id AND cu.ativo = true
WHERE p.role = 'instalador'
GROUP BY p.id, p.nome, p.role
ORDER BY p.nome;
