// pages/login.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import GlassCard from '../../components/UI/GlassCard'
import GlassButton from '../../components/UI/GlassButton'
import Input from '../../components/UI/Input'
import { FaCookieBite, FaSignInAlt, FaSpinner, FaExclamationTriangle } from 'react-icons/fa'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  // Se já estiver autenticado, redireciona para home
  if (isAuthenticated) {
    router.push('/')
    return null
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        await login(data.user, data.token)
      } else {
        setError(data.message || 'Erro ao fazer login. Verifique suas credenciais.')
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-blue-500 flex items-center justify-center text-white mx-auto mb-4">
            <FaCookieBite size={32} />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Docinhos Master</h1>
          <p className="text-secondary">Faça login para continuar</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/30">
            <div className="flex items-center gap-3 text-red-500">
              <FaExclamationTriangle />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('') // Limpa erro quando usuário digitar
            }}
            placeholder="seu@email.com"
            required
            disabled={loading}
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('') // Limpa erro quando usuário digitar
            }}
            placeholder="Sua senha"
            required
            disabled={loading}
          />

          <GlassButton
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaSignInAlt />
            )}
            {loading ? 'Entrando...' : 'Entrar'}
          </GlassButton>
        </form>

        <div className="mt-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-secondary text-sm text-center">
            <strong>Credenciais de teste:</strong><br />
            Email: admin@docinhos.com<br />
            Senha: admin123
          </p>
        </div>
      </GlassCard>
    </div>
  )
}