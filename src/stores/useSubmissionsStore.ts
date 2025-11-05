import { create } from 'zustand'
import type { Submission, Reward } from '../types'
import { useAuthStore } from './useAuthStore'

// Mock de dados
const MOCK_REWARDS: Reward[] = [
  { id: 'r1', name: 'Garrafa de Água Ecológica', pointCost: 500 },
  { id: 'r2', name: 'Vale-Lanche Cantina', pointCost: 300 },
  { id: 'r3', name: 'Muda de Árvore (Plantio)', pointCost: 1000 },
]

// Deixe zerado ao iniciar
const MOCK_SUBMISSIONS: Submission[] = []

interface SubmissionState {
  submissions: Submission[]
  rewards: Reward[]
  addSubmission: (videoUrl: string) => void
  approveSubmission: (id: string) => void
  rejectSubmission: (id: string) => void
  redeemReward: (rewardId: string) => boolean
}

export const useSubmissionsStore = create<SubmissionState>((set, get) => ({
  submissions: MOCK_SUBMISSIONS,
  rewards: MOCK_REWARDS,

  addSubmission: (videoUrl) => {
    const currentUser = useAuthStore.getState().currentUser
    if (!currentUser || currentUser.role !== 'student') return

    const newSubmission: Submission = {
      id: `s${Math.random().toString(36).substring(7)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      videoUrl: videoUrl,
      status: 'pending',
      submittedAt: new Date(),
    }

    set((state) => ({
      submissions: [newSubmission, ...state.submissions],
    }))
  },

  approveSubmission: (id) => {
    const submission = get().submissions.find((s) => s.id === id)
    if (!submission) return

    // Concede 1 crédito por vídeo aprovado
    useAuthStore.getState().addPoints(submission.userId, 1)

    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === id ? { ...s, status: 'approved' } : s,
      ),
    }))
  },

  rejectSubmission: (id) => {
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === id ? { ...s, status: 'rejected' } : s,
      ),
    }))
  },

  redeemReward: (rewardId) => {
    const currentUser = useAuthStore.getState().currentUser
    const reward = get().rewards.find((r) => r.id === rewardId)

    if (!currentUser || !reward) return false

    // Tenta remover os pontos. A função retorna false se não houver saldo.
    const success = useAuthStore
      .getState()
      .removePoints(currentUser.id, reward.pointCost)

    if (success) {
      alert(`Recompensa "${reward.name}" resgatada com sucesso!`)
      return true
    } else {
      alert('Saldo de pontos insuficiente!')
      return false
    }
  },
}))