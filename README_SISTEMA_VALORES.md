# 💰 Sistema de Valores - Lista de Material

## 🎯 Visão Geral

O sistema agora inclui **controle completo de valores** para cada item de material, com cálculo automático de totais por fornecedor (Resolve e TecSol).

## ✨ Funcionalidades Implementadas

### 1. **Campo de Valor Unitário**
- ✅ Cada item pode ter um valor unitário configurado
- ✅ Campo editável na interface de preview
- ✅ Suporte a valores decimais (centavos)
- ✅ Valor padrão: R$ 0,00

### 2. **Cálculo Automático de Valores**
- ✅ **Valor Total por Item**: `Valor Unitário × Quantidade`
- ✅ **Total Resolve**: Soma dos itens marcados para Resolve
- ✅ **Total TecSol**: Soma dos itens marcados para TecSol
- ✅ **Total Geral**: Soma de todos os valores

### 3. **Interface Visual de Totais**
- ✅ **Resumo dos Valores** visível acima da tabela
- ✅ **Cores diferenciadas** para cada tipo de total
- ✅ **Atualização em tempo real** conforme edição dos valores
- ✅ **Formatação monetária** brasileira (R$ X,XX)

## 📊 Estrutura da Planilha Excel

### **Cabeçalhos Suportados**:

| Cabeçalho | Obrigatório | Descrição | Exemplo |
|-----------|-------------|-----------|---------|
| **Material** | ✅ | Nome do material | "Módulo Solar 550W" |
| **Quantidade** | ✅ | Quantidade necessária | 10 |
| **Classe** | ✅ | Classificação | "Kit", "Padrão", "Nenhum" |
| **Valor** | ⚠️ | Valor unitário | 150.50 |
| **Resolve** | ⚠️ | Se a Resolve forneceu | true/false, "Sim"/"Não" |
| **TecSol** | ⚠️ | Se a TecSol forneceu | true/false, "Sim"/"Não" |

### **Formato Recomendado**:
```
Linha 1-2: Informações do cliente (opcional)
Linha 3: Cabeçalhos das colunas
Linha 4+: Dados dos materiais com valores
```

## 🔧 Como Funciona

### **1. Detecção Automática**
- O sistema detecta automaticamente a coluna "Valor"
- Se não encontrar, define valor padrão como R$ 0,00
- Funciona com qualquer posição da coluna na planilha

### **2. Cálculo de Valores**
```javascript
// Para cada item:
Valor Total = Valor Unitário × Quantidade

// Totais por fornecedor:
Total Resolve = Σ(Valor Total dos itens marcados para Resolve)
Total TecSol = Σ(Valor Total dos itens marcados para TecSol)
Total Geral = Total Resolve + Total TecSol
```

### **3. Atualização Automática**
- Valores são recalculados em tempo real
- Totais são atualizados automaticamente
- Interface sempre mostra valores corretos

## 📱 Interface do Usuário

### **Seção de Resumo dos Valores**
- **💰 Resumo dos Valores** acima da tabela de preview
- **Total Resolve**: Valor total dos itens da Resolve (verde)
- **Total TecSol**: Valor total dos itens da TecSol (azul)
- **Total Geral**: Soma de todos os valores (roxo)

### **Tabela de Preview Atualizada**
- **Coluna "Valor Unit."**: Campo editável para valor unitário
- **Coluna "Valor Total"**: Cálculo automático (Valor × Quantidade)
- **Checkboxes Resolve/TecSol**: Para marcar fornecedor
- **Valores formatados**: R$ X,XX com cores diferenciadas

### **Edição de Valores**
- Clique no campo "Valor Unit." para editar
- Digite o valor (ex: 150.50)
- O sistema calcula automaticamente o valor total
- Totais são atualizados em tempo real

## 🗄️ Estrutura do Banco de Dados

### **Tabela `itens_material`**:
```sql
ALTER TABLE itens_material ADD COLUMN valor_unitario DECIMAL(10,2) DEFAULT 0.00;
```

