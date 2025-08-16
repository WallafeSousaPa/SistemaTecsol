-- Script para modificar a tabela de presença para suportar múltiplos colaboradores
-- Execute este script no SQL Editor do Supabase

-- 1. Criar nova tabela para relacionar presença com colaboradores (muitos para muitos)
CREATE TABLE IF NOT EXISTS presenca_colaboradores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    presenca_id UUID REFERENCES presenca(id) ON DELETE CASCADE,
    colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
    presente BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(presenca_id, colaborador_id)
);

-- 2. Adicionar campo para indicar se é presença individual ou de equipe
ALTER TABLE presenca ADD COLUMN IF NOT EXISTS tipo_presenca VARCHAR(20) DEFAULT 'individual' CHECK (tipo_presenca IN ('individual', 'equipe'));

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_presenca_colaboradores_presenca ON presenca_colaboradores(presenca_id);
CREATE INDEX IF NOT EXISTS idx_presenca_colaboradores_colaborador ON presenca_colaboradores(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_presenca_colaboradores_presente ON presenca_colaboradores(presente);
CREATE INDEX IF NOT EXISTS idx_presenca_tipo ON presenca(tipo_presenca);

-- 4. Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_presenca_colaboradores_updated_at 
    BEFORE UPDATE ON presenca_colaboradores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Comentários sobre as novas estruturas
COMMENT ON TABLE presenca_colaboradores IS 'Tabela de relacionamento para controlar presença de múltiplos colaboradores';
COMMENT ON COLUMN presenca_colaboradores.presenca_id IS 'Referência ao registro de presença';
COMMENT ON COLUMN presenca_colaboradores.colaborador_id IS 'Referência ao colaborador';
COMMENT ON COLUMN presenca_colaboradores.presente IS 'Indica se o colaborador está presente';
COMMENT ON COLUMN presenca_colaboradores.observacoes IS 'Observações específicas para este colaborador';

COMMENT ON COLUMN presenca.tipo_presenca IS 'Tipo de presença: individual (um colaborador) ou equipe (múltiplos colaboradores)';

-- 6. Função para migrar dados existentes (se necessário)
CREATE OR REPLACE FUNCTION migrar_presencas_existentes() RETURNS void AS $$
DECLARE
    presenca_record RECORD;
BEGIN
    -- Para cada presença existente, criar registro na tabela de relacionamento
    FOR presenca_record IN SELECT id, colaborador_id FROM presenca WHERE colaborador_id IS NOT NULL
    LOOP
        INSERT INTO presenca_colaboradores (presenca_id, colaborador_id, presente)
        VALUES (presenca_record.id, presenca_record.colaborador_id, TRUE)
        ON CONFLICT (presenca_id, colaborador_id) DO NOTHING;
        
        -- Marcar como presença individual
        UPDATE presenca SET tipo_presenca = 'individual' WHERE id = presenca_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 7. Executar migração (descomente se necessário)
-- SELECT migrar_presencas_existentes();

-- 8. Exemplo de como usar a nova estrutura:
-- Para criar uma presença com múltiplos colaboradores:
/*
INSERT INTO presenca (data_presenca, data_cadastro_preenchido, equipe_id, veiculo_id, km_inicial, observacoes, tipo_presenca)
VALUES ('2024-01-15', CURRENT_DATE, 'equipe-uuid', 'veiculo-uuid', 50000, 'Presença da equipe completa', 'equipe')
RETURNING id;

-- Depois inserir os colaboradores:
INSERT INTO presenca_colaboradores (presenca_id, colaborador_id, presente, observacoes)
VALUES 
    ('presenca-uuid', 'colaborador1-uuid', TRUE, 'Presente'),
    ('presenca-uuid', 'colaborador2-uuid', TRUE, 'Presente'),
    ('presenca-uuid', 'colaborador3-uuid', FALSE, 'Ausente - Justificado');
*/
