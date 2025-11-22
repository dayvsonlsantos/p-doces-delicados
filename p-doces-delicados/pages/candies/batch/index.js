// pages/batch.js - completo com unidades corrigidas
import Layout from '../../../components/Layout/Layout'
import GlassCard from '../../../components/UI/GlassCard'
import GlassButton from '../../../components/UI/GlassButton'
import { useState, useEffect, useRef } from 'react'
import { FaCalculator, FaPlus, FaMinus, FaPrint, FaChevronDown, FaChevronUp, FaDownload } from 'react-icons/fa'
import html2canvas from 'html2canvas'

// Funções de conversão de unidades
const convertUnit = (value, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return value
  
  const conversions = {
    'kg': { 'g': 1000, 'mg': 1000000 },
    'g': { 'kg': 0.001, 'mg': 1000 },
    'mg': { 'kg': 0.000001, 'g': 0.001 },
    'l': { 'ml': 1000, 'cl': 100 },
    'ml': { 'l': 0.001, 'cl': 0.1 },
    'cl': { 'l': 0.01, 'ml': 10 },
    'un': { 'un': 1 }
  }
  
  return value * (conversions[fromUnit]?.[toUnit] || 1)
}

const getDisplayUnit = (unit) => {
  const unitMap = {
    'kg': 'g',
    'g': 'g', 
    'mg': 'g',
    'l': 'ml',
    'ml': 'ml',
    'cl': 'ml',
    'un': 'un'
  }
  return unitMap[unit] || unit
}

const formatQuantity = (value, unit) => {
  const displayUnit = getDisplayUnit(unit)
  const convertedValue = convertUnit(value, unit, displayUnit)
  
  if (displayUnit === 'un') {
    return `${Math.ceil(convertedValue)} ${displayUnit}`
  }
  
  return `${convertedValue.toFixed(2)}${displayUnit}`
}

// Função de arredondamento para gramas
const roundGrams = (grams) => {
  return grams >= 0.5 ? Math.round(grams) : 0
}

