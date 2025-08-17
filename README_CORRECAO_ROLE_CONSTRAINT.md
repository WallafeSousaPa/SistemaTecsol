# 🔧 Correção da Constraint do Campo Role na Tabela Profiles

## ❌ **Problema Identificado:**

Ao tentar atualizar um usuário, aparece o erro:
```
Erro ao salvar usuário: new row for relation "profiles" violates check constraint "profiles_role_check"
```

## 🔍 **Causa do Problema:**

A tabela `profiles` tem uma constraint que limita os valores do campo `role` apenas para:
- `administrador`
- `administrativo` 
- `instalador`

Mas agora o sistema está configurado para usar os **cargos da tabela `cargos`** como funções dos usuários.

## ✅ **Solução:**

### 1. **Executar o Script SQL de Correção:**

Execute o arquivo `update_profiles_role_constraint.sql` no **SQL Editor do Supabase**:

```sql
-- Remover a constraint antiga
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Atualizar o campo role para aceitar qualquer valor
ALTER TABLE profiles ALTER COLUMN role TYPE VARCHAR(100);

-- Adicionar comentário explicativo
COMMENT ON COLUMN profiles.role IS 'Função/Cargo do usuário (referência à tabela cargos)';
```

### 2. **Verificar se a Correção foi Aplicada:**

```sql
-- Verificar se não há mais constraints restritivas
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'profiles' AND cc.column_name = 'role';
```

## 🎯 **Como Funciona Agora:**

### **Antes (Sistema Antigo):**
- Funções fixas: `administrador`, `instalador`, `usuario`
- Valores hardcoded no código
- Sem flexibilidade para novos cargos

### **Depois (Sistema Novo):**
- Funções dinâmicas baseadas na tabela `cargos`
- Novos cargos podem ser adicionados facilmente
- Sistema mais flexível e profissional

## 📋 **Passos para Aplicar a Correção:**

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Cole e execute o script `update_profiles_role_constraint.sql`**
4. **Verifique se não há erros**
5. **Teste o sistema novamente**

## 🚀 **Benefícios da Correção:**

- ✅ Usuários podem ser cadastrados com qualquer cargo da tabela `cargos`
- ✅ Sistema mais flexível e profissional
- ✅ Novos cargos podem ser adicionados sem alterar o código
- ✅ Melhor organização das funções dos usuários

## ⚠️ **Importante:**

- **Faça backup** da base de dados antes de executar o script
- **Teste** em ambiente de desenvolvimento primeiro
- **Verifique** se todas as funcionalidades continuam funcionando

## 🔄 **Próximos Passos:**

Após aplicar a correção:
1. Teste o cadastro de novos usuários
2. Teste a edição de usuários existentes
3. Verifique se as funções estão sendo carregadas corretamente da tabela `cargos`
4. Confirme se o menu superior está mostrando o nome do usuário ao invés do email

---

**📞 Suporte:** Se houver algum problema, verifique os logs do console e as mensagens de erro do Supabase.
