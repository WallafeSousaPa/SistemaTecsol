import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import './ListaMaterial.css'

const ListaMaterial = ({ onBack, userRole }) => {
  // Função para formatar valores monetários no padrão brasileiro
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'R$ 0,00'
    }
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // Função para formatar valores sem o símbolo R$ (apenas números)
  const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0,00'
    }
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

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
  
  // Estados para controlar edição vs nova lista
  const [isEditing, setIsEditing] = useState(false)
  const [editingListaId, setEditingListaId] = useState(null)
  const [editingClienteId, setEditingClienteId] = useState(null)

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
          
          // Se carregou um novo arquivo, não estamos mais editando
          if (isEditing) {
            setIsEditing(false)
            setEditingListaId(null)
            setEditingClienteId(null)
            setSelectedCliente('')
          }
          
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
    // Verificar se temos dados válidos
    if (materialData.length === 0) {
      setMessage('Adicione itens de material antes de salvar')
      setMessageType('error')
      return
    }

    // Verificar cliente
    let clienteId = selectedCliente
    if (isEditing && editingClienteId) {
      clienteId = editingClienteId
    }
    
    if (!clienteId) {
      setMessage('Selecione um cliente para salvar a lista')
      setMessageType('error')
      return
    }

    try {
      setIsLoading(true)
      setMessage('Salvando lista de material...')
      setMessageType('info')

      // Calcular totais antes de salvar
      const { totalResolve, totalTecSol } = calculateTotals()

      if (isEditing && editingListaId) {
        // ATUALIZAR LISTA EXISTENTE
        setMessage('Atualizando lista existente...')
        
        // Atualizar a lista principal
        const { error: listaError } = await supabase
          .from('lista_material')
          .update({
            observacoes: `Editado em ${new Date().toLocaleDateString('pt-BR')}`,
            total_resolve: totalResolve,
            total_tecsol: totalTecSol
          })
          .eq('id', editingListaId)

        if (listaError) throw listaError

        // Excluir itens antigos
        const { error: deleteError } = await supabase
          .from('itens_material')
          .delete()
          .eq('lista_material_id', editingListaId)

        if (deleteError) throw deleteError

        // Inserir novos itens
        const itensToInsert = materialData.map(item => ({
          lista_material_id: editingListaId,
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

        setMessage('Lista de material atualizada com sucesso!')
        setMessageType('success')
        
        // Limpar estado de edição
        setIsEditing(false)
        setEditingListaId(null)
        setEditingClienteId(null)

      } else {
        // CRIAR NOVA LISTA
        setMessage('Criando nova lista de material...')
        
        // Criar lista de material
        const { data: listaData, error: listaError } = await supabase
          .from('lista_material')
          .insert({
            cliente_id: clienteId,
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

        setMessage('Nova lista de material criada com sucesso!')
        setMessageType('success')
      }

      // Limpar dados e recarregar listas
      setMaterialData([])
      setPreviewData([])
      setShowPreview(false)
      setSelectedCliente('')
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
      
      // Primeiro buscar informações da lista para obter o cliente_id
      const { data: listaInfo, error: listaError } = await supabase
        .from('lista_material')
        .select('cliente_id')
        .eq('id', listaId)
        .single()

      if (listaError) throw listaError

      // Buscar os itens da lista
      const { data, error } = await supabase
        .from('itens_material')
        .select('*')
        .eq('lista_material_id', listaId)

      if (error) throw error

      // Configurar estado de edição
      setIsEditing(true)
      setEditingListaId(listaId)
      setEditingClienteId(listaInfo.cliente_id)
      setSelectedCliente(listaInfo.cliente_id)

      setMaterialData(data || [])
      setPreviewData(data || [])
      setShowPreview(true)
      setMessage('Lista carregada para edição!')
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
        // Limpar estado de edição também
        setIsEditing(false)
        setEditingListaId(null)
        setEditingClienteId(null)
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
    
    // Preservar o lista_material_id se estivermos editando
    if (isEditing && editingListaId && !newData[index].lista_material_id) {
      newData[index].lista_material_id = editingListaId
    }
    
    setMaterialData(newData)
    setPreviewData(newData)
  }

  // Função para remover item
  const handleRemoveItem = (index) => {
    const newData = materialData.filter((_, i) => i !== index)
    
    // Preservar o lista_material_id nos itens restantes se estivermos editando
    if (isEditing && editingListaId) {
      newData.forEach(item => {
        if (!item.lista_material_id) {
          item.lista_material_id = editingListaId
        }
      })
    }
    
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
    
    // Se estamos editando, adicionar o ID da lista
    if (isEditing && editingListaId) {
      newItem.lista_material_id = editingListaId
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
      
      // Configurações de estilo profissional
      const primaryColor = [33, 33, 33] // Cor principal escura
      const secondaryColor = [66, 66, 66] // Cor secundária
      const accentColor = [0, 123, 255] // Cor de destaque
      const borderColor = [200, 200, 200] // Cor das bordas

      // Cabeçalho da empresa (lado esquerdo) - Design profissional
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...primaryColor)
      doc.text('R DE S BARROS JUNIOR LTDA', 20, 20)
      
      // Linha decorativa sob o nome da empresa
      doc.setDrawColor(...accentColor)
      doc.setLineWidth(0.5)
      doc.line(20, 22, 100, 22)
      
      // Informações da empresa (lado esquerdo) - Estilo organizado
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...secondaryColor)
      
      // CNPJ com ícone visual
      doc.setFillColor(...accentColor)
      doc.circle(18, 28, 1, 'F')
      doc.text('CNPJ: 44.376.302/0001-34', 22, 30)
      
      // Endereço com ícone
      doc.circle(18, 33, 1, 'F')
      doc.text('PSG DONA ANA - BLOCO 4, APT 202', 22, 35)
      
      // Município
      doc.circle(18, 38, 1, 'F')
      doc.text('Ananindeua - PA', 22, 40)
      
      // Telefone com ícone
      doc.circle(18, 43, 1, 'F')
      doc.text('Tel: (91) 98211-3496', 22, 45)
      
      // E-mail com ícone
      doc.circle(18, 48, 1, 'F')
      doc.text('E-mail: tecsol.ananindeua@gmail.com', 22, 50)

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

      // Informações do cliente (lado direito) - Design profissional
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...accentColor)
      doc.text('ORÇAMENTO TECSOL', 120, 20)
      
      // Linha decorativa sob o título
      doc.setDrawColor(...accentColor)
      doc.setLineWidth(0.3)
      doc.line(120, 22, 180, 22)
      
      // Cliente com quebra de linha automática (máximo 25 caracteres por linha)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...primaryColor)
      const clienteLines = wrapText(pdfContent.cliente, 25)
      clienteLines.forEach((line, lineIndex) => {
        doc.text(`${lineIndex === 0 ? 'Cliente: ' : ''}${line}`, 120, 35 + (lineIndex * 5))
      })
      
      // Ajustar posição da data baseado no número de linhas do cliente
      const dataPosition = 35 + (clienteLines.length * 5) + 5
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...secondaryColor)
      doc.text(`Data: ${pdfContent.data}`, 120, dataPosition)

      // Calcular posição da linha separadora baseado no tamanho do cabeçalho
      const separatorPosition = Math.max(60, dataPosition + 10)
      
      // Linha separadora principal - Estilo profissional
      doc.setDrawColor(...borderColor)
      doc.setLineWidth(1)
      doc.line(20, separatorPosition, 190, separatorPosition)
      
      // Linha decorativa dupla
      doc.setDrawColor(...accentColor)
      doc.setLineWidth(0.3)
      doc.line(20, separatorPosition + 2, 190, separatorPosition + 2)

      // Cabeçalho da tabela - Design aprimorado
      const tableHeaderPosition = separatorPosition + 10
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...primaryColor)
      
      // Fundo do cabeçalho da tabela
      doc.setFillColor(245, 245, 245)
      doc.rect(20, tableHeaderPosition - 3, 170, 8, 'F')
      
      // Texto do cabeçalho
      doc.text('Material', 20, tableHeaderPosition)
      doc.text('Qtd.', 110, tableHeaderPosition)
      doc.text('Valor Unit.', 130, tableHeaderPosition)
      doc.text('Valor Total', 160, tableHeaderPosition)

      // Linha separadora da tabela
      doc.setDrawColor(...borderColor)
      doc.setLineWidth(0.5)
      doc.line(20, tableHeaderPosition + 5, 190, tableHeaderPosition + 5)

      // Itens
      let yPosition = tableHeaderPosition + 15
             pdfContent.itens.forEach((item, index) => {
         if (yPosition > 250) {
           doc.addPage()
           yPosition = 20
         }



        // Material com quebra de linha automática (máximo 25 caracteres por linha)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...primaryColor)
        const materialLines = wrapText(item.material, 25)
        materialLines.forEach((line, lineIndex) => {
          doc.text(line, 20, yPosition + (lineIndex * 4))
        })
        
        // Quantidade (posicionada mais à direita, alinhada com o cabeçalho)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...accentColor)
        doc.text(item.quantidade.toString(), 110, yPosition)
        
        // Valor Unitário
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...secondaryColor)
        doc.text(`R$ ${formatNumber(item.valor_unitario)}`, 130, yPosition)
        
        // Valor Total
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...primaryColor)
        doc.text(`R$ ${formatNumber(item.valor_unitario * item.quantidade)}`, 160, yPosition)

        // Ajustar posição Y baseado no número de linhas do material
        yPosition += Math.max(10, materialLines.length * 4 + 2)
      })

      // Linha separadora antes do total - Estilo profissional
      doc.setDrawColor(...borderColor)
      doc.setLineWidth(1)
      doc.line(20, yPosition + 5, 190, yPosition + 5)
      
      // Linha decorativa dupla
      doc.setDrawColor(...accentColor)
      doc.setLineWidth(0.3)
      doc.line(20, yPosition + 7, 190, yPosition + 7)

      // Total - Design destacado
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...accentColor)
      
      // Fundo do total
      doc.setFillColor(245, 245, 245)
      doc.rect(130, yPosition + 10, 60, 8, 'F')
      
      // Texto do total
      doc.text(`TOTAL: R$ ${formatNumber(pdfContent.total)}`, 140, yPosition + 15)

      // Rodapé profissional
      const footerY = 280
      doc.setDrawColor(...borderColor)
      doc.setLineWidth(0.5)
      doc.line(20, footerY, 190, footerY)
      
      // Informações do rodapé
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(...secondaryColor)
      doc.text('Documento gerado automaticamente pelo Sistema TecSol', 105, footerY + 5, { align: 'center' })
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 105, footerY + 10, { align: 'center' })
      
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

      {/* Indicador de Edição */}
      {isEditing && (
        <div className="editing-indicator">
          <h3>✏️ Editando Lista Existente</h3>
          <p>Você está editando uma lista existente. As alterações serão aplicadas à lista atual.</p>
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
            disabled={isLoading || isEditing}
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
        
        {isEditing && (
          <div className="cliente-info">
            <p><strong>Cliente:</strong> {clientes.find(c => c.id === editingClienteId)?.nome_cliente}</p>
            <p><em>O cliente não pode ser alterado durante a edição. Use o botão "Nova Lista" para criar uma lista para outro cliente.</em></p>
          </div>
        )}
        
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
                <span className="total-value">{formatCurrency(totalResolve)}</span>
              </div>
              <div className="total-item tecsol">
                <span className="total-label">Total TecSol:</span>
                <span className="total-value">{formatCurrency(totalTecSol)}</span>
              </div>
              <div className="total-item total-geral">
                <span className="total-label">Total Geral:</span>
                <span className="total-value">{formatCurrency(totalResolve + totalTecSol)}</span>
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
                      {formatCurrency(item.valor_unitario * item.quantidade)}
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
              {isLoading ? 'Salvando...' : isEditing ? '💾 Atualizar Lista' : '💾 Salvar Nova Lista'}
            </button>
            
            {isEditing && (
              <button
                className="new-list-button"
                onClick={() => {
                  setIsEditing(false)
                  setEditingListaId(null)
                  setEditingClienteId(null)
                  setSelectedCliente('')
                  setMessage('Modo de nova lista ativado. Selecione um cliente para criar uma nova lista.')
                  setMessageType('info')
                }}
                disabled={isLoading}
                title="Criar nova lista em vez de editar a atual"
              >
                📝 Nova Lista
              </button>
            )}
            
            <button
              className="clear-button"
              onClick={() => {
                setMaterialData([])
                setPreviewData([])
                setShowPreview(false)
                setDetectedHeaders([])
                setHeaderMapping({})
                // Limpar estado de edição
                setIsEditing(false)
                setEditingListaId(null)
                setEditingClienteId(null)
                setSelectedCliente('')
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
                        <strong>Total Resolve:</strong> {formatCurrency(lista.total_resolve)}
                      </>
                    )}
                    {lista.total_tecsol !== null && (
                      <>
                        <br />
                        <strong>Total TecSol:</strong> {formatCurrency(lista.total_tecsol)}
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
