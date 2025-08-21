# 🔍 Sistema de Detecção Automática de Cabeçalhos - Lista de Material

## 🎯 Visão Geral

O sistema agora possui **detecção automática de cabeçalhos** para planilhas Excel, eliminando a necessidade de especificar manualmente as células. O sistema analisa automaticamente a estrutura da planilha e identifica as colunas relevantes.

## ✨ Funcionalidades Principais

### 1. **Detecção Automática de Cabeçalhos**
- ✅ Identifica automaticamente as colunas: **Material**, **Quantidade**, **Classe**
- ✅ Detecta colunas opcionais: **Resolve**, **TecSol**
- ✅ Funciona independentemente da posição das colunas na planilha
- ✅ Suporta variações de nomenclatura (case-insensitive)

### 2. **Flexibilidade de Formato**
- 🎯 **Não importa onde** estão as colunas na planilha
- 🎯 **Não importa a ordem** das colunas
- 🎯 **Não importa a linha** onde está o cabeçalho (até linha 20)
- 🎯 **Funciona com qualquer estrutura** de planilha

### 3. **Validação Inteligente**
- 🔍 Verifica se pelo menos 3 cabeçalhos obrigatórios foram encontrados
- 🔍 Mapeia automaticamente as colunas para os campos corretos
- 🔍 Valida dados e aplica regras de negócio automaticamente

## 📋 Como Funciona

### **Processo de Detecção**

1. **Análise da Planilha**: O sistema analisa as primeiras 20 linhas da planilha
2. **Busca por Cabeçalhos**: Procura por palavras-chave nos cabeçalhos:
   - `material` → Coluna de Material
   - `quantidade` → Coluna de Quantidade  
   - `classe` → Coluna de Classe
   - `resolve` → Coluna de Resolve (opcional)
   - `tecsol` → Coluna de TecSol (opcional)

3. **Validação**: Confirma se pelo menos 3 cabeçalhos obrigatórios foram encontrados
4. **Mapeamento**: Cria um mapeamento automático das colunas
5. **Extração**: Extrai dados das linhas após o cabeçalho detectado

### **Exemplo de Funcionamento**

```
Planilha Original:
┌─────────┬────────────┬────────────┬────────────┬────────────┬────────────┐
│   A     │     B      │     C      │     D      │     E      │     F      │
├─────────┼────────────┼────────────┼────────────┼────────────┼────────────┤
│ Cliente │            │            │            │            │            │
│ João    │            │            │            │            │            │
│         │            │            │            │            │            │
│ Material│ Quantidade │   Classe   │  Resolve   │   TecSol   │            │
│ Módulo  │     10     │    Kit     │    Sim     │    Não     │            │
│ Inversor│      1     │    Kit     │    Sim     │    Sim     │            │
└─────────┴────────────┴────────────┴────────────┴────────────┴────────────┘

Sistema Detecta:
✅ Material (coluna A)
✅ Quantidade (coluna B)  
✅ Classe (coluna C)
✅ Resolve (coluna D)
✅ TecSol (coluna E)
```

## 🚀 Como Usar

### **Passo 1: Preparar a Planilha**
- Certifique-se de que a planilha contenha os cabeçalhos esperados
- Os cabeçalhos podem estar em qualquer linha (até linha 20)
- As colunas podem estar em qualquer ordem

### **Passo 2: Fazer Upload**
- Clique em "Escolher arquivo" e selecione sua planilha Excel
- O sistema processará automaticamente e detectará os cabeçalhos

### **Passo 3: Verificar Detecção**
- O sistema mostrará quais cabeçalhos foram detectados
- Exibirá o mapeamento de colunas (ex: Material → Coluna A)
- Apresentará uma prévia dos dados extraídos

### **Passo 4: Revisar e Salvar**
- Revise os dados extraídos na tabela de preview
- Edite qualquer item se necessário
- Selecione o cliente e salve a lista

## 📊 Cabeçalhos Suportados

