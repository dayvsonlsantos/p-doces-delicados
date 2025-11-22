import { FaEdit, FaTrash } from 'react-icons/fa'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect } from 'react'

// Função para obter descrição amigável da unidade
const getUnitDescription = (unit, quantity = 1) => {
  if (!unit) return ''

  const unitMap = {
    'un': quantity === 1 ? 'unidade' : 'unidades',
    'kg': 'g',
    'g': 'g',
    'l': quantity === 1 ? 'litro' : 'litros',
    'ml': 'ml',
    'cx': quantity === 1 ? 'caixa' : 'caixas',
    'pacote': quantity === 1 ? 'pacote' : 'pacotes'
  }

  return unitMap[unit.toLowerCase()] || unit
}
const getIngredientDisplay = (ingredient, products = []) => {
  if (!ingredient) return 'Ingrediente não definido'

  const product = products.find(p => p._id === ingredient.productId)
  if (!product) return 'Produto não encontrado'

  // Se tem quantityInput, mostra na unidade original
  if (ingredient.quantityInput && ingredient.productUnit) {
    const quantity = parseFloat(ingredient.quantityInput) || 0
    const unitDescription = getUnitDescription(ingredient.productUnit, quantity)

    // Para produtos em unidade, mostra como unidades
    if (ingredient.productUnit.toLowerCase() === 'un') {
      const quantity = parseFloat(ingredient.quantityInput) || 0
      const unitWord = quantity === 1 ? 'unidade' : 'unidades'
      return `${quantity} ${unitWord}`
    }

    // Para kg, mostra em gramas
    if (ingredient.productUnit.toLowerCase() === 'kg') {
      return `${ingredient.quantityInput} g`
    }

    return `${ingredient.quantityInput} ${unitDescription}`
  }
  // Se é versão antiga (apenas grams)
  else if (ingredient.grams && product.unit) {
    // Para unidades, converte de volta
    if (product.unit.toLowerCase() === 'un') {
      const units = (parseFloat(ingredient.grams) || 0) / 50 // 50g por unidade
      const unitDescription = getUnitDescription('un', units)
      return `${units.toFixed(1)} ${unitDescription}`
    }

    // Para kg, mostra em gramas
    if (product.unit.toLowerCase() === 'kg') {
      return `${ingredient.grams} g`
    }

    const quantity = parseFloat(ingredient.grams) || 0
    const unitDescription = getUnitDescription(product.unit, quantity)
    return `${ingredient.grams} ${unitDescription}`
  }

  return 'Quantidade não definida'
}

// Função para obter a unidade de exibição - ATUALIZADA
const getDisplayUnit = (ingredient, products = []) => {
  if (!ingredient) return ''

  const product = products.find(p => p._id === ingredient.productId)
  if (!product) return ''

  // Se é um produto em unidade, mostra como "unidades" (plural genérico)
  if (product.unit.toLowerCase() === 'un') {
    return 'unidades'
  }

  // Se é um produto em kg, mostra como "g"
  if (product.unit.toLowerCase() === 'kg') {
    return 'g'
  }

  return getUnitDescription(product.unit)
}

