import { useState, useEffect } from 'react'

export function useColorSettings() {
  const [colorSettings, setColorSettings] = useState({
    hue: 210,
    saturation: 80,
    lightness: 60,
    primaryColor: 'hsl(210, 80%, 60%)'
  })

  const [isInitialized, setIsInitialized] = useState(false)
  const [hasChanges, setHasChanges] = useState(false) // Adicione este estado

  // Carregar configurações do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('colorSettings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        console.log('📁 Carregando cores salvas:', settings)
        setColorSettings(settings)
        applySavedColorToCSS(settings.hue, settings.saturation, settings.lightness)
      } catch (error) {
        console.error('Erro ao carregar cores:', error)
        applySavedColorToCSS(210, 80, 60)
      }
    } else {
      console.log('🎨 Usando cores padrão')
      applySavedColorToCSS(210, 80, 60)
    }
    setIsInitialized(true)
  }, [])

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
        hsl(${hue}, ${Math.max(saturation * 0.6, 40)}%, 15%) 0%,
        hsl(${hue + 30}, ${Math.max(saturation * 0.5, 35)}%, 20%) 50%,
        hsl(${hue + 60}, ${Math.max(saturation * 0.4, 30)}%, 25%) 100%
      )`
    }
  }

  // Remover preview e voltar às cores salvas
  const removePreview = () => {
    const body = document.body
    body.classList.remove('color-preview')

    // Reaplica as cores salvas
    applySavedColorToCSS(colorSettings.hue, colorSettings.saturation, colorSettings.lightness)
    setHasChanges(false) // Reseta as mudanças ao remover preview
  }

  const updateColorSettings = (newSettings, isPreview = false) => {
    console.log('🔄 Atualizando configurações:', { newSettings, isPreview })

    if (isPreview) {
      // Modo preview - aplica temporariamente
      const { hue, saturation, lightness } = { ...colorSettings, ...newSettings }
      applyPreviewColor(hue, saturation, lightness)
      return { ...colorSettings, ...newSettings }
    } else {
      // Modo save - aplica permanentemente
      const updatedSettings = { ...colorSettings, ...newSettings }

      console.log('💾 SALVANDO configurações:', updatedSettings)

      // Recalcula a cor primária se HSL mudou
      if (newSettings.hue !== undefined || newSettings.saturation !== undefined || newSettings.lightness !== undefined) {
        const hue = newSettings.hue !== undefined ? newSettings.hue : colorSettings.hue
        const saturation = newSettings.saturation !== undefined ? newSettings.saturation : colorSettings.saturation
        const lightness = newSettings.lightness !== undefined ? newSettings.lightness : colorSettings.lightness

        updatedSettings.primaryColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`
        applySavedColorToCSS(hue, saturation, lightness)
      }

      setColorSettings(updatedSettings)
      localStorage.setItem('colorSettings', JSON.stringify(updatedSettings))
      setHasChanges(false) // Reseta mudanças após salvar

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
    // Apenas atualiza o estado local, não salva ainda
    setColorSettings(defaultSettings)
    applyPreviewColor(210, 80, 60) // Aplica preview do reset
    setHasChanges(true) // GARANTE que há mudanças não salvas
    return defaultSettings
  }

  const forceColorUpdate = () => {
    const saved = localStorage.getItem('colorSettings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        console.log('🔄 Forçando atualização de cores:', settings)
        applySavedColorToCSS(settings.hue, settings.saturation, settings.lightness)
      } catch (error) {
        console.error('Erro ao forçar atualização de cores:', error)
      }
    }
  }

  // Adicione esta função ao hook useColorSettings
  const updatePWAThemeColor = (hue, saturation, lightness) => {
    try {
      const themeColorMeta = document.getElementById('theme-color-meta');
      if (themeColorMeta) {
        // Calcula uma cor escura para o theme-color (barra de status)
        const darkColor = `hsl(${hue}, ${Math.max(saturation * 0.4, 20)}%, 8%)`;
        themeColorMeta.setAttribute('content', darkColor);
        console.log('🎨 PWA theme-color atualizado:', darkColor);
      }
    } catch (error) {
      console.error('Erro ao atualizar PWA theme-color:', error);
    }
  }

  // Modifique a função applySavedColorToCSS para incluir a atualização do PWA
  const applySavedColorToCSS = (hue, saturation, lightness) => {
    const root = document.documentElement;
    const body = document.body;

    console.log('💾 Aplicando cor SALVA no CSS:', { hue, saturation, lightness });

    // Remove qualquer preview anterior
    body.classList.remove('color-preview');

    // Aplica as variáveis CSS permanentes
    root.style.setProperty('--primary-hue', hue);
    root.style.setProperty('--primary-saturation', `${saturation}%`);
    root.style.setProperty('--primary-lightness', `${lightness}%`);

    // Calcula cores derivadas
    const primaryColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    const primaryLight = `hsl(${hue}, ${saturation}%, ${lightness + 15}%)`;
    const primaryDark = `hsl(${hue}, ${saturation}%, ${lightness - 15}%)`;

    // Aplica cores derivadas
    root.style.setProperty('--primary-color-dynamic', primaryColor);
    root.style.setProperty('--primary-color-light', primaryLight);
    root.style.setProperty('--primary-color-dark', primaryDark);
    root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${primaryColor} 0%, ${primaryLight} 100%)`);

    // Atualiza a cor do PWA
    updatePWAThemeColor(hue, saturation, lightness);

    // Aplica gradiente permanente apenas se for modo escuro
    if (body.classList.contains('dark')) {
      body.style.background = `linear-gradient(135deg, 
      hsl(${hue}, ${Math.max(saturation * 0.4, 20)}%, 8%) 0%,
      hsl(${hue}, ${Math.max(saturation * 0.3, 15)}%, 12%) 50%,
      hsl(${hue}, ${Math.max(saturation * 0.2, 10)}%, 16%) 100%
    )`;
    }
  }

  return {
    colorSettings,
    updateColorSettings,
    resetToDefault,
    isInitialized,
    removePreview,
    hasChanges, // Exporta o estado
    setHasChanges, // Exporta a função para modificar o estado
    forceColorUpdate,
    updatePWAThemeColor
  }
}