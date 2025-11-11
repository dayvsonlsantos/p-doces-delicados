// components/Auth/ProtectedRoute.js
import { useAuth } from '../../contexts/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated && router.pathname !== '/login') {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router.pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-3xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-white mx-auto mb-4">
            <i className="fas fa-spinner fa-spin text-xl"></i>
          </div>
          <p className="text-primary">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não está autenticado e não está na página de login, não renderiza nada
  if (!isAuthenticated && router.pathname !== '/login') {
    return null
  }

  return children
}