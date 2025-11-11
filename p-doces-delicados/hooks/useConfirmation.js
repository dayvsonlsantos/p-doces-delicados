import { useState, useCallback } from 'react'

export function useConfirmation() {
  const [confirmationState, setConfirmationState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: null,
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    showCancel: true
  })

  const showConfirmation = useCallback(({
    title,
    message,
    type = 'warning',
    onConfirm,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    showCancel = true
  }) => {
    setConfirmationState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText,
      showCancel
    })
  }, [])

  const hideConfirmation = useCallback(() => {
    setConfirmationState(prev => ({ ...prev, isOpen: false }))
  }, [])

  const handleConfirm = useCallback(() => {
    if (confirmationState.onConfirm) {
      confirmationState.onConfirm()
    }
    hideConfirmation()
  }, [confirmationState, hideConfirmation])

  return {
    confirmationState: {
      ...confirmationState,
      onConfirm: handleConfirm,
      onClose: hideConfirmation
    },
    showConfirmation,
    hideConfirmation
  }
}