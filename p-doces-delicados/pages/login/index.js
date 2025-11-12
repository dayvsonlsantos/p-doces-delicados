import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import GlassCard from '../../components/UI/GlassCard'
import GlassButton from '../../components/UI/GlassButton'
import Input from '../../components/UI/Input'
import { FaCookieBite, FaSignInAlt, FaSpinner, FaExclamationTriangle } from 'react-icons/fa'
import Image from 'next/image'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, isAuthenticated } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()

  // Aplicar a cor do tema e cores personalizadas ao componente
  useEffect(() => {
    const applyThemeAndColors = () => {
      const body = document.body
      const html = document.documentElement
      const root = document.documentElement
      
      // Remove classes de tema anteriores
      body.classList.remove('light', 'dark')
      html.classList.remove('light', 'dark')
      
      // Aplica o tema atual
      body.classList.add(theme)
      html.classList.add(theme)
      
      // Carrega as cores personalizadas do localStorage
      const savedColors = localStorage.getItem('colorSettings')
      if (savedColors) {
        try {
          const colorSettings = JSON.parse(savedColors)
          const { hue, saturation, lightness } = colorSettings
          
          console.log('🎨 Aplicando cores personalizadas no login:', colorSettings)
          
          // Aplica cores personalizadas (MAIS SUAVES)
          root.style.setProperty('--primary-hue', hue)
          root.style.setProperty('--primary-saturation', `${saturation}%`)
          root.style.setProperty('--primary-lightness', `${lightness}%`)
          
          // Calcula cores derivadas MAIS SUAVES
          const primaryColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`
          const primaryLight = `hsl(${hue}, ${saturation}%, ${lightness + 10}%)`
          const primaryDark = `hsl(${hue}, ${saturation}%, ${lightness - 10}%)`
          
          // Aplica cores derivadas
          root.style.setProperty('--primary-color-dynamic', primaryColor)
          root.style.setProperty('--primary-color-light', primaryLight)
          root.style.setProperty('--primary-color-dark', primaryDark)
          root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${primaryColor} 0%, ${primaryLight} 100%)`)

          // Aplica gradiente personalizado MAIS ESCURO (igual ao dashboard)
          if (theme === 'dark') {
            body.style.background = `linear-gradient(135deg, 
              hsl(${hue}, ${Math.max(saturation * 0.2, 10)}%, 6%) 0%,
              hsl(${hue}, ${Math.max(saturation * 0.15, 8)}%, 10%) 50%,
              hsl(${hue}, ${Math.max(saturation * 0.1, 5)}%, 14%) 100%
            )`
          } else {
            body.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
          }
        } catch (error) {
          console.error('Erro ao carregar cores personalizadas:', error)
          applyDefaultColors(theme)
        }
      } else {
        applyDefaultColors(theme)
      }
    }

    applyThemeAndColors()
  }, [theme])

  // Função para aplicar cores padrão
  const applyDefaultColors = (currentTheme) => {
    const body = document.body
    
    if (currentTheme === 'dark') {
      body.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
    } else {
      body.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
    }
  }

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
    <div className="min-h-screen flex items-center justify-center p-4 transition-all duration-300">
      <div className="w-full max-w-md">
        <GlassCard className="w-full">
          <div className="text-center mb-8 flex items-center justify-center flex-col">
            <div className="w-20 h-20 mb-4 rounded-2xl flex items-center justify-center bg-white/5">
              <Image
                width={80}
                height={80}
                className='rounded-2xl'
                src={'/logo/logo.png'}
                alt="Doces Delicados"
              />
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">Doces Delicados</h1>
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
            <div>
              <label className="block text-primary text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="seu@email.com"
                required
                disabled={loading}
                className="w-full glass-input"
              />
            </div>

            <div>
              <label className="block text-primary text-sm font-medium mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Sua senha"
                required
                disabled={loading}
                className="w-full glass-input"
              />
            </div>

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

          {/* Informações sobre o tema atual */}
          <div className="mt-6 text-center">
            <p className="text-secondary text-sm">
              Tema atual: <span className="font-medium capitalize">{theme}</span>
            </p>
          </div>
        </GlassCard>
      </div>

      {/* CSS inline para garantir que as cores sejam aplicadas de forma mais suave */}
      <style jsx global>{`
        .glass-input {
          backdrop-filter: blur(10px);
          border: 1px solid;
          border-radius: 1rem;
          padding: 0.75rem 1rem;
          width: 100%;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        body.dark .glass-input {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: white;
        }

        body.dark .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
        }

        body.dark .glass-input:focus {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
          outline: none;
        }

        body.light .glass-input {
          background: rgba(255, 255, 255, 0.7);
          border-color: rgba(0, 0, 0, 0.1);
          color: #374151;
        }

        /* Aplicar cores mais suaves nos elementos do login */
        body.dark .dynamic-gradient {
          background: var(--primary-gradient, linear-gradient(135deg, hsl(210, 80%, 60%) 0%, hsl(210, 80%, 75%) 100%)) !important;
        }

        /* Garantir que os textos tenham contraste adequado */
        body.dark .text-primary {
          color: white !important;
        }

        body.dark .text-secondary {
          color: rgba(255, 255, 255, 0.6) !important;
        }

        body.light .text-primary {
          color: #374151 !important;
        }

        body.light .text-secondary {
          color: #6b7280 !important;
        }

        /* Card do login com cores mais escuras */
        body.dark .login-card-glass {
          background: rgba(0, 0, 0, 0.2) !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        body.light .login-card-glass {
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.9);
        }
      `}</style>
    </div>
  )
}