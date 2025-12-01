// pages/batch.js - COMPLETO COM CUSTO FIXO E EXTRAS (VERSÃO MELHORADA)
import Layout from '../../../components/Layout/Layout'
import GlassCard from '../../../components/UI/GlassCard'
import GlassButton from '../../../components/UI/GlassButton'
import { useState, useEffect, useRef } from 'react'
import { FaCalculator, FaPlus, FaMinus, FaChevronDown, FaChevronUp, FaDownload, FaClock, FaBox, FaList } from 'react-icons/fa'
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

// Função para calcular margem de lucro
const calculateProfitMargin = (cost, salePrice) => {
  if (cost === 0 || salePrice === 0) return { costMargin: 0, profitMargin: 0 };

  const costMargin = (cost / salePrice) * 100;
  const profitMargin = 100 - costMargin;

  return {
    costMargin: costMargin.toFixed(1),
    profitMargin: profitMargin.toFixed(1)
  };
};

export default function BatchCalculator() {
  const [candies, setCandies] = useState([])
  const [masses, setMasses] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCandies, setSelectedCandies] = useState({})
  const [calculations, setCalculations] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    candies: true,
    masses: true,
    extras: true,
    summary: true
  })
  const [fixedCosts, setFixedCosts] = useState([])
  const [totalCostPerMinute, setTotalCostPerMinute] = useState(0)

  const resultsRef = useRef(null)

  useEffect(() => {
    loadData()
    loadFixedCosts()
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

  const loadFixedCosts = async () => {
    try {
      const response = await fetch('/api/fixed-costs')
      const data = await response.json()
      setFixedCosts(data)

      const total = data.reduce((sum, cost) => sum + (parseFloat(cost.costPerMinute) || 0), 0)
      setTotalCostPerMinute(total)
    } catch (error) {
      console.error('Erro ao carregar custos fixos:', error)
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

  // Função para calcular custo com tempo
  const calculateTimeCost = (candy) => {
    if (!candy.preparationTime || totalCostPerMinute === 0) return 0

    const preparationTime = parseFloat(candy.preparationTime) || 0
    return totalCostPerMinute * preparationTime
  }

  // Função para calcular custo total do docinho
  const calculateCandyCost = (candy) => {
    const materialCost = candy.costPerUnit || 0
    const timeCost = calculateTimeCost(candy)
    const totalCost = materialCost + timeCost

    return {
      materialCost,
      timeCost,
      totalCost
    }
  }

  // Função para calcular ingredientes totais de uma massa
  const calculateMassIngredients = (mass, totalGrams) => {
    if (!mass || !mass.ingredients) return {}

    const scaleFactor = totalGrams / mass.totalGrams
    const ingredients = {}

    mass.ingredients.forEach(ingredient => {
      const product = products.find(p => p._id === ingredient.productId)
      if (product) {
        const scaledGrams = ingredient.grams * scaleFactor

        if (product.unit === 'un') {
          const unitWeight = product.unitWeight || 50
          const units = Math.ceil(scaledGrams / unitWeight)
          if (units > 0) {
            ingredients[product.name] = {
              quantity: units,
              unit: 'un',
              product: product,
              grams: scaledGrams
            }
          }
        } else {
          const displayUnit = getDisplayUnit(product.unit)
          const convertedValue = convertUnit(scaledGrams, 'g', displayUnit)
          if (convertedValue >= 0.5) {
            ingredients[product.name] = {
              quantity: Math.round(convertedValue * 100) / 100,
              unit: displayUnit,
              product: product,
              grams: scaledGrams
            }
          }
        }
      }
    })

    return ingredients
  }

  // Função para calcular extras e insumos
  const calculateExtrasIngredients = (candy, quantity) => {
    const extras = {}

    if (candy.extras && candy.extras.length > 0) {
      candy.extras.forEach(extra => {
        const product = products.find(p => p._id === extra.productId)
        if (product) {
          let totalGrams = extra.grams * quantity

          if (product.unit === 'un') {
            const unitWeight = product.unitWeight || 50
            const units = Math.ceil(totalGrams / unitWeight)
            if (units > 0) {
              extras[product.name] = {
                quantity: units,
                unit: 'un',
                product: product,
                candy: candy.name,
                quantityPerCandy: extra.grams,
                totalGrams: totalGrams
              }
            }
          } else {
            totalGrams = roundGrams(totalGrams)
            if (totalGrams >= 0.5) {
              const displayUnit = getDisplayUnit(product.unit)
              const convertedValue = convertUnit(totalGrams, 'g', displayUnit)
              extras[product.name] = {
                quantity: convertedValue,
                unit: displayUnit,
                product: product,
                candy: candy.name,
                quantityPerCandy: extra.grams,
                totalGrams: totalGrams
              }
            }
          }
        }
      })
    }

    return extras
  }

  // Função para calcular ingredientes consolidados
  const calculateConsolidatedIngredients = (massGroups, extrasGroups = {}) => {
    const allIngredients = {}

    // Processar ingredientes das massas
    Object.values(massGroups).forEach(massData => {
      const ingredients = calculateMassIngredients(massData.mass, massData.totalGrams)
      Object.entries(ingredients).forEach(([productName, data]) => {
        if (!allIngredients[productName]) {
          allIngredients[productName] = { ...data }
        } else {
          allIngredients[productName].quantity += data.quantity
          allIngredients[productName].grams += data.grams
        }
      })
    })

    // Processar ingredientes dos extras
    Object.values(extrasGroups).forEach(extraData => {
      const product = extraData.product
      if (product) {
        const totalGrams = extraData.totalGrams || 0
        let quantity = 0
        let unit = ''

        if (product.unit === 'un') {
          const unitWeight = product.unitWeight || 50
          quantity = Math.ceil(totalGrams / unitWeight)
          unit = 'un'
        } else {
          const displayUnit = getDisplayUnit(product.unit)
          quantity = convertUnit(totalGrams, 'g', displayUnit)
          unit = displayUnit
        }

        if (quantity > 0) {
          if (!allIngredients[product.name]) {
            allIngredients[product.name] = {
              quantity: quantity,
              unit: unit,
              product: product,
              grams: totalGrams
            }
          } else {
            allIngredients[product.name].quantity += quantity
            allIngredients[product.name].grams += totalGrams
          }
        }
      }
    })

    return allIngredients
  }

  const calculateBatch = () => {
    const candyDetails = []
    const massGroups = {}
    const extrasGroups = {}
    let totalMaterialCost = 0
    let totalTimeCost = 0
    let totalCost = 0
    let totalRevenue = 0
    let totalProfit = 0

    // Processar cada docinho selecionado
    Object.entries(selectedCandies).forEach(([candyId, quantity]) => {
      if (quantity > 0) {
        const candy = candies.find(c => c._id === candyId)
        if (candy) {
          const costBreakdown = calculateCandyCost(candy)
          const candyMaterialCost = costBreakdown.materialCost * quantity
          const candyTimeCost = costBreakdown.timeCost
          const candyTotalCost = costBreakdown.totalCost * quantity

          const candyRevenue = candy.salePrice ? parseFloat(candy.salePrice) * quantity : 0
          const candyProfit = candyRevenue - candyTotalCost

          candyDetails.push({
            candy,
            quantity,
            materialCost: candyMaterialCost,
            timeCost: candyTimeCost,
            totalCost: candyTotalCost,
            totalRevenue: candyRevenue,
            totalProfit: candyProfit
          })

          totalMaterialCost += candyMaterialCost
          totalTimeCost += candyTimeCost
          totalCost += candyTotalCost
          totalRevenue += candyRevenue
          totalProfit += candyProfit

          // Processar massas - CORRIGIDO para lidar com múltiplas massas
          const candyMasses = candy.masses || []
          if (candyMasses.length === 0 && candy.massName && candy.candyGrams) {
            candyMasses.push({ massName: candy.massName, grams: candy.candyGrams })
          }

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

                const massGrams = massItem.grams * quantity
                massGroups[massItem.massName].totalGrams += massGrams
                massGroups[massItem.massName].candies.push({
                  candy: candy,
                  quantity: quantity,
                  grams: massGrams,
                  gramsPerUnit: massItem.grams
                })
              }
            }
          })

          // Processar extras e insumos
          const candyExtras = calculateExtrasIngredients(candy, quantity)
          Object.entries(candyExtras).forEach(([productName, extraData]) => {
            if (!extrasGroups[productName]) {
              extrasGroups[productName] = {
                product: extraData.product,
                totalQuantity: extraData.quantity,
                totalGrams: extraData.totalGrams,
                unit: extraData.unit,
                candies: []
              }
            } else {
              extrasGroups[productName].totalQuantity += extraData.quantity
              extrasGroups[productName].totalGrams += extraData.totalGrams
            }

            extrasGroups[productName].candies.push({
              candy: candy,
              quantity: quantity,
              quantityPerCandy: extraData.quantityPerCandy,
              totalQuantity: extraData.quantity
            })
          })
        }
      }
    })

    // Calcular ingredientes consolidados
    const consolidatedIngredients = calculateConsolidatedIngredients(massGroups, extrasGroups)

    setCalculations({
      candyDetails,
      massGroups,
      extrasGroups,
      consolidatedIngredients,
      totalMaterialCost: totalMaterialCost.toFixed(2),
      totalTimeCost: totalTimeCost.toFixed(2),
      totalCost: totalCost.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2),
      totalProfit: totalProfit.toFixed(2)
    })
  }

  const saveAsPNG = async () => {
    if (!resultsRef.current) return

    try {
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      })

      const link = document.createElement('a')
      link.download = `calculo-lote-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

    } catch (error) {
      console.error('Erro ao salvar PNG:', error)
      alert('Erro ao salvar imagem. Tente novamente.')
    }
  }

  // Componente para renderizar os resultados no PNG (tema escuro, compacto, texto PERFEITAMENTE CENTRALIZADO VERTICALMENTE)
  const ResultsForPNG = () => (
    <div className="space-y-4 p-4 bg-gray-900 text-gray-200" style={{ minWidth: '800px', fontFamily: 'Arial, sans-serif' }}>
      {/* Cabeçalho */}
      <div className="text-center border-b-2 border-blue-500 pb-3 mb-4">
        <h1 className="text-2xl font-bold text-white">Cálculo de Lote de Docinhos</h1>
        <p className="text-gray-400 text-sm">
          Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Resumo Financeiro - Texto Perfeitamente Centralizado */}
      <div className="grid grid-cols-4 gap-3 p-3 bg-blue-900/30 rounded-lg border border-blue-700/50" style={{ height: '85px' }}>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex flex-col items-center justify-center space-y-1">
            <p className="text-xs font-semibold text-blue-300">Custo Total</p>
            <p className="text-lg font-bold text-blue-200">R$ {calculations.totalCost}</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex flex-col items-center justify-center space-y-1">
            <p className="text-xs font-semibold text-green-300">Receita Total</p>
            <p className="text-lg font-bold text-green-200">R$ {calculations.totalRevenue}</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex flex-col items-center justify-center space-y-1">
            <p className="text-xs font-semibold text-emerald-300">Lucro Total</p>
            <p className="text-lg font-bold text-emerald-200">R$ {calculations.totalProfit}</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex flex-col items-center justify-center space-y-1">
            <p className="text-xs font-semibold text-purple-300">Margem</p>
            <p className="text-lg font-bold text-purple-200">
              {calculations.totalRevenue > 0
                ? (100 - (parseFloat(calculations.totalCost) / parseFloat(calculations.totalRevenue) * 100)).toFixed(1)
                : '0'}%
            </p>
          </div>
        </div>
      </div>

      {/* Docinhos do Lote */}
      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-purple-900/30 p-3 border-b border-purple-700/50">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FaList className="w-4 h-4" />
            Docinhos do Lote ({calculations.candyDetails.length})
          </h2>
        </div>
        <div className="p-3 space-y-3">
          {calculations.candyDetails.map((item, idx) => {
            const marginInfo = calculateProfitMargin(item.totalCost || 0, item.totalRevenue || 0);

            return (
              <div key={idx} className="border border-gray-700 rounded-lg p-3 bg-gray-800/50">
                {/* Linha superior com nome e valores - alinhada verticalmente */}
                <div className="flex items-center justify-between mb-3" style={{ height: '45px' }}>
                  <div className="flex flex-col justify-center h-full">
                    <h3 className="font-bold text-white text-sm">{item.candy.name}</h3>
                    <p className="text-gray-400 text-xs mt-1">
                      {item.quantity} unidades • R$ {(item.totalCost / item.quantity).toFixed(2)}/un
                    </p>
                  </div>
                  <div className="flex flex-col justify-center h-full text-right">
                    <div className="text-green-300 font-bold text-base">R$ {item.totalRevenue.toFixed(2)}</div>
                    <div className="text-emerald-300 text-xs">Lucro: R$ {item.totalProfit.toFixed(2)}</div>
                  </div>
                </div>

                {/* Grid de valores - centralizado verticalmente */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center justify-center flex-col p-2 bg-orange-900/30 rounded border border-orange-700/50" style={{ height: '60px' }}>
                    <p className="text-orange-300 font-semibold">Materiais</p>
                    <p className="text-orange-200 font-bold text-sm mt-1">R$ {item.materialCost.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-center flex-col p-2 bg-purple-900/30 rounded border border-purple-700/50" style={{ height: '60px' }}>
                    <p className="text-purple-300 font-semibold">Tempo</p>
                    <p className="text-purple-200 font-bold text-sm mt-1">R$ {item.timeCost.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-center flex-col p-2 bg-blue-900/30 rounded border border-blue-700/50" style={{ height: '60px' }}>
                    <p className="text-blue-300 font-semibold">Margem</p>
                    <p className="text-blue-200 font-bold text-sm mt-1">{marginInfo.profitMargin}%</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Massas Agrupadas */}
      {Object.keys(calculations.massGroups).length > 0 && (
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-yellow-900/30 p-3 border-b border-yellow-700/50">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FaBox className="w-4 h-4" />
              Massas Utilizadas ({Object.keys(calculations.massGroups).length})
            </h2>
          </div>
          <div className="p-3 space-y-4">
            {Object.entries(calculations.massGroups).map(([massName, massData]) => {
              const ingredients = calculateMassIngredients(massData.mass, massData.totalGrams)
              const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.quantity > 0)

              return (
                <div key={massName} className="border border-gray-700 rounded-lg p-3 bg-gray-800/50">
                  {/* Cabeçalho da massa */}
                  <div className="flex items-center justify-between mb-3" style={{ height: '45px' }}>
                    <div className="flex flex-col justify-center">
                      <h3 className="font-bold text-white text-sm">{massName}</h3>
                      <p className="text-gray-400 text-xs">
                        Total: <span className="font-bold text-blue-300">{(massData.totalGrams || 0).toFixed(0)}g</span>
                      </p>
                    </div>
                    <div className="flex flex-col justify-center text-right">
                      <p className="text-xs text-gray-400">Docinhos que usam:</p>
                      <p className="font-medium text-gray-300 text-xs">{massData.candies.length} tipo(s)</p>
                    </div>
                  </div>

                  {/* Detalhes dos docinhos - centralizado verticalmente */}
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-300 mb-2 text-xs">📋 Docinhos específicos:</h4>
                    <div className="space-y-2">
                      {massData.candies.map((candyItem, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-900/50 rounded border border-gray-700" style={{ height: '45px' }}>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-200 text-sm">{candyItem.candy.name}</span>
                          </div>
                          <div className="flex flex-col justify-center text-right">
                            <div className="text-xs text-gray-400">{candyItem.quantity} unidades</div>
                            <div className="text-xs font-semibold text-blue-300">
                              {candyItem.gramsPerUnit}g/un • Total: {candyItem.grams.toFixed(0)}g
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ingredientes - centralizado verticalmente */}
                  {validIngredients.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-2 text-xs">🧾 Ingredientes para esta massa:</h4>
                      <div className="space-y-2">
                        {validIngredients.map(([productName, data]) => (
                          <div key={productName} className="flex items-center justify-between p-2 bg-gray-900/50 rounded border border-gray-700" style={{ height: '40px' }}>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-200 text-sm">{productName}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-bold text-green-300 text-sm">
                                {data.unit === 'un'
                                  ? `${data.quantity} ${data.unit}`
                                  : `${data.quantity}${data.unit}`
                                }
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Extras e Insumos */}
      {calculations.extrasGroups && Object.keys(calculations.extrasGroups).length > 0 && (
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-purple-900/30 p-3 border-b border-purple-700/50">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              🎁 Extras e Insumos ({Object.keys(calculations.extrasGroups).length})
            </h2>
          </div>
          <div className="p-3 space-y-3">
            {Object.entries(calculations.extrasGroups).map(([productName, extraData]) => (
              <div key={productName} className="border border-gray-700 rounded-lg p-3 bg-gray-800/50">
                {/* Cabeçalho do extra */}
                <div className="flex items-center justify-between mb-3" style={{ height: '40px' }}>
                  <div className="flex items-center">
                    <h3 className="font-bold text-white text-sm">{productName}</h3>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold text-green-300 text-base">
                      {extraData.unit === 'un'
                        ? `${extraData.totalQuantity} ${extraData.unit}`
                        : `${extraData.totalQuantity}${extraData.unit}`
                      }
                    </span>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-300 mb-2 text-xs">Utilizado nos docinhos:</h4>
                <div className="space-y-2">
                  {extraData.candies.map((candyItem, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-900/50 rounded border border-gray-700" style={{ height: '40px' }}>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-200 text-sm">{candyItem.candy.name}</span>
                      </div>
                      <div className="flex flex-col justify-center text-right">
                        <div className="text-xs text-gray-400">{candyItem.quantity} unidades</div>
                        <div className="text-xs font-semibold text-blue-300">
                          {extraData.unit === 'un'
                            ? `${candyItem.totalQuantity} ${extraData.unit}`
                            : `${candyItem.totalQuantity}${extraData.unit}`
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ingredientes Consolidados - PERFEITAMENTE CENTRALIZADO */}
      {calculations.consolidatedIngredients && Object.keys(calculations.consolidatedIngredients).length > 0 && (
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-green-900/30 p-3 border-b border-green-700/50">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              📦 Ingredientes Consolidados ({Object.keys(calculations.consolidatedIngredients).length})
            </h2>
            <p className="text-gray-400 text-xs mt-1">Soma total de todos os ingredientes necessários</p>
          </div>
          <div className="p-3">
            <div className="space-y-2">
              {Object.entries(calculations.consolidatedIngredients).map(([productName, data]) => (
                <div key={productName} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700" style={{ height: '45px' }}>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-200 text-sm">{productName}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold text-green-300 text-sm">
                      {data.unit === 'un'
                        ? `${data.quantity} ${data.unit}`
                        : `${data.quantity}${data.unit}`
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rodapé */}
      <div className="border-t border-gray-700 pt-3 mt-4 text-center text-gray-400 text-xs">
        <p>💡 Sistema gerado automaticamente • Quantidades em gramas por unidade especificadas</p>
        <p className="mt-1">Total de docinhos selecionados: {Object.values(selectedCandies).reduce((sum, qty) => sum + qty, 0)} unidades</p>
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
            {candies.map(candy => {
              const costBreakdown = calculateCandyCost(candy)
              const candySalePrice = candy.salePrice || (costBreakdown.totalCost * 3)

              return (
                <div key={candy._id} className="flex items-center flex-col md:flex-row justify-between p-4 rounded-2xl bg-white/5">
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary">{candy.name}</h3>
                    <p className="text-secondary text-sm">
                      {candy.candyGrams}g • {candy.masses ? `${candy.masses.length} massa(s)` : '1 massa'}
                      {candy.extras && candy.extras.length > 0 && (
                        <span className="text-blue-400 ml-2">
                          • {candy.extras.length} extra(s)
                        </span>
                      )}
                      {candy.preparationTime > 0 && (
                        <span className="text-purple-400 ml-2">
                          • {candy.preparationTime}min
                        </span>
                      )}
                    </p>
                    <div className="text-xs space-y-1 mt-1">
                      <div className="flex justify-between">
                        <span className="text-orange-400">Materiais:</span>
                        <span className="text-orange-300">R$ {costBreakdown.materialCost.toFixed(2)}</span>
                      </div>
                      {costBreakdown.timeCost > 0 && (
                        <div className="flex justify-between">
                          <span className="text-purple-400">Custo Tempo:</span>
                          <span className="text-purple-300">R$ {costBreakdown.timeCost.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-white/20 pt-1">
                        <span className="text-white font-semibold">Total:</span>
                        <span className="text-white font-bold">R$ {costBreakdown.totalCost.toFixed(2)}</span>
                      </div>
                      {candy.salePrice && (
                        <p className="text-green-500 font-semibold">
                          Venda: R$ {candySalePrice.toFixed(2)}
                        </p>
                      )}
                    </div>
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
              )
            })}
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
                <div className="space-y-4 p-4 bg-white/5 rounded-2xl">
                  {/* Grid de Custos Detalhados */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-orange-500/10 rounded-xl">
                      <p className="text-orange-300 text-sm font-semibold">Custo Materiais</p>
                      <p className="text-orange-400 text-2xl font-bold">R$ {calculations.totalMaterialCost}</p>
                    </div>

                    <div className="text-center p-3 bg-purple-500/10 rounded-xl">
                      <p className="text-purple-300 text-sm font-semibold">Custo Tempo</p>
                      <p className="text-purple-400 text-2xl font-bold">R$ {calculations.totalTimeCost}</p>
                    </div>

                    <div className="text-center p-3 bg-red-500/10 rounded-xl">
                      <p className="text-red-300 text-sm font-semibold">Custo Total</p>
                      <p className="text-red-400 text-2xl font-bold">R$ {calculations.totalCost}</p>
                    </div>
                  </div>

                  {/* Grid de Receita e Lucro */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-500/10 rounded-xl">
                      <p className="text-blue-300 text-sm font-semibold">Receita Total</p>
                      <p className="text-blue-400 text-2xl font-bold">R$ {calculations.totalRevenue}</p>
                    </div>

                    <div className="text-center p-3 bg-green-500/10 rounded-xl">
                      <p className="text-green-300 text-sm font-semibold">Lucro Total</p>
                      <p className="text-green-400 text-2xl font-bold">R$ {calculations.totalProfit}</p>
                    </div>
                  </div>

                  {/* Margem de Lucro */}
                  <div className="text-center p-3 bg-purple-500/10 rounded-xl">
                    <p className="text-purple-300 text-sm font-semibold">Margem de Lucro</p>
                    <p className="text-purple-400 text-2xl font-bold">
                      {calculations.totalRevenue > 0
                        ? (100 - (parseFloat(calculations.totalCost) / parseFloat(calculations.totalRevenue) * 100)).toFixed(1)
                        : '0'
                      }%
                    </p>
                    <p className="text-purple-300 text-xs">
                      Custo: {calculations.totalRevenue > 0
                        ? ((parseFloat(calculations.totalCost) / parseFloat(calculations.totalRevenue) * 100)).toFixed(1)
                        : '0'
                      }%
                    </p>
                  </div>
                </div>
              )}

              {/* Docinhos */}
              <div
                className="cursor-pointer"
                onClick={() => toggleSection('candies')}
              >
                <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <FaList className="w-4 h-4" />
                    Docinhos do Lote ({calculations.candyDetails.length})
                  </h3>
                  {expandedSections.candies ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>

              {expandedSections.candies && (
                <div className="space-y-3 p-4 bg-white/5 rounded-2xl">
                  {calculations.candyDetails.map((item, idx) => {
                    const marginInfo = calculateProfitMargin(item.totalCost || 0, item.totalRevenue || 0);

                    return (
                      <div key={idx} className="p-3 rounded-xl bg-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <span className="text-primary font-semibold text-sm">{item.candy.name}</span>
                            <div className="text-secondary text-xs">
                              {item.quantity} un • R$ {(item.totalCost / item.quantity).toFixed(2)}/un
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
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <p className="text-orange-400">Materiais</p>
                            <p className="text-orange-300">R$ {item.materialCost.toFixed(2)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-purple-400">Tempo</p>
                            <p className="text-purple-300">R$ {item.timeCost.toFixed(2)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-blue-400">Margem</p>
                            <p className="text-blue-300">{marginInfo.profitMargin}%</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Massas Agrupadas */}
              <div
                className="cursor-pointer"
                onClick={() => toggleSection('masses')}
              >
                <div className="flex items-center justify-between p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <FaBox className="w-4 h-4" />
                    Massas Utilizadas ({Object.keys(calculations.massGroups).length})
                  </h3>
                  {expandedSections.masses ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>

              {expandedSections.masses && (
                <div className="space-y-4 p-4 bg-white/5 rounded-2xl">
                  {Object.entries(calculations.massGroups).map(([massName, massData]) => {
                    const ingredients = calculateMassIngredients(massData.mass, massData.totalGrams)
                    const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.quantity > 0)

                    return (
                      <div key={massName} className="p-4 rounded-xl bg-white/5">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-primary text-sm">{massName}</h4>
                          <span className="text-yellow-300 font-bold text-sm">
                            Total: {(massData.totalGrams || 0).toFixed(0)}g
                          </span>
                        </div>

                        {/* Detalhes dos docinhos que usam esta massa */}
                        <div className="mb-3">
                          <p className="text-secondary text-xs mb-1">Docinhos que usam esta massa:</p>
                          <div className="space-y-1">
                            {massData.candies.map((candyItem, idx) => (
                              <div key={idx} className="flex justify-between text-xs text-white/60">
                                <span>{candyItem.candy.name}</span>
                                <span className="text-yellow-300">
                                  {candyItem.quantity} un • {candyItem.gramsPerUnit}g/un
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {validIngredients.length > 0 ? (
                          <div>
                            <p className="text-secondary text-xs mb-1">Ingredientes necessários:</p>
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
                          <p className="text-secondary text-xs text-center py-1">
                            Quantidades muito pequenas após arredondamento
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Extras e Insumos */}
              <div
                className="cursor-pointer"
                onClick={() => toggleSection('extras')}
              >
                <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    🎁 Extras e Insumos ({Object.keys(calculations.extrasGroups).length})
                  </h3>
                  {expandedSections.extras ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>

              {expandedSections.extras && (
                <div className="space-y-4 p-4 bg-white/5 rounded-2xl">
                  {Object.entries(calculations.extrasGroups).map(([productName, extraData]) => (
                    <div key={productName} className="p-4 rounded-xl bg-white/5">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-primary text-sm">{productName}</h4>
                        <span className="text-green-300 font-semibold text-sm">
                          {extraData.unit === 'un'
                            ? `${extraData.totalQuantity} ${extraData.unit}`
                            : `${extraData.totalQuantity}${extraData.unit}`
                          }
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="text-secondary text-xs mb-2">Utilizado em:</p>
                        <div className="space-y-1">
                          {extraData.candies.map((candyItem, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-white/60">
                              <span>{candyItem.candy.name}</span>
                              <span>
                                {candyItem.quantity} un •
                                {extraData.unit === 'un'
                                  ? ` ${candyItem.totalQuantity} ${extraData.unit}`
                                  : ` ${candyItem.totalQuantity}${extraData.unit}`
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Ingredientes Consolidados */}
              {calculations.consolidatedIngredients && Object.keys(calculations.consolidatedIngredients).length > 0 && (
                <>
                  <div
                    className="cursor-pointer"
                    onClick={() => toggleSection('ingredients')}
                  >
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                      <h3 className="font-bold text-primary flex items-center gap-2">
                        📦 Ingredientes Consolidados ({Object.keys(calculations.consolidatedIngredients).length})
                      </h3>
                      {expandedSections.ingredients ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </div>

                  {expandedSections.ingredients && (
                    <div className="p-4 bg-white/5 rounded-2xl">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(calculations.consolidatedIngredients).map(([productName, data]) => (
                          <div key={productName} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                            <span className="text-white font-medium text-sm">{productName}</span>
                            <span className="text-green-300 font-semibold text-sm">
                              {data.unit === 'un'
                                ? `${data.quantity} ${data.unit}`
                                : `${data.quantity}${data.unit}`
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
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