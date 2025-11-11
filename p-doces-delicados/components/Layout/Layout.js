// components/Layout/Layout.js
import Header from './Header'
import Sidebar from './Sidebar'
import { useState } from 'react'
import ProtectedRoute from '../Auth/ProtectedRoute'

export default function Layout({ children, activePage }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
          <Header onMenuClick={() => setSidebarOpen(true)} />
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