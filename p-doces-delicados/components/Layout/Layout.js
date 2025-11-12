import Header from './Header'
import Sidebar from './Sidebar'
import { useEffect, useState } from 'react'
import ProtectedRoute from '../Auth/ProtectedRoute'
import { useTheme } from '../../contexts/ThemeContext'

export default function Layout({ children, activePage }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme } = useTheme()

  // Aplicar cores do tema e personalizadas
  useEffect(() => {
    const applyThemeAndColors = () => {
      const body = document.body
      const html = document.documentElement
      
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
          const root = document.documentElement
          
          // Aplica cores personalizadas
          root.style.setProperty('--primary-hue', colorSettings.hue)
          root.style.setProperty('--primary-saturation', `${colorSettings.saturation}%`)
          root.style.setProperty('--primary-lightness', `${colorSettings.lightness}%`)
          
          // Atualiza PWA theme color
          if (typeof window !== 'undefined' && window.updatePWAThemeColor) {
            window.updatePWAThemeColor(colorSettings.hue, colorSettings.saturation, colorSettings.lightness)
          }
          
          // Aplica gradiente se for modo escuro
          if (theme === 'dark') {
            body.style.background = `linear-gradient(135deg, 
              hsl(${colorSettings.hue}, ${Math.max(colorSettings.saturation * 0.4, 20)}%, 8%) 0%,
              hsl(${colorSettings.hue}, ${Math.max(colorSettings.saturation * 0.3, 15)}%, 12%) 50%,
              hsl(${colorSettings.hue}, ${Math.max(colorSettings.saturation * 0.2, 10)}%, 16%) 100%
            )`
          } else {
            body.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
          }
        } catch (error) {
          console.error('Erro ao aplicar cores personalizadas:', error)
        }
      } else {
        // Cores padrão
        if (theme === 'dark') {
          body.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
        } else {
          body.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
        }
      }
    }

    applyThemeAndColors()
  }, [theme])

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex">
        {/* Sidebar Mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-80 h-full">
              <Sidebar activePage={activePage} onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Sidebar Desktop */}
        <div className="hidden lg:flex lg:w-80">
          <Sidebar activePage={activePage} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}