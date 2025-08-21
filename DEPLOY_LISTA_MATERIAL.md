# 🚀 Deploy do Sistema de Lista de Material

## 📋 Pré-requisitos

- ✅ Banco de dados PostgreSQL/Supabase configurado
- ✅ Sistema TecSol funcionando
- ✅ Usuários com roles configurados
- ✅ Acesso de administrador para execução de scripts

## 🔧 Passos para Deploy

### 1. Executar Script SQL

```bash
# Conectar ao banco de dados
psql -h seu_host -U seu_usuario -d sua_database

# Ou executar diretamente o arquivo
psql -h seu_host -U seu_usuario -d sua_database -f create_lista_material_tables.sql
```

**Alternativa via Supabase Dashboard:**
1. Acessar o projeto no Supabase
2. Ir para SQL Editor
3. Copiar e colar o conteúdo de `create_lista_material_tables.sql`
4. Executar o script

### 2. Verificar Criação das Tabelas

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name IN ('lista_material', 'itens_material');

-- Verificar estrutura das tabelas
\d lista_material
\d itens_material

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('lista_material', 'itens_material');
```

### 3. Verificar Funções

```sql
-- Verificar se a função foi criada
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'criar_lista_material_com_itens';

-- Testar a função
SELECT criar_lista_material_com_itens(1, 'Teste', '[]'::json);
```

### 4. Verificar Políticas RLS

```sql
-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('lista_material', 'itens_material');

-- Verificar políticas específicas
SELECT * FROM pg_policies 
WHERE tablename = 'lista_material';
```

## 🧪 Testes de Funcionalidade

### 1. Teste de Permissões

```sql
-- Testar acesso como usuário normal
-- Deve falhar para operações de escrita
INSERT INTO lista_material (cliente_id, observacoes) VALUES (1, 'Teste');

-- Testar acesso como administrador
-- Deve funcionar
-- (Execute como usuário com role 'administrador')
```

### 2. Teste de Inserção

```sql
-- Inserir lista de teste
INSERT INTO lista_material (cliente_id, observacoes) 
VALUES (1, 'Lista de teste para validação');

-- Inserir itens de teste
INSERT INTO itens_material (lista_material_id, material, quantidade, classe)
VALUES 
  (1, 'Módulo Solar 550W', 10, 'Kit'),
  (1, 'Inversor 5kW', 1, 'Kit'),
  (1, 'Cabo Solar 6mm²', 50, 'Padrão');
```

### 3. Teste de Função

```sql
-- Testar função de criação em lote
SELECT criar_lista_material_com_itens(
  1, 
  'Lista criada via função', 
  '[
    {"material": "Módulo Solar 550W", "quantidade": 10, "classe": "Kit"},
    {"material": "Inversor 5kW", "quantidade": 1, "classe": "Kit"}
  ]'::json
);
```

## 🔐 Configuração de Segurança

### 1. Verificar RLS

```sql
-- Confirmar que RLS está ativo
ALTER TABLE lista_material ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_material ENABLE ROW LEVEL SECURITY;
```

### 2. Verificar Políticas

```sql
-- Políticas devem estar ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('lista_material', 'itens_material');
```

### 3. Testar Isolamento de Dados

```sql
-- Como usuário A, deve ver apenas suas listas
-- Como usuário B, deve ver apenas suas listas
-- Como administrador, deve ver todas
```

## 📱 Verificação da Interface

### 1. Menu de Navegação
- ✅ Menu "Lista de Material" aparece para administradores/administrativos
- ✅ Menu não aparece para instaladores
- ✅ Navegação funciona corretamente

### 2. Funcionalidades
- ✅ Upload de arquivos Excel
- ✅ Seleção de clientes
- ✅ Edição de materiais
- ✅ Salvamento de listas
- ✅ Visualização de listas existentes
- ✅ Exportação de dados

### 3. Responsividade
- ✅ Interface funciona em desktop
- ✅ Interface funciona em mobile
- ✅ Layout se adapta corretamente

## 🚨 Troubleshooting

### Problema: Tabelas não foram criadas
```sql
-- Verificar se o usuário tem permissões
SELECT current_user;
SHOW search_path;

-- Verificar se o schema existe
SELECT schema_name FROM information_schema.schemata;
```

### Problema: RLS não está funcionando
```sql
-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('lista_material', 'itens_material');

-- Reativar RLS se necessário
ALTER TABLE lista_material ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_material ENABLE ROW LEVEL SECURITY;
```

### Problema: Políticas não foram criadas
```sql
-- Verificar políticas existentes
SELECT * FROM pg_policies 
WHERE tablename IN ('lista_material', 'itens_material');

-- Recriar políticas se necessário
-- (Execute novamente o script SQL)
```

### Problema: Função não funciona
```sql
-- Verificar se a função existe
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'criar_lista_material_com_itens';

-- Verificar permissões
SELECT grantee, privilege_type 
FROM information_schema.routine_privileges 
WHERE routine_name = 'criar_lista_material_com_itens';
```

## 📊 Monitoramento

### 1. Logs de Acesso
```sql
-- Verificar acessos recentes
SELECT * FROM pg_stat_user_tables 
WHERE relname IN ('lista_material', 'itens_material');
```

### 2. Performance
```sql
-- Verificar índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('lista_material', 'itens_material');

-- Verificar estatísticas
ANALYZE lista_material;
ANALYZE itens_material;
```

### 3. Uso do Sistema
```sql
-- Contar listas criadas
SELECT COUNT(*) FROM lista_material WHERE ativo = true;

-- Contar itens de material
SELECT COUNT(*) FROM itens_material;

-- Verificar distribuição por cliente
SELECT 
  c.nome_cliente,
  COUNT(lm.id) as total_listas
FROM clientes c
LEFT JOIN lista_material lm ON c.id = lm.cliente_id AND lm.ativo = true
GROUP BY c.id, c.nome_cliente
ORDER BY total_listas DESC;
```

## ✅ Checklist de Deploy

- [ ] Script SQL executado com sucesso
- [ ] Tabelas criadas e verificadas
- [ ] Funções criadas e testadas
- [ ] Políticas RLS ativas e funcionando
- [ ] Interface integrada ao menu principal
- [ ] Permissões configuradas corretamente
- [ ] Testes de funcionalidade realizados
- [ ] Testes de segurança realizados
- [ ] Documentação atualizada
- [ ] Usuários treinados na funcionalidade

## 🎯 Próximos Passos

1. **Monitoramento**: Acompanhar uso e performance
2. **Feedback**: Coletar feedback dos usuários
3. **Melhorias**: Implementar funcionalidades adicionais
4. **Treinamento**: Capacitar equipe no uso do sistema
5. **Documentação**: Atualizar manuais de usuário

---

**Status**: ✅ Pronto para Deploy  
**Versão**: 1.0.0  
**Data**: Dezembro 2024
