// components/Cakes/CakeList.js
import GlassButton from '../UI/GlassButton'
import { FaEdit, FaTrash, FaBirthdayCake } from 'react-icons/fa'
import { useState, useEffect } from 'react'

export default function CakeList({ cakes, cakeMasses, cakeFrostings, products, supplies, onEdit, onDelete }) {
  const [suppliesList, setSuppliesList] = useState([])

  useEffect(() => {
    loadSupplies()
  }, [])

  const loadSupplies = async () => {
    try {
      const response = await fetch('/api/supplies')
      const data = await response.json()
      setSuppliesList(data)
    } catch (error) {
      console.error('Erro ao carregar insumos:', error)
    }
  }

  // Função para calcular custo do bolo
  const calculateCakeCost = (cake) => {
    let totalCost = 0
    const costBreakdown = {
      massCost: 0,
      frostingCost: 0,
      suppliesCost: 0,
      totalCost: 0
    }

    // Custo das massas
    if (cake.masses) {
      cake.masses.forEach(massItem => {
        const mass = cakeMasses.find(m => m.name === massItem.massName)
        if (mass && massItem.grams) {
          const massCostPerGram = (mass.cost || 0) / mass.totalGrams
          const massCost = massCostPerGram * parseFloat(massItem.grams)
          costBreakdown.massCost += massCost
          totalCost += massCost
        }
      })
    }

    // Custo das coberturas
    if (cake.frostings) {
      cake.frostings.forEach(frostingItem => {
        const frosting = cakeFrostings.find(f => f.name === frostingItem.frostingName)
        if (frosting && frostingItem.grams) {
          const frostingCostPerGram = (frosting.cost || 0) / frosting.totalGrams
          const frostingCost = frostingCostPerGram * parseFloat(frostingItem.grams)
          costBreakdown.frostingCost += frostingCost
          totalCost += frostingCost
        }
      })
    }

    // Custo dos insumos
    if (cake.supplies) {
      cake.supplies.forEach(supplyId => {
        const supply = suppliesList.find(s => s._id === supplyId)
        if (supply) {
          costBreakdown.suppliesCost += supply.cost
          totalCost += supply.cost
        }
      })
    }

    costBreakdown.totalCost = totalCost
    return costBreakdown
  }

  const getMassName = (massName) => {
    return massName || 'Massa não definida'
  }

  const getFrostingName = (frostingName) => {
    return frostingName || 'Cobertura não definida'
  }

  const getSupplyName = (supplyId) => {
    const supply = suppliesList.find(s => s._id === supplyId)
    return supply ? supply.name : 'Insumo não encontrado'
  }

  // Função para calcular sugestão de preço
  const calculateSuggestedPrice = (cost) => {
    return cost * 3 // 200% de margem (3x o custo)
  }

  if (cakes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center text-white/30 mx-auto mb-4">
          <FaBirthdayCake size={32} />
        </div>
        <h3 className="text-white text-lg font-semibold mb-2">Nenhum bolo cadastrado</h3>
        <p className="text-white/60">Comece criando seus primeiros tipos de bolos</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {cakes.map((cake) => {
        const costBreakdown = calculateCakeCost(cake)
        const suggestedPrice = calculateSuggestedPrice(costBreakdown.totalCost)
        const hasSalePrice = cake.salePrice && parseFloat(cake.salePrice) > 0

        return (
          <div key={cake._id} className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white">
                  <FaBirthdayCake size={20} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg mb-2">{cake.name}</h3>
                      {cake.description && (
                        <p className="text-white/60 text-sm mb-3">{cake.description}</p>
                      )}
                      
                      {/* Massas e Coberturas */}
                      <div className="space-y-2 mb-3">
                        {cake.masses && cake.masses.length > 0 && (
                          <div>
                            <p className="text-white/60 text-sm mb-1">Massas:</p>
                            <div className="flex flex-wrap gap-2">
                              {cake.masses.map((massItem, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300">
                                  {getMassName(massItem.massName)} ({massItem.grams}g)
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {cake.frostings && cake.frostings.length > 0 && (
                          <div>
                            <p className="text-white/60 text-sm mb-1">Coberturas:</p>
                            <div className="flex flex-wrap gap-2">
                              {cake.frostings.map((frostingItem, index) => (
                                <span key={index} className="px-2 py-1 bg-pink-500/20 rounded-full text-xs text-pink-300">
                                  {getFrostingName(frostingItem.frostingName)} ({frostingItem.grams}g)
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Custo Detalhado */}
                      <div className="space-y-1 text-sm">
                        {costBreakdown.massCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-white/70">Custo massas:</span>
                            <span className="text-blue-400">R$ {costBreakdown.massCost.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {costBreakdown.frostingCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-white/70">Custo coberturas:</span>
                            <span className="text-pink-400">R$ {costBreakdown.frostingCost.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {costBreakdown.suppliesCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-white/70">Custo insumos:</span>
                            <span className="text-purple-400">R$ {costBreakdown.suppliesCost.toFixed(2)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between border-t border-white/20 pt-1">
                          <span className="text-white font-semibold">Custo total:</span>
                          <span className="text-primary-300 font-bold">
                            R$ {costBreakdown.totalCost.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card de Preço */}
                    <div className="text-right ml-4">
                      <div className={`border rounded-xl p-3 min-w-[140px] ${
                        hasSalePrice 
                          ? 'bg-green-500/10 border-green-500/20' 
                          : 'bg-blue-500/10 border-blue-500/20'
                      }`}>
                        
                        {hasSalePrice ? (
                          // Preço definido pelo usuário
                          <>
                            <div className="text-green-400 font-bold text-lg">
                              R$ {parseFloat(cake.salePrice).toFixed(2)}
                            </div>
                            <div className="text-green-300 text-sm">
                              Venda
                            </div>
                            <div className="text-green-200 text-xs mt-1">
                              Lucro: R$ {(parseFloat(cake.salePrice) - costBreakdown.totalCost).toFixed(2)}
                            </div>
                            <div className="text-green-200 text-xs">
                              {cake.profitMargin}% margem
                            </div>
                          </>
                        ) : (
                          // Sugestão de preço
                          <>
                            <div className="text-blue-400 font-bold text-lg">
                              R$ {suggestedPrice.toFixed(2)}
                            </div>
                            <div className="text-blue-300 text-sm">
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
                          onClick={() => onEdit(cake)}
                          className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
                        >
                          Definir preço
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <GlassButton
                  variant="secondary"
                  onClick={() => onEdit(cake)}
                  className="px-4 py-2"
                >
                  <FaEdit size={14} />
                </GlassButton>
                <GlassButton
                  variant="danger"
                  onClick={() => onDelete(cake._id)}
                  className="px-4 py-2"
                >
                  <FaTrash size={14} />
                </GlassButton>
              </div>
            </div>

            {/* Insumos */}
            {cake.supplies && cake.supplies.length > 0 && (
              <div className="mt-4">
                <h4 className="text-white/80 text-sm font-medium mb-2">Insumos:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {cake.supplies.map((supplyId, index) => (
                    <div key={index} className="flex justify-between items-center p-2 rounded-xl bg-white/5">
                      <span className="text-white text-sm">
                        {getSupplyName(supplyId)}
                      </span>
                      <span className="text-purple-400 text-sm font-semibold">
                        1 un
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