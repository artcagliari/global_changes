import { useState, useEffect } from 'react'
import { API_URL } from '../config.ts'

interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'admin'
  points: number
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student' as 'student' | 'admin',
    points: 0
  })

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`)
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await fetch(`${API_URL}/api/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      } else {
        await fetch(`${API_URL}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      }
      
      setShowForm(false)
      setEditingUser(null)
      setFormData({ name: '', email: '', role: 'student', points: 0 })
      fetchUsers()
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points
    })
    setShowForm(true)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return
    
    try {
      await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE'
      })
      fetchUsers()
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
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
          <p style={{ color: '#1e293b', fontWeight: '600' }}>Carregando usuários...</p>
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
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              margin: 0,
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
              <span style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', animation: 'bounce 2s ease-in-out infinite' }}>👥</span>
              Gerenciamento de Usuários
            </h2>
            <button 
              onClick={() => {
                setEditingUser(null)
                setFormData({ name: '', email: '', role: 'student', points: 0 })
                setShowForm(true)
              }}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
                color: 'white',
                border: 'none',
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                borderRadius: '12px',
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                whiteSpace: 'nowrap'
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
              + Novo Usuário
            </button>
          </div>
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)} style={{
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
            padding: '1rem'
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
              background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.99) 0%, rgba(241, 245, 249, 0.99) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              border: '3px solid rgba(16, 185, 129, 0.3)',
              animation: 'slideInUp 0.4s ease-out',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h3 style={{
                marginTop: 0,
                marginBottom: '1.5rem',
                background: 'linear-gradient(45deg, #10b981, #059669, #0ea5e9, #0284c7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                fontWeight: '600'
              }}>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#1e293b',
                    fontWeight: '600',
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                  }}>Nome:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '1rem',
                      color: '#1e293b',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#10b981'
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#1e293b',
                    fontWeight: '600',
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                  }}>Email:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '1rem',
                      color: '#1e293b',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#10b981'
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#1e293b',
                    fontWeight: '600',
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                  }}>Tipo:</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'student' | 'admin' })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '1rem',
                      color: '#1e293b',
                      backgroundColor: 'white',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#10b981'
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <option value="student">Aluno</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#1e293b',
                    fontWeight: '600',
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                  }}>Pontos:</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                    min="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '1rem',
                      color: '#1e293b',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#10b981'
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <button type="submit" style={{
                    flex: 1,
                    minWidth: '120px',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                  >{editingUser ? 'Atualizar' : 'Criar'}</button>
                  <button type="button" onClick={() => setShowForm(false)} style={{
                    flex: 1,
                    minWidth: '120px',
                    padding: '0.75rem 1.5rem',
                    background: '#f1f5f9',
                    color: '#334155',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e2e8f0'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f1f5f9'
                  }}
                  >Cancelar</button>
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
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              minWidth: '600px'
            }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #065f46, #047857, #0c4a6e, #075985)' }}>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>👤 Nome</th>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>📧 Email</th>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>🎭 Tipo</th>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>⭐ Pontos</th>
                  <th style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: 'black', textAlign: 'left', fontWeight: '700', fontSize: 'clamp(0.875rem, 2vw, 1rem)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>⚡ Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} style={{
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
                        {user.role === 'student' ? 'Aluno' : 'Admin'}
                      </span>
                    </td>
                    <td style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', color: '#1e293b', fontWeight: '600', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>{user.points}</td>
                    <td className="actions-cell" style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button onClick={() => handleEdit(user)} style={{
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
                          ✏️ Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)} 
                          disabled={user.role === 'admin'}
                          style={{
                            background: user.role === 'admin' ? '#e2e8f0' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                            color: user.role === 'admin' ? '#94a3b8' : 'white',
                            border: 'none',
                            padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                            borderRadius: '12px',
                            cursor: user.role === 'admin' ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                            transition: 'all 0.3s ease',
                            boxShadow: user.role === 'admin' ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)',
                            whiteSpace: 'nowrap',
                            opacity: user.role === 'admin' ? 0.6 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (user.role !== 'admin') {
                              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'
                              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (user.role !== 'admin') {
                              e.currentTarget.style.transform = 'translateY(0) scale(1)'
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)'
                            }
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
    </div>
  )
}

export default UserManagement
