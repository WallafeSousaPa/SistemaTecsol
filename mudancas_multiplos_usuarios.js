// MUDANÇAS NECESSÁRIAS PARA SUPORTAR MÚLTIPLOS USUÁRIOS

// 1. ATUALIZAR ESTADO INICIAL (linha ~50)
// Mudar de:
id_profile: '',
// Para:
id_profiles: [], // Array para múltiplos usuários

// 2. ATUALIZAR FILTROS (linha ~74)
// Mudar de:
idProfile: '',
// Para:
idProfiles: [], // Array para múltiplos usuários

// 3. ATUALIZAR FILTROS (linha ~498)
// Mudar de:
idProfile: '',
// Para:
idProfiles: [], // Array para múltiplos usuários

// 4. ATUALIZAR FUNÇÃO openNewClienteForm (linha ~1453)
// Mudar de:
id_profile: '',
// Para:
id_profiles: [], // Array para múltiplos usuários

// 5. ATUALIZAR FUNÇÃO closeClienteForm (linha ~1480)
// Mudar de:
id_profile: '',
// Para:
id_profiles: [], // Array para múltiplos usuários

// 6. ATUALIZAR FUNÇÃO handleEditClienteInternal (linha ~1461)
// Mudar de:
usuario_instalador_id: cliente.usuario_instalador_id || '',
// Para:
id_profiles: cliente.id_profiles || [],

// 7. ATUALIZAR FILTRO POR USUÁRIO
// Mudar de:
if (filtrosCliente.idProfile) {
  filtrados = filtrados.filter(cliente => 
    cliente.id_profile === filtrosCliente.idProfile
  )
}
// Para:
if (filtrosCliente.idProfiles && filtrosCliente.idProfiles.length > 0) {
  filtrados = filtrados.filter(cliente => 
    cliente.id_profiles && cliente.id_profiles.some(profileId => 
      filtrosCliente.idProfiles.includes(profileId)
    )
  )
}

// 8. ATUALIZAR VALIDAÇÃO
// Mudar de:
if (!clienteFormData.id_profile) {
  showNotification('Por favor, selecione o usuário responsável.', 'error')
  return
}
// Para:
if (!clienteFormData.id_profiles || clienteFormData.id_profiles.length === 0) {
  showNotification('Por favor, selecione pelo menos um usuário responsável.', 'error')
  return
}

// 9. ATUALIZAR FILTRO NO FORMULÁRIO
// Mudar de:
value={filtrosCliente.idProfile}
onChange={(e) => setFiltrosCliente({...filtrosCliente, idProfile: e.target.value})}
// Para:
value={filtrosCliente.idProfiles}
onChange={(e) => {
  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
  setFiltrosCliente({...filtrosCliente, idProfiles: selectedOptions})
}}
multiple

// 10. ATUALIZAR CAMPO NO FORMULÁRIO
// Mudar de:
value={clienteFormData.id_profile}
onChange={(e) => setClienteFormData({...clienteFormData, id_profile: e.target.value})}
// Para:
value={clienteFormData.id_profiles}
onChange={(e) => {
  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
  setClienteFormData({...clienteFormData, id_profiles: selectedOptions})
}}
multiple

// 11. ATUALIZAR LABEL DO FILTRO
// Mudar de:
<label htmlFor="filtro-profile">Usuário:</label>
// Para:
<label htmlFor="filtro-profiles">Usuários:</label>

// 12. ATUALIZAR LABEL DO CAMPO
// Mudar de:
<label htmlFor="id_profile">Usuário Responsável pela Obra:</label>
// Para:
<label htmlFor="id_profiles">Usuários Responsáveis pela Obra:</label>

// 13. ATUALIZAR OPTIONS DO FILTRO
// Mudar de:
<option value="">Todos os usuários</option>
// Para:
<option value="">Todos os usuários</option>

// 14. ATUALIZAR OPTIONS DO CAMPO
// Mudar de:
<option value="">Selecione um usuário</option>
// Para:
<option value="">Selecione um ou mais usuários</option>

// 15. ATUALIZAR CABEÇALHO DA TABELA
// Mudar de:
<th>Usuário Responsável</th>
// Para:
<th>Usuários Responsáveis</th>

// 16. ATUALIZAR CÉLULA DA TABELA
// Mudar de:
<td>{cliente.profile?.nome || 'N/A'}</td>
// Para:
<td>
  {cliente.profiles && cliente.profiles.length > 0 
    ? cliente.profiles.map(profile => profile.nome).join(', ')
    : 'N/A'
  }
</td>

// 17. ATUALIZAR CONSULTAS (JOINs)
// Mudar de:
profile:id_profile(nome)
// Para:
profiles:clientes_usuarios!cliente_id(profile:profile_id(nome))

// 18. ATUALIZAR FUNÇÃO loadProfiles PARA FILTRAR APENAS INSTALADORES
// Adicionar filtro por cargo de instalador:
const { data, error } = await supabase
  .from('profiles')
  .select(`
    id,
    nome,
    email,
    role
  `)
  .eq('ativo', true)
  .eq('role', 'instalador') // Filtrar apenas instaladores
  .order('nome')
