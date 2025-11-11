// components/Layout/Header.js
import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { FaSun, FaMoon, FaBars, FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa'

export default function Header({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
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
    <header className="glass-dark border-b border-white/10 dark:border-gray-200/10 relative z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 text-primary transition-colors"
        >
          <FaBars />
        </button>

        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-2xl font-bold text-primary">Doces Delicados</h1>
          <p className="text-secondary text-sm">Sistema de gestão</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Toggle de Tema */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 text-primary transition-colors"
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>

          {/* Dropdown do Usuário */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-2 rounded-2xl bg-white/10 hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 text-primary transition-colors"
            >
              <div className="w-8 h-8 rounded-2xl bg-blue-500 flex items-center justify-center text-white">
                <FaUser size={14} />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-primary">{user?.name}</p>
                <p className="text-xs text-secondary">{user?.email}</p>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 glass rounded-2xl p-2 shadow-lg z-50 border border-white/20">
                <div className="px-3 py-2 border-b border-white/10 dark:border-gray-200/10">
                  <p className="text-sm font-medium text-primary">{user?.name}</p>
                  <p className="text-xs text-secondary truncate">{user?.email}</p>
                </div>
                
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    // Aqui pode ir para configurações
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 dark:hover:bg-gray-700/50 text-primary transition-colors text-sm"
                >
                  <FaCog size={14} />
                  <span>Configurações</span>
                </button>
                
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-500 transition-colors text-sm"
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
  )
}