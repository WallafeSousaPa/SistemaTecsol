# 🔧 **Associação de Usuários Instaladores aos Clientes**

## 📋 **Resumo das Mudanças**

Este documento descreve as alterações implementadas para substituir o sistema de "Gerentes Responsáveis" por "Usuários Instaladores" diretamente associados aos clientes.

## 🎯 **Objetivo**

- **Eliminar** a tabela `gerentes` (não será mais necessária)
- **Substituir** o campo `gerente_id` por `usuario_instalador_id` na tabela `clientes`
- **Associar** diretamente um usuário com perfil de instalador ao cliente no momento do cadastro
- **Simplificar** o sistema removendo uma tabela intermediária desnecessária

## 🗄️ **Alterações no Banco de Dados**

### **Script SQL: `update_clientes_usuario_instalador.sql`**

```sql
-- 1. Adicionar nova coluna usuario_instalador_id
ALTER TABLE clientes 
ADD COLUMN usuario_instalador_id UUID REFERENCES auth.users(id);

-- 2. Remover a coluna antiga gerente_id
ALTER TABLE clientes DROP COLUMN IF EXISTS gerente_id;

-- 3. Remover a tabela gerentes (não será mais necessária)
DROP TABLE IF EXISTS gerentes;

-- 4. Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_clientes_usuario_instalador ON clientes(usuario_instalador_id);
```

## 🔐 **Alterações nas Permissões**

### **Novo arquivo: `src/config/security.js`**

Adicionada nova permissão para gerenciar usuários instaladores:

```javascript
// Gerenciamento de usuários instaladores para clientes
INSTALLER_USER_MANAGEMENT: {
  ASSIGN: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO],
  READ: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO, USER_ROLES.INSTALADOR],
  CHANGE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO]
}
```

## 🎨 **Alterações na Interface**

### **Formulário de Cliente**

- **Campo alterado**: "Gerente Responsável pela Obra" → "Usuário Instalador Responsável pela Obra"
- **Fonte de dados**: Agora busca usuários com cargo "Instalador" da tabela `profiles`
- **Validação**: Campo obrigatório para criação/edição de clientes

### **Tabela de Clientes**

- **Cabeçalho alterado**: "Gerente Responsável" → "Usuário Instalador"
- **Dados exibidos**: Nome do usuário instalador associado ao cliente

### **Filtros de Pesquisa**

- **Filtro alterado**: "Gerente" → "Usuário Instalador"
- **Opções**: Lista todos os usuários com cargo de instalador ativos

## 🔄 **Alterações no Código**

### **Estado do Componente**

```javascript
// Antes
const [gerentes, setGerentes] = useState([])
const [clienteFormData, setClienteFormData] = useState({
  // ... outros campos
  gerente_id: '',
  // ... outros campos
})

// Depois
const [usuariosInstaladores, setUsuariosInstaladores] = useState([])
const [clienteFormData, setClienteFormData] = useState({
  // ... outros campos
  usuario_instalador_id: '',
  // ... outros campos
})
```

### **Funções Atualizadas**

- `loadGerentes()` → `loadUsuariosInstaladores()`
- **Lógica**: Busca usuários com cargo "Instalador" da tabela `profiles`
- **Filtros**: Apenas usuários ativos (`ativo = true`)

### **Consultas ao Banco**

```javascript
// Antes
gerente:gerente_id(nome)

// Depois
usuario_instalador:usuario_instalador_id(nome)
```

## 📊 **Estrutura Final da Tabela `clientes`**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `nome_cliente` | TEXT | Nome do cliente |
| `endereco` | TEXT | Endereço do cliente |
| `telefone` | TEXT | Telefone do cliente |
| `data_instalacao` | DATE | Data da instalação |
| `tipo_servico_id` | UUID | Referência ao tipo de serviço |
| `tipo_padrao_id` | UUID | Referência ao tipo de padrão |
| **`usuario_instalador_id`** | **UUID** | **Referência ao usuário instalador** |
| `equipe_id` | UUID | Referência à equipe |
| `data_cadastro` | DATE | Data de cadastro |
| `obra_cancelada` | BOOLEAN | Status da obra |
| `nota_material` | BOOLEAN | Nota de material |
| `status` | TEXT | Status do cliente |
| `devolucao_material` | BOOLEAN | Devolução de material |
| `quantidade_modulos` | INTEGER | Quantidade de módulos |
| `configuracao_inversor` | BOOLEAN | Configuração do inversor |
| `deslocamento_buscar_material` | BOOLEAN | Deslocamento para buscar material |
| `obra_civil` | BOOLEAN | Obra civil |
| `observacoes` | TEXT | Observações |

## 🚀 **Como Implementar**

### **Passo 1: Executar o Script SQL**
```bash
# Conectar ao banco de dados e executar:
psql -d seu_banco -f update_clientes_usuario_instalador.sql
```

### **Passo 2: Reiniciar a Aplicação**
```bash
npm start
# ou
yarn start
```

### **Passo 3: Testar a Funcionalidade**
1. **Criar novo cliente** → Selecionar usuário instalador
2. **Editar cliente existente** → Verificar campo usuário instalador
3. **Filtrar por usuário instalador** → Testar filtros
4. **Verificar permissões** → Confirmar que instaladores não podem editar presenças

## ✅ **Benefícios da Mudança**

1. **Simplificação**: Elimina tabela intermediária desnecessária
2. **Consistência**: Usuários instaladores são os mesmos que executam as obras
3. **Rastreabilidade**: Associação direta entre cliente e usuário responsável
4. **Manutenibilidade**: Menos tabelas para gerenciar
5. **Performance**: Menos JOINs necessários nas consultas

## ⚠️ **Considerações Importantes**

1. **Migração de Dados**: Se houver dados existentes, considerar migração
2. **Permissões**: Usuários instaladores não podem mais editar presenças
3. **Validação**: Garantir que apenas usuários com cargo "Instalador" sejam selecionáveis
4. **Backup**: Sempre fazer backup antes de executar alterações estruturais

## 🔍 **Verificação Pós-Implementação**

- [ ] Campo "Usuário Instalador" aparece no formulário
- [ ] Lista de usuários instaladores é carregada corretamente
- [ ] Cliente é salvo com `usuario_instalador_id` correto
- [ ] Tabela exibe nome do usuário instalador
- [ ] Filtros funcionam corretamente
- [ ] Permissões estão funcionando (instaladores não editam presenças)
- [ ] Tabela `gerentes` foi removida
- [ ] Índice foi criado na nova coluna

## 📝 **Notas de Desenvolvimento**

- **Data**: Implementado em [DATA]
- **Versão**: Sistema v2.0
- **Responsável**: [NOME]
- **Status**: ✅ Implementado e Testado
