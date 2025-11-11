// components/Products/ProductModal.js
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect } from 'react'
import { FaSave, FaTimes, FaCalculator, FaExchangeAlt } from 'react-icons/fa'

export default function ProductModal({ isOpen, onClose, onSave, product }) {
  const [formData, setFormData] = useState({
    name: '',
    unit: 'g',
    quantity: '',
    cost: '',
    unitCost: '0.00',
    baseUnitCost: '0.00' // Sempre em g ou ml
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        unit: product.unit || 'g',
        quantity: product.quantity || '',
        cost: product.cost || '',
        unitCost: product.unitCost || '0.00',
        baseUnitCost: product.baseUnitCost || '0.00'
      })
    } else {
      setFormData({ 
        name: '', 
        unit: 'g', 
        quantity: '',
        cost: '',
        unitCost: '0.00',
        baseUnitCost: '0.00'
      })
    }
  }, [product, isOpen])

  // Calcula o custo unitário automaticamente
  useEffect(() => {
    if (formData.quantity && formData.cost) {
      const quantity = parseFloat(formData.quantity)
      const cost = parseFloat(formData.cost)
      
      if (quantity > 0 && cost > 0) {
        // Calcula o custo na unidade original
        const unitCost = cost / quantity
        let baseUnitCost = unitCost

        // Converte para a unidade base (g ou ml)
        switch (formData.unit) {
          case 'kg':
            baseUnitCost = unitCost / 1000 // R$ por kg -> R$ por g
            break
          case 'l':
            baseUnitCost = unitCost / 1000 // R$ por litro -> R$ por ml
            break
          case 'un':
            // Para unidades, mantemos o custo por unidade
            // Mas precisaremos tratar isso separadamente nas receitas
            baseUnitCost = unitCost
            break
          // g e ml já estão na unidade base
          default:
            baseUnitCost = unitCost
        }

        setFormData(prev => ({
          ...prev,
          unitCost: unitCost.toFixed(4),
          baseUnitCost: baseUnitCost.toFixed(6) // Mais precisão para valores pequenos
        }))
      }
    }
  }, [formData.quantity, formData.cost, formData.unit])

  const getQuantityLabel = () => {
    switch (formData.unit) {
      case 'g': return 'Peso (gramas)'
      case 'kg': return 'Peso (kg)'
      case 'ml': return 'Volume (ml)'
      case 'l': return 'Volume (litros)'
      case 'un': return 'Quantidade (unidades)'
      default: return 'Quantidade'
    }
  }

  const getQuantityPlaceholder = () => {
    switch (formData.unit) {
      case 'g': return 'Ex: 1000'
      case 'kg': return 'Ex: 1'
      case 'ml': return 'Ex: 500'
      case 'l': return 'Ex: 1'
      case 'un': return 'Ex: 100'
      default: return 'Quantidade'
    }
  }

  const getConversionInfo = () => {
    if (!formData.quantity || !formData.cost) return null

    switch (formData.unit) {
      case 'kg':
        return `1kg = 1000g | Custo: R$ ${(parseFloat(formData.baseUnitCost) * 1000).toFixed(4)}/kg`
      case 'l':
        return `1L = 1000ml | Custo: R$ ${(parseFloat(formData.baseUnitCost) * 1000).toFixed(4)}/L`
      case 'g':
        return `1000g = 1kg | Custo: R$ ${(parseFloat(formData.unitCost) * 1000).toFixed(4)}/kg`
      case 'ml':
        return `1000ml = 1L | Custo: R$ ${(parseFloat(formData.unitCost) * 1000).toFixed(4)}/L`
      case 'un':
        return `Custo por unidade: R$ ${formData.unitCost}`
      default:
        return null
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.quantity || !formData.cost) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    const productData = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      cost: parseFloat(formData.cost),
      unitCost: parseFloat(formData.unitCost),
      baseUnitCost: parseFloat(formData.baseUnitCost)
    }
    
    onSave(productData)
  }

  if (!isOpen) return null

  const conversionInfo = getConversionInfo()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Editar Produto' : 'Novo Produto'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <Input
          label="Nome do Produto"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Leite Condensado"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Unidade de Medida *
            </label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value, quantity: '' })}
              className="glass-input w-full"
              required
            >
              <option value="g">Gramas (g)</option>
              <option value="kg">Quilogramas (kg)</option>
              <option value="ml">Mililitros (ml)</option>
              <option value="l">Litros (l)</option>
              <option value="un">Unidade</option>
            </select>
          </div>

          <Input
            label={getQuantityLabel()}
            type="number"
            step="0.001"
            min="0.001"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder={getQuantityPlaceholder()}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Custo Total (R$)"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            placeholder="0.00"
            required
          />

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Custo Unitário
            </label>
            <div className="glass-input w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-green-400 font-semibold">
              <div className="flex items-center justify-between">
                <span>R$ {formData.unitCost}</span>
                <FaCalculator className="text-green-400" />
              </div>
              <div className="text-xs text-secondary mt-1">
                por {formData.unit === 'un' ? 'unidade' : formData.unit}
              </div>
            </div>
          </div>
        </div>

        {/* Informação de conversão */}
        {conversionInfo && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
            <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
              <FaExchangeAlt />
              Conversão Automática
            </h4>
            <p className="text-blue-200 text-sm">
              {conversionInfo}
            </p>
            {formData.unit !== 'un' && (
              <p className="text-blue-200 text-sm mt-1">
                <strong>Custo base:</strong> R$ {formData.baseUnitCost} por {formData.unit === 'kg' || formData.unit === 'g' ? 'grama' : 'ml'}
              </p>
            )}
          </div>
        )}

        {/* Informação de exemplo */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
          <h4 className="text-green-300 font-semibold mb-2 flex items-center gap-2">
            <FaCalculator />
            Como funciona?
          </h4>
          <p className="text-green-200 text-sm">
            <strong>Exemplos:</strong><br/>
            • 1kg por R$ 10,00 = R$ 0,010000 por grama<br/>
            • 1L por R$ 8,00 = R$ 0,008000 por ml<br/>
            • 100un por R$ 15,00 = R$ 0,1500 por unidade
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
          <GlassButton type="button" variant="secondary" onClick={onClose}>
            <FaTimes />
            Cancelar
          </GlassButton>
          <GlassButton type="submit">
            <FaSave />
            {product ? 'Atualizar' : 'Salvar'}
          </GlassButton>
        </div>
      </form>
    </Modal>
  )
}