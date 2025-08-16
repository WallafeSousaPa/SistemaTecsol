# Sistema de Status dos Clientes

## 🎯 Visão Geral

O sistema agora inclui um campo **status** para os clientes, permitindo acompanhar o progresso das obras de forma organizada e controlada.

## 📊 Status Disponíveis

### **1. ⏳ Pendente**
- **Descrição**: Cliente cadastrado, obra ainda não iniciada
- **Cor**: Amarelo (#fff3cd)
- **Estado**: Status inicial para todos os novos clientes

### **2. 🚧 Em Andamento**
- **Descrição**: Obra iniciada, em execução
- **Cor**: Azul claro (#d1ecf1)
- **Estado**: Após clicar em "🚀 Executar Obra"

### **3. ✅ Finalizado**
- **Descrição**: Obra concluída, aguardando validação
- **Cor**: Verde (#d4edda)
- **Estado**: Após clicar em "✅ Obra Concluída"

### **4. 🔍 Validado**
- **Descrição**: Obra verificada e aprovada
- **Cor**: Roxo (#e2d9f3)
- **Estado**: Após clicar em "🔍 Validar Obra"

## 🔐 Permissões por Role

### **👑 Administrador**
- ✅ **Pode alterar status** para qualquer valor
- ✅ **Pode executar obra** (pendente → em andamento)
- ✅ **Pode concluir obra** (em andamento → finalizado)
- ✅ **Pode validar obra** (finalizado → validado)
- ✅ **Pode editar clientes** (incluindo status)
- ✅ **Pode remover clientes**

### **👔 Administrativo**
- ❌ **NÃO pode alterar status** diretamente
- ❌ **NÃO pode executar obra**
- ❌ **NÃO pode concluir obra**
- ✅ **Pode apenas validar obra** (finalizado → validado)
- ✅ **Pode editar clientes** (mas não status)
- ✅ **Pode remover clientes**

### **🔧 Instalador**
- ❌ **NÃO pode alterar status** diretamente
- ✅ **Pode executar obra** (pendente → em andamento)
- ✅ **Pode concluir obra** (em andamento → finalizado)
- ❌ **NÃO pode validar obra**
- ❌ **NÃO pode editar clientes**
- ❌ **NÃO pode remover clientes**

## 🚀 Como Usar

### **Para Administradores:**

1. **Executar Obra**:
   - Cliente com status "Pendente"
   - Clique em "🚀 Executar Obra"
   - Status muda para "Em Andamento"

2. **Concluir Obra**:
   - Cliente com status "Em Andamento"
   - Clique em "✅ Obra Concluída"
   - Status muda para "Finalizado"

3. **Validar Obra**:
   - Cliente com status "Finalizado"
   - Clique em "🔍 Validar Obra"
   - Status muda para "Validado"

### **Para Administrativos:**

1. **Apenas Validar**:
   - Cliente com status "Finalizado"
   - Clique em "🔍 Validar Obra"
   - Status muda para "Validado"

### **Para Instaladores:**

1. **Executar Obra**:
   - Cliente com status "Pendente"
   - Clique em "🚀 Executar Obra"
   - Status muda para "Em Andamento"

2. **Concluir Obra**:
   - Cliente com status "Em Andamento"
   - Clique em "✅ Obra Concluída"
   - Status muda para "Finalizado"

## 🔧 Implementação Técnica

### **Campo Status no Banco:**
```sql
ALTER TABLE clientes ADD COLUMN status VARCHAR(20) DEFAULT 'pendente';

-- Constraint para valores válidos
ALTER TABLE clientes ADD CONSTRAINT check_status_cliente 
CHECK (status IN ('pendente', 'em_andamento', 'finalizado', 'validado'));
```

### **Estado no Frontend:**
```javascript
const [clienteFormData, setClienteFormData] = useState({
  // ... outros campos
  status: 'pendente'
})
```

### **Funções de Status:**
```javascript
// Executar obra (pendente → em andamento)
const handleExecutarObra = async (cliente) => {
  await supabase
    .from('clientes')
    .update({ status: 'em_andamento' })
    .eq('id', cliente.id)
}

// Concluir obra (em andamento → finalizado)
const handleObraConcluida = async (cliente) => {
  await supabase
    .from('clientes')
    .update({ status: 'finalizado' })
    .eq('id', cliente.id)
}

// Validar obra (finalizado → validado)
const handleValidarObra = async (cliente) => {
  await supabase
    .from('clientes')
    .update({ status: 'validado' })
    .eq('id', cliente.id)
}
```

## 🎨 Interface Visual

### **Badges de Status na Tabela:**
- **Pendente**: ⏳ Pendente (amarelo)
- **Em Andamento**: 🚧 Em Andamento (azul)
- **Finalizado**: ✅ Finalizado (verde)
- **Validado**: 🔍 Validado (roxo)

### **Botão de Ação Único:**
- **Apenas um botão** é exibido por cliente, baseado no status atual
- **Interface limpa** sem poluição visual
- **Ação contextual** sempre disponível para o próximo passo

### **Botão de Status Único:**
- **🚀 Executar Obra**: Azul (#007bff) - Para clientes pendentes
- **✅ Obra Concluída**: Verde (#28a745) - Para clientes em andamento
- **🔍 Validar Obra**: Azul claro (#17a2b8) - Para clientes finalizados

### **Estados Informativos:**
- **✅ Obra Validada**: Verde (#d4edda) - Para clientes validados
- **⏳ Aguardando...**: Amarelo (#fff3cd) - Para status intermediários

## 🔍 Filtros e Pesquisa

### **Filtro por Status:**
- Dropdown com todas as opções de status
- Filtra clientes por status específico
- Incluído na interface de filtros

### **Filtros Disponíveis:**
1. **Nome do Cliente** (busca parcial)
2. **Data de Instalação** (período)
3. **Tipo de Serviço**
4. **Gerente Responsável**
5. **Status do Cliente** ⭐ **NOVO**
6. **Status da Obra** (cancelada/ativa)

## 📱 Responsividade

- **Desktop**: Botões lado a lado com espaçamento adequado
- **Tablet**: Botões empilhados verticalmente
- **Mobile**: Botões em coluna única com largura total

## 🚨 Validações

### **Transições de Status:**
- **Pendente** → **Em Andamento** ✅
- **Em Andamento** → **Finalizado** ✅
- **Finalizado** → **Validado** ✅
- **Outras transições** ❌ (não permitidas)

### **Permissões:**
- Verificação de role antes de executar ações
- Mensagens de erro para ações não permitidas
- Botões desabilitados para ações não disponíveis

## 🔄 Fluxo de Trabalho

### **Fluxo Padrão:**
```
Pendente → Em Andamento → Finalizado → Validado
   ↓           ↓            ↓           ↓
Cadastro   Executar    Concluir    Validar
           Obra        Obra        Obra
```

### **Fluxo por Role:**

#### **Instalador:**
```
Pendente → Em Andamento → Finalizado
   ↓           ↓            ↓
Executar    Concluir    (Aguarda
Obra        Obra        Validação)
```

#### **Administrativo:**
```
Finalizado → Validado
     ↓         ↓
(Recebe)   Validar
           Obra
```

#### **Administrador:**
```
Pendente → Em Andamento → Finalizado → Validado
   ↓           ↓            ↓           ↓
Executar    Concluir    Validar    (Completo)
Obra        Obra        Obra
```

## 📋 Scripts SQL

### **Para Tabelas Existentes:**
Execute o arquivo `add_status_clientes.sql` no SQL Editor do Supabase.

### **Para Novas Instalações:**
Use o arquivo `create_clientes_table_com_status.sql` que já inclui o campo status.

## 🧪 Como Testar

### **1. Teste de Permissões:**
1. **Login como Instalador**:
   - Deve ver botão "🚀 Executar Obra" para clientes pendentes
   - Deve ver botão "✅ Obra Concluída" para clientes em andamento
   - NÃO deve ver botão "🔍 Validar Obra"
   - NÃO deve poder editar status diretamente

2. **Login como Administrativo**:
   - Deve ver botão "🔍 Validar Obra" para clientes finalizados
   - NÃO deve ver botões de executar/concluir obra
   - Pode editar clientes (mas não status)

3. **Login como Administrador**:
   - Deve ver TODOS os botões de status
   - Pode alterar status para qualquer valor
   - Pode editar e remover clientes

### **2. Teste de Fluxo:**
1. **Criar cliente** (status: Pendente)
2. **Executar obra** (status: Em Andamento)
3. **Concluir obra** (status: Finalizado)
4. **Validar obra** (status: Validado)

### **3. Teste de Validações:**
1. **Tentar executar obra** em cliente já em andamento ❌
2. **Tentar concluir obra** em cliente pendente ❌
3. **Tentar validar obra** em cliente não finalizado ❌

## 🎉 Benefícios

- ✅ **Controle total** do progresso das obras
- ✅ **Permissões granulares** por role
- ✅ **Interface limpa** com apenas um botão por cliente
- ✅ **Ação contextual** sempre disponível para o próximo passo
- ✅ **Lista de presença automática** ao executar obra
- ✅ **Formulário de conclusão automático** ao finalizar obra
- ✅ **Filtros avançados** por status
- ✅ **Validações automáticas** de transições
- ✅ **Auditoria completa** das mudanças de status
- ✅ **Fluxo de trabalho** padronizado
- ✅ **Responsividade** para todos os dispositivos

---

**Desenvolvido para Tecsol - Sistema de Gerenciamento** 🚀 