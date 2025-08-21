# 📋 Sistema de Lista de Material - TecSol

## Visão Geral

O sistema de Lista de Material permite aos usuários administradores e administrativos gerenciar listas de materiais necessários para cada cliente, incluindo funcionalidades de importação de planilhas Excel, edição manual e exportação de dados.

## 🚀 Funcionalidades

### 1. Importação de Planilhas Excel
- **Formato esperado**: Planilhas Excel (.xlsx, .xls)
- **Estrutura da planilha**:
  - **A2**: Nome do cliente
  - **A4-E4**: Cabeçalho da tabela
  - **A5+**: Nome do material
  - **B5+**: Quantidade necessária
  - **C5+**: Classe do material (Kit, Padrão ou Nenhum)

### 2. Gerenciamento de Materiais
- Adicionar/remover itens de material
- Editar quantidade e classificação
- Marcar fornecedores (Resolve e TecSol)
- Validação de dados em tempo real

### 3. Visualização e Exportação
- Visualizar listas existentes por cliente
- Exportar dados para Excel/CSV
- Histórico de criação e modificação
- Detalhes completos de cada lista

## 🗄️ Estrutura do Banco de Dados

### Tabela `lista_material`
```sql
CREATE TABLE lista_material (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true
);
```

### Tabela `itens_material`
```sql
CREATE TABLE itens_material (
    id SERIAL PRIMARY KEY,
    lista_material_id INTEGER NOT NULL REFERENCES lista_material(id),
    material VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    classe VARCHAR(50) NOT NULL CHECK (classe IN ('Kit', 'Padrão', 'Nenhum')),
    resolve_forneceu BOOLEAN DEFAULT false,
    tecsol_forneceu BOOLEAN DEFAULT false,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Controle de Acesso

### Permissões por Role
- **Administrador**: Acesso completo (CRUD)
- **Administrativo**: Acesso completo (CRUD)
- **Instalador**: Apenas visualização das listas dos seus clientes

### Políticas RLS (Row Level Security)
- Usuários só podem ver listas de clientes que têm acesso
- Apenas administradores e administrativos podem criar/editar/excluir
- Controle automático de acesso baseado em relacionamentos

## 📱 Interface do Usuário

### Componente Principal
- **Arquivo**: `src/components/ListaMaterial.js`
- **Estilos**: `src/components/ListaMaterial.css`
- **Integração**: Adicionado ao menu principal do sistema

### Seções da Interface
1. **📥 Importação**: Upload de planilhas Excel
2. **👤 Cliente**: Seleção do cliente para a lista
3. **🔧 Editor**: Edição manual dos itens de material
4. **📚 Listas Existentes**: Visualização das listas salvas

## 🛠️ Implementação Técnica

### Dependências
- React Hooks (useState, useEffect, useRef)
- Supabase para backend
- CSS Grid e Flexbox para layout responsivo

### Funcionalidades Principais
- **File Upload**: Processamento de arquivos Excel
- **Data Management**: CRUD completo de listas e itens
- **Real-time Updates**: Atualização automática da interface
- **Error Handling**: Tratamento robusto de erros
- **Responsive Design**: Interface adaptável para mobile

### Funções do Banco
```sql
-- Função para criar lista com itens em lote
CREATE OR REPLACE FUNCTION criar_lista_material_com_itens(
    p_cliente_id INTEGER,
    p_observacoes TEXT DEFAULT NULL,
    p_itens JSON DEFAULT '[]'::JSON
) RETURNS INTEGER
```

## 📋 Fluxo de Uso

### 1. Criar Nova Lista
1. Selecionar cliente
2. Importar planilha Excel OU adicionar itens manualmente
3. Editar/ajustar dados conforme necessário
4. Salvar lista no banco

### 2. Gerenciar Listas Existentes
1. Visualizar todas as listas do sistema
2. Ver detalhes de cada lista
3. Editar ou excluir conforme necessário
4. Exportar dados para Excel

### 3. Controle de Fornecedores
- Marcar se a Resolve forneceu o material
- Marcar se a TecSol forneceu o material
- Acompanhar status de fornecimento

## 🔧 Configuração

### 1. Executar Script SQL
```bash
# Executar o script de criação das tabelas
psql -d sua_database -f create_lista_material_tables.sql
```

### 2. Verificar Permissões
- Confirmar que as políticas RLS estão ativas
- Verificar se as funções foram criadas corretamente
- Testar acesso com diferentes roles de usuário

### 3. Integração com Sistema
- O componente já está integrado ao menu principal
- Verificar se as permissões de segurança estão configuradas
- Testar funcionalidade com usuários de diferentes níveis

## 🚨 Considerações de Segurança

### Validação de Dados
- Verificação de tipos de arquivo (apenas Excel)
- Validação de entrada de usuário
- Sanitização de dados antes de salvar

### Controle de Acesso
- RLS ativo em todas as tabelas
- Verificação de permissões por role
- Isolamento de dados entre usuários

### Auditoria
- Timestamps automáticos de criação/modificação
- Log de todas as operações
- Rastreabilidade completa das alterações

## 📊 Relatórios e Exportação

### Formatos Suportados
- **CSV**: Para importação em outras ferramentas
- **Excel**: Para análise e compartilhamento
- **JSON**: Para integração com APIs

### Dados Exportados
- Informações do cliente
- Lista completa de materiais
- Status de fornecimento
- Datas de criação e modificação

## 🔮 Melhorias Futuras

### Funcionalidades Planejadas
- **Template de Planilha**: Download de modelo padrão
- **Validação Avançada**: Verificação automática de dados
- **Notificações**: Alertas de materiais pendentes
- **Integração**: Conexão com sistemas de estoque
- **Relatórios**: Dashboards de análise de materiais

### Otimizações Técnicas
- **Cache**: Implementação de cache para melhor performance
- **Pagination**: Paginação para grandes volumes de dados
- **Search**: Busca avançada e filtros
- **Bulk Operations**: Operações em lote para múltiplas listas

## 📞 Suporte

Para dúvidas ou problemas com o sistema de Lista de Material:

1. Verificar logs do console do navegador
2. Confirmar permissões do usuário
3. Verificar estrutura das planilhas Excel
4. Consultar documentação do Supabase

---

**Desenvolvido para TecSol Sistema**  
**Versão**: 1.0.0  
**Data**: Dezembro 2024
