// components/Cakes/CakeMassModal.js
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect } from 'react'
import { FaSave, FaTimes, FaPlus, FaTrash, FaCalculator } from 'react-icons/fa'

export default function CakeMassModal({ isOpen, onClose, onSave, mass, products }) {
  const [formData, setFormData] = useState({
    name: '',
    totalGrams: '',
    yieldCakes: '1',
    ingredients: [{ productId: '', grams: '' }]
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (mass) {
      setFormData({
        name: mass.name || '',
        totalGrams: mass.totalGrams || '',
        yieldCakes: mass.yieldCakes || '1',
        ingredients: mass.ingredients || [{ productId: '', grams: '' }]
      })
    } else {
      setFormData({ 
        name: '', 
        totalGrams: '', 
        yieldCakes: '1',
        ingredients: [{ productId: '', grams: '' }] 
      })
    }
  }, [mass, isOpen])

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { productId: '', grams: '' }]
    })
  }

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index)
    setFormData({ ...formData, ingredients: newIngredients })
  }

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index][field] = value
    setFormData({ ...formData, ingredients: newIngredients })
  }

  // Calcular gramas por bolo
  const calculateGramsPerCake = () => {
    if (formData.totalGrams && formData.yieldCakes) {
      const total = parseFloat(formData.totalGrams)
      const yieldCakes = parseFloat(formData.yieldCakes)
      return yieldCakes > 0 ? (total / yieldCakes).toFixed(2) : '0.00'
    }
    return '0.00'
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.totalGrams || !formData.yieldCakes) {
      alert('Por favor, preencha o nome, total de gramas e rendimento')
      return
    }

    if (formData.ingredients.some(ing => !ing.productId || !ing.grams)) {
      alert('Por favor, preencha todos os ingredientes')
      return
    }

    const massData = {
      ...formData,
      totalGrams: parseFloat(formData.totalGrams),
      yieldCakes: parseInt(formData.yieldCakes),
      gramsPerCake: parseFloat(calculateGramsPerCake()),
      ingredients: formData.ingredients.map(ing => ({
        ...ing,
        grams: parseFloat(ing.grams)
      }))
    }
    
    onSave(massData)
  }

  const totalIngredientGrams = formData.ingredients.reduce((sum, ing) => sum + (parseFloat(ing.grams) || 0), 0)
  const difference = (parseFloat(formData.totalGrams) || 0) - totalIngredientGrams
  const gramsPerCake = calculateGramsPerCake()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mass ? 'Editar Massa de Bolo' : 'Nova Massa de Bolo'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
          <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
            <FaCalculator />
            Sobre Massas de Bolo
          </h4>
          <p className="text-blue-200 text-sm">
            Defina a receita da massa e quantos bolos ela rende. O sistema calculará automaticamente 
            os ingredientes necessários por bolo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Nome da Massa"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Massa de Chocolate, Massa Branca..."
            required
          />

          <Input
            label="Rendimento Total (gramas)"
            type="number"
            step="0.01"
            min="0"
            value={formData.totalGrams}
            onChange={(e) => setFormData({ ...formData, totalGrams: e.target.value })}
            placeholder="Ex: 2000.00"
            required
          />

          <Input
            label="Rendimento (número de bolos)"
            type="number"
            step="1"
            min="1"
            value={formData.yieldCakes}
            onChange={(e) => setFormData({ ...formData, yieldCakes: e.target.value })}
            placeholder="Ex: 2"
            required
          />
        </div>

        {/* Informação do rendimento */}
        {formData.totalGrams && formData.yieldCakes && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/80">Gramas por bolo:</span>
              <span className="text-green-400 font-bold text-lg">
                {gramsPerCake}g
              </span>
            </div>
            <p className="text-green-200 text-xs mt-1">
              Cada bolo usa aproximadamente {gramsPerCake}g desta massa
            </p>
          </div>
        )}

        {/* Informação do total de ingredientes */}
        {formData.totalGrams && (
          <div className={`p-4 rounded-2xl border ${
            Math.abs(difference) > 0.01 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-green-500/10 border-green-500/20'
          }`}>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-white/80">Soma dos ingredientes:</span>
              <span className={`font-semibold ${Math.abs(difference) > 0.01 ? 'text-orange-400' : 'text-green-400'}`}>
                {totalIngredientGrams.toFixed(2)}g
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/80">Diferença do total:</span>
              <span className={`font-semibold ${Math.abs(difference) > 0.01 ? 'text-orange-400' : 'text-green-400'}`}>
                {difference.toFixed(2)}g
              </span>
            </div>
            {Math.abs(difference) > 0.01 && (
              <p className="text-orange-300 text-xs mt-2">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                A soma dos ingredientes não bate com o total informado
              </p>
            )}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="block text-sm font-medium text-white/80">
                Ingredientes da Massa *
              </label>
              <p className="text-white/60 text-xs">Adicione todos os ingredientes que compõem esta massa</p>
            </div>
            <GlassButton
              type="button"
              variant="secondary"
              onClick={addIngredient}
              className="px-3 py-1 text-sm"
            >
              <FaPlus />
              Adicionar Ingrediente
            </GlassButton>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-3 items-start p-3 rounded-2xl bg-white/5">
                <div className="flex-1">
                  <label className="block text-xs text-white/60 mb-1">Produto</label>
                  <select
                    value={ingredient.productId}
                    onChange={(e) => updateIngredient(index, 'productId', e.target.value)}
                    className="glass-select w-full"
                    required
                  >
                    <option value="">Selecione um produto</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} ({product.unit}) - R$ {product.cost?.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="w-32">
                  <label className="block text-xs text-white/60 mb-1">Gramas</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={ingredient.grams}
                    onChange={(e) => updateIngredient(index, 'grams', e.target.value)}
                    className="glass-input w-full"
                    required
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="w-8 h-8 mt-5 flex items-center justify-center rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-400 transition-colors duration-200"
                  disabled={formData.ingredients.length === 1}
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
          <GlassButton type="button" variant="secondary" onClick={onClose}>
            <FaTimes />
            Cancelar
          </GlassButton>
          <GlassButton type="submit">
            <FaSave />
            {mass ? 'Atualizar Massa' : 'Criar Massa'}
          </GlassButton>
        </div>
      </form>
    </Modal>
  )
}