# 🔧 Solução para o Erro de UUID no Script SQL

## ❌ Problema Identificado

O erro ocorreu porque:
- A tabela `clientes` usa **UUID** como tipo de chave primária
- O script original tentava criar foreign keys com **INTEGER**
- PostgreSQL não permite foreign keys entre tipos incompatíveis

## ✅ Solução Implementada

### 1. Script Principal Corrigido
**Arquivo**: `create_lista_material_tables_corrigido.sql`

**Principais correções**:
- ✅ Mudança de `INTEGER` para `UUID` em todas as chaves
- ✅ Uso de `gen_random_uuid()` para gerar IDs únicos
- ✅ Foreign keys compatíveis com a estrutura existente
- ✅ Remoção de dependências problemáticas

### 2. Script de Políticas RLS
**Arquivo**: `create_rls_policies.sql`

**Por que separado**:
- Evita conflitos durante a criação das tabelas
- Permite verificar se as tabelas foram criadas antes de aplicar RLS
- Facilita troubleshooting em caso de problemas

### 3. Script de Teste
**Arquivo**: `teste_lista_material.sql`

**Funcionalidade**:
- Verifica se tudo foi criado corretamente
- Mostra estrutura das tabelas
- Confirma funcionamento das políticas

## 🚀 Passos para Execução

### Passo 1: Executar Script Principal
```sql
-- Execute no seu banco de dados
\i create_lista_material_tables_corrigido.sql
```

### Passo 2: Executar Políticas RLS
```sql
-- Execute após o primeiro script
\i create_rls_policies.sql
```

### Passo 3: Verificar Funcionamento
```sql
-- Execute para confirmar que tudo está funcionando
\i teste_lista_material.sql
```

## 🔍 O que Mudou na Estrutura

### Antes (Problemático)
```sql
CREATE TABLE lista_material (
    id SERIAL PRIMARY KEY,           -- ❌ INTEGER
    cliente_id INTEGER NOT NULL,     -- ❌ INTEGER
    -- ...
);
```

### Depois (Corrigido)
```sql
CREATE TABLE lista_material (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,  -- ✅ UUID
    cliente_id UUID NOT NULL,                       -- ✅ UUID
    -- ...
);
```

## 📋 Estrutura Final das Tabelas

### `lista_material`
- `id` → UUID (chave primária)
- `cliente_id` → UUID (referência para clientes.id)
- `data_criacao` → TIMESTAMP
- `data_atualizacao` → TIMESTAMP
- `observacoes` → TEXT
- `ativo` → BOOLEAN

### `itens_material`
- `id` → UUID (chave primária)
- `lista_material_id` → UUID (referência para lista_material.id)
- `material` → VARCHAR(255)
- `quantidade` → INTEGER
- `classe` → VARCHAR(50) ['Kit', 'Padrão', 'Nenhum']
- `resolve_forneceu` → BOOLEAN
- `tecsol_forneceu` → BOOLEAN
- `data_criacao` → TIMESTAMP
- `data_atualizacao` → TIMESTAMP
- `ativo` → BOOLEAN

## 🎯 Próximos Passos

1. ✅ Execute os scripts na ordem correta
2. ✅ Verifique se não há erros
3. ✅ Teste a funcionalidade no sistema
4. ✅ Configure as permissões de usuário se necessário

## 🆘 Em Caso de Problemas

Se ainda houver erros:
1. Verifique se a tabela `clientes` existe e usa UUID
2. Confirme se o usuário tem permissões adequadas
3. Execute o script de teste para identificar problemas
4. Verifique os logs do PostgreSQL para detalhes específicos

## 📞 Suporte

Para dúvidas adicionais, verifique:
- Logs do banco de dados
- Permissões do usuário atual
- Estrutura das tabelas existentes
- Configurações do Supabase (se aplicável)
