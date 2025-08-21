-- Script corrigido para criar políticas RLS (Row Level Security) para as tabelas de Lista de Material
-- Execute este script APÓS executar create_lista_material_tables_corrigido.sql
-- CORRIGIDO: Usa profile_id em vez de usuario_id

-- Habilitar RLS nas tabelas
ALTER TABLE lista_material ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_material ENABLE ROW LEVEL SECURITY;

-- Política para lista_material: usuários podem ver apenas listas de clientes que têm acesso
CREATE POLICY "Usuários podem ver listas de material de clientes autorizados" ON lista_material
    FOR SELECT USING (
        cliente_id IN (
            SELECT DISTINCT c.id 
            FROM clientes c
            INNER JOIN clientes_usuarios cu ON c.id = cu.cliente_id
            INNER JOIN profiles p ON cu.profile_id = p.id
            WHERE p.id = auth.uid()
            AND cu.ativo = true
        )
        OR 
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('administrador', 'administrativo')
        )
    );

-- Política para lista_material: apenas administradores e administrativos podem criar
CREATE POLICY "Apenas administradores podem criar listas de material" ON lista_material
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('administrador', 'administrativo')
        )
    );

-- Política para lista_material: apenas administradores e administrativos podem atualizar
CREATE POLICY "Apenas administradores podem atualizar listas de material" ON lista_material
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('administrador', 'administrativo')
        )
    );

-- Política para lista_material: apenas administradores podem deletar
CREATE POLICY "Apenas administradores podem deletar listas de material" ON lista_material
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'administrador'
        )
    );

-- Política para itens_material: usuários podem ver itens de listas autorizadas
CREATE POLICY "Usuários podem ver itens de listas autorizadas" ON itens_material
    FOR SELECT USING (
        lista_material_id IN (
            SELECT lm.id 
            FROM lista_material lm
            WHERE lm.cliente_id IN (
                SELECT DISTINCT c.id 
                FROM clientes c
                INNER JOIN clientes_usuarios cu ON c.id = cu.cliente_id
                INNER JOIN profiles p ON cu.profile_id = p.id
                WHERE p.id = auth.uid()
                AND cu.ativo = true
            )
            OR 
            EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() 
                AND p.role IN ('administrador', 'administrativo')
            )
        )
    );

-- Política para itens_material: apenas administradores e administrativos podem criar
CREATE POLICY "Apenas administradores podem criar itens de material" ON itens_material
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('administrador', 'administrativo')
        )
    );

-- Política para itens_material: apenas administradores e administrativos podem atualizar
CREATE POLICY "Apenas administradores podem atualizar itens de material" ON itens_material
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('administrador', 'administrativo')
        )
    );

-- Política para itens_material: apenas administradores podem deletar
CREATE POLICY "Apenas administradores podem deletar itens de material" ON itens_material
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'administrador'
        )
    );

-- Verificar se as políticas foram criadas
SELECT 'Políticas RLS criadas com sucesso!' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('lista_material', 'itens_material')
ORDER BY tablename, policyname;
