// Configurações de segurança e validação

// Sistema de logging configurável
const isDevelopment = process.env.NODE_ENV === 'development'

const logger = {
  debug: (...args) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args)
    }
  },
  info: (...args) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args)
    }
  },
  warn: (...args) => {
    console.warn('[WARN]', ...args)
  },
  error: (...args) => {
    console.error('[ERROR]', ...args)
  }
}

export const SECURITY_CONFIG = {
  // Configurações de senha
  PASSWORD: {
    MIN_LENGTH: 6,
    REQUIRE_UPPERCASE: false,
    REQUIRE_LOWERCASE: false,
    REQUIRE_NUMBERS: false,
    REQUIRE_SPECIAL_CHARS: false
  },
  
  // Configurações de email
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 254
  },
  
  // Configurações de nome
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  },
  
  // Configurações de sessão
  SESSION: {
    TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas em milissegundos
    AUTO_REFRESH: true
  }
}

// Definição dos roles e suas permissões
export const USER_ROLES = {
  ADMINISTRADOR: 'administrador',
  ADMINISTRATIVO: 'administrativo',
  INSTALADOR: 'instalador'
}

// Permissões para cada funcionalidade
export const PERMISSIONS = {
  // Gerenciamento de usuários
  USER_MANAGEMENT: {
    CREATE: [USER_ROLES.ADMINISTRADOR],
    READ: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO],
    UPDATE: [USER_ROLES.ADMINISTRADOR],
    DELETE: [USER_ROLES.ADMINISTRADOR],
    CHANGE_STATUS: [USER_ROLES.ADMINISTRADOR]
  },
  
  // Gerenciamento de clientes
  CLIENT_MANAGEMENT: {
    CREATE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO, USER_ROLES.INSTALADOR],
    READ: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO, USER_ROLES.INSTALADOR],
    UPDATE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO],
    DELETE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO],
    EDIT: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO],
    REMOVE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO],
    CONCLUDE_WORK: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO, USER_ROLES.INSTALADOR]
  },
  
  // Lista de presença
  ATTENDANCE_LIST: {
    CREATE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO, USER_ROLES.INSTALADOR],
    READ: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO, USER_ROLES.INSTALADOR],
    UPDATE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO],
    DELETE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO]
  },
  
  // Dashboard e relatórios
  DASHBOARD: {
    ACCESS: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO, USER_ROLES.INSTALADOR]
  },
  
  // Gerenciamento de colaboradores
  COLLABORATOR_MANAGEMENT: {
    CREATE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO],
    READ: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO, USER_ROLES.INSTALADOR],
    UPDATE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO],
    DELETE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO],
    CHANGE_STATUS: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO]
  },
  
  // Gerenciamento de veículos
  VEHICLE_MANAGEMENT: {
    CREATE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO],
    READ: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO, USER_ROLES.INSTALADOR],
    UPDATE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO],
    DELETE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO],
    CHANGE_STATUS: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO]
  },
  
  // Gerenciamento de cargos
  CARGO_MANAGEMENT: {
    CREATE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO],
    READ: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO, USER_ROLES.INSTALADOR],
    UPDATE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO],
    DELETE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO],
    CHANGE_STATUS: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO]
  },
  
  // Gerenciamento de usuários instaladores para clientes
  INSTALLER_USER_MANAGEMENT: {
    ASSIGN: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO],
    READ: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO, USER_ROLES.INSTALADOR],
    CHANGE: [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO]
  }
}

// Funções de validação
export const validators = {
  // Validar email
  isValidEmail: (email) => {
    if (!email || typeof email !== 'string') return false
    return SECURITY_CONFIG.EMAIL.REGEX.test(email) && 
           email.length <= SECURITY_CONFIG.EMAIL.MAX_LENGTH
  },
  
  // Validar senha
  isValidPassword: (password) => {
    if (!password || typeof password !== 'string') return false
    if (password.length < SECURITY_CONFIG.PASSWORD.MIN_LENGTH) return false
    
    if (SECURITY_CONFIG.PASSWORD.REQUIRE_UPPERCASE && 
        !/[A-Z]/.test(password)) return false
    
    if (SECURITY_CONFIG.PASSWORD.REQUIRE_LOWERCASE && 
        !/[a-z]/.test(password)) return false
    
    if (SECURITY_CONFIG.PASSWORD.REQUIRE_NUMBERS && 
        !/\d/.test(password)) return false
    
    if (SECURITY_CONFIG.PASSWORD.REQUIRE_SPECIAL_CHARS && 
        !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false
    
    return true
  },
  
  // Validar nome
  isValidName: (name) => {
    if (!name || typeof name !== 'string') return false
    const trimmedName = name.trim()
    return trimmedName.length >= SECURITY_CONFIG.NAME.MIN_LENGTH && 
           trimmedName.length <= SECURITY_CONFIG.NAME.MAX_LENGTH
  },
  
  // Sanitizar entrada de texto
  sanitizeText: (text) => {
    if (!text || typeof text !== 'string') return ''
    return text.trim().replace(/[<>]/g, '') // Remover caracteres potencialmente perigosos
  }
}

// Funções de segurança
export const security = {
  // Verificar se o usuário tem permissão para uma ação
  canPerformAction: (user, action, targetUser = null) => {
    if (!user) return false
    
    switch (action) {
      case 'edit_user':
        return user.id === targetUser?.id || user.role === 'admin'
      case 'delete_user':
        return user.id !== targetUser?.id && (user.role === 'admin' || user.role === 'manager')
      case 'change_status':
        return user.id !== targetUser?.id || user.role === 'admin'
      default:
        return false
    }
  },
  
  // Verificar se a sessão ainda é válida
  isSessionValid: (lastActivity) => {
    if (!lastActivity) return false
    const now = Date.now()
    const timeDiff = now - lastActivity
    return timeDiff < SECURITY_CONFIG.SESSION.TIMEOUT
  },
  
  // Verificar permissão baseada no role do usuário
  hasPermission: (userRole, permission, action) => {
    if (!userRole || !permission || !action) {
      return false
    }
    
    const permissionConfig = PERMISSIONS[permission]
    if (!permissionConfig) {
      return false
    }
    
    const allowedRoles = permissionConfig[action]
    if (!allowedRoles) {
      return false
    }
    
    return allowedRoles.includes(userRole)
  },
  
  // Verificar se o usuário pode acessar um menu específico
  canAccessMenu: (userRole, menuName) => {
    if (!userRole) return false
    
    switch (menuName) {
      case 'usuarios':
        return [USER_ROLES.ADMINISTRADOR].includes(userRole)
      case 'clientes':
        return [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO, USER_ROLES.INSTALADOR].includes(userRole)
      case 'presenca':
        return [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO, USER_ROLES.INSTALADOR].includes(userRole)
      case 'colaboradores':
        return [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO].includes(userRole)
      case 'veiculos':
        return [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO].includes(userRole)
      case 'cargos':
        return [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO].includes(userRole)
      case 'dashboard':
        return [USER_ROLES.ADMINISTRADOR, USER_ROLES.ADMINISTRATIVO, USER_ROLES.INSTALADOR].includes(userRole)
      default:
        return false
    }
  },
  
  // Obter o nome amigável do role
  getRoleDisplayName: (role) => {
    switch (role) {
      case USER_ROLES.ADMINISTRADOR:
        return 'Administrador'
      case USER_ROLES.ADMINISTRATIVO:
        return 'Administrativo'
      case USER_ROLES.INSTALADOR:
        return 'Instalador'
      default:
        return 'Usuário'
    }
  }
}
