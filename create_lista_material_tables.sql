-- Script para criar as tabelas do sistema de Lista de Material
-- TecSol Sistema

-- Tabela para armazenar as listas de material por cliente
CREATE TABLE IF NOT EXISTS lista_material (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT fk_lista_material_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Tabela para armazenar os itens de material
CREATE TABLE IF NOT EXISTS itens_material (
    id SERIAL PRIMARY KEY,
    lista_material_id INTEGER NOT NULL REFERENCES lista_material(id) ON DELETE CASCADE,
    material VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    classe VARCHAR(50) NOT NULL CHECK (classe IN ('Kit', 'Padrão', 'Nenhum')),
    resolve_forneceu BOOLEAN DEFAULT false,
    tecsol_forneceu BOOLEAN DEFAULT false,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_itens_material_lista FOREIGN KEY (lista_material_id) REFERENCES lista_material(id),
    CONSTRAINT check_quantidade_positiva CHECK (quantidade > 0)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_lista_material_cliente_id ON lista_material(cliente_id);
CREATE INDEX IF NOT EXISTS idx_lista_material_ativo ON lista_material(ativo);
CREATE INDEX IF NOT EXISTS idx_itens_material_lista_id ON itens_material(lista_material_id);
CREATE INDEX IF NOT EXISTS idx_itens_material_classe ON itens_material(classe);

-- Trigger para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger na tabela lista_material
CREATE TRIGGER update_lista_material_updated_at 
    BEFORE UPDATE ON lista_material 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Aplicar trigger na tabela itens_material
CREATE TRIGGER update_itens_material_updated_at 
    BEFORE UPDATE ON itens_material 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários das tabelas
COMMENT ON TABLE lista_material IS 'Tabela para armazenar as listas de material por cliente';
COMMENT ON TABLE itens_material IS 'Tabela para armazenar os itens individuais de material';

-- Comentários das colunas
COMMENT ON COLUMN lista_material.cliente_id IS 'ID do cliente relacionado à lista de material';
COMMENT ON COLUMN lista_material.data_criacao IS 'Data de criação da lista';
COMMENT ON COLUMN lista_material.data_atualizacao IS 'Data da última atualização da lista';
COMMENT ON COLUMN lista_material.observacoes IS 'Observações gerais sobre a lista de material';

COMMENT ON COLUMN itens_material.lista_material_id IS 'ID da lista de material relacionada';
COMMENT ON COLUMN itens_material.material IS 'Nome/descrição do material';
COMMENT ON COLUMN itens_material.quantidade IS 'Quantidade necessária do material';
COMMENT ON COLUMN itens_material.classe IS 'Classificação do material: Kit, Padrão ou Nenhum';
COMMENT ON COLUMN itens_material.resolve_forneceu IS 'Indica se a Resolve forneceu o material';
COMMENT ON COLUMN itens_material.tecsol_forneceu IS 'Indica se a TecSol forneceu o material';

-- Políticas RLS (Row Level Security) para controle de acesso
ALTER TABLE lista_material ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_material ENABLE ROW LEVEL SECURITY;

-- Política para lista_material: usuários podem ver apenas listas de clientes que têm acesso
CREATE POLICY "Usuários podem ver listas de material de clientes autorizados" ON lista_material
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clientes_usuarios cu
            WHERE cu.cliente_id = lista_material.cliente_id
            AND cu.profile_id = auth.uid()
            AND cu.ativo = true
        )
        OR 
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('administrador', 'administrativo')
        )
    );

-- Política para itens_material: usuários podem ver itens de listas que têm acesso
CREATE POLICY "Usuários podem ver itens de material de listas autorizadas" ON itens_material
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lista_material lm
            JOIN clientes_usuarios cu ON cu.cliente_id = lm.cliente_id
            WHERE lm.id = itens_material.lista_material_id
            AND cu.profile_id = auth.uid()
            AND cu.ativo = true
        )
        OR 
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('administrador', 'administrativo')
        )
    );

-- Políticas para inserção/atualização (apenas administradores e administrativos)
CREATE POLICY "Apenas administradores podem inserir listas de material" ON lista_material
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('administrador', 'administrativo')
        )
    );

CREATE POLICY "Apenas administradores podem atualizar listas de material" ON lista_material
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('administrador', 'administrativo')
        )
    );

CREATE POLICY "Apenas administradores podem inserir itens de material" ON itens_material
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('administrador', 'administrativo')
        )
    );

CREATE POLICY "Apenas administradores podem atualizar itens de material" ON itens_material
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('administrador', 'administrativo')
        )
    );

-- Função para criar lista de material com itens em lote
CREATE OR REPLACE FUNCTION criar_lista_material_com_itens(
    p_cliente_id INTEGER,
    p_observacoes TEXT DEFAULT NULL,
    p_itens JSON DEFAULT '[]'::JSON
)
RETURNS INTEGER AS $$
DECLARE
    v_lista_id INTEGER;
    v_item JSON;
BEGIN
    -- Inserir lista de material
    INSERT INTO lista_material (cliente_id, observacoes)
    VALUES (p_cliente_id, p_observacoes)
    RETURNING id INTO v_lista_id;
    
    -- Inserir itens de material
    FOR v_item IN SELECT * FROM json_array_elements(p_itens)
    LOOP
        INSERT INTO itens_material (
            lista_material_id,
            material,
            quantidade,
            classe,
            resolve_forneceu,
            tecsol_forneceu
        ) VALUES (
            v_lista_id,
            (v_item->>'material')::VARCHAR,
            (v_item->>'quantidade')::INTEGER,
            (v_item->>'classe')::VARCHAR,
            COALESCE((v_item->>'resolve_forneceu')::BOOLEAN, false),
            COALESCE((v_item->>'tecsol_forneceu')::BOOLEAN, false)
        );
    END LOOP;
    
    RETURN v_lista_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION criar_lista_material_com_itens IS 'Função para criar uma lista de material com itens em lote';

-- Verificar se as tabelas foram criadas corretamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('lista_material', 'itens_material')
ORDER BY table_name, ordinal_position;
