// components/Masses/MassList.js
import { FaEdit, FaTrash } from 'react-icons/fa'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect } from 'react'

export default function MassList({ masses, products, onEdit, onDelete }) {
  const [supplies, setSupplies] = useState([])

  // Carregar insumos para cálculos
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

  // Função para calcular custo da massa
  const calculateMassCost = (mass) => {
    let totalCost = 0
    const ingredientCosts = []

    mass.ingredients?.forEach(ingredient => {
      const product = products.find(p => p._id === ingredient.productId)
      if (product && ingredient.grams) {
        const ingredientGrams = parseFloat(ingredient.grams)
        let cost = 0

        if (product.unit === 'un') {
          cost = product.unitCost
        } else {
          cost = ingredientGrams * product.baseUnitCost
        }

        totalCost += cost
        ingredientCosts.push({
          name: product.name,
          grams: ingredient.grams,
          cost: cost,
          costPerGram: cost / ingredientGrams
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
    const product = products.find(p => p._id === productId)
    return product ? product.name : 'Produto não encontrado'
  }

  if (masses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center text-white/30 mx-auto mb-4">
          <i className="fas fa-weight-scale text-3xl"></i>
        </div>
        <h3 className="text-white text-lg font-semibold mb-2">Nenhuma massa cadastrada</h3>
        <p className="text-white/60">Comece criando suas primeiras receitas de massa</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {masses.map((mass) => {
        const costData = calculateMassCost(mass)

        return (
          <div key={mass._id} className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
                  <i className="fas fa-weight-scale"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{mass.name}</h3>
                  <p className="text-white/60">Rendimento: {mass.totalGrams}g</p>

                  {/* Custo da massa */}
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Custo total:</span>
                      <span className="text-green-400 font-semibold">
                        R$ {costData.totalCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm gap-1">
                      <span className="text-white/70">Custo por grama:</span>
                      <span className="text-primary-300 font-semibold">
                        R$ {costData.costPerGram.toFixed(4)}/g
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <GlassButton
                  variant="secondary"
                  onClick={() => onEdit(mass)}
                  className="px-4 py-2"
                >
                  <FaEdit size={14} />
                </GlassButton>
                <GlassButton
                  variant="danger"
                  onClick={() => onDelete(mass._id)}
                  className="px-4 py-2"
                >
                  <FaTrash size={14} />
                </GlassButton>
              </div>
            </div>

            {/* Ingredientes com custos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mass.ingredients?.map((ingredient, index) => {
                const product = products.find(p => p._id === ingredient.productId)
                const ingredientCost = costData.ingredientCosts[index]

                return (
                  <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                    <div>
                      <span className="text-white font-medium">
                        {getProductName(ingredient.productId)}
                      </span>
                      <div className="text-white/60 text-xs">
                        {ingredient.grams}g • R$ {ingredientCost?.costPerGram?.toFixed(4)}/g
                      </div>
                    </div>
                    <span className="text-primary-300 font-semibold">
                      R$ {ingredientCost?.cost?.toFixed(2)}
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