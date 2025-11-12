import { useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'

export function usePWATheme() {
  const { theme } = useTheme()

  useEffect(() => {
    const updatePWATheme = () => {
      try {
        const themeColorMeta = document.querySelector('meta[name="theme-color"]')
        const appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
        
        const savedColors = localStorage.getItem('colorSettings')
        
        if (theme === 'dark') {
          // Modo escuro - cor muito escura para barra de status
          let darkColor = '#000000' // Preto puro como fallback
          
          if (savedColors) {
            const colorSettings = JSON.parse(savedColors)
            const { hue, saturation } = colorSettings
            // Cor extremamente escura para a barra de status
            darkColor = `hsl(${hue}, ${Math.max(saturation * 0.05, 2)}%, 2%)`
          }
          
          if (themeColorMeta) {
            themeColorMeta.setAttribute('content', darkColor)
            console.log('🌙 PWA theme-color atualizado (escuro):', darkColor)
          }
          
          if (appleStatusBar) {
            appleStatusBar.setAttribute('content', 'black-translucent')
          }
          
          // Forçar atualização também no manifest (para alguns browsers)
          updateManifestThemeColor(darkColor)
          
        } else {
          // Modo claro
          const lightColor = '#f8fafc'
          if (themeColorMeta) {
            themeColorMeta.setAttribute('content', lightColor)
          }
          if (appleStatusBar) {
            appleStatusBar.setAttribute('content', 'default')
          }
          console.log('☀️ PWA theme-color atualizado (claro)')
        }
      } catch (error) {
        console.error('Erro ao atualizar PWA theme:', error)
      }
    }

    // Função para atualizar dinamicamente o manifest (hack para alguns browsers)
    const updateManifestThemeColor = (color) => {
      try {
        const manifestLink = document.querySelector('link[rel="manifest"]')
        if (manifestLink) {
          const url = new URL(manifestLink.href)
          url.searchParams.set('theme', color)
          manifestLink.href = url.toString()
        }
      } catch (error) {
        console.log('Não foi possível atualizar manifest dinamicamente')
      }
    }

    // Atualizar imediatamente
    updatePWATheme()

    // Também atualizar após um pequeno delay para garantir
    const timeoutId = setTimeout(updatePWATheme, 100)
    
    return () => clearTimeout(timeoutId)
  }, [theme])

  return null
}