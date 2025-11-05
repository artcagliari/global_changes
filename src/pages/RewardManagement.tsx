import { useState, useEffect } from 'react'
import { API_URL } from '../config.ts'

interface Reward {
  id: string
  name: string
  pointCost: number
}

const RewardManagement = () => {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    pointCost: 0
  })

  const fetchRewards = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rewards`)
      const data = await response.json()
      setRewards(data)
    } catch (error) {
      console.error('Erro ao carregar recompensas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRewards()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingReward) {
        // Atualizar recompensa
        await fetch(`${API_URL}/api/rewards/${editingReward.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      } else {
        // Criar recompensa
        await fetch(`${API_URL}/api/rewards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      }
      
      setShowForm(false)
      setEditingReward(null)
      setFormData({ name: '', pointCost: 0 })
      fetchRewards()
    } catch (error) {
      console.error('Erro ao salvar recompensa:', error)
    }
  }

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward)
    setFormData({
      name: reward.name,
      pointCost: reward.pointCost
    })
    setShowForm(true)
  }

  const handleDelete = async (rewardId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta recompensa?')) return
    
    try {
      await fetch(`${API_URL}/api/rewards/${rewardId}`, {
        method: 'DELETE'
      })
      fetchRewards()
    } catch (error) {
      console.error('Erro ao deletar recompensa:', error)
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
          <p style={{ color: 'black', fontWeight: '500' }}>Carregando...</p>
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
      padding: '2rem',
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
          padding: '2.5rem',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(16, 185, 129, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          marginBottom: '2rem',
          animation: 'slideInUp 0.6s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{
              fontSize: '2.5rem',
              marginTop: 0,
              marginBottom: 0,
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
              <span style={{ fontSize: '2.5rem', animation: 'bounce 2s ease-in-out infinite' }}>🎁</span>
              Gerenciamento de Recompensas
            </h2>
            <button 
              onClick={() => {
                setEditingReward(null)
                setFormData({ name: '', pointCost: 0 })
                setShowForm(true)
              }}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)'
              }}
            >
              + Nova Recompensa
            </button>
          </div>
        </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingReward ? 'Editar Recompensa' : 'Nova Recompensa'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Custo (Pontos):</label>
                <input
                  type="number"
                  value={formData.pointCost}
                  onChange={(e) => setFormData({ ...formData, pointCost: parseInt(e.target.value) })}
                  min="1"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit">{editingReward ? 'Atualizar' : 'Criar'}</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

        <div style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(16, 185, 129, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          animation: 'slideInUp 0.8s ease-out'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #065f46, #047857, #0c4a6e, #075985)' }}>
                <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Nome</th>
                <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Custo (Pontos)</th>
                <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((reward, index) => (
                <tr key={reward.id} style={{
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
                  <td style={{ padding: '1.5rem', color: '#1e293b', fontWeight: '600', fontSize: '1rem' }}>{reward.name}</td>
                  <td style={{ padding: '1.5rem', color: '#334155', fontWeight: '500', fontSize: '0.95rem' }}>{reward.pointCost}</td>
                  <td className="actions-cell" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button 
                        onClick={() => handleEdit(reward)}
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
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
                        ✏️ Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(reward.id)}
                        style={{
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
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
                        🗑️ Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default RewardManagement
