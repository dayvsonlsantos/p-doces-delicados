// components/Supplies/SupplyModal.js
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect } from 'react'
import { FaSave, FaTimes, FaTag } from 'react-icons/fa'

export default function SupplyModal({ isOpen, onClose, onSave, supply }) {
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    description: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (supply) {
      // CORREÇÃO: Converter a data do MongoDB para o fuso horário local
      let purchaseDate = new Date().toISOString().split('T')[0]
      if (supply.purchaseDate) {
        const date = new Date(supply.purchaseDate)
        // Ajusta para o fuso horário local
        purchaseDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000).toISOString().split('T')[0]
      }

      setFormData({
        name: supply.name || '',
        cost: supply.cost || '',
        description: supply.description || '',
        purchaseDate: purchaseDate
      })
    } else {
      setFormData({
        name: '',
        cost: '',
        description: '',
        purchaseDate: new Date().toISOString().split('T')[0]
      })
    }
  }, [supply, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.name || !formData.cost || !formData.purchaseDate) {
      alert('Por favor, preencha o nome, custo e data da compra')
      return
    }

    // CORREÇÃO: Criar a data no fuso horário UTC para evitar problemas
    const purchaseDate = new Date(formData.purchaseDate + 'T12:00:00Z') // Meio-dia UTC

    const supplyData = {
      ...formData,
      cost: parseFloat(formData.cost),
      purchaseDate: purchaseDate,
      lastPurchaseCost: parseFloat(formData.cost)
    }

    onSave(supplyData)
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supply ? 'Editar Insumo' : 'Novo Insumo'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <Input
          label="Nome do Insumo"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Papel de Docinho, Caixinha, Lacinho..."
          required
        />

        <Input
          label="Custo por Unidade (R$)"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.cost}
          onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
          placeholder="0.00"
          required
        />

        <Input
          label="Data da Compra"
          type="date"
          value={formData.purchaseDate}
          onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Descrição (opcional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detalhes sobre o insumo, marca, etc."
            rows="3"
            className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
          />
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
          <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
            <FaTag />
            Sobre Insumos
          </h4>
          <p className="text-blue-200 text-sm">
            Insumos são itens usados 1 por docinho, como papéis, embalagens, lacinhos, etc.
            O custo é calculado automaticamente por unidade de docinho.
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
          <GlassButton type="button" variant="secondary" onClick={onClose}>
            <FaTimes />
            Cancelar
          </GlassButton>
          <GlassButton type="submit">
            <FaSave />
            {supply ? 'Atualizar' : 'Salvar'}
          </GlassButton>
        </div>
      </form>
    </Modal>
  )
}