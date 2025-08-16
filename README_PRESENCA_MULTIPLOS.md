# Sistema de Presença com Múltiplos Colaboradores

## 🆕 Nova Funcionalidade Implementada

O sistema de presença agora suporta **múltiplos colaboradores** por registro de presença, permitindo maior flexibilidade no controle de equipes.

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. **Tabela `presenca` (Nova)**
- `id` - Identificador único
- `data_presenca` - Data da presença
- `data_cadastro_preenchido` - Data do cadastro
- `equipe_id` - Referência à equipe
- `tipo_presenca` - **NOVO**: 'individual' ou 'grupo'
- `veiculo_id` - Referência ao veículo
- `km_inicial` - Quilometragem inicial
- `observacoes` - Observações gerais
- `created_at` / `updated_at` - Timestamps

#### 2. **Tabela `presenca_colaboradores` (Nova)**
- `id` - Identificador único
- `presenca_id` - Referência ao registro de presença
- `colaborador_id` - Referência ao colaborador
- `presente` - Status de presença (true/false)
- `observacoes` - Observações específicas do colaborador
- `created_at` / `updated_at` - Timestamps

#### 3. **Tabelas de Suporte (Criadas automaticamente)**
- `equipes` - Informações das equipes de trabalho
- `colaboradores` - Cadastro de colaboradores
- `veiculos` - Cadastro de veículos da empresa

## 🚀 Como Usar

### 1. **Executar Script SQL Completo**
Execute o script `create_presenca_completo.sql` no Supabase:

```sql
-- Execute no SQL Editor do Supabase
-- Este script criará TODAS as tabelas necessárias na ordem correta
```

**⚠️ IMPORTANTE**: Use o script `create_presenca_completo.sql` em vez do `create_presenca_multiplos_colaboradores.sql`, pois ele cria todas as tabelas necessárias do zero.

### 2. **Tipos de Presença**

#### **👤 Presença Individual**
- Seleciona **um colaborador** específico
- Ideal para presenças pontuais
- Mantém a funcionalidade anterior

#### **👥 Presença de Grupo**
- Seleciona **múltiplos colaboradores**
- Cada colaborador pode ter status individual (presente/ausente)
- Observações específicas por colaborador
- Ideal para equipes completas

### 3. **Fluxo de Cadastro**

#### **Para Presença Individual:**
1. Selecione a data e equipe
2. Escolha "Individual" como tipo
3. Selecione o colaborador
4. Preencha veículo, KM e observações
5. Salve

#### **Para Presença de Grupo:**
1. Selecione a data e equipe
2. Escolha "Grupo" como tipo
3. **Marque os colaboradores desejados** (checkboxes)
4. Para cada colaborador selecionado:
   - Marque se está presente ou ausente
   - Adicione observações específicas
5. Preencha veículo, KM e observações gerais
6. Salve

## 🎯 Funcionalidades

### **Seleção de Colaboradores**
- ✅ **Grid de seleção** com checkboxes
- ✅ **Filtro visual** por colaboradores ativos
- ✅ **Seleção múltipla** com interface intuitiva

### **Controle Individual**
- ✅ **Status por colaborador** (presente/ausente)
- ✅ **Observações específicas** por pessoa
- ✅ **Validação** de pelo menos um colaborador

### **Visualização**
- ✅ **Tabela atualizada** mostrando todos os colaboradores
- ✅ **Indicadores visuais** de presença (✅/❌)
- ✅ **Badges de tipo** (Individual/Grupo)
- ✅ **Observações** com ícones informativos

## 🔧 Implementação Técnica

### **Frontend (React)**
- Estado `colaboradoresSelecionados` para múltiplos colaboradores
- Renderização condicional baseada no tipo de presença
- Validação de formulário aprimorada
- Interface responsiva para dispositivos móveis

