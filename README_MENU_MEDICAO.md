# 📊 Menu de Medição - Sistema Tecsol

## 🎯 **Funcionalidade Implementada**

O sistema Tecsol agora possui um novo menu chamado **"Medição"** que permite gerar relatórios detalhados de clientes com cálculos automáticos de valores baseados em critérios específicos.

## 🚀 **Como Acessar**

1. **Login no sistema** com usuário autenticado
2. **Menu lateral**: Clique no ícone 📊 "Medição"
3. **Permissões**: Disponível para Administradores, Administrativos e Instaladores

## 📋 **Colunas do Relatório**

| Coluna | Descrição | Fonte |
|--------|-----------|-------|
| **CLIENTE** | Nome do cliente | `clientes.nome_cliente` |
| **DATA** | Data de cadastro | `clientes.data_cadastro` |
| **TIPO DE SERVIÇO** | Tipo de serviço contratado | `tipos_servico.nome` |
| **QTD MÓDULOS** | Quantidade de módulos | `clientes.quantidade_modulos` |
| **PADRÃO** | Tipo de padrão de instalação | `tipos_padrao.nome` |
| **CONFIG. INVERSOR** | Configuração de inversor realizada | `clientes.configuracao_inversor` |
| **DESLOCAMENTO** | Deslocamento para buscar material | `clientes.deslocamento_buscar_material` |
| **NOTA MATERIAL** | Nota de material emitida | `clientes.nota_material` |
| **OBRA CIVIL** | Obra civil realizada | `clientes.obra_civil` |
| **EQUIPE** | Equipe responsável | `equipes.nome` |
| **TOTAL** | Valor total calculado | **Cálculo automático** |
| **OBSERVAÇÃO** | Observações do cliente | `clientes.observacoes` |

## 🧮 **Fórmula de Cálculo do TOTAL**

```
TOTAL = (90 × QTD MÓDULOS) + PADRÃO + CONFIGURAÇÃO INVERSOR + DESLOCAMENTO + NOTA MATERIAL + OBRA CIVIL
```

### **Valores dos Padrões**

| Padrão | Valor |
|--------|-------|
| **Fachada** | R$ 200,00 |
| **Poste Auxiliar** | R$ 300,00 |
| **Saga** | R$ 400,00 |
| **Fachada com Ancoragem** | R$ 200,00 |
| **Não Instalado** | R$ 0,00 |

### **Valores dos Serviços**

| Serviço | Valor |
|---------|-------|
| **Configuração de Inversor** | R$ 100,00 |
| **Deslocamento para Buscar Material** | R$ 50,00 |
| **Nota de Material** | R$ 0,00 |
| **Obra Civil** | R$ 0,00 |

## ⚙️ **Funcionalidades**

### **1. Seleção de Período**
- **Período padrão**: Últimos 30 dias
- **Seleção personalizada**: Escolha data início e fim
- **Botão "Buscar"**: Atualiza dados automaticamente

### **2. Resumo Estatístico**
- **Total de Clientes**: Quantidade de clientes no período
- **Valor Total**: Soma de todos os totais calculados
- **Módulos Totais**: Soma de todos os módulos

### **3. Exportação**
- **Formato**: CSV (compatível com Excel)
- **Nome do arquivo**: `medicao_tecsol_INICIO_FIM.csv`
- **Permissão**: Apenas Administradores e Administrativos

## 🔒 **Controle de Acesso**

| Função | Administrador | Administrativo | Instalador |
|--------|---------------|----------------|------------|
| **Visualizar Medição** | ✅ | ✅ | ✅ |
| **Exportar Relatório** | ✅ | ✅ | ❌ |
| **Acessar Menu** | ✅ | ✅ | ✅ |

## 📱 **Responsividade**

- **Desktop**: Layout completo com todas as colunas
- **Tablet**: Layout adaptado para telas médias
- **Mobile**: Layout otimizado para dispositivos móveis

## 🎨 **Interface Visual**

### **Cores e Estilos**
- **Gradientes**: Azul para roxo (#667eea → #764ba2)
- **Cards de resumo**: Design moderno com hover effects
- **Tabela**: Cabeçalho escuro, linhas alternadas
- **Valores totais**: Destaque em verde com badge

### **Elementos Interativos**
- **Hover na tabela**: Linhas destacadas
- **Observações**: Expandem ao passar o mouse
- **Botões**: Efeitos de transição suaves

## 🔧 **Implementação Técnica**

### **Arquivos Modificados**
- `src/config/security.js` - Permissões e funções de segurança
- `src/components/Welcome.js` - Lógica e interface
- `src/components/Welcome.css` - Estilos responsivos

### **Novas Funções**
- `loadMedicao()` - Carrega dados do período
- `getValorPadrao()` - Calcula valor do padrão
- `exportarMedicaoExcel()` - Exporta para CSV
- `renderMedicao()` - Renderiza a interface

### **Estados Adicionados**
- `medicaoData` - Dados processados
- `medicaoLoading` - Status de carregamento
- `medicaoPeriodo` - Período selecionado

## 📊 **Exemplo de Uso**

1. **Acesse o menu "Medição"**
2. **Selecione o período desejado**
3. **Clique em "Buscar"**
4. **Visualize o resumo estatístico**
5. **Analise a tabela detalhada**
6. **Exporte o relatório (se autorizado)**

## 🚀 **Benefícios**

- **Automação**: Cálculos automáticos sem erros manuais
- **Flexibilidade**: Períodos personalizáveis
- **Relatórios**: Exportação para análise externa
- **Controle**: Acesso baseado em permissões
- **Responsivo**: Funciona em todos os dispositivos

## 🔮 **Futuras Melhorias**

- **Filtros adicionais**: Por equipe, tipo de serviço, status
- **Gráficos**: Visualizações estatísticas
- **Comparativos**: Períodos vs períodos anteriores
- **Notificações**: Alertas de valores altos
- **Integração**: APIs para sistemas externos

---

**Desenvolvido para o Sistema Tecsol** 🏢  
*Sistema de Gerenciamento Completo*
