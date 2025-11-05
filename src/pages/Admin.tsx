import { useState, useEffect } from 'react'
import { API_URL } from '../config.ts'
import { useAuthStore } from '../stores/useAuthStore'

interface Submission {
  id: string
  userId: string
  videoUrl: string
  status: string
  submittedAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

const Admin = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/submissions`)
      const data = await response.json()
      setSubmissions(data)
    } catch (error) {
      console.error('Erro ao buscar submissões:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveSubmission = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/submissions/${id}/approve`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        const data = await response.json()
        const videoUrl = data.videoUrl
        
        // Limpar cache do vídeo no navegador
        if (videoUrl && 'caches' in window) {
          try {
            const cache = await caches.open('video-cache')
            const videoUrlFull = `${API_URL}/uploads/videos/${videoUrl}`
            await cache.delete(videoUrlFull)
            console.log('Cache do vídeo removido:', videoUrl)
          } catch (cacheError) {
            console.warn('Erro ao limpar cache:', cacheError)
          }
        }
        
        // Buscar dados atualizados do usuário para sincronizar pontos
        const submission = submissions.find(s => s.id === id)
        if (submission) {
          const userResponse = await fetch(`${API_URL}/api/users/${submission.userId}`)
          if (userResponse.ok) {
            const updatedUser = await userResponse.json()
            // Atualizar pontos no store local se for o usuário atual
            const currentUser = useAuthStore.getState().currentUser
            if (currentUser && currentUser.id === submission.userId) {
              useAuthStore.setState({ currentUser: updatedUser })
            }
          }
        }
      }
      
      fetchSubmissions() // Recarrega a lista
    } catch (error) {
      console.error('Erro ao aprovar submissão:', error)
    }
  }

  const rejectSubmission = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/submissions/${id}/reject`, {
        method: 'PATCH'
      })
      fetchSubmissions() // Recarrega a lista
    } catch (error) {
      console.error('Erro ao rejeitar submissão:', error)
    }
  }

  const pendingSubmissions = submissions.filter((s) => s.status === 'pending')

  const handleVideoClick = (videoUrl: string) => {
    setSelectedVideo(videoUrl)
  }

  const closeVideoModal = () => {
    setSelectedVideo(null)
  }

  if (loading) {
    return (
      <div className="page-container" style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 25%, #0ea5e9 50%, #0284c7 75%, #06b6d4 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        minHeight: '100vh',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          padding: '3rem',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ fontSize: '3rem', animation: 'pulse 1.5s ease-in-out infinite', marginBottom: '1rem' }}>⏳</div>
          <h2 style={{
            background: 'linear-gradient(45deg, #10b981, #059669, #0ea5e9, #0284c7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Painel de Moderação</h2>
          <p style={{ color: '#334155', fontWeight: '500' }}>Carregando submissões...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container" style={{
      background: 'linear-gradient(135deg, #10b981 0%, #059669 25%, #0ea5e9 50%, #0284c7 75%, #06b6d4 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      minHeight: '100vh',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
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

      {/* Elementos naturais decorativos */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '8%',
        fontSize: '2.5rem',
        animation: 'float 6s ease-in-out infinite',
        opacity: 0.4,
        zIndex: 0
      }}>🌳</div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '12%',
        fontSize: '2rem',
        animation: 'float 8s ease-in-out infinite 2s',
        opacity: 0.4,
        zIndex: 0
      }}>🌿</div>
      <div style={{
        position: 'absolute',
        top: '70%',
        left: '5%',
        fontSize: '1.8rem',
        animation: 'float 7s ease-in-out infinite 1s',
        opacity: 0.3,
        zIndex: 0
      }}>💧</div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(16, 185, 129, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          marginBottom: '2rem',
          animation: 'slideInUp 0.6s ease-out'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            marginTop: 0,
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, #10b981, #059669, #0ea5e9, #0284c7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 5s ease infinite',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '2.5rem', animation: 'bounce 2s ease-in-out infinite' }}>🛡️</span>
            Painel de Moderação de Envios
          </h2>
          <p style={{
            fontSize: 'clamp(0.875rem, 2vw, 1.1rem)',
            color: '#1e293b',
            fontWeight: '500',
            marginBottom: 0
          }}>
        Abaixo estão os vídeos pendentes de análise. Clique no nome do vídeo para visualizar. 1 ponto por vídeo aprovado.
      </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(16, 185, 129, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          animation: 'slideInUp 0.8s ease-out'
        }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #065f46, #047857, #0c4a6e, #075985)' }}>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>👤 Aluno</th>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>📹 Vídeo</th>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>📅 Data de Envio</th>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>⚡ Ações</th>
                </tr>
              </thead>
              <tbody>
                {pendingSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{
                      padding: '3rem',
                      textAlign: 'center',
                      color: '#1e293b',
                      fontSize: 'clamp(0.875rem, 2vw, 1.1rem)',
                      fontWeight: '600'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>✅</div>
                      Nenhum envio pendente.
                    </td>
                  </tr>
                ) : (
                  pendingSubmissions.map((sub, index) => (
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
                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: '#1e293b', fontWeight: '600', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>{sub.user.name} <span style={{ color: '#64748b', fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)', fontWeight: '400' }}>(ID: {sub.userId.substring(0, 8)}...)</span></td>
                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)' }}>
                      <button 
                        onClick={() => handleVideoClick(sub.videoUrl)}
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
                          color: 'white',
                          border: 'none',
                          padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        📹 {sub.videoUrl}
                      </button>
                    </td>
                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: '#334155', fontWeight: '500', fontSize: 'clamp(0.875rem, 2vw, 0.95rem)' }}>{new Date(sub.submittedAt).toLocaleDateString('pt-BR')}</td>
                    <td className="actions-cell" style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => approveSubmission(sub.id)}
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            border: 'none',
                            padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                          }}
                        >
                          ✅ Aprovar
                        </button>
                        <button
                          onClick={() => rejectSubmission(sub.id)}
                          style={{
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            color: 'white',
                            border: 'none',
                            padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)'
                          }}
                        >
                          ❌ Rejeitar
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

      {/* Modal para visualizar vídeo */}
      {selectedVideo && (
        <div 
          className="video-modal-overlay" 
          onClick={closeVideoModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
        >
          <div 
            className="video-modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.99) 0%, rgba(241, 245, 249, 0.99) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '2rem',
              maxWidth: '900px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              border: '3px solid rgba(16, 185, 129, 0.3)',
              animation: 'slideInUp 0.4s ease-out'
            }}
          >
            <div className="video-modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <h3 style={{
                margin: 0,
                background: 'linear-gradient(45deg, #10b981, #059669, #0ea5e9, #0284c7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '1.5rem'
              }}>📹 Visualizando: {selectedVideo}</h3>
              <button 
                className="close-button" 
                onClick={closeVideoModal}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
                }}
              >
                ✕
              </button>
            </div>
            <div className="video-container" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <video 
                controls 
                width="100%" 
                height="auto"
                className="moderation-video"
                key={selectedVideo}
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
                }}
              >
                <source src={`${API_URL}/uploads/videos/${selectedVideo}?t=${Date.now()}`} />
                Seu navegador não suporta a reprodução de vídeos.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin