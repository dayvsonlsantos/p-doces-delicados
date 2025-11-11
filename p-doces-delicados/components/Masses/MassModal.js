// components/Masses/MassModal.js
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect } from 'react'
import { calculateIngredientCost } from '../../lib/calculations'

export default function MassModal({ isOpen, onClose, onSave, mass, products }) {
  const [formData, setFormData] = useState({
    name: '',
    totalGrams: '',
    ingredients: [{ productId: '', grams: '' }]
  })

  useEffect(() => {
    if (mass) {
      setFormData({
        name: mass.name || '',
        totalGrams: mass.totalGrams || '',
        ingredients: mass.ingredients || [{ productId: '', grams: '' }]
      })
    } else {
      setFormData({
        name: '',
        totalGrams: '',
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

  // components/Masses/MassModal.js - modificar a handleSubmit
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validações básicas
    if (!formData.name || !formData.totalGrams) {
      alert('Por favor, preencha o nome e o rendimento final da massa')
      return
    }

    if (formData.ingredients.some(ing => !ing.productId || !ing.grams)) {
      alert('Por favor, preencha todos os ingredientes')
      return
    }

    const totalIngredients = formData.ingredients.reduce((sum, ing) => sum + (parseFloat(ing.grams) || 0), 0)
    const totalFinal = parseFloat(formData.totalGrams)

    // Validação mais flexível para perdas/gains
    if (totalFinal > totalIngredients * 1.5) {
      if (!confirm(`O rendimento final (${totalFinal}g) é 50% maior que a soma dos ingredientes (${totalIngredients}g). Isso está correto?`)) {
        return
      }
    }

    if (totalFinal < totalIngredients * 0.5) {
      if (!confirm(`O rendimento final (${totalFinal}g) é 50% menor que a soma dos ingredientes (${totalIngredients}g). Há uma perda muito grande. Isso está correto?`)) {
        return
      }
    }

    const massData = {
      ...formData,
      totalGrams: parseFloat(formData.totalGrams),
      ingredients: formData.ingredients.map(ing => ({
        ...ing,
        grams: parseFloat(ing.grams)
      })),
      // Adicionar informações de cálculo para referência
      calculatedData: {
        totalIngredients: totalIngredients,
        difference: totalFinal - totalIngredients,
        percentageDifference: totalIngredients > 0 ? ((totalFinal - totalIngredients) / totalIngredients * 100) : 0
      }
    }

    onSave(massData)
  }

  const totalIngredientGrams = formData.ingredients.reduce((sum, ing) => sum + (parseFloat(ing.grams) || 0), 0)
  const totalGrams = parseFloat(formData.totalGrams) || 0
  const difference = totalGrams - totalIngredientGrams
  const percentageLoss = totalIngredientGrams > 0 ? ((difference / totalIngredientGrams) * 100) : 0

  const calculateMassCost = (ingredients, products) => {
    let totalCost = 0

    ingredients.forEach(ingredient => {
      const product = products.find(p => p._id === ingredient.productId)
      if (product && ingredient.grams) {
        const ingredientGrams = parseFloat(ingredient.grams)
        const cost = calculateIngredientCost(ingredientGrams, product)
        totalCost += cost
      }
    })

    return totalCost
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mass ? 'Editar Massa' : 'Criar Nova Massa'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
          <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
            <i className="fas fa-info-circle"></i>
            Sobre as Massas
          </h4>
          <p className="text-blue-200 text-sm">
            Uma massa é a base dos seus docinhos. Defina a receita com os ingredientes e o rendimento total.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            placeholder="Ex: 345.00"
            required
          />
        </div>

        {/* Informação do total */}
        {formData.totalGrams && (
          <div className={`p-4 rounded-2xl border ${Math.abs(percentageLoss) > 5 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-green-500/10 border-green-500/20'
            }`}>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-white/80">Soma dos ingredientes:</span>
              <span className="text-white font-semibold">
                {totalIngredientGrams.toFixed(2)}g
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-white/80">Rendimento final:</span>
              <span className="text-white font-semibold">
                {totalGrams.toFixed(2)}g
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/80">Diferença (perda/ganho):</span>
              <span className={`font-semibold ${difference > 0 ? 'text-green-400' : difference < 0 ? 'text-orange-400' : 'text-white'
                }`}>
                {difference > 0 ? '+' : ''}{difference.toFixed(2)}g
                {totalIngredientGrams > 0 && ` (${percentageLoss > 0 ? '+' : ''}${percentageLoss.toFixed(1)}%)`}
              </span>
            </div>

            {difference < 0 && (
              <div className="mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-2">
                  <i className="fas fa-info-circle text-blue-400 mt-0.5"></i>
                  <div>
                    <p className="text-blue-300 text-sm font-medium mb-1">Perda no cozimento - Normal!</p>
                    <p className="text-blue-200 text-xs">
                      É comum perder {Math.abs(percentageLoss).toFixed(1)}% de peso durante o cozimento
                      devido à evaporação de água. Isso é perfeitamente normal na confeitaria.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {difference > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-start gap-2">
                  <i className="fas fa-lightbulb text-purple-400 mt-0.5"></i>
                  <div>
                    <p className="text-purple-300 text-sm font-medium mb-1">Rendimento maior - Verifique!</p>
                    <p className="text-purple-200 text-xs">
                      O rendimento está maior que a soma dos ingredientes. Verifique se todos os
                      ingredientes foram considerados ou se há adição de água/outros líquidos.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Remover o aviso de erro - apenas informações */}
            <div className="mt-3 text-xs text-white/60">
              <p>💡 <strong>Dica:</strong> Em docinhos, é normal ter 10-20% de perda por evaporação.</p>
            </div>
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
              <i className="fas fa-plus"></i>
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
                    className="glass-input w-full px-3 py-2 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-300"
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
                    className="glass-input w-full px-3 py-2 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="w-8 h-8 mt-5 flex items-center justify-center rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-400 transition-colors duration-200"
                  disabled={formData.ingredients.length === 1}
                >
                  <i className="fas fa-times text-sm"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
          <GlassButton type="button" variant="secondary" onClick={onClose}>
            <i className="fas fa-times"></i>
            Cancelar
          </GlassButton>
          <GlassButton type="submit">
            <i className="fas fa-save"></i>
            {mass ? 'Atualizar Massa' : 'Criar Massa'}
          </GlassButton>
        </div>
      </form>
    </Modal>
  )
}