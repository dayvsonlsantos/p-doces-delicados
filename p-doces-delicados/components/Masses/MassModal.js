// components/Masses/MassModal.js (atualizado)
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect } from 'react'
import { calculateIngredientCost } from '../../lib/calculations'
import { FaInfoCircle, FaPlus, FaTimes, FaSave, FaLightbulb, FaCalculator, FaDollarSign } from 'react-icons/fa'

// Tabela de conversão de unidades para gramas
const unitConversions = {
  'un': 0,       // NÃO converte unidades para gramas (valor 0)
  'kg': 1,       // 1 g = 1g (usuário já informa em gramas)
  'g': 1,        // 1 g = 1g
  'l': 1000,     // 1 litro = 1000g
  'ml': 1,       // 1 ml = 1g
  'cx': 1000,    // 1 caixa = 1000g
  'pacote': 1000 // 1 pacote = 1000g
}

// Função para obter descrição amigável da unidade
const getUnitDescription = (unit) => {
  if (!unit) return ''

  const unitMap = {
    'un': 'unidades',
    'kg': 'gramas', // Alterado para gramas
    'g': 'gramas',
    'l': 'litros',
    'ml': 'ml',
    'cx': 'caixas',
    'pacote': 'pacotes'
  }

  return unitMap[unit.toLowerCase()] || unit
}

// Função para obter placeholder baseado na unidade
const getQuantityPlaceholder = (unit) => {
  if (!unit) return "Selecione um produto primeiro"

  const placeholderMap = {
    'un': "Ex: 2",
    'kg': "Ex: 500", // Alterado para exemplo em gramas
    'g': "Ex: 250",
    'l': "Ex: 1",
    'ml': "Ex: 500",
    'cx': "Ex: 1",
    'pacote': "Ex: 1"
  }

  return placeholderMap[unit.toLowerCase()] || `Ex: 1`
}

// Função para obter label do campo de quantidade
const getQuantityLabel = (unit) => {
  if (!unit) return 'Quantidade'

  const labelMap = {
    'un': 'Quantidade (unidades)',
    'kg': 'Quantidade (gramas)', // Alterado para gramas
    'g': 'Quantidade (gramas)',
    'l': 'Quantidade (litros)',
    'ml': 'Quantidade (ml)',
    'cx': 'Quantidade (caixas)',
    'pacote': 'Quantidade (pacotes)'
  }

  return labelMap[unit.toLowerCase()] || 'Quantidade'
}

// Função para converter para gramas baseado na unidade
const convertToGrams = (value, unit) => {
  if (!value || !unit) return 0

  const quantity = parseFloat(value) || 0

  // Se for unidade, NÃO converte para gramas (mantém 0)
  if (unit.toLowerCase() === 'un') {
    return 0 // Não converte unidades para gramas
  }

  // Se a unidade for kg, o usuário já está informando em gramas
  if (unit.toLowerCase() === 'kg') {
    return quantity // Já está em gramas
  }

  const conversionRate = unitConversions[unit.toLowerCase()] || 1
  return quantity * conversionRate
}

