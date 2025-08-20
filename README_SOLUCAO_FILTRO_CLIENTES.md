# Solução para Filtro de Clientes por Usuário Instalador

## Problema Identificado

Os clientes estavam aparecendo para todos os usuários instaladores quando deveriam aparecer apenas para os usuários aos quais estão associados. O sistema estava usando uma abordagem antiga com a coluna `usuario_instalador_id` diretamente na tabela `clientes`.

## Solução Implementada

### 1. Estrutura de Dados Corrigida

- **Removida**: Coluna `usuario_instalador_id` da tabela `clientes`
- **Implementada**: Tabela de relacionamento `clientes_usuarios` para múltiplos usuários por cliente
- **Adicionado**: Row Level Security (RLS) com políticas específicas por usuário

### 2. Arquivos de Solução

#### `corrigir_filtro_clientes_usuarios.sql`
Script principal que:
- Migra dados da coluna antiga para a nova estrutura
- Remove a coluna obsoleta
- Habilita RLS na tabela `clientes`
- Cria políticas de segurança específicas

#### `testar_filtro_clientes.sql`
Script de verificação que:
- Confirma se as políticas RLS estão ativas
- Verifica a estrutura das tabelas
- Testa o filtro de clientes por usuário

### 3. Políticas RLS Implementadas

#### Política de Seleção: "Usuários veem apenas clientes associados"
- **Administradores**: Veem todos os clientes
- **Usuários Administrativos**: Veem todos os clientes  
- **Instaladores**: Veem apenas clientes associados a eles via `clientes_usuarios`

#### Política de Inserção: "Apenas administradores podem inserir clientes"
- Restrita a usuários com role `administrador` ou `administrativo`

#### Política de Atualização: "Usuários podem atualizar clientes associados"
- Usuários podem atualizar apenas clientes aos quais estão associados

#### Política de Exclusão: "Apenas administradores podem excluir clientes"
- Restrita a usuários com role `administrador`

### 4. Código JavaScript Atualizado

O arquivo `src/components/Welcome.js` foi atualizado para:
- Remover a lógica de filtro manual por `usuario_instalador_id`
- Confiar no RLS automático do Supabase
- Simplificar a função `loadClientes`

## Como Implementar

### Passo 1: Executar o Script de Correção
```sql
-- Execute no SQL Editor do Supabase
\i corrigir_filtro_clientes_usuarios.sql
```

### Passo 2: Verificar a Implementação
```sql
-- Execute para confirmar que está funcionando
\i testar_filtro_clientes.sql
```

### Passo 3: Testar no Frontend
- Faça login com diferentes usuários instaladores
- Verifique se cada usuário vê apenas seus clientes associados
- Confirme que administradores veem todos os clientes

## Estrutura Final das Tabelas

### Tabela `clientes`
```sql
CREATE TABLE clientes (
    id BIGSERIAL PRIMARY KEY,
    nome_cliente VARCHAR(255) NOT NULL,
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(255),
    data_instalacao DATE,
    tipo_servico_id BIGINT REFERENCES tipos_servico(id),
    tipo_padrao_id BIGINT REFERENCES tipos_padrao(id),
    gerente_id BIGINT REFERENCES usuarios(id),
    equipe_id BIGINT REFERENCES equipes(id),
    data_cadastro DATE DEFAULT CURRENT_DATE,
    obra_cancelada BOOLEAN DEFAULT false,
    nota_material BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pendente',
    -- Campos de conclusão da obra...
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela `clientes_usuarios`
```sql
CREATE TABLE clientes_usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tipo_relacao TEXT DEFAULT 'instalador',
    data_associacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ativo BOOLEAN DEFAULT true,
    UNIQUE(cliente_id, profile_id, tipo_relacao)
);
```

## Benefícios da Solução

1. **Segurança**: RLS garante que usuários vejam apenas dados autorizados
2. **Flexibilidade**: Múltiplos usuários podem ser associados a um cliente
3. **Manutenibilidade**: Código mais limpo e lógica centralizada no banco
4. **Performance**: Filtros aplicados automaticamente pelo banco de dados
5. **Escalabilidade**: Fácil adicionar novos tipos de relacionamento

## Monitoramento

Após a implementação, monitore:
- Logs de erro no console do navegador
- Performance das consultas
- Acesso dos usuários aos clientes
- Funcionamento das políticas RLS

## Troubleshooting

### Se os clientes ainda aparecerem para todos:
1. Verifique se RLS está habilitado: `SELECT rowsecurity FROM pg_tables WHERE tablename = 'clientes';`
2. Confirme se as políticas foram criadas: `SELECT * FROM pg_policies WHERE tablename = 'clientes';`
3. Verifique se os relacionamentos existem na tabela `clientes_usuarios`

### Se houver erros de permissão:
1. Confirme que o usuário está autenticado
2. Verifique se o role do usuário está correto na tabela `profiles`
3. Confirme se os relacionamentos estão ativos (`ativo = true`)

## Exemplo de Consulta Manual

Para testar manualmente o filtro:
```sql
-- Substitua 'USER_ID' pelo ID do usuário logado
SELECT c.nome_cliente, c.endereco, c.status
FROM clientes c
WHERE EXISTS (
    SELECT 1 FROM clientes_usuarios cu
    JOIN profiles p ON cu.profile_id = p.id
    WHERE cu.cliente_id = c.id
    AND p.id = 'USER_ID'
    AND cu.ativo = true
);
```
