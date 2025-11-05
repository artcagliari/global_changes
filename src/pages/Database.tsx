import { useState, useEffect } from 'react'
import { API_URL } from '../config'

interface User {
  id: string
  name: string
  email: string
  role: string
  points: number
}

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

interface Reward {
  id: string
  name: string
  pointCost: number
}

const Database = () => {
  const [users, setUsers] = useState<User[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [usersRes, submissionsRes, rewardsRes] = await Promise.all([
        fetch(`${API_URL}/api/users`),
        fetch(`${API_URL}/api/submissions`),
        fetch(`${API_URL}/api/rewards`)
      ])

      const usersData = await usersRes.json()
      const submissionsData = await submissionsRes.json()
      const rewardsData = await rewardsRes.json()

      setUsers(usersData)
      setSubmissions(submissionsData)
      setRewards(rewardsData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
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
          <p style={{ color: '#1e293b', fontWeight: '600' }}>Carregando dados...</p>
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

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          padding: '1.5rem',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(16, 185, 129, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          marginBottom: '1.5rem',
          animation: 'slideInUp 0.6s ease-out'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            marginTop: 0,
            marginBottom: '0.5rem',
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
            <span style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', animation: 'bounce 2s ease-in-out infinite' }}>💾</span>
            Visualização do Banco de Dados
          </h2>
          <p style={{
            fontSize: 'clamp(0.875rem, 2vw, 1.1rem)',
            color: '#334155',
            marginBottom: 0,
            fontWeight: '500'
          }}>
            Esta página mostra todos os dados armazenados no sistema.
          </p>
        </div>

        {/* Tabela de Usuários */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(16, 185, 129, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          marginBottom: '1.5rem',
          animation: 'slideInUp 0.8s ease-out'
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
            <h3 style={{
              margin: 0,
              color: '#1e293b',
              fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
              fontWeight: '600'
            }}>👥 Usuários ({users.length})</h3>
          </div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #065f46, #047857, #0c4a6e, #075985)' }}>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>ID</th>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Nome</th>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Email</th>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Role</th>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Pontos</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: '#64748b', fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)', wordBreak: 'break-all' }}>{user.id}</td>
                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: '#1e293b', fontWeight: '600', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>{user.name}</td>
                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: '#334155', fontWeight: '500', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>{user.email}</td>
                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)' }}>
                      <span className={`role-badge role-${user.role}`} style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                        fontWeight: '600',
                        display: 'inline-block',
                        background: user.role === 'student' ? '#d1fae5' : '#fef3c7',
                        color: user.role === 'student' ? '#065f46' : '#92400e'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: '#1e293b', fontWeight: '600', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>{user.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabela de Submissões */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(16, 185, 129, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          marginBottom: '1.5rem',
          animation: 'slideInUp 1s ease-out'
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
            <h3 style={{
              margin: 0,
              color: '#1e293b',
              fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
              fontWeight: '600'
            }}>📹 Submissões ({submissions.length})</h3>
          </div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #065f46, #047857, #0c4a6e, #075985)' }}>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>ID</th>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Usuário</th>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Vídeo</th>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Status</th>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Data</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: '#64748b', fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)', wordBreak: 'break-all' }}>{submission.id}</td>
                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: '#1e293b', fontWeight: '600', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>{submission.user.name} <span style={{ color: '#64748b', fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)' }}>({submission.userId.substring(0, 8)}...)</span></td>
                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: '#334155', fontWeight: '500', fontSize: 'clamp(0.875rem, 2vw, 1rem)', wordBreak: 'break-all' }}>{submission.videoUrl}</td>
                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)' }}>
                      <span className={`status status-${submission.status}`} style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                        fontWeight: '600',
                        display: 'inline-block',
                        background: submission.status === 'APPROVED' ? '#d1fae5' : 
                                   submission.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                        color: submission.status === 'APPROVED' ? '#065f46' : 
                               submission.status === 'PENDING' ? '#92400e' : '#991b1b'
                      }}>
                        {submission.status}
                      </span>
                    </td>
                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: '#334155', fontWeight: '500', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>{new Date(submission.submittedAt).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabela de Recompensas */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(16, 185, 129, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          marginBottom: '1.5rem',
          animation: 'slideInUp 1.2s ease-out'
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
            <h3 style={{
              margin: 0,
              color: '#1e293b',
              fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
              fontWeight: '600'
            }}>🎁 Recompensas ({rewards.length})</h3>
          </div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #065f46, #047857, #0c4a6e, #075985)' }}>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>ID</th>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Nome</th>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Custo (Pontos)</th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((reward) => (
                  <tr key={reward.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: '#64748b', fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)', wordBreak: 'break-all' }}>{reward.id}</td>
                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: '#1e293b', fontWeight: '600', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>{reward.name}</td>
                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: '#1e293b', fontWeight: '600', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>{reward.pointCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Estatísticas */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '1.5rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(16, 185, 129, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          animation: 'slideInUp 1.4s ease-out'
        }}>
          <h3 style={{
            marginTop: 0,
            marginBottom: '1.5rem',
            color: '#1e293b',
            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
            fontWeight: '600'
          }}>📊 Estatísticas</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div className="stat-card" style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
              borderRadius: '16px',
              border: '2px solid #6ee7b7',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
            }}>
              <h4 style={{
                marginTop: 0,
                marginBottom: '0.5rem',
                color: '#065f46',
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                fontWeight: '600'
              }}>Total de Usuários</h4>
              <p className="stat-number" style={{
                margin: 0,
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: '700',
                color: '#065f46',
                marginBottom: '0.5rem'
              }}>{users.length}</p>
              <p className="stat-detail" style={{
                margin: 0,
                color: '#047857',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                fontWeight: '500'
              }}>
                {users.filter(u => u.role === 'student').length} alunos, {users.filter(u => u.role === 'admin').length} admins
              </p>
            </div>
            
            <div className="stat-card" style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
              borderRadius: '16px',
              border: '2px solid #93c5fd',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)'
            }}>
              <h4 style={{
                marginTop: 0,
                marginBottom: '0.5rem',
                color: '#0c4a6e',
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                fontWeight: '600'
              }}>Total de Submissões</h4>
              <p className="stat-number" style={{
                margin: 0,
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: '700',
                color: '#0c4a6e',
                marginBottom: '0.5rem'
              }}>{submissions.length}</p>
              <p className="stat-detail" style={{
                margin: 0,
                color: '#075985',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                fontWeight: '500'
              }}>
                {submissions.filter(s => s.status === 'PENDING').length} pendentes, {submissions.filter(s => s.status === 'APPROVED').length} aprovadas, {submissions.filter(s => s.status === 'REJECTED').length} rejeitadas
              </p>
            </div>
            
            <div className="stat-card" style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              borderRadius: '16px',
              border: '2px solid #fcd34d',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
            }}>
              <h4 style={{
                marginTop: 0,
                marginBottom: '0.5rem',
                color: '#92400e',
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                fontWeight: '600'
              }}>Pontos Totais</h4>
              <p className="stat-number" style={{
                margin: 0,
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: '700',
                color: '#92400e',
                marginBottom: '0.5rem'
              }}>
                {users.reduce((total, user) => total + user.points, 0)}
              </p>
              <p className="stat-detail" style={{
                margin: 0,
                color: '#78350f',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                fontWeight: '500'
              }}>Global Changes distribuídos</p>
            </div>
            
            <div className="stat-card" style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
              borderRadius: '16px',
              border: '2px solid #a5b4fc',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
            }}>
              <h4 style={{
                marginTop: 0,
                marginBottom: '0.5rem',
                color: '#3730a3',
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                fontWeight: '600'
              }}>Recompensas Disponíveis</h4>
              <p className="stat-number" style={{
                margin: 0,
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: '700',
                color: '#3730a3',
                marginBottom: '0.5rem'
              }}>{rewards.length}</p>
              <p className="stat-detail" style={{
                margin: 0,
                color: '#4c1d95',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                fontWeight: '500'
              }}>Itens na loja</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Database
