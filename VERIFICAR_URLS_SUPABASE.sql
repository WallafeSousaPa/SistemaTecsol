-- 🔧 VERIFICAR e CORRIGIR URLs de Confirmação do Supabase
-- Execute este script no SQL Editor do Supabase para resolver o problema de localhost

-- 1. VERIFICAR configurações atuais de autenticação
SELECT 
    'Configurações de Autenticação' as tipo,
    'auth.config' as tabela,
    'site_url' as campo,
    'Verificar se está apontando para localhost' as observacao;

-- 2. VERIFICAR se existe tabela auth.config
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'config' 
AND schemaname = 'auth';

-- 3. VERIFICAR configurações de URL (se a tabela existir)
-- Descomente as linhas abaixo se a tabela auth.config existir
/*
SELECT * FROM auth.config;

-- 4. ATUALIZAR site_url para produção (substitua pela sua URL real)
UPDATE auth.config 
SET site_url = 'https://seu-dominio.vercel.app'
WHERE site_url LIKE '%localhost%';

-- 5. VERIFICAR se foi atualizado
SELECT site_url FROM auth.config;
*/

-- 6. VERIFICAR configurações de email templates
SELECT 
    'Email Templates' as tipo,
    'Verificar se têm URLs hardcoded para localhost' as observacao;

-- 7. VERIFICAR configurações de SMTP
SELECT 
    'SMTP Settings' as tipo,
    'Verificar se as configurações estão corretas' as observacao;

-- 8. VERIFICAR configurações de RLS que podem ter URLs
SELECT 
    'RLS Policies' as tipo,
    'Verificar se há políticas com URLs hardcoded' as observacao;

-- 9. VERIFICAR funções que podem ter URLs
SELECT 
    'Funções' as tipo,
    'Verificar se há funções com URLs hardcoded' as observacao;

-- 10. INSTRUÇÕES para configurar no Dashboard
SELECT 
    'INSTRUÇÕES' as tipo,
    '1. Acesse: https://supabase.com/dashboard' as passo1,
    '2. Selecione seu projeto' as passo2,
    '3. Vá para: Authentication > Settings' as passo3,
    '4. Configure Site URL para sua URL de produção' as passo4,
    '5. Configure Redirect URLs para sua URL de produção' as passo5;

-- ✅ RESULTADO ESPERADO:
-- Após corrigir as configurações no Dashboard:
-- - Emails de confirmação vão para a URL de produção
-- - Redirecionamentos funcionam corretamente
-- - Usuários são confirmados na URL correta
-- - Sistema funciona em produção sem problemas
