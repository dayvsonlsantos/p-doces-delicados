// components/Cakes/CakeBatchCalculator.js (corrigido)
import GlassCard from '../UI/GlassCard'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect, useRef } from 'react'
import { FaCalculator, FaPlus, FaMinus, FaPrint, FaChevronDown, FaChevronUp, FaDownload } from 'react-icons/fa'
import html2canvas from 'html2canvas'

export default function CakeBatchCalculator({ cakes, cakeMasses, cakeFrostings, products }) {
  const [selectedCakes, setSelectedCakes] = useState({})
  const [calculations, setCalculations] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    cakes: false,
    masses: false,
    frostings: false,
    summary: false
  })
  
  const resultsRef = useRef(null)

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

  // Função para calcular custo da massa/cobertura
  const calculateMassCost = (mass) => {
    let totalCost = 0
    mass.ingredients?.forEach(ingredient => {
      const product = products.find(p => p._id === ingredient.productId)
      if (product && ingredient.grams) {
        const ingredientGrams = parseFloat(ingredient.grams)
        let cost = 0

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

  // Função para calcular custo de um bolo individual
  const calculateCakeCost = (cake) => {
    let totalCost = 0

    // Cálculo das massas
    if (cake.masses) {
      cake.masses.forEach(massItem => {
        const mass = cakeMasses.find(m => m.name === massItem.massName)
        if (mass && massItem.grams) {
          const massTotalCost = mass.cost || calculateMassCost(mass)
          const massCostPerGram = massTotalCost / mass.totalGrams
          const massGrams = parseFloat(massItem.grams)
          const massCost = massCostPerGram * massGrams
          totalCost += massCost
        }
      })
    }

    // Cálculo das coberturas
    if (cake.frostings) {
      cake.frostings.forEach(frostingItem => {
        const frosting = cakeFrostings.find(f => f.name === frostingItem.frostingName)
        if (frosting && frostingItem.grams) {
          const frostingTotalCost = frosting.cost || calculateMassCost(frosting)
          const frostingCostPerGram = frostingTotalCost / frosting.totalGrams
          const frostingGrams = parseFloat(frostingItem.grams)
          const frostingCost = frostingCostPerGram * frostingGrams
          totalCost += frostingCost
        }
      })
    }

    return totalCost
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
          // CORREÇÃO: Calcular custo unitário corretamente
          const cakeUnitCost = calculateCakeCost(cake) || 0
          const cakeTotalCost = cakeUnitCost * quantity
          
          // Usar preço de venda definido ou calcular sugestão (3x o custo)
          const cakeSalePrice = cake.salePrice || (cakeUnitCost * 3)
          const cakeRevenue = cakeSalePrice * quantity
          const cakeProfit = cakeRevenue - cakeTotalCost

          // CORREÇÃO: Garantir que todos os valores sejam números válidos
          cakeDetails.push({
            cake,
            quantity,
            unitCost: cakeUnitCost,
            totalCost: cakeTotalCost,
            salePrice: cakeSalePrice,
            revenue: cakeRevenue,
            profit: cakeProfit
          })

          totalCost += cakeTotalCost
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

                  const massGrams = (massItem.grams || 0) * quantity
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

                  const frostingGrams = (frostingItem.grams || 0) * quantity
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

    // CORREÇÃO: Garantir que os totais sejam números válidos
    setCalculations({
      cakeDetails,
      massGroups,
      frostingGroups,
      totalCost: (totalCost || 0).toFixed(2),
      totalRevenue: (totalRevenue || 0).toFixed(2),
      totalProfit: (totalProfit || 0).toFixed(2)
    })
  }

  const saveAsPNG = async () => {
    if (!resultsRef.current) return

    try {
      // Salvar estado atual das seções
      const originalExpandedState = { ...expandedSections }
      
      // Expandir todas as seções temporariamente
      setExpandedSections({
        cakes: true,
        masses: true,
        frostings: true,
        summary: true
      })

      // Aguardar o React atualizar a UI
      await new Promise(resolve => setTimeout(resolve, 100))

      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: '#1a1b26',
        scale: 2,
        useCORS: true,
        allowTaint: true
      })

      const link = document.createElement('a')
      link.download = `calculo-bolos-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

      // Restaurar estado original das seções
      setExpandedSections(originalExpandedState)

    } catch (error) {
      console.error('Erro ao salvar PNG:', error)
      alert('Erro ao salvar imagem. Tente novamente.')
    }
  }

  // Componente para renderizar os resultados expandidos (sempre aberto no PNG)
  const ResultsForPNG = () => (
    <div className="space-y-4 bg-gray-900 p-4 rounded-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Resultados do Lote de Bolos</h3>
        <div className="text-blue-400 text-sm">
          Gerado em: {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-blue-500/10 rounded-xl">
        <div className="text-center">
          <p className="text-orange-300 text-xs font-semibold">Custo Total</p>
          <p className="text-orange-400 text-lg font-bold">R$ {calculations.totalCost}</p>
        </div>
        <div className="text-center">
          <p className="text-blue-300 text-xs font-semibold">Receita Total</p>
          <p className="text-blue-400 text-lg font-bold">R$ {calculations.totalRevenue}</p>
        </div>
        <div className="text-center">
          <p className="text-green-300 text-xs font-semibold">Lucro Total</p>
          <p className="text-green-400 text-lg font-bold">R$ {calculations.totalProfit}</p>
        </div>
      </div>

      {/* Bolos do Lote - SEMPRE ABERTO no PNG */}
      <div>
        <h4 className="text-white font-semibold text-sm mb-2 border-b border-white/20 pb-1">
          Bolos do Lote ({calculations.cakeDetails.length})
        </h4>
        <div className="space-y-2">
          {calculations.cakeDetails.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
              <div className="flex-1">
                <span className="text-white font-medium text-sm">{item.cake.name}</span>
                <div className="text-white/60 text-xs">
                  {item.quantity} un • R$ {(item.unitCost || 0).toFixed(2)}/un • R$ {(item.totalCost || 0).toFixed(2)} total
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-semibold text-sm">
                  R$ {(item.revenue || 0).toFixed(2)}
                </div>
                <div className="text-green-300 text-xs">
                  Lucro: R$ {(item.profit || 0).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Massas Agrupadas - SEMPRE ABERTO no PNG */}
      {Object.keys(calculations.massGroups).length > 0 && (
        <div>
          <h4 className="text-white font-semibold text-sm mb-2 border-b border-white/20 pb-1">
            Massas Agrupadas ({Object.keys(calculations.massGroups).length})
          </h4>
          <div className="space-y-3">
            {Object.entries(calculations.massGroups).map(([massName, massData]) => {
              const ingredients = calculateMassIngredients(massData.mass, massData.totalGrams)
              const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.grams >= 0.5)

              return (
                <div key={massName} className="p-3 rounded-lg bg-white/5">
                  <h5 className="font-bold text-white text-sm mb-2">{massName}</h5>
                  <p className="text-white/60 text-xs mb-2">
                    Total necessário: <strong>{(massData.totalGrams || 0).toFixed(2)}g</strong>
                  </p>
                  
                  <p className="text-white/60 text-xs mb-1">Bolos que usam esta massa:</p>
                  <div className="space-y-1 mb-3">
                    {massData.cakes.map((cakeItem, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-white/60">
                        <span>{cakeItem.cake.name}</span>
                        <span>
                          {cakeItem.quantity} un • {(cakeItem.grams || 0).toFixed(2)}g
                        </span>
                      </div>
                    ))}
                  </div>

                  {validIngredients.length > 0 ? (
                    <div>
                      <p className="text-white/60 text-xs mb-1">Ingredientes necessários:</p>
                      <div className="space-y-1">
                        {validIngredients.map(([productName, data]) => (
                          <div key={productName} className="flex justify-between text-xs">
                            <span className="text-white">{productName}</span>
                            <span className="text-green-300 font-semibold">
                              {(data.grams || 0).toFixed(2)}g
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/40 text-xs text-center py-1">
                      Quantidades muito pequenas após arredondamento
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Coberturas Agrupadas - SEMPRE ABERTO no PNG */}
      {Object.keys(calculations.frostingGroups).length > 0 && (
        <div>
          <h4 className="text-white font-semibold text-sm mb-2 border-b border-white/20 pb-1">
            Coberturas Agrupadas ({Object.keys(calculations.frostingGroups).length})
          </h4>
          <div className="space-y-3">
            {Object.entries(calculations.frostingGroups).map(([frostingName, frostingData]) => {
              const ingredients = calculateFrostingIngredients(frostingData.frosting, frostingData.totalGrams)
              const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.grams >= 0.5)

              return (
                <div key={frostingName} className="p-3 rounded-lg bg-white/5">
                  <h5 className="font-bold text-white text-sm mb-2">{frostingName}</h5>
                  <p className="text-white/60 text-xs mb-2">
                    Total necessário: <strong>{(frostingData.totalGrams || 0).toFixed(2)}g</strong>
                  </p>
                  
                  <p className="text-white/60 text-xs mb-1">Bolos que usam esta cobertura:</p>
                  <div className="space-y-1 mb-3">
                    {frostingData.cakes.map((cakeItem, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-white/60">
                        <span>{cakeItem.cake.name}</span>
                        <span>
                          {cakeItem.quantity} un • {(cakeItem.grams || 0).toFixed(2)}g
                        </span>
                      </div>
                    ))}
                  </div>

                  {validIngredients.length > 0 ? (
                    <div>
                      <p className="text-white/60 text-xs mb-1">Ingredientes necessários:</p>
                      <div className="space-y-1">
                        {validIngredients.map(([productName, data]) => (
                          <div key={productName} className="flex justify-between text-xs">
                            <span className="text-white">{productName}</span>
                            <span className="text-green-300 font-semibold">
                              {(data.grams || 0).toFixed(2)}g
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/40 text-xs text-center py-1">
                      Quantidades muito pequenas após arredondamento
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Informação sobre arredondamento */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-blue-300 text-xs text-center">
          💡 <strong>Arredondamento aplicado:</strong> Valores abaixo de 0.5g são considerados 0g, 
          valores de 0.5g ou mais são arredondados para 2 casas decimais.
        </p>
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Seleção de Bolos */}
      <GlassCard>
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 flex items-center gap-2">
          <FaCalculator />
          Selecionar Bolos
        </h2>

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {cakes.map(cake => {
            const cakeCost = calculateCakeCost(cake) || 0
            const cakeSalePrice = cake.salePrice || (cakeCost * 3)
            
            return (
              <div key={cake._id} className="flex items-center flex-col md:flex-row justify-between p-4 rounded-2xl bg-white/5">
                <div className="flex-1">
                  <h3 className="font-semibold text-primary">{cake.name}</h3>
                  <p className="text-secondary text-sm">
                    {cake.masses?.length || 0} massa(s) • {cake.frostings?.length || 0} cobertura(s)
                  </p>
                  <div className="text-xs space-y-1 mt-1">
                    <p className="text-orange-400">Custo: R$ {cakeCost.toFixed(2)}</p>
                    <p className="text-green-500 font-semibold">
                      Venda: R$ {cakeSalePrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-2 md:mt-0 flex items-center gap-2">
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
            )
          })}
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
          <h2 className="text-xl md:text-2xl font-bold text-primary">Resultados do Lote</h2>
          {calculations && (
            <div className="flex gap-2">
              <GlassButton onClick={saveAsPNG} variant="secondary" className="text-sm">
                <FaDownload />
                PNG
              </GlassButton>
            </div>
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
                        {item.quantity} un • R$ {(item.unitCost || 0).toFixed(2)}/un • R$ {(item.totalCost || 0).toFixed(2)} total
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-semibold">
                        R$ {(item.revenue || 0).toFixed(2)}
                      </div>
                      <div className="text-green-300 text-xs">
                        Lucro: R$ {(item.profit || 0).toFixed(2)}
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
                          Total necessário: <strong>{(massData.totalGrams || 0).toFixed(2)}g</strong>
                        </p>
                        <p className="text-secondary text-xs">Bolos que usam esta massa:</p>
                        <div className="space-y-1 mt-1">
                          {massData.cakes.map((cakeItem, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-white/60">
                              <span>{cakeItem.cake.name}</span>
                              <span>
                                {cakeItem.quantity} un • {(cakeItem.grams || 0).toFixed(2)}g
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
                                  {(data.grams || 0).toFixed(2)}g
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
                          Total necessário: <strong>{(frostingData.totalGrams || 0).toFixed(2)}g</strong>
                        </p>
                        <p className="text-secondary text-xs">Bolos que usam esta cobertura:</p>
                        <div className="space-y-1 mt-1">
                          {frostingData.cakes.map((cakeItem, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-white/60">
                              <span>{cakeItem.cake.name}</span>
                              <span>
                                {cakeItem.quantity} un • {(cakeItem.grams || 0).toFixed(2)}g
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
                                  {(data.grams || 0).toFixed(2)}g
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

      {/* Componente oculto para o PNG - sempre expandido */}
      {calculations && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div ref={resultsRef}>
            <ResultsForPNG />
          </div>
        </div>
      )}
    </div>
  )
}