export default function BatchCalculator() {
  const [candies, setCandies] = useState([])
  const [masses, setMasses] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCandies, setSelectedCandies] = useState({})
  const [calculations, setCalculations] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    candies: false,
    masses: false,
    summary: false
  })

  const resultsRef = useRef(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [candiesRes, massesRes, productsRes] = await Promise.all([
        fetch('/api/candies'),
        fetch('/api/masses'),
        fetch('/api/products')
      ])

      setCandies(await candiesRes.json())
      setMasses(await massesRes.json())
      setProducts(await productsRes.json())
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const updateQuantity = (candyId, quantity) => {
    setSelectedCandies(prev => ({
      ...prev,
      [candyId]: Math.max(0, quantity)
    }))
  }

  // Função para calcular ingredientes totais de uma massa com unidades CORRIGIDA
  const calculateMassIngredients = (mass, totalGrams) => {
    const scaleFactor = totalGrams / mass.totalGrams
    const ingredients = {}

    mass.ingredients?.forEach(ingredient => {
      const product = products.find(p => p._id === ingredient.productId)
      if (product) {
        let scaledGrams = ingredient.grams * scaleFactor
        
        if (product.unit === 'un') {
          // Para unidades, calcula quantas unidades inteiras são necessárias
          const unitWeight = product.unitWeight || 50
          const units = Math.ceil(scaledGrams / unitWeight)
          if (units > 0) {
            ingredients[product.name] = {
              quantity: units,
              unit: 'un',
              product: product
            }
          }
        } else {
          // Para outros, aplica arredondamento e converte para unidade de display
          scaledGrams = roundGrams(scaledGrams)
          if (scaledGrams >= 0.5) {
            const displayUnit = getDisplayUnit(product.unit)
            const convertedValue = convertUnit(scaledGrams, 'g', displayUnit)
            ingredients[product.name] = {
              quantity: convertedValue,
              unit: displayUnit,
              product: product
            }
          }
        }
      }
    })

    return ingredients
  }

  const calculateBatch = () => {
    const candyDetails = []
    const massGroups = {}
    let totalCost = 0
    let totalRevenue = 0
    let totalProfit = 0

    // Processar cada docinho selecionado
    Object.entries(selectedCandies).forEach(([candyId, quantity]) => {
      if (quantity > 0) {
        const candy = candies.find(c => c._id === candyId)
        if (candy) {
          const candyCost = candy.costPerUnit || 0
          const candyRevenue = candy.salePrice ? parseFloat(candy.salePrice) * quantity : 0
          const candyProfit = candyRevenue - (candyCost * quantity)

          candyDetails.push({
            candy,
            quantity,
            totalCost: candyCost * quantity,
            totalRevenue: candyRevenue,
            totalProfit: candyProfit
          })

          totalCost += candyCost * quantity
          totalRevenue += candyRevenue
          totalProfit += candyProfit

          const candyMasses = candy.masses || [{ massName: candy.massName, grams: candy.candyGrams }]

          candyMasses.forEach(massItem => {
            if (massItem.massName && massItem.grams) {
              const mass = masses.find(m => m.name === massItem.massName)
              if (mass) {
                if (!massGroups[massItem.massName]) {
                  massGroups[massItem.massName] = {
                    mass: mass,
                    totalGrams: 0,
                    candies: []
                  }
                }

                let massGrams = massItem.grams * quantity
                massGrams = roundGrams(massGrams)
                
                massGroups[massItem.massName].totalGrams += massGrams
                massGroups[massItem.massName].candies.push({
                  candy: candy,
                  quantity: quantity,
                  grams: massGrams
                })
              }
            }
          })
        }
      }
    })

    setCalculations({
      candyDetails,
      massGroups,
      totalCost: totalCost.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2),
      totalProfit: totalProfit.toFixed(2)
    })
  }

  const saveAsPNG = async () => {
    if (!resultsRef.current) return

    try {
      const originalExpandedState = { ...expandedSections }
      
      setExpandedSections({
        candies: true,
        masses: true,
        summary: true
      })

      await new Promise(resolve => setTimeout(resolve, 100))

      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: '#1a1b26',
        scale: 2,
        useCORS: true,
        allowTaint: true
      })

      const link = document.createElement('a')
      link.download = `calculo-docinhos-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

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
        <h3 className="text-lg font-bold text-white">Resultados do Lote de Docinhos</h3>
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

      {/* Docinhos do Lote - SEMPRE ABERTO no PNG */}
      <div>
        <h4 className="text-white font-semibold text-sm mb-2 border-b border-white/20 pb-1">
          Docinhos do Lote ({calculations.candyDetails.length})
        </h4>
        <div className="space-y-2">
          {calculations.candyDetails.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
              <div className="flex-1">
                <span className="text-white font-medium text-sm">{item.candy.name}</span>
                <div className="text-white/60 text-xs">
                  {item.quantity} un • R$ {item.totalCost.toFixed(2)} custo
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-semibold text-sm">
                  R$ {item.totalRevenue.toFixed(2)}
                </div>
                <div className="text-green-300 text-xs">
                  Lucro: R$ {item.totalProfit.toFixed(2)}
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
              if (massData.totalGrams < 0.5) return null

              const ingredients = calculateMassIngredients(massData.mass, massData.totalGrams)
              const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.quantity > 0)

              return (
                <div key={massName} className="p-3 rounded-lg bg-white/5">
                  <h5 className="font-bold text-white text-sm mb-2">{massName}</h5>
                  <p className="text-white/60 text-xs mb-2">
                    Total necessário: <strong>{roundGrams(massData.totalGrams)}g</strong>
                  </p>
                  
                  <p className="text-white/60 text-xs mb-1">Docinhos que usam esta massa:</p>
                  <div className="space-y-1 mb-3">
                    {massData.candies.map((candyItem, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-white/60">
                        <span>{candyItem.candy.name}</span>
                        <span>
                          {candyItem.quantity} un • {roundGrams(candyItem.grams)}g
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
                              {data.unit === 'un' 
                                ? `${data.quantity} ${data.unit}`
                                : `${data.quantity}${data.unit}`
                              }
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
            }).filter(Boolean)}
          </div>
        </div>
      )}

      {/* Informação sobre unidades e arredondamento */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-blue-300 text-xs text-center">
          💡 <strong>Unidades convertidas:</strong> Kg → g, L → ml, Unidades mantidas como "un"
        </p>
      </div>
    </div>
  )

  return (
    <Layout activePage="batch">
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-primary mb-2">Calculadora de Lote</h1>
        <p className="text-secondary">Calcule os ingredientes necessários agrupando massas iguais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seleção de Docinhos */}
        <GlassCard>
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            <FaCalculator />
            Selecionar Docinhos
          </h2>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {candies.map(candy => (
              <div key={candy._id} className="flex items-center flex-col md:flex-row justify-between p-4 rounded-2xl bg-white/5 dark:bg-gray-800/50">
                <div className="flex-1">
                  <h3 className="font-semibold text-primary">{candy.name}</h3>
                  <p className="text-secondary text-sm">
                    {candy.candyGrams}g • {candy.masses ? `${candy.masses.length} massa(s)` : '1 massa'}
                  </p>
                  {candy.salePrice && (
                    <p className="text-green-500 text-sm font-semibold">
                      Venda: R$ {parseFloat(candy.salePrice).toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="mt-2 md:mt-0 flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(candy._id, (selectedCandies[candy._id] || 0) - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                  >
                    <FaMinus size={12} />
                  </button>

                  <input
                    type="number"
                    value={selectedCandies[candy._id] || 0}
                    onChange={(e) => updateQuantity(candy._id, parseInt(e.target.value) || 0)}
                    className="w-16 text-center glass-input"
                    min="0"
                  />

                  <button
                    onClick={() => updateQuantity(candy._id, (selectedCandies[candy._id] || 0) + 1)}
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
            disabled={Object.values(selectedCandies).every(qty => qty === 0)}
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

              {/* Docinhos */}
              <div
                className="cursor-pointer"
                onClick={() => toggleSection('candies')}
              >
                <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <h3 className="font-bold text-primary">Docinhos do Lote</h3>
                  {expandedSections.candies ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>

              {expandedSections.candies && (
                <div className="space-y-3 p-4 bg-white/5 rounded-2xl">
                  {calculations.candyDetails.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                      <div>
                        <span className="text-primary font-semibold">{item.candy.name}</span>
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
                    if (massData.totalGrams < 0.5) {
                      return null
                    }

                    const ingredients = calculateMassIngredients(massData.mass, massData.totalGrams)
                    const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.quantity > 0)

                    return (
                      <div key={massName} className="p-4 rounded-xl bg-white/5">
                        <h4 className="font-bold text-primary mb-3">{massName}</h4>

                        <div className="mb-3">
                          <p className="text-secondary text-sm mb-2">
                            Total necessário: <strong>{roundGrams(massData.totalGrams)}g</strong>
                          </p>
                          <p className="text-secondary text-xs">Docinhos que usam esta massa:</p>
                          <div className="space-y-1 mt-1">
                            {massData.candies.map((candyItem, idx) => (
                              <div key={idx} className="flex justify-between text-xs text-white/60">
                                <span>{candyItem.candy.name}</span>
                                <span>
                                  {candyItem.quantity} un • {roundGrams(candyItem.grams)}g
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
                                    {data.unit === 'un' 
                                      ? `${data.quantity} ${data.unit}`
                                      : `${data.quantity}${data.unit}`
                                    }
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
                  }).filter(Boolean)}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 mx-auto mb-4">
                <FaCalculator size={24} />
              </div>
              <p className="text-secondary">Selecione os docinhos e clique em calcular</p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Informação sobre unidades */}
      {calculations && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
          <p className="text-blue-300 text-sm text-center">
            💡 <strong>Unidades convertidas:</strong> Kg → g, L → ml, Unidades mantidas como "un"
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
    </Layout>
  )
}