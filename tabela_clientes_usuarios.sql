-- Script opcional: Tabela de relacionamento para múltiplos usuários por cliente
-- Execute apenas se quiser suporte completo a múltiplos usuários

-- 1. Criar tabela de relacionamento
CREATE TABLE IF NOT EXISTS clientes_usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo_relacao TEXT DEFAULT 'instalador', -- 'instalador', 'supervisor', 'gerente', etc.
  data_associacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ativo BOOLEAN DEFAULT true,
  UNIQUE(cliente_id, profile_id, tipo_relacao)
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_clientes_usuarios_cliente ON clientes_usuarios(cliente_id);
CREATE INDEX IF NOT EXISTS idx_clientes_usuarios_profile ON clientes_usuarios(profile_id);
CREATE INDEX IF NOT EXISTS idx_clientes_usuarios_tipo ON clientes_usuarios(tipo_relacao);

-- 3. Verificar a estrutura criada
SELECT 
  table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clientes_usuarios' 
ORDER BY ordinal_position;

-- 4. Verificar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'clientes_usuarios' 
ORDER BY indexname;
