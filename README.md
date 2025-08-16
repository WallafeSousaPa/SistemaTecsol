# Tecsol - Sistema de Gerenciamento Integrado

Uma aplicação completa de sistema de gerenciamento integrada ao Supabase, com autenticação, dashboard e funcionalidades administrativas para a empresa Tecsol.

## 🚀 Funcionalidades

- **Sistema de Autenticação Completo**
  - Login de usuários existentes
  - Registro de novos usuários
  - Redirecionamento automático após autenticação
  - Dashboard personalizado com logo da empresa

- **Dashboard Administrativo com Controle de Acesso**
  - **Usuários**: Visualizar e gerenciar usuários do sistema (apenas Administradores)
  - **Clientes**: Cadastrar e gerenciar clientes (todos os perfis)
  - **Lista de Presença**: Controlar presença com data e observações (todos os perfis)
  - Interface intuitiva com navegação entre menus baseada em permissões
  - **Sistema de Roles:**
    - **Administrador**: Acesso completo a todas as funcionalidades
    - **Administrativo**: Acesso a clientes e presença, sem controle de usuários
    - **Instalador**: Acesso apenas a cadastro de clientes e lista de presença

- **Interface Moderna e Responsiva**
  - Design limpo e profissional
  - Logo da empresa integrada
  - Animações suaves e transições
  - Layout responsivo para diferentes dispositivos
  - Cards interativos no dashboard

- **Integração com Supabase**
  - Autenticação segura
  - Banco de dados em tempo real
  - Gerenciamento de sessões

## 🎨 Personalização da Logo

### Como Adicionar Sua Logo

1. **Substitua o arquivo de logo:**
   - Coloque sua logo no diretório `public/`
   - Nome recomendado: `logo-empresa.png` ou `logo-empresa.jpg`
   - Formatos suportados: PNG, JPG

2. **Atualize os componentes:**
   - Os componentes `Login.js` e `Register.js` já estão configurados
   - Eles automaticamente carregarão sua logo
   - Se a logo não carregar, será exibido um placeholder elegante

3. **Dimensões recomendadas:**
   - **PNG/JPG:** 120x80 pixels (proporção 3:2)

### Estrutura de Arquivos da Logo

```
public/
├── logo-empresa.png     # Sua logo (PNG recomendado)
└── logo-empresa.jpg     # Sua logo (JPG alternativo)
```

## 🔐 Sistema de Controle de Acesso

### Perfis de Usuário

O sistema implementa três níveis de acesso baseados em roles:

#### 👑 **Administrador**
- **Acesso completo** a todas as funcionalidades
- **Gerenciamento de usuários**: Criar, editar, deletar e alterar status
- **Gerenciamento de clientes**: CRUD completo
- **Lista de presença**: Controle total
- **Dashboard**: Visualização completa

#### 📋 **Administrativo**
- **Gerenciamento de clientes**: CRUD completo
- **Lista de presença**: Controle total
- **Dashboard**: Visualização completa
- **❌ Sem acesso** ao controle de usuários

#### 🔧 **Instalador**
- **Cadastro de clientes**: Apenas criação e visualização
- **Lista de presença**: Controle básico
- **Dashboard**: Visualização limitada
- **❌ Sem acesso** ao controle de usuários e operações administrativas

### Implementação Técnica

- **Validação de permissões** em tempo real
- **Interface adaptativa** baseada no role do usuário
- **Controle granular** de funcionalidades
- **Segurança em camadas** com validação no frontend e backend

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 18
- **Roteamento:** React Router DOM 6
- **Backend:** Supabase
- **Estilização:** CSS3 com animações e grid
- **Linguagem:** JavaScript ES6+
- **Segurança:** Sistema de roles e permissões customizado

## ⚙️ Configuração do Supabase

### Credenciais Configuradas

- **URL:** `https://ozttgvcetxxzdqfzeylt.supabase.co`
- **Chave Anônima:** Configurada no arquivo `src/supabaseClient.js`

### Configuração Necessária

1. **Habilitar Autenticação:**
   - Acesse o painel do Supabase
   - Vá para Authentication > Settings
   - Habilite "Enable email confirmations" se desejar

2. **Configurar Políticas de Segurança:**
   - As políticas básicas já estão configuradas
   - Personalize conforme suas necessidades

