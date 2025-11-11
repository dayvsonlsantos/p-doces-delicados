import GlassCard from '../UI/GlassCard'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect } from 'react'
import { FaCalculator, FaPlus, FaMinus, FaPrint, FaChevronDown, FaChevronUp } from 'react-icons/fa'

export default function CakeBatchCalculator({ cakes, cakeMasses, cakeFrostings, products }) {
  const [selectedCakes, setSelectedCakes] = useState({})
  const [calculations, setCalculations] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    cakes: false,
    masses: false,
    frostings: false,
    summary: false
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const updateQuantity = (cakeId, quantity) => {
    setSelectedCakes(prev => ({
      ...prev,
      [cakeId]: Math.max(0, quantity)
    }))
  }

  // Função para calcular ingredientes totais de uma massa
  const calculateMassIngredients = (mass, totalGrams) => {
    const scaleFactor = totalGrams / mass.totalGrams
    const ingredients = {}

    mass.ingredients?.forEach(ingredient => {
      const product = products.find(p => p._id === ingredient.productId)
      if (product) {
        const scaledGrams = ingredient.grams * scaleFactor
        if (scaledGrams >= 0.5) { // Só mostra se for pelo menos 0.5g
          ingredients[product.name] = {
            grams: Math.round(scaledGrams * 100) / 100, // Arredonda para 2 casas
            product: product
          }
        }
      }
    })

    return ingredients
  }

  // Função para calcular ingredientes totais de uma cobertura
  const calculateFrostingIngredients = (frosting, totalGrams) => {
    const scaleFactor = totalGrams / frosting.totalGrams
    const ingredients = {}

    frosting.ingredients?.forEach(ingredient => {
      const product = products.find(p => p._id === ingredient.productId)
      if (product) {
        const scaledGrams = ingredient.grams * scaleFactor
        if (scaledGrams >= 0.5) { // Só mostra se for pelo menos 0.5g
          ingredients[product.name] = {
            grams: Math.round(scaledGrams * 100) / 100, // Arredonda para 2 casas
            product: product
          }
        }
      }
    })

    return ingredients
  }

  const calculateBatch = () => {
    const cakeDetails = []
    const massGroups = {}
    const frostingGroups = {}
    let totalCost = 0
    let totalRevenue = 0
    let totalProfit = 0

    // Processar cada bolo selecionado
    Object.entries(selectedCakes).forEach(([cakeId, quantity]) => {
      if (quantity > 0) {
        const cake = cakes.find(c => c._id === cakeId)
        if (cake) {
          const cakeCost = cake.costPerUnit || 0
          const cakeRevenue = cake.salePrice ? parseFloat(cake.salePrice) * quantity : 0
          const cakeProfit = cakeRevenue - (cakeCost * quantity)

          // Detalhes do bolo
          cakeDetails.push({
            cake,
            quantity,
            totalCost: cakeCost * quantity,
            totalRevenue: cakeRevenue,
            totalProfit: cakeProfit
          })

          totalCost += cakeCost * quantity
          totalRevenue += cakeRevenue
          totalProfit += cakeProfit

          // Agrupar por massa
          if (cake.masses) {
            cake.masses.forEach(massItem => {
              if (massItem.massName && massItem.grams) {
                const mass = cakeMasses.find(m => m.name === massItem.massName)
                if (mass) {
                  if (!massGroups[massItem.massName]) {
                    massGroups[massItem.massName] = {
                      mass: mass,
                      totalGrams: 0,
                      cakes: []
                    }
                  }

                  const massGrams = massItem.grams * quantity
                  massGroups[massItem.massName].totalGrams += massGrams
                  massGroups[massItem.massName].cakes.push({
                    cake: cake,
                    quantity: quantity,
                    grams: massGrams
                  })
                }
              }
            })
          }

          // Agrupar por cobertura
          if (cake.frostings) {
            cake.frostings.forEach(frostingItem => {
              if (frostingItem.frostingName && frostingItem.grams) {
                const frosting = cakeFrostings.find(f => f.name === frostingItem.frostingName)
                if (frosting) {
                  if (!frostingGroups[frostingItem.frostingName]) {
                    frostingGroups[frostingItem.frostingName] = {
                      frosting: frosting,
                      totalGrams: 0,
                      cakes: []
                    }
                  }

                  const frostingGrams = frostingItem.grams * quantity
                  frostingGroups[frostingItem.frostingName].totalGrams += frostingGrams
                  frostingGroups[frostingItem.frostingName].cakes.push({
                    cake: cake,
                    quantity: quantity,
                    grams: frostingGrams
                  })
                }
              }
            })
          }
        }
      }
    })

    setCalculations({
      cakeDetails,
      massGroups,
      frostingGroups,
      totalCost: totalCost.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2),
      totalProfit: totalProfit.toFixed(2)
    })
  }

  const printResults = () => {
    window.print()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Seleção de Bolos */}
      <GlassCard>
        <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
          <FaCalculator />
          Selecionar Bolos
        </h2>

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {cakes.map(cake => (
            <div key={cake._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
              <div className="flex-1">
                <h3 className="font-semibold text-primary">{cake.name}</h3>
                <p className="text-secondary text-sm">
                  {cake.masses?.length || 0} massa(s) • {cake.frostings?.length || 0} cobertura(s)
                </p>
                {cake.salePrice && (
                  <p className="text-green-500 text-sm font-semibold">
                    Venda: R$ {parseFloat(cake.salePrice).toFixed(2)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(cake._id, (selectedCakes[cake._id] || 0) - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                >
                  <FaMinus size={12} />
                </button>

                <input
                  type="number"
                  value={selectedCakes[cake._id] || 0}
                  onChange={(e) => updateQuantity(cake._id, parseInt(e.target.value) || 0)}
                  className="w-16 text-center glass-input"
                  min="0"
                />

                <button
                  onClick={() => updateQuantity(cake._id, (selectedCakes[cake._id] || 0) + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500/20 text-green-500 hover:bg-green-500/30 transition-colors"
                >
                  <FaPlus size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <GlassButton
          onClick={calculateBatch}
          className="w-full mt-6"
          disabled={Object.values(selectedCakes).every(qty => qty === 0)}
        >
          <FaCalculator />
          Calcular Lote
        </GlassButton>
      </GlassCard>

      {/* Resultados */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary">Resultados do Lote</h2>
          {calculations && (
            <GlassButton onClick={printResults} variant="secondary">
              <FaPrint />
              Imprimir
            </GlassButton>
          )}
        </div>

        {calculations ? (
          <div className="space-y-4">
            {/* Resumo Financeiro */}
            <div
              className="cursor-pointer"
              onClick={() => toggleSection('summary')}
            >
              <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <h3 className="font-bold text-primary">Resumo Financeiro</h3>
                {expandedSections.summary ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>

            {expandedSections.summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-2xl">
                <div className="text-center">
                  <p className="text-orange-300 text-sm font-semibold">Custo Total</p>
                  <p className="text-orange-400 text-2xl font-bold">R$ {calculations.totalCost}</p>
                </div>

                <div className="text-center">
                  <p className="text-blue-300 text-sm font-semibold">Receita Total</p>
                  <p className="text-blue-400 text-2xl font-bold">R$ {calculations.totalRevenue}</p>
                </div>

                <div className="text-center">
                  <p className="text-green-300 text-sm font-semibold">Lucro Total</p>
                  <p className="text-green-400 text-2xl font-bold">R$ {calculations.totalProfit}</p>
                </div>
              </div>
            )}

            {/* Bolos */}
            <div
              className="cursor-pointer"
              onClick={() => toggleSection('cakes')}
            >
              <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <h3 className="font-bold text-primary">Bolos do Lote</h3>
                {expandedSections.cakes ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>

            {expandedSections.cakes && (
              <div className="space-y-3 p-4 bg-white/5 rounded-2xl">
                {calculations.cakeDetails.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                    <div>
                      <span className="text-primary font-semibold">{item.cake.name}</span>
                      <div className="text-secondary text-xs">
                        {item.quantity} un • R$ {item.totalCost.toFixed(2)} custo
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-semibold">
                        R$ {item.totalRevenue.toFixed(2)}
                      </div>
                      <div className="text-green-300 text-xs">
                        Lucro: R$ {item.totalProfit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Massas Agrupadas */}
            <div
              className="cursor-pointer"
              onClick={() => toggleSection('masses')}
            >
              <div className="flex items-center justify-between p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                <h3 className="font-bold text-primary">Massas Agrupadas</h3>
                {expandedSections.masses ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>

            {expandedSections.masses && (
              <div className="space-y-4 p-4 bg-white/5 rounded-2xl">
                {Object.entries(calculations.massGroups).map(([massName, massData]) => {
                  const ingredients = calculateMassIngredients(massData.mass, massData.totalGrams)
                  const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.grams >= 0.5)

                  return (
                    <div key={massName} className="p-4 rounded-xl bg-white/5">
                      <h4 className="font-bold text-primary mb-3">{massName}</h4>

                      <div className="mb-3">
                        <p className="text-secondary text-sm mb-2">
                          Total necessário: <strong>{massData.totalGrams.toFixed(2)}g</strong>
                        </p>
                        <p className="text-secondary text-xs">Bolos que usam esta massa:</p>
                        <div className="space-y-1 mt-1">
                          {massData.cakes.map((cakeItem, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-white/60">
                              <span>{cakeItem.cake.name}</span>
                              <span>
                                {cakeItem.quantity} un • {cakeItem.grams.toFixed(2)}g
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {validIngredients.length > 0 ? (
                        <div>
                          <p className="text-secondary text-sm mb-2">Ingredientes necessários:</p>
                          <div className="space-y-2">
                            {validIngredients.map(([productName, data]) => (
                              <div key={productName} className="flex justify-between text-sm">
                                <span className="text-white">{productName}</span>
                                <span className="text-primary-300 font-semibold">
                                  {data.grams.toFixed(2)}g
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-secondary text-sm text-center py-2">
                          Quantidades muito pequenas após arredondamento
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Coberturas Agrupadas */}
            <div
              className="cursor-pointer"
              onClick={() => toggleSection('frostings')}
            >
              <div className="flex items-center justify-between p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20">
                <h3 className="font-bold text-primary">Coberturas Agrupadas</h3>
                {expandedSections.frostings ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>

            {expandedSections.frostings && (
              <div className="space-y-4 p-4 bg-white/5 rounded-2xl">
                {Object.entries(calculations.frostingGroups).map(([frostingName, frostingData]) => {
                  const ingredients = calculateFrostingIngredients(frostingData.frosting, frostingData.totalGrams)
                  const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.grams >= 0.5)

                  return (
                    <div key={frostingName} className="p-4 rounded-xl bg-white/5">
                      <h4 className="font-bold text-primary mb-3">{frostingName}</h4>

                      <div className="mb-3">
                        <p className="text-secondary text-sm mb-2">
                          Total necessário: <strong>{frostingData.totalGrams.toFixed(2)}g</strong>
                        </p>
                        <p className="text-secondary text-xs">Bolos que usam esta cobertura:</p>
                        <div className="space-y-1 mt-1">
                          {frostingData.cakes.map((cakeItem, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-white/60">
                              <span>{cakeItem.cake.name}</span>
                              <span>
                                {cakeItem.quantity} un • {cakeItem.grams.toFixed(2)}g
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {validIngredients.length > 0 ? (
                        <div>
                          <p className="text-secondary text-sm mb-2">Ingredientes necessários:</p>
                          <div className="space-y-2">
                            {validIngredients.map(([productName, data]) => (
                              <div key={productName} className="flex justify-between text-sm">
                                <span className="text-white">{productName}</span>
                                <span className="text-primary-300 font-semibold">
                                  {data.grams.toFixed(2)}g
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-secondary text-sm text-center py-2">
                          Quantidades muito pequenas após arredondamento
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 mx-auto mb-4">
              <FaCalculator size={24} />
            </div>
            <p className="text-secondary">Selecione os bolos e clique em calcular</p>
          </div>
        )}
      </GlassCard>

      {/* Informação sobre arredondamento */}
      {calculations && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl col-span-full">
          <p className="text-blue-300 text-sm text-center">
            💡 <strong>Arredondamento aplicado:</strong> Valores abaixo de 0.5g são considerados 0g, 
            valores de 0.5g ou mais são arredondados para 2 casas decimais.
          </p>
        </div>
      )}
    </div>
  )
}