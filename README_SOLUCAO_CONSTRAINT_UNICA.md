# Solução para Erro de Constraint Única na Tabela clientes_usuarios

## Problema Identificado

O erro `duplicate key value violates unique constraint "clientes_usuarios_cliente_id_profile_id_tipo_relacao_key"` ocorre quando você tenta editar um cliente e associar usuários a ele.

### Causa do Problema

A tabela `clientes_usuarios` possui uma constraint única em:
```sql
UNIQUE(cliente_id, profile_id, tipo_relacao)
```

Isso significa que não pode haver dois registros com a mesma combinação de:
- `cliente_id` (ID do cliente)
- `profile_id` (ID do usuário/perfil)
- `tipo_relacao` (tipo de relação, ex: 'instalador')

### Cenário do Erro

1. **Cliente existente** com usuários associados
2. **Edição do cliente** com novos usuários
3. **Tentativa de inserção** de registros com combinações já existentes
4. **Violação da constraint única** → ERRO

## Soluções Implementadas

### 1. Solução no Código JavaScript (Implementada)

**Arquivo:** `src/components/Welcome.js`

**Estratégia:** UPSERT (INSERT ... ON CONFLICT)

```javascript
// Usar UPSERT para inserir/atualizar relações
const { data: insertData, error: responsaveisError } = await supabase
  .from('clientes_usuarios')
  .upsert(responsaveisData, {
    onConflict: 'cliente_id,profile_id,tipo_relacao',
    ignoreDuplicates: false
  })
  .select()
```

**Como funciona:**
- Se não existir: INSERT
- Se existir: UPDATE (atualiza campos como `ativo` e `data_associacao`)

### 2. Solução SQL com Funções (Alternativa)

**Arquivo:** `upsert_clientes_usuarios.sql`

**Funções criadas:**
- `upsert_cliente_usuario()`: UPSERT individual
- `atualizar_responsaveis_cliente()`: UPSERT em lote

## Vantagens da Solução UPSERT

✅ **Resolve o erro** de constraint única
✅ **Mantém histórico** (não deleta registros)
✅ **Mais eficiente** que deletar e reinserir
✅ **Tratamento de erros** robusto
✅ **Funciona tanto para** criação quanto edição

## Como Testar

1. **Edite um cliente** existente
2. **Altere os usuários** responsáveis
3. **Salve** - não deve mais dar erro
4. **Verifique** se as associações foram atualizadas corretamente

## Estrutura da Tabela

```sql
CREATE TABLE clientes_usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo_relacao TEXT DEFAULT 'instalador',
  data_associacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ativo BOOLEAN DEFAULT true,
  UNIQUE(cliente_id, profile_id, tipo_relacao)  -- ← Esta é a constraint
);
```

## Logs de Debug

O código inclui logs detalhados para facilitar o debug:

```
🔧 Salvando responsáveis para cliente: [UUID]
👥 IDs dos responsáveis: [Array de UUIDs]
🔄 Atualizando relações existentes para cliente: [UUID]
✅ Relações existentes desativadas com sucesso
🔍 Verificando dados antes da inserção
📝 Dados dos responsáveis a serem inseridos: [Array de objetos]
✅ Responsáveis salvos com sucesso
```

## Próximos Passos

1. **Testar** a solução implementada
2. **Verificar** se o erro não ocorre mais
3. **Monitorar** logs para confirmar funcionamento
4. **Considerar** implementar a solução SQL se necessário

## Arquivos Modificados

- `src/components/Welcome.js` - Lógica de UPSERT implementada
- `upsert_clientes_usuarios.sql` - Funções SQL alternativas
- `README_SOLUCAO_CONSTRAINT_UNICA.md` - Este arquivo de documentação

## Suporte

Se ainda houver problemas, verifique:
1. **Logs do console** para detalhes do erro
2. **Estrutura da tabela** no banco de dados
3. **Dados sendo enviados** para inserção
4. **Constraints** ativas na tabela
