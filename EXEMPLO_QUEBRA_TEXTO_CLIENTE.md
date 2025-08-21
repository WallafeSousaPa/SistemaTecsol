# 📄 Sistema de Quebra de Texto para Nome do Cliente

## 🎯 Problema Resolvido
O nome do cliente estava sendo cortado no PDF quando era muito extenso, prejudicando a legibilidade do documento.

## ✅ Solução Implementada

### 1. Quebra Automática de Texto
- **Função:** `wrapText(text, maxWidth)`
- **Limite:** 25 caracteres por linha
- **Comportamento:** Quebra automaticamente em múltiplas linhas

### 2. Posicionamento Dinâmico
- **Data:** Posicionada automaticamente após o nome do cliente
- **Linha separadora:** Ajustada baseada no tamanho do cabeçalho
- **Tabela:** Posicionada dinamicamente para acomodar textos longos

## 🔧 Como Funciona

### Antes (Problema)
```
Cliente: João da Silva Pereira Souza Neto Ltda - Empresa de Soluções... [CORTADO]
Data: 15/12/2024
```

### Depois (Solução)
```
Cliente: João da Silva Pereira
Souza Neto Ltda - Empresa
de Soluções Tecnológicas
Data: 15/12/2024
```

## 📐 Detalhes Técnicos

### Função wrapText
```javascript
const wrapText = (text, maxWidth) => {
  const words = text.split(' ')
  const lines = []
  let currentLine = ''
  
  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word
    if (testLine.length <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  })
  if (currentLine) lines.push(currentLine)
  
  return lines
}
```

### Aplicação no Cliente
```javascript
// Cliente com quebra de linha automática (máximo 25 caracteres por linha)
const clienteLines = wrapText(pdfContent.cliente, 25)
clienteLines.forEach((line, lineIndex) => {
  doc.text(`${lineIndex === 0 ? 'Cliente: ' : ''}${line}`, 120, 35 + (lineIndex * 5))
})

// Ajustar posição da data baseado no número de linhas do cliente
const dataPosition = 35 + (clienteLines.length * 5) + 5
doc.text(`Data: ${pdfContent.data}`, 120, dataPosition)
```

### Ajuste Dinâmico do Layout
```javascript
// Calcular posição da linha separadora baseado no tamanho do cabeçalho
const separatorPosition = Math.max(60, dataPosition + 10)

// Cabeçalho da tabela
const tableHeaderPosition = separatorPosition + 10

// Itens
let yPosition = tableHeaderPosition + 15
```

## 📱 Exemplos de Formatação

| Tamanho do Nome | Resultado |
|-----------------|-----------|
| "João Silva" | Uma linha |
| "João da Silva Pereira" | Uma linha |
| "João da Silva Pereira Souza" | Duas linhas |
| "João da Silva Pereira Souza Neto Ltda" | Três linhas |
| "Empresa de Soluções Tecnológicas João da Silva Pereira Souza Neto Ltda ME" | Quatro+ linhas |

## 🎨 Layout Adaptativo

### Cliente com Nome Curto
```
R DE S BARROS JUNIOR LTDA          ORÇAMENTO TECSOL
CNPJ: 44.376.302/0001-34          Cliente: João Silva
PSG DONA ANA - BLOCO 4, APT 202   Data: 15/12/2024
Ananindeua - PA
Tel: (91) 98211-3496
E-mail: tecsol.ananindeua@gmail.com

─────────────────────────────────────────────────────────────────
```

### Cliente com Nome Longo
```
R DE S BARROS JUNIOR LTDA          ORÇAMENTO TECSOL
CNPJ: 44.376.302/0001-34          Cliente: João da Silva
PSG DONA ANA - BLOCO 4, APT 202   Pereira Souza Neto Ltda
Ananindeua - PA                    Empresa de Soluções
Tel: (91) 98211-3496               Data: 15/12/2024
E-mail: tecsol.ananindeua@gmail.com

─────────────────────────────────────────────────────────────────
```

## ✨ Benefícios

1. **Legibilidade Total:** Nenhum nome de cliente é cortado
2. **Layout Adaptativo:** Ajusta automaticamente o espaçamento
3. **Profissionalismo:** Mantém a aparência limpa e organizada
4. **Consistência:** Usa a mesma lógica dos materiais
5. **Flexibilidade:** Funciona com qualquer tamanho de nome

## 🚀 Status

✅ **IMPLEMENTADO COM SUCESSO**

- [x] Função de quebra de texto implementada
- [x] Posicionamento dinâmico da data
- [x] Ajuste automático da linha separadora
- [x] Posicionamento dinâmico da tabela
- [x] Teste de compilação aprovado
- [x] Layout adaptativo funcionando

---

**Desenvolvido por:** Sistema TecSol  
**Data:** Dezembro 2024  
**Arquivo modificado:** `src/components/ListaMaterial.js`
