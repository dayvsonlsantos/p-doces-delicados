// pages/_app.js
import '../styles/globals.css'
import { ThemeProvider } from '../contexts/ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  // Garante que o tema seja aplicado no carregamento inicial
  useEffect(() => {
    // Forçar o tema escuro inicialmente e depois aplicar o salvo
    document.body.className = 'dark'
    
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTimeout(() => {
      document.body.className = savedTheme
    }, 100)
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default MyApp