export default function MassModal({ isOpen, onClose, onSave, mass, products = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    totalGrams: '',
    ingredients: [{ productId: '', grams: '', quantityInput: '', productUnit: '' }]
  })

  const [costBreakdown, setCostBreakdown] = useState({
    ingredientCosts: [],
    totalCost: 0,
    costPerGram: 0
  })

  useEffect(() => {
    if (mass) {
      // Para edição, carrega os dados existentes
      const ingredientsWithUnits = mass.ingredients?.map(ingredient => {
        const product = products.find(p => p._id === ingredient.productId)
        return {
          ...ingredient,
          quantityInput: ingredient.quantityInput || '',
          productUnit: product?.unit || ''
        }
      }) || [{ productId: '', grams: '', quantityInput: '', productUnit: '' }]

      setFormData({
        name: mass.name || '',
        totalGrams: mass.totalGrams || '',
        ingredients: ingredientsWithUnits
      })
    } else {
      setFormData({
        name: '',
        totalGrams: '',
        ingredients: [{ productId: '', grams: '', quantityInput: '', productUnit: '' }]
      })
    }
  }, [mass, isOpen, products])

  // Calcular custos quando os ingredientes mudarem
  useEffect(() => {
    calculateCosts()
  }, [formData.ingredients, formData.totalGrams])

  const calculateCosts = () => {
    let totalCost = 0
    const ingredientCosts = []

    formData.ingredients.forEach(ingredient => {
      const product = products.find(p => p._id === ingredient.productId)
      if (product && ingredient.quantityInput) {
        let cost = 0

        if (product.unit === 'un') {
          // Para unidades, usa diretamente o quantityInput e unitCost
          const units = parseFloat(ingredient.quantityInput) || 0
          cost = units * product.unitCost
        } else {
          // Para outros, converte para gramas e usa baseUnitCost
          const ingredientGrams = parseFloat(ingredient.grams) || 0
          cost = ingredientGrams * product.baseUnitCost
        }

        totalCost += cost
        ingredientCosts.push({
          productName: product.name,
          quantity: ingredient.quantityInput,
          unit: ingredient.productUnit,
          cost: cost
        })
      }
    })

    const totalGrams = parseFloat(formData.totalGrams) || 1
    const costPerGram = totalCost / totalGrams

    setCostBreakdown({
      ingredientCosts,
      totalCost,
      costPerGram
    })
  }

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, {
        productId: '',
        grams: '',
        quantityInput: '',
        productUnit: ''
      }]
    })
  }

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index)
    setFormData({ ...formData, ingredients: newIngredients })
  }

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...formData.ingredients]

    if (field === 'productId') {
      const product = products.find(p => p._id === value)
      const unit = product?.unit || ''

      newIngredients[index] = {
        ...newIngredients[index],
        productId: value,
        productUnit: unit,
        // Limpa os campos de quantidade quando muda o produto
        grams: '',
        quantityInput: ''
      }
    } else if (field === 'quantityInput') {
      const product = products.find(p => p._id === newIngredients[index].productId)
      const unit = product?.unit || ''

      // Converte para gramas baseado na unidade do produto
      const grams = convertToGrams(value, unit)

      newIngredients[index] = {
        ...newIngredients[index],
        quantityInput: value,
        grams: grams
      }
    } else {
      newIngredients[index][field] = value
    }

    setFormData({ ...formData, ingredients: newIngredients })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validações básicas
    if (!formData.name || !formData.totalGrams) {
      alert('Por favor, preencha o nome e o rendimento final da massa')
      return
    }

    if (formData.ingredients.some(ing => !ing.productId || !ing.quantityInput)) {
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
        productId: ing.productId,
        grams: parseFloat(ing.grams),
        quantityInput: ing.quantityInput, // Salva o input original
        productUnit: ing.productUnit // Salva a unidade para referência
      })),
      calculatedData: {
        totalIngredients: totalIngredients,
        difference: totalFinal - totalIngredients,
        percentageDifference: totalIngredients > 0 ? ((totalFinal - totalIngredients) / totalIngredients * 100) : 0,
        totalCost: costBreakdown.totalCost,
        costPerGram: costBreakdown.costPerGram
      }
    }

    onSave(massData)
  }

  const totalIngredientGrams = formData.ingredients.reduce((sum, ing) => sum + (parseFloat(ing.grams) || 0), 0)
  const totalGrams = parseFloat(formData.totalGrams) || 0
  const difference = totalGrams - totalIngredientGrams
  const percentageLoss = totalIngredientGrams > 0 ? ((difference / totalIngredientGrams) * 100) : 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mass ? 'Editar Massa' : 'Criar Nova Massa'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Header fixo */}
        <div className="flex-shrink-0 p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white text-center">
            {mass ? 'Editar Massa' : 'Criar Nova Massa'}
          </h2>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
            <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
              <FaInfoCircle className="w-4 h-4" />
              Sobre as Massas
            </h4>
            <p className="text-blue-200 text-sm">
              Uma massa é a base dos seus docinhos. Defina a receita com os ingredientes e o rendimento total.
            </p>
            <p className="text-blue-200 text-sm mt-2">
              💡 <strong>Importante:</strong> Para produtos em kg, informe a quantidade em GRAMAS!
            </p>
          </div>

          {/* Informações básicas */}
          <div className="space-y-4">
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
                    <FaInfoCircle className="text-blue-400 mt-0.5 w-4 h-4 flex-shrink-0" />
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
                    <FaLightbulb className="text-purple-400 mt-0.5 w-4 h-4 flex-shrink-0" />
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

              <div className="mt-3 text-xs text-white/60">
                <p>💡 <strong>Dica:</strong> Em docinhos, é normal ter 10-20% de perda por evaporação.</p>
              </div>
            </div>
          )}

          {/* Seção de Ingredientes */}
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">Ingredientes da Massa</h3>
                <p className="text-white/60 text-sm">
                  Adicione todos os ingredientes. Para produtos em kg, informe em GRAMAS.
                </p>
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
              {formData.ingredients.map((ingredient, index) => {
                const product = products.find(p => p._id === ingredient.productId)
                const unitDescription = getUnitDescription(ingredient.productUnit)
                const placeholder = getQuantityPlaceholder(ingredient.productUnit)
                const quantityLabel = getQuantityLabel(ingredient.productUnit)

                return (
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
                          <FaTimes className="w-3 h-3" />
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
                        <label className="block text-white/60 text-xs mb-2">
                          {quantityLabel}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={placeholder}
                          value={ingredient.quantityInput || ''}
                          onChange={(e) => updateIngredient(index, 'quantityInput', e.target.value)}
                          className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                          required
                          disabled={!ingredient.productId}
                        />
                        {ingredient.productId && ingredient.productUnit === 'kg' && (
                          <div className="text-xs text-blue-400 mt-1">
                            💡 Informe a quantidade em <strong>GRAMAS</strong>. Ex: 1kg = 1000g
                          </div>
                        )}
                        {ingredient.productId && ingredient.productUnit !== 'kg' && ingredient.productUnit !== 'un' && (
                          <div className="text-xs text-white/60 mt-1">
                            💡 Digite a quantidade em <strong>{unitDescription}</strong>.
                            Será convertido automaticamente para gramas.
                          </div>
                        )}
                        {ingredient.productId && ingredient.productUnit === 'un' && (
                          <div className="text-xs text-white/60 mt-1">
                            💡 Digite a quantidade em <strong>unidades</strong>.
                          </div>
                        )}
                        {ingredient.grams > 0 && ingredient.productUnit === 'kg' && (
                          <div className="text-xs text-green-400 mt-1">
                            ✅ Quantidade informada: {ingredient.grams.toFixed(2)}g
                          </div>
                        )}
                        {ingredient.quantityInput && ingredient.productUnit === 'un' && (
                          <div className="text-xs text-green-400 mt-1">
                            ✅ Quantidade informada: {ingredient.quantityInput} unidades
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Visualização do Custo em Tempo Real */}
          {costBreakdown.totalCost > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
              <h4 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
                <FaCalculator className="w-4 h-4" />
                Resumo Financeiro da Massa
              </h4>

              <div className="space-y-2 text-sm">
                {/* Detalhes dos Ingredientes */}
                {costBreakdown.ingredientCosts.map((ingredientCost, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-white/80 truncate">
                      {ingredientCost.productName} ({ingredientCost.quantity} {ingredientCost.unit}):
                    </span>
                    <span className="text-white flex-shrink-0 ml-2">R$ {ingredientCost.cost.toFixed(4)}</span>
                  </div>
                ))}

                <div className="flex justify-between border-t border-white/20 pt-2">
                  <span className="text-white font-semibold">Custo total da massa:</span>
                  <span className="text-white font-bold">R$ {costBreakdown.totalCost.toFixed(4)}</span>
                </div>

                {formData.totalGrams && (
                  <div className="flex justify-between">
                    <span className="text-white/80">Custo por grama:</span>
                    <span className="text-green-400 font-semibold">R$ {costBreakdown.costPerGram.toFixed(6)}</span>
                  </div>
                )}

                {formData.totalGrams && costBreakdown.totalCost > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-2">
                      <FaDollarSign className="text-blue-400 mt-0.5 w-4 h-4 flex-shrink-0" />
                      <div>
                        <p className="text-blue-300 text-sm font-medium mb-1">Custo da Massa</p>
                        <p className="text-blue-200 text-xs">
                          Esta massa de {formData.totalGrams}g custa R$ {costBreakdown.totalCost.toFixed(2)} no total.
                          Cada grama custa R$ {costBreakdown.costPerGram.toFixed(6)}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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