// components/Layout/Sidebar.js
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTheme } from '../../contexts/ThemeContext'
import { 
  FaHome, FaBox, FaWeight, FaCookie, FaTag, 
  FaBirthdayCake, FaChevronDown, FaChevronRight,
  FaIceCream, FaCalculator
} from 'react-icons/fa'
import { useState } from 'react'

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
      <div className="p-6 border-b border-white/10 dark:border-gray-200/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
            <FaBirthdayCake size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">Doces Delicados</h1>
            <p className="text-secondary text-sm"></p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuSections.map((section) => {
          if (section.type === 'single') {
            const IconComponent = section.icon
            const isActive = router.pathname === section.path
            
            return (
              <Link
                key={section.id}
                href={section.path}
                onClick={onClose}
                className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${
                  isActive 
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30' 
                    : 'text-secondary hover:bg-white/10 dark:hover:bg-gray-800/50 hover:text-primary'
                }`}
              >
                <IconComponent size={18} />
                <span className="font-medium">{section.name}</span>
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
                  className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all ${
                    hasActiveChild
                      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30' 
                      : 'text-secondary hover:bg-white/10 dark:hover:bg-gray-800/50 hover:text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent size={18} />
                    <span className="font-medium">{section.name}</span>
                  </div>
                  {isExpanded ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                </button>

                {isExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {section.items.map((item) => {
                      const ItemIcon = getItemIcon(item.icon.name)
                      const isActive = router.pathname === item.path
                      
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={onClose}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all text-sm ${
                            isActive 
                              ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                              : 'text-secondary hover:bg-white/10 dark:hover:bg-gray-800/50 hover:text-primary'
                          }`}
                        >
                          <ItemIcon size={14} />
                          <span>{item.name}</span>
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

      <div className="p-4 border-t border-white/10 dark:border-gray-200/10">
        <div className="text-center text-secondary text-sm">
          <p>Tema: {theme === 'dark' ? 'Escuro' : 'Claro'}</p>
          <p>v2.0.0</p>
        </div>
      </div>
    </div>
  )
}