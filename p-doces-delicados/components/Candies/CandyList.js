// components/Candies/CandyList.js (atualizado com 2 casas decimais)
import { FaEdit, FaTrash, FaCookie } from 'react-icons/fa'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect } from 'react'

export default function CandyList({ candies, masses, products, onEdit, onDelete }) {
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

  const calculateMassCost = (ingredients, products) => {
    let totalCost = 0

    ingredients.forEach(ingredient => {
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
      }
    })

    return totalCost
  }

  const calculateCandyCost = (candy) => {
    const candyMasses = candy.masses || [{ massName: candy.massName, grams: candy.candyGrams }]
    
    if (!candyMasses || candyMasses.length === 0 || !candyMasses.some(mass => mass.massName && mass.grams)) {
      return { massCost: 0, extrasCost: 0, suppliesCost: 0, totalCost: 0, totalGrams: 0, massDetails: [] }
    }

    let totalMassCost = 0
    let totalGrams = 0
    const costBreakdown = {
      massCost: 0,
      extrasCost: 0,
      suppliesCost: 0,
      totalCost: 0,
      totalGrams: 0,
      massDetails: []
    }

    candyMasses.forEach(massItem => {
      if (massItem.massName && massItem.grams) {
        const mass = masses.find(m => m.name === massItem.massName)
        if (mass) {
          const massCostPerGram = calculateMassCost(mass.ingredients, products) / mass.totalGrams
          const massGrams = parseFloat(massItem.grams)
          const massCost = massCostPerGram * massGrams
          
          totalMassCost += massCost
          totalGrams += massGrams
          costBreakdown.massDetails.push({
            massName: massItem.massName,
            grams: massGrams,
            cost: massCost
          })
        }
      }
    })
    
    costBreakdown.massCost = totalMassCost
    costBreakdown.totalGrams = totalGrams

    let extrasCost = 0
    if (candy.extras && candy.extras.length > 0) {
      candy.extras.forEach(extra => {
        const product = products.find(p => p._id === extra.productId)
        if (product && extra.grams) {
          const extraGrams = parseFloat(extra.grams)
          let extraCost = 0

          if (product.unit === 'un') {
            extraCost = product.unitCost * (extraGrams / 100)
          } else {
            extraCost = extraGrams * product.baseUnitCost
          }

          extrasCost += extraCost
        }
      })
    }
    costBreakdown.extrasCost = extrasCost

    let suppliesCost = 0
    if (candy.supplies && candy.supplies.length > 0) {
      candy.supplies.forEach(supplyId => {
        const supply = supplies.find(s => s._id === supplyId)
        if (supply) {
          suppliesCost += supply.cost
        }
      })
    }
    costBreakdown.suppliesCost = suppliesCost

    costBreakdown.totalCost = totalMassCost + extrasCost + suppliesCost
    return costBreakdown
  }

  const getMassName = (massName) => {
    return massName || 'Massa não definida'
  }

  const getProductName = (productId) => {
    const product = products.find(p => p._id === productId)
    return product ? product.name : 'Produto não encontrado'
  }

  const getSupplyName = (supplyId) => {
    const supply = supplies.find(s => s._id === supplyId)
    return supply ? supply.name : 'Insumo não encontrado'
  }

  const calculateSuggestedPrice = (cost) => {
    return cost * 3
  }

  if (candies.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-white/10 flex items-center justify-center text-white/30 mx-auto mb-4">
          <FaCookie className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <h3 className="text-white text-base md:text-lg font-semibold mb-2">Nenhum docinho cadastrado</h3>
        <p className="text-white/60 text-sm md:text-base">Comece criando seus primeiros tipos de docinhos</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {candies.map((candy) => {
        const costBreakdown = calculateCandyCost(candy)
        const candyMasses = candy.masses || [{ massName: candy.massName, grams: candy.candyGrams }]
        const suggestedPrice = calculateSuggestedPrice(costBreakdown.totalCost)
        const hasSalePrice = candy.salePrice && parseFloat(candy.salePrice) > 0

        return (
          <div key={candy._id} className="p-4 md:p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
            <div className="flex items-start justify-between mb-4 flex-col md:flex-row gap-4">
              <div className="flex items-start gap-3 md:gap-4 flex-1 w-full">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                  <FaCookie className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between flex-col md:flex-row gap-3 md:gap-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-base md:text-lg mb-2 truncate">
                        {candy.name}
                      </h3>
                      
                      {/* Informações das Massas */}
                      <div className="mb-3">
                        <p className="text-white/60 text-xs md:text-sm mb-1">
                          {candyMasses.length > 1 ? `${candyMasses.length} massas` : '1 massa'} • {costBreakdown.totalGrams.toFixed(2)}g total
                        </p>
                        
                        {/* Detalhes das massas */}
                        <div className="flex flex-wrap gap-1 md:gap-2">
                          {candyMasses.map((massItem, index) => (
                            <span key={index} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                              {getMassName(massItem.massName)} ({massItem.grams}g)
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Custo Detalhado - ATUALIZADO PARA 2 CASAS DECIMAIS */}
                      <div className="space-y-1 text-xs md:text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/70">Custo massa(s):</span>
                          <span className="text-white">R$ {costBreakdown.massCost.toFixed(2)}</span>
                        </div>
                        
                        {costBreakdown.extrasCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-white/70">Custo extras:</span>
                            <span className="text-yellow-400">R$ {costBreakdown.extrasCost.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {costBreakdown.suppliesCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-white/70">Custo insumos:</span>
                            <span className="text-blue-400">R$ {costBreakdown.suppliesCost.toFixed(2)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between border-t border-white/20 pt-1">
                          <span className="text-white font-semibold">Custo total:</span>
                          <span className="text-primary-300 font-bold">
                            R$ {costBreakdown.totalCost.toFixed(2)} /un
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card de Preço */}
                    <div className="text-right w-full md:w-auto">
                      <div className={`border rounded-xl p-3 min-w-[140px] ${
                        hasSalePrice 
                          ? 'bg-green-500/10 border-green-500/20' 
                          : 'bg-blue-500/10 border-blue-500/20'
                      }`}>
                        
                        {hasSalePrice ? (
                          <>
                            <div className="text-green-400 font-bold text-base md:text-lg">
                              R$ {parseFloat(candy.salePrice).toFixed(2)}
                            </div>
                            <div className="text-green-300 text-xs md:text-sm">
                              Venda
                            </div>
                            <div className="text-green-200 text-xs mt-1">
                              Lucro: R$ {(parseFloat(candy.salePrice) - costBreakdown.totalCost).toFixed(2)}
                            </div>
                            <div className="text-green-200 text-xs">
                              {candy.profitMargin}% margem
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-blue-400 font-bold text-base md:text-lg">
                              R$ {suggestedPrice.toFixed(2)}
                            </div>
                            <div className="text-blue-300 text-xs md:text-sm">
                              Sugestão
                            </div>
                            <div className="text-blue-200 text-xs mt-1">
                              Lucro: R$ {(suggestedPrice - costBreakdown.totalCost).toFixed(2)}
                            </div>
                            <div className="text-blue-200 text-xs">
                              200% margem
                            </div>
                            <div className="text-blue-300 text-xs mt-1 italic">
                              (3x o custo)
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Botão para definir preço */}
                      {!hasSalePrice && (
                        <button
                          onClick={() => onEdit(candy)}
                          className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
                        >
                          Definir preço
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <GlassButton
                  variant="secondary"
                  onClick={() => onEdit(candy)}
                  className="px-3 py-2 text-xs md:text-sm"
                >
                  <FaEdit className="w-3 h-3 md:w-3 md:h-3" />
                </GlassButton>
                <GlassButton
                  variant="danger"
                  onClick={() => onDelete(candy._id)}
                  className="px-3 py-2 text-xs md:text-sm"
                >
                  <FaTrash className="w-3 h-3 md:w-3 md:h-3" />
                </GlassButton>
              </div>
            </div>

            {/* Extras */}
            {candy.extras && candy.extras.length > 0 && (
              <div className="mt-3 md:mt-4">
                <h4 className="text-white/80 text-sm font-medium mb-2">Extras:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {candy.extras.map((extra, index) => (
                    <div key={index} className="flex justify-between items-center p-2 rounded-xl bg-white/5">
                      <span className="text-white text-xs md:text-sm truncate">
                        {getProductName(extra.productId)}
                      </span>
                      <span className="text-primary-300 text-xs md:text-sm font-semibold">
                        {extra.grams}g
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insumos */}
            {candy.supplies && candy.supplies.length > 0 && (
              <div className="mt-3 md:mt-4">
                <h4 className="text-white/80 text-sm font-medium mb-2">Insumos:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {candy.supplies.map((supplyId, index) => (
                    <div key={index} className="flex justify-between items-center p-2 rounded-xl bg-white/5">
                      <span className="text-white text-xs md:text-sm truncate">
                        {getSupplyName(supplyId)}
                      </span>
                      <span className="text-blue-400 text-xs md:text-sm font-semibold">
                        1 un
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detalhes das Massas Individualmente - ATUALIZADO PARA 2 CASAS DECIMAIS */}
            {costBreakdown.massDetails.length > 1 && (
              <div className="mt-3 md:mt-4">
                <h4 className="text-white/80 text-sm font-medium mb-2">Detalhes por Massa:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {costBreakdown.massDetails.map((massDetail, index) => (
                    <div key={index} className="flex justify-between items-center p-2 md:p-3 rounded-xl bg-white/5">
                      <div className="min-w-0">
                        <span className="text-white text-xs md:text-sm font-medium truncate">
                          {massDetail.massName}
                        </span>
                        <div className="text-white/60 text-xs">
                          {massDetail.grams.toFixed(2)}g
                        </div>
                      </div>
                      <span className="text-primary-300 text-xs md:text-sm font-semibold">
                        R$ {massDetail.cost.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}