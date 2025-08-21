# 🔧 Correção das Políticas RLS - Profile ID

## ❌ Problema Identificado

O erro ocorreu porque as políticas RLS estavam usando uma estrutura incorreta:

**Estrutura Incorreta (Original)**:
```sql
-- ❌ ERRO: coluna 'cu.usuario_id' não existe
INNER JOIN clientes_usuarios cu ON c.id = cu.cliente_id
WHERE cu.usuario_id = auth.uid()
```

## ✅ Estrutura Correta Identificada

Após verificar a documentação do projeto, a estrutura real é:

**Tabela `clientes_usuarios`**:
```sql
CREATE TABLE clientes_usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,  -- ✅ CORRETO
    tipo_relacao TEXT DEFAULT 'instalador',
    data_associacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ativo BOOLEAN DEFAULT true,
    UNIQUE(cliente_id, profile_id, tipo_relacao)
);
```

## 🔄 Correção Implementada

### Antes (Incorreto)
```sql
-- ❌ Usava 'usuario_id' que não existe
INNER JOIN clientes_usuarios cu ON c.id = cu.cliente_id
WHERE cu.usuario_id = auth.uid()
```

### Depois (Correto)
```sql
-- ✅ Usa 'profile_id' com JOIN para profiles
INNER JOIN clientes_usuarios cu ON c.id = cu.cliente_id
INNER JOIN profiles p ON cu.profile_id = p.id
WHERE p.id = auth.uid()
AND cu.ativo = true
```

## 📁 Arquivos Atualizados

1. **`create_rls_policies_corrigido.sql`** - Versão corrigida das políticas
2. **`CORRECAO_RLS_PROFILE_ID.md`** - Este arquivo explicativo

## 🚀 Como Executar

### Passo 1: Remover Políticas Incorretas (se existirem)
```sql
-- Execute se as políticas incorretas já foram criadas
DROP POLICY IF EXISTS "Usuários podem ver listas de material de clientes autorizados" ON lista_material;
DROP POLICY IF EXISTS "Usuários podem ver itens de listas autorizadas" ON itens_material;
-- ... remover outras políticas incorretas
```

### Passo 2: Executar Políticas Corrigidas
```sql
-- Execute o script corrigido
\i create_rls_policies_corrigido.sql
```

## 🔍 Estrutura da Relação

```
usuários (auth.users)
    ↓
profiles (id, role, ...)
    ↓
clientes_usuarios (profile_id, cliente_id, ...)
    ↓
clientes (id, nome_cliente, ...)
    ↓
lista_material (cliente_id, ...)
    ↓
itens_material (lista_material_id, ...)
```

## ✅ Benefícios da Correção

1. **Compatibilidade**: Usa a estrutura real das tabelas
2. **Segurança**: Mantém o controle de acesso por perfil
3. **Performance**: JOINs otimizados com índices existentes
4. **Manutenibilidade**: Código alinhado com a arquitetura do sistema

## 🆘 Verificação

Para confirmar que está funcionando:

```sql
-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('lista_material', 'itens_material')
ORDER BY tablename, policyname;

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename IN ('lista_material', 'itens_material');
```

## 📞 Próximos Passos

1. ✅ Execute `create_rls_policies_corrigido.sql`
2. ✅ Verifique se não há erros
3. ✅ Teste o acesso aos dados
4. ✅ Confirme que as políticas estão funcionando

Agora as políticas RLS devem funcionar corretamente com a estrutura real do banco de dados!
