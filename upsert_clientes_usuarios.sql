-- Script para resolver o problema de constraint única na tabela clientes_usuarios
-- Este script implementa uma função que faz UPSERT (INSERT ... ON CONFLICT)

-- 1. Criar função para fazer UPSERT na tabela clientes_usuarios
CREATE OR REPLACE FUNCTION upsert_cliente_usuario(
  p_cliente_id UUID,
  p_profile_id UUID,
  p_tipo_relacao TEXT DEFAULT 'instalador',
  p_ativo BOOLEAN DEFAULT true
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Tentar inserir, se houver conflito, atualizar
  INSERT INTO clientes_usuarios (cliente_id, profile_id, tipo_relacao, ativo)
  VALUES (p_cliente_id, p_profile_id, p_tipo_relacao, p_ativo)
  ON CONFLICT (cliente_id, profile_id, tipo_relacao)
  DO UPDATE SET
    ativo = EXCLUDED.ativo,
    data_associacao = NOW()
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Criar função para atualizar múltiplos responsáveis de um cliente
CREATE OR REPLACE FUNCTION atualizar_responsaveis_cliente(
  p_cliente_id UUID,
  p_profile_ids UUID[],
  p_tipo_relacao TEXT DEFAULT 'instalador'
) RETURNS BOOLEAN AS $$
DECLARE
  v_profile_id UUID;
  v_success BOOLEAN := true;
BEGIN
  -- Primeiro, desativar todas as relações existentes para este cliente
  UPDATE clientes_usuarios 
  SET ativo = false 
  WHERE cliente_id = p_cliente_id;
  
  -- Inserir/atualizar as novas relações
  FOREACH v_profile_id IN ARRAY p_profile_ids
  LOOP
    BEGIN
      PERFORM upsert_cliente_usuario(p_cliente_id, v_profile_id, p_tipo_relacao, true);
    EXCEPTION
      WHEN OTHERS THEN
        v_success := false;
        RAISE NOTICE 'Erro ao processar profile_id %: %', v_profile_id, SQLERRM;
    END;
  END LOOP;
  
  RETURN v_success;
END;
$$ LANGUAGE plpgsql;

-- 3. Testar a função
-- Exemplo de uso:
-- SELECT atualizar_responsaveis_cliente(
--   'uuid-do-cliente-aqui',
--   ARRAY['uuid-do-profile-1', 'uuid-do-profile-2'],
--   'instalador'
-- );

-- 4. Verificar se as funções foram criadas
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name IN ('upsert_cliente_usuario', 'atualizar_responsaveis_cliente')
ORDER BY routine_name;

-- 5. Comentários sobre a solução:
/*
SOLUÇÃO IMPLEMENTADA:

1. FUNÇÃO upsert_cliente_usuario:
   - Faz INSERT se não existir, UPDATE se existir
   - Usa ON CONFLICT para resolver violações de constraint única
   - Retorna o ID do registro criado/atualizado

2. FUNÇÃO atualizar_responsaveis_cliente:
   - Desativa todas as relações existentes para um cliente
   - Insere/atualiza as novas relações usando a função upsert
   - Trata erros individualmente para cada profile_id

VANTAGENS:
- Resolve o problema de constraint única
- Mantém histórico (não deleta registros)
- Mais eficiente que deletar e reinserir
- Tratamento de erros robusto

USO NO CÓDIGO JAVASCRIPT:
- Pode chamar a função atualizar_responsaveis_cliente diretamente
- Ou implementar a lógica de UPSERT no código JavaScript
*/