3. **Configurar Sistema de Roles:**
   - Execute o script `create_profiles_table.sql` para criar a tabela de perfis
   - Ou execute `update_profiles_table.sql` se a tabela já existir
   - Os usuários novos receberão automaticamente o role "Instalador"
   - Para alterar roles, use o painel de gerenciamento de usuários (apenas Administradores)

## 📋 Scripts SQL Disponíveis

### Scripts de Configuração

- **`create_profiles_table.sql`**: Cria a tabela de perfis com sistema de roles
- **`update_profiles_table.sql`**: Atualiza tabela de perfis existente para incluir roles
- **`create_clientes_table.sql`**: Cria todas as tabelas do sistema (clientes, equipes, etc.)
- **`check_and_fix_tables.sql`**: Script inteligente para verificar e corrigir estrutura das tabelas

### Como Executar

1. Acesse o **SQL Editor** no painel do Supabase
2. Copie e cole o script desejado
3. Execute o script
4. Verifique se as tabelas foram criadas/atualizadas corretamente

## 📦 Instalação e Execução

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos de Instalação

1. **Clone ou baixe o projeto**
2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm start
   ```

4. **Acesse no navegador:**
   ```
   http://localhost:3000
   ```

## 🗂️ Estrutura do Projeto

```
src/
├── components/
│   ├── Login.js          # Componente de login com logo
│   ├── Register.js       # Componente de registro com logo
│   ├── Welcome.js        # Dashboard principal com menus
│   ├── Auth.css          # Estilos dos componentes de auth
│   └── Welcome.css       # Estilos do dashboard e menus
├── App.js                # Componente principal com rotas
├── App.css               # Estilos globais
├── index.js              # Ponto de entrada
├── index.css             # Estilos base
└── supabaseClient.js     # Configuração do Supabase
```

## 🚦 Rotas da Aplicação

- **`/`** → Redireciona para `/login`
- **`/login`** → Tela de login com logo da empresa
- **`/register`** → Tela de registro com logo da empresa
- **`/welcome`** → Dashboard principal com menus

## 🔄 Fluxo de Uso

1. **Usuário acessa a aplicação**
2. **Escolhe entre Login ou Registro**
3. **Após autenticação bem-sucedida:**
   - Login → Redireciona para `/welcome` (Dashboard)
   - Registro → Redireciona para `/login`
4. **No Dashboard:**
   - Menu principal com 3 opções
   - Navegação entre diferentes funcionalidades
   - Opção de logout no cabeçalho

## 📋 Funcionalidades do Dashboard

### 🧑‍💼 **Gerenciamento de Usuários**
- Visualizar lista de usuários do sistema
- Criar novos usuários
- Editar informações de usuários existentes
- Remover usuários (com confirmação)
- Status de usuários (Ativo/Inativo)

### 👥 **Cadastro de Clientes**
- Formulário completo para novos clientes
- Campos: Nome, Email, Telefone, Endereço
- Layout em grid responsivo
- Validação de campos obrigatórios

### 📅 **Lista de Presença**
- Seleção de data para controle
- Lista de clientes com status de presença
- Opções: Presente ✅, Ausente ❌, Justificado ⚠️
- Campo para observações
- Criação de novas listas de presença

## 🎯 Próximos Passos

- [ ] Implementar funcionalidade de chat em tempo real
- [ ] Adicionar sistema de mensagens
- [ ] Implementar notificações
- [ ] Adicionar perfil do usuário
- [ ] Implementar busca de usuários
- [ ] Adicionar relatórios e estatísticas
- [ ] Implementar backup automático
- [ ] Adicionar sistema de permissões

## 📝 Notas de Desenvolvimento

- A aplicação está configurada para desenvolvimento local
- Todas as dependências estão especificadas no `package.json`
- O CSS está organizado por componente para fácil manutenção
- A logo da empresa é carregada dinamicamente com fallback elegante
- Interface responsiva para dispositivos móveis e desktop
- Animações suaves para melhor experiência do usuário

## 🎨 Características da Interface

- **Dashboard Cards:** Cards interativos com hover effects
- **Navegação Intuitiva:** Botões de voltar e navegação clara
- **Tabelas Responsivas:** Dados organizados em tabelas com hover
- **Formulários Modernos:** Inputs com foco e validação visual
- **Cores Consistentes:** Paleta de cores harmoniosa
- **Animações:** Transições suaves entre menus

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ usando React e Supabase**
