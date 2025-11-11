import '../styles/globals.css'
import { ThemeProvider } from '../contexts/ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'
import { useEffect } from 'react'
import InstallPrompt from '../components/PWA/InstallPrompt' // Novo componente

function ThemeInitializer() {
  useEffect(() => {
    // Aplicar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'dark'
    document.body.className = savedTheme
    
    // Aplicar cores salvas apenas se for modo escuro
    const savedColors = localStorage.getItem('colorSettings')
    if (savedColors && savedTheme === 'dark') {
      try {
        const { hue, saturation, lightness } = JSON.parse(savedColors)
        const root = document.documentElement
        root.style.setProperty('--primary-hue', hue)
        root.style.setProperty('--primary-saturation', `${saturation}%`)
        root.style.setProperty('--primary-lightness', `${lightness}%`)
        
        // Aplicar gradiente de fundo apenas para modo escuro
        document.body.style.background = `linear-gradient(135deg, 
          hsl(${hue}, ${Math.max(saturation * 0.4, 30)}%, 8%) 0%,
          hsl(${hue + 20}, ${Math.max(saturation * 0.35, 25)}%, 12%) 50%,
          hsl(${hue + 40}, ${Math.max(saturation * 0.3, 20)}%, 16%) 100%
        )`
      } catch (error) {
        console.error('Erro ao aplicar cores salvas:', error)
      }
    }
    
    // Resetar cores se for modo claro - GARANTIR GRADIENTE ORIGINAL
    if (savedTheme === 'light') {
      const body = document.body
      body.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
      body.classList.remove('color-preview')
    }

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, [])

  return null
}

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeInitializer />
        <Component {...pageProps} />
        <InstallPrompt /> {/* Adicionar o prompt de instalação */}
      </AuthProvider>
    </ThemeProvider>
  )
}

export default MyApp