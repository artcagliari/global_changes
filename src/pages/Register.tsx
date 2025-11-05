import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'student'>('student')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validações
    if (!name.trim()) {
      setError('Nome é obrigatório')
      return
    }

    if (!email.trim()) {
      setError('Email é obrigatório')
      return
    }

    if (password.length < 3) {
      setError('Senha deve ter pelo menos 3 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('Senhas não coincidem')
      return
    }

    try {
      setIsLoading(true)

      // Criar usuário via API
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role: role,
          points: 0
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar conta')
      }

      setSuccess('Conta criada com sucesso! Redirecionando para o login...')
      
      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 25%, #0ea5e9 50%, #0284c7 75%, #06b6d4 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      position: 'relative',
      overflow: 'hidden',
      padding: '2rem'
    }}>
      {/* Efeitos de nuvens */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        left: '-50px',
        width: '300px',
        height: '200px',
        background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(30px)',
        animation: 'floatCloud 12s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '-80px',
        width: '250px',
        height: '180px',
        background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(25px)',
        animation: 'floatCloud 15s ease-in-out infinite reverse',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '10%',
        width: '280px',
        height: '200px',
        background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(35px)',
        animation: 'floatCloud 18s ease-in-out infinite 3s',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '5%',
        width: '200px',
        height: '150px',
        background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(28px)',
        animation: 'floatCloud 14s ease-in-out infinite 1.5s',
        zIndex: 0
      }} />

      {/* Elementos naturais decorativos */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '8%',
        fontSize: '2.5rem',
        animation: 'float 6s ease-in-out infinite',
        opacity: 0.4
      }}>🌳</div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '12%',
        fontSize: '2rem',
        animation: 'float 8s ease-in-out infinite 2s',
        opacity: 0.4
      }}>🌿</div>
      <div style={{
        position: 'absolute',
        top: '70%',
        left: '5%',
        fontSize: '1.8rem',
        animation: 'float 7s ease-in-out infinite 1s',
        opacity: 0.3
      }}>💧</div>
      <div style={{
        position: 'absolute',
        bottom: '30%',
        left: '15%',
        fontSize: '2.2rem',
        animation: 'sparkle 3s ease-in-out infinite',
        opacity: 0.4
      }}>🍃</div>

      <form onSubmit={handleSubmit} className="login-form" style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        padding: '3rem',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(16, 185, 129, 0.2)',
        width: '100%',
        maxWidth: '500px',
        position: 'relative',
        zIndex: 1,
        animation: 'slideInUp 0.6s ease-out',
        border: '2px solid rgba(255, 255, 255, 0.5)'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '2rem',
          fontSize: '2.5rem',
          background: 'linear-gradient(45deg, #10b981, #059669, #0ea5e9, #0284c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 5s ease infinite'
        }}>
          Registro - Global Changes
        </h2>
        
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="name" style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#4a5568',
            fontWeight: '600',
            fontSize: '1rem'
          }}>
            <span style={{ marginRight: '0.5rem' }}>👤</span>Nome:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              background: 'white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981'
              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1), 0 4px 12px rgba(16, 185, 129, 0.2)'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
              e.target.style.transform = 'translateY(0)'
            }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="email" style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#4a5568',
            fontWeight: '600',
            fontSize: '1rem'
          }}>
            <span style={{ marginRight: '0.5rem' }}>📧</span>Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              background: 'white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981'
              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1), 0 4px 12px rgba(16, 185, 129, 0.2)'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
              e.target.style.transform = 'translateY(0)'
            }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#4a5568',
            fontWeight: '600',
            fontSize: '1rem'
          }}>
            <span style={{ marginRight: '0.5rem' }}>🔒</span>Senha:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 3 caracteres"
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              background: 'white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981'
              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1), 0 4px 12px rgba(16, 185, 129, 0.2)'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
              e.target.style.transform = 'translateY(0)'
            }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="confirmPassword" style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#4a5568',
            fontWeight: '600',
            fontSize: '1rem'
          }}>
            <span style={{ marginRight: '0.5rem' }}>🔐</span>Confirmar Senha:
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Digite a senha novamente"
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              background: 'white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981'
              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1), 0 4px 12px rgba(16, 185, 129, 0.2)'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
              e.target.style.transform = 'translateY(0)'
            }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="role" style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#4a5568',
            fontWeight: '600',
            fontSize: '1rem'
          }}>
            <span style={{ marginRight: '0.5rem' }}>🎓</span>Tipo de Conta:
          </label>
          <input
            type="text"
            id="role"
            value="Aluno"
            disabled
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              fontSize: '1rem',
              background: '#f1f5f9',
              color: '#64748b',
              cursor: 'not-allowed'
            }}
          />
          <small style={{
            display: 'block',
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            color: '#64748b',
            fontStyle: 'italic'
          }}>
            Apenas alunos podem se registrar. Administradores são criados pelo sistema.
          </small>
        </div>

        {error && (
          <p className="error-message" style={{
            color: '#ef4444',
            background: '#fee2e2',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '2px solid #fecaca',
            animation: 'slideInUp 0.3s ease-out'
          }}>⚠️ {error}</p>
        )}
        
        {success && (
          <p className="success-message" style={{
            color: '#065f46',
            background: '#d1fae5',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '2px solid #86efac',
            animation: 'slideInUp 0.3s ease-out'
          }}>✅ {success}</p>
        )}
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '1rem 2rem',
            background: isLoading 
              ? 'linear-gradient(135deg, #94a3b8, #64748b)' 
              : 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            marginBottom: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            opacity: isLoading ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)'
            }
          }}
        >
          <span style={{ position: 'relative', zIndex: 1 }}>
            {isLoading ? '⏳ Criando conta...' : '🚀 Criar Conta'}
          </span>
        </button>
        
        <p className="login-link" style={{
          textAlign: 'center',
          color: '#64748b',
          marginTop: '1.5rem'
        }}>
          Já tem uma conta?{' '}
          <a href="/login" style={{
            color: '#10b981',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            borderBottom: '2px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#0ea5e9'
            e.currentTarget.style.borderBottomColor = '#0ea5e9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#10b981'
            e.currentTarget.style.borderBottomColor = 'transparent'
          }}
          >
            Faça login aqui ✨
          </a>
        </p>
      </form>
    </div>
  )
}

export default Register
