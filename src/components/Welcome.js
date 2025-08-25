import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { validators, security, USER_ROLES } from '../config/security'
import * as XLSX from 'xlsx'
import ListaMaterial from './ListaMaterial'
import './Welcome.css'

const Welcome = () => {
  const navigate = useNavigate()
  
  // Estados básicos
  const [currentView, setCurrentView] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Estados para alterar senha
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false)
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  
  // Estados para clientes
  const [clientes, setClientes] = useState([])
  const [showClienteForm, setShowClienteForm] = useState(false)
  const [editingCliente, setEditingCliente] = useState(null)
  const [showClienteModal, setShowClienteModal] = useState(false)
  const [clienteModalData, setClienteModalData] = useState(null)
  const [clienteFormData, setClienteFormData] = useState({
    nome_cliente: '',
    endereco: '',
    telefone: '',
    data_instalacao: '',
    tipo_servico_id: '',
    tipo_padrao_id: '',
    id_profiles: [],
    equipe_id: '',
    data_cadastro: new Date().toISOString().split('T')[0],
    quantidade_modulos: 0,
    deslocamento_buscar_material: false,
    configuracao_inversor: false,
    obra_civil: false,
    obra_cancelada: false,
    nota_material: false,
    observacoes: '',
    id_status: 1 // Status padrão: Pendente (ID 1)
  })
  
  // Estados para presença
  const [presencas, setPresencas] = useState([])
  const [showPresencaForm, setShowPresencaForm] = useState(false)
  const [editingPresenca, setEditingPresenca] = useState(null)
  const [presencaFormData, setPresencaFormData] = useState({
    data_presenca: '',
    data_cadastro_preenchido: '',
    cliente_id: '',
    equipe_id: '',
    veiculo_id: '',
    km_inicial: '',
    observacoes: '',
    colaboradores: [] // Array de IDs dos colaboradores selecionados
  })
  
  // Estados para equipes
  const [equipes, setEquipes] = useState([])
  
  // Estados para tipos de serviço
  const [tiposServico, setTiposServico] = useState([])
  
     // Estados para tipos de padrão
   const [tiposPadrao, setTiposPadrao] = useState([])
   
   // Estados para status de clientes
   const [statusClientes, setStatusClientes] = useState([])
   
   // Estados para medição
   const [medicaoData, setMedicaoData] = useState([])
   const [medicaoLoading, setMedicaoLoading] = useState(false)
   const [medicaoPeriodo, setMedicaoPeriodo] = useState({
     inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias atrás
     fim: new Date().toISOString().split('T')[0] // Hoje
   })
   
   // Estados para formulários de tipos
   const [showTipoServicoForm, setShowTipoServicoForm] = useState(false)
   const [editingTipoServico, setEditingTipoServico] = useState(null)
   const [tipoServicoFormData, setTipoServicoFormData] = useState({
     nome: '',
     ativo: true
   })
   
   const [showTipoPadraoForm, setShowTipoPadraoForm] = useState(false)
   const [editingTipoPadrao, setEditingTipoPadrao] = useState(null)
   const [tipoPadraoFormData, setTipoPadraoFormData] = useState({
     nome: '',
     ativo: true
   })
  
  // Estados para usuários instaladores
  const [usuariosInstaladores, setUsuariosInstaladores] = useState([])
  
  // Estados para colaboradores
  const [colaboradores, setColaboradores] = useState([])
  const [showColaboradorForm, setShowColaboradorForm] = useState(false)
  const [editingColaborador, setEditingColaborador] = useState(null)
  const [colaboradorFormData, setColaboradorFormData] = useState({
    nome: '',
    cargo: '',
    email: '',
    chave_pix: '',
    ativo: true
  })
  
  // Estados para carros/veículos
  const [carros, setCarros] = useState([])
  
  // Estados para usuários do sistema
  const [usuarios, setUsuarios] = useState([])
  const [showUsuarioForm, setShowUsuarioForm] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState(null)
  const [usuarioFormData, setUsuarioFormData] = useState({
    nome: '',
    email: '',
    role: 'usuario',
    status: 'ativo'
  })
  
  // Estados para cargos
  const [cargos, setCargos] = useState([])
  const [showCargoForm, setShowCargoForm] = useState(false)
  const [editingCargo, setEditingCargo] = useState(null)
  const [cargoFormData, setCargoFormData] = useState({
    cargo: '',
    ativo: true
  })
  
  // Estados para veículos
  const [veiculos, setVeiculos] = useState([])
  const [showVeiculoForm, setShowVeiculoForm] = useState(false)
  const [editingVeiculo, setEditingVeiculo] = useState(null)
  const [veiculoFormData, setVeiculoFormData] = useState({
    veiculo: '',
    placa: '',
    ativo: true
  })
  
  // Estados para filtros
  const [filtrosCliente, setFiltrosCliente] = useState({
    nome_cliente: '',
    dataInicio: '',
    dataFim: '',
    tipoServicoId: '',
    idProfiles: []
  })
  
  // Estados para notificações
  const [notifications, setNotifications] = useState([])
  
  // Estados para modais
  const [showPresencaWarningModal, setShowPresencaWarningModal] = useState(false)
  const [clienteParaExcluir, setClienteParaExcluir] = useState(null)
  const [presencasCliente, setPresencasCliente] = useState([])
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false)
  
  // Estado para lista de material
  const [showListaMaterial, setShowListaMaterial] = useState(false)
  
  // Estados para presença modal não fechável
  const [presencaModalNaoFechavel, setPresencaModalNaoFechavel] = useState(false)
  
  // Estados para cliente modal não fechável (quando finalizando obra)
  const [clienteModalNaoFechavel, setClienteModalNaoFechavel] = useState(false)
  
  // Função para mostrar notificações
  const showNotification = (message, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }
  
  // Funções para colaboradores
  const handleEditColaborador = (colaborador) => {
    setEditingColaborador(colaborador)
    setColaboradorFormData({
      nome: colaborador.nome || '',
      cargo: colaborador.cargo || '',
      email: colaborador.email || '',
      chave_pix: colaborador.chave_pix || '',
      ativo: colaborador.ativo !== undefined ? colaborador.ativo : true
    })
    setShowColaboradorForm(true)
  }

  const handleDeleteColaborador = async (colaborador) => {
    if (!window.confirm(`Tem certeza que deseja excluir o colaborador "${colaborador.nome}"?`)) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('colaboradores')
        .delete()
        .eq('id', colaborador.id)
      
      if (error) throw error
      
      showNotification('Colaborador excluído com sucesso!', 'success')
      loadColaboradores()
    } catch (error) {
      console.error('Erro ao excluir colaborador:', error)
      showNotification('Erro ao excluir colaborador: ' + error.message, 'error')
    }
  }

  // Salvar colaborador
  const handleColaboradorFormSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingColaborador) {
        // Atualizar colaborador existente
        const { error } = await supabase
          .from('colaboradores')
          .update(colaboradorFormData)
          .eq('id', editingColaborador.id)
        
        if (error) throw error
        
        showNotification('Colaborador atualizado com sucesso!', 'success')
      } else {
        // Criar novo colaborador
        const { error } = await supabase
          .from('colaboradores')
          .insert([colaboradorFormData])
        
        if (error) throw error
        
        showNotification('Colaborador cadastrado com sucesso!', 'success')
      }
      
      closeColaboradorForm()
      loadColaboradores()
    } catch (error) {
      console.error('Erro ao salvar colaborador:', error)
      showNotification('Erro ao salvar colaborador: ' + error.message, 'error')
    }
  }

  // Fechar formulário de colaborador
  const closeColaboradorForm = () => {
    setShowColaboradorForm(false)
    setEditingColaborador(null)
    setColaboradorFormData({
      nome: '',
      cargo: '',
      email: '',
      chave_pix: '',
      ativo: true
    })
  }

  // Funções para usuários
  const handleEditUsuario = (usuario) => {
    setEditingUsuario(usuario)
    setUsuarioFormData({
      nome: usuario.nome || '',
      email: usuario.email || '',
      role: usuario.role || 'usuario',
      status: usuario.status || 'ativo'
    })
    setShowUsuarioForm(true)
  }

  const handleDeleteUsuario = async (usuario) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${usuario.nome}"?`)) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', usuario.id)
      
      if (error) throw error
      
      showNotification('Usuário excluído com sucesso!', 'success')
      loadUsuarios()
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      showNotification('Erro ao excluir usuário: ' + error.message, 'error')
    }
  }

  // Salvar usuário
  const handleUsuarioFormSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingUsuario) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from('profiles')
          .update(usuarioFormData)
          .eq('id', editingUsuario.id)
        
        if (error) throw error
        
        showNotification('Usuário atualizado com sucesso!', 'success')
      } else {
        // Criar novo usuário
        const { error } = await supabase
          .from('profiles')
          .insert([usuarioFormData])
        
        if (error) throw error
        
        showNotification('Usuário cadastrado com sucesso!', 'success')
      }
      
      closeUsuarioForm()
      loadUsuarios()
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      showNotification('Erro ao salvar usuário: ' + error.message, 'error')
    }
  }

  // Fechar formulário de usuário
  const closeUsuarioForm = () => {
    setShowUsuarioForm(false)
    setEditingUsuario(null)
    setUsuarioFormData({
      nome: '',
      email: '',
      role: 'usuario',
      status: 'ativo'
    })
  }

  // Funções para alterar senha
  const openChangePasswordForm = () => {
    setShowChangePasswordForm(true)
    setChangePasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setPasswordError('')
    setPasswordSuccess('')
  }

  const closeChangePasswordForm = () => {
    setShowChangePasswordForm(false)
    setChangePasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setPasswordError('')
    setPasswordSuccess('')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    // Validações
    if (!changePasswordData.currentPassword.trim()) {
      setPasswordError('Senha atual é obrigatória')
      return
    }

    if (!changePasswordData.newPassword.trim()) {
      setPasswordError('Nova senha é obrigatória')
      return
    }

    if (changePasswordData.newPassword.length < 6) {
      setPasswordError('Nova senha deve ter pelo menos 6 caracteres')
      return
    }

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      setPasswordError('As senhas não coincidem')
      return
    }

    try {
      // Primeiro, verificar se a senha atual está correta
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: changePasswordData.currentPassword
      })

      if (signInError) {
        setPasswordError('Senha atual incorreta')
        return
      }

      // Alterar a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: changePasswordData.newPassword
      })

      if (updateError) {
        throw updateError
      }

      setPasswordSuccess('Senha alterada com sucesso!')
      
      // Fechar o formulário após 2 segundos
      setTimeout(() => {
        closeChangePasswordForm()
      }, 2000)

    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      setPasswordError('Erro ao alterar senha: ' + error.message)
    }
  }

  // Funções para confirmação de saída
  const openLogoutConfirmation = () => {
    setShowLogoutConfirmation(true)
  }

  const closeLogoutConfirmation = () => {
    setShowLogoutConfirmation(false)
  }

  const confirmLogout = async () => {
    try {
      // Fechar o modal primeiro
      closeLogoutConfirmation()
      
      // Fazer logout
      await supabase.auth.signOut()
      
      // O redirecionamento será feito automaticamente pelo useEffect
      // que monitora mudanças no estado de autenticação
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      // Em caso de erro, mostrar notificação
      showNotification('Erro ao fazer logout: ' + error.message, 'error')
    }
  }

  // Funções para menu hambúrguer
  const toggleHamburgerMenu = () => {
    setShowHamburgerMenu(!showHamburgerMenu)
  }
  
  // Função para voltar da lista de material
  const handleBackFromListaMaterial = () => {
    setShowListaMaterial(false)
  }

  const closeHamburgerMenu = () => {
    setShowHamburgerMenu(false)
  }

  const handleNavItemClick = (view) => {
    setCurrentView(view)
    closeHamburgerMenu()
  }

  // Funções para cargos
  const handleEditCargo = (cargo) => {
    // Verificar se o usuário pode editar este cargo
    if (isCargoRestrito(cargo.cargo) && !isAdministrador()) {
      showNotification('Você não tem permissão para editar este cargo.', 'error')
      return
    }
    
    setEditingCargo(cargo)
    setCargoFormData({
      cargo: cargo.cargo || '',
      ativo: cargo.ativo !== undefined ? cargo.ativo : true
    })
    setShowCargoForm(true)
  }

  const handleDeleteCargo = async (cargo) => {
    // Verificar se o usuário pode excluir este cargo
    if (isCargoRestrito(cargo.cargo) && !isAdministrador()) {
      showNotification('Você não tem permissão para excluir este cargo.', 'error')
      return
    }
    
    if (!window.confirm(`Tem certeza que deseja excluir o cargo "${cargo.cargo}"?`)) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('cargos')
        .delete()
        .eq('id', cargo.id)
      
      if (error) throw error
      
      showNotification('Cargo excluído com sucesso!', 'success')
      loadCargos()
    } catch (error) {
      console.error('Erro ao excluir cargo:', error)
      showNotification('Erro ao excluir cargo: ' + error.message, 'error')
    }
  }

  // Salvar cargo
  const handleCargoFormSubmit = async (e) => {
    e.preventDefault()
    
    // Verificar se o usuário pode criar/editar cargos restritos
    if (isCargoRestrito(cargoFormData.cargo) && !isAdministrador()) {
      showNotification('Você não tem permissão para criar ou editar este cargo.', 'error')
      return
    }
    
    try {
      if (editingCargo) {
        // Atualizar cargo existente
        const { error } = await supabase
          .from('cargos')
          .update(cargoFormData)
          .eq('id', editingCargo.id)
        
        if (error) throw error
        
        showNotification('Cargo atualizado com sucesso!', 'success')
      } else {
        // Criar novo cargo
        const { error } = await supabase
          .from('cargos')
          .insert([cargoFormData])
        
        if (error) throw error
        
        showNotification('Cargo cadastrado com sucesso!', 'success')
      }
      
      closeCargoForm()
      loadCargos()
    } catch (error) {
      console.error('Erro ao salvar cargo:', error)
      showNotification('Erro ao salvar cargo: ' + error.message, 'error')
    }
  }

  // Fechar formulário de cargo
  const closeCargoForm = () => {
    setShowCargoForm(false)
    setEditingCargo(null)
    setCargoFormData({
      cargo: '',
      ativo: true
    })
  }

  // Funções para veículos
  const handleEditVeiculo = (veiculo) => {
    setEditingVeiculo(veiculo)
    setVeiculoFormData({
      veiculo: veiculo.veiculo || '',
      placa: veiculo.placa || '',
      ativo: veiculo.ativo !== undefined ? veiculo.ativo : true
    })
    setShowVeiculoForm(true)
  }

  const handleDeleteVeiculo = async (veiculo) => {
    if (!window.confirm(`Tem certeza que deseja excluir o veículo "${veiculo.veiculo}"?`)) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('veiculos')
        .delete()
        .eq('id', veiculo.id)
      
      if (error) throw error
      
      showNotification('Veículo excluído com sucesso!', 'success')
      loadVeiculos()
    } catch (error) {
      console.error('Erro ao excluir veículo:', error)
      showNotification('Erro ao excluir veículo: ' + error.message, 'error')
    }
  }

  // Salvar veículo
  const handleVeiculoFormSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingVeiculo) {
        // Atualizar veículo existente
        const { error } = await supabase
          .from('veiculos')
          .update(veiculoFormData)
          .eq('id', editingVeiculo.id)
        
        if (error) throw error
        
        showNotification('Veículo atualizado com sucesso!', 'success')
      } else {
        // Criar novo veículo
        const { error } = await supabase
          .from('veiculos')
          .insert([veiculoFormData])
        
        if (error) throw error
        
        showNotification('Veículo cadastrado com sucesso!', 'success')
      }
      
      closeVeiculoForm()
      loadVeiculos()
    } catch (error) {
      console.error('Erro ao salvar veículo:', error)
      showNotification('Erro ao salvar veículo: ' + error.message, 'error')
    }
  }

     // Fechar formulário de veículo
   const closeVeiculoForm = () => {
     setShowVeiculoForm(false)
     setEditingVeiculo(null)
     setVeiculoFormData({
       veiculo: '',
       placa: '',
       ativo: true
     })
   }
   
   // Funções para tipos de serviço
   const handleEditTipoServico = (tipo) => {
     setEditingTipoServico(tipo)
     setTipoServicoFormData({
       nome: tipo.nome || '',
       ativo: tipo.ativo !== undefined ? tipo.ativo : true
     })
     setShowTipoServicoForm(true)
   }
   
   const handleDeleteTipoServico = async (tipo) => {
     if (!window.confirm(`Tem certeza que deseja excluir o tipo de serviço "${tipo.nome}"?`)) {
       return
     }
     
     try {
       const { error } = await supabase
         .from('tipo_servico')
         .delete()
         .eq('id', tipo.id)
       
       if (error) throw error
       
       showNotification('Tipo de serviço excluído com sucesso!', 'success')
       loadTiposServico()
     } catch (error) {
       console.error('Erro ao excluir tipo de serviço:', error)
       showNotification('Erro ao excluir tipo de serviço: ' + error.message, 'error')
     }
   }
   
   // Salvar tipo de serviço
   const handleTipoServicoFormSubmit = async (e) => {
     e.preventDefault()
     
     try {
       if (editingTipoServico) {
         // Atualizar tipo de serviço existente
         const { error } = await supabase
           .from('tipo_servico')
           .update(tipoServicoFormData)
           .eq('id', editingTipoServico.id)
         
         if (error) throw error
         
         showNotification('Tipo de serviço atualizado com sucesso!', 'success')
       } else {
         // Criar novo tipo de serviço
         const { error } = await supabase
           .from('tipo_servico')
           .insert([tipoServicoFormData])
         
         if (error) throw error
         
         showNotification('Tipo de serviço cadastrado com sucesso!', 'success')
       }
       
       closeTipoServicoForm()
       loadTiposServico()
     } catch (error) {
       console.error('Erro ao salvar tipo de serviço:', error)
       showNotification('Erro ao salvar tipo de serviço: ' + error.message, 'error')
     }
   }
   
   // Fechar formulário de tipo de serviço
   const closeTipoServicoForm = () => {
     setShowTipoServicoForm(false)
     setEditingTipoServico(null)
     setTipoServicoFormData({
       nome: '',
       ativo: true
     })
   }
   
   // Funções para tipos de padrão
   const handleEditTipoPadrao = (tipo) => {
     setEditingTipoPadrao(tipo)
     setTipoPadraoFormData({
       nome: tipo.nome || '',
       ativo: tipo.ativo !== undefined ? tipo.ativo : true
     })
     setShowTipoPadraoForm(true)
   }
   
   const handleDeleteTipoPadrao = async (tipo) => {
     if (!window.confirm(`Tem certeza que deseja excluir o tipo de padrão "${tipo.nome}"?`)) {
       return
     }
     
     try {
       const { error } = await supabase
         .from('tipo_padrao')
         .delete()
         .eq('id', tipo.id)
       
       if (error) throw error
       
       showNotification('Tipo de padrão excluído com sucesso!', 'success')
       loadTiposPadrao()
     } catch (error) {
       console.error('Erro ao excluir tipo de padrão:', error)
       showNotification('Erro ao excluir tipo de padrão: ' + error.message, 'error')
     }
   }
   
   // Exportar medição para CSV
   const exportarMedicaoCSV = () => {
     if (medicaoData.length === 0) {
       showNotification('Não há dados para exportar!', 'warning')
       return
     }
     
     try {
       // Criar cabeçalho do CSV
       const headers = [
         'CLIENTE',
         'DATA',
         'TIPO DE SERVIÇO',
         'QTD MÓDULOS',
         'PADRÃO',
         'CONFIG. INVERSOR',
         'DESLOCAMENTO',
         'NOTA MATERIAL',
         'OBRA CIVIL',
         'TOTAL',
         'OBSERVAÇÃO'
       ]
       
       // Criar linhas de dados
       const rows = medicaoData.map(item => [
         item.cliente,
         new Date(item.data).toLocaleDateString('pt-BR'),
         item.tipo_servico,
         item.qtd_modulos,
         item.padrao,
         item.configuracao_inversor,
         item.deslocamento_buscar_material,
         item.nota_material,
         item.valor_obra_civil,
         `R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
         item.observacao
       ])
       
       // Combinar cabeçalho e dados
       const csvContent = [headers, ...rows]
         .map(row => row.map(cell => `"${cell}"`).join(','))
         .join('\n')
       
       // Criar e baixar arquivo
       const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
       const link = document.createElement('a')
       const url = URL.createObjectURL(blob)
       link.setAttribute('href', url)
       link.setAttribute('download', `medicao_tecsol_${medicaoPeriodo.inicio}_${medicaoPeriodo.fim}.csv`)
       link.style.visibility = 'hidden'
       document.body.appendChild(link)
       link.click()
       document.body.removeChild(link)
       
       showNotification('Relatório CSV exportado com sucesso!', 'success')
     } catch (error) {
       console.error('Erro ao exportar medição CSV:', error)
       showNotification('Erro ao exportar medição CSV: ' + error.message, 'error')
     }
   }

   // Exportar medição para Excel
   const exportarMedicaoExcel = () => {
     if (medicaoData.length === 0) {
       showNotification('Não há dados para exportar!', 'warning')
       return
     }
     
     try {
       // Criar cabeçalho do Excel
       const headers = [
         'CLIENTE',
         'DATA DE INSTALAÇÃO',
         'TIPO DE SERVIÇO',
         'QTD MÓDULOS',
         'PADRÃO',
         'CONFIG. INVERSOR',
         'DESLOCAMENTO',
         'NOTA MATERIAL',
         'OBRA CIVIL',
         'EQUIPE',
         'VALOR OBRA',
         'VALOR MATERIAL',
         'COMPRAS',
         'TOTAL',
         'OBSERVAÇÃO'
       ]
       
       // Criar linhas de dados
       const rows = medicaoData.map(item => [
         item.cliente,
         new Date(item.data).toLocaleDateString('pt-BR'),
         item.tipo_servico,
         item.qtd_modulos,
         item.padrao,
         item.configuracao_inversor,
         item.deslocamento_buscar_material,
         item.nota_material,
         item.obra_civil,
         item.equipe,
         `R$ ${(item.valor_obra || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
         `R$ ${(item.valor_material || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
         `R$ ${(item.valor_compras || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
         `R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
         item.observacao
       ])
       
       // Criar workbook e worksheet
       const wb = XLSX.utils.book_new()
       const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
       
       // Ajustar largura das colunas
       const colWidths = [
         { wch: 25 }, // CLIENTE
         { wch: 15 }, // DATA DE INSTALAÇÃO
         { wch: 20 }, // TIPO DE SERVIÇO
         { wch: 12 }, // QTD MÓDULOS
         { wch: 15 }, // PADRÃO
         { wch: 15 }, // CONFIG. INVERSOR
         { wch: 15 }, // DESLOCAMENTO
         { wch: 15 }, // NOTA MATERIAL
         { wch: 12 }, // OBRA CIVIL
         { wch: 15 }, // EQUIPE
         { wch: 15 }, // VALOR OBRA
         { wch: 15 }, // VALOR MATERIAL
         { wch: 15 }, // COMPRAS
         { wch: 15 }, // TOTAL
         { wch: 40 }  // OBSERVAÇÃO
       ]
       ws['!cols'] = colWidths
       
       // Adicionar worksheet ao workbook
       XLSX.utils.book_append_sheet(wb, ws, 'Medição TecSol')
       
       // Gerar arquivo Excel e baixar
       XLSX.writeFile(wb, `medicao_tecsol_${medicaoPeriodo.inicio}_${medicaoPeriodo.fim}.xlsx`)
       
       showNotification('Relatório Excel exportado com sucesso!', 'success')
     } catch (error) {
       console.error('Erro ao exportar medição Excel:', error)
       showNotification('Erro ao exportar medição Excel: ' + error.message, 'error')
     }
   }
   
   // Salvar tipo de padrão
   const handleTipoPadraoFormSubmit = async (e) => {
     e.preventDefault()
     
     try {
       if (editingTipoPadrao) {
         // Atualizar tipo de padrão existente
         const { error } = await supabase
           .from('tipo_padrao')
           .update(tipoPadraoFormData)
           .eq('id', editingTipoPadrao.id)
         
         if (error) throw error
         
         showNotification('Tipo de padrão atualizado com sucesso!', 'success')
       } else {
         // Criar novo tipo de padrão
         const { error } = await supabase
           .from('tipo_padrao')
           .insert([tipoPadraoFormData])
         
         if (error) throw error
         
         showNotification('Tipo de padrão cadastrado com sucesso!', 'success')
       }
       
       closeTipoPadraoForm()
       loadTiposPadrao()
     } catch (error) {
       console.error('Erro ao salvar tipo de padrão:', error)
       showNotification('Erro ao salvar tipo de padrão: ' + error.message, 'error')
     }
   }
   
   // Fechar formulário de tipo de padrão
   const closeTipoPadraoForm = () => {
     setShowTipoPadraoForm(false)
     setEditingTipoPadrao(null)
     setTipoPadraoFormData({
       nome: '',
       ativo: true
     })
   }

  // Funções auxiliares de segurança
  const isAdministrador = () => {
    return userRole === 'administrador'
  }
  
  const isCargoRestrito = (cargoNome) => {
    const cargosRestritos = ['administrador', 'administrativo']
    return cargosRestritos.includes(cargoNome?.toLowerCase())
  }
  
  const podeGerenciarCargo = (cargoNome) => {
    if (!isCargoRestrito(cargoNome)) return true
    return isAdministrador()
  }
  
  // Função para formatar data
  const formatarData = (dataString) => {
    if (!dataString) return 'N/A'
    
    try {
      if (typeof dataString === 'string' && dataString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [ano, mes, dia] = dataString.split('-')
        return `${dia}/${mes}/${ano}`
      }
      
      const data = new Date(dataString)
      if (isNaN(data.getTime())) {
        return 'Data Inválida'
      }
      
      return data.toLocaleDateString('pt-BR')
    } catch (error) {
      return 'Erro na Data'
    }
  }
  
  // Monitorar mudanças na autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Usuário fez logout, redirecionar para login
        navigate('/login')
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Usuário fez login, atualizar estado
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  // Carregar dados iniciais
  const loadInitialData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Carregar perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('nome, role, status')
          .eq('id', user.id)
          .single()
        
        if (profileError) {
          console.error('❌ Erro ao carregar perfil:', profileError)
          return
        }
        
        // Verificar se o usuário está ativo e definir o role com case-insensitive
        if (profile && profile.status === 'ativo') {
          // Converter role para minúsculo para comparação case-insensitive
          const roleLowerCase = profile.role?.toLowerCase()
          
          // Definir userRole baseado no role em minúsculo
          if (roleLowerCase === 'instalador') {
            setUserRole('instalador')
          } else if (roleLowerCase === 'administrador') {
            setUserRole('administrador')
          } else if (roleLowerCase === 'administrativo') {
            setUserRole('administrativo')
          } else {
            setUserRole(null)
          }
        } else {
          // Logout automático para usuários inativos
          await supabase.auth.signOut()
          navigate('/login')
          return
        }
        
        setUser({...user, nome: profile.nome})
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados iniciais:', error)
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  // Carregar dados iniciais quando o componente montar
  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // Carregar dados básicos após definir o userRole
  useEffect(() => {
    if (userRole && !isLoading) {
      const loadBasicData = async () => {
        try {
          // Carregar dados sequencialmente para evitar sobrecarga
          await loadEquipes()
          await loadTiposServico()
          await loadTiposPadrao()
          await loadStatusClientes()
          await loadUsuariosInstaladores()
        } catch (error) {
          console.error('Erro ao carregar dados básicos:', error)
        }
      }
      
      loadBasicData()
    }
  }, [userRole, isLoading])
  
  // Função para obter valor do padrão
  const getValorPadrao = (nomePadrao) => {
    switch (nomePadrao?.toLowerCase()) {
      case 'fachada':
        return 200
      case 'poste auxiliar':
        return 300
      case 'saga':
        return 400
      case 'fachada com ancoragem':
        return 200
      case 'não instalado':
        return 0
      default:
        return 0
    }
  }
  
  // Carregar dados de medição
  const loadMedicao = useCallback(async () => {
    setMedicaoLoading(true)
    try {
      // Buscar clientes do período especificado
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select(`
          *,
          tipo_servico:tipo_servico(nome),
          tipo_padrao:tipo_padrao(nome),
          equipe:equipes(nome),
          status_info:status_clientes(status)
        `)
        .gte('data_cadastro', medicaoPeriodo.inicio)
        .lte('data_cadastro', medicaoPeriodo.fim)
        .order('data_instalacao', { ascending: false })

      if (clientesError) throw clientesError

      // Buscar valores de compras (total_tecsol) da tabela lista_material para cada cliente
      const valoresCompras = {}
      for (const cliente of clientes) {
        const { data: listasMaterial, error: listasError } = await supabase
          .from('lista_material')
          .select('total_tecsol')
          .eq('cliente_id', cliente.id)
        
        if (!listasError && listasMaterial) {
          // Somar todos os valores total_tecsol para este cliente
          const totalCompras = listasMaterial.reduce((sum, lista) => sum + (lista.total_tecsol || 0), 0)
          valoresCompras[cliente.id] = totalCompras
        } else {
          valoresCompras[cliente.id] = 0
        }
      }

      // Processar dados para medição
      const medicaoProcessada = clientes.map(cliente => {
        // Calcular valores baseados no padrão
        const valorPadrao = getValorPadrao(cliente.tipo_padrao?.nome)
        const valorInversor = cliente.configuracao_inversor ? 100 : 0
        const valorDeslocamento = cliente.deslocamento_buscar_material ? 50 : 0
        const valorNotaMaterial = cliente.nota_material ? 0 : 0
        const valorObraCivil = cliente.valor_obra || 0
        const valorMaterial = cliente.valor_material || 0
        const valorCompras = valoresCompras[cliente.id] || 0
        
        // Calcular total incluindo compras
        const total = (90 * (cliente.quantidade_modulos || 0)) + 
                     valorPadrao + 
                     valorInversor + 
                     valorDeslocamento + 
                     valorNotaMaterial + 
                     valorObraCivil + 
                     valorMaterial +
                     valorCompras

        // Criar objeto com data corrigida
        const dataProcessada = cliente.data_instalacao ? new Date(cliente.data_instalacao + 'T00:00:00') : (cliente.data_cadastro ? new Date(cliente.data_cadastro + 'T00:00:00') : new Date())

        return {
          id: cliente.id,
          cliente: cliente.nome_cliente,
          data: dataProcessada,
          tipo_servico: cliente.tipo_servico?.nome || 'N/A',
          qtd_modulos: cliente.quantidade_modulos || 0,
          padrao: cliente.tipo_padrao?.nome || 'N/A',
          configuracao_inversor: cliente.configuracao_inversor ? 'Sim' : 'Não',
          deslocamento_buscar_material: cliente.deslocamento_buscar_material ? 'Sim' : 'Não',
          nota_material: cliente.nota_material ? 'Sim' : 'Não',
          obra_civil: cliente.obra_civil ? 'Sim' : 'Não',
          equipe: cliente.equipe?.nome || 'N/A',
          total: total,
          observacao: cliente.observacoes || '',
          // Valores para cálculos
          valor_padrao: valorPadrao,
          valor_inversor: valorInversor,
          valor_deslocamento: valorDeslocamento,
          valor_nota_material: valorNotaMaterial,
          valor_obra_civil: valorObraCivil,
          valor_compras: valorCompras,
          // Valores editáveis
          valor_obra: cliente.valor_obra || 0,
          valor_material: cliente.valor_material || 0
        }
      })

      setMedicaoData(medicaoProcessada)
    } catch (error) {
      console.error('Erro ao carregar dados de medição:', error)
    } finally {
      setMedicaoLoading(false)
    }
  }, [medicaoPeriodo])
  
  // Carregar equipes
  const loadEquipes = async () => {
    try {
      const { data, error } = await supabase
        .from('equipes')
        .select('*')
        .order('nome')
      
      if (error) throw error
      setEquipes(data || [])
    } catch (error) {
      console.error('Erro ao carregar equipes:', error)
    }
  }
  
     // Carregar tipos de serviço
   const loadTiposServico = async () => {
     try {
       const { data, error } = await supabase
         .from('tipo_servico')
         .select('*')
         .eq('ativo', true)
         .order('nome')
       
       if (error) throw error
       setTiposServico(data || [])
     } catch (error) {
       console.error('Erro ao carregar tipos de serviço:', error)
     }
   }
   
          // Carregar tipos de padrão
   const loadTiposPadrao = async () => {
     try {
       const { data, error } = await supabase
         .from('tipo_padrao')
         .select('*')
         .eq('ativo', true)
         .order('nome')
       
       if (error) throw error
       setTiposPadrao(data || [])
     } catch (error) {
       console.error('Erro ao carregar tipos de padrão:', error)
     }
   }
   
   // Carregar status dos clientes
     const loadStatusClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('status_clientes')
        .select('*')
        .eq('ativo', true)
        .order('id')
      
      if (error) throw error
      
      setStatusClientes(data || [])
    } catch (error) {
      console.error('Erro ao carregar status dos clientes:', error)
      setStatusClientes([])
    }
  }
  
  // Carregar usuários instaladores
  const loadUsuariosInstaladores = async () => {
    try {
      // Carregar usuários com role 'instalador' (case-insensitive)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, role')
        .eq('status', 'ativo')
        .ilike('role', 'instalador')
        .order('nome')
      
      if (error) throw error
      setUsuariosInstaladores(data || [])
    } catch (error) {
      console.error('Erro ao carregar usuários instaladores:', error)
      setUsuariosInstaladores([])
    }
  }
  
  // Carregar medição quando acessar a tela
  useEffect(() => {
    if (currentView === 'medicao' && userRole) {
      loadMedicao()
    }
  }, [currentView, userRole, loadMedicao])
  
  // Carregar responsáveis de um cliente
  const loadResponsaveisCliente = async (clienteId) => {
    try {
      const { data, error } = await supabase
        .from('clientes_usuarios')
        .select('profile_id')
        .eq('cliente_id', clienteId)
        .eq('ativo', true)
      
      if (error) {
        console.error('❌ Erro na query de responsáveis:', error)
        throw error
      }
      
      // Retornar array de IDs dos responsáveis
      const responsaveisIds = data ? data.map(item => item.profile_id) : []
      
      return responsaveisIds
    } catch (error) {
      console.error('❌ Erro ao carregar responsáveis do cliente:', error)
      return []
    }
  }
  
  // Debounce para evitar múltiplas chamadas simultâneas
  const [loadClientesTimeout, setLoadClientesTimeout] = useState(null)

  // Carregar clientes com debounce
  const loadClientes = useCallback(async () => {
    // Cancelar timeout anterior se existir
    if (loadClientesTimeout) {
      clearTimeout(loadClientesTimeout)
    }

    // Criar novo timeout
    const timeout = setTimeout(async () => {
      try {
        // Com RLS habilitado, a consulta será automaticamente filtrada
        // baseada nas políticas de segurança do usuário logado
        const { data, error } = await supabase
          .from('clientes')
          .select(`
            *,
            tipo_servico:tipo_servico(nome),
            tipo_padrao:tipo_padrao(nome),
            equipe:equipes(nome),
            status_info:status_clientes(status)
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        setClientes(data || [])
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
      }
    }, 100) // Delay de 100ms

    setLoadClientesTimeout(timeout)
  }, [loadClientesTimeout])


  
  // Debounce para presenças
  const [loadPresencasTimeout, setLoadPresencasTimeout] = useState(null)

  // Carregar presenças com debounce
  const loadPresencas = useCallback(async () => {
    // Cancelar timeout anterior se existir
    if (loadPresencasTimeout) {
      clearTimeout(loadPresencasTimeout)
    }

    // Criar novo timeout
    const timeout = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('presenca')
          .select(`
            *,
            cliente:cliente_id(nome_cliente),
            equipe:equipe_id(nome),
            veiculo:veiculo_id(veiculo, placa)
          `)
          .order('data_presenca', { ascending: false })
        
        if (error) throw error
        
        // Carregar colaboradores para cada presença
        if (data && data.length > 0) {
          const presencasComColaboradores = await Promise.all(
            data.map(async (presenca) => {
              const { data: colaboradoresData, error: colaboradoresError } = await supabase
                .from('presenca_colaboradores')
                .select(`
                  colaborador_id,
                  colaborador:colaborador_id(id, nome, cargo)
                `)
                .eq('presenca_id', presenca.id)
              
              if (colaboradoresError) {
                console.error('Erro ao carregar colaboradores da presença:', colaboradoresError)
                return { ...presenca, colaboradores: [] }
              }
              
              return {
                ...presenca,
                colaboradores: colaboradoresData?.map(c => c.colaborador_id) || []
              }
            })
          )
          
          setPresencas(presencasComColaboradores)
        } else {
          setPresencas([])
        }
      } catch (error) {
        console.error('Erro ao carregar presenças:', error)
        setPresencas([])
      }
    }, 100) // Delay de 100ms

    setLoadPresencasTimeout(timeout)
  }, [loadPresencasTimeout])

  // Carregar colaboradores
  const loadColaboradores = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*')
        .order('nome', { ascending: true })
      
      if (error) throw error
      setColaboradores(data || [])
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error)
      setColaboradores([])
    }
  }, [])

  // Carregar usuários
  const loadUsuarios = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('nome', { ascending: true })
      
      if (error) throw error
      setUsuarios(data || [])
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      setUsuarios([])
    }
  }, [])

  // Carregar cargos
  const loadCargos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('cargos')
        .select('*')
        .order('cargo', { ascending: true })
      
      if (error) throw error
      setCargos(data || [])
    } catch (error) {
      console.error('Erro ao carregar cargos:', error)
      setCargos([])
    }
  }, [])

  // Carregar veículos
  const loadVeiculos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .order('veiculo', { ascending: true })
      
      if (error) throw error
      setVeiculos(data || [])
      setCarros(data || []) // Também atualiza o estado de carros
    } catch (error) {
      console.error('Erro ao carregar veículos:', error)
      setVeiculos([])
      setCarros([])
    }
  }, [])
  
  // Alias para carregar carros (usa a mesma função de veículos)
  const loadCarros = useCallback(async () => {
    await loadVeiculos()
  }, [loadVeiculos])
  
  // Aplicar filtros aos clientes
  const aplicarFiltrosClientes = useCallback(() => {
    let filtrados = [...clientes]
    
    // Para instaladores, filtrar apenas por status específicos
    if (userRole === 'instalador') {
      filtrados = filtrados.filter(cliente =>
        ['Pendente', 'Em andamento'].includes(cliente.status_info?.status)
      )
    }
    
    if (filtrosCliente.nome_cliente) {
      filtrados = filtrados.filter(cliente =>
        cliente.nome_cliente.toLowerCase().includes(filtrosCliente.nome_cliente.toLowerCase())
      )
    }
    
    if (filtrosCliente.dataInicio) {
      filtrados = filtrados.filter(cliente =>
        cliente.data_instalacao && cliente.data_instalacao >= filtrosCliente.dataInicio
      )
    }
    
    if (filtrosCliente.dataFim) {
      filtrados = filtrados.filter(cliente =>
        cliente.data_instalacao && cliente.data_instalacao <= filtrosCliente.dataFim
      )
    }
    
    if (filtrosCliente.tipoServicoId) {
      filtrados = filtrados.filter(cliente =>
        cliente.tipo_servico_id === filtrosCliente.tipoServicoId
      )
    }
    
    return filtrados
  }, [clientes, filtrosCliente, userRole])
  
  // Clientes filtrados
  const clientesFiltrados = useMemo(() => aplicarFiltrosClientes(), [aplicarFiltrosClientes])
  
  // Abrir formulário de novo cliente
  const openNewClienteForm = () => {
    setEditingCliente(null)
    setClienteFormData({
      nome_cliente: '',
      endereco: '',
      telefone: '',
      data_instalacao: '',
      tipo_servico_id: '',
      tipo_padrao_id: '',
      id_profiles: [],
      equipe_id: '',
      data_cadastro: new Date().toISOString().split('T')[0],
      quantidade_modulos: 0,
      deslocamento_buscar_material: false,
      configuracao_inversor: false,
      obra_civil: false,
      obra_cancelada: false,
      nota_material: false,
      observacoes: '',
      id_status: 1 // Status padrão: Pendente (ID 1)
    })
    setShowClienteForm(true)
  }
  
  // Fechar formulário de cliente
  const closeClienteForm = () => {
    // Se o modal não pode ser fechado (finalização obrigatória), não permitir fechar
    if (clienteModalNaoFechavel) {
      showNotification('Você deve finalizar a obra antes de fechar este modal.', 'warning')
      return
    }
    
    setShowClienteForm(false)
    setEditingCliente(null)
    setClienteFormData({
      nome_cliente: '',
      endereco: '',
      telefone: '',
      data_instalacao: '',
      tipo_servico_id: '',
      tipo_padrao_id: '',
      id_profiles: [],
      equipe_id: '',
      data_cadastro: new Date().toISOString().split('T')[0],
      quantidade_modulos: 0,
      deslocamento_buscar_material: false,
      configuracao_inversor: false,
      obra_civil: false,
      obra_cancelada: false,
      nota_material: false,
      observacoes: '',
      id_status: 1 // Status padrão: Pendente (ID 1)
    })
  }
  
  // Abrir modal de visualização do cliente
  const openClienteModal = (cliente) => {
    setClienteModalData(cliente)
    setShowClienteModal(true)
  }
  
  // Fechar modal de visualização do cliente
  const closeClienteModal = () => {
    setShowClienteModal(false)
    setClienteModalData(null)
  }
  
  // Salvar cliente
  const handleClienteFormSubmit = async (e) => {
    e.preventDefault()
    
    try {
      let clienteId
      
      // Criar uma cópia limpa dos dados do cliente (sem campos de relacionamento)
      const { id_profiles, ...clienteData } = clienteFormData
      
      if (editingCliente) {
        // Atualizar cliente existente
        
        const { error } = await supabase
          .from('clientes')
          .update(clienteData)
          .eq('id', editingCliente.id)
        
        if (error) throw error
        
        clienteId = editingCliente.id
        showNotification('Cliente atualizado com sucesso!', 'success')
      } else {
        // Criar novo cliente
        const { data, error } = await supabase
          .from('clientes')
          .insert([clienteData])
          .select('id')
        
        if (error) throw error
        
        clienteId = data[0].id
        showNotification('Cliente cadastrado com sucesso!', 'success')
      }
      
      // Salvar responsáveis na tabela clientes_usuarios
      if (clienteId && id_profiles && id_profiles.length > 0) {

        
        try {
          // Para edição, usar UPSERT para evitar violação de constraint única
          if (editingCliente) {

            
            // Primeiro, desativar todas as relações existentes
            const { error: deactivateError } = await supabase
              .from('clientes_usuarios')
              .update({ ativo: false })
              .eq('cliente_id', clienteId)
            
            if (deactivateError) {
              console.error('❌ Erro ao desativar relações existentes:', deactivateError)
              throw deactivateError
            }

          }
          
          // Preparar dados para inserção usando UPSERT
          const responsaveisData = id_profiles.map(profileId => ({
            cliente_id: clienteId,
            profile_id: profileId,
            tipo_relacao: 'instalador',
            ativo: true
          }))
          

          
          // Usar UPSERT para inserir/atualizar relações
          // Se houver conflito (mesmo cliente_id, profile_id, tipo_relacao), atualizar
          const { data: insertData, error: responsaveisError } = await supabase
            .from('clientes_usuarios')
            .upsert(responsaveisData, {
              onConflict: 'cliente_id,profile_id,tipo_relacao',
              ignoreDuplicates: false
            })
            .select()
          
          if (responsaveisError) {
            console.error('❌ Erro ao salvar responsáveis:', responsaveisError)
            console.error('❌ Detalhes do erro:', {
              message: responsaveisError.message,
              details: responsaveisError.details,
              hint: responsaveisError.hint,
              code: responsaveisError.code
            })
            showNotification('Cliente salvo, mas houve erro ao salvar responsáveis: ' + responsaveisError.message, 'warning')
          } else {

            showNotification('Cliente e responsáveis salvos com sucesso!', 'success')
          }
        } catch (error) {
          console.error('❌ Erro geral ao salvar responsáveis:', error)
          console.error('❌ Stack trace:', error.stack)
          showNotification('Cliente salvo, mas houve erro ao salvar responsáveis: ' + error.message, 'warning')
        }
      } else {

      }
      
      closeClienteForm()
      loadClientes()
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      showNotification('Erro ao salvar cliente: ' + error.message, 'error')
    }
  }
  
  // Função para editar valores na medição
  const handleEditValorMedicao = async (clienteId, campo, valor) => {
    try {
      // Atualizar o estado local primeiro para feedback imediato
      setMedicaoData(prevData => 
        prevData.map(item => 
          item.id === clienteId 
            ? { ...item, [campo]: valor }
            : item
        )
      )

      // Atualizar no banco de dados
      const { error } = await supabase
        .from('clientes')
        .update({ 
          [campo]: valor,
          data_atualizacao: new Date().toISOString()
        })
        .eq('id', clienteId)

      if (error) throw error

      // Recalcular o total para este cliente
      const clienteAtualizado = medicaoData.find(item => item.id === clienteId)
      if (clienteAtualizado) {
        const novoTotal = (90 * (clienteAtualizado.qtd_modulos || 0)) + 
                         clienteAtualizado.valor_padrao + 
                         clienteAtualizado.valor_inversor + 
                         clienteAtualizado.valor_deslocamento + 
                         clienteAtualizado.valor_nota_material + 
                         (campo === 'valor_obra' ? valor : clienteAtualizado.valor_obra_civil) + 
                         (campo === 'valor_material' ? valor : clienteAtualizado.valor_material)

        // Atualizar o total no estado local
        setMedicaoData(prevData => 
          prevData.map(item => 
            item.id === clienteId 
              ? { ...item, total: novoTotal }
              : item
          )
        )
      }

      showNotification(`Valor ${campo === 'valor_obra' ? 'da obra civil' : 'do material'} atualizado com sucesso!`, 'success')
    } catch (error) {
      console.error('Erro ao atualizar valor:', error)
      showNotification(`Erro ao atualizar valor: ${error.message}`, 'error')
      
      // Reverter mudança no estado local em caso de erro
      setMedicaoData(prevData => 
        prevData.map(item => 
          item.id === clienteId 
            ? { ...item, [campo]: item[campo] }
            : item
        )
      )
    }
  }

  // Editar cliente
  const handleEditCliente = async (cliente) => {
    try {
      // Carregar responsáveis do cliente
      const responsaveisIds = await loadResponsaveisCliente(cliente.id)
      
      // Garantir que o modal pode ser fechado para edição normal
      setClienteModalNaoFechavel(false)
      
      setEditingCliente(cliente)
      const novoFormData = {
        nome_cliente: cliente.nome_cliente || '',
        endereco: cliente.endereco || '',
        telefone: cliente.telefone || '',
        data_instalacao: cliente.data_instalacao || '',
        tipo_servico_id: cliente.tipo_servico_id || '',
        tipo_padrao_id: cliente.tipo_padrao_id || '',
        id_profiles: responsaveisIds,
        equipe_id: cliente.equipe_id || '',
        data_cadastro: cliente.data_cadastro || new Date().toISOString().split('T')[0],
        quantidade_modulos: cliente.quantidade_modulos || 0,
        deslocamento_buscar_material: cliente.deslocamento_buscar_material || false,
        configuracao_inversor: cliente.configuracao_inversor || false,
        obra_civil: cliente.obra_civil || false,
        obra_cancelada: cliente.obra_cancelada || false,
        nota_material: cliente.nota_material || false,
        observacoes: cliente.observacoes || '',
        id_status: cliente.id_status || 1 // Status padrão: Pendente (ID 1)
      }
      
      setClienteFormData(novoFormData)
      
      setShowClienteForm(true)
    } catch (error) {
      console.error('Erro ao carregar responsáveis do cliente:', error)
      showNotification('Erro ao carregar dados do cliente', 'error')
    }
  }
  
  // Excluir cliente
  const handleDeleteCliente = async (cliente) => {
    if (!security.hasPermission(userRole, 'CLIENT_MANAGEMENT', 'REMOVE')) {
      showNotification('Você não tem permissão para excluir clientes.', 'error')
      return
    }
    
    try {
      // Verificar se o cliente tem registros de presença
      const { data: presencas, error: presencaError } = await supabase
        .from('presenca')
        .select('id, data_presenca')
        .eq('cliente_id', cliente.id)
      
      if (presencaError) throw presencaError
      
      if (presencas && presencas.length > 0) {
        // Cliente tem presenças, mostrar aviso
        setClienteParaExcluir(cliente)
        setPresencasCliente(presencas)
        setShowPresencaWarningModal(true)
        return
      }
      
      // Se não tem presenças, confirmar exclusão normal
      if (!window.confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome_cliente}"?`)) {
        return
      }
      
      // Excluir cliente (não tem presenças)
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', cliente.id)
      
      if (error) throw error
      
      showNotification('Cliente excluído com sucesso!', 'success')
      loadClientes()
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      
      if (error.message.includes('foreign key constraint')) {
        showNotification(`Erro ao excluir cliente: Este cliente possui registros de presença relacionados. 
        Exclua primeiro os registros de presença.`, 'error')
      } else {
        showNotification('Erro ao excluir cliente: ' + error.message, 'error')
      }
    }
  }
  
  // Fechar modal de aviso de presenças
  const closePresencaWarningModal = () => {
    setShowPresencaWarningModal(false)
    setClienteParaExcluir(null)
    setPresencasCliente([])
  }
  
  // Excluir presenças e cliente
  const handleDeletePresencasAndCliente = async () => {
    if (!clienteParaExcluir) return
    
    try {
      // Primeiro excluir as presenças
      const { error: deletePresencaError } = await supabase
        .from('presenca')
        .delete()
        .eq('cliente_id', clienteParaExcluir.id)
      
      if (deletePresencaError) throw deletePresencaError
      
      showNotification(`${presencasCliente.length} registro(s) de presença excluído(s) com sucesso.`, 'success')
      
      // Depois excluir o cliente
      const { error: deleteClienteError } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteParaExcluir.id)
      
      if (deleteClienteError) throw deleteClienteError
      
      showNotification('Cliente excluído com sucesso!', 'success')
      loadClientes()
      closePresencaWarningModal()
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      showNotification('Erro ao excluir cliente: ' + error.message, 'error')
    }
  }
  
  // Abrir formulário de presença
  const openNewPresencaForm = (cliente = null, obrigatorio = false) => {
    setEditingPresenca(null)
    setPresencaFormData({
      data_presenca: new Date().toISOString().split('T')[0],
      data_cadastro_preenchido: new Date().toISOString().split('T')[0],
      cliente_id: cliente ? cliente.id : '',
      equipe_id: '',
      veiculo_id: '',
      km_inicial: '',
      observacoes: '',
      colaboradores: [] // Inicializar array vazio de colaboradores
    })
    setShowPresencaForm(true)
  }
  
  // Fechar formulário de presença
  const closePresencaForm = () => {
    // Se o modal não pode ser fechado (presença obrigatória), não permitir fechar
    if (presencaModalNaoFechavel) {
      showNotification('Você deve preencher a lista de presença antes de fechar este modal.', 'warning')
      return
    }
    
    setShowPresencaForm(false)
    setEditingPresenca(null)
    setPresencaFormData({
      data_presenca: '',
      data_cadastro_preenchido: '',
      cliente_id: '',
      equipe_id: '',
      veiculo_id: '',
      km_inicial: '',
      observacoes: '',
      colaboradores: []
    })
  }
  
  // Salvar presença
  const handlePresencaFormSubmit = async (e) => {
    e.preventDefault()
    
    // Prevenir múltiplos cliques
    const submitButton = e.target.querySelector('button[type="submit"]')
    if (submitButton) {
      submitButton.disabled = true
      submitButton.textContent = 'Salvando...'
    }
    
    // Validação: cliente é obrigatório
    if (!presencaFormData.cliente_id) {
      showNotification('Por favor, selecione um cliente.', 'error')
      return
    }
    
    // Validação: veículo é obrigatório
    if (!presencaFormData.veiculo_id) {
      showNotification('Por favor, selecione um carro/veículo.', 'error')
      return
    }
    
    // Validação: pelo menos um colaborador deve ser selecionado
    if (!presencaFormData.colaboradores || presencaFormData.colaboradores.length === 0) {
      showNotification('Por favor, selecione pelo menos um colaborador.', 'error')
      return
    }
    
    try {
      let presencaId
      
      // Preparar dados para salvar
      const dadosParaSalvar = {
        data_presenca: presencaFormData.data_presenca,
        data_cadastro_preenchido: presencaFormData.data_cadastro_preenchido,
        cliente_id: presencaFormData.cliente_id,
        equipe_id: presencaFormData.equipe_id,
        veiculo_id: presencaFormData.veiculo_id,
        km_inicial: presencaFormData.km_inicial,
        observacoes: presencaFormData.observacoes
      }
      
      if (editingPresenca) {
        // Atualizar presença existente
        const { error } = await supabase
          .from('presenca')
          .update(dadosParaSalvar)
          .eq('id', editingPresenca.id)
        
        if (error) throw error
        
        presencaId = editingPresenca.id
        showNotification('Presença atualizada com sucesso!', 'success')
      } else {
        // Criar nova presença
        const { data, error } = await supabase
          .from('presenca')
          .insert([dadosParaSalvar])
          .select('id')
        
        if (error) throw error
        
        presencaId = data[0].id
        showNotification('Presença cadastrada com sucesso!', 'success')
      }
      
      // Salvar colaboradores na tabela presenca_colaboradores
      if (presencaId && presencaFormData.colaboradores && presencaFormData.colaboradores.length > 0) {
        try {
          // Se for edição, primeiro deletar colaboradores existentes
          if (editingPresenca) {
            const { error: deleteError } = await supabase
              .from('presenca_colaboradores')
              .delete()
              .eq('presenca_id', presencaId)
            
            if (deleteError) {
              console.error('Erro ao deletar colaboradores existentes:', deleteError)
              throw deleteError
            }
          }
          
          // Inserir novos colaboradores
          const colaboradoresData = presencaFormData.colaboradores.map(colaboradorId => ({
            presenca_id: presencaId,
            colaborador_id: colaboradorId,
            presente: true, // Por padrão, todos estão presentes
            observacoes: 'Presente'
          }))
          
          const { error: colaboradoresError } = await supabase
            .from('presenca_colaboradores')
            .insert(colaboradoresData)
          
          if (colaboradoresError) {
            console.error('Erro ao salvar colaboradores:', colaboradoresError)
            throw colaboradoresError
          }
          
  
        } catch (error) {
          console.error('Erro ao salvar colaboradores:', error)
          showNotification('Presença salva, mas houve erro ao salvar colaboradores: ' + error.message, 'warning')
        }
      }
      
      // Fechar o modal automaticamente após salvar com sucesso
      if (presencaModalNaoFechavel) {
        // Se era obrigatório, permitir fechar e fechar automaticamente
        setPresencaModalNaoFechavel(false)
        showNotification('Lista de presença salva com sucesso! Modal será fechado automaticamente.', 'success')
        
        // Fechar o modal automaticamente após 2 segundos para o usuário ver a mensagem
        setTimeout(() => {
          // Fechar modal diretamente sem usar closePresencaForm
          setShowPresencaForm(false)
          setEditingPresenca(null)
          setPresencaFormData({
            data_presenca: '',
            data_cadastro_preenchido: '',
            cliente_id: '',
            equipe_id: '',
            veiculo_id: '',
            km_inicial: '',
            observacoes: '',
            colaboradores: []
          })
        }, 2000)
      } else {
        // Se não era obrigatório, fechar normalmente
        closePresencaForm()
      }
      
      // Reabilitar botão após sucesso
      const submitButton = e.target.querySelector('button[type="submit"]')
      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent = editingPresenca ? 'Atualizar' : 'Cadastrar' + ' Presença'
      }
      loadPresencas()
    } catch (error) {
      console.error('Erro ao salvar presença:', error)
      showNotification('Erro ao salvar presença: ' + error.message, 'error')
      
      // Reabilitar botão em caso de erro
      const submitButton = e.target.querySelector('button[type="submit"]')
      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent = editingPresenca ? 'Atualizar' : 'Cadastrar' + ' Presença'
      }
    }
  }
  
  // Renderizar dashboard
  const renderDashboard = () => (
    <div className="menu-content dashboard-enhanced">
      <div className="menu-header">
        <div className="welcome-section">
          <h2>🎉 Bem-vindo ao TecSol Sistema</h2>
          <p className="welcome-subtitle">Sistema completo de gestão para sua empresa</p>
          <div className="welcome-time">
            <span className="time-icon">🕐</span>
            <span>{new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{clientes.length}</h3>
            <p>Total de Clientes</p>
            <span className="stat-trend">📈 Ativos no sistema</span>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{presencas.length}</h3>
            <p>Presenças Registradas</p>
            <span className="stat-trend">📅 Controle de frequência</span>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">👷</div>
          <div className="stat-content">
            <h3>{colaboradores.length}</h3>
            <p>Colaboradores</p>
            <span className="stat-trend">⚡ Equipe ativa</span>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <h3>{veiculos.length}</h3>
            <p>Veículos</p>
            <span className="stat-trend">🛣️ Frota disponível</span>
          </div>
        </div>
        
        <div className="stat-card secondary">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{cargos.length}</h3>
            <p>Cargos</p>
            <span className="stat-trend">👔 Estrutura organizacional</span>
          </div>
        </div>
        
        {security.canManageUsers(userRole) && (
          <div className="stat-card accent">
            <div className="stat-icon">👤</div>
            <div className="stat-content">
              <h3>{usuarios.length}</h3>
              <p>Usuários</p>
              <span className="stat-trend">🔐 Acesso ao sistema</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="dashboard-sections">
        <div className="section-row">
          <div className="quick-actions-section">
            <h3>🚀 Ações Rápidas</h3>
            <div className="quick-actions-grid">
              <button 
                onClick={() => setCurrentView('clientes')} 
                className="quick-action-card"
              >
                <div className="action-icon">➕</div>
                <span>Novo Cliente</span>
              </button>
              
              <button 
                onClick={() => setCurrentView('presenca')} 
                className="quick-action-card"
              >
                <div className="action-icon">📅</div>
                <span>Nova Presença</span>
              </button>
              
              <button 
                onClick={() => setCurrentView('colaboradores')} 
                className="quick-action-card"
              >
                <div className="action-icon">👷</div>
                <span>Novo Colaborador</span>
              </button>
              
              {security.canManageUsers(userRole) && (
                <button 
                  onClick={() => setCurrentView('usuarios')} 
                  className="quick-action-card"
                >
                  <div className="action-icon">👤</div>
                  <span>Novo Usuário</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="system-info-section">
            <h3>ℹ️ Informações do Sistema</h3>
            <div className="info-cards">
              <div className="info-card">
                <div className="info-icon">🔒</div>
                <div className="info-content">
                  <h4>Segurança</h4>
                  <p>Sistema protegido com autenticação avançada</p>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-icon">📱</div>
                <div className="info-content">
                  <h4>Responsivo</h4>
                  <p>Interface adaptável para todos os dispositivos</p>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-icon">⚡</div>
                <div className="info-content">
                  <h4>Performance</h4>
                  <p>Otimizado para máxima velocidade</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="recent-activity-section">
          <h3>📊 Atividade Recente</h3>
          <div className="activity-summary">
            <div className="activity-item">
              <span className="activity-icon">👥</span>
              <span className="activity-text">
                <strong>{clientes.filter(c => c.status_info?.status === 'Pendente').length}</strong> clientes pendentes
              </span>
            </div>
            
            <div className="activity-item">
              <span className="activity-icon">📅</span>
              <span className="activity-text">
                <strong>{presencas.filter(p => {
                  const presencaDate = new Date(p.data_presenca);
                  const today = new Date();
                  const diffTime = Math.abs(today - presencaDate);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 7;
                }).length}</strong> presenças esta semana
              </span>
            </div>
            
            <div className="activity-item">
              <span className="activity-icon">👷</span>
              <span className="activity-text">
                <strong>{colaboradores.filter(c => c.ativo).length}</strong> colaboradores ativos
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-footer">
        <p className="dashboard-description">
          💡 <strong>Dica:</strong> Use o menu de navegação acima para acessar todas as funcionalidades do sistema.
        </p>
        <div className="footer-stats">
          <span className="footer-stat">🔄 Última atualização: {new Date().toLocaleTimeString('pt-BR')}</span>
          <span className="footer-stat">👤 Logado como: {user?.nome || user?.email}</span>
        </div>
      </div>
    </div>
  )
  
  // Renderizar lista de clientes
  const renderClientes = () => {
    // Verificar se o usuário tem permissão para visualizar clientes (apenas administrador, administrativo ou instalador)
    if (!['administrador', 'administrativo', 'instalador'].includes(userRole)) {
      return (
        <div className="menu-content">
          <div className="menu-header">
            <h2>Cadastro de Clientes</h2>
            <button onClick={() => setCurrentView('dashboard')} className="back-button">
              ← Voltar ao Dashboard
            </button>
          </div>
          
          <div className="access-denied-message">
            <div className="access-denied-icon">🚫</div>
            <h3>Acesso Negado</h3>
            <p>Você não tem permissão para visualizar esta seção.</p>
            <p>Apenas usuários com perfil Administrador, Administrativo ou Instalador podem acessar o cadastro de clientes.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="menu-content">
        <div className="menu-header">
          <h2>{userRole === 'instalador' ? 'Meus Clientes' : 'Cadastro de Clientes'}</h2>
          {userRole !== 'instalador' && (
            <button onClick={() => setCurrentView('dashboard')} className="back-button">
              ← Voltar ao Dashboard
            </button>
          )}
        </div>
        
        {userRole !== 'instalador' && (
          <div className="clientes-actions">
            <button onClick={openNewClienteForm} className="action-button primary">
              ➕ Cadastrar Novo Cliente
            </button>
          </div>
        )}
        
        {/* Filtros de Pesquisa */}
        <div className="filtros-container">
          <h3>🔍 Filtros de Pesquisa</h3>
          <div className="filtros-grid">
            <div className="filtro-item">
              <label htmlFor="filtro-nome">Nome do Cliente:</label>
              <input
                type="text"
                id="filtro-nome"
                value={filtrosCliente.nome_cliente}
                onChange={(e) => setFiltrosCliente({...filtrosCliente, nome_cliente: e.target.value})}
                placeholder="Digite o nome do cliente"
              />
            </div>
            
            {userRole !== 'instalador' && (
              <>
                <div className="filtro-item">
                  <label htmlFor="filtro-data-inicio">Data de Instalação - Início:</label>
                  <input
                    type="date"
                    id="filtro-data-inicio"
                    value={filtrosCliente.dataInicio}
                    onChange={(e) => setFiltrosCliente({...filtrosCliente, dataInicio: e.target.value})}
                  />
                </div>
                
                <div className="filtro-item">
                  <label htmlFor="filtro-data-fim">Data de Instalação - Fim:</label>
                  <input
                    type="date"
                    id="filtro-data-fim"
                    value={filtrosCliente.dataFim}
                    onChange={(e) => setFiltrosCliente({...filtrosCliente, dataFim: e.target.value})}
                  />
                </div>
                
                <div className="filtro-item">
                  <label htmlFor="filtro-tipo-servico">Tipo de Serviço:</label>
                  <select
                    id="filtro-tipo-servico"
                    value={filtrosCliente.tipoServicoId}
                    onChange={(e) => setFiltrosCliente({...filtrosCliente, tipoServicoId: e.target.value})}
                  >
                    <option value="">Todos os tipos</option>
                    {tiposServico.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="clientes-list">
          <h3>{userRole === 'instalador' ? 'Meus Clientes' : 'Clientes Cadastrados'} ({clientesFiltrados.length} de {clientes.length})</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome do Cliente</th>
                  <th>Data da Instalação</th>
                  <th>Tipo de Serviço</th>
                  <th>Tipo de Padrão</th>
                  <th>Quantidade de Módulos</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      {clientes.length === 0 ? 'Nenhum cliente cadastrado ainda.' : 'Nenhum cliente encontrado com os filtros aplicados.'}
                    </td>
                  </tr>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>
                        <button 
                          onClick={() => openClienteModal(cliente)} 
                          className="cliente-name-button"
                          title="Clique para ver detalhes do cliente"
                        >
                          {cliente.nome_cliente}
                        </button>
                      </td>
                      <td>{formatarData(cliente.data_instalacao)}</td>
                      <td>{cliente.tipo_servico?.nome || 'N/A'}</td>
                      <td>{cliente.tipo_padrao?.nome || 'N/A'}</td>
                      <td>{cliente.quantidade_modulos || 'N/A'}</td>
                      <td>
                        <span className={`status-badge status-${cliente.status_info?.status?.toLowerCase() || 'pendente'}`}>
                          {cliente.status_info?.status === 'Pendente' ? '⏳ Pendente' : 
                           cliente.status_info?.status === 'Em andamento' ? '🔄 Em Andamento' : 
                           cliente.status_info?.status === 'Finalizado' ? '✅ Finalizado' : 
                           cliente.status_info?.status === 'Validado' ? '🔍 Validado' : 
                           '⏳ Pendente'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {/* Botão Iniciar Obra - apenas para clientes Pendentes */}
                          {userRole === 'instalador' && cliente.status_info?.status === 'Pendente' && (
                            <button 
                              onClick={() => handleIniciarObra(cliente)} 
                              className="action-btn small primary"
                              title="Iniciar obra"
                            >
                              🚀 Iniciar Obra
                            </button>
                          )}
                          
                          {/* Botão Finalizar - apenas para clientes Em andamento */}
                          {userRole === 'instalador' && cliente.status_info?.status === 'Em andamento' && (
                            <button 
                              onClick={() => handleFinalizarObra(cliente)} 
                              className="action-btn small success"
                              title="Finalizar obra"
                            >
                              ✅ Finalizar
                            </button>
                          )}
                          
                          {security.hasPermission(userRole, 'CLIENT_MANAGEMENT', 'EDIT') && (
                            <button 
                              onClick={() => handleEditCliente(cliente)} 
                              className="action-btn small"
                              title="Editar cliente"
                            >
                              ✏️ Editar
                            </button>
                          )}
                          
                          {security.canRemoveClient(userRole) && (
                            <button 
                              onClick={() => handleDeleteCliente(cliente)} 
                              className="action-btn small danger"
                              title="Excluir cliente"
                            >
                              🗑️ Remover
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
  
  // Renderizar lista de colaboradores
  const renderColaboradores = () => (
    <div className="menu-content">
      <div className="menu-header">
        <h2>Gerenciamento de Colaboradores</h2>
        <button onClick={() => setCurrentView('dashboard')} className="back-button">
          ← Voltar ao Dashboard
        </button>
      </div>
      
             <div className="colaboradores-actions">
         <button onClick={() => {
           // Garantir que os cargos estejam carregados antes de abrir o formulário
           if (cargos.length === 0) {
             loadCargos()
           }
           setShowColaboradorForm(true)
         }} className="action-button primary">
           ➕ Novo Colaborador
         </button>
       </div>
      
      <div className="colaboradores-list">
        <h3>Colaboradores ({colaboradores.length})</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cargo</th>
                <th>Email</th>
                <th>Chave PIX</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {colaboradores.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    Nenhum colaborador cadastrado ainda.
                  </td>
                </tr>
              ) : (
                colaboradores.map((colaborador) => (
                  <tr key={colaborador.id}>
                    <td>{colaborador.nome}</td>
                    <td>{colaborador.cargo}</td>
                    <td>{colaborador.email || 'N/A'}</td>
                    <td>{colaborador.chave_pix || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${colaborador.ativo ? 'status-ativo' : 'status-inativo'}`}>
                        {colaborador.ativo ? '✅ Ativo' : '❌ Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                                                 <button 
                           onClick={() => {
                             // Garantir que os cargos estejam carregados antes de abrir o formulário
                             if (cargos.length === 0) {
                               loadCargos()
                             }
                             handleEditColaborador(colaborador)
                           }} 
                           className="action-btn small"
                           title="Editar colaborador"
                         >
                           ✏️ Editar
                         </button>
                        <button 
                          onClick={() => handleDeleteColaborador(colaborador)} 
                          className="action-btn small danger"
                          title="Excluir colaborador"
                        >
                          🗑️ Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // Renderizar lista de usuários
  const renderUsuarios = () => (
    <div className="menu-content">
      <div className="menu-header">
        <h2>Gerenciamento de Usuários</h2>
        <button onClick={() => setCurrentView('dashboard')} className="back-button">
          ← Voltar ao Dashboard
        </button>
      </div>
      
      <div className="usuarios-actions">
        <button onClick={() => setShowUsuarioForm(true)} className="action-button primary">
          ➕ Novo Usuário
        </button>
      </div>
      
      <div className="usuarios-list">
        <h3>Usuários ({usuarios.length})</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Função</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    Nenhum usuário cadastrado ainda.
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.nome}</td>
                    <td>{usuario.email}</td>
                                         <td>
                       <span className={`role-badge role-${usuario.role?.toLowerCase() || 'usuario'}`}>
                         {usuario.role || 'N/A'}
                       </span>
                     </td>
                    <td>
                      <span className={`status-badge ${usuario.status === 'ativo' ? 'status-ativo' : 'status-inativo'}`}>
                        {usuario.status === 'ativo' ? '✅ Ativo' : '❌ Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEditUsuario(usuario)} 
                          className="action-btn small"
                          title="Editar usuário"
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteUsuario(usuario)} 
                          className="action-btn small danger"
                          title="Excluir usuário"
                        >
                          🗑️ Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // Renderizar lista de cargos
  const renderCargos = () => (
    <div className="menu-content">
      <div className="menu-header">
        <h2>Gerenciamento de Cargos</h2>
        <button onClick={() => setCurrentView('dashboard')} className="back-button">
          ← Voltar ao Dashboard
        </button>
      </div>
      
             <div className="cargos-actions">
         <button onClick={() => setShowCargoForm(true)} className="action-button primary">
           ➕ Novo Cargo
         </button>
         {!isAdministrador() && (
           <div className="security-notice">
             <span className="security-icon">🔒</span>
             <span>Nota: Apenas administradores podem criar cargos de "administrador" e "administrativo"</span>
           </div>
         )}
       </div>
      
      <div className="cargos-list">
        <h3>Cargos ({cargos.length})</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cargo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {cargos.length === 0 ? (
                <tr>
                  <td colSpan="3" className="no-data">
                    Nenhum cargo cadastrado ainda.
                  </td>
                </tr>
              ) : (
                cargos.map((cargo) => (
                  <tr key={cargo.id}>
                    <td>{cargo.cargo}</td>
                    <td>
                      <span className={`status-badge ${cargo.ativo ? 'status-ativo' : 'status-inativo'}`}>
                        {cargo.ativo ? '✅ Ativo' : '❌ Inativo'}
                      </span>
                    </td>
                                         <td>
                       <div className="action-buttons">
                         {podeGerenciarCargo(cargo.cargo) ? (
                           <>
                             <button 
                               onClick={() => handleEditCargo(cargo)} 
                               className="action-btn small"
                               title="Editar cargo"
                             >
                               ✏️ Editar
                             </button>
                             <button 
                               onClick={() => handleDeleteCargo(cargo)} 
                               className="action-btn small danger"
                               title="Excluir cargo"
                             >
                               🗑️ Remover
                             </button>
                           </>
                         ) : (
                           <span className="permission-notice" title="Apenas administradores podem gerenciar este cargo">
                             🔒 Sem permissão
                           </span>
                         )}
                       </div>
                     </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

     // Renderizar lista de veículos
   const renderVeiculos = () => (
     <div className="menu-content">
       <div className="menu-header">
         <h2>Gerenciamento de Veículos</h2>
         <button onClick={() => setCurrentView('dashboard')} className="back-button">
           ← Voltar ao Dashboard
         </button>
       </div>
       
       <div className="veiculos-actions">
         <button onClick={() => setShowVeiculoForm(true)} className="action-button primary">
           ➕ Novo Veículo
         </button>
       </div>
       
       <div className="veiculos-list">
         <h3>Veículos ({veiculos.length})</h3>
         <div className="table-container">
           <table className="data-table">
             <thead>
               <tr>
                 <th>Veículo</th>
                 <th>Placa</th>
                 <th>Status</th>
                 <th>Ações</th>
               </tr>
             </thead>
             <tbody>
               {veiculos.length === 0 ? (
                 <tr>
                   <td colSpan="4" className="no-data">
                     Nenhum veículo cadastrado ainda.
                   </td>
                 </tr>
               ) : (
                 veiculos.map((veiculo) => (
                   <tr key={veiculo.id}>
                     <td>{veiculo.veiculo}</td>
                     <td>{veiculo.placa}</td>
                     <td>
                       <span className={`status-badge ${veiculo.ativo ? 'status-ativo' : 'status-inativo'}`}>
                         {veiculo.ativo ? '✅ Ativo' : '❌ Inativo'}
                       </span>
                     </td>
                     <td>
                       <div className="action-buttons">
                         <button 
                           onClick={() => handleEditVeiculo(veiculo)} 
                           className="action-btn small"
                           title="Editar veículo"
                         >
                           ✏️ Editar
                         </button>
                         <button 
                           onClick={() => handleDeleteVeiculo(veiculo)} 
                           className="action-btn small danger"
                           title="Excluir veículo"
                         >
                           🗑️ Remover
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
         </div>
       </div>
     </div>
   )
   
   // Renderizar lista de tipos de serviço
   const renderTiposServico = () => (
     <div className="menu-content">
       <div className="menu-header">
         <h2>Gerenciamento de Tipos de Serviço</h2>
         <button onClick={() => setCurrentView('dashboard')} className="back-button">
           ← Voltar ao Dashboard
         </button>
       </div>
       
       <div className="tipos-servico-actions">
         <button onClick={() => setShowTipoServicoForm(true)} className="action-button primary">
           ➕ Novo Tipo de Serviço
         </button>
       </div>
       
       <div className="tipos-servico-list">
         <h3>Tipos de Serviço ({tiposServico.length})</h3>
         <div className="table-container">
           <table className="data-table">
             <thead>
               <tr>
                 <th>Nome</th>
                 <th>Status</th>
                 <th>Ações</th>
               </tr>
             </thead>
             <tbody>
               {tiposServico.length === 0 ? (
                 <tr>
                   <td colSpan="3" className="no-data">
                     Nenhum tipo de serviço cadastrado ainda.
                   </td>
                 </tr>
               ) : (
                 tiposServico.map((tipo) => (
                   <tr key={tipo.id}>
                     <td>{tipo.nome}</td>
                     <td>
                       <span className={`status-badge ${tipo.ativo ? 'status-ativo' : 'status-inativo'}`}>
                         {tipo.ativo ? '✅ Ativo' : '❌ Inativo'}
                       </span>
                     </td>
                     <td>
                       <div className="action-buttons">
                         <button 
                           onClick={() => handleEditTipoServico(tipo)} 
                           className="action-btn small"
                           title="Editar tipo de serviço"
                         >
                           ✏️ Editar
                         </button>
                         <button 
                           onClick={() => handleDeleteTipoServico(tipo)} 
                           className="action-btn small danger"
                           title="Excluir tipo de serviço"
                         >
                           🗑️ Remover
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
         </div>
       </div>
     </div>
   )
   
   // Renderizar lista de tipos de padrão
   const renderTiposPadrao = () => (
     <div className="menu-content">
       <div className="menu-header">
         <h2>Gerenciamento de Tipos de Padrão</h2>
         <button onClick={() => setCurrentView('dashboard')} className="back-button">
           ← Voltar ao Dashboard
         </button>
       </div>
       
       <div className="tipos-padrao-actions">
         <button onClick={() => setShowTipoPadraoForm(true)} className="action-button primary">
           ➕ Novo Tipo de Padrão
         </button>
       </div>
       
       <div className="tipos-padrao-list">
         <h3>Tipos de Padrão ({tiposPadrao.length})</h3>
         <div className="table-container">
           <table className="data-table">
             <thead>
               <tr>
                 <th>Nome</th>
                 <th>Status</th>
                 <th>Ações</th>
               </tr>
             </thead>
             <tbody>
               {tiposPadrao.length === 0 ? (
                 <tr>
                   <td colSpan="3" className="no-data">
                     Nenhum tipo de padrão cadastrado ainda.
                   </td>
                 </tr>
               ) : (
                 tiposPadrao.map((tipo) => (
                   <tr key={tipo.id}>
                     <td>{tipo.nome}</td>
                     <td>
                       <span className={`status-badge ${tipo.ativo ? 'status-ativo' : 'status-inativo'}`}>
                         {tipo.ativo ? '✅ Ativo' : '❌ Inativo'}
                       </span>
                     </td>
                     <td>
                       <div className="action-buttons">
                         <button 
                           onClick={() => handleEditTipoPadrao(tipo)} 
                           className="action-btn small"
                           title="Editar tipo de padrão"
                         >
                           ✏️ Editar
                         </button>
                         <button 
                           onClick={() => handleDeleteTipoPadrao(tipo)} 
                           className="action-btn small danger"
                           title="Excluir tipo de padrão"
                         >
                           🗑️ Remover
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
         </div>
       </div>
     </div>
   )
   
   // Renderizar tela de medição
   const renderMedicao = () => (
     <div className="menu-content">
       <div className="menu-header">
         <h2>📊 Medição de Clientes</h2>
         <button onClick={() => setCurrentView('dashboard')} className="back-button">
           ← Voltar ao Dashboard
         </button>
       </div>
       
       <div className="medicao-controls">
         <div className="periodo-selector">
           <label htmlFor="periodo-inicio">Período de:</label>
           <input
             type="date"
             id="periodo-inicio"
             value={medicaoPeriodo.inicio}
             onChange={(e) => setMedicaoPeriodo(prev => ({ ...prev, inicio: e.target.value }))}
           />
           <label htmlFor="periodo-fim">até:</label>
           <input
             type="date"
             id="periodo-fim"
             value={medicaoPeriodo.fim}
             onChange={(e) => setMedicaoPeriodo(prev => ({ ...prev, fim: e.target.value }))}
           />
           <button onClick={loadMedicao} className="action-button primary">
             🔍 Buscar
           </button>
         </div>
         
         {security.canExportMedicao(userRole) && (
           <div className="export-controls">
             <button onClick={() => exportarMedicaoCSV()} className="action-button secondary">
               📄 Exportar CSV
             </button>
             <button onClick={() => exportarMedicaoExcel()} className="action-button secondary">
               📊 Exportar Excel
             </button>
           </div>
         )}
       </div>
       
       <div className="medicao-summary">
         <div className="summary-card">
           <h4>Total de Clientes</h4>
           <span className="summary-value">{medicaoData.length}</span>
         </div>
         <div className="summary-card">
           <h4>Valor Total</h4>
           <span className="summary-value">
             R$ {medicaoData.reduce((sum, item) => sum + item.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
           </span>
         </div>
         <div className="summary-card">
           <h4>Módulos Totais</h4>
           <span className="summary-value">
             {medicaoData.reduce((sum, item) => sum + item.qtd_modulos, 0)}
           </span>
         </div>
         <div className="summary-card compras-card">
           <h4>Total de Compras TecSol</h4>
           <span className="summary-value compras-value">
             R$ {medicaoData.reduce((sum, item) => sum + (item.valor_compras || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
           </span>
         </div>
       </div>
       
       <div className="medicao-list">
         <h3>Dados de Medição ({medicaoData.length})</h3>
         {medicaoLoading ? (
           <div className="loading-container">
             <div className="loading-spinner"></div>
             <p>Carregando dados de medição...</p>
           </div>
         ) : (
           <div className="table-container">
             <table className="data-table medicao-table">
               <thead>
                 <tr>
                   <th>CLIENTE</th>
                   <th>DATA DE INSTALAÇÃO</th>
                   <th>TIPO DE SERVIÇO</th>
                   <th>QTD MÓDULOS</th>
                   <th>PADRÃO</th>
                   <th>CONFIG. INVERSOR</th>
                   <th>DESLOCAMENTO</th>
                   <th>NOTA MATERIAL</th>
                   <th>OBRA CIVIL</th>
                   <th>VALOR OBRA</th>
                   <th>VALOR MATERIAL</th>
                   <th>COMPRAS</th>
                   <th>TOTAL</th>
                   <th>OBSERVAÇÃO</th>
                 </tr>
               </thead>
               <tbody>
                 {medicaoData.length === 0 ? (
                   <tr>
                                        <td colSpan="14" className="no-data">
                     Nenhum dado de medição encontrado para o período selecionado.
                   </td>
                   </tr>
                 ) : (
                   medicaoData.map((item) => (
                     <tr key={item.id}>
                       <td>{item.cliente}</td>
                       <td>{item.data ? new Date(item.data).toLocaleDateString('pt-BR') : 'N/A'}</td>
                       <td>{item.tipo_servico}</td>
                       <td className="text-center">{item.qtd_modulos}</td>
                       <td>{item.padrao}</td>
                       <td className="text-center">{item.configuracao_inversor}</td>
                       <td className="text-center">{item.deslocamento_buscar_material}</td>
                       <td className="text-center">{item.nota_material}</td>
                       <td className="text-center">{item.obra_civil}</td>
                       <td className="text-center">
                         <div className="valor-container">
                           <span className="valor-prefix">R$</span>
                           <input
                             type="number"
                             value={item.valor_obra}
                             onChange={(e) => handleEditValorMedicao(item.id, 'valor_obra', parseFloat(e.target.value) || 0)}
                             className="valor-input"
                             min="0"
                             step="0.01"
                             title="Editar valor da obra civil"
                             placeholder="0,00"
                           />
                         </div>
                       </td>
                       <td className="text-center">
                         <div className="valor-container">
                           <span className="valor-prefix">R$</span>
                           <input
                             type="number"
                             value={item.valor_material}
                             onChange={(e) => handleEditValorMedicao(item.id, 'valor_material', parseFloat(e.target.value) || 0)}
                             className="valor-input"
                             min="0"
                             step="0.01"
                             title="Editar valor do material"
                             placeholder="0,00"
                           />
                         </div>
                       </td>
                       <td className="text-center compras-value">
                         R$ {item.valor_compras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                       </td>
                       <td className="text-center total-value">
                         R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                       </td>
                       <td className="observacao-cell">{item.observacao}</td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
         )}
       </div>
     </div>
   )

  // Renderizar lista de presenças
  const renderPresenca = () => (
    <div className="menu-content">
      <div className="menu-header">
        <h2>Lista de Presença</h2>
        <button onClick={() => setCurrentView('dashboard')} className="back-button">
          ← Voltar ao Dashboard
        </button>
      </div>
      
      {security.canAccessMenu(userRole, 'presenca') && (
        <div className="presenca-controls">
          <button onClick={openNewPresencaForm} className="action-button primary">
            📅 Nova Lista de Presença
          </button>
          <button onClick={loadPresencas} className="action-button secondary">
            🔄 Atualizar Lista
          </button>
        </div>
      )}
      
      <div className="presenca-list">
        <h3>Presenças Registradas ({presencas.length})</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data da Presença</th>
                <th>Cliente</th>
                <th>Equipe</th>
                <th>Carro/Veículo</th>
                <th>KM Inicial</th>
                <th>Colaboradores</th>
                <th>Observações</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {presencas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    Nenhuma presença registrada ainda.
                  </td>
                </tr>
              ) : (
                presencas.map((presenca) => (
                  <tr key={presenca.id}>
                    <td>{formatarData(presenca.data_presenca)}</td>
                    <td>{presenca.cliente?.nome_cliente || 'N/A'}</td>
                    <td>{presenca.equipe?.nome || 'N/A'}</td>
                    <td>
                      {presenca.veiculo ? (
                        <span className="veiculo-info">
                          {presenca.veiculo.veiculo} - {presenca.veiculo.placa}
                        </span>
                      ) : (
                        <span className="no-veiculo">Nenhum veículo</span>
                      )}
                    </td>
                    <td>
                      {presenca.km_inicial ? (
                        <span className="km-info">
                          {presenca.km_inicial.toLocaleString()} km
                        </span>
                      ) : (
                        <span className="no-km">N/A</span>
                      )}
                    </td>
                    <td>
                      {presenca.colaboradores && presenca.colaboradores.length > 0 ? (
                        <div className="colaboradores-pills">
                          {presenca.colaboradores.map((colaboradorId, index) => {
                            const colaborador = colaboradores.find(c => c.id === colaboradorId)
                            return colaborador ? (
                              <span key={colaboradorId} className="colaborador-pill">
                                {colaborador.nome}
                              </span>
                            ) : null
                          })}
                        </div>
                      ) : (
                        <span className="no-colaboradores">Nenhum colaborador</span>
                      )}
                    </td>
                    <td>{presenca.observacoes || 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => {
                            setEditingPresenca(presenca)
                            setPresencaFormData({
                              data_presenca: presenca.data_presenca,
                              data_cadastro_preenchido: presenca.data_cadastro_preenchido,
                                                              cliente_id: presenca.cliente_id || '',
                              equipe_id: presenca.equipe_id,
                              veiculo_id: presenca.veiculo_id || '',
                              km_inicial: presenca.km_inicial || '',
                              observacoes: presenca.observacoes,
                              colaboradores: presenca.colaboradores || [] // Carregar colaboradores existentes
                            })
                            setShowPresencaForm(true)
                          }} 
                          className="action-btn small"
                          title="Editar presença"
                        >
                          ✏️ Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
  
  // Carregar dados quando o componente montar
  useEffect(() => {
    if (userRole) {
      // Carregar clientes imediatamente
      const carregarClientes = async () => {
        try {
          let query = supabase
            .from('clientes')
            .select(`
              *,
              tipo_servico:tipo_servico(nome),
              tipo_padrao:tipo_padrao(nome),
              equipe:equipes(nome),
              status_info:status_clientes(status)
            `)
            .order('created_at', { ascending: false })

          const { data, error } = await query
          if (error) throw error
          setClientes(data || [])
        } catch (error) {
          console.error('Erro ao carregar clientes:', error)
        }
      }
      
      carregarClientes()
      
      // Carregar dados necessários para todos os usuários
      setTimeout(() => {
        if (userRole !== 'instalador') {
          // Administradores e administrativos carregam tudo
          loadPresencas()
          loadColaboradores()
          loadUsuarios()
          loadCargos()
          loadVeiculos()
        } else {
          // Instaladores carregam apenas o necessário para presença
          loadColaboradores()
          loadVeiculos()
        }
      }, 100)
    }

    // Cleanup: limpar timeouts quando componente desmontar
    return () => {
      if (loadClientesTimeout) {
        clearTimeout(loadClientesTimeout)
      }
      if (loadPresencasTimeout) {
        clearTimeout(loadPresencasTimeout)
      }
    }
  }, [userRole, loadClientesTimeout, loadPresencasTimeout])
  
  // Renderizar conteúdo baseado na view atual
  const renderContent = () => {
    // Verificar se deve mostrar a lista de material
    if (showListaMaterial) {
      return (
        <ListaMaterial 
          onBack={handleBackFromListaMaterial}
          userRole={userRole}
        />
      )
    }
    
    // Se for instalador, mostrar apenas clientes
    if (userRole === 'instalador') {
      return (
        <div className="menu-content">
          <div className="menu-header">
            <h2>🔧 Perfil de Instalador</h2>
          </div>
          
          <div style={{ 
            background: '#f0f8ff', 
            padding: '20px', 
            borderRadius: '8px', 
            margin: '20px 0',
            border: '1px solid #007acc'
          }}>
            <h3>📋 Informações do Usuário</h3>
            <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
            <p><strong>Nome:</strong> {user?.nome || user?.email || 'N/A'}</p>
            <p><strong>Role:</strong> {userRole || 'N/A'}</p>
            <p><strong>Clientes carregados:</strong> {clientes.length}</p>
            <p><strong>Status:</strong> {isLoading ? 'Carregando...' : 'Pronto'}</p>
          </div>
          
          {renderClientes()}
        </div>
      )
    }
    
    switch (currentView) {
      case 'clientes':
        return renderClientes()
      case 'presenca':
        return renderPresenca()
      case 'colaboradores':
        return renderColaboradores()
      case 'usuarios':
        return renderUsuarios()
      case 'cargos':
        return renderCargos()
      case 'veiculos':
        return renderVeiculos()
      case 'tipos_servico':
        return renderTiposServico()
      case 'tipos_padrao':
        return renderTiposPadrao()
      case 'medicao':
        return renderMedicao()
      default:
        return renderDashboard()
    }
  }
  
  // Função para iniciar obra (mudar status para "Em andamento" e abrir presença)
  const handleIniciarObra = async (cliente) => {
    try {
      // Buscar o ID do status "Em andamento"
      const { data: statusData, error: statusError } = await supabase
        .from('status_clientes')
        .select('id')
        .eq('status', 'Em andamento')
        .eq('ativo', true)
        .single()
      
      if (statusError) {
        console.error('❌ Erro ao buscar status "Em andamento":', statusError)
        showNotification('Erro ao buscar status do cliente.', 'error')
        return
      }
      
      if (!statusData) {
        showNotification('Status "Em andamento" não encontrado.', 'error')
        return
      }
      
      // Atualizar o status do cliente para "Em andamento"
      const { error: updateError } = await supabase
        .from('clientes')
        .update({ id_status: statusData.id })
        .eq('id', cliente.id)
      
      if (updateError) {
        console.error('❌ Erro ao atualizar status do cliente:', updateError)
        showNotification('Erro ao atualizar status do cliente.', 'error')
        return
      }
      
      // Abrir formulário de presença com cliente pré-preenchido
      setPresencaFormData({
        data_presenca: new Date().toISOString().split('T')[0],
        data_cadastro_preenchido: new Date().toISOString().split('T')[0],
        cliente_id: cliente.id,
        equipe_id: '',
        veiculo_id: '',
        km_inicial: '',
        observacoes: '',
        colaboradores: []
      })
      
      // Marcar que o modal não pode ser fechado até completar a presença
      setPresencaModalNaoFechavel(true)
      
      // Abrir modal de presença
      setShowPresencaForm(true)
      
      // Recarregar clientes para atualizar o status na interface
      const recarregarClientes = async () => {
        try {
          let query = supabase
            .from('clientes')
            .select(`
              *,
              tipo_servico:tipo_servico(nome),
              tipo_padrao:tipo_padrao(nome),
              equipe:equipes(nome),
              status_info:status_clientes(status)
            `)
            .order('created_at', { ascending: false })

          const { data, error } = await query
          if (error) throw error
          setClientes(data || [])
        } catch (error) {
          console.error('Erro ao recarregar clientes:', error)
        }
      }
      
      recarregarClientes()
      
      showNotification('Obra iniciada! Preencha a lista de presença.', 'success')
    } catch (error) {
      console.error('❌ Erro ao iniciar obra:', error)
      showNotification('Erro ao iniciar obra: ' + error.message, 'error')
    }
  }
  
  // Função para finalizar obra (abrir modal de cliente para edição)
  const handleFinalizarObra = (cliente) => {
    // Abrir modal de cliente para edição dos campos específicos
    setClienteFormData({
      nome_cliente: cliente.nome_cliente || '',
      endereco: cliente.endereco || '',
      telefone: cliente.telefone || '',
      data_instalacao: cliente.data_instalacao || '',
      tipo_servico_id: cliente.tipo_servico_id || '',
      tipo_padrao_id: cliente.tipo_padrao_id || '',
      id_profiles: [],
      equipe_id: cliente.equipe_id || '',
      data_cadastro: cliente.data_cadastro || '',
      obra_cancelada: cliente.obra_cancelada || false,
      nota_material: cliente.nota_material || false,
      quantidade_modulos: cliente.quantidade_modulos || '',
      configuracao_inversor: cliente.configuracao_inversor || false,
      deslocamento_buscar_material: cliente.deslocamento_buscar_material || false,
      obra_civil: cliente.obra_civil || false,
      observacoes: cliente.observacoes || '',
      id_status: cliente.id_status || 1
    })
    
    // Carregar responsáveis do cliente
    loadResponsaveisCliente(cliente.id).then(responsaveisIds => {
      setClienteFormData(prev => ({
        ...prev,
        id_profiles: responsaveisIds
      }))
    })
    
    // Marcar que este modal é para finalização (não é o modal de presença obrigatório)
    setPresencaModalNaoFechavel(false)
    
    // Marcar que este modal de cliente não pode ser fechado até finalizar
    setClienteModalNaoFechavel(true)
    
    setEditingCliente(cliente)
    setShowClienteForm(true)
  }
  
  // Função para salvar cliente após finalização (mudar status para "Finalizado")
  const handleFinalizarClienteSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Buscar o ID do status "Finalizado"
      const { data: statusData, error: statusError } = await supabase
        .from('status_clientes')
        .select('id')
        .eq('status', 'Finalizado')
        .eq('ativo', true)
        .single()
      
      if (statusError) {
        console.error('❌ Erro ao buscar status "Finalizado":', statusError)
        showNotification('Erro ao buscar status do cliente.', 'error')
        return
      }
      
      if (!statusData) {
        showNotification('Status "Finalizado" não encontrado.', 'error')
        return
      }
      
      // Destructuring para separar id_profiles dos dados do cliente
      const { id_profiles, ...dadosCliente } = clienteFormData
      
      // Atualizar o cliente com os dados do formulário e status "Finalizado"
      const clienteData = {
        ...dadosCliente,
        id_status: statusData.id
      }
      
      const { error: updateError } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', editingCliente.id)
      
      if (updateError) {
        console.error('❌ Erro ao atualizar cliente:', updateError)
        showNotification('Erro ao atualizar cliente: ' + updateError.message, 'error')
        return
      }
      
      // Salvar responsáveis na tabela clientes_usuarios
      if (clienteData.id_profiles && clienteData.id_profiles.length > 0) {
        // Desativar todas as relações existentes
        const { error: deactivateError } = await supabase
          .from('clientes_usuarios')
          .update({ ativo: false })
          .eq('cliente_id', editingCliente.id)
        
        if (deactivateError) {
          console.error('❌ Erro ao desativar relações existentes:', deactivateError)
          throw deactivateError
        }
        
        // Preparar dados para inserção
        const responsaveisData = clienteData.id_profiles.map(profileId => ({
          cliente_id: editingCliente.id,
          profile_id: profileId,
          tipo_relacao: 'instalador',
          ativo: true
        }))
        
        // Inserir novas relações
        const { error: responsaveisError } = await supabase
          .from('clientes_usuarios')
          .upsert(responsaveisData, {
            onConflict: 'cliente_id,profile_id,tipo_relacao',
            ignoreDuplicates: false
          })
        
        if (responsaveisError) {
          console.error('❌ Erro ao salvar responsáveis:', responsaveisError)
          throw responsaveisError
        }
      }
      
      showNotification('Cliente finalizado com sucesso!', 'success')
      setShowClienteForm(false)
      setEditingCliente(null)
      setClienteModalNaoFechavel(false) // Permitir fechar o modal após finalizar
      loadClientes()
    } catch (error) {
      console.error('❌ Erro ao finalizar cliente:', error)
      showNotification('Erro ao finalizar cliente: ' + error.message, 'error')
    }
  }
  
  return (
    <>
      {/* Modal de Aviso de Presenças */}
      {showPresencaWarningModal && (
        <div className="presenca-warning-overlay">
          <div className="presenca-warning-modal">
            <div className="warning-header">
              <h3>⚠️ Atenção - Cliente com Presenças</h3>
              <button onClick={closePresencaWarningModal} className="close-button">×</button>
            </div>
            
            <div className="warning-content">
              <div className="warning-icon">⚠️</div>
              <p>
                O cliente <strong>{clienteParaExcluir?.nome_cliente}</strong> possui 
                <strong> {presencasCliente.length} registro(s) de presença</strong> relacionado(s).
              </p>
              
              <div className="presenca-details">
                <h4>Presenças encontradas:</h4>
                <ul>
                  {presencasCliente.map((presenca) => (
                    <li key={presenca.id}>
                      📅 {formatarData(presenca.data_presenca)}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="warning-options">
                <p><strong>Opções disponíveis:</strong></p>
                <ol>
                  <li>Excluir todas as presenças E o cliente (recomendado)</li>
                  <li>Cancelar a exclusão e manter o cliente</li>
                </ol>
              </div>
            </div>
            
            <div className="warning-actions">
              <button onClick={closePresencaWarningModal} className="cancel-button">
                ❌ Cancelar
              </button>
              <button onClick={handleDeletePresencasAndCliente} className="confirm-button">
                🗑️ Excluir Tudo
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="welcome-container">
        {/* Loading state */}
        {isLoading && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            fontSize: '18px',
            color: '#666'
          }}>
            Carregando...
          </div>
        )}
        

        
        {/* Notificações */}
        <div className="notifications-container">
          {notifications.map((notification) => (
            <div key={notification.id} className={`notification ${notification.type}`}>
              {notification.message}
            </div>
          ))}
        </div>
        
        {/* Menu de navegação */}
        {!isLoading && (
        <nav className="welcome-nav enhanced-header">
          <div className="nav-brand">
            <div className="brand-logo">
              <div className="logo-icon">🏗️</div>
              <div className="brand-text">
                <h1 className="brand-title">TecSol Sistema</h1>
                <span className="brand-subtitle">Gestão Inteligente</span>
              </div>
            </div>
          </div>
          

          
                          {/* Menu de navegação - apenas para não instaladores */}
        {userRole && userRole !== 'instalador' ? (
          <div className="nav-menu">
            <button 
              onClick={toggleHamburgerMenu} 
              className={`hamburger-button ${showHamburgerMenu ? 'active' : ''}`}
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
            
            <div className={`nav-dropdown ${showHamburgerMenu ? 'show' : ''}`}>
              <button 
                onClick={() => handleNavItemClick('dashboard')} 
                className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">Dashboard</span>
              </button>
              
              {security.canAccessMenu(userRole, 'clientes') && (
                <button 
                  onClick={() => handleNavItemClick('clientes')} 
                  className={`nav-item ${currentView === 'clientes' ? 'active' : ''}`}
                >
                  <span className="nav-icon">👥</span>
                  <span className="nav-text">Clientes</span>
                </button>
              )}
              
              {security.canAccessMenu(userRole, 'presenca') && (
                <button 
                  onClick={() => handleNavItemClick('presenca')} 
                  className={`nav-item ${currentView === 'presenca' ? 'active' : ''}`}
                >
                  <span className="nav-icon">📋</span>
                  <span className="nav-text">Presenças</span>
                </button>
              )}
              
              {security.canAccessMenu(userRole, 'colaboradores') && (
                <button 
                  onClick={() => handleNavItemClick('colaboradores')} 
                  className={`nav-item ${currentView === 'colaboradores' ? 'active' : ''}`}
                >
                  <span className="nav-icon">👷</span>
                  <span className="nav-text">Colaboradores</span>
                </button>
              )}
              
              {security.canAccessMenu(userRole, 'usuarios') && (
                <button 
                  onClick={() => handleNavItemClick('usuarios')} 
                  className={`nav-item ${currentView === 'usuarios' ? 'active' : ''}`}
                >
                  <span className="nav-icon">👤</span>
                  <span className="nav-text">Usuários</span>
                </button>
              )}
              
              {security.canAccessMenu(userRole, 'cargos') && (
                <button 
                  onClick={() => handleNavItemClick('cargos')} 
                  className={`nav-item ${currentView === 'cargos' ? 'active' : ''}`}
                >
                  <span className="nav-icon">🎯</span>
                  <span className="nav-text">Cargos</span>
                </button>
              )}
              
              {security.canAccessMenu(userRole, 'veiculos') && (
                <button 
                  onClick={() => handleNavItemClick('veiculos')} 
                  className={`nav-item ${currentView === 'veiculos' ? 'active' : ''}`}
                >
                  <span className="nav-icon">🚗</span>
                  <span className="nav-text">Veículos</span>
                </button>
              )}
              
              {security.canAccessMenu(userRole, 'tipos_servico') && (
                <button 
                  onClick={() => handleNavItemClick('tipos_servico')} 
                  className={`nav-item ${currentView === 'tipos_servico' ? 'active' : ''}`}
                >
                  <span className="nav-icon">🔧</span>
                  <span className="nav-text">Tipos de Serviço</span>
                </button>
              )}
              
              {security.canAccessMenu(userRole, 'tipos_padrao') && (
                <button 
                  onClick={() => handleNavItemClick('tipos_padrao')} 
                  className={`nav-item ${currentView === 'tipos_padrao' ? 'active' : ''}`}
                >
                  <span className="nav-icon">⚡</span>
                  <span className="nav-text">Tipos de Padrão</span>
                </button>
              )}
              
              {security.canAccessMenu(userRole, 'medicao') && (
                <button 
                  onClick={() => handleNavItemClick('medicao')} 
                  className={`nav-item ${currentView === 'medicao' ? 'active' : ''}`}
                >
                  <span className="nav-icon">📊</span>
                  <span className="nav-text">Medição</span>
                </button>
              )}
              
              {/* Menu Lista de Material - apenas para administradores e administrativos */}
              {security.canAccessMenu(userRole, 'lista_material') && (
                <button 
                  onClick={() => setShowListaMaterial(true)} 
                  className="nav-item"
                >
                  <span className="nav-icon">📋</span>
                  <span className="nav-text">Lista de Material</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ 
            padding: '10px', 
            background: '#f0f8ff', 
            borderRadius: '5px', 
            margin: '10px',
            border: '1px solid #007acc'
          }}>
            {userRole === 'instalador' ? '🔧 Menu oculto para instaladores' : '⏳ Carregando perfil...'}
          </div>
        )}
          
          <div className="nav-user">
            <div className="user-info">
              <div className="user-avatar">
                <span className="avatar-icon">👤</span>
              </div>
              <div className="user-details">
                <span className="user-name">{user?.nome || user?.email}</span>
                <span className="user-role">{userRole || 'Usuário'}</span>
              </div>
            </div>
            
            <div className="user-actions">
              {userRole !== 'instalador' && (
                <button onClick={openChangePasswordForm} className="change-password-button">
                  <span className="button-icon">🔐</span>
                  <span className="button-text">Alterar Senha</span>
                </button>
              )}
              <button onClick={openLogoutConfirmation} className="logout-button">
                <span className="button-icon">🚪</span>
                <span className="button-text">Sair</span>
              </button>
            </div>
          </div>
        </nav>
        )}
        
        {/* Conteúdo principal */}
        {!isLoading && (
        <main className="welcome-main">
          {renderContent()}
        </main>
        )}
        
        {/* Formulário de Cliente */}
        {showClienteForm && (
          <div className="form-overlay">
            <div className="form-modal">
              <div className="modal-header">
                <h3>
                  {editingCliente && clienteModalNaoFechavel ? 'Finalizar Obra - Editar Cliente' : 
                   editingCliente ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
                </h3>
                {/* Botão de fechar só aparece se o modal não for obrigatório */}
                {!clienteModalNaoFechavel && (
                  <button onClick={closeClienteForm} className="close-button" title="Fechar">×</button>
                )}
              </div>
              
              <form onSubmit={
                editingCliente && clienteModalNaoFechavel ? handleFinalizarClienteSubmit : handleClienteFormSubmit
              } className="cliente-form">
                {/* Seção 1: Informações Básicas do Cliente */}
                <div className="form-section">
                  <h4 className="section-title">📋 Informações Básicas</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="nome_cliente">Nome do Cliente: *</label>
                      <input
                        type="text"
                        id="nome_cliente"
                        value={clienteFormData.nome_cliente}
                        onChange={(e) => setClienteFormData({...clienteFormData, nome_cliente: e.target.value})}
                        required
                        placeholder="Nome completo do cliente"
                        disabled={clienteModalNaoFechavel} // Desabilitar para finalização
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="telefone">Telefone: *</label>
                      <input
                        type="tel"
                        id="telefone"
                        value={clienteFormData.telefone}
                        onChange={(e) => setClienteFormData({...clienteFormData, telefone: e.target.value})}
                        required
                        placeholder="(11) 99999-9999"
                        disabled={clienteModalNaoFechavel} // Desabilitar para finalização
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="endereco">Endereço: *</label>
                                          <input
                        type="text"
                        id="endereco"
                        value={clienteFormData.endereco}
                        onChange={(e) => setClienteFormData({...clienteFormData, endereco: e.target.value})}
                        required
                        placeholder="Endereço completo da instalação"
                        disabled={clienteModalNaoFechavel} // Desabilitar para finalização
                      />
                  </div>
                </div>

                {/* Seção 2: Datas e Cronograma */}
                <div className="form-section">
                  <h4 className="section-title">📅 Datas e Cronograma</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="data_cadastro">Data de Cadastro:</label>
                      <input
                        type="date"
                        id="data_cadastro"
                        value={clienteFormData.data_cadastro}
                        onChange={(e) => setClienteFormData({...clienteFormData, data_cadastro: e.target.value})}
                        disabled={clienteModalNaoFechavel} // Desabilitar para finalização
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="data_instalacao">Data da Instalação: *</label>
                      <input
                        type="date"
                        id="data_instalacao"
                        value={clienteFormData.data_instalacao}
                        onChange={(e) => setClienteFormData({...clienteFormData, data_instalacao: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 3: Especificações Técnicas */}
                <div className="form-section">
                  <h4 className="section-title">⚡ Especificações Técnicas</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="tipo_servico">Tipo de Serviço:</label>
                      <select
                        id="tipo_servico"
                        value={clienteFormData.tipo_servico_id}
                        onChange={(e) => setClienteFormData({...clienteFormData, tipo_servico_id: e.target.value})}
                      >
                        <option value="">Selecione um tipo de serviço</option>
                        {tiposServico.map((tipo) => (
                          <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="tipo_padrao">Tipo de Padrão:</label>
                      <select
                        id="tipo_padrao"
                        value={clienteFormData.tipo_padrao_id}
                        onChange={(e) => setClienteFormData({...clienteFormData, tipo_padrao_id: e.target.value})}
                      >
                        <option value="">Selecione um tipo de padrão</option>
                        {tiposPadrao.map((tipo) => (
                          <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="quantidade_modulos">Quantidade de Módulos:</label>
                      <input
                        type="number"
                        id="quantidade_modulos"
                        value={clienteFormData.quantidade_modulos || ''}
                        onChange={(e) => setClienteFormData({...clienteFormData, quantidade_modulos: parseInt(e.target.value) || 0})}
                        min="0"
                        placeholder="Ex: 10"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="equipe">Equipe Responsável:</label>
                      <select
                        id="equipe"
                        value={clienteFormData.equipe_id}
                        onChange={(e) => setClienteFormData({...clienteFormData, equipe_id: e.target.value})}
                        disabled={clienteModalNaoFechavel} // Desabilitar para finalização
                      >
                        <option value="">Selecione uma equipe</option>
                        {equipes.map((equipe) => (
                          <option key={equipe.id} value={equipe.id}>{equipe.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="responsaveis">Responsáveis pela Obra:</label>
                    <select
                      id="responsaveis"
                      multiple
                      value={clienteFormData.id_profiles}
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
                        setClienteFormData({...clienteFormData, id_profiles: selectedOptions})
                      }}
                      className="multi-select"
                      disabled={clienteModalNaoFechavel} // Desabilitar para finalização
                    >
                      {usuariosInstaladores.map((usuario) => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.nome} ({usuario.role})
                        </option>
                      ))}
                    </select>
                    <small className="form-help">Pressione Ctrl (ou Cmd no Mac) para selecionar múltiplos responsáveis</small>
                  </div>
                </div>

                {/* Seção 4: Status e Acompanhamento */}
                <div className="form-section">
                  <h4 className="section-title">📊 Status e Acompanhamento</h4>
                  <div className="form-group">
                    <label htmlFor="id_status">Status do Projeto:</label>
                    <select
                      id="id_status"
                      value={clienteFormData.id_status || ''}
                      onChange={(e) => setClienteFormData({...clienteFormData, id_status: e.target.value ? parseInt(e.target.value) : null})}
                      required
                      disabled={clienteModalNaoFechavel} // Desabilitar para finalização
                    >
                      <option value="">Selecione um status</option>
                      {statusClientes.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Seção 5: Configurações e Opções */}
                <div className="form-section">
                  <h4 className="section-title">⚙️ Configurações e Opções</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="simple-checkbox-label">
                        <input
                          type="checkbox"
                          id="configuracao_inversor"
                          checked={clienteFormData.configuracao_inversor}
                          onChange={(e) => setClienteFormData({...clienteFormData, configuracao_inversor: e.target.checked})}
                        />
                        Configuração do Inversor
                      </label>
                    </div>
                    
                    <div className="form-group">
                      <label className="simple-checkbox-label">
                        <input
                          type="checkbox"
                          id="deslocamento_buscar_material"
                          checked={clienteFormData.deslocamento_buscar_material}
                          onChange={(e) => setClienteFormData({...clienteFormData, deslocamento_buscar_material: e.target.checked})}
                        />
                        Deslocamento para Buscar Material
                      </label>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="simple-checkbox-label">
                        <input
                          type="checkbox"
                          id="obra_civil"
                          checked={clienteFormData.obra_civil}
                          onChange={(e) => setClienteFormData({...clienteFormData, obra_civil: e.target.checked})}
                        />
                        Obra Civil
                      </label>
                    </div>
                    
                    <div className="form-group">
                      <label className="simple-checkbox-label">
                        <input
                          type="checkbox"
                          id="obra_cancelada"
                          checked={clienteFormData.obra_cancelada}
                          onChange={(e) => setClienteFormData({...clienteFormData, obra_cancelada: e.target.checked})}
                        />
                        Obra Cancelada
                      </label>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="simple-checkbox-label">
                        <input
                          type="checkbox"
                          id="nota_material"
                          checked={clienteFormData.nota_material}
                          onChange={(e) => setClienteFormData({...clienteFormData, nota_material: e.target.checked})}
                        />
                        Nota de Material
                      </label>
                    </div>
                  </div>
                </div>

                {/* Seção 6: Observações */}
                <div className="form-section">
                  <h4 className="section-title">📝 Observações</h4>
                  <div className="form-group">
                    <label htmlFor="observacoes">Observações Adicionais:</label>
                    <textarea
                      id="observacoes"
                      value={clienteFormData.observacoes || ''}
                      onChange={(e) => setClienteFormData({...clienteFormData, observacoes: e.target.value})}
                      rows="3"
                      placeholder="Observações adicionais sobre o cliente ou projeto..."
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  {/* Botão cancelar só aparece se o modal não for obrigatório */}
                  {!clienteModalNaoFechavel && (
                    <button type="button" onClick={closeClienteForm} className="cancel-button">
                      Cancelar
                    </button>
                  )}
                  <button type="submit" className="submit-button">
                    {editingCliente && clienteModalNaoFechavel ? 'Finalizar Obra' : 
                     editingCliente ? 'Atualizar' : 'Cadastrar'} Cliente
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Formulário de Veículo */}
        {showVeiculoForm && (
          <div className="form-overlay">
            <div className="form-modal">
              <div className="modal-header">
                <h3>{editingVeiculo ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}</h3>
                <button onClick={closeVeiculoForm} className="close-button">×</button>
              </div>
              
              <form onSubmit={handleVeiculoFormSubmit} className="veiculo-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="veiculo_nome">Nome/Modelo: *</label>
                    <input
                      type="text"
                      id="veiculo_nome"
                      value={veiculoFormData.veiculo}
                      onChange={(e) => setVeiculoFormData({...veiculoFormData, veiculo: e.target.value})}
                      required
                      placeholder="Ex: Fiat Strada, Ford Transit, etc."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="veiculo_placa">Placa: *</label>
                    <input
                      type="text"
                      id="veiculo_placa"
                      value={veiculoFormData.placa}
                      onChange={(e) => setVeiculoFormData({...veiculoFormData, placa: e.target.value})}
                      required
                      placeholder="Ex: ABC-1234"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="veiculo_ativo">Status:</label>
                  <select
                    id="veiculo_ativo"
                    value={veiculoFormData.ativo}
                    onChange={(e) => setVeiculoFormData({...veiculoFormData, ativo: e.target.value === 'true'})}
                  >
                    <option value={true}>✅ Ativo</option>
                    <option value={false}>❌ Inativo</option>
                  </select>
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={closeVeiculoForm} className="cancel-button">
                    Cancelar
                  </button>
                  <button type="submit" className="submit-button">
                    {editingVeiculo ? 'Atualizar' : 'Cadastrar'} Veículo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Formulário de Cargo */}
        {showCargoForm && (
          <div className="form-overlay">
            <div className="form-modal">
              <div className="modal-header">
                <h3>{editingCargo ? 'Editar Cargo' : 'Cadastrar Novo Cargo'}</h3>
                <button onClick={closeCargoForm} className="close-button">×</button>
              </div>
              
              <form onSubmit={handleCargoFormSubmit} className="cargo-form">
                <div className="form-group">
                  <label htmlFor="cargo_nome">Nome do Cargo: *</label>
                  <input
                    type="text"
                    id="cargo_nome"
                    value={cargoFormData.cargo}
                    onChange={(e) => setCargoFormData({...cargoFormData, cargo: e.target.value})}
                    required
                    placeholder="Ex: Pedreiro, Eletricista, etc."
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cargo_ativo">Status:</label>
                  <select
                    id="cargo_ativo"
                    value={cargoFormData.ativo}
                    onChange={(e) => setCargoFormData({...cargoFormData, ativo: e.target.value === 'true'})}
                  >
                    <option value={true}>✅ Ativo</option>
                    <option value={false}>❌ Inativo</option>
                  </select>
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={closeCargoForm} className="cancel-button">
                    Cancelar
                  </button>
                  <button type="submit" className="submit-button">
                    {editingCargo ? 'Atualizar' : 'Cadastrar'} Cargo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Formulário de Colaborador */}
        {showColaboradorForm && (
          <div className="form-overlay">
            <div className="form-modal">
              <div className="modal-header">
                <h3>{editingColaborador ? 'Editar Colaborador' : 'Cadastrar Novo Colaborador'}</h3>
                <button onClick={closeColaboradorForm} className="close-button">×</button>
              </div>
              
              <form onSubmit={handleColaboradorFormSubmit} className="colaborador-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nome_colaborador">Nome: *</label>
                    <input
                      type="text"
                      id="nome_colaborador"
                      value={colaboradorFormData.nome}
                      onChange={(e) => setColaboradorFormData({...colaboradorFormData, nome: e.target.value})}
                      required
                    />
                  </div>
                  
                                     <div className="form-group">
                     <label htmlFor="cargo_colaborador">Cargo: *</label>
                     <select
                       id="cargo_colaborador"
                       value={colaboradorFormData.cargo}
                       onChange={(e) => setColaboradorFormData({...colaboradorFormData, cargo: e.target.value})}
                       required
                     >
                       <option value="">Selecione um cargo</option>
                       {cargos.map((cargo) => (
                         <option key={cargo.id} value={cargo.cargo}>
                           {cargo.ativo ? '✅' : '❌'} {cargo.cargo}
                         </option>
                       ))}
                     </select>
                   </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email_colaborador">Email:</label>
                    <input
                      type="email"
                      id="email_colaborador"
                      value={colaboradorFormData.email}
                      onChange={(e) => setColaboradorFormData({...colaboradorFormData, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="chave_pix_colaborador">Chave PIX:</label>
                    <input
                      type="text"
                      id="chave_pix_colaborador"
                      value={colaboradorFormData.chave_pix}
                      onChange={(e) => setColaboradorFormData({...colaboradorFormData, chave_pix: e.target.value})}
                      placeholder="Chave PIX para pagamentos"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="ativo_colaborador">Status:</label>
                  <select
                    id="ativo_colaborador"
                    value={colaboradorFormData.ativo}
                    onChange={(e) => setColaboradorFormData({...colaboradorFormData, ativo: e.target.value === 'true'})}
                  >
                    <option value={true}>✅ Ativo</option>
                    <option value={false}>❌ Inativo</option>
                  </select>
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={closeColaboradorForm} className="cancel-button">
                    Cancelar
                  </button>
                  <button type="submit" className="submit-button">
                    {editingColaborador ? 'Atualizar' : 'Cadastrar'} Colaborador
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
                 {/* Formulário de Usuário */}
         {showUsuarioForm && (
           <div className="form-overlay">
             <div className="form-modal">
               <div className="modal-header">
                 <h3>{editingUsuario ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}</h3>
                 <button onClick={closeUsuarioForm} className="close-button">×</button>
               </div>
               
               <form onSubmit={handleUsuarioFormSubmit} className="usuario-form">
                 <div className="form-row">
                   <div className="form-group">
                     <label htmlFor="nome_usuario">Nome: *</label>
                     <input
                       type="text"
                       id="nome_usuario"
                       value={usuarioFormData.nome}
                       onChange={(e) => setUsuarioFormData({...usuarioFormData, nome: e.target.value})}
                       required
                     />
                   </div>
                   
                   <div className="form-group">
                     <label htmlFor="email_usuario">Email: *</label>
                     <input
                       type="email"
                       id="email_usuario"
                       value={usuarioFormData.email}
                       onChange={(e) => setUsuarioFormData({...usuarioFormData, email: e.target.value})}
                       required
                     />
                   </div>
                 </div>
                 
                 <div className="form-row">
                   <div className="form-group">
                     <label htmlFor="role_usuario">Função: *</label>
                     <select
                       id="role_usuario"
                       value={usuarioFormData.role}
                       onChange={(e) => setUsuarioFormData({...usuarioFormData, role: e.target.value})}
                       required
                     >
                       <option value="">Selecione uma função</option>
                       <option value="administrador">👑 Administrador</option>
                       <option value="administrativo">📋 Administrativo</option>
                       <option value="instalador">🔧 Instalador</option>
                     </select>
                   </div>
                   
                   <div className="form-group">
                     <label htmlFor="status_usuario">Status: *</label>
                     <select
                       id="status_usuario"
                       value={usuarioFormData.status}
                       onChange={(e) => setUsuarioFormData({...usuarioFormData, status: e.target.value})}
                       required
                     >
                       <option value="ativo">✅ Ativo</option>
                       <option value="inativo">❌ Inativo</option>
                     </select>
                   </div>
                 </div>
                 
                 <div className="form-actions">
                   <button type="button" onClick={closeUsuarioForm} className="cancel-button">
                     Cancelar
                   </button>
                   <button type="submit" className="submit-button">
                     {editingUsuario ? 'Atualizar' : 'Cadastrar'} Usuário
                   </button>
                 </div>
               </form>
             </div>
           </div>
         )}
         
         {/* Formulário de Tipo de Serviço */}
         {showTipoServicoForm && (
           <div className="form-overlay">
             <div className="form-modal">
               <div className="modal-header">
                 <h3>{editingTipoServico ? 'Editar Tipo de Serviço' : 'Cadastrar Novo Tipo de Serviço'}</h3>
                 <button onClick={closeTipoServicoForm} className="close-button">×</button>
               </div>
               
               <form onSubmit={handleTipoServicoFormSubmit} className="tipo-servico-form">
                 <div className="form-group">
                   <label htmlFor="nome_tipo_servico">Nome: *</label>
                   <input
                     type="text"
                     id="nome_tipo_servico"
                     value={tipoServicoFormData.nome}
                     onChange={(e) => setTipoServicoFormData({...tipoServicoFormData, nome: e.target.value})}
                     required
                     placeholder="Ex: Instalação, Manutenção, etc."
                   />
                 </div>
                 
                 <div className="form-group">
                   <label htmlFor="ativo_tipo_servico">Status:</label>
                   <select
                     id="ativo_tipo_servico"
                     value={tipoServicoFormData.ativo}
                     onChange={(e) => setTipoServicoFormData({...tipoServicoFormData, ativo: e.target.value === 'true'})}
                   >
                     <option value={true}>✅ Ativo</option>
                     <option value={false}>❌ Inativo</option>
                   </select>
                 </div>
                 
                 <div className="form-actions">
                   <button type="button" onClick={closeTipoServicoForm} className="cancel-button">
                     Cancelar
                   </button>
                   <button type="submit" className="submit-button">
                     {editingTipoServico ? 'Atualizar' : 'Cadastrar'} Tipo de Serviço
                   </button>
                 </div>
               </form>
             </div>
           </div>
         )}
         
         {/* Formulário de Tipo de Padrão */}
         {showTipoPadraoForm && (
           <div className="form-overlay">
             <div className="form-modal">
               <div className="modal-header">
                 <h3>{editingTipoPadrao ? 'Editar Tipo de Padrão' : 'Cadastrar Novo Tipo de Padrão'}</h3>
                 <button onClick={closeTipoPadraoForm} className="close-button">×</button>
               </div>
               
               <form onSubmit={handleTipoPadraoFormSubmit} className="tipo-padrao-form">
                 <div className="form-group">
                   <label htmlFor="nome_tipo_padrao">Nome: *</label>
                   <input
                     type="text"
                     id="nome_tipo_padrao"
                     value={tipoPadraoFormData.nome}
                     onChange={(e) => setTipoPadraoFormData({...tipoPadraoFormData, nome: e.target.value})}
                     required
                     placeholder="Ex: Monofásico, Bifásico, Trifásico"
                   />
                 </div>
                 
                 <div className="form-group">
                   <label htmlFor="ativo_tipo_padrao">Status:</label>
                   <select
                     id="ativo_tipo_padrao"
                     value={tipoPadraoFormData.ativo}
                     onChange={(e) => setTipoPadraoFormData({...tipoPadraoFormData, ativo: e.target.value === 'true'})}
                   >
                     <option value={true}>✅ Ativo</option>
                     <option value={false}>❌ Inativo</option>
                   </select>
                 </div>
                 
                 <div className="form-actions">
                   <button type="button" onClick={closeTipoPadraoForm} className="cancel-button">
                     Cancelar
                   </button>
                   <button type="submit" className="submit-button">
                     {editingTipoPadrao ? 'Atualizar' : 'Cadastrar'} Tipo de Padrão
                   </button>
                 </div>
               </form>
             </div>
           </div>
         )}
        
        {/* Formulário de Presença */}
        {showPresencaForm && (
          <div className="form-overlay">
            <div className="form-modal">
              <div className="modal-header">
                <h3>{editingPresenca ? 'Editar Presença' : 'Nova Lista de Presença'}</h3>
                {/* Debug temporário */}
                <div style={{fontSize: '12px', color: 'red'}}>
                  presencaModalNaoFechavel: {presencaModalNaoFechavel ? 'true' : 'false'}
                </div>
                {/* Botão de fechar só aparece se o modal não for obrigatório */}
                {!presencaModalNaoFechavel && (
                  <button onClick={closePresencaForm} className="close-button">×</button>
                )}
              </div>
              
              <form onSubmit={handlePresencaFormSubmit} className="presenca-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="data_presenca">Data da Presença: *</label>
                    <input
                      type="date"
                      id="data_presenca"
                      value={presencaFormData.data_presenca}
                      onChange={(e) => setPresencaFormData({...presencaFormData, data_presenca: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="data_cadastro_preenchido">Data do Cadastro: *</label>
                    <input
                      type="date"
                      id="data_cadastro_preenchido"
                      value={presencaFormData.data_cadastro_preenchido}
                      onChange={(e) => setPresencaFormData({...presencaFormData, data_cadastro_preenchido: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cliente_id">Cliente: *</label>
                    <select
                      id="cliente_id"
                      value={presencaFormData.cliente_id}
                      onChange={(e) => setPresencaFormData({...presencaFormData, cliente_id: e.target.value})}
                      required
                      disabled={presencaModalNaoFechavel} // Desabilitar quando modal não for fechável
                    >
                      <option value="">Selecione um cliente</option>
                      {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nome_cliente}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="equipe_id">Equipe: *</label>
                    <select
                      id="equipe_id"
                      value={presencaFormData.equipe_id}
                      onChange={(e) => setPresencaFormData({...presencaFormData, equipe_id: e.target.value})}
                      required
                    >
                      <option value="">Selecione uma equipe</option>
                      {equipes.map(equipe => (
                        <option key={equipe.id} value={equipe.id}>
                          {equipe.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="veiculo_id">Carro/Veículo: *</label>
                    <select
                      id="veiculo_id"
                      value={presencaFormData.veiculo_id}
                      onChange={(e) => setPresencaFormData({...presencaFormData, veiculo_id: e.target.value})}
                      required
                    >
                      <option value="">Selecione um carro/veículo</option>
                      {carros.filter(c => c.ativo).map(carro => (
                        <option key={carro.id} value={carro.id}>
                          {carro.veiculo} - {carro.placa}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="km_inicial">KM Inicial:</label>
                    <input
                      type="number"
                      id="km_inicial"
                      value={presencaFormData.km_inicial}
                      onChange={(e) => setPresencaFormData({...presencaFormData, km_inicial: e.target.value})}
                      placeholder="Ex: 15000"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="colaboradores">Colaboradores: *</label>
                  <div className="colaboradores-selection">
                    {/* Botões de ação rápida */}
                    <div className="colaboradores-actions">
                      <button
                        type="button"
                        onClick={() => {
                          const todosAtivos = colaboradores.filter(c => c.ativo).map(c => c.id)
                          setPresencaFormData({
                            ...presencaFormData,
                            colaboradores: todosAtivos
                          })
                        }}
                        className="action-button select-all"
                        title="Selecionar todos os colaboradores ativos"
                      >
                        ✅ Selecionar Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPresencaFormData({
                            ...presencaFormData,
                            colaboradores: []
                          })
                        }}
                        className="action-button clear-all"
                        title="Limpar seleção"
                      >
                        🗑️ Limpar Seleção
                      </button>
                    </div>
                    
                    {/* Grid responsivo de colaboradores */}
                    <div className="colaboradores-grid">
                      {colaboradores.filter(c => c.ativo).map((colaborador) => (
                        <label key={colaborador.id} className="colaborador-checkbox">
                          <input
                            type="checkbox"
                            checked={presencaFormData.colaboradores.includes(colaborador.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPresencaFormData({
                                  ...presencaFormData,
                                  colaboradores: [...presencaFormData.colaboradores, colaborador.id]
                                })
                              } else {
                                setPresencaFormData({
                                  ...presencaFormData,
                                  colaboradores: presencaFormData.colaboradores.filter(id => id !== colaborador.id)
                                })
                              }
                            }}
                          />
                          <span className="checkbox-label">
                            <strong>{colaborador.nome}</strong>
                            <small>{colaborador.cargo}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                    
                    {/* Contador e colaboradores selecionados */}
                    <div className="colaboradores-summary">
                      <div className="selection-count">
                        <span className="count-badge">
                          {presencaFormData.colaboradores.length} de {colaboradores.filter(c => c.ativo).length} colaboradores selecionados
                        </span>
                      </div>
                      
                      {presencaFormData.colaboradores.length > 0 && (
                        <div className="colaboradores-selecionados">
                          <h4>Colaboradores Selecionados:</h4>
                          <div className="selected-pills">
                            {presencaFormData.colaboradores.map((colaboradorId) => {
                              const colaborador = colaboradores.find(c => c.id === colaboradorId)
                              return colaborador ? (
                                <span key={colaboradorId} className="selected-pill">
                                  <span className="pill-content">
                                    <strong>{colaborador.nome}</strong>
                                    <small>{colaborador.cargo}</small>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPresencaFormData({
                                        ...presencaFormData,
                                        colaboradores: presencaFormData.colaboradores.filter(id => id !== colaboradorId)
                                      })
                                    }}
                                    className="remove-colaborador"
                                    title="Remover colaborador"
                                  >
                                    ×
                                  </button>
                                </span>
                              ) : null
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="observacoes">Observações:</label>
                  <textarea
                    id="observacoes"
                    value={presencaFormData.observacoes}
                    onChange={(e) => setPresencaFormData({...presencaFormData, observacoes: e.target.value})}
                    placeholder="Digite observações sobre a presença..."
                    rows="3"
                  />
                </div>
                
                <div className="form-actions">
                  {/* Debug temporário */}
                  <div style={{fontSize: '12px', color: 'red', marginBottom: '10px'}}>
                    presencaModalNaoFechavel: {presencaModalNaoFechavel ? 'true' : 'false'}
                  </div>
                  {/* Botão Cancelar só aparece se o modal não for obrigatório */}
                  {!presencaModalNaoFechavel && (
                    <button type="button" onClick={closePresencaForm} className="cancel-button">
                      Cancelar
                    </button>
                  )}
                  <button type="submit" className="submit-button">
                    {editingPresenca ? 'Atualizar' : 'Cadastrar'} Presença
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Modal de Visualização do Cliente */}
        {showClienteModal && clienteModalData && (
          <div className="form-overlay">
            <div className="form-modal cliente-view-modal">
              <div className="modal-header">
                <h3>👤 Detalhes do Cliente</h3>
                <button onClick={closeClienteModal} className="close-button">×</button>
              </div>
              
              <div className="cliente-view-content">
                {/* Seção 1: Informações Básicas */}
                <div className="view-section">
                  <h4 className="section-title">📋 Informações Básicas</h4>
                  <div className="view-row">
                    <div className="view-group">
                      <label>Nome do Cliente:</label>
                      <span>{clienteModalData.nome_cliente}</span>
                    </div>
                    <div className="view-group">
                      <label>Telefone:</label>
                      <span>{clienteModalData.telefone}</span>
                    </div>
                  </div>
                  <div className="view-group">
                    <label>Endereço:</label>
                    <span>{clienteModalData.endereco}</span>
                  </div>
                </div>

                {/* Seção 2: Datas e Cronograma */}
                <div className="view-section">
                  <h4 className="section-title">📅 Datas e Cronograma</h4>
                  <div className="view-row">
                    <div className="view-group">
                      <label>Data de Cadastro:</label>
                      <span>{clienteModalData.data_cadastro ? formatarData(clienteModalData.data_cadastro) : 'N/A'}</span>
                    </div>
                    <div className="view-group">
                      <label>Data da Instalação:</label>
                      <span>{clienteModalData.data_instalacao ? formatarData(clienteModalData.data_instalacao) : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Seção 3: Especificações Técnicas */}
                <div className="view-section">
                  <h4 className="section-title">⚡ Especificações Técnicas</h4>
                  <div className="view-row">
                    <div className="view-group">
                      <label>Tipo de Serviço:</label>
                      <span>{clienteModalData.tipo_servico?.nome || 'N/A'}</span>
                    </div>
                    <div className="view-group">
                      <label>Tipo de Padrão:</label>
                      <span>{clienteModalData.tipo_padrao?.nome || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="view-row">
                    <div className="view-group">
                      <label>Quantidade de Módulos:</label>
                      <span>{clienteModalData.quantidade_modulos || 'N/A'}</span>
                    </div>
                    <div className="view-group">
                      <label>Equipe Responsável:</label>
                      <span>{clienteModalData.equipe?.nome || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Seção 4: Status e Acompanhamento */}
                <div className="view-section">
                  <h4 className="section-title">📊 Status e Acompanhamento</h4>
                  <div className="view-row">
                    <div className="view-group">
                      <label>Status:</label>
                      <span className={`status-badge status-${clienteModalData.status_info?.status?.toLowerCase() || 'pendente'}`}>
                        {clienteModalData.status_info?.status === 'Pendente' ? '⏳ Pendente' : 
                         clienteModalData.status_info?.status === 'Em andamento' ? '🔄 Em Andamento' : 
                         clienteModalData.status_info?.status === 'Finalizado' ? '✅ Finalizado' : 
                         clienteModalData.status_info?.status === 'Validado' ? '🔍 Validado' : 
                         '⏳ Pendente'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seção 5: Configurações e Opções */}
                <div className="view-section">
                  <h4 className="section-title">⚙️ Configurações e Opções</h4>
                  <div className="view-row">
                    <div className="view-group">
                                          <label>Deslocamento para Buscar Material:</label>
                    <span className={clienteModalData.deslocamento_buscar_material ? 'check-yes' : 'check-no'}>
                      {clienteModalData.deslocamento_buscar_material ? '✅ Sim' : '❌ Não'}
                    </span>
                    </div>
                    <div className="view-group">
                      <label>Configuração do Inversor:</label>
                      <span className={clienteModalData.configuracao_inversor ? 'check-yes' : 'check-no'}>
                        {clienteModalData.configuracao_inversor ? '✅ Sim' : '❌ Não'}
                      </span>
                    </div>
                  </div>
                  <div className="view-row">
                    <div className="view-group">
                      <label>Obra Civil:</label>
                      <span className={clienteModalData.obra_civil ? 'check-yes' : 'check-no'}>
                        {clienteModalData.obra_civil ? '✅ Sim' : '❌ Não'}
                      </span>
                    </div>
                    <div className="view-group">
                      <label>Obra Cancelada:</label>
                      <span className={clienteModalData.obra_cancelada ? 'check-yes' : 'check-no'}>
                        {clienteModalData.obra_cancelada ? '✅ Sim' : '❌ Não'}
                      </span>
                    </div>
                  </div>
                  <div className="view-group">
                    <label>Nota de Material:</label>
                    <span className={clienteModalData.nota_material ? 'check-yes' : 'check-no'}>
                      {clienteModalData.nota_material ? '✅ Sim' : '❌ Não'}
                    </span>
                  </div>
                </div>

                {/* Seção 6: Observações */}
                {clienteModalData.observacoes && (
                  <div className="view-section">
                    <h4 className="section-title">📝 Observações</h4>
                    <div className="view-group">
                      <label>Observações:</label>
                      <span className="observacoes-text">{clienteModalData.observacoes}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" onClick={closeClienteModal} className="cancel-button">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal para Alterar Senha */}
        {showChangePasswordForm && (
          <div className="form-overlay">
            <div className="form-modal">
              <div className="modal-header">
                <h3>🔐 Alterar Senha</h3>
                <button onClick={closeChangePasswordForm} className="close-button">×</button>
              </div>
              
              <form onSubmit={handleChangePassword} className="change-password-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Senha Atual: *</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={changePasswordData.currentPassword}
                    onChange={(e) => setChangePasswordData({...changePasswordData, currentPassword: e.target.value})}
                    placeholder="Digite sua senha atual"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">Nova Senha: *</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={changePasswordData.newPassword}
                    onChange={(e) => setChangePasswordData({...changePasswordData, newPassword: e.target.value})}
                    placeholder="Digite a nova senha (mín. 6 caracteres)"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar Nova Senha: *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={changePasswordData.confirmPassword}
                    onChange={(e) => setChangePasswordData({...changePasswordData, confirmPassword: e.target.value})}
                    placeholder="Confirme a nova senha"
                    required
                  />
                </div>
                
                {passwordError && (
                  <div className="error-message">
                    ❌ {passwordError}
                  </div>
                )}
                
                {passwordSuccess && (
                  <div className="success-message">
                    ✅ {passwordSuccess}
                  </div>
                )}
                
                <div className="form-actions">
                  <button type="button" onClick={closeChangePasswordForm} className="cancel-button">
                    Cancelar
                  </button>
                  <button type="submit" className="submit-button">
                    Alterar Senha
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Modal de confirmação de saída */}
        {showLogoutConfirmation && (
          <div className="form-overlay">
            <div className="form-modal logout-confirmation-modal">
              <div className="modal-header">
                <h3>🚪 Confirmar Saída</h3>
                <button onClick={closeLogoutConfirmation} className="close-button">×</button>
              </div>

              <div className="logout-confirmation-content">
                <div className="logout-icon">🚪</div>
                <h4>Tem certeza que deseja sair?</h4>
                <p>Você será desconectado do sistema e redirecionado para a tela de login.</p>
              </div>

              <div className="form-actions">
                <button type="button" onClick={closeLogoutConfirmation} className="cancel-button">
                  ❌ Cancelar
                </button>
                <button type="button" onClick={confirmLogout} className="confirm-logout-button">
                  ✅ Sim, Sair
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Welcome
