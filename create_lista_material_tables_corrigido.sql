-- Script corrigido para criar as tabelas do sistema de Lista de Material
-- TecSol Sistema - Corrigido para compatibilidade com UUID

-- Verificar se as tabelas já existem e removê-las se necessário
DROP TABLE IF EXISTS itens_material CASCADE;
DROP TABLE IF EXISTS lista_material CASCADE;

-- Remover função se existir
DROP FUNCTION IF EXISTS criar_lista_material_com_itens(UUID, TEXT, JSON);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Tabela para armazenar as listas de material por cliente
CREATE TABLE lista_material (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true
);

-- Tabela para armazenar os itens de material
CREATE TABLE itens_material (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lista_material_id UUID NOT NULL,
    material VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    classe VARCHAR(50) NOT NULL CHECK (classe IN ('Kit', 'Padrão', 'Nenhum')),
    resolve_forneceu BOOLEAN DEFAULT false,
    tecsol_forneceu BOOLEAN DEFAULT false,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ativo BOOLEAN DEFAULT true
);

-- Adicionar foreign keys
ALTER TABLE lista_material 
ADD CONSTRAINT fk_lista_material_cliente 
FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;

ALTER TABLE itens_material 
ADD CONSTRAINT fk_itens_material_lista 
FOREIGN KEY (lista_material_id) REFERENCES lista_material(id) ON DELETE CASCADE;

-- Criar índices para melhor performance
CREATE INDEX idx_lista_material_cliente_id ON lista_material(cliente_id);
CREATE INDEX idx_lista_material_ativo ON lista_material(ativo);
CREATE INDEX idx_itens_material_lista_id ON itens_material(lista_material_id);
CREATE INDEX idx_itens_material_classe ON itens_material(classe);
CREATE INDEX idx_itens_material_ativo ON itens_material(ativo);

-- Função para atualizar timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar timestamp automaticamente
CREATE TRIGGER update_lista_material_updated_at 
    BEFORE UPDATE ON lista_material 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itens_material_updated_at 
    BEFORE UPDATE ON itens_material 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar lista de material com itens em lote
CREATE OR REPLACE FUNCTION criar_lista_material_com_itens(
    p_cliente_id UUID,
    p_observacoes TEXT DEFAULT NULL,
    p_itens JSON DEFAULT '[]'::JSON
)
RETURNS UUID AS $$
DECLARE
    v_lista_id UUID;
    v_item JSON;
BEGIN
    -- Inserir lista de material
    INSERT INTO lista_material (cliente_id, observacoes)
    VALUES (p_cliente_id, p_observacoes)
    RETURNING id INTO v_lista_id;
    
    -- Inserir itens se fornecidos
    IF p_itens IS NOT NULL AND json_array_length(p_itens) > 0 THEN
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
    END IF;
    
    RETURN v_lista_id;
END;
$$ LANGUAGE plpgsql;

-- Comentários nas tabelas
COMMENT ON TABLE lista_material IS 'Tabela para armazenar listas de material por cliente';
COMMENT ON TABLE itens_material IS 'Tabela para armazenar itens individuais de material';
COMMENT ON COLUMN lista_material.cliente_id IS 'Referência ao cliente (UUID)';
COMMENT ON COLUMN itens_material.classe IS 'Classificação do material: Kit, Padrão ou Nenhum';
COMMENT ON COLUMN itens_material.resolve_forneceu IS 'Indica se a Resolve forneceu o material';
COMMENT ON COLUMN itens_material.tecsol_forneceu IS 'Indica se a TecSol forneceu o material';

-- Verificar se as tabelas foram criadas corretamente
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT table_name, table_type FROM information_schema.tables 
WHERE table_name IN ('lista_material', 'itens_material');
