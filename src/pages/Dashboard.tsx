import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/useAuthStore'
import { API_URL } from '../config'

interface Submission {
  id: string
  userId: string
  videoUrl: string
  status: string
  submittedAt: string
}

const Dashboard = () => {
  const currentUser = useAuthStore((state) => state.currentUser)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      fetchSubmissions()
      // Sincronizar pontos do usuário atual
      syncUserPoints()
    }
  }, [currentUser])

  const syncUserPoints = async () => {
    if (!currentUser) return
    
    try {
      const response = await fetch(`${API_URL}/api/users/${currentUser.id}`)
      if (response.ok) {
        const updatedUser = await response.json()
        useAuthStore.setState({ currentUser: updatedUser })
      }
    } catch (error) {
      console.error('Erro ao sincronizar pontos:', error)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/submissions`)
      const data = await response.json()
      
      // Filtrar apenas as submissões do usuário atual
      const mySubmissions = data.filter((s: Submission) => s.userId === currentUser?.id)
      setSubmissions(mySubmissions)
    } catch (error) {
      console.error('Erro ao buscar submissões:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser) return <div>Carregando...</div>

  return (
    <div className="page-container" style={{
      background: 'linear-gradient(135deg, #10b981 0%, #059669 25%, #0ea5e9 50%, #0284c7 75%, #06b6d4 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      minHeight: '100vh',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Efeitos de nuvens */}
      <div style={{
        position: 'absolute',
        top: '-80px',
        right: '-80px',
        width: '350px',
        height: '250px',
        background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'floatCloud 12s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-60px',
        left: '-60px',
        width: '300px',
        height: '220px',
        background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(35px)',
        animation: 'floatCloud 15s ease-in-out infinite reverse',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '-40px',
        width: '250px',
        height: '180px',
        background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(30px)',
        animation: 'floatCloud 18s ease-in-out infinite 2s',
        zIndex: 0
      }} />

      {/* Elementos naturais decorativos */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '5%',
        fontSize: '3rem',
        animation: 'float 8s ease-in-out infinite',
        opacity: 0.3,
        zIndex: 0
      }}>🌳</div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '10%',
        fontSize: '2.5rem',
        animation: 'float 10s ease-in-out infinite 2s',
        opacity: 0.3,
        zIndex: 0
      }}>🌿</div>
      <div style={{
        position: 'absolute',
        top: '60%',
        left: '3%',
        fontSize: '2rem',
        animation: 'float 7s ease-in-out infinite 1s',
        opacity: 0.25,
        zIndex: 0
      }}>🍃</div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <h2 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          marginBottom: '1rem',
          background: 'linear-gradient(45deg, #10b981, #059669, #0ea5e9, #0284c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          backgroundSize: '200% 200%',
          animation: 'slideInUp 0.6s ease-out',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}></span>
          Dashboard do Aluno
        </h2>
        
        <div style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          padding: '2rem',
          borderRadius: '20px',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          border: '2px solid rgba(16, 185, 129, 0.2)',
          animation: 'slideInUp 0.8s ease-out'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            color: '#065f46',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.8rem', animation: 'bounce 2s ease-in-out infinite 0.5s' }}>👋</span>
            Olá, {currentUser.name}!
          </h3>
          <div style={{
            fontSize: '1.3rem',
            color: '#047857',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '1rem'
          }}>
            <span style={{ fontSize: '2rem', animation: 'sparkle 2s ease-in-out infinite' }}>💚</span>
            <span>Você tem</span>
            <strong style={{
              fontSize: '2rem',
              background: 'linear-gradient(45deg, #10b981, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'pulse 2s ease-in-out infinite'
            }}>{currentUser.points}</strong>
            <span>Global Changes</span>
            <span style={{ fontSize: '1.5rem', animation: 'sparkle 2s ease-in-out infinite 1s' }}>✨</span>
          </div>
        </div>

        {/* Informações sobre ODS 13 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          padding: '1.5rem',
          borderRadius: '20px',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          border: '2px solid rgba(16, 185, 129, 0.2)',
          animation: 'slideInUp 1s ease-out'
        }}>
          <h4 style={{
            fontSize: '1.3rem',
            color: '#065f46',
            marginTop: 0,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>🌍</span>
            <strong>ODS 13: Ação contra a mudança global do clima</strong>
          </h4>
          <div style={{ fontSize: '0.95rem', color: '#047857', lineHeight: '1.8' }}>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Objetivo:</strong> Adotar medidas urgentes para combater a mudança do clima e seus impactos.
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Ações práticas:</strong> Reduzir emissões, usar transporte público ou bicicleta, promover arborização, economizar energia e praticar coleta seletiva.
            </p>
          </div>
        </div>

        <h4 style={{
          fontSize: '1.8rem',
          color: '#065f46',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'slideInUp 1.2s ease-out'
        }}>
          <span style={{ fontSize: '1.5rem' }}>📹</span>
          Meus Envios Recentes
        </h4>
        
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#64748b',
            fontSize: '1.2rem'
          }}>
            <div style={{ fontSize: '3rem', animation: 'pulse 1.5s ease-in-out infinite', marginBottom: '1rem' }}>⏳</div>
            Carregando submissões...
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            border: '2px solid rgba(16, 185, 129, 0.2)',
            animation: 'slideInUp 1.2s ease-out'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #065f46, #047857, #0c4a6e, #075985)' }}>
                  <th style={{ padding: '1rem', color: 'black', textAlign: 'left', fontWeight: '700', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>📹 Vídeo</th>
                  <th style={{ padding: '1rem', color: 'black', textAlign: 'left', fontWeight: '700', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>📅 Data de Envio</th>
                  <th style={{ padding: '1rem', color: 'black', textAlign: 'left', fontWeight: '700', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>✅ Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{
                      padding: '3rem',
                      textAlign: 'center',
                      color: '#334155',
                      fontWeight: '500',
                      fontSize: '1.1rem'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📭</div>
                      Nenhum envio encontrado.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub, index) => (
                    <tr key={sub.id} style={{
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'all 0.3s ease',
                      animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f0fdf4'
                      e.currentTarget.style.transform = 'translateX(5px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                    >
                      <td style={{ padding: '1rem', color: '#1e293b', fontWeight: '600', fontSize: '0.95rem' }}>{sub.videoUrl}</td>
                      <td style={{ padding: '1rem', color: '#334155', fontWeight: '500', fontSize: '0.95rem' }}>{new Date(sub.submittedAt).toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`status status-${sub.status}`} style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          display: 'inline-block',
                          background: sub.status === 'APPROVED' ? '#d1fae5' : 
                                     sub.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                          color: sub.status === 'APPROVED' ? '#065f46' : 
                                sub.status === 'PENDING' ? '#92400e' : '#991b1b',
                          border: `2px solid ${sub.status === 'APPROVED' ? '#10b981' : 
                                           sub.status === 'PENDING' ? '#f59e0b' : '#ef4444'}`
                        }}>
                          {sub.status === 'APPROVED' ? '✅ Aprovado' : 
                           sub.status === 'PENDING' ? '⏳ Pendente' : '❌ Rejeitado'}
                        </span>
                      </td>
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
}

export default Dashboard