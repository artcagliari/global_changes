import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/useAuthStore'
import { API_URL } from '../config'

interface Reward {
  id: string
  name: string
  pointCost: number
}

interface RedeemedReward {
  id: string
  reward: Reward
  pointsSpent: number
  redeemedAt: string
}

const Rewards = () => {
  const currentUser = useAuthStore((state) => state.currentUser)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRewards()
    if (currentUser) {
      fetchRedeemedRewards()
    }
  }, [currentUser])

  const fetchRewards = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rewards`)
      const data = await response.json()
      setRewards(data)
    } catch (error) {
      console.error('Erro ao buscar recompensas:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRedeemedRewards = async () => {
    if (!currentUser) return
    try {
      const response = await fetch(`${API_URL}/api/users/${currentUser.id}/redeemed-rewards`)
      if (response.ok) {
        const data = await response.json()
        setRedeemedRewards(data)
      }
    } catch (error) {
      console.error('Erro ao buscar recompensas resgatadas:', error)
    }
  }

  const redeemReward = async (rewardId: string) => {
    if (!currentUser) return

    const reward = rewards.find((r) => r.id === rewardId)
    if (!reward) return

    if (currentUser.points < reward.pointCost) {
      alert('Saldo de pontos insuficiente!')
      return
    }

    try {
      // Trocar recompensa usando o novo endpoint que registra no banco
      const response = await fetch(`${API_URL}/api/rewards/${rewardId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: currentUser.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Atualizar pontos no store local com os dados atualizados do backend
        useAuthStore.setState({ currentUser: data.updatedUser })
        
        // Mensagem de confirmação detalhada
        const rewardLower = reward.name.toLowerCase()
        const isWaterReward = rewardLower.includes('água') || 
                              rewardLower.includes('agua') || 
                              rewardLower.includes('garrafa')
        const isLancheReward = rewardLower.includes('lanche') || 
                               rewardLower.includes('vale lanche')
        const isValeReward = rewardLower.includes('vale') || isWaterReward || isLancheReward
        
        let instructionMessage = ''
        if (isWaterReward) {
          instructionMessage = `💧 Você tem um vale água! Apresente este recibo na cantina ou secretaria para resgatar.`
        } else if (isLancheReward) {
          instructionMessage = `🍔 Você tem um vale lanche! Apresente este recibo na cantina ou secretaria para resgatar.`
        } else if (isValeReward) {
          instructionMessage = `🎫 Você tem um vale! Apresente este recibo na cantina ou secretaria para resgatar.`
        } else {
          instructionMessage = `📝 Guarde este recibo para resgatar sua recompensa.`
        }
        
        const message = `✅ Recompensa resgatada com sucesso!\n\n` +
          `📦 Você tem: ${reward.name}\n` +
          `💰 Pontos gastos: ${reward.pointCost} Global Changes\n` +
          `💳 Seu novo saldo: ${data.updatedUser.points} Global Changes\n\n` +
          instructionMessage
        
        alert(message)
        
        // Atualizar lista de recompensas resgatadas
        fetchRedeemedRewards()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Erro ao resgatar recompensa')
      }
    } catch (error) {
      console.error('Erro ao resgatar recompensa:', error)
      alert('Erro ao resgatar recompensa')
    }
  }

  if (!currentUser) return null

  if (loading) {
    return (
      <div className="page-container">
        <h2>Loja de Recompensas</h2>
        <p>Carregando recompensas...</p>
      </div>
    )
  }

  // Função auxiliar para detectar tipo de recompensa
  const getRewardType = (rewardName: string) => {
    const nameLower = rewardName.toLowerCase()
    if (nameLower.includes('água') || nameLower.includes('agua') || nameLower.includes('garrafa')) {
      return { type: 'water', emoji: '💧', label: 'vale água' }
    }
    if (nameLower.includes('lanche') || nameLower.includes('vale lanche')) {
      return { type: 'lanche', emoji: '🍔', label: 'vale lanche' }
    }
    if (nameLower.includes('vale')) {
      return { type: 'vale', emoji: '🎫', label: 'vale' }
    }
    return { type: 'other', emoji: '📦', label: 'recompensa' }
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
          <h2 style={{
            fontSize: '2.5rem',
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
            <span style={{ fontSize: '2.5rem', animation: 'bounce 2s ease-in-out infinite' }}></span>
            Loja de Recompensas
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: '#475569',
            marginBottom: 0
          }}>
            Seu saldo: <strong style={{
              background: 'linear-gradient(45deg, #10b981, #059669)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '1.3rem'
            }}>{currentUser.points} Global Changes</strong>
          </p>
        </div>

      {/* Seção Global Changes - Recompensas resgatadas */}
      {redeemedRewards.length > 0 && (
        <div style={{ 
          marginBottom: '2rem', 
          padding: '2rem', 
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 25%, #86efac 50%, #6ee7b7 75%, #22d3ee 100%)',
          borderRadius: '24px',
          border: '3px solid #6ee7b7',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.3), 0 10px 20px -5px rgba(16, 185, 129, 0.2), inset 0 0 30px rgba(255, 255, 255, 0.3)'
        }}>
          {/* Efeito de nuvens animadas - ODS 13 */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            right: '-50px',
            width: '350px',
            height: '250px',
            background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.4) 50%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(35px)',
            animation: 'floatCloud 12s ease-in-out infinite',
            zIndex: 0
          }} />
          <div style={{
            position: 'absolute',
            top: '30px',
            right: '10px',
            width: '280px',
            height: '200px',
            background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(30px)',
            animation: 'floatCloud 15s ease-in-out infinite reverse',
            zIndex: 0
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-50px',
            right: '30px',
            width: '320px',
            height: '230px',
            background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
            animation: 'floatCloud 18s ease-in-out infinite',
            zIndex: 0
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            right: '-20px',
            width: '240px',
            height: '180px',
            background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(28px)',
            animation: 'floatCloud 14s ease-in-out infinite 2s',
            zIndex: 0
          }} />

          {/* Estrelas decorativas piscando */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '30px',
            fontSize: '1.5rem',
            animation: 'sparkle 2s ease-in-out infinite',
            zIndex: 1
          }}>✨</div>
          <div style={{
            position: 'absolute',
            top: '60px',
            left: '60px',
            fontSize: '1.2rem',
            animation: 'sparkle 2.5s ease-in-out infinite 0.5s',
            zIndex: 1
          }}>⭐</div>
          <div style={{
            position: 'absolute',
            top: '100px',
            left: '20px',
            fontSize: '1.3rem',
            animation: 'sparkle 3s ease-in-out infinite 1s',
            zIndex: 1
          }}>💫</div>
          
          {/* Conteúdo */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: '1.5rem',
              color: '#065f46',
              fontSize: '1.75rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textShadow: '0 2px 8px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(16, 185, 129, 0.3)',
              filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))'
            }}>
              <span style={{ 
                background: 'linear-gradient(45deg, #065f46, #10b981, #0ea5e9, #0284c7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 5s ease infinite'
              }}>Global Changes</span>
              <span style={{ 
                fontSize: '1.5rem',
                animation: 'floatCloud 4s ease-in-out infinite',
                marginLeft: '0.5rem'
              }}>☁️</span>
              <span style={{ 
                fontSize: '1.2rem',
                animation: 'sparkle 2s ease-in-out infinite 1s'
              }}>✨</span>
              <span style={{ 
                fontSize: '1rem',
                marginLeft: '0.5rem',
                color: '#065f46',
                fontWeight: 'normal',
                fontSize: '0.9rem'
              }}>ODS 13</span>
            </h3>
            
            <div style={{ marginTop: '1.5rem' }}>
              {redeemedRewards.map((redeemed) => {
                const rewardType = getRewardType(redeemed.reward.name)
                const isVale = rewardType.type === 'water' || rewardType.type === 'lanche' || rewardType.type === 'vale'
                const borderColor = rewardType.type === 'water' ? '#10b981' : 
                                   rewardType.type === 'lanche' ? '#f59e0b' : 
                                   rewardType.type === 'vale' ? '#0ea5e9' : '#6ee7b7'
                const bgColor = rewardType.type === 'water' ? '#d1fae5' : 
                               rewardType.type === 'lanche' ? '#fef3c7' : 
                               rewardType.type === 'vale' ? '#e0f2fe' : '#f0fdf4'
                const textColor = rewardType.type === 'water' ? '#065f46' : 
                                 rewardType.type === 'lanche' ? '#92400e' : 
                                 rewardType.type === 'vale' ? '#0c4a6e' : '#047857'
                
                return (
                  <div key={redeemed.id} style={{ 
                    marginBottom: '1rem', 
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    border: isVale ? `3px solid ${borderColor}` : '2px solid #6ee7b7',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 12px -2px rgba(0, 0, 0, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{rewardType.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <strong style={{ 
                          color: textColor,
                          fontSize: '1.1rem',
                          display: 'block',
                          marginBottom: '0.25rem'
                        }}>
                          {redeemed.reward.name}
                        </strong>
                        <span style={{ 
                          color: '#6b7280', 
                          fontSize: '0.875rem',
                          display: 'block'
                        }}>
                          Resgatado em {new Date(redeemed.redeemedAt).toLocaleDateString('pt-BR', { 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                    {isVale && (
                      <div style={{ 
                        marginTop: '0.75rem', 
                        padding: '0.75rem', 
                        background: bgColor, 
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        color: textColor,
                        fontWeight: '500',
                        border: `1px solid ${borderColor}`
                      }}>
                        ✨ Você tem um {rewardType.label}! Apresente na cantina ou secretaria.
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          
        </div>
      )}

        <div style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          padding: '2.5rem',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(16, 185, 129, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          marginTop: '2rem',
          animation: 'slideInUp 1s ease-out'
        }}>
          <h3 style={{
            fontSize: '2rem',
            marginTop: 0,
            marginBottom: '1.5rem',
            background: 'linear-gradient(45deg, #10b981, #059669, #0ea5e9, #0284c7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 5s ease infinite'
          }}>
            Recompensas Disponíveis
          </h3>
          <div className="rewards-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {rewards.map((reward) => {
              const canAfford = currentUser.points >= reward.pointCost
              return (
                <div
                  key={reward.id}
                  className={`reward-card ${!canAfford ? 'disabled' : ''}`}
                  style={{
                    background: canAfford ? 'rgba(255, 255, 255, 0.95)' : 'rgba(248, 250, 252, 0.95)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: canAfford ? '2px solid rgba(16, 185, 129, 0.3)' : '2px solid rgba(203, 213, 225, 0.5)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    opacity: canAfford ? 1 : 0.6
                  }}
                  onMouseEnter={(e) => {
                    if (canAfford) {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(16, 185, 129, 0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (canAfford) {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <h3 style={{
                    color: canAfford ? '#065f46' : '#94a3b8',
                    marginBottom: '1rem',
                    fontSize: '1.25rem'
                  }}>{reward.name}</h3>
                  <p className="reward-cost" style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: canAfford ? '#10b981' : '#cbd5e1',
                    margin: '0.5rem 0 1rem 0'
                  }}>{reward.pointCost} Pontos</p>
                  <button
                    onClick={() => redeemReward(reward.id)}
                    disabled={!canAfford}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: canAfford ? 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)' : '#e2e8f0',
                      color: canAfford ? 'white' : '#94a3b8',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s ease',
                      boxShadow: canAfford ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (canAfford) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (canAfford) {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }
                    }}
                  >
                    {canAfford ? '🎁 Trocar' : 'Pontos insuficientes'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Rewards