### **Backend (Supabase)**
- Nova tabela de relacionamento `presenca_colaboradores`
- Campo `tipo_presenca` na tabela principal
- Índices otimizados para performance
- Triggers para atualização automática de timestamps

### **Validações**
- ✅ Pelo menos um colaborador selecionado
- ✅ Campos obrigatórios preenchidos
- ✅ KM inicial válido (número >= 0)
- ✅ Permissões baseadas no role do usuário

## 📱 Interface Responsiva

### **Desktop**
- Grid de colaboradores em múltiplas colunas
- Formulário em layout horizontal
- Tabela com todas as informações visíveis

### **Mobile**
- Grid de colaboradores em coluna única
- Formulário empilhado verticalmente
- Tabela com scroll horizontal

## 🎨 Estilos CSS

### **Classes Principais**
- `.colaboradores-grid` - Grid de seleção
- `.colaborador-checkbox` - Checkbox individual
- `.colaboradores-selecionados` - Lista de selecionados
- `.colaborador-item` - Item de colaborador
- `.tipo-badge` - Badge de tipo de presença

### **Estados Visuais**
- **Hover effects** nos checkboxes
- **Cores diferenciadas** para tipos de presença
- **Indicadores visuais** de status
- **Transições suaves** entre estados

## 🚨 **IMPORTANTE: Script Correto**

### **❌ NÃO USE:**
- `create_presenca_multiplos_colaboradores.sql` (requer tabelas existentes)

### **✅ USE:**
- `create_presenca_completo.sql` (cria todas as tabelas do zero)

### **Por que a mudança?**
O script original assumia que as tabelas `presenca`, `equipes`, `colaboradores` e `veiculos` já existiam. Como você não tinha essas tabelas, criamos um script completo que:

1. **Cria todas as tabelas** na ordem correta
2. **Insere dados padrão** para teste
3. **Configura índices e triggers** automaticamente
4. **Inclui comentários** explicativos
5. **Verifica a criação** das tabelas

## 📋 Exemplos de Uso

### **Cenário 1: Equipe de Instalação**
```
Data: 2024-01-15
Equipe: Equipe A
Tipo: Grupo
Colaboradores:
  - João Silva ✅ (Presente)
  - Maria Santos ✅ (Presente)
  - Pedro Costa ❌ (Ausente - Justificado)
Veículo: Van Branca
KM: 50000
```

### **Cenário 2: Colaborador Individual**
```
Data: 2024-01-15
Equipe: Equipe B
Tipo: Individual
Colaborador: Ana Oliveira ✅ (Presente)
Veículo: Carro
KM: 25000
```

## 🔮 Próximas Melhorias

- [ ] **Relatórios** de presença por equipe
- [ ] **Estatísticas** de frequência por colaborador
- [ ] **Notificações** para ausências não justificadas
- [ ] **Exportação** de dados para Excel/PDF
- [ ] **Dashboard** com métricas de presença

## 📞 Suporte

Para dúvidas ou problemas com a nova funcionalidade:

1. **Execute o script correto**: `create_presenca_completo.sql`
2. **Verifique** se as tabelas foram criadas corretamente
3. **Teste** com dados de exemplo
4. **Consulte** os logs do console para erros

## 🚀 **Passos para Implementação:**

### **Passo 1: Executar Script SQL**
1. Acesse o **SQL Editor** no painel do Supabase
2. Copie e cole o conteúdo de `create_presenca_completo.sql`
3. Execute o script
4. Verifique se todas as tabelas foram criadas

### **Passo 2: Testar Frontend**
1. Acesse a aplicação em `http://localhost:3000`
2. Vá para o menu "Presença"
3. Teste a criação de presenças individuais e em grupo

### **Passo 3: Verificar Dados**
1. No Supabase, verifique se as tabelas têm dados
2. Confirme se os relacionamentos estão funcionando
3. Teste inserções manuais se necessário

---

**Desenvolvido para Tecsol - Sistema de Gerenciamento** 🚀
