// components/Cakes/CakeList.js (atualizado com 2 casas decimais)
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

  // CORREÇÃO: Usar a mesma lógica de cálculo que está na página de massas
  const calculateMassCost = (mass) => {
    let totalCost = 0
    mass.ingredients?.forEach(ingredient => {
      const product = products.find(p => p._id === ingredient.productId)
      if (product && ingredient.grams) {
        const ingredientGrams = parseFloat(ingredient.grams)
        let cost = 0

        // CORREÇÃO: Usar a mesma lógica
        if (product.unit === 'un') {
          const unitWeight = 50 // padrão 50g por unidade
          const units = ingredientGrams / unitWeight
          cost = units * product.unitCost
        } else {
          cost = ingredientGrams * product.baseUnitCost
        }

        totalCost += cost
      }
    })
    return totalCost
  }

  const calculateCakeCost = (cake) => {
    let totalCost = 0
    const costBreakdown = {
      massCost: 0,
      frostingCost: 0,
      suppliesCost: 0,
      totalCost: 0,
      massDetails: [],
      frostingDetails: []
    }

    // Cálculo das massas - CORREÇÃO: Buscar o custo calculado da massa
    if (cake.masses) {
      cake.masses.forEach(massItem => {
        const mass = cakeMasses.find(m => m.name === massItem.massName)
        if (mass && massItem.grams) {
          // CORREÇÃO: Buscar o custo total da massa ou calcular na hora
          const massTotalCost = mass.cost || calculateMassCost(mass)
          const massCostPerGram = massTotalCost / mass.totalGrams
          const massGrams = parseFloat(massItem.grams)
          const massCost = massCostPerGram * massGrams
          
          costBreakdown.massCost += massCost
          totalCost += massCost
          costBreakdown.massDetails.push({
            massName: massItem.massName,
            grams: massGrams,
            cost: massCost,
            costPerGram: massCostPerGram,
            massTotalCost: massTotalCost,
            massTotalGrams: mass.totalGrams
          })
        }
      })
    }

    // Cálculo das coberturas - CORREÇÃO: Mesma lógica para coberturas
    if (cake.frostings) {
      cake.frostings.forEach(frostingItem => {
        const frosting = cakeFrostings.find(f => f.name === frostingItem.frostingName)
        if (frosting && frostingItem.grams) {
          const frostingTotalCost = frosting.cost || calculateMassCost(frosting)
          const frostingCostPerGram = frostingTotalCost / frosting.totalGrams
          const frostingGrams = parseFloat(frostingItem.grams)
          const frostingCost = frostingCostPerGram * frostingGrams
          
          costBreakdown.frostingCost += frostingCost
          totalCost += frostingCost
          costBreakdown.frostingDetails.push({
            frostingName: frostingItem.frostingName,
            grams: frostingGrams,
            cost: frostingCost,
            costPerGram: frostingCostPerGram,
            frostingTotalCost: frostingTotalCost,
            frostingTotalGrams: frosting.totalGrams
          })
        }
      })
    }

    // Cálculo dos insumos
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

  const calculateSuggestedPrice = (cost) => {
    return cost * 3
  }

  if (cakes.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-white/10 flex items-center justify-center text-white/30 mx-auto mb-4">
          <FaBirthdayCake className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <h3 className="text-white text-base md:text-lg font-semibold mb-2">Nenhum bolo cadastrado</h3>
        <p className="text-white/60 text-sm md:text-base">Comece criando seus primeiros tipos de bolos</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {cakes.map((cake) => {
        const costBreakdown = calculateCakeCost(cake)
        const suggestedPrice = calculateSuggestedPrice(costBreakdown.totalCost)
        const hasSalePrice = cake.salePrice && parseFloat(cake.salePrice) > 0
        const totalGrams = (costBreakdown.massDetails.reduce((sum, m) => sum + m.grams, 0) + 
                          costBreakdown.frostingDetails.reduce((sum, f) => sum + f.grams, 0))

        return (
          <div key={cake._id} className="p-4 md:p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
            <div className="flex items-start justify-between mb-4 flex-col md:flex-row gap-4">
              <div className="flex items-start gap-3 md:gap-4 flex-1 w-full">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white flex-shrink-0">
                  <FaBirthdayCake className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between flex-col md:flex-row gap-3 md:gap-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-base md:text-lg mb-2 truncate">
                        {cake.name}
                      </h3>
                      
                      {cake.description && (
                        <p className="text-white/60 text-xs md:text-sm mb-3 line-clamp-2">{cake.description}</p>
                      )}
                      
                      {/* Informações das Massas e Coberturas */}
                      <div className="mb-3">
                        <p className="text-white/60 text-xs md:text-sm mb-2">
                          {costBreakdown.massDetails.length} massa(s) • {costBreakdown.frostingDetails.length} cobertura(s) • {totalGrams.toFixed(2)}g total
                        </p>
                        
                        {/* Massas */}
                        {costBreakdown.massDetails.length > 0 && (
                          <div className="mb-2">
                            <div className="flex flex-wrap gap-1 md:gap-2">
                              {costBreakdown.massDetails.map((massDetail, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300">
                                  {getMassName(massDetail.massName)} ({massDetail.grams.toFixed(2)}g)
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Coberturas */}
                        {costBreakdown.frostingDetails.length > 0 && (
                          <div>
                            <div className="flex flex-wrap gap-1 md:gap-2">
                              {costBreakdown.frostingDetails.map((frostingDetail, index) => (
                                <span key={index} className="px-2 py-1 bg-pink-500/20 rounded-full text-xs text-pink-300">
                                  {getFrostingName(frostingDetail.frostingName)} ({frostingDetail.grams.toFixed(2)}g)
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Custo Detalhado - ARREDONDADO PARA 2 CASAS DECIMAIS */}
                      <div className="space-y-1 text-xs md:text-sm">
                        {/* Massas */}
                        {costBreakdown.massCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-white/70">Custo massas:</span>
                            <span className="text-blue-400">R$ {costBreakdown.massCost.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {/* Coberturas */}
                        {costBreakdown.frostingCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-white/70">Custo coberturas:</span>
                            <span className="text-pink-400">R$ {costBreakdown.frostingCost.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {/* Insumos */}
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
                    <div className="text-right w-full md:w-auto">
                      <div className={`border rounded-xl p-3 min-w-[140px] ${
                        hasSalePrice 
                          ? 'bg-green-500/10 border-green-500/20' 
                          : 'bg-blue-500/10 border-blue-500/20'
                      }`}>
                        
                        {hasSalePrice ? (
                          <>
                            <div className="text-green-400 font-bold text-base md:text-lg">
                              R$ {parseFloat(cake.salePrice).toFixed(2)}
                            </div>
                            <div className="text-green-300 text-xs md:text-sm">
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

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <GlassButton
                  variant="secondary"
                  onClick={() => onEdit(cake)}
                  className="px-3 py-2 text-xs md:text-sm"
                >
                  <FaEdit className="w-3 h-3 md:w-3 md:h-3" />
                </GlassButton>
                <GlassButton
                  variant="danger"
                  onClick={() => onDelete(cake._id)}
                  className="px-3 py-2 text-xs md:text-sm"
                >
                  <FaTrash className="w-3 h-3 md:w-3 md:h-3" />
                </GlassButton>
              </div>
            </div>

            {/* Detalhes das Massas Individualmente - ARREDONDADO PARA 2 CASAS DECIMAIS */}
            {costBreakdown.massDetails.length > 0 && (
              <div className="mt-3 md:mt-4">
                <h4 className="text-white/80 text-sm font-medium mb-2">Detalhes das Massas:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {costBreakdown.massDetails.map((massDetail, index) => (
                    <div key={index} className="flex justify-between items-center p-2 md:p-3 rounded-xl bg-white/5">
                      <div className="min-w-0">
                        <span className="text-white text-xs md:text-sm font-medium truncate">
                          {massDetail.massName}
                        </span>
                        <div className="text-white/60 text-xs">
                          {massDetail.grams.toFixed(2)}g • R$ {massDetail.costPerGram.toFixed(4)}/g
                        </div>
                        <div className="text-white/40 text-xs">
                          Custo total da massa: R$ {massDetail.massTotalCost?.toFixed(2)} ({massDetail.massTotalGrams}g)
                        </div>
                      </div>
                      <span className="text-blue-400 text-xs md:text-sm font-semibold">
                        R$ {massDetail.cost.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detalhes das Coberturas Individualmente - ARREDONDADO PARA 2 CASAS DECIMAIS */}
            {costBreakdown.frostingDetails.length > 0 && (
              <div className="mt-3 md:mt-4">
                <h4 className="text-white/80 text-sm font-medium mb-2">Detalhes das Coberturas:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {costBreakdown.frostingDetails.map((frostingDetail, index) => (
                    <div key={index} className="flex justify-between items-center p-2 md:p-3 rounded-xl bg-white/5">
                      <div className="min-w-0">
                        <span className="text-white text-xs md:text-sm font-medium truncate">
                          {frostingDetail.frostingName}
                        </span>
                        <div className="text-white/60 text-xs">
                          {frostingDetail.grams.toFixed(2)}g • R$ {frostingDetail.costPerGram.toFixed(4)}/g
                        </div>
                        <div className="text-white/40 text-xs">
                          Custo total da cobertura: R$ {frostingDetail.frostingTotalCost?.toFixed(2)} ({frostingDetail.frostingTotalGrams}g)
                        </div>
                      </div>
                      <span className="text-pink-400 text-xs md:text-sm font-semibold">
                        R$ {frostingDetail.cost.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insumos */}
            {cake.supplies && cake.supplies.length > 0 && (
              <div className="mt-3 md:mt-4">
                <h4 className="text-white/80 text-sm font-medium mb-2">Insumos:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {cake.supplies.map((supplyId, index) => (
                    <div key={index} className="flex justify-between items-center p-2 rounded-xl bg-white/5">
                      <span className="text-white text-xs md:text-sm truncate">
                        {getSupplyName(supplyId)}
                      </span>
                      <span className="text-purple-400 text-xs md:text-sm font-semibold">
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