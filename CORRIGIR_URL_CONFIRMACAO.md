# 🔧 CORRIGIR URL de Confirmação do Supabase

## ❌ **Problema Identificado**

O sistema está redirecionando para `localhost` na hora de confirmar o usuário, mas precisa ir para a URL de produção.

## 🔍 **Causa do Problema**

As configurações de URL de confirmação no projeto Supabase estão apontando para `localhost` em vez da URL de produção.

## ✅ **Soluções Disponíveis**

### **Opção 1: Configuração no Supabase Dashboard (RECOMENDADO)**

1. **Acesse o Supabase Dashboard:**
   - Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecione seu projeto

2. **Navegue para Authentication > Settings:**
   - Menu lateral → Authentication → Settings

3. **Configure as URLs:**
   ```
   Site URL: https://seu-dominio.vercel.app
   Redirect URLs: 
   - https://seu-dominio.vercel.app/auth/callback
   - https://seu-dominio.vercel.app/login
   - https://seu-dominio.vercel.app/register
   ```

4. **Salve as configurações**

### **Opção 2: Configuração via SQL (Avançado)**

Execute no SQL Editor do Supabase:

```sql
-- Verificar configurações atuais
SELECT * FROM auth.config;

-- Atualizar configurações (se necessário)
UPDATE auth.config 
SET site_url = 'https://seu-dominio.vercel.app'
WHERE id = 1;
```

### **Opção 3: Configuração via API (Desenvolvedor)**

```bash
# Obter configurações atuais
curl -X GET "https://ozttgvcetxxzdqfzeylt.supabase.co/rest/v1/auth/config" \
  -H "apikey: SUA_CHAVE_ANON" \
  -H "Authorization: Bearer SEU_TOKEN"

# Atualizar configurações
curl -X PATCH "https://ozttgvcetxxzdqfzeylt.supabase.co/rest/v1/auth/config" \
  -H "apikey: SUA_CHAVE_ANON" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"site_url": "https://seu-dominio.vercel.app"}'
```

## 🚀 **Passos para Resolver**

### **1. Acesse o Supabase Dashboard**
- [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Selecione seu projeto: `ozttgvcetxxzdqfzeylt`

### **2. Vá para Authentication > Settings**
- Menu lateral esquerdo
- Clique em "Authentication"
- Clique em "Settings"

### **3. Configure as URLs**
```
Site URL: https://seu-dominio.vercel.app
Redirect URLs: 
- https://seu-dominio.vercel.app/auth/callback
- https://seu-dominio.vercel.app/login
- https://seu-dominio.vercel.app/register
```

### **4. Salve e Teste**
- Clique em "Save"
- Teste o cadastro de um novo usuário
- Verifique se o email de confirmação vai para a URL correta

## 📋 **URLs que devem ser configuradas:**

### **Site URL:**
```
https://seu-dominio.vercel.app
```

### **Redirect URLs:**
```
https://seu-dominio.vercel.app/auth/callback
https://seu-dominio.vercel.app/login
https://seu-dominio.vercel.app/register
https://seu-dominio.vercel.app/dashboard
```

### **Additional Redirect URLs (se necessário):**
```
https://seu-dominio.vercel.app/*
```

## 🔧 **Configurações Adicionais:**

### **Email Templates:**
- Vá para Authentication > Email Templates
- Verifique se os templates não têm URLs hardcoded para localhost

### **SMTP Settings:**
- Vá para Authentication > SMTP Settings
- Verifique se as configurações estão corretas

## 🎯 **Resultado Esperado:**

Após corrigir as configurações:
- ✅ Emails de confirmação vão para a URL de produção
- ✅ Redirecionamentos funcionam corretamente
- ✅ Usuários são confirmados na URL correta
- ✅ Sistema funciona em produção sem problemas

## ⚠️ **ATENÇÃO:**

- **Backup:** Faça backup das configurações atuais
- **Teste:** Teste em ambiente de desenvolvimento primeiro
- **Verificação:** Confirme se as URLs estão corretas
- **Cache:** Limpe o cache do navegador após alterações

## 🚨 **Se o Problema Persistir:**

### **Verificar configurações de ambiente:**
```javascript
// Em src/supabaseClient.js
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ozttgvcetxxzdqfzeylt.supabase.co'
```

### **Verificar variáveis de ambiente:**
```bash
# No arquivo .env ou .env.local
REACT_APP_SUPABASE_URL=https://ozttgvcetxxzdqfzeylt.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-chave-aqui
```

---

**🎯 RESULTADO:** URLs de confirmação configuradas corretamente para produção!

---

**Desenvolvido por:** Sistema TecSol  
**Data:** Dezembro 2024  
**Tipo:** Correção de configuração de URLs do Supabase
