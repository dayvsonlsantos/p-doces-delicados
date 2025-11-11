// components/Layout/Header.js (atualizado)
import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import SettingsModal from '../Settings/SettingsModal'
import { FaSun, FaMoon, FaBars, FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa'

export default function Header({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <header className="glass-dark border-b border-white/10 dark:border-gray-200/10 relative z-40">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 text-primary transition-colors"
          >
            <FaBars />
          </button>

          <div className="flex-1 text-center lg:text-left px-2">
            <h1 className="text-xl sm:text-2xl font-bold text-primary truncate">Doces Delicados</h1>
            <p className="text-secondary text-xs sm:text-sm hidden sm:block">Sistema de gestão</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Toggle de Tema */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 text-primary transition-colors"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <FaSun size={14} className="sm:w-4" /> : <FaMoon size={14} className="sm:w-4" />}
            </button>

            {/* Dropdown do Usuário */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 sm:gap-3 p-2 rounded-2xl bg-white/10 hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 text-primary transition-colors dynamic-gradient"
                style={theme === 'dark' ? {
                  background: `linear-gradient(135deg, 
        hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) * 0.3)) 0%,
        hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) * 0.4)) 100%
      )`
                } : {
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                }}>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-2xl bg-blue-500 flex items-center justify-center text-white"
                  style={theme === 'dark' ? {
                    background: `linear-gradient(135deg, 
          hsl(var(--primary-hue), var(--primary-saturation), var(--primary-lightness)) 0%,
          hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) * 1.2)) 100%
        )`
                  } : {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                  }}>
                  <FaUser size={10} className="sm:w-3" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-primary truncate max-w-[120px]">{user?.name}</p>
                  <p className="text-xs text-secondary truncate max-w-[120px]">{user?.email}</p>
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl p-2 shadow-2xl z-50 border border-white/20 bg-gray-900/95 backdrop-blur-3xl">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-200 truncate">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      setSettingsOpen(true)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-white transition-colors text-sm"
                  >
                    <FaCog size={14} />
                    <span>Configurações</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      logout()
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-300 transition-colors text-sm"
                  >
                    <FaSignOutAlt size={14} />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
      />
    </>
  )
}