import { useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

export default function StatusBarFix() {
  const { theme } = useTheme()

  useEffect(() => {
    // Função ultra-agressiva para forçar a barra de status escura
    const forceDarkStatusBar = () => {
      try {
        console.log('🔄 Forçando barra de status escura...')
        
        // Método 1: Atualizar meta tag theme-color
        let themeColorMeta = document.querySelector('meta[name="theme-color"]')
        if (!themeColorMeta) {
          themeColorMeta = document.createElement('meta')
          themeColorMeta.name = 'theme-color'
          document.head.appendChild(themeColorMeta)
        }
        
        // Método 2: Atualizar apple-mobile-web-app-status-bar-style
        let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
        if (!appleStatusBar) {
          appleStatusBar = document.createElement('meta')
          appleStatusBar.name = 'apple-mobile-web-app-status-bar-style'
          document.head.appendChild(appleStatusBar)
        }

        if (theme === 'dark') {
          // COR PRETO PURO para garantir
          themeColorMeta.content = '#000000'
          appleStatusBar.content = 'black-translucent'
          console.log('🌙 Barra de status forçada para PRETO')
        } else {
          themeColorMeta.content = '#ffffff'
          appleStatusBar.content = 'default'
          console.log('☀️ Barra de status forçada para BRANCO')
        }

        // Método 3: Injetar CSS direto na página para alguns browsers
        injectDarkStatusBarCSS()

        // Método 4: Forçar via JavaScript injection múltiplas vezes
        forceViaJavaScript()

      } catch (error) {
        console.error('❌ Erro ao forçar barra de status:', error)
      }
    }

    const injectDarkStatusBarCSS = () => {
      // Remove CSS anterior se existir
      const existingStyle = document.getElementById('status-bar-dark-css')
      if (existingStyle) {
        existingStyle.remove()
      }

      if (theme === 'dark') {
        const style = document.createElement('style')
        style.id = 'status-bar-dark-css'
        style.textContent = `
          /* Forçar fundo escuro para toda a viewport */
          html, body {
            background-color: #000000 !important;
          }
          
          /* Para alguns browsers Android */
          @media (display-mode: standalone) {
            body {
              background-color: #000000 !important;
            }
          }
        `
        document.head.appendChild(style)
      }
    }

    const forceViaJavaScript = () => {
      // Executar múltiplas vezes para garantir
      const attempts = [0, 100, 500, 1000, 2000]
      
      attempts.forEach(delay => {
        setTimeout(() => {
          try {
            const meta = document.querySelector('meta[name="theme-color"]')
            if (meta && theme === 'dark') {
              meta.content = '#000000'
              console.log(`⏱️ Tentativa ${delay}ms: theme-color atualizado`)
            }
          } catch (e) {}
        }, delay)
      })
    }

    // Executar imediatamente
    forceDarkStatusBar()

    // Executar também quando a visibilidade da página mudar
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(forceDarkStatusBar, 100)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [theme])

  return null // Componente não renderiza nada visível
}