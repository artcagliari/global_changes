import { create } from 'zustand'
import type { User } from '../types'
import { API_URL } from '../config'

interface AuthState {
  currentUser: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  addPoints: (userId: string, amount: number) => void
  removePoints: (userId: string, amount: number) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,

  login: async (email, password) => {
    try {
      const url = `${API_URL}/api/login`
      console.log('🔐 Tentando login em:', url)
      console.log('📡 API_URL configurada:', API_URL)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        // Adicionar opções para melhor tratamento de erros
        signal: AbortSignal.timeout(30000) // Timeout de 30 segundos
      })

      console.log('📡 Resposta do servidor:', response.status, response.statusText)
      console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        let errorData = {}
        try {
          const text = await response.text()
          console.log('📄 Corpo da resposta de erro:', text)
          errorData = text ? JSON.parse(text) : {}
        } catch (parseError) {
          console.warn('⚠️  Não foi possível parsear resposta de erro')
        }
        
        console.error('❌ Erro no login:', errorData)
        throw new Error(errorData.error || errorData.message || `Erro ${response.status}: ${response.statusText}`)
      }

      const user = await response.json()
      console.log('✅ Login bem-sucedido:', user.email)
      set({ currentUser: user })
      return true
    } catch (error) {
      console.error('❌ Erro no login:', error)
      if (error instanceof Error) {
        console.error('Tipo:', error.name)
        console.error('Mensagem:', error.message)
        console.error('Stack:', error.stack)
        
        // Se for erro de rede, mostrar mensagem mais clara
        if (error.name === 'TypeError' && error.message.includes('Load failed')) {
          console.error('🔴 Erro de rede: A requisição falhou. Verifique se o servidor está acessível.')
        }
      }
      return false
    }
  },

  logout: () => {
    set({ currentUser: null })
  },

  addPoints: (userId, amount) => {
    const currentUser = get().currentUser
    if (currentUser && currentUser.id === userId) {
      set({ 
        currentUser: { ...currentUser, points: currentUser.points + amount }
      })
    }
  },

  removePoints: (userId, amount) => {
    const currentUser = get().currentUser
    if (currentUser && currentUser.id === userId) {
      if (currentUser.points < amount) {
        return false // Saldo insuficiente
      }
      set({ 
        currentUser: { ...currentUser, points: currentUser.points - amount }
      })
      return true
    }
    return false
  },
}))