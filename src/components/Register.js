import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { USER_ROLES, validators } from '../config/security'
import './Auth.css'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Função para tratamento consistente de erros
  const handleError = (error, userMessage) => {
    console.error('Erro técnico:', error)
    setError(userMessage || 'Ocorreu um erro inesperado. Tente novamente.')
  }

  // Validação do formulário
  const validateForm = () => {
    if (!email.trim()) {
      setError('Email é obrigatório')
      return false
    }
    
    if (!validators.isValidEmail(email)) {
      setError('Email inválido')
      return false
    }
    
    if (!password.trim()) {
      setError('Senha é obrigatória')
      return false
    }
    
    if (!validators.isValidPassword(password)) {
      setError('Senha deve ter pelo menos 6 caracteres')
      return false
    }
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return false
    }
    
    return true
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    
    // Validar formulário antes de enviar
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password
      })

      if (error) throw error

      if (data.user) {
        // Criar perfil padrão para o novo usuário
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              nome: data.user.email?.split('@')[0] || 'Usuário',
              status: 'ativo',
              role: USER_ROLES.INSTALADOR, // Role padrão para novos usuários
              created_at: new Date().toISOString()
            })

          if (profileError) {
            console.error('Erro ao criar perfil:', profileError)
          }
        } catch (profileError) {
          console.error('Erro ao criar perfil:', profileError)
        }

        alert('Cadastro realizado com sucesso! Faça login para continuar.')
        navigate('/login')
      }
    } catch (error) {
      // Tratamento específico de erros de registro
      let userMessage = 'Erro no cadastro. Tente novamente.'
      
      if (error.message.includes('User already registered')) {
        userMessage = 'Este email já está cadastrado. Faça login ou use outro email.'
      } else if (error.message.includes('Password should be at least')) {
        userMessage = 'Senha muito curta. Use pelo menos 6 caracteres.'
      } else if (error.message.includes('Invalid email')) {
        userMessage = 'Email inválido. Verifique o formato.'
      }
      
      handleError(error, userMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo da empresa */}
        <div className="company-logo">
          <img 
            src="/logo-empresa.png" 
            alt="Logo da Empresa" 
            className="logo-image"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <div className="logo-placeholder" style={{ display: 'none' }}>
            <div className="logo-text">LOGO</div>
          </div>
        </div>
        
        <h2>Cadastro</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Digite seu email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Digite sua senha"
              minLength="6"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirme sua senha"
              minLength="6"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="auth-links">
          <p>Já tem uma conta? <button onClick={() => navigate('/login')} className="link-button">Faça login</button></p>
        </div>
      </div>
    </div>
  )
}

export default Register
