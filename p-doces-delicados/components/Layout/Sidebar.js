// components/Layout/Sidebar.js
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTheme } from '../../contexts/ThemeContext'
import {
  FaHome, FaBox, FaWeight, FaCookie, FaTag,
  FaBirthdayCake, FaChevronDown, FaChevronRight,
  FaIceCream, FaCalculator,
  FaClipboardList
} from 'react-icons/fa'
import { useState } from 'react'
import Image from 'next/image'

export default function Sidebar({ activePage, onClose }) {
  const router = useRouter()
  const { theme } = useTheme()
  const [expandedSections, setExpandedSections] = useState({
    candies: router.pathname.startsWith('/candies'),
    cakes: router.pathname.startsWith('/cakes')
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const menuSections = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      path: '/',
      icon: FaHome,
      type: 'single'
    },
    {
      id: 'orders',
      name: 'Encomendas',
      path: '/orders',
      icon: FaClipboardList,
      type: 'single'
    },
    {
      id: 'products',
      name: 'Produtos',
      path: '/products',
      icon: FaBox,
      type: 'single'
    },
    {
      id: 'supplies',
      name: 'Insumos',
      path: '/supplies',
      icon: FaTag,
      type: 'single'
    },
    {
      id: 'candies',
      name: 'Docinhos',
      icon: FaCookie,
      type: 'section',
      items: [
        { name: 'Massas', path: '/candies/masses', icon: FaWeight },
        { name: 'Docinhos', path: '/candies', icon: FaCookie },
        { name: 'Calcular', path: '/candies/batch', icon: FaCalculator }
      ]
    },
    {
      id: 'cakes',
      name: 'Bolos',
      icon: FaBirthdayCake,
      type: 'section',
      items: [
        { name: 'Massas', path: '/cakes/masses', icon: FaWeight },
        { name: 'Coberturas', path: '/cakes/frostings', icon: FaIceCream },
        { name: 'Bolos', path: '/cakes', icon: FaBirthdayCake },
        { name: 'Calcular', path: '/cakes/batch', icon: FaCalculator }
      ]
    }
  ]

  const getItemIcon = (iconName) => {
    const icons = {
      FaWeight: FaWeight,
      FaCookie: FaCookie,
      FaCalculator: FaCalculator,
      FaIceCream: FaIceCream,
      FaBirthdayCake: FaBirthdayCake
    }
    return icons[iconName] || FaWeight
  }

  return (
    <div className="h-full glass-dark w-80 flex flex-col">
      {/* Header fixo */}
      <div className="flex-shrink-0 p-4 md:p-6 border-b border-white/10 dark:border-gray-200/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-white">
            <Image 
              width={100} 
              height={100} 
              className='rounded-xl md:rounded-2xl' 
              src={'/logo/logo.png'}
              alt="Doces Delicados"
            />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-primary">Doces Delicados</h1>
            <p className="text-secondary text-xs md:text-sm"></p>
          </div>
        </div>
      </div>

      {/* Conteúdo com scroll */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-3 md:p-4 space-y-1">
          {menuSections.map((section) => {
            if (section.type === 'single') {
              const IconComponent = section.icon
              const isActive = router.pathname === section.path

              return (
                <Link
                  key={section.id}
                  href={section.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all ${isActive
                      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      : 'text-secondary hover:bg-white/10 dark:hover:bg-gray-800/50 hover:text-primary'
                    }`}
                >
                  <IconComponent size={16} className="flex-shrink-0" />
                  <span className="font-medium text-sm md:text-base">{section.name}</span>
                </Link>
              )
            } else {
              const IconComponent = section.icon
              const isExpanded = expandedSections[section.id]
              const hasActiveChild = section.items.some(item =>
                router.pathname === item.path || router.pathname.startsWith(item.path + '/')
              )

              return (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`flex items-center justify-between w-full p-3 md:p-4 rounded-xl md:rounded-2xl transition-all ${hasActiveChild
                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                        : 'text-secondary hover:bg-white/10 dark:hover:bg-gray-800/50 hover:text-primary'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent size={16} className="flex-shrink-0" />
                      <span className="font-medium text-sm md:text-base">{section.name}</span>
                    </div>
                    {isExpanded ? 
                      <FaChevronDown size={12} className="flex-shrink-0" /> : 
                      <FaChevronRight size={12} className="flex-shrink-0" />
                    }
                  </button>

                  {isExpanded && (
                    <div className="ml-6 md:ml-8 mt-1 space-y-1">
                      {section.items.map((item) => {
                        const ItemIcon = getItemIcon(item.icon.name)
                        const isActive = router.pathname === item.path

                        return (
                          <Link
                            key={item.path}
                            href={item.path}
                            onClick={onClose}
                            className={`flex items-center gap-3 p-2 md:p-3 rounded-lg md:rounded-xl transition-all text-xs md:text-sm ${isActive
                                ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                : 'text-secondary hover:bg-white/10 dark:hover:bg-gray-800/50 hover:text-primary'
                              }`}
                          >
                            <ItemIcon size={12} className="flex-shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }
          })}
        </nav>
      </div>

      {/* Footer fixo */}
      <div className="flex-shrink-0 p-3 md:p-4 border-t border-white/10 dark:border-gray-200/10">
        <div className="text-center text-secondary text-xs md:text-sm">
          <p>Tema: {theme === 'dark' ? 'Escuro' : 'Claro'}</p>
          <p>v2.0.0</p>
        </div>
      </div>
    </div>
  )
}