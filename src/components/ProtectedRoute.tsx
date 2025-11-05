import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  roleRequired: 'student' | 'admin'
}

const ProtectedRoute = ({ children, roleRequired }: ProtectedRouteProps) => {
  const currentUser = useAuthStore((state) => state.currentUser)

  if (!currentUser) {
    // Usuário não logado, redireciona para o login
    return <Navigate to="/login" replace />
  }

  if (currentUser.role !== roleRequired) {
    // Usuário logado mas sem a permissão correta
    // Redireciona para o dashboard padrão de sua role
    const defaultPath =
      currentUser.role === 'admin' ? '/admin' : '/dashboard'
    return <Navigate to={defaultPath} replace />
  }

  // Usuário logado e com permissão
  return <>{children}</>
}

export default ProtectedRoute