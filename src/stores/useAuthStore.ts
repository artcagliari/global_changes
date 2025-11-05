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
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      console.log('📡 Resposta do servidor:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
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
        console.error('Mensagem:', error.message)
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