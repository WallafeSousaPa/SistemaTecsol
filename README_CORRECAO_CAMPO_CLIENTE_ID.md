# Correção: Campo cliente_id faltando na tabela presenca

## Problema Identificado

O sistema está apresentando erro ao salvar a lista de presença porque a tabela `presenca` no banco de dados não possui o campo `cliente_id`, mas o código JavaScript está tentando usar esse campo.

## Causa do Erro

1. **Estrutura da tabela atual**: A tabela `presenca` foi criada sem o campo `cliente_id`
2. **Código JavaScript**: O sistema tenta inserir/atualizar registros com `cliente_id`
3. **Erro de banco**: O PostgreSQL rejeita a operação porque o campo não existe

## Solução Temporária (Implementada)

O código foi corrigido para funcionar temporariamente **sem o campo `cliente_id`** até que o script SQL seja executado.

### O que foi corrigido:

1. ✅ **Função `loadPresencas`**: Removido JOIN com tabela clientes
2. ✅ **Função `handlePresencaFormSubmit`**: Validação de cliente desabilitada temporariamente
3. ✅ **Dados salvos**: Apenas campos existentes na tabela são salvos
4. ✅ **Edição**: Funciona sem carregar dados de cliente

### Limitações temporárias:

- ❌ **Campo cliente não é salvo** (será implementado após correção do banco)
- ❌ **Validação de cliente obrigatório** está desabilitada
- ❌ **Relatórios por cliente** não funcionarão até correção completa

## Solução Definitiva

Execute o script SQL `add_cliente_id_presenca.sql` no SQL Editor do Supabase para adicionar o campo faltante.

### Passos para Correção Definitiva

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Execute o script**: `add_cliente_id_presenca.sql`
4. **Verifique se o campo foi criado** usando as consultas de verificação

### Script de Correção

```sql
-- Adicionar o campo cliente_id à tabela presenca
ALTER TABLE presenca 
ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_presenca_cliente ON presenca(cliente_id);
```

## Estrutura Corrigida da Tabela presenca

Após a correção, a tabela `presenca` deve ter a seguinte estrutura:

```sql
CREATE TABLE presenca (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data_presenca DATE NOT NULL,
    data_cadastro_preenchido DATE DEFAULT CURRENT_DATE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE, -- ✅ Campo adicionado
    equipe_id UUID REFERENCES equipes(id),
    tipo_presenca VARCHAR(20) DEFAULT 'individual',
    veiculo_id UUID REFERENCES veiculos(id),
    km_inicial INTEGER,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Verificação

Após executar o script, verifique se o campo foi criado:

```sql
-- Verificar se o campo cliente_id existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'presenca' 
AND column_name = 'cliente_id';
```

## Impacto

### Antes da correção (atual):
- ✅ **Sistema funciona** (sem campo cliente)
- ❌ **Cliente não é salvo**
- ❌ **Validações de cliente não funcionam**

### Após a correção:
- ✅ **Sistema funcionará completamente**
- ✅ **Presenças poderão ser salvas com cliente associado**
- ✅ **Relatórios por cliente funcionarão**
- ✅ **Validações de cliente obrigatório funcionarão**

## Arquivos Afetados

- `add_cliente_id_presenca.sql` - Script de correção
- `src/components/Welcome.js` - Código corrigido temporariamente
- Tabela `presenca` no banco de dados

## Nota Importante

**O sistema está funcionando temporariamente** sem o campo cliente. Para funcionalidade completa, execute o script SQL. Após a correção, o código pode ser revertido para incluir todas as validações e funcionalidades de cliente.