### **Tabela `lista_material`**:
```sql
ALTER TABLE lista_material ADD COLUMN total_resolve DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE lista_material ADD COLUMN total_tecsol DECIMAL(10,2) DEFAULT 0.00;
```

### **Funções e Triggers**:
- **`calcular_totais_lista()`**: Calcula totais de uma lista
- **`atualizar_totais_lista()`**: Trigger para atualizar totais automaticamente
- **Atualização automática** sempre que itens são modificados

## 🚀 Como Usar

### **Passo 1: Preparar a Planilha**
1. Adicione uma coluna chamada **"Valor"**
2. Preencha com os valores unitários de cada item
3. Mantenha os cabeçalhos obrigatórios (Material, Quantidade, Classe)

### **Passo 2: Upload da Planilha**
1. Faça upload da planilha Excel
2. O sistema detectará automaticamente a coluna "Valor"
3. Verifique se os valores foram importados corretamente

### **Passo 3: Editar e Ajustar**
1. Edite valores unitários se necessário
2. Marque checkboxes para Resolve e/ou TecSol
3. Observe os totais sendo calculados automaticamente

### **Passo 4: Salvar**
1. Selecione o cliente
2. Clique em "Salvar Lista de Material"
3. Os totais serão salvos no banco de dados

## 📋 Exemplo Prático

### **Planilha de Exemplo**:
| Material | Quantidade | Classe | Valor | Resolve | TecSol |
|----------|------------|--------|-------|---------|---------|
| Módulo Solar | 10 | Kit | 150.50 | Sim | Não |
| Inversor | 1 | Kit | 800.00 | Sim | Sim |
| Cabos | 50 | Padrão | 2.50 | Não | Sim |

### **Cálculos Automáticos**:
- **Módulo Solar**: R$ 150,50 × 10 = R$ 1.505,00
- **Inversor**: R$ 800,00 × 1 = R$ 800,00
- **Cabos**: R$ 2,50 × 50 = R$ 125,00

### **Totais por Fornecedor**:
- **Total Resolve**: R$ 1.505,00 + R$ 800,00 = **R$ 2.305,00**
- **Total TecSol**: R$ 800,00 + R$ 125,00 = **R$ 925,00**
- **Total Geral**: R$ 2.305,00 + R$ 925,00 = **R$ 3.230,00**

## 🔍 Verificações e Validações

### **Validações Automáticas**:
- ✅ Valores negativos são convertidos para 0
- ✅ Valores inválidos são tratados como 0
- ✅ Quantidades são sempre ≥ 1
- ✅ Totais são sempre ≥ 0

### **Verificações de Integridade**:
- ✅ Soma dos totais = Soma de todos os valores
- ✅ Valores são salvos com precisão decimal
- ✅ Atualizações são feitas automaticamente

## 🆘 Solução de Problemas

### **Problema: Valores não aparecem**
**Solução**: Verifique se a coluna "Valor" existe na planilha e tem dados

### **Problema: Totais incorretos**
**Solução**: Confirme se os checkboxes Resolve/TecSol estão marcados corretamente

### **Problema: Valores não são salvos**
**Solução**: Execute o script `adicionar_campos_valor.sql` para criar os campos necessários

## 📞 Próximos Passos

1. ✅ **Execute o script SQL** para criar os campos de valor
2. ✅ **Teste com uma planilha** que contenha valores
3. ✅ **Verifique os cálculos** automáticos
4. ✅ **Teste o salvamento** com valores
5. ✅ **Confirme que os totais** são salvos corretamente

## 🎉 Benefícios do Sistema

- ✅ **Controle financeiro** completo dos materiais
- ✅ **Cálculos automáticos** sem erros manuais
- ✅ **Separação clara** por fornecedor
- ✅ **Interface intuitiva** para edição de valores
- ✅ **Persistência** dos dados no banco
- ✅ **Atualizações automáticas** em tempo real

O sistema de valores torna o controle de materiais muito mais profissional e preciso! 🚀
