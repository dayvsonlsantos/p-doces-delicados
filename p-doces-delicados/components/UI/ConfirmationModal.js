import Modal from './Modal'
import GlassButton from './GlassButton'
import { FaExclamationTriangle, FaCheck, FaInfoCircle, FaTimes } from 'react-icons/fa'

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning', // 'warning', 'info', 'success'
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  showCancel = true
}) {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" size={24} />
      case 'info':
        return <FaInfoCircle className="text-blue-500" size={24} />
      case 'success':
        return <FaCheck className="text-green-500" size={24} />
      default:
        return <FaInfoCircle className="text-blue-500" size={24} />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20'
      case 'success':
        return 'bg-green-500/10 border-green-500/20'
      default:
        return 'bg-blue-500/10 border-blue-500/20'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-white/70 mt-1">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          {showCancel && (
            <GlassButton
              variant="secondary"
              onClick={onClose}
              className="px-4 py-2"
            >
              <FaTimes />
              {cancelText}
            </GlassButton>
          )}
          <GlassButton
            onClick={onConfirm}
            className={`px-4 py-2 ${
              type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' :
              type === 'success' ? 'bg-green-500 hover:bg-green-600' :
              'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <FaCheck />
            {confirmText}
          </GlassButton>
        </div>
      </div>
    </Modal>
  )
}