import { useState, useEffect } from 'react';
import GlassButton from '../UI/GlassButton';
import Modal from '../UI/Modal';
import { FaDownload, FaMobile, FaTimes } from 'react-icons/fa';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se o app já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isStandalone);

    // Evento para capturar o prompt de instalação
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Mostrar o prompt personalizado após 3 segundos
      setTimeout(() => {
        if (!isStandalone && !localStorage.getItem('installPromptDismissed')) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    // Evento para detectar quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <Modal isOpen={showPrompt} onClose={handleDismiss} title="Instalar App" size="sm">
      <div className="p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white mx-auto mb-4">
          <FaMobile size={24} />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">
          Instalar Doces Delicados
        </h3>
        
        <p className="text-white/70 mb-6">
          Instale nosso app para uma experiência mais rápida e acesso offline!
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              <span className="text-sm">⚡</span>
            </div>
            <span className="text-white text-sm">Carregamento mais rápido</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <span className="text-sm">📱</span>
            </div>
            <span className="text-white text-sm">Acesso direto pela tela inicial</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <span className="text-sm">🔗</span>
            </div>
            <span className="text-white text-sm">Funciona parcialmente offline</span>
          </div>
        </div>

        <div className="flex gap-3">
          <GlassButton
            variant="secondary"
            onClick={handleDismiss}
            className="flex-1"
          >
            <FaTimes />
            Agora não
          </GlassButton>
          <GlassButton
            onClick={handleInstall}
            className="flex-1"
          >
            <FaDownload />
            Instalar
          </GlassButton>
        </div>

        <p className="text-white/50 text-xs mt-4">
          Não se preocupe, você pode instalar depois pelas configurações
        </p>
      </div>
    </Modal>
  );
}