import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import './ListaMaterial.css'

const ListaMaterial = ({ onBack, userRole }) => {
  const [clientes, setClientes] = useState([])
  const [selectedCliente, setSelectedCliente] = useState('')
  const [materialData, setMaterialData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState([])
  const [headerMapping, setHeaderMapping] = useState({})
  const [detectedHeaders, setDetectedHeaders] = useState([])
  const [fileInputRef] = useState(useRef(null))

  // Estados para gerenciar listas existentes
  const [listasExistentes, setListasExistentes] = useState([])
  const [selectedLista, setSelectedLista] = useState('')
  const [showExistingListas, setShowExistingListas] = useState(false)

  // Carregar clientes ao montar o componente
  useEffect(() => {
    fetchClientes()
    fetchListasExistentes()
  }, [])

  const fetchClientes = async () => {
    try {
      setIsLoading(true)
      setMessage('Carregando clientes...')
      setMessageType('info')
      
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome_cliente')
        .order('nome_cliente')

      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        setMessage('Nenhum cliente encontrado.')
        setMessageType('warning')
        setClientes([])
      } else {
        setMessage(`${data.length} clientes carregados com sucesso!`)
        setMessageType('success')
        setClientes(data)
      }
      
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      setMessage(`Erro ao carregar clientes: ${error.message}`)
      setMessageType('error')
      setClientes([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchListasExistentes = async () => {
    try {
      const { data, error } = await supabase
        .from('lista_material')
        .select(`
          id,
          data_criacao,
          observacoes,
          total_resolve,
          total_tecsol,
          clientes!inner(nome_cliente)
        `)
        .order('data_criacao', { ascending: false })

      if (error) {
        console.error('Erro ao carregar listas existentes:', error)
        return
      }

      setListasExistentes(data || [])
    } catch (error) {
      console.error('Erro ao carregar listas existentes:', error)
    }
  }

    // Função para buscar valor histórico do material
  const buscarValorHistorico = async (nomeMaterial) => {
    try {
      // Normalizar o nome do material para busca
      const nomeNormalizado = nomeMaterial.trim().toLowerCase()
      
      // Busca exata primeiro
      let { data, error } = await supabase
        .from('itens_material')
        .select('valor_unitario, material, lista_material_id')
        .eq('material', nomeMaterial)
        .not('valor_unitario', 'eq', 0)
        .order('lista_material_id', { ascending: false })
        .limit(1)
      
      if (error) throw error
      
      // Se não encontrou, tentar busca case-insensitive
      if (!data || data.length === 0) {
        const { data: dataCaseInsensitive, error: errorCaseInsensitive } = await supabase
          .from('itens_material')
          .select('valor_unitario, material, lista_material_id')
          .ilike('material', nomeMaterial)
          .not('valor_unitario', 'eq', 0)
          .order('lista_material_id', { ascending: false })
          .limit(1)
        
        if (errorCaseInsensitive) throw errorCaseInsensitive
        
        if (dataCaseInsensitive && dataCaseInsensitive.length > 0) {
          return dataCaseInsensitive[0].valor_unitario
        }
      } else {
        return data[0].valor_unitario
      }
      
      // Se ainda não encontrou, tentar busca por similaridade
      if (!data || data.length === 0) {
        const { data: dataSimilar, error: errorSimilar } = await supabase
          .from('itens_material')
          .select('valor_unitario, material, lista_material_id')
          .or(`material.ilike.%${nomeNormalizado}%,material.ilike.${nomeNormalizado}%,material.ilike.%${nomeNormalizado}`)
          .not('valor_unitario', 'eq', 0)
          .order('lista_material_id', { ascending: false })
          .limit(1)
        
        if (errorSimilar) throw errorSimilar
        
        if (dataSimilar && dataSimilar.length > 0) {
          return dataSimilar[0].valor_unitario
        }
      }
      
      return 0
      
    } catch (error) {
      console.error('Erro ao buscar valor histórico:', error)
      return 0
    }
  }

  // Função para detectar automaticamente o cabeçalho
  const detectHeaders = (worksheet) => {
    const headers = {}
    const detected = []
    
    // Procurar por cabeçalhos em todas as linhas (até linha 20)
    for (let row = 1; row <= 20; row++) {
      const rowData = []
      for (let col = 1; col <= 10; col++) {
        const cell = worksheet[`${String.fromCharCode(64 + col)}${row}`]
        if (cell && cell.v) {
          rowData.push({
            col: col,
            value: cell.v.toString().toLowerCase().trim()
          })
        }
      }
      
      // Verificar se esta linha contém os cabeçalhos esperados
      const expectedHeaders = ['material', 'quantidade', 'classe', 'resolve', 'tecsol', 'valor']
      let matchCount = 0
      const tempMapping = {}
      
      rowData.forEach(({ col, value }) => {
        if (expectedHeaders.includes(value)) {
          tempMapping[value] = col
          matchCount++
        }
      })
      
      // Se encontrou pelo menos 3 cabeçalhos, considera válido
      if (matchCount >= 3) {
        headers.material = tempMapping.material || null
        headers.quantidade = tempMapping.quantidade || null
        headers.classe = tempMapping.classe || null
        headers.resolve = tempMapping.resolve || null
        headers.tecsol = tempMapping.tecsol || null
        headers.valor = tempMapping.valor || null
        headers.startRow = row + 1 // Próxima linha após o cabeçalho
        
        // Adicionar cabeçalhos detectados
        Object.keys(tempMapping).forEach(key => {
          if (tempMapping[key]) {
            detected.push({
              nome: key,
              coluna: String.fromCharCode(64 + tempMapping[key]),
              colIndex: tempMapping[key]
            })
          }
        })
        
        break
      }
    }
    
    return { headers, detected }
  }

  // Função para processar arquivo Excel
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      setIsLoading(true)
      setMessage('Processando arquivo...')
      setMessageType('info')

      // Importar a biblioteca XLSX dinamicamente
      const XLSX = await import('xlsx')
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]

          // Detectar cabeçalhos automaticamente
          const { headers, detected } = detectHeaders(worksheet)
          
          if (!headers.material || !headers.quantidade || !headers.classe) {
            throw new Error('Cabeçalhos obrigatórios não encontrados. Certifique-se de que a planilha contém as colunas: Material, Quantidade e Classe.')
          }

          setHeaderMapping(headers)
          setDetectedHeaders(detected)

          // Extrair dados das linhas após o cabeçalho
          const extractedData = []
          const maxRow = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']).e.r : 1000

          for (let row = headers.startRow; row <= maxRow; row++) {
            const materialCell = worksheet[`${String.fromCharCode(64 + headers.material)}${row}`]
            const quantidadeCell = worksheet[`${String.fromCharCode(64 + headers.quantidade)}${row}`]
            const classeCell = worksheet[`${String.fromCharCode(64 + headers.classe)}${row}`]
            
            // Parar se não houver material (linha vazia)
            if (!materialCell || !materialCell.v) break

            const item = {
              material: materialCell.v.toString().trim(),
              quantidade: parseInt(quantidadeCell?.v) || 1,
              classe: (classeCell?.v?.toString() || 'Nenhum').trim(),
              valor_unitario: 0,
              resolve_forneceu: false,
              tecsol_forneceu: false
            }

            // Verificar colunas opcionais
            if (headers.valor) {
              const valorCell = worksheet[`${String.fromCharCode(64 + headers.valor)}${row}`]
              if (valorCell && valorCell.v) {
                item.valor_unitario = parseFloat(valorCell.v) || 0
              }
            }
            
            // Se não há valor na planilha, buscar valor histórico
            if (!item.valor_unitario || item.valor_unitario === 0) {
              const valorHistorico = await buscarValorHistorico(item.material)
              
              if (valorHistorico > 0) {
                item.valor_unitario = valorHistorico
                item.valor_historico_carregado = true // Marcar que foi carregado do histórico
              }
            }

            if (headers.resolve) {
              const resolveCell = worksheet[`${String.fromCharCode(64 + headers.resolve)}${row}`]
              if (resolveCell) {
                item.resolve_forneceu = Boolean(resolveCell.v)
              }
            }

            if (headers.tecsol) {
              const tecsolCell = worksheet[`${String.fromCharCode(64 + headers.tecsol)}${row}`]
              if (tecsolCell) {
                item.tecsol_forneceu = Boolean(tecsolCell.v)
              }
            }

            // Validações
            if (!item.material) continue
            if (item.quantidade <= 0) item.quantidade = 1
            if (!['Kit', 'Padrão', 'Nenhum'].includes(item.classe)) {
              item.classe = 'Nenhum'
            }

            extractedData.push(item)
          }

          if (extractedData.length === 0) {
            throw new Error('Nenhum item de material encontrado na planilha.')
          }

          // Contar quantos itens tiveram valores históricos carregados
          const itensComValorHistorico = extractedData.filter(item => item.valor_unitario > 0).length
          
          setMaterialData(extractedData)
          setPreviewData(extractedData)
          setShowPreview(true)
          
          let mensagem = `Processado com sucesso! ${extractedData.length} itens encontrados.`
          if (itensComValorHistorico > 0) {
            mensagem += ` ${itensComValorHistorico} itens tiveram valores históricos carregados automaticamente.`
          }
          
          setMessage(mensagem)
          setMessageType('success')

        } catch (error) {
          console.error('Erro ao processar planilha:', error)
          setMessage(`Erro ao processar planilha: ${error.message}`)
          setMessageType('error')
        }
      }

      reader.readAsArrayBuffer(file)

    } catch (error) {
      console.error('Erro ao processar arquivo:', error)
      setMessage(`Erro ao processar arquivo: ${error.message}`)
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  // Função para calcular totais
  const calculateTotals = () => {
    let totalResolve = 0
    let totalTecSol = 0

    materialData.forEach(item => {
      const valorTotal = item.valor_unitario * item.quantidade
      
      if (item.resolve_forneceu) {
        totalResolve += valorTotal
      }
      
      if (item.tecsol_forneceu) {
        totalTecSol += valorTotal
      }
    })

    return { totalResolve, totalTecSol }
  }

  // Função para salvar lista de material
  const handleSaveLista = async () => {
    if (!selectedCliente || materialData.length === 0) {
      setMessage('Selecione um cliente e adicione itens de material')
      setMessageType('error')
      return
    }

    try {
      setIsLoading(true)
      setMessage('Salvando lista de material...')
      setMessageType('info')

      // Calcular totais antes de salvar
      const { totalResolve, totalTecSol } = calculateTotals()

      // Criar lista de material
      const { data: listaData, error: listaError } = await supabase
        .from('lista_material')
        .insert({
          cliente_id: selectedCliente,
          observacoes: `Importado de planilha - ${new Date().toLocaleDateString('pt-BR')}`,
          total_resolve: totalResolve,
          total_tecsol: totalTecSol
        })
        .select()
        .single()

      if (listaError) throw listaError

      // Inserir itens de material
      const itensToInsert = materialData.map(item => ({
        lista_material_id: listaData.id,
        material: item.material,
        quantidade: item.quantidade,
        classe: item.classe,
        valor_unitario: item.valor_unitario,
        resolve_forneceu: item.resolve_forneceu,
        tecsol_forneceu: item.tecsol_forneceu
      }))

      const { error: itensError } = await supabase
        .from('itens_material')
        .insert(itensToInsert)

      if (itensError) throw itensError

      setMessage('Lista de material salva com sucesso!')
      setMessageType('success')
      setMaterialData([])
      setSelectedCliente('')
      setShowPreview(false)
      fetchListasExistentes()

      // Limpar arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      console.error('Erro ao salvar lista:', error)
      setMessage(`Erro ao salvar: ${error.message}`)
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  // Função para carregar lista existente
  const handleLoadLista = async (listaId) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('itens_material')
        .select('*')
        .eq('lista_material_id', listaId)

      if (error) throw error

      setMaterialData(data || [])
      setPreviewData(data || [])
      setShowPreview(true)
      setMessage('Lista carregada com sucesso!')
      setMessageType('success')

    } catch (error) {
      console.error('Erro ao carregar lista:', error)
      setMessage(`Erro ao carregar lista: ${error.message}`)
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  // Função para excluir lista de material
  const handleDeleteLista = async (listaId, nomeCliente) => {
    // Confirmação de segurança
    const confirmacao = window.confirm(
      `⚠️ ATENÇÃO: Esta ação não pode ser desfeita!\n\n` +
      `Tem certeza que deseja EXCLUIR a lista de material do cliente:\n` +
      `"${nomeCliente}"?\n\n` +
      `✅ Digite "EXCLUIR" para confirmar:`
    )

    if (!confirmacao) return

    const confirmacaoTexto = window.prompt(
      `Digite "EXCLUIR" para confirmar a exclusão:`
    )

    if (confirmacaoTexto !== 'EXCLUIR') {
      setMessage('Exclusão cancelada pelo usuário.')
      setMessageType('warning')
      return
    }

    try {
      setIsLoading(true)
      setMessage('Excluindo lista de material...')
      setMessageType('info')

      // Primeiro excluir os itens da lista
      const { error: itensError } = await supabase
        .from('itens_material')
        .delete()
        .eq('lista_material_id', listaId)

      if (itensError) throw itensError

      // Depois excluir a lista principal
      const { error: listaError } = await supabase
        .from('lista_material')
        .delete()
        .eq('id', listaId)

      if (listaError) throw listaError

      setMessage('Lista de material excluída com sucesso!')
      setMessageType('success')
      
      // Recarregar listas existentes
      fetchListasExistentes()
      
      // Se a lista excluída estava carregada, limpar a interface
      if (materialData.length > 0 && materialData[0]?.lista_material_id === listaId) {
        setMaterialData([])
        setPreviewData([])
        setShowPreview(false)
        setSelectedCliente('')
      }

    } catch (error) {
      console.error('Erro ao excluir lista:', error)
      setMessage(`Erro ao excluir lista: ${error.message}`)
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  // Função para editar item
  const handleEditItem = (index, field, value) => {
    const newData = [...materialData]
    newData[index][field] = value
    setMaterialData(newData)
    setPreviewData(newData)
  }

  // Função para remover item
  const handleRemoveItem = (index) => {
    const newData = materialData.filter((_, i) => i !== index)
    setMaterialData(newData)
    setPreviewData(newData)
  }

  // Função para adicionar item manualmente
  const handleAddItem = () => {
    const newItem = {
      material: '',
      quantidade: 1,
      classe: 'Nenhum',
      valor_unitario: 0,
      resolve_forneceu: false,
      tecsol_forneceu: false
    }
    setMaterialData([...materialData, newItem])
    setPreviewData([...previewData, newItem])
  }

  // Função para recarregar clientes
  const handleReloadClientes = () => {
    fetchClientes()
  }

  // Função para exportar PDF (apenas materiais TecSol)
  const handleExportPDF = async (listaId, nomeCliente) => {
    try {
      setIsLoading(true)
      setMessage('Gerando PDF...')
      setMessageType('info')

      // Buscar itens da lista
      const { data: itens, error: itensError } = await supabase
        .from('itens_material')
        .select('*')
        .eq('lista_material_id', listaId)

      if (itensError) throw itensError

      // Filtrar apenas materiais fornecidos pela TecSol
      const materiaisTecSol = itens.filter(item => item.tecsol_forneceu)
      
      if (materiaisTecSol.length === 0) {
        setMessage('Nenhum material TecSol encontrado para exportar.')
        setMessageType('warning')
        return
      }

      // Calcular total TecSol
      const totalTecSol = materiaisTecSol.reduce((total, item) => {
        return total + (item.valor_unitario * item.quantidade)
      }, 0)

      // Criar conteúdo do PDF
      const pdfContent = {
        cliente: nomeCliente,
        data: new Date().toLocaleDateString('pt-BR'),
        itens: materiaisTecSol,
        total: totalTecSol
      }

      // Gerar PDF usando jsPDF
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      // Configurar fonte para caracteres especiais
      doc.setFont('helvetica')

      // Título
      doc.setFontSize(20)
      doc.text('ORÇAMENTO TECSOL', 105, 20, { align: 'center' })

      // Informações do cliente
      doc.setFontSize(12)
      doc.text(`Cliente: ${pdfContent.cliente}`, 20, 40)
      doc.text(`Data: ${pdfContent.data}`, 20, 50)

      // Cabeçalho da tabela
      doc.setFontSize(10)
      doc.text('Material', 20, 70)
      doc.text('Qtd.', 110, 70)
      doc.text('Valor Unit.', 130, 70)
      doc.text('Valor Total', 160, 70)

      // Linha separadora
      doc.line(20, 75, 190, 75)

      // Itens
      let yPosition = 85
      pdfContent.itens.forEach((item, index) => {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }

        // Função para quebrar texto em múltiplas linhas
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

        // Material com quebra de linha automática (máximo 25 caracteres por linha)
        const materialLines = wrapText(item.material, 25)
        materialLines.forEach((line, lineIndex) => {
          doc.text(line, 20, yPosition + (lineIndex * 4))
        })
        
        // Quantidade (posicionada mais à direita, alinhada com o cabeçalho)
        doc.text(item.quantidade.toString(), 110, yPosition)
        
        // Valor Unitário
        doc.text(`R$ ${item.valor_unitario.toFixed(2)}`, 130, yPosition)
        
        // Valor Total
        doc.text(`R$ ${(item.valor_unitario * item.quantidade).toFixed(2)}`, 160, yPosition)

        // Ajustar posição Y baseado no número de linhas do material
        yPosition += Math.max(10, materialLines.length * 4 + 2)
      })

      // Linha separadora antes do total
      doc.line(20, yPosition + 5, 190, yPosition + 5)

      // Total
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`TOTAL: R$ ${pdfContent.total.toFixed(2)}`, 140, yPosition + 15)

      // Salvar PDF
      const fileName = `orcamento_tecsol_${nomeCliente.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)

      setMessage(`PDF exportado com sucesso! ${materiaisTecSol.length} itens TecSol incluídos.`)
      setMessageType('success')

    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
      setMessage(`Erro ao exportar PDF: ${error.message}`)
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular totais para exibição
  const { totalResolve, totalTecSol } = calculateTotals()

  return (
    <div className="lista-material-container">
      <div className="lista-material-header">
        <h2>📋 Sistema de Lista de Material</h2>
        <button className="back-button" onClick={onBack}>
          ← Voltar
        </button>
      </div>

      {/* Mensagens */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Seleção de Cliente */}
      <div className="form-section">
        <h3>👤 Selecionar Cliente</h3>
        <div className="cliente-controls">
          <select
            value={selectedCliente}
            onChange={(e) => setSelectedCliente(e.target.value)}
            className="form-select"
            disabled={isLoading}
          >
            <option value="">Selecione um cliente...</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome_cliente}
              </option>
            ))}
          </select>
          
          <button
            className="reload-button"
            onClick={handleReloadClientes}
            disabled={isLoading}
            title="Recarregar clientes"
          >
            🔄
          </button>
        </div>
        
        {clientes.length === 0 && !isLoading && (
          <div className="no-clients-message">
            <p>Nenhum cliente encontrado. Verifique:</p>
            <ul>
              <li>Se você está logado corretamente</li>
              <li>Se você tem permissão para ver clientes</li>
              <li>Se existem clientes cadastrados no sistema</li>
              <li>Se as políticas RLS estão configuradas corretamente</li>
            </ul>
            <button
              className="retry-button"
              onClick={handleReloadClientes}
              disabled={isLoading}
            >
              🔄 Tentar Novamente
            </button>
          </div>
        )}
      </div>

      {/* Upload de Arquivo */}
      <div className="form-section">
        <h3>📁 Importar Planilha Excel</h3>
        <div className="upload-info">
          <p><strong>Formato esperado:</strong></p>
          <ul>
            <li>A planilha deve conter as colunas: <strong>Material</strong>, <strong>Quantidade</strong>, <strong>Classe</strong></li>
            <li>Colunas opcionais: <strong>Valor</strong>, <strong>Resolve</strong>, <strong>TecSol</strong></li>
            <li>O sistema detecta automaticamente o cabeçalho e mapeia as colunas</li>
            <li>Valores válidos para Classe: <strong>Kit</strong>, <strong>Padrão</strong>, <strong>Nenhum</strong></li>
            <li>Coluna <strong>Valor</strong> deve conter o valor unitário de cada item</li>
          </ul>
        </div>
        
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          ref={fileInputRef}
          className="file-input"
          disabled={isLoading}
        />
      </div>

      {/* Cabeçalhos Detectados */}
      {detectedHeaders.length > 0 && (
        <div className="form-section">
          <h3>🔍 Cabeçalhos Detectados</h3>
          <div className="headers-detected">
            {detectedHeaders.map((header, index) => (
              <div key={index} className="header-item">
                <span className="header-name">{header.nome}</span>
                <span className="header-column">{header.coluna}</span>
              </div>
            ))}
          </div>
        </div>
      )}

             {/* Adicionar Item Manualmente */}
       <div className="form-section">
         <h3>✏️ Adicionar Item Manualmente</h3>
         <div className="manual-controls">
           <button 
             className="add-button"
             onClick={handleAddItem}
             disabled={isLoading}
           >
             + Adicionar Item
           </button>
           
                       <button 
              className="test-button"
              onClick={async () => {
                const materiais = ['Inversor', 'Módulo', 'Cabo'] // Exemplos
                for (const material of materiais) {
                  const valor = await buscarValorHistorico(material)
                  // Teste silencioso - sem logs
                }
              }}
              disabled={isLoading}
              title="Testar busca de valores históricos"
            >
              🧪 Testar Valores Históricos
            </button>
         </div>
       </div>

      {/* Preview dos Dados */}
      {showPreview && (
        <div className="form-section">
          <h3>👁️ Preview dos Dados</h3>
          
          {/* Resumo dos Totais */}
          <div className="totals-summary">
            <h4>💰 Resumo dos Valores</h4>
            <div className="totals-grid">
              <div className="total-item resolve">
                <span className="total-label">Total Resolve:</span>
                <span className="total-value">R$ {totalResolve.toFixed(2)}</span>
              </div>
              <div className="total-item tecsol">
                <span className="total-label">Total TecSol:</span>
                <span className="total-value">R$ {totalTecSol.toFixed(2)}</span>
              </div>
              <div className="total-item total-geral">
                <span className="total-label">Total Geral:</span>
                <span className="total-value">R$ {(totalResolve + totalTecSol).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="preview-table-container">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Quantidade</th>
                  <th>Classe</th>
                  <th>Valor Unit.</th>
                  <th>Valor Total</th>
                  <th>Resolve</th>
                  <th>TecSol</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={item.material}
                        onChange={(e) => handleEditItem(index, 'material', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => handleEditItem(index, 'quantidade', parseInt(e.target.value) || 1)}
                        className="table-input"
                        min="1"
                      />
                    </td>
                    <td>
                      <select
                        value={item.classe}
                        onChange={(e) => handleEditItem(index, 'classe', e.target.value)}
                        className="table-select"
                      >
                        <option value="Kit">Kit</option>
                        <option value="Padrão">Padrão</option>
                        <option value="Nenhum">Nenhum</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.valor_unitario}
                        onChange={(e) => handleEditItem(index, 'valor_unitario', parseFloat(e.target.value) || 0)}
                        className={`table-input ${item.valor_historico_carregado ? 'valor-historico' : ''}`}
                        min="0"
                        step="0.01"
                        title={item.valor_historico_carregado ? 'Valor carregado do histórico' : 'Valor da planilha'}
                      />
                      {item.valor_historico_carregado && (
                        <span className="historico-indicator" title="Valor carregado do histórico">
                          📚
                        </span>
                      )}
                    </td>
                    <td className="valor-total">
                      R$ {(item.valor_unitario * item.quantidade).toFixed(2)}
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={item.resolve_forneceu}
                        onChange={(e) => handleEditItem(index, 'resolve_forneceu', e.target.checked)}
                        className="table-checkbox"
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={item.tecsol_forneceu}
                        onChange={(e) => handleEditItem(index, 'tecsol_forneceu', e.target.checked)}
                        className="table-checkbox"
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="remove-button"
                        disabled={isLoading}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      {showPreview && (
        <div className="form-section">
          <div className="action-buttons">
            <button
              className="save-button"
              onClick={handleSaveLista}
              disabled={isLoading || !selectedCliente || materialData.length === 0}
            >
              {isLoading ? 'Salvando...' : '💾 Salvar Lista de Material'}
            </button>
            
            <button
              className="clear-button"
              onClick={() => {
                setMaterialData([])
                setPreviewData([])
                setShowPreview(false)
                setDetectedHeaders([])
                setHeaderMapping({})
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              disabled={isLoading}
            >
              🗑️ Limpar Dados
            </button>
          </div>
        </div>
      )}

      {/* Listas Existentes */}
      <div className="form-section">
        <h3>📚 Listas Existentes</h3>
        <button
          className="toggle-button"
          onClick={() => setShowExistingListas(!showExistingListas)}
        >
          {showExistingListas ? '🔽 Ocultar' : '🔼 Mostrar'} Listas Existentes
        </button>
        
        {showExistingListas && (
          <div className="existing-listas">
            {listasExistentes.length === 0 ? (
              <p>Nenhuma lista encontrada.</p>
            ) : (
              listasExistentes.map(lista => (
                <div key={lista.id} className="lista-item">
                  <div className="lista-info">
                    <strong>Cliente:</strong> {lista.clientes?.nome_cliente}
                    <br />
                    <strong>Data:</strong> {new Date(lista.data_criacao).toLocaleDateString('pt-BR')}
                    {lista.observacoes && (
                      <>
                        <br />
                        <strong>Observações:</strong> {lista.observacoes}
                      </>
                    )}
                    {lista.total_resolve !== null && (
                      <>
                        <br />
                        <strong>Total Resolve:</strong> R$ {lista.total_resolve?.toFixed(2) || '0.00'}
                      </>
                    )}
                    {lista.total_tecsol !== null && (
                      <>
                        <br />
                        <strong>Total TecSol:</strong> R$ {lista.total_tecsol?.toFixed(2) || '0.00'}
                      </>
                    )}
                  </div>
                                     <div className="lista-actions">
                     <button
                       className="load-button"
                       onClick={() => handleLoadLista(lista.id)}
                       disabled={isLoading}
                       title="Carregar Lista"
                     >
                       📥 Carregar
                     </button>
                     
                     <button
                       className="export-button"
                       onClick={() => handleExportPDF(lista.id, lista.clientes?.nome_cliente)}
                       disabled={isLoading}
                       title="Exportar Orçamento TecSol (PDF)"
                     >
                       📄 Exportar PDF
                     </button>
                     
                     {(userRole === 'administrador' || userRole === 'administrativo') && (
                       <button
                         className="delete-button"
                         onClick={() => handleDeleteLista(lista.id, lista.clientes?.nome_cliente)}
                         disabled={isLoading}
                         title="Excluir Lista"
                       >
                         🗑️ Excluir
                       </button>
                     )}
                   </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ListaMaterial
