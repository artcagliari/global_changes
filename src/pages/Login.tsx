import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const success = await login(email, password)

    if (success) {
      const user = useAuthStore.getState().currentUser
      if (user?.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } else {
      setError('Credenciais inválidas. (Tente admin@escola.com com a senha: 123)')
    }
  }

  return (
    <div className="login-page" style={{
      height: '100vh',
      maxHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 25%, #0ea5e9 50%, #0284c7 75%, #06b6d4 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      padding: '1rem',
      boxSizing: 'border-box',
      margin: 0
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

      <div style={{
        display: 'flex',
        gap: '2rem',
        width: '100%',
        maxWidth: '1200px',
        position: 'relative',
        zIndex: 1,
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        maxHeight: '100%',
        overflowY: 'auto'
      }}>
        <form onSubmit={handleSubmit} className="login-form" style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          padding: '3rem',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(16, 185, 129, 0.2)',
          flex: '0 1 450px',
          minWidth: '350px',
          position: 'relative',
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
          animation: 'gradientShift 5s ease infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <span>Global Changes</span>
        </h2>
        
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
            placeholder="aluno@escola.com"
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
            placeholder="123"
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
        
        <button type="submit" style={{
          width: '100%',
          padding: '1rem 2rem',
          background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)'
        }}
        >
          <span style={{ position: 'relative', zIndex: 1 }}>🚀 Entrar</span>
        </button>
        
        <p className="register-link" style={{
          textAlign: 'center',
          color: '#64748b',
          marginTop: '1.5rem',
          marginBottom: 0
        }}>
          Não tem uma conta?{' '}
          <a href="/register" style={{
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
            Registre-se aqui ✨
          </a>
        </p>
      </form>

      {/* Seção explicativa sobre o aplicativo e ODS 13 - ao lado direito */}
      <div style={{
        padding: '2.5rem',
        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #e0f2fe 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(16, 185, 129, 0.2)',
        flex: '0 1 500px',
        minWidth: '350px',
        border: '2px solid rgba(16, 185, 129, 0.3)',
        animation: 'slideInUp 0.8s ease-out'
      }}>
        <h3 style={{
          marginTop: 0,
          marginBottom: '1.5rem',
          color: '#065f46',
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '2rem' }}>🌍</span>
          <strong>Sobre o Global Changes</strong>
        </h3>
        <div style={{ fontSize: '1rem', color: '#065f46', lineHeight: '1.8' }}>
          <p style={{ margin: '1rem 0' }}>
            O <strong>Global Changes</strong> é uma plataforma educacional alinhada à <strong>ODS 13 (Ação contra a mudança global do clima)</strong> que tem como objetivo conscientizar e engajar pessoas em práticas sustentáveis.
          </p>
          <p style={{ margin: '1rem 0' }}>
            <strong>Nosso foco:</strong> Estimular a conscientização sobre o descarte correto de resíduos, incentivando o uso de lixeiros adequados e promovendo práticas ambientais melhores no dia a dia.
          </p>
          <p style={{ margin: '1rem 0', marginBottom: 0 }}>
            <strong>Como funciona:</strong> Ao enviar vídeos mostrando suas ações ecológicas, como descartar lixo corretamente, você ganha pontos que podem ser trocados por recompensas. Juntos, estamos construindo um futuro mais sustentável! 🌱✨
          </p>
        </div>
      </div>
      </div>
    </div>
  )
 }

export default LoginPage