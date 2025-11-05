import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { API_URL } from '../config.ts'

const Upload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const currentUser = useAuthStore((state) => state.currentUser)
  const navigate = useNavigate()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setMessage('Por favor, selecione um arquivo de vídeo.')
      return
    }

    if (!currentUser) {
      setMessage('Você precisa estar logado para enviar vídeos.')
      return
    }

    try {
      setIsUploading(true)
      setMessage('Enviando vídeo...')

      const formData = new FormData()
      formData.append('video', file)
      formData.append('userId', currentUser.id)

      console.log('📤 Enviando vídeo para:', `${API_URL}/api/videos/upload`)
      console.log('   Arquivo:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`)
      
      const response = await fetch(`${API_URL}/api/videos/upload`, {
        method: 'POST',
        body: formData,
        // Não adicionar Content-Type - o browser define automaticamente com boundary para multipart
      })

      console.log('📥 Resposta do servidor:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Erro no upload:', errorData)
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Upload bem-sucedido:', data)

      // O backend já salvou no banco, não precisamos duplicar
      setMessage('Vídeo enviado com sucesso! Aguardando aprovação.')

      setFile(null)
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      console.error('❌ Erro no upload:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar o vídeo. Tente novamente.'
      setMessage(errorMessage)
    } finally {
      setIsUploading(false)
    }
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
        top: '-60px',
        right: '-60px',
        width: '320px',
        height: '230px',
        background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(35px)',
        animation: 'floatCloud 13s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-50px',
        left: '-50px',
        width: '280px',
        height: '200px',
        background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(32px)',
        animation: 'floatCloud 16s ease-in-out infinite reverse',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '40%',
        right: '3%',
        width: '220px',
        height: '160px',
        background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(28px)',
        animation: 'floatCloud 14s ease-in-out infinite 1.5s',
        zIndex: 0
      }} />

      {/* Elementos naturais decorativos */}
      <div style={{
        position: 'absolute',
        top: '12%',
        right: '8%',
        fontSize: '3.5rem',
        animation: 'float 7s ease-in-out infinite',
        opacity: 0.25,
        zIndex: 0
      }}>🌳</div>
      <div style={{
        position: 'absolute',
        bottom: '18%',
        left: '8%',
        fontSize: '2.8rem',
        animation: 'float 9s ease-in-out infinite 2s',
        opacity: 0.25,
        zIndex: 0
      }}>🌿</div>
      <div style={{
        position: 'absolute',
        top: '55%',
        left: '5%',
        fontSize: '2rem',
        animation: 'float 6s ease-in-out infinite 1s',
        opacity: 0.2,
        zIndex: 0
      }}>💧</div>
      <div style={{
        position: 'absolute',
        bottom: '30%',
        right: '5%',
        fontSize: '2.3rem',
        animation: 'sparkle 4s ease-in-out infinite',
        opacity: 0.25,
        zIndex: 0
      }}>🍃</div>

      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
        width: '100%'
      }}>
        <h2 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          marginBottom: '1.5rem',
          background: 'linear-gradient(45deg, #10b981, #059669, #0ea5e9, #0284c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'slideInUp 0.6s ease-out',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}></span>
          Enviar Ação Ecológica
        </h2>
        
        <form onSubmit={handleSubmit} className="upload-form" style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          padding: '3rem',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2), 0 0 40px rgba(16, 185, 129, 0.2)',
          border: '3px solid rgba(255, 255, 255, 0.5)',
          animation: 'slideInUp 0.8s ease-out'
        }}>
          <p style={{
            fontSize: '1.1rem',
            color: '#475569',
            marginBottom: '2rem',
            lineHeight: '1.8',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>💡</span>
            Envie um vídeo (de até 1 minuto) mostrando sua ação ecológica para ganhar pontos!
          </p>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label htmlFor="video-upload" style={{
              display: 'block',
              marginBottom: '1rem',
              color: '#334155',
              fontWeight: '600',
              fontSize: '1.1rem'
            }}>
              <span style={{ marginRight: '0.5rem' }}>🎬</span>
              Arquivo de Vídeo:
            </label>
            <div style={{
              border: '3px dashed #6ee7b7',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#10b981'
              e.currentTarget.style.background = 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#6ee7b7'
              e.currentTarget.style.background = 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            >
              <input
                type="file"
                id="video-upload"
                accept="video/*"
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                  top: 0,
                  left: 0
                }}
              />
              <div style={{ pointerEvents: 'none' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📁</div>
                <div style={{ fontSize: '1.1rem', color: '#475569', fontWeight: '600' }}>
                  {file ? `✅ ${file.name}` : 'Clique ou arraste o vídeo aqui'}
                </div>
                {file && (
                  <div style={{ marginTop: '0.5rem', color: '#10b981', fontSize: '0.9rem' }}>
                    Tamanho: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={!file || isUploading}
            style={{
              width: '100%',
              padding: '1.25rem 2rem',
              background: isUploading 
                ? 'linear-gradient(135deg, #94a3b8, #64748b)' 
                : 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
              position: 'relative',
              overflow: 'hidden',
              opacity: (!file || isUploading) ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isUploading && file) {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.5)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)'
            }}
          >
            {isUploading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{ animation: 'rotate 1s linear infinite' }}>⏳</span>
                Enviando...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span>🚀</span>
                Enviar para Análise
              </span>
            )}
          </button>
          
          {message && (
            <p style={{
              marginTop: '1.5rem',
              padding: '1rem',
              borderRadius: '12px',
              background: message.includes('sucesso') 
                ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' 
                : 'linear-gradient(135deg, #fee2e2, #fecaca)',
              color: message.includes('sucesso') ? '#065f46' : '#991b1b',
              border: `2px solid ${message.includes('sucesso') ? '#10b981' : '#ef4444'}`,
              fontWeight: '600',
              animation: 'slideInUp 0.4s ease-out',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>
                {message.includes('sucesso') ? '✅' : '⚠️'}
              </span>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default Upload