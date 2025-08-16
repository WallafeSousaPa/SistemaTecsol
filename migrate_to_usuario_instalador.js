// Script de migração para aplicar todas as mudanças de gerente_id para usuario_instalador_id
// Execute este script APÓS executar o SQL update_clientes_usuario_instalador.sql

const changes = [
  // 1. Substituir estado gerentes por usuariosInstaladores
  {
    search: "const [gerentes, setGerentes] = useState([])",
    replace: "const [usuariosInstaladores, setUsuariosInstaladores] = useState([])"
  },
  
  // 2. Substituir estado clienteFormData.gerente_id
  {
    search: "gerente_id: ''",
    replace: "usuario_instalador_id: ''"
  },
  
  // 3. Substituir filtrosCliente.gerenteId
  {
    search: "gerenteId: ''",
    replace: "usuarioInstaladorId: ''"
  },
  
  // 4. Substituir função loadGerentes por loadUsuariosInstaladores
  {
    search: "const loadGerentes = useCallback(async () => {",
    replace: "const loadUsuariosInstaladores = useCallback(async () => {"
  },
  
  // 5. Substituir lógica da função loadGerentes
  {
    search: `  const loadGerentes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('gerentes')
        .select('*')
        .order('nome')

      if (error) {
        if (error.code === '42P01') {
          // Tabela gerentes não existe ainda
          console.log('Tabela gerentes não existe ainda. Execute o script SQL primeiro.')
          setGerentes([])
        } else if (error.code !== 'PGRST116') {
          console.error('Erro ao carregar gerentes:', error)
          setGerentes([])
        }
        return
      }

      setGerentes(data || [])
    } catch (error) {
      console.error('Erro ao carregar gerentes:', error)
      setGerentes([])
    }
  }, [])`,
    replace: `  const loadUsuariosInstaladores = useCallback(async () => {
    try {
      // Buscar usuários com cargo de instalador
      const { data, error } = await supabase
        .from('profiles')
        .select(\`
          id,
          nome,
          email,
          cargos!inner(cargo)
        \`)
        .eq('cargos.cargo', 'Instalador')
        .eq('ativo', true)
        .order('nome')

      if (error) {
        console.error('Erro ao carregar usuários instaladores:', error)
        setUsuariosInstaladores([])
        return
      }

      setUsuariosInstaladores(data || [])
    } catch (error) {
      console.error('Erro ao carregar usuários instaladores:', error)
      setUsuariosInstaladores([])
    }
  }, [])`
  },
  
  // 6. Substituir chamadas para loadGerentes
  {
    search: "loadGerentes()",
    replace: "loadUsuariosInstaladores()"
  },
  
  // 7. Substituir dependência no useEffect
  {
    search: "loadGerentes, loadEquipes",
    replace: "loadUsuariosInstaladores, loadEquipes"
  },
  
  // 8. Substituir limparFiltrosClientes
  {
    search: "gerenteId: ''",
    replace: "usuarioInstaladorId: ''"
  },
  
  // 9. Substituir filtro por gerente
  {
    search: `    // Filtro por gerente
    if (filtrosCliente.gerenteId) {
      filtrados = filtrados.filter(cliente => 
        cliente.gerente_id === filtrosCliente.gerenteId
      )
    }`,
    replace: `    // Filtro por usuário instalador
    if (filtrosCliente.usuarioInstaladorId) {
      filtrados = filtrados.filter(cliente => 
        cliente.usuario_instalador_id === filtrosCliente.usuarioInstaladorId
      )
    }`
  },
  
  // 10. Substituir filtro no formulário
  {
    search: `          <div className="filtro-item">
            <label htmlFor="filtro-gerente">Gerente:</label>
            <select
              id="filtro-gerente"
              value={filtrosCliente.gerenteId}
              onChange={(e) => setFiltrosCliente({...filtrosCliente, gerenteId: e.target.value})}
            >
              <option value="">Todos os gerentes</option>
              {gerentes.map((gerente) => (
                <option key={gerente.id} value={gerente.id}>{gerente.nome}</option>
              ))}
            </select>
          </div>`,
    replace: `          <div className="filtro-item">
            <label htmlFor="filtro-usuario-instalador">Usuário Instalador:</label>
            <select
              id="filtro-usuario-instalador"
              value={filtrosCliente.usuarioInstaladorId}
              onChange={(e) => setFiltrosCliente({...filtrosCliente, usuarioInstaladorId: e.target.value})}
            >
              <option value="">Todos os usuários instaladores</option>
              {usuariosInstaladores.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>{usuario.nome}</option>
              ))}
            </select>
          </div>`
  },
  
  // 11. Substituir campo no formulário
  {
    search: `                  <div className="form-group">
                    <label htmlFor="gerente">Gerente Responsável pela Obra:</label>
                    <select 
                      id="gerente" 
                      value={clienteFormData.gerente_id} 
                      onChange={(e) => setClienteFormData({...clienteFormData, gerente_id: e.target.value})}
                    >
                      <option value="">Selecione um gerente</option>
                      {gerentes.map((gerente) => (
                        <option key={gerente.id} value={gerente.id}>{gerente.nome}</option>
                      ))}
                    </select>
                  </div>`,
    replace: `                  <div className="form-group">
                    <label htmlFor="usuario_instalador">Usuário Instalador Responsável pela Obra:</label>
                    <select 
                      id="usuario_instalador" 
                      value={clienteFormData.usuario_instalador_id} 
                      onChange={(e) => setClienteFormData({...clienteFormData, usuario_instalador_id: e.target.value})}
                    >
                      <option value="">Selecione um usuário instalador</option>
                      {usuariosInstaladores.map((usuario) => (
                        <option key={usuario.id} value={usuario.id}>{usuario.nome}</option>
                      ))}
                    </select>
                  </div>`
  },
  
  // 12. Substituir validação
  {
    search: "if (!clienteFormData.gerente_id) {",
    replace: "if (!clienteFormData.usuario_instalador_id) {"
  },
  {
    search: "showNotification('Por favor, selecione o gerente responsável.', 'error')",
    replace: "showNotification('Por favor, selecione o usuário instalador responsável.', 'error')"
  },
  
  // 13. Substituir handleEditClienteInternal
  {
    search: "gerente_id: cliente.gerente_id || ''",
    replace: "usuario_instalador_id: cliente.usuario_instalador_id || ''"
  },
  
  // 14. Substituir openNewClienteForm
  {
    search: "gerente_id: ''",
    replace: "usuario_instalador_id: ''"
  },
  
  // 15. Substituir closeClienteForm
  {
    search: "gerente_id: ''",
    replace: "usuario_instalador_id: ''"
  },
  
  // 16. Substituir cabeçalho da tabela
  {
    search: "<th>Gerente Responsável</th>",
    replace: "<th>Usuário Instalador</th>"
  },
  
  // 17. Substituir célula da tabela
  {
    search: "{cliente.gerente?.nome || 'N/A'}",
    replace: "{cliente.usuario_instalador?.nome || 'N/A'}"
  },
  
  // 18. Substituir JOINs na consulta
  {
    search: "gerente:gerente_id(nome)",
    replace: "usuario_instalador:usuario_instalador_id(nome)"
  }
];

console.log('Script de migração criado com sucesso!');
console.log('Execute as seguintes etapas:');
console.log('1. Execute o SQL: update_clientes_usuario_instalador.sql');
console.log('2. Aplique as mudanças no código usando este script');
console.log('3. Reinicie a aplicação');
console.log('4. Teste a funcionalidade');

export default changes;
