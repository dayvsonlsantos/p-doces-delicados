// components/Cakes/CakeMassModal.js (atualizado)
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect } from 'react'
import { FaSave, FaTimes, FaPlus, FaTrash, FaCalculator } from 'react-icons/fa'

export default function CakeMassModal({ isOpen, onClose, onSave, mass, products = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    totalGrams: '',
    yieldCakes: '1',
    ingredients: [{ productId: '', grams: '' }]
  })

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
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Header fixo */}
        <div className="flex-shrink-0 p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white text-center">
            {mass ? 'Editar Massa de Bolo' : 'Nova Massa de Bolo'}
          </h2>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
            <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
              <FaCalculator className="w-4 h-4" />
              Sobre Massas de Bolo
            </h4>
            <p className="text-blue-200 text-sm">
              Defina a receita da massa e quantos bolos ela rende. O sistema calculará automaticamente
              os ingredientes necessários por bolo.
            </p>
          </div>

          {/* Informações básicas */}
          <div className="space-y-4">
            <Input
              label="Nome da Massa"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Massa de Chocolate"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Rendimento Total (g)"
                type="number"
                step="0.01"
                min="0"
                value={formData.totalGrams}
                onChange={(e) => setFormData({ ...formData, totalGrams: e.target.value })}
                placeholder="2000.00"
                required
              />

              <Input
                label="Rendimento (bolos)"
                type="number"
                step="1"
                min="1"
                value={formData.yieldCakes}
                onChange={(e) => setFormData({ ...formData, yieldCakes: e.target.value })}
                placeholder="2"
                required
              />
            </div>
          </div>

          {/* Informação do rendimento */}
          {formData.totalGrams && formData.yieldCakes && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">Gramas por bolo:</span>
                <span className="text-green-400 font-bold text-lg">
                  {gramsPerCake}g
                </span>
              </div>
            </div>
          )}

          {/* Informação do total de ingredientes */}
          {formData.totalGrams && (
            <div className={`p-4 rounded-2xl border ${Math.abs(difference) > 0.01 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
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
                  A soma dos ingredientes não bate com o total informado
                </p>
              )}
            </div>
          )}

          {/* Seção de Ingredientes - LAYOUT MOBILE FIRST */}
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">Ingredientes</h3>
                <p className="text-white/60 text-sm">Adicione os ingredientes da massa</p>
              </div>
              <button
                type="button"
                onClick={addIngredient}
                className="w-10 h-10 rounded-xl bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 flex items-center justify-center transition-colors"
              >
                <FaPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-3 border border-white/10">
                  {/* Header do ingrediente */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium text-sm">
                      Ingrediente {index + 1}
                    </span>
                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 flex items-center justify-center transition-colors"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Campos do ingrediente */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/60 text-xs mb-2">Produto</label>
                      <select
                        value={ingredient.productId}
                        onChange={(e) => updateIngredient(index, 'productId', e.target.value)}
                        className="w-full glass-input h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        required
                        style={{ 
                          WebkitAppearance: 'none',
                          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 1rem center',
                          backgroundSize: '1em'
                        }}
                      >
                        <option value="">Selecione um produto</option>
                        {products && products.map && products.map(product => (
                          <option key={product?._id || index} value={product?._id}>
                            {product?.name} ({product?.unit}) - R$ {product?.cost?.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-white/60 text-xs mb-2">Quantidade (gramas)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={ingredient.grams}
                        onChange={(e) => updateIngredient(index, 'grams', e.target.value)}
                        className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer fixo */}
        <div className="flex-shrink-0 p-4 border-t border-white/10 bg-white/5">
          <div className="flex gap-3">
            <GlassButton
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 h-12"
            >
              <FaTimes className="w-4 h-4" />
              <span>Cancelar</span>
            </GlassButton>
            <GlassButton
              type="submit"
              className="flex-1 h-12"
            >
              <FaSave className="w-4 h-4" />
              <span>{mass ? 'Atualizar' : 'Criar'}</span>
            </GlassButton>
          </div>
        </div>
      </form>
    </Modal>
  )
}