### **Obrigatórios**
| Cabeçalho | Descrição | Exemplo |
|-----------|-----------|---------|
| `Material` | Nome do material | "Módulo Solar 550W" |
| `Quantidade` | Quantidade necessária | 10 |
| `Classe` | Classificação do material | "Kit", "Padrão", "Nenhum" |

### **Opcionais**
| Cabeçalho | Descrição | Exemplo |
|-----------|-----------|---------|
| `Resolve` | Se a Resolve forneceu | true/false, "Sim"/"Não" |
| `TecSol` | Se a TecSol forneceu | true/false, "Sim"/"Não" |

## 🔧 Validações Automáticas

### **Dados Aplicados Automaticamente**
- **Quantidade**: Se inválida ou vazia, define como 1
- **Classe**: Se inválida, define como "Nenhum"
- **Resolve/TecSol**: Se não encontradas, define como false

### **Regras de Negócio**
- Apenas materiais com nome são processados
- Linhas vazias são automaticamente ignoradas
- Valores de classe são normalizados para os valores aceitos

## 📱 Interface do Usuário

### **Seção de Upload**
- Informações claras sobre o formato esperado
- Área de drag & drop para arquivos
- Feedback visual durante o processamento

### **Cabeçalhos Detectados**
- Visualização clara dos cabeçalhos encontrados
- Mapeamento de colunas (ex: Material → A)
- Confirmação visual da detecção

### **Preview dos Dados**
- Tabela editável com todos os itens extraídos
- Possibilidade de editar qualquer campo
- Validação em tempo real

## 🆘 Solução de Problemas

### **Erro: "Cabeçalhos obrigatórios não encontrados"**
**Causa**: A planilha não contém os cabeçalhos esperados
**Solução**: 
- Verifique se os cabeçalhos estão escritos exatamente como esperado
- Confirme se não há espaços extras ou caracteres especiais
- Verifique se os cabeçalhos estão nas primeiras 20 linhas

### **Erro: "Nenhum item de material encontrado"**
**Causa**: Não há dados válidos após o cabeçalho
**Solução**:
- Verifique se há dados nas linhas após o cabeçalho
- Confirme se as células de material não estão vazias
- Verifique se não há linhas em branco entre o cabeçalho e os dados

### **Cabeçalhos Detectados Incorretamente**
**Causa**: Palavras similares aos cabeçalhos esperados
**Solução**:
- Use nomes específicos para os cabeçalhos
- Evite usar palavras como "Material" em outros contextos
- Verifique se não há duplicação de cabeçalhos

## 💡 Dicas de Uso

### **Para Melhor Detecção**
1. **Use nomes claros**: "Material", "Quantidade", "Classe"
2. **Evite abreviações**: Use "Quantidade" em vez de "Qtd"
3. **Mantenha consistência**: Use o mesmo formato em todas as planilhas
4. **Verifique ortografia**: Evite erros de digitação nos cabeçalhos

### **Estrutura Recomendada**
```
Linha 1-2: Informações do cliente (opcional)
Linha 3: Cabeçalhos das colunas
Linha 4+: Dados dos materiais
```

## 🔄 Compatibilidade

### **Formatos Suportados**
- ✅ Excel (.xlsx)
- ✅ Excel (.xls)
- ✅ Planilhas do Google Sheets (exportadas como .xlsx)

### **Versões do Excel**
- ✅ Excel 2007+
- ✅ Excel Online
- ✅ LibreOffice Calc
- ✅ Numbers (Mac)

## 📈 Benefícios

1. **Facilidade de Uso**: Não precisa especificar células manualmente
2. **Flexibilidade**: Funciona com qualquer estrutura de planilha
3. **Redução de Erros**: Validação automática de dados
4. **Economia de Tempo**: Processamento instantâneo
5. **Padronização**: Formato consistente para todas as importações

## 🎉 Conclusão

A detecção automática de cabeçalhos torna o sistema muito mais flexível e fácil de usar. Agora você pode importar planilhas de qualquer formato, desde que contenham os cabeçalhos esperados, e o sistema fará todo o trabalho de mapeamento automaticamente!