export default function MassList({ masses, products, onEdit, onDelete }) {
  // Verificação segura no início da função
  const safeMasses = Array.isArray(masses) ? masses : []
  const safeProducts = Array.isArray(products) ? products : []

  const [supplies, setSupplies] = useState([])

  useEffect(() => {
    loadSupplies()
  }, [])

  const loadSupplies = async () => {
    try {
      const response = await fetch('/api/supplies')
      const data = await response.json()
      setSupplies(data)
    } catch (error) {
      console.error('Erro ao carregar insumos:', error)
    }
  }

  const calculateMassCost = (mass) => {
    let totalCost = 0
    const ingredientCosts = []

    mass.ingredients?.forEach(ingredient => {
      const product = safeProducts.find(p => p._id === ingredient.productId)
      if (product) {
        let cost = 0
        let costPerUnit = 0
        let unitType = 'g'

        if (product.unit === 'un') {
          // Para unidades, usa o quantityInput se disponível
          if (ingredient.quantityInput) {
            const units = parseFloat(ingredient.quantityInput) || 0
            cost = units * product.unitCost
            costPerUnit = product.unitCost
            unitType = 'un'
          } else {
            // Fallback para versão antiga
            cost = product.unitCost
            costPerUnit = product.unitCost
            unitType = 'un'
          }
        } else {
          // Para outros produtos, calcula por grama
          const ingredientGrams = parseFloat(ingredient.grams) || 0
          cost = ingredientGrams * product.baseUnitCost
          costPerUnit = product.baseUnitCost
          unitType = 'g'
        }

        totalCost += cost
        ingredientCosts.push({
          name: product.name,
          grams: ingredient.grams,
          cost: cost,
          costPerUnit: costPerUnit,
          unitType: unitType
        })
      }
    })

    return {
      totalCost,
      ingredientCosts,
      costPerGram: totalCost / (parseFloat(mass.totalGrams) || 1)
    }
  }

  const getProductName = (productId) => {
    const product = safeProducts.find(p => p._id === productId)
    return product ? product.name : 'Produto não encontrado'
  }

  // Verificação segura para masses
  if (!safeMasses || safeMasses.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-white/10 flex items-center justify-center text-white/30 mx-auto mb-4">
          <i className="fas fa-weight-scale text-xl md:text-3xl"></i>
        </div>
        <h3 className="text-white text-base md:text-lg font-semibold mb-2">Nenhuma massa cadastrada</h3>
        <p className="text-white/60 text-sm md:text-base">Comece criando suas primeiras receitas de massa</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {safeMasses.map((mass) => {
        const costData = calculateMassCost(mass)

        return (
          <div key={mass._id} className="p-4 md:p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
            <div className="flex items-start justify-between mb-4 flex-col md:flex-row gap-4">
              <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                  <i className="fas fa-weight-scale text-sm md:text-base"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-base md:text-lg mb-1 truncate">
                    {mass.name}
                  </h3>
                  <p className="text-white/60 text-xs md:text-sm">
                    Rendimento: {mass.totalGrams}g
                  </p>

                  {/* Custo da massa */}
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-white/70">Custo total:</span>
                      <span className="text-green-400 font-semibold">
                        R$ {costData.totalCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm gap-1">
                      <span className="text-white/70">Custo por grama:</span>
                      <span className="text-primary-300 font-semibold">
                        R$ {costData.costPerGram.toFixed(4)}/g
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <GlassButton
                  variant="secondary"
                  onClick={() => onEdit(mass)}
                  className="px-3 py-2 text-xs md:text-sm"
                >
                  <FaEdit className="w-3 h-3" />
                </GlassButton>
                <GlassButton
                  variant="danger"
                  onClick={() => onDelete(mass._id)}
                  className="px-3 py-2 text-xs md:text-sm"
                >
                  <FaTrash className="w-3 h-3" />
                </GlassButton>
              </div>
            </div>

            {/* Ingredientes com custos - CORRIGIDO */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {(mass.ingredients || []).map((ingredient, index) => {
                const product = safeProducts.find(p => p._id === ingredient.productId)
                const ingredientCost = costData.ingredientCosts[index]
                const displayText = getIngredientDisplay(ingredient, safeProducts)
                const displayUnit = getDisplayUnit(ingredient, safeProducts)

                const isUnitProduct = product?.unit?.toLowerCase() === 'un'
                const costDisplay = isUnitProduct
                  ? `R$ ${ingredientCost?.costPerUnit?.toFixed(2) || '0.00'}/un`
                  : `R$ ${ingredientCost?.costPerUnit?.toFixed(4) || '0.0000'}/g`

                return (
                  <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                    <div className="min-w-0">
                      <span className="text-white font-medium text-sm md:text-base truncate">
                        {getProductName(ingredient.productId)}
                      </span>
                      <div className="text-white/60 text-xs">
                        {displayText} • {costDisplay}
                      </div>
                      {product && (
                        <div className="text-white/40 text-xs mt-1">
                          {displayUnit.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-primary-300 font-semibold text-sm md:text-base">
                      R$ {ingredientCost?.cost?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}