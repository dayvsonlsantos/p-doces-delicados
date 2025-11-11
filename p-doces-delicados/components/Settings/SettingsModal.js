import Modal from '../UI/Modal'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect } from 'react'
import { FaPalette, FaUndo, FaSave, FaMobile, FaCheck, FaExclamationTriangle } from 'react-icons/fa'
import { useColorSettings } from '../../hooks/useColorSettings'
import { useTheme } from '../../contexts/ThemeContext'

export default function SettingsModal({ isOpen, onClose, user }) {
  const {
    colorSettings,
    updateColorSettings,
    resetToDefault,
    isInitialized,
    removePreview,
    hasChanges, // Agora vem do hook
    setHasChanges // Agora vem do hook
  } = useColorSettings()
  const { theme } = useTheme()

  // Estados locais separados para cada controle
  const [hue, setHue] = useState(210)
  const [saturation, setSaturation] = useState(80)
  const [lightness, setLightness] = useState(60)

  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // Inicializar com valores atuais quando o modal abrir
  useEffect(() => {
    if (isOpen && isInitialized) {
      console.log('🚀 Inicializando modal com cores:', colorSettings)
      setHue(colorSettings.hue)
      setSaturation(colorSettings.saturation)
      setLightness(colorSettings.lightness)
      setIsResetting(false)
      setHasChanges(false) // Reseta mudanças ao abrir
    }
  }, [isOpen, isInitialized, colorSettings, setHasChanges])

  // Verificar mudanças sempre que os valores locais mudarem
  useEffect(() => {
    if (isOpen && isInitialized) {
      const isDifferent =
        hue !== colorSettings.hue ||
        saturation !== colorSettings.saturation ||
        lightness !== colorSettings.lightness

      console.log('🔍 Verificando mudanças:', {
        local: { hue, saturation, lightness },
        saved: colorSettings,
        hasChanges: isDifferent
      })

      setHasChanges(isDifferent)
    }
  }, [hue, saturation, lightness, isOpen, isInitialized, colorSettings, setHasChanges])

  // Aplicar mudanças em tempo real no modo escuro
  useEffect(() => {
    if (isOpen && theme === 'dark' && isInitialized) {
      console.log('🎨 Aplicando preview em tempo real')
      applyPreview()
    }
  }, [hue, saturation, lightness, isOpen, theme, isInitialized])

  const applyPreview = () => {
    if (theme === 'dark') {
      console.log('🔄 Aplicando preview com:', { hue, saturation, lightness })
      updateColorSettings({ hue, saturation, lightness }, true) // true = preview mode
    }
  }

  const handleHueChange = (newHue) => {
    console.log('🎨 Mudando hue para:', newHue)
    setHue(newHue)
    setIsResetting(false)
  }

  const handleSaturationChange = (newSaturation) => {
    console.log('🎨 Mudando saturação para:', newSaturation)
    setSaturation(newSaturation)
    setIsResetting(false)
  }

  const handleLightnessChange = (newLightness) => {
    console.log('🎨 Mudando lightness para:', newLightness)
    setLightness(newLightness)
    setIsResetting(false)
  }

  const handlePresetClick = (presetHue) => {
    console.log('⚡ Aplicando preset:', presetHue)
    setHue(presetHue)
    setSaturation(80)
    setLightness(60)
    setIsResetting(false)
  }

  const handleReset = () => {
    console.log('🔄 Resetando para padrão')
    const defaultSettings = resetToDefault()
    setHue(defaultSettings.hue)
    setSaturation(defaultSettings.saturation)
    setLightness(defaultSettings.lightness)
    setIsResetting(true)
    setHasChanges(true) // FORÇA que haja mudanças
  }

  const handleSave = async () => {
    if (isSaving) return

    console.log('💾 Salvando configurações...', { hue, saturation, lightness })
    setIsSaving(true)

    try {
      const settingsToSave = {
        hue,
        saturation,
        lightness,
        primaryColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
        updatedAt: new Date()
      }

      console.log('📤 Salvando configurações:', settingsToSave)

      // Simular API call - em produção, substitua pela sua API real
      await new Promise(resolve => setTimeout(resolve, 500))

      // Atualiza o hook com as configurações finais
      updateColorSettings(settingsToSave, false) // false = save mode

      setIsResetting(false)
      alert('✅ Configurações salvas com sucesso!')
      onClose()

    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error)
      alert('❌ Erro ao salvar configurações: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    // Remove o preview se houver mudanças não salvas
    if (hasChanges || isResetting) {
      removePreview()
    }

    // Se há mudanças não salvas, perguntar ao usuário
    if (hasChanges || isResetting) {
      const confirmClose = window.confirm(
        'Você tem alterações não salvas. Deseja realmente fechar?'
      )
      if (!confirmClose) return
    }
    onClose()
  }

  const colorPresets = [
    { hue: 0, name: 'Vermelho', color: 'hsl(0, 80%, 60%)' },
    { hue: 30, name: 'Laranja', color: 'hsl(30, 80%, 60%)' },
    { hue: 60, name: 'Amarelo', color: 'hsl(60, 80%, 60%)' },
    { hue: 120, name: 'Verde', color: 'hsl(120, 80%, 60%)' },
    { hue: 180, name: 'Ciano', color: 'hsl(180, 80%, 60%)' },
    { hue: 210, name: 'Azul', color: 'hsl(210, 80%, 60%)' },
    { hue: 270, name: 'Roxo', color: 'hsl(270, 80%, 60%)' },
    { hue: 300, name: 'Rosa', color: 'hsl(300, 80%, 60%)' },
    { hue: 330, name: 'Magenta', color: 'hsl(330, 80%, 60%)' },
  ]

  const getCurrentColorName = () => {
    const preset = colorPresets.find(p => Math.abs(p.hue - hue) <= 15)
    return preset ? preset.name : 'Personalizado'
  }

  const currentColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`

  if (!isInitialized) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Configurações" size="md">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto mb-4">
            <FaPalette className="animate-spin" />
          </div>
          <p className="text-secondary">Carregando configurações...</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Configurações" size="md">
      <div className="p-6 space-y-6">
        {/* Aviso sobre modo claro */}
        {theme === 'light' && (
          <div className="p-4 rounded-2xl bg-yellow-500/20 border border-yellow-500/30">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-yellow-500 font-semibold text-sm">Modo Claro Ativo</p>
                <p className="text-yellow-400 text-xs">
                  As cores personalizadas funcionam apenas no modo escuro. Mude para o modo escuro para ver as alterações.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Seção de Cor Principal */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white dynamic-gradient"
                style={theme === 'dark' ? {
                  background: `linear-gradient(135deg, ${currentColor} 0%, hsl(${hue}, ${saturation}%, ${lightness + 15}%) 100%)`
                } : {}}
              >
                <FaPalette size={18} />
              </div>
              <div>
                <h3 className="font-bold text-primary text-lg">Cor Principal</h3>
                <p className="text-secondary text-sm">
                  {theme === 'dark' ? 'Personalize a cor principal' : 'Disponível apenas no modo escuro'}
                </p>
              </div>
            </div>
            {(hasChanges || isResetting) && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-sm">
                <FaCheck size={12} />
                <span>Não salvo</span>
              </div>
            )}
          </div>

          {/* Visualização da Cor */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl border-2 border-white/20 shadow-lg"
                style={{ backgroundColor: currentColor }}
              />
              <div>
                <p className="text-primary font-semibold">{getCurrentColorName()}</p>
                <p className="text-secondary text-sm font-mono">
                  hsl({hue}, {saturation}%, {lightness}%)
                </p>
                <p className="text-secondary text-xs">
                  Saturação: {saturation}% • Brilho: {lightness}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-secondary text-sm">HEX</p>
              <p className="text-primary font-mono text-sm">
                {hslToHex(hue, saturation, lightness)}
              </p>
            </div>
          </div>

          {/* Cores Rápidas */}
          <div className="space-y-2">
            <label className="text-primary text-sm font-medium">Cores Rápidas</label>
            <div className="grid grid-cols-3 gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.hue}
                  onClick={() => handlePresetClick(preset.hue)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={theme === 'light'}
                >
                  <div
                    className="w-6 h-6 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span className="text-primary text-xs">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className={`space-y-4 ${theme === 'light' ? 'opacity-50' : ''}`}>
            {/* Slider de Tom (Hue) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-primary font-medium">Tom da Cor</label>
                <span className="text-secondary text-sm">{hue}°</span>
              </div>

              <div className="relative">
                <div className="h-4 rounded-full mb-2 overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                    }}
                  />
                </div>

                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hue}
                  onChange={(e) => handleHueChange(parseInt(e.target.value))}
                  className="absolute top-0 left-0 w-full h-4 opacity-0 cursor-pointer"
                  disabled={theme === 'light'}
                />

                <div className="flex justify-between text-xs text-secondary px-1">
                  <span>Vermelho</span>
                  <span>Verde</span>
                  <span>Azul</span>
                </div>
              </div>
            </div>

            {/* Sliders de Saturação e Brilho */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-primary text-sm">Saturação</label>
                  <span className="text-secondary text-sm">{saturation}%</span>
                </div>
                <div className="relative">
                  <div
                    className="h-2 rounded-full bg-gray-600"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(${hue}, 0%, ${lightness}%), 
                        hsl(${hue}, 100%, ${lightness}%)
                      )`
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={saturation}
                    onChange={(e) => handleSaturationChange(parseInt(e.target.value))}
                    className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
                    disabled={theme === 'light'}
                  />
                </div>
                <div className="flex justify-between text-xs text-secondary px-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-primary text-sm">Brilho</label>
                  <span className="text-secondary text-sm">{lightness}%</span>
                </div>
                <div className="relative">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(${hue}, ${saturation}%, 0%), 
                        hsl(${hue}, ${saturation}%, 50%), 
                        hsl(${hue}, ${saturation}%, 100%)
                      )`
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={lightness}
                    onChange={(e) => handleLightnessChange(parseInt(e.target.value))}
                    className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
                    disabled={theme === 'light'}
                  />
                </div>
                <div className="flex justify-between text-xs text-secondary px-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            <GlassButton
              variant="secondary"
              onClick={handleReset}
              className="flex-1"
              disabled={theme === 'light'}
            >
              <FaUndo />
              Resetar
            </GlassButton>
            <GlassButton
              onClick={handleSave}
              disabled={ isSaving || theme === 'light'}
              className="flex-1 dynamic-gradient"
              style={theme === 'dark' && (hasChanges || isResetting) ? {
                background: `linear-gradient(135deg, ${currentColor} 0%, hsl(${hue}, ${saturation}%, ${lightness + 10}%) 100%)`
              } : {}}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FaSave />
              )}
              {isSaving ? 'Salvando...' : 'Salvar'}
            </GlassButton>
          </div>
        </div>

        {/* Seção de PWA */}
        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white">
              <FaMobile size={18} />
            </div>
            <div>
              <h3 className="font-bold text-primary text-lg">Aplicativo PWA</h3>
              <p className="text-secondary text-sm">Instale o app no seu dispositivo</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-secondary text-sm">
              Para uma melhor experiência em celular, instale o aplicativo:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <FaMobile className="text-blue-400" />
                  <span className="text-primary font-medium">Android</span>
                </div>
                <p className="text-secondary text-xs">
                  Toque no menu ⋮ e selecione "Instalar app"
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <FaMobile className="text-blue-400" />
                  <span className="text-primary font-medium">iPhone</span>
                </div>
                <p className="text-secondary text-xs">
                  Toque no ícone ⎗ e selecione "Adicionar à Tela de Início"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// Função auxiliar para converter HSL para HEX
function hslToHex(h, s, l) {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = x => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}