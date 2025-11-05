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
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        return false
      }

      const user = await response.json()
      set({ currentUser: user })
      return true
    } catch (error) {
      console.error('Erro no login:', error)
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