import { useState, useEffect } from 'react'

export function useColorSettings() {
  const [colorSettings, setColorSettings] = useState({
    hue: 210,
    saturation: 80,
    lightness: 60,
    primaryColor: 'hsl(210, 80%, 60%)'
  })

  const [isInitialized, setIsInitialized] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Carregar configurações do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('colorSettings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        console.log('📁 Carregando cores salvas:', settings)
        setColorSettings(settings)
        applySavedColorToCSS(settings.hue, settings.saturation, settings.lightness)
        updatePWAThemeColor(settings.hue, settings.saturation, settings.lightness)
      } catch (error) {
        console.error('Erro ao carregar cores:', error)
        applyDefaultColors()
      }
    } else {
      console.log('🎨 Usando cores padrão')
      applyDefaultColors()
    }
    setIsInitialized(true)
  }, [])

  // Aplicar cores padrão
  const applyDefaultColors = () => {
    applySavedColorToCSS(210, 80, 60)
    updatePWAThemeColor(210, 80, 60)
  }

  // Aplicar preview (modo temporário)
  const applyPreviewColor = (hue, saturation, lightness) => {
    const root = document.documentElement
    const body = document.body

    console.log('👁️ Aplicando PREVIEW no CSS:', { hue, saturation, lightness })

    if (body.classList.contains('dark')) {
      // Marca como preview
      body.classList.add('color-preview')

      // Aplica variáveis temporárias
      root.style.setProperty('--primary-hue-preview', hue)
      root.style.setProperty('--primary-saturation-preview', `${saturation}%`)
      root.style.setProperty('--primary-lightness-preview', `${lightness}%`)

      // Aplica gradiente de preview
      body.style.background = `linear-gradient(135deg, 
        hsl(${hue}, ${Math.max(saturation * 0.2, 10)}%, 6%) 0%,
        hsl(${hue}, ${Math.max(saturation * 0.15, 8)}%, 10%) 50%,
        hsl(${hue}, ${Math.max(saturation * 0.1, 5)}%, 14%) 100%
      )`
    }
  }

  // Atualizar PWA theme color - CORREÇÃO FORTE
  const updatePWAThemeColor = (hue, saturation, lightness) => {
    try {
      const themeColorMeta = document.querySelector('meta[name="theme-color"]')
      const appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')

      if (document.body.classList.contains('dark')) {
        // Modo escuro - cor extremamente escura
        const darkColor = `hsl(${hue}, ${Math.max(saturation * 0.05, 2)}%, 2%)`

        if (themeColorMeta) {
          themeColorMeta.setAttribute('content', darkColor)
          console.log('🌙 PWA theme-color FORÇADO (escuro):', darkColor)
        }

        if (appleStatusBar) {
          appleStatusBar.setAttribute('content', 'black-translucent')
        }

        // Método alternativo para alguns browsers
        forceThemeColorUpdate(darkColor)
      }
    } catch (error) {
      console.error('Erro ao atualizar PWA theme-color:', error)
    }
  }

  // Método alternativo para forçar atualização
  const forceThemeColorUpdate = (color) => {
    // Criar um novo meta tag se necessário
    let themeColorMeta = document.querySelector('meta[name="theme-color"]')
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta')
      themeColorMeta.name = 'theme-color'
      document.head.appendChild(themeColorMeta)
    }
    themeColorMeta.content = color

    // Também tentar atualizar via JavaScript injection
    const script = document.createElement('script')
    script.textContent = `
      try {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = '${color}';
        
        // Para iOS
        const appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (appleMeta) appleMeta.content = 'black-translucent';
      } catch(e) {}
    `
    document.head.appendChild(script)
    setTimeout(() => document.head.removeChild(script), 100)
  }

  const removePreview = () => {
    const body = document.body
    body.classList.remove('color-preview')
    applySavedColorToCSS(colorSettings.hue, colorSettings.saturation, colorSettings.lightness)
    setHasChanges(false)
  }

  const updateColorSettings = (newSettings, isPreview = false) => {
    console.log('🔄 Atualizando configurações:', { newSettings, isPreview })

    if (isPreview) {
      const { hue, saturation, lightness } = { ...colorSettings, ...newSettings }
      applyPreviewColor(hue, saturation, lightness)
      return { ...colorSettings, ...newSettings }
    } else {
      const updatedSettings = { ...colorSettings, ...newSettings }

      console.log('💾 SALVANDO configurações:', updatedSettings)

      if (newSettings.hue !== undefined || newSettings.saturation !== undefined || newSettings.lightness !== undefined) {
        const hue = newSettings.hue !== undefined ? newSettings.hue : colorSettings.hue
        const saturation = newSettings.saturation !== undefined ? newSettings.saturation : colorSettings.saturation
        const lightness = newSettings.lightness !== undefined ? newSettings.lightness : colorSettings.lightness

        updatedSettings.primaryColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`
        applySavedColorToCSS(hue, saturation, lightness)
        updatePWAThemeColor(hue, saturation, lightness)
      }

      setColorSettings(updatedSettings)
      localStorage.setItem('colorSettings', JSON.stringify(updatedSettings))
      setHasChanges(false)

      return updatedSettings
    }
  }

  const resetToDefault = () => {
    console.log('🔄 Resetando para padrão')
    const defaultSettings = {
      hue: 210,
      saturation: 80,
      lightness: 60,
      primaryColor: 'hsl(210, 80%, 60%)'
    }
    setColorSettings(defaultSettings)
    applyPreviewColor(210, 80, 60)
    setHasChanges(true)
    return defaultSettings
  }

  const forceColorUpdate = () => {
    const saved = localStorage.getItem('colorSettings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        console.log('🔄 Forçando atualização de cores:', settings)
        applySavedColorToCSS(settings.hue, settings.saturation, settings.lightness)
        updatePWAThemeColor(settings.hue, settings.saturation, settings.lightness)
      } catch (error) {
        console.error('Erro ao forçar atualização de cores:', error)
      }
    }
  }

  // Adicione esta função ao hook
  const syncStatusBarWithNavbar = (hue, saturation, lightness) => {
    try {
      const navbarColor = `hsl(${hue}, ${Math.max(saturation * 0.3, 15)}%, 8%)`
      const themeColorMeta = document.querySelector('meta[name="theme-color"]')

      if (themeColorMeta && document.body.classList.contains('dark')) {
        themeColorMeta.content = navbarColor
        console.log('🔄 Barra de status sincronizada com navbar:', navbarColor)
      }
    } catch (error) {
      console.error('Erro ao sincronizar barra de status:', error)
    }
  }

  // Atualize a função applySavedColorToCSS para incluir a sincronização
  const applySavedColorToCSS = (hue, saturation, lightness) => {
    const root = document.documentElement
    const body = document.body

    console.log('💾 Aplicando cor SALVA no CSS:', { hue, saturation, lightness })

    // Remove qualquer preview anterior
    body.classList.remove('color-preview')

    // Aplica as variáveis CSS permanentes
    root.style.setProperty('--primary-hue', hue)
    root.style.setProperty('--primary-saturation', `${saturation}%`)
    root.style.setProperty('--primary-lightness', `${lightness}%`)

    // Calcula cores derivadas
    const primaryColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`
    const primaryLight = `hsl(${hue}, ${saturation}%, ${lightness + 15}%)`
    const primaryDark = `hsl(${hue}, ${saturation}%, ${lightness - 15}%)`

    // Aplica cores derivadas
    root.style.setProperty('--primary-color-dynamic', primaryColor)
    root.style.setProperty('--primary-color-light', primaryLight)
    root.style.setProperty('--primary-color-dark', primaryDark)
    root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${primaryColor} 0%, ${primaryLight} 100%)`)

    // Sincroniza a barra de status com a navbar
    syncStatusBarWithNavbar(hue, saturation, lightness)

    // Aplica gradiente permanente apenas se for modo escuro
    if (body.classList.contains('dark')) {
      body.style.background = `linear-gradient(135deg, 
      hsl(${hue}, ${Math.max(saturation * 0.2, 10)}%, 6%) 0%,
      hsl(${hue}, ${Math.max(saturation * 0.15, 8)}%, 10%) 50%,
      hsl(${hue}, ${Math.max(saturation * 0.1, 5)}%, 14%) 100%
    )`
    }
  }

  return {
    colorSettings,
    updateColorSettings,
    resetToDefault,
    isInitialized,
    removePreview,
    hasChanges,
    setHasChanges,
    forceColorUpdate,
    updatePWAThemeColor
  }
}