import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { validators } from '../config/security'
import './Auth.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    
    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres')
      return false
    }
    
    return true
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    
    // Validar formulário antes de enviar
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) throw error

      if (data.user) {
        // Verificar se o usuário está ativo
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('status')
            .eq('id', data.user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Erro ao verificar perfil:', profileError)
          }

          // Se o perfil existe e o usuário está desativado, impedir login
          if (profile && profile.status === 'desativado') {
            await supabase.auth.signOut()
            setError('Usuário desativado. Entre em contato com o administrador.')
            return
          }

          // Se não há perfil, criar um padrão ativo
          if (!profile) {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email,
                nome: data.user.email?.split('@')[0] || 'Usuário',
                status: 'ativo',
                created_at: new Date().toISOString()
              })

            if (insertError) {
              console.error('Erro ao criar perfil padrão:', insertError)
            }
          }

          navigate('/welcome')
        } catch (profileError) {
          console.error('Erro ao verificar status do usuário:', profileError)
          // Em caso de erro, permitir login mas criar perfil padrão
          try {
            await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email,
                nome: data.user.email?.split('@')[0] || 'Usuário',
                status: 'ativo',
                created_at: new Date().toISOString()
              })
          } catch (insertError) {
            console.error('Erro ao criar perfil padrão:', insertError)
          }
          navigate('/welcome')
        }
      }
    } catch (error) {
      // Tratamento específico de erros de autenticação
      let userMessage = 'Erro no login. Tente novamente.'
      
      if (error.message.includes('Invalid login credentials')) {
        userMessage = 'Email ou senha incorretos'
      } else if (error.message.includes('Email not confirmed')) {
        userMessage = 'Email não confirmado. Verifique sua caixa de entrada.'
      } else if (error.message.includes('Too many requests')) {
        userMessage = 'Muitas tentativas. Aguarde um momento e tente novamente.'
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
        
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
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
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-links">
          <p>Não tem uma conta? <button onClick={() => navigate('/register')} className="link-button">Cadastre-se</button></p>
        </div>
      </div>
    </div>
  )
}

export default Login
