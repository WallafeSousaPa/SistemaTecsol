import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabaseClient'
import { USER_ROLES } from '../config/constants'
import { security } from '../config/security'
import './Welcome.css'

const Welcome = () => {
  const navigate = useNavigate()
  
  // Estados básicos
  const [currentView, setCurrentView] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  
  // Estados para clientes
  const [clientes, setClientes] = useState([])
  const [showClienteForm, setShowClienteForm] = useState(false)
  const [editingCliente, setEditingCliente] = useState(null)
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
    obra_cancelada: false,
    nota_material: false,
    status: 'pendente'
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
    observacoes: ''
  })
  
  // Estados para equipes
  const [equipes, setEquipes] = useState([])
  
  // Estados para tipos de serviço
  const [tiposServico, setTiposServico] = useState([])
  
  // Estados para usuários
  const [usuariosInstaladores, setUsuariosInstaladores] = useState([])
  
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
  
  // Função para mostrar notificações
  const showNotification = (message, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
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
  
  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Carregar usuário atual
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          
          // Carregar perfil do usuário
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            setUserRole(profile.role)
          }
        }
        
        // Carregar dados básicos
        await Promise.all([
          loadEquipes(),
          loadTiposServico(),
          loadUsuariosInstaladores()
        ])
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error)
      }
    }
    
    loadInitialData()
  }, [])
  
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
        .order('nome')
      
      if (error) throw error
      setTiposServico(data || [])
    } catch (error) {
      console.error('Erro ao carregar tipos de serviço:', error)
    }
  }
  
  // Carregar usuários instaladores
  const loadUsuariosInstaladores = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, role')
        .in('role', ['instalador', 'administrador'])
        .order('nome')
      
      if (error) throw error
      setUsuariosInstaladores(data || [])
    } catch (error) {
      console.error('Erro ao carregar usuários instaladores:', error)
    }
  }
  
  // Carregar clientes
  const loadClientes = useCallback(async () => {
    try {
      let query = supabase
        .from('clientes')
        .select(`
          *,
          tipo_servico:tipo_servico_id(nome),
          tipo_padrao:tipo_padrao_id(nome),
          profiles:clientes_usuarios!cliente_id(profile:profile_id(nome)),
          equipe:equipe_id(nome)
        `)
        .order('data_cadastro', { ascending: false })
      
      const { data, error } = await query
      
      if (error) throw error
      setClientes(data || [])
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      setClientes([])
    }
  }, [])
  
  // Carregar presenças
  const loadPresencas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('presenca')
        .select(`
          *,
          cliente:cliente_id(nome_cliente),
          equipe:equipe_id(nome)
        `)
        .order('data_presenca', { ascending: false })
      
      if (error) throw error
      setPresencas(data || [])
    } catch (error) {
      console.error('Erro ao carregar presenças:', error)
      setPresencas([])
    }
  }, [])
  
  // Aplicar filtros aos clientes
  const aplicarFiltrosClientes = useCallback(() => {
    let filtrados = [...clientes]
    
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
  }, [clientes, filtrosCliente])
  
  // Clientes filtrados
  const clientesFiltrados = aplicarFiltrosClientes()
  
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
      obra_cancelada: false,
      nota_material: false,
      status: 'pendente'
    })
    setShowClienteForm(true)
  }
  
  // Fechar formulário de cliente
  const closeClienteForm = () => {
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
      obra_cancelada: false,
      nota_material: false,
      status: 'pendente'
    })
  }
  
  // Salvar cliente
  const handleClienteFormSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingCliente) {
        // Atualizar cliente existente
        const { error } = await supabase
          .from('clientes')
          .update(clienteFormData)
          .eq('id', editingCliente.id)
        
        if (error) throw error
        
        showNotification('Cliente atualizado com sucesso!', 'success')
      } else {
        // Criar novo cliente
        const { error } = await supabase
          .from('clientes')
          .insert([clienteFormData])
        
        if (error) throw error
        
        showNotification('Cliente cadastrado com sucesso!', 'success')
      }
      
      closeClienteForm()
      loadClientes()
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      showNotification('Erro ao salvar cliente: ' + error.message, 'error')
    }
  }
  
  // Editar cliente
  const handleEditCliente = (cliente) => {
    setEditingCliente(cliente)
    setClienteFormData({
      nome_cliente: cliente.nome_cliente || '',
      endereco: cliente.endereco || '',
      telefone: cliente.telefone || '',
      data_instalacao: cliente.data_instalacao || '',
      tipo_servico_id: cliente.tipo_servico_id || '',
      tipo_padrao_id: cliente.tipo_padrao_id || '',
      id_profiles: cliente.id_profiles || [],
      equipe_id: cliente.equipe_id || '',
      data_cadastro: cliente.data_cadastro || new Date().toISOString().split('T')[0],
      obra_cancelada: cliente.obra_cancelada || false,
      nota_material: cliente.nota_material || false,
      status: cliente.status || 'pendente'
    })
    setShowClienteForm(true)
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
      observacoes: ''
    })
    setShowPresencaForm(true)
  }
  
  // Fechar formulário de presença
  const closePresencaForm = () => {
    setShowPresencaForm(false)
    setEditingPresenca(null)
    setPresencaFormData({
      data_presenca: '',
      data_cadastro_preenchido: '',
      cliente_id: '',
      equipe_id: '',
      observacoes: ''
    })
  }
  
  // Salvar presença
  const handlePresencaFormSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingPresenca) {
        // Atualizar presença existente
        const { error } = await supabase
          .from('presenca')
          .update(presencaFormData)
          .eq('id', editingPresenca.id)
        
        if (error) throw error
        
        showNotification('Presença atualizada com sucesso!', 'success')
      } else {
        // Criar nova presença
        const { error } = await supabase
          .from('presenca')
          .insert([presencaFormData])
        
        if (error) throw error
        
        showNotification('Presença cadastrada com sucesso!', 'success')
      }
      
      closePresencaForm()
      loadPresencas()
    } catch (error) {
      console.error('Erro ao salvar presença:', error)
      showNotification('Erro ao salvar presença: ' + error.message, 'error')
    }
  }
  
  // Renderizar dashboard
  const renderDashboard = () => (
    <div className="menu-content">
      <div className="menu-header">
        <h2>Dashboard</h2>
        <p>Bem-vindo ao sistema de gestão de clientes e presenças</p>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{clientes.length}</h3>
          <p>Total de Clientes</p>
        </div>
        <div className="stat-card">
          <h3>{presencas.length}</h3>
          <p>Total de Presenças</p>
        </div>
        <div className="stat-card">
          <h3>{equipes.length}</h3>
          <p>Total de Equipes</p>
        </div>
      </div>
      
      <div className="quick-actions">
        <button onClick={() => setCurrentView('clientes')} className="action-button primary">
          👥 Gerenciar Clientes
        </button>
        <button onClick={() => setCurrentView('presenca')} className="action-button secondary">
          📋 Gerenciar Presenças
        </button>
      </div>
    </div>
  )
  
  // Renderizar lista de clientes
  const renderClientes = () => (
    <div className="menu-content">
      <div className="menu-header">
        <h2>Cadastro de Clientes</h2>
        <button onClick={() => setCurrentView('dashboard')} className="back-button">
          ← Voltar ao Dashboard
        </button>
      </div>
      
      {security.canAccessMenu(userRole, 'clientes') && (
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
        </div>
      </div>
      
      <div className="clientes-list">
        <h3>Clientes Cadastrados ({clientesFiltrados.length} de {clientes.length})</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome do Cliente</th>
                <th>Telefone</th>
                <th>Endereço</th>
                <th>Data da Instalação</th>
                <th>Tipo de Serviço</th>
                <th>Equipe</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    {clientes.length === 0 ? 'Nenhum cliente cadastrado ainda.' : 'Nenhum cliente encontrado com os filtros aplicados.'}
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.nome_cliente}</td>
                    <td>{cliente.telefone || 'N/A'}</td>
                    <td>{cliente.endereco || 'N/A'}</td>
                    <td>{formatarData(cliente.data_instalacao)}</td>
                    <td>{cliente.tipo_servico?.nome || 'N/A'}</td>
                    <td>{cliente.equipe?.nome || 'N/A'}</td>
                    <td>
                      <span className={`status-badge status-${cliente.status || 'pendente'}`}>
                        {cliente.status === 'pendente' && '⏳ Pendente'}
                        {cliente.status === 'em_andamento' && '🚧 Em Andamento'}
                        {cliente.status === 'finalizado' && '✅ Finalizado'}
                        {cliente.status === 'validado' && '🔍 Validado'}
                        {!cliente.status && '⏳ Pendente'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {security.hasPermission(userRole, 'CLIENT_MANAGEMENT', 'EDIT') && (
                          <button 
                            onClick={() => handleEditCliente(cliente)} 
                            className="action-btn small"
                            title="Editar cliente"
                          >
                            ✏️ Editar
                          </button>
                        )}
                        
                        {security.hasPermission(userRole, 'CLIENT_MANAGEMENT', 'REMOVE') && (
                          <button 
                            onClick={() => handleDeleteCliente(cliente)} 
                            className="action-btn small danger"
                            title="Excluir cliente"
                          >
                            🗑️ Remover
                          </button>
                        )}
                        
                        <button 
                          onClick={() => openNewPresencaForm(cliente)} 
                          className="action-btn small info"
                          title="Nova presença"
                        >
                          📋 Presença
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
                <th>Observações</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {presencas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    Nenhuma presença registrada ainda.
                  </td>
                </tr>
              ) : (
                presencas.map((presenca) => (
                  <tr key={presenca.id}>
                    <td>{formatarData(presenca.data_presenca)}</td>
                    <td>{presenca.cliente?.nome_cliente || 'N/A'}</td>
                    <td>{presenca.equipe?.nome || 'N/A'}</td>
                    <td>{presenca.observacoes || 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => {
                            setEditingPresenca(presenca)
                            setPresencaFormData({
                              data_presenca: presenca.data_presenca,
                              data_cadastro_preenchido: presenca.data_cadastro_preenchido,
                              cliente_id: presenca.cliente_id,
                              equipe_id: presenca.equipe_id,
                              observacoes: presenca.observacoes
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
      loadClientes()
      loadPresencas()
    }
  }, [userRole, loadClientes, loadPresencas])
  
  // Renderizar conteúdo baseado na view atual
  const renderContent = () => {
    switch (currentView) {
      case 'clientes':
        return renderClientes()
      case 'presenca':
        return renderPresenca()
      default:
        return renderDashboard()
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
        {/* Notificações */}
        <div className="notifications-container">
          {notifications.map((notification) => (
            <div key={notification.id} className={`notification ${notification.type}`}>
              {notification.message}
            </div>
          ))}
        </div>
        
        {/* Menu de navegação */}
        <nav className="welcome-nav">
          <div className="nav-brand">
            <h1>🏗️ TecSol Sistema</h1>
          </div>
          
          <div className="nav-menu">
            <button 
              onClick={() => setCurrentView('dashboard')} 
              className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            >
              📊 Dashboard
            </button>
            
            {security.canAccessMenu(userRole, 'clientes') && (
              <button 
                onClick={() => setCurrentView('clientes')} 
                className={`nav-item ${currentView === 'clientes' ? 'active' : ''}`}
              >
                👥 Clientes
              </button>
            )}
            
            {security.canAccessMenu(userRole, 'presenca') && (
              <button 
                onClick={() => setCurrentView('presenca')} 
                className={`nav-item ${currentView === 'presenca' ? 'active' : ''}`}
              >
                📋 Presenças
              </button>
            )}
          </div>
          
          <div className="nav-user">
            <span className="user-info">
              👤 {user?.email} ({userRole || 'Usuário'})
            </span>
            <button onClick={() => supabase.auth.signOut()} className="logout-button">
              🚪 Sair
            </button>
          </div>
        </nav>
        
        {/* Conteúdo principal */}
        <main className="welcome-main">
          {renderContent()}
        </main>
        
        {/* Formulário de Cliente */}
        {showClienteForm && (
          <div className="form-overlay">
            <div className="form-modal">
              <div className="modal-header">
                <h3>{editingCliente ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h3>
                <button onClick={closeClienteForm} className="close-button">×</button>
              </div>
              
              <form onSubmit={handleClienteFormSubmit} className="cliente-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nome_cliente">Nome do Cliente: *</label>
                    <input
                      type="text"
                      id="nome_cliente"
                      value={clienteFormData.nome_cliente}
                      onChange={(e) => setClienteFormData({...clienteFormData, nome_cliente: e.target.value})}
                      required
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
                  />
                </div>
                
                <div className="form-row">
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
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="equipe">Equipe:</label>
                    <select
                      id="equipe"
                      value={clienteFormData.equipe_id}
                      onChange={(e) => setClienteFormData({...clienteFormData, equipe_id: e.target.value})}
                    >
                      <option value="">Selecione uma equipe</option>
                      {equipes.map((equipe) => (
                        <option key={equipe.id} value={equipe.id}>{equipe.nome}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="status">Status:</label>
                    <select
                      id="status"
                      value={clienteFormData.status}
                      onChange={(e) => setClienteFormData({...clienteFormData, status: e.target.value})}
                    >
                      <option value="pendente">Pendente</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="finalizado">Finalizado</option>
                      <option value="validado">Validado</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={closeClienteForm} className="cancel-button">
                    Cancelar
                  </button>
                  <button type="submit" className="submit-button">
                    {editingCliente ? 'Atualizar' : 'Cadastrar'} Cliente
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
                <button onClick={closePresencaForm} className="close-button">×</button>
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
                    <label htmlFor="cliente_id">Cliente:</label>
                    <select
                      id="cliente_id"
                      value={presencaFormData.cliente_id}
                      onChange={(e) => setPresencaFormData({...presencaFormData, cliente_id: e.target.value})}
                    >
                      <option value="">Selecione um cliente (opcional)</option>
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
                  <button type="button" onClick={closePresencaForm} className="cancel-button">
                    Cancelar
                  </button>
                  <button type="submit" className="submit-button">
                    {editingPresenca ? 'Atualizar' : 'Cadastrar'} Presença
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Welcome
