-- Script para aplicar as consultas finais após executar update_clientes_usuario_instalador.sql
-- Execute este script APÓS executar o SQL de atualização da estrutura

-- 1. Verificar se a estrutura foi criada corretamente
SELECT 
  'Verificando estrutura da tabela clientes' as status,
  COUNT(*) as colunas_encontradas
FROM information_schema.columns 
WHERE table_name = 'clientes' 
  AND column_name = 'usuario_instalador_id';

-- 2. Verificar se há usuários instaladores
SELECT 
  'Verificando usuários instaladores' as status,
  COUNT(*) as total_instaladores
FROM profiles p
INNER JOIN cargos c ON p.cargo_id = c.id
WHERE c.cargo = 'Instalador'
  AND p.ativo = true;

-- 3. Testar consulta de clientes com novo JOIN
SELECT 
  'Testando consulta de clientes' as status,
  COUNT(*) as clientes_encontrados
FROM clientes c
LEFT JOIN auth.users u ON c.usuario_instalador_id = u.id
LEFT JOIN profiles p ON u.id = p.id
LIMIT 1;

-- 4. Verificar se o índice foi criado
SELECT 
  'Verificando índice' as status,
  COUNT(*) as indices_encontrados
FROM pg_indexes 
WHERE tablename = 'clientes' 
  AND indexname LIKE '%usuario_instalador%';

-- 5. Resumo final
SELECT 
  'ESTRUTURA PRONTA PARA USO' as status,
  'Execute: npm start' as proximo_passo;
