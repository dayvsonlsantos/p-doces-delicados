// contexts/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorage('user', null)
  const [token, setToken] = useLocalStorage('token', null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verifica se o usuário está autenticado apenas uma vez no carregamento inicial
    const checkAuth = () => {
      if (user && token) {
        // Usuário está autenticado
        if (router.pathname === '/login') {
          router.push('/')
        }
      } else {
        // Usuário não está autenticado
        if (router.pathname !== '/login') {
          router.push('/login')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, []) // Removemos as dependências para executar apenas uma vez

  const login = async (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    router.push('/') // Redireciona para a home após login
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/login')
  }

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}