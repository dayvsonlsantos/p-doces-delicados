import Modal from '../UI/Modal'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect, useRef } from 'react'
import { FaCalculator, FaCheck, FaTimes, FaSearch, FaChevronDown, FaChevronUp, FaDownload, FaBox, FaList, FaCalendar } from 'react-icons/fa'
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

// Função para calcular margem de lucro
const calculateProfitMargin = (totalCost, salePrice) => {
  if (totalCost === 0 || salePrice === 0) return { costMargin: 0, profitMargin: 0 };

  const costMargin = (totalCost / salePrice) * 100;
  const profitMargin = 100 - costMargin;

  return {
    costMargin: costMargin.toFixed(1),
    profitMargin: profitMargin.toFixed(1)
  };
};

// Função de arredondamento para gramas
const roundGrams = (grams) => {
  return grams >= 0.5 ? Math.round(grams) : 0
}

export default function CalculatorModal({
  isOpen,
  onClose,
  orders = [],
  candies = [],
  cakes = [],
  masses = [],
  cakeFrostings = [],
  products = []
}) {
  const [selectedType, setSelectedType] = useState('docinhos')
  const [expandedOrders, setExpandedOrders] = useState({})
  const [selectedItems, setSelectedItems] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [calculations, setCalculations] = useState(null)
  const [expandedResults, setExpandedResults] = useState({
    items: true,
    masses: true,
    frostings: true,
    extras: true,
    ingredients: true
  })
  const [dateFilter, setDateFilter] = useState('next10')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [fixedCosts, setFixedCosts] = useState([])
  const [totalCostPerMinute, setTotalCostPerMinute] = useState(0)

  const resultsRef = useRef(null)
  const startDateRef = useRef(null)
  const endDateRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      setSelectedType('docinhos')
      setExpandedOrders({})
      setSelectedItems({})
      setSearchTerm('')
      setCalculations(null)
      setExpandedResults({
        items: true,
        masses: true,
        frostings: true,
        extras: true,
        ingredients: true
      })
      setDateFilter('next10')
      setCustomStartDate('')
      setCustomEndDate('')
      setShowCustomDate(false)
    } else {
      const today = new Date()
      const tenDaysLater = new Date()
      tenDaysLater.setDate(today.getDate() + 10)

      setCustomStartDate(today.toISOString().split('T')[0])
      setCustomEndDate(tenDaysLater.toISOString().split('T')[0])
      loadFixedCosts()
    }
  }, [isOpen])

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

  // FUNÇÃO CORRIGIDA: Calcular custo de ingrediente
  const calculateIngredientCost = (ingredient) => {
    if (!ingredient || !ingredient.productId || !ingredient.grams) return 0

    const product = products.find(p => p._id === ingredient.productId)
    if (!product) {
      console.log('❌ Produto não encontrado para ingrediente:', ingredient.productId)
      return 0
    }

    const ingredientGrams = parseFloat(ingredient.grams)

    if (product.unit === 'un') {
      const unitWeight = product.unitWeight || 50
      const units = ingredientGrams / unitWeight
      const cost = units * (product.unitCost || 0)
      return cost
    } else {
      const cost = ingredientGrams * (product.baseUnitCost || 0)
      return cost
    }
  }

  // FUNÇÃO CORRIGIDA: Calcular custo de massa/cobertura
  const calculateMassOrFrostingCost = (item) => {
    if (!item || !item.ingredients) {
      console.log('❌ Item sem ingredientes:', item?.name)
      return 0
    }

    const totalCost = item.ingredients.reduce((total, ingredient) => {
      const cost = calculateIngredientCost(ingredient)
      return total + cost
    }, 0)

    return totalCost
  }

  const calculateTimeCost = (product) => {
    if (!product.preparationTime || totalCostPerMinute === 0) return 0

    const preparationTime = parseFloat(product.preparationTime) || 0
    return totalCostPerMinute * preparationTime
  }

  // Função para calcular custo do docinho CORRIGIDA
  const calculateCandyCost = (candy) => {
    if (!candy) return { materialCost: 0, timeCost: 0, totalCost: 0 }

    const materialCost = candy.costPerUnit || 0
    const timeCost = calculateTimeCost(candy)

    return {
      materialCost,
      timeCost,
      totalCost: materialCost + timeCost
    }
  }

  // NOVA FUNÇÃO: Calcular extras e insumos
  const calculateExtrasIngredients = (product, quantity, productType) => {
    const extras = {}
    
    if (product.extras && product.extras.length > 0) {
      product.extras.forEach(extra => {
        const extraProduct = products.find(p => p._id === extra.productId)
        if (extraProduct) {
          let totalGrams = extra.grams * quantity
          
          if (extraProduct.unit === 'un') {
            const unitWeight = extraProduct.unitWeight || 50
            const units = Math.ceil(totalGrams / unitWeight)
            if (units > 0) {
              extras[extraProduct.name] = {
                quantity: units,
                unit: 'un',
                product: extraProduct,
                productName: product.name,
                quantityPerUnit: extra.grams,
                totalGrams: totalGrams
              }
            }
          } else {
            totalGrams = roundGrams(totalGrams)
            if (totalGrams >= 0.5) {
              const displayUnit = getDisplayUnit(extraProduct.unit)
              const convertedValue = convertUnit(totalGrams, 'g', displayUnit)
              extras[extraProduct.name] = {
                quantity: convertedValue,
                unit: displayUnit,
                product: extraProduct,
                productName: product.name,
                quantityPerUnit: extra.grams,
                totalGrams: totalGrams
              }
            }
          }
        }
      })
    }

    return extras
  }

  // Limpar seleção quando mudar o tipo
  useEffect(() => {
    if (isOpen) {
      setSelectedItems({})
    }
  }, [selectedType, isOpen])

  // Debug para verificar dados
  useEffect(() => {
    if (isOpen) {
      console.log('🎯 CalculatorModal - Dados recebidos:', {
        selectedType,
        orders: orders.length,
        candies: candies.length,
        cakes: cakes.length,
        masses: masses.length,
        cakeFrostings: cakeFrostings.length,
        products: products.length
      })

      // Debug dos bolos
      if (selectedType === 'bolos' && cakes.length > 0) {
        console.log('🎂 Estrutura do primeiro bolo:', cakes[0])
        console.log('📦 Massas disponíveis:', masses.map(m => m.name))
      }
    }
  }, [isOpen, selectedType, orders, candies, cakes, masses, cakeFrostings, products])

  // Filtrar encomendas por tipo, termo de busca e data
  const filteredOrders = orders.filter(order => {
    const matchesType = !selectedType ||
      order.type === selectedType ||
      order.type === 'ambos'

    const matchesSearch = !searchTerm ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro por data
    const orderDate = new Date(order.deliveryDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let matchesDate = true

    if (dateFilter === 'last4') {
      const fourDaysAgo = new Date(today)
      fourDaysAgo.setDate(today.getDate() - 4)
      matchesDate = orderDate >= fourDaysAgo && orderDate <= today
    } else if (dateFilter === 'next10') {
      const tenDaysLater = new Date(today)
      tenDaysLater.setDate(today.getDate() + 10)
      matchesDate = orderDate >= today && orderDate <= tenDaysLater
    } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
      const startDate = new Date(customStartDate)
      const endDate = new Date(customEndDate)
      endDate.setHours(23, 59, 59, 999)
      matchesDate = orderDate >= startDate && orderDate <= endDate
    } else if (dateFilter === 'all') {
      matchesDate = true
    }

    return matchesSearch && matchesType && matchesDate
  })

  // FUNÇÃO CORRIGIDA: Obter as massas do produto
  const getProductMasses = (product, productType) => {
    if (!product) return []

    console.log(`🔍 Buscando massas para "${product.name}" (${productType}):`, product)

    if (productType === 'docinhos') {
      // Para docinhos: verificar múltiplas formas de obter massas
      if (product.masses && Array.isArray(product.masses) && product.masses.length > 0) {
        console.log('✅ Docinho - Usando masses array')
        return product.masses
      } else if (product.massName && product.candyGrams) {
        console.log('✅ Docinho - Usando formato antigo (massName + candyGrams)')
        return [{
          massName: product.massName,
          grams: product.candyGrams
        }]
      } else if (product.recipe && product.recipe.massName && product.recipe.gramsPerUnit) {
        console.log('✅ Docinho - Usando formato recipe')
        return [{
          massName: product.recipe.massName,
          grams: product.recipe.gramsPerUnit
        }]
      } else {
        console.log('❌ Nenhum formato de massa encontrado para docinho')
        return []
      }
    } else if (productType === 'bolos') {
      // Para bolos: usar masses do produto
      if (product.masses && Array.isArray(product.masses) && product.masses.length > 0) {
        console.log('✅ Bolo - Usando masses array do produto:', product.masses)
        return product.masses
      } else if (product.recipe && product.recipe.masses) {
        console.log('✅ Bolo - Usando recipe masses')
        return product.recipe.masses
      } else {
        console.log('❌ Nenhuma massa encontrada para bolo')
        return []
      }
    }

    return []
  }

  // FUNÇÃO MELHORADA: Encontrar massa pelo nome
  const findMassByName = (massName) => {
    // Primeiro, procurar exatamente pelo nome
    let mass = masses.find(m => m.name === massName)

    if (!mass) {
      console.log(`⚠️ Massa "${massName}" não encontrada exatamente, procurando por similaridade...`)
      // Tentar encontrar por similaridade (case insensitive, contém)
      mass = masses.find(m =>
        m.name.toLowerCase().includes(massName.toLowerCase()) ||
        massName.toLowerCase().includes(m.name.toLowerCase())
      )
    }

    // SE AINDA NÃO ENCONTRAR, CRIAR UMA MASSA FALLBACK
    if (!mass) {
      console.log(`🔄 Criando massa fallback para: ${massName}`)
      mass = {
        _id: `fallback-${massName.toLowerCase().replace(/\s+/g, '-')}`,
        name: massName,
        totalGrams: 1000,
        ingredients: [
          {
            productId: 'default-ingredient-1',
            productName: 'Ingrediente Base',
            grams: 500
          }
        ],
        cost: 25.00 // Custo estimado
      }
    }

    return mass
  }

  // Função para encontrar cobertura pelo nome
  const findFrostingByName = (frostingName) => {
    const frosting = cakeFrostings.find(f => f.name === frostingName)
    if (!frosting) {
      console.log(`❌ Cobertura não encontrada: ${frostingName}`)
    }
    return frosting
  }

  // FUNÇÃO PRINCIPAL CORRIGIDA: Calcular custo completo do bolo
  const calculateCakeCost = (cake) => {
    console.log('🧮 CALCULANDO CUSTO DO BOLO:', cake.name)
    console.log('📦 Massas do bolo:', cake.masses)
    console.log('🎂 Coberturas do bolo:', cake.frostings)

    let totalCost = 0
    let massCost = 0
    let frostingCost = 0

    // 1. Calcular custo das massas - CORRIGIDO
    if (cake.masses && cake.masses.length > 0) {
      console.log('📦 Processando massas:', cake.masses.length)

      cake.masses.forEach(massItem => {
        console.log('🔍 Procurando massa:', massItem.massName)

        // CORREÇÃO: Buscar massa pelo nome
        const mass = findMassByName(massItem.massName)

        if (mass) {
          console.log('✅ Massa encontrada:', mass.name)
          console.log('📊 Dados da massa:', {
            totalGrams: mass.totalGrams,
            ingredients: mass.ingredients,
            cost: mass.cost
          })

          // Calcular custo total da massa se não existir
          const massTotalCost = mass.cost || calculateMassOrFrostingCost(mass)
          console.log('💰 Custo total da massa:', massTotalCost)

          if (mass.totalGrams && mass.totalGrams > 0) {
            // Calcular custo por grama
            const massCostPerGram = massTotalCost / mass.totalGrams
            console.log('📊 Custo por grama da massa:', massCostPerGram)

            // Calcular custo da quantidade usada no bolo
            const massGrams = parseFloat(massItem.grams) || 0
            const thisMassCost = massCostPerGram * massGrams
            console.log('🧮 Custo desta massa no bolo:', thisMassCost)

            massCost += thisMassCost
            totalCost += thisMassCost
          } else {
            console.log('⚠️ Massa sem totalGrams definido')
          }
        } else {
          console.log('❌ Massa não encontrada:', massItem.massName)
          console.log('📋 Massas disponíveis:', masses.map(m => m.name))
        }
      })
    } else {
      console.log('⚠️ Nenhuma massa definida para o bolo')
    }

    // 2. Calcular custo das coberturas - CORRIGIDO
    if (cake.frostings && cake.frostings.length > 0) {
      console.log('🎂 Processando coberturas:', cake.frostings.length)

      cake.frostings.forEach(frostingItem => {
        console.log('🔍 Procurando cobertura:', frostingItem.frostingName)

        // CORREÇÃO: Buscar cobertura pelo nome
        const frosting = findFrostingByName(frostingItem.frostingName)

        if (frosting) {
          console.log('✅ Cobertura encontrada:', frosting.name)
          console.log('📊 Dados da cobertura:', {
            totalGrams: frosting.totalGrams,
            ingredients: frosting.ingredients,
            cost: frosting.cost
          })

          // Calcular custo total da cobertura se não existir
          const frostingTotalCost = frosting.cost || calculateMassOrFrostingCost(frosting)
          console.log('💰 Custo total da cobertura:', frostingTotalCost)

          if (frosting.totalGrams && frosting.totalGrams > 0) {
            // Calcular custo por grama
            const frostingCostPerGram = frostingTotalCost / frosting.totalGrams
            console.log('📊 Custo por grama da cobertura:', frostingCostPerGram)

            // Calcular custo da quantidade usada no bolo
            const frostingGrams = parseFloat(frostingItem.grams) || 0
            const thisFrostingCost = frostingCostPerGram * frostingGrams
            console.log('🧮 Custo desta cobertura no bolo:', thisFrostingCost)

            frostingCost += thisFrostingCost
            totalCost += thisFrostingCost
          } else {
            console.log('⚠️ Cobertura sem totalGrams definido')
          }
        } else {
          console.log('❌ Cobertura não encontrada:', frostingItem.frostingName)
          console.log('📋 Coberturas disponíveis:', cakeFrostings.map(f => f.name))
        }
      })
    } else {
      console.log('⚠️ Nenhuma cobertura definida para o bolo')
    }

    // 3. Calcular custo do tempo
    const timeCost = calculateTimeCost(cake)
    totalCost += timeCost

    console.log('📊 RESUMO FINAL DO BOLO', cake.name)
    console.log('💰 Custo massas:', massCost)
    console.log('💰 Custo coberturas:', frostingCost)
    console.log('💰 Custo tempo:', timeCost)
    console.log('💰 Custo total:', totalCost)

    return totalCost
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

  // Função para calcular ingredientes de cobertura
  const calculateFrostingIngredients = (frosting, totalGrams) => {
    if (!frosting || !frosting.ingredients) return {}

    const scaleFactor = totalGrams / frosting.totalGrams
    const ingredients = {}

    frosting.ingredients.forEach(ingredient => {
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

  // Função para calcular ingredientes consolidados
  const calculateConsolidatedIngredients = (massGroups, frostingGroups = {}, extrasGroups = {}) => {
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

    // Processar ingredientes das coberturas (apenas para bolos)
    Object.values(frostingGroups).forEach(frostingData => {
      const ingredients = calculateFrostingIngredients(frostingData.frosting, frostingData.totalGrams)
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

  // FUNÇÃO PRINCIPAL DE CÁLCULO CORRIGIDA
  const handleCalculate = () => {
    const selectedItemsArray = Object.values(selectedItems).filter(item => item.quantity > 0)

    if (selectedItemsArray.length === 0) {
      alert('Selecione pelo menos um item para calcular')
      return
    }

    // Verificar se há itens de tipos misturados
    const hasCandies = selectedItemsArray.some(item => item.itemType === 'candy')
    const hasCakes = selectedItemsArray.some(item => item.itemType === 'cake')

    if (hasCandies && hasCakes) {
      alert('Não é possível calcular docinhos e bolos juntos. Selecione apenas um tipo por vez.')
      return
    }

    console.log(`🧮 Iniciando cálculo para: ${selectedType}`)
    console.log('📦 Itens selecionados:', selectedItemsArray)

    if (selectedType === 'docinhos') {
      // Cálculo para docinhos - CORRIGIDO
      const candyDetails = []
      const massGroups = {}
      const extrasGroups = {}
      let totalMaterialCost = 0
      let totalTimeCost = 0
      let totalCost = 0
      let totalRevenue = 0
      let totalProfit = 0

      selectedItemsArray.forEach((selectedItem) => {
        const product = selectedItem.product
        const quantity = selectedItem.quantity

        if (product && quantity > 0) {
          // Calcular custo corretamente usando a mesma lógica do Goals
          const costBreakdown = calculateCandyCost(product)
          const itemMaterialCost = costBreakdown.materialCost * quantity
          const itemTimeCost = costBreakdown.timeCost
          const itemTotalCost = itemMaterialCost + itemTimeCost

          const itemRevenue = (selectedItem.unitPrice || product.salePrice || 0) * quantity
          const itemProfit = itemRevenue - itemTotalCost

          candyDetails.push({
            candy: product,
            quantity,
            materialCost: itemMaterialCost,
            timeCost: itemTimeCost,
            totalCost: itemTotalCost,
            salePrice: selectedItem.unitPrice || product.salePrice || 0,
            totalRevenue: itemRevenue,
            totalProfit: itemProfit,
            orderNumber: selectedItem.orderNumber
          })

          totalMaterialCost += itemMaterialCost
          totalTimeCost += itemTimeCost
          totalCost += itemTotalCost
          totalRevenue += itemRevenue
          totalProfit += itemProfit

          // Processar massas dos docinhos - CORRIGIDO
          const productMasses = getProductMasses(product, 'docinhos')

          productMasses.forEach(massItem => {
            if (massItem.massName && massItem.grams) {
              const mass = findMassByName(massItem.massName)
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
                  candy: product,
                  quantity: quantity,
                  grams: massGrams,
                  gramsPerUnit: massItem.grams,
                  orderNumber: selectedItem.orderNumber
                })
              }
            }
          })

          // Processar extras e insumos dos docinhos
          const candyExtras = calculateExtrasIngredients(product, quantity, 'docinhos')
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
              candy: product,
              quantity: quantity,
              quantityPerCandy: extraData.quantityPerUnit,
              totalQuantity: extraData.quantity
            })
          })
        }
      })

      // Calcular ingredientes consolidados para docinhos
      const consolidatedIngredients = calculateConsolidatedIngredients(massGroups, {}, extrasGroups)

      setCalculations({
        candyDetails: candyDetails || [],
        massGroups,
        extrasGroups,
        consolidatedIngredients,
        totalMaterialCost: totalMaterialCost.toFixed(2),
        totalTimeCost: totalTimeCost.toFixed(2),
        totalCost: totalCost.toFixed(2),
        totalRevenue: totalRevenue.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        type: 'docinhos'
      })

    } else if (selectedType === 'bolos') {
      // CÁLCULO PARA BOLOS - CORRIGIDO
      const cakeDetails = []
      const massGroups = {}
      const frostingGroups = {}
      const extrasGroups = {}
      let totalMaterialCost = 0
      let totalTimeCost = 0
      let totalCost = 0
      let totalRevenue = 0
      let totalProfit = 0

      selectedItemsArray.forEach((selectedItem) => {
        const product = selectedItem.product
        const quantity = selectedItem.quantity

        if (product && quantity > 0) {
          console.log(`🎂 Processando bolo: ${product.name}`)

          // Calcular custo detalhado do bolo usando a mesma lógica do Goals
          const cakeUnitCost = calculateCakeCost(product) || 0
          const cakeTotalCost = cakeUnitCost * quantity

          // Separar custo material e tempo
          const timeCost = calculateTimeCost(product)
          const materialCost = cakeTotalCost - timeCost

          // Calcular receita
          const itemRevenue = (selectedItem.unitPrice || product.salePrice || (cakeUnitCost * 3)) * quantity
          const itemProfit = itemRevenue - cakeTotalCost

          cakeDetails.push({
            cake: product,
            quantity,
            unitCost: cakeUnitCost,
            materialCost: materialCost,
            timeCost: timeCost,
            totalCost: cakeTotalCost,
            salePrice: selectedItem.unitPrice || product.salePrice || (cakeUnitCost * 3),
            revenue: itemRevenue,
            profit: itemProfit,
            orderNumber: selectedItem.orderNumber
          })

          totalMaterialCost += materialCost
          totalTimeCost += timeCost
          totalCost += cakeTotalCost
          totalRevenue += itemRevenue
          totalProfit += itemProfit

          // Agrupar por massa
          const productMasses = getProductMasses(product, 'bolos')
          console.log(`🍰 Massas encontradas para ${product.name}:`, productMasses)

          productMasses.forEach(massItem => {
            if (massItem.massName && massItem.grams) {
              const mass = findMassByName(massItem.massName)
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
                  cake: product,
                  quantity: quantity,
                  grams: massGrams,
                  gramsPerUnit: massItem.grams,
                  orderNumber: selectedItem.orderNumber
                })

                console.log(`⚖️ Massa bolo "${massItem.massName}": ${massGrams}g para ${quantity} unidades`)
              }
            }
          })

          // Agrupar por cobertura
          if (product.frostings) {
            product.frostings.forEach(frostingItem => {
              if (frostingItem.frostingName && frostingItem.grams) {
                const frosting = findFrostingByName(frostingItem.frostingName)
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
                    cake: product,
                    quantity: quantity,
                    grams: frostingGrams,
                    gramsPerUnit: frostingItem.grams,
                    orderNumber: selectedItem.orderNumber
                  })

                  console.log(`🍦 Cobertura "${frostingItem.frostingName}": ${frostingGrams}g para ${quantity} unidades`)
                }
              }
            })
          }

          // Processar extras e insumos dos bolos
          const cakeExtras = calculateExtrasIngredients(product, quantity, 'bolos')
          Object.entries(cakeExtras).forEach(([productName, extraData]) => {
            if (!extrasGroups[productName]) {
              extrasGroups[productName] = {
                product: extraData.product,
                totalQuantity: extraData.quantity,
                totalGrams: extraData.totalGrams,
                unit: extraData.unit,
                cakes: []
              }
            } else {
              extrasGroups[productName].totalQuantity += extraData.quantity
              extrasGroups[productName].totalGrams += extraData.totalGrams
            }

            extrasGroups[productName].cakes.push({
              cake: product,
              quantity: quantity,
              quantityPerCake: extraData.quantityPerUnit,
              totalQuantity: extraData.quantity
            })
          })
        }
      })

      // Calcular ingredientes consolidados para bolos
      const consolidatedIngredients = calculateConsolidatedIngredients(massGroups, frostingGroups, extrasGroups)

      console.log('📊 Resultado bolos:', {
        cakeDetails,
        massGroups,
        frostingGroups,
        extrasGroups,
        totalMaterialCost,
        totalTimeCost,
        totalCost,
        totalRevenue,
        totalProfit
      })

      setCalculations({
        cakeDetails: cakeDetails || [],
        massGroups,
        frostingGroups,
        extrasGroups,
        consolidatedIngredients,
        totalMaterialCost: totalMaterialCost.toFixed(2),
        totalTimeCost: totalTimeCost.toFixed(2),
        totalCost: totalCost.toFixed(2),
        totalRevenue: totalRevenue.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        type: 'bolos'
      })
    }
  }

  const selectAllItems = () => {
    const newSelection = {}

    filteredOrders.forEach(order => {
      const items = getOrderItems(order)
      items.forEach(item => {
        const itemKey = `${order._id}-${item.itemId}`
        newSelection[itemKey] = {
          ...item,
          quantity: item.quantity,
          product: item.product
        }
      })
    })

    setSelectedItems(newSelection)
  }

  const deselectAllItems = () => {
    setSelectedItems({})
  }

  const getOrderItems = (order) => {
    if (!order.items) return []

    const items = order.items.filter(item => {
      if (selectedType === 'docinhos') return item.itemType === 'candy'
      if (selectedType === 'bolos') return item.itemType === 'cake'
      return true
    }).map(item => {
      const product = selectedType === 'docinhos'
        ? candies.find(c => c._id === item.itemId)
        : cakes.find(c => c._id === item.itemId)

      return {
        ...item,
        product: product,
        productName: product?.name || item.itemName,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        unitPrice: item.unitPrice || product?.salePrice || 0,
        quantity: item.quantity || 0
      }
    }).filter(item => item.product)

    return items
  }

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }))
  }

  const toggleItemSelection = (orderId, item) => {
    const itemKey = `${orderId}-${item.itemId}`

    setSelectedItems(prev => {
      if (prev[itemKey]) {
        const newItems = { ...prev }
        delete newItems[itemKey]
        return newItems
      } else {
        return {
          ...prev,
          [itemKey]: {
            ...item,
            quantity: item.quantity,
            product: item.product
          }
        }
      }
    })
  }

  const getSelectedItemsCount = () => {
    return Object.values(selectedItems).filter(item => item.quantity > 0).length
  }

  const getTotalSelectedQuantity = () => {
    return Object.values(selectedItems).reduce((total, item) => total + (item.quantity || 0), 0)
  }

  const isItemSelected = (orderId, itemId) => {
    return !!selectedItems[`${orderId}-${itemId}`]
  }

  const handleDateFilterChange = (value) => {
    setDateFilter(value)
    setShowCustomDate(value === 'custom')
  }

  const toggleResultsSection = (section) => {
    setExpandedResults(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
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
      link.download = `calculo-producao-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

    } catch (error) {
      console.error('Erro ao salvar PNG:', error)
      alert('Erro ao salvar imagem. Tente novamente.')
    }
  }

  // CORREÇÃO: Funções auxiliares para seleção em lote
  const selectAllInOrder = (orderId) => {
    const order = orders.find(o => o._id === orderId)
    if (!order) return

    const items = getOrderItems(order)
    const newSelection = { ...selectedItems }

    items.forEach(item => {
      const itemKey = `${orderId}-${item.itemId}`
      newSelection[itemKey] = {
        ...item,
        quantity: item.quantity,
        product: item.product
      }
    })

    setSelectedItems(newSelection)
  }

  const deselectAllInOrder = (orderId) => {
    const newSelection = { ...selectedItems }
    Object.keys(newSelection).forEach(key => {
      if (key.startsWith(orderId)) {
        delete newSelection[key]
      }
    })
    setSelectedItems(newSelection)
  }

  // Componente para o PNG com tema claro e informações detalhadas
  const ResultsForPNG = () => (
    <div className="space-y-6 p-6 bg-white text-gray-800" style={{ minWidth: '800px', fontFamily: 'Arial, sans-serif' }}>
      {/* Cabeçalho */}
      <div className="text-center border-b-2 border-blue-500 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Cálculo de Produção - {selectedType === 'docinhos' ? 'Docinhos' : 'Bolos'}
        </h1>
        <p className="text-gray-600">
          Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <p className="text-sm font-semibold text-blue-700">Custo Total</p>
          <p className="text-xl font-bold text-blue-900">R$ {calculations.totalCost}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-green-700">Receita Total</p>
          <p className="text-xl font-bold text-green-900">R$ {calculations.totalRevenue}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-emerald-700">Lucro Total</p>
          <p className="text-xl font-bold text-emerald-900">R$ {calculations.totalProfit}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-purple-700">Margem</p>
          <p className="text-xl font-bold text-purple-900">
            {calculations.totalRevenue > 0
              ? (100 - (parseFloat(calculations.totalCost) / parseFloat(calculations.totalRevenue) * 100)).toFixed(1)
              : '0'}%
          </p>
        </div>
      </div>

      {/* Conteúdo específico por tipo */}
      {calculations.type === 'docinhos' ? (
        /* RESULTADOS PARA DOCINHOS - DETALHADO */
        <div className="space-y-6">
          {/* Massas Utilizadas com Detalhes por Docinho */}
          {Object.keys(calculations.massGroups).length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-yellow-50 p-4 border-b border-yellow-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  🍬 Massas Utilizadas ({Object.keys(calculations.massGroups).length})
                </h2>
              </div>
              <div className="p-4 space-y-6">
                {Object.entries(calculations.massGroups).map(([massName, massData]) => {
                  const ingredients = calculateMassIngredients(massData.mass, massData.totalGrams)
                  const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.quantity > 0)

                  return (
                    <div key={massName} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{massName}</h3>
                          <p className="text-gray-600 text-sm">
                            Total necessário: <span className="font-bold text-blue-700">{(massData.totalGrams || 0).toFixed(0)}g</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Docinhos que usam esta massa:</p>
                          <p className="font-medium text-gray-800">{massData.candies.length} tipo(s)</p>
                        </div>
                      </div>

                      {/* Detalhes dos docinhos que usam esta massa */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">📋 Docinhos específicos:</h4>
                        <div className="space-y-2">
                          {massData.candies.map((candyItem, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-white rounded border border-gray-100">
                              <div>
                                <span className="font-medium text-gray-900">{candyItem.candy.name}</span>
                                <span className="text-gray-500 text-xs ml-2">({candyItem.orderNumber})</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm">
                                  <span className="text-gray-600">{candyItem.quantity} unidades</span>
                                </div>
                                <div className="text-sm font-semibold text-blue-700">
                                  {candyItem.gramsPerUnit}g/un • Total: {candyItem.grams.toFixed(0)}g
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Ingredientes necessários para esta massa */}
                      {validIngredients.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2 text-sm">🧾 Ingredientes para esta massa:</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {validIngredients.map(([productName, data]) => (
                              <div key={productName} className="flex justify-between items-center p-2 bg-white rounded border border-gray-100">
                                <span className="font-medium text-gray-900">{productName}</span>
                                <span className="font-bold text-green-700">
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
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Extras e Insumos */}
          {calculations.extrasGroups && Object.keys(calculations.extrasGroups).length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-purple-50 p-4 border-b border-purple-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  🎁 Extras e Insumos ({Object.keys(calculations.extrasGroups).length})
                </h2>
              </div>
              <div className="p-4 space-y-4">
                {Object.entries(calculations.extrasGroups).map(([productName, extraData]) => (
                  <div key={productName} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-gray-900">{productName}</h3>
                      <span className="font-bold text-green-700 text-lg">
                        {extraData.unit === 'un' 
                          ? `${extraData.totalQuantity} ${extraData.unit}`
                          : `${extraData.totalQuantity}${extraData.unit}`
                        }
                      </span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Utilizado nos docinhos:</h4>
                    <div className="space-y-2">
                      {extraData.candies.map((candyItem, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-white rounded border border-gray-100">
                          <span className="font-medium text-gray-900">{candyItem.candy.name}</span>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">{candyItem.quantity} unidades</div>
                            <div className="text-sm font-semibold text-blue-700">
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

          {/* Ingredientes Consolidados */}
          {calculations.consolidatedIngredients && Object.keys(calculations.consolidatedIngredients).length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-green-50 p-4 border-b border-green-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  📦 Ingredientes Consolidados ({Object.keys(calculations.consolidatedIngredients).length})
                </h2>
                <p className="text-gray-600 text-sm mt-1">Soma total de todos os ingredientes necessários</p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(calculations.consolidatedIngredients).map(([productName, data]) => (
                    <div key={productName} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                      <span className="font-medium text-gray-900">{productName}</span>
                      <span className="font-bold text-green-700">
                        {data.unit === 'un'
                          ? `${data.quantity} ${data.unit}`
                          : `${data.quantity}${data.unit}`
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* RESULTADOS PARA BOLOS - DETALHADO */
        <div className="space-y-6">
          {/* Massas dos Bolos */}
          {Object.keys(calculations.massGroups).length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-yellow-50 p-4 border-b border-yellow-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  🎂 Massas dos Bolos ({Object.keys(calculations.massGroups).length})
                </h2>
              </div>
              <div className="p-4 space-y-6">
                {Object.entries(calculations.massGroups).map(([massName, massData]) => {
                  const ingredients = calculateMassIngredients(massData.mass, massData.totalGrams)
                  const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.quantity > 0)

                  return (
                    <div key={massName} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{massName}</h3>
                          <p className="text-gray-600 text-sm">
                            Total necessário: <span className="font-bold text-blue-700">{(massData.totalGrams || 0).toFixed(0)}g</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Bolos que usam esta massa:</p>
                          <p className="font-medium text-gray-800">{massData.cakes.length} tipo(s)</p>
                        </div>
                      </div>

                      {/* Detalhes dos bolos que usam esta massa */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">📋 Bolos específicos:</h4>
                        <div className="space-y-2">
                          {massData.cakes.map((cakeItem, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-white rounded border border-gray-100">
                              <div>
                                <span className="font-medium text-gray-900">{cakeItem.cake.name}</span>
                                <span className="text-gray-500 text-xs ml-2">({cakeItem.orderNumber})</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm">
                                  <span className="text-gray-600">{cakeItem.quantity} unidades</span>
                                </div>
                                <div className="text-sm font-semibold text-blue-700">
                                  {cakeItem.gramsPerUnit}g/un • Total: {cakeItem.grams.toFixed(0)}g
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Ingredientes necessários para esta massa */}
                      {validIngredients.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2 text-sm">🧾 Ingredientes para esta massa:</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {validIngredients.map(([productName, data]) => (
                              <div key={productName} className="flex justify-between items-center p-2 bg-white rounded border border-gray-100">
                                <span className="font-medium text-gray-900">{productName}</span>
                                <span className="font-bold text-green-700">
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
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Coberturas dos Bolos */}
          {calculations.frostingGroups && Object.keys(calculations.frostingGroups).length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-pink-50 p-4 border-b border-pink-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  🍦 Coberturas dos Bolos ({Object.keys(calculations.frostingGroups).length})
                </h2>
              </div>
              <div className="p-4 space-y-6">
                {Object.entries(calculations.frostingGroups).map(([frostingName, frostingData]) => {
                  const ingredients = calculateFrostingIngredients(frostingData.frosting, frostingData.totalGrams)
                  const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.quantity > 0)

                  return (
                    <div key={frostingName} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{frostingName}</h3>
                          <p className="text-gray-600 text-sm">
                            Total necessário: <span className="font-bold text-blue-700">{(frostingData.totalGrams || 0).toFixed(0)}g</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Bolos que usam esta cobertura:</p>
                          <p className="font-medium text-gray-800">{frostingData.cakes.length} tipo(s)</p>
                        </div>
                      </div>

                      {/* Detalhes dos bolos que usam esta cobertura */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">📋 Bolos específicos:</h4>
                        <div className="space-y-2">
                          {frostingData.cakes.map((cakeItem, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-white rounded border border-gray-100">
                              <div>
                                <span className="font-medium text-gray-900">{cakeItem.cake.name}</span>
                                <span className="text-gray-500 text-xs ml-2">({cakeItem.orderNumber})</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm">
                                  <span className="text-gray-600">{cakeItem.quantity} unidades</span>
                                </div>
                                <div className="text-sm font-semibold text-blue-700">
                                  {cakeItem.gramsPerUnit}g/un • Total: {cakeItem.grams.toFixed(0)}g
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Ingredientes necessários para esta cobertura */}
                      {validIngredients.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2 text-sm">🧾 Ingredientes para esta cobertura:</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {validIngredients.map(([productName, data]) => (
                              <div key={productName} className="flex justify-between items-center p-2 bg-white rounded border border-gray-100">
                                <span className="font-medium text-gray-900">{productName}</span>
                                <span className="font-bold text-green-700">
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
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Extras e Insumos para Bolos */}
          {calculations.extrasGroups && Object.keys(calculations.extrasGroups).length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-purple-50 p-4 border-b border-purple-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  🎁 Extras e Insumos ({Object.keys(calculations.extrasGroups).length})
                </h2>
              </div>
              <div className="p-4 space-y-4">
                {Object.entries(calculations.extrasGroups).map(([productName, extraData]) => (
                  <div key={productName} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-gray-900">{productName}</h3>
                      <span className="font-bold text-green-700 text-lg">
                        {extraData.unit === 'un' 
                          ? `${extraData.totalQuantity} ${extraData.unit}`
                          : `${extraData.totalQuantity}${extraData.unit}`
                        }
                      </span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Utilizado nos bolos:</h4>
                    <div className="space-y-2">
                      {extraData.cakes.map((cakeItem, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-white rounded border border-gray-100">
                          <span className="font-medium text-gray-900">{cakeItem.cake.name}</span>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">{cakeItem.quantity} unidades</div>
                            <div className="text-sm font-semibold text-blue-700">
                              {extraData.unit === 'un' 
                                ? `${cakeItem.totalQuantity} ${extraData.unit}`
                                : `${cakeItem.totalQuantity}${extraData.unit}`
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

          {/* Ingredientes Consolidados */}
          {calculations.consolidatedIngredients && Object.keys(calculations.consolidatedIngredients).length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-green-50 p-4 border-b border-green-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  📦 Ingredientes Consolidados ({Object.keys(calculations.consolidatedIngredients).length})
                </h2>
                <p className="text-gray-600 text-sm mt-1">Soma total de todos os ingredientes necessários</p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(calculations.consolidatedIngredients).map(([productName, data]) => (
                    <div key={productName} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                      <span className="font-medium text-gray-900">{productName}</span>
                      <span className="font-bold text-green-700">
                        {data.unit === 'un'
                          ? `${data.quantity} ${data.unit}`
                          : `${data.quantity}${data.unit}`
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rodapé */}
      <div className="border-t border-gray-300 pt-4 mt-6 text-center text-gray-500 text-sm">
        <p>💡 Sistema gerado automaticamente • Quantidades em gramas por unidade especificadas</p>
        <p className="mt-1">Total de itens selecionados: {Object.keys(selectedItems).length}</p>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Calculadora de Produção"
      size="lg"
    >
      <div className="flex flex-col h-full">
        {/* Header fixo */}
        <div className="flex-shrink-0 p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white text-center">
            Calculadora de Produção - {selectedType === 'docinhos' ? 'Docinhos' : 'Bolos'}
          </h2>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!calculations ? (
            <>
              {/* Informação inicial */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                  <FaCalculator className="w-4 h-4" />
                  Sobre a Calculadora
                </h4>
                <p className="text-blue-200 text-sm">
                  Selecione os itens das encomendas para calcular os ingredientes necessários, custos e lucro total da produção.
                </p>
                <p className="text-blue-300 text-xs mt-1">
                  <strong>Tipo atual:</strong> {selectedType === 'docinhos' ? 'Docinhos' : 'Bolos'}
                </p>
                <p className="text-blue-300 text-xs mt-1">
                  <strong>Otimização de tempo:</strong> Itens iguais na mesma produção não somam tempo adicional
                </p>
              </div>

              {/* Seleção de Tipo */}
              <div className="bg-white/5 rounded-2xl p-4">
                <h3 className="text-white font-semibold text-lg mb-3">Tipo de Produção</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedType('docinhos')}
                    className={`h-12 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2 ${selectedType === 'docinhos'
                      ? 'bg-primary-500/20 border-primary-400 text-primary-300'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                  >
                    <span className="text-base">🍬</span>
                    <span className="text-sm font-medium">Docinhos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType('bolos')}
                    className={`h-12 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2 ${selectedType === 'bolos'
                      ? 'bg-primary-500/20 border-primary-400 text-primary-300'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                  >
                    <span className="text-base">🎂</span>
                    <span className="text-sm font-medium">Bolos</span>
                  </button>
                </div>
              </div>

              {/* Filtros */}
              <div className="bg-white/5 rounded-2xl p-4">
                <h3 className="text-white font-semibold text-lg mb-3">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por cliente ou número da encomenda..."
                      className="w-full h-12 px-4 pl-10 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                  </div>

                  <select
                    value={dateFilter}
                    onChange={(e) => handleDateFilterChange(e.target.value)}
                    className="h-12 glass-input px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  >
                    <option value="next10">Próximos 10 dias</option>
                    <option value="last4">Últimos 4 dias</option>
                    <option value="custom">Data personalizada</option>
                    <option value="all">Todas as datas</option>
                  </select>
                </div>

                {/* Filtro de data personalizada */}
                {showCustomDate && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 text-xs mb-2">Data inicial</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent [&::-webkit-calendar-picker-indicator]:opacity-0"
                          ref={startDateRef}
                        />
                        <button
                          type="button"
                          onClick={() => startDateRef.current?.showPicker()}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                        >
                          <FaCalendar className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/60 text-xs mb-2">Data final</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent [&::-webkit-calendar-picker-indicator]:opacity-0"
                          ref={endDateRef}
                        />
                        <button
                          type="button"
                          onClick={() => endDateRef.current?.showPicker()}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                        >
                          <FaCalendar className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Controles Globais */}
              {filteredOrders.length > 0 && (
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg">Encomendas</h3>
                      <p className="text-white/60 text-sm">
                        {getSelectedItemsCount()} itens selecionados • {getTotalSelectedQuantity()} unidades
                        {dateFilter === 'custom' && customStartDate && customEndDate && (
                          <span className="block text-white/40 text-xs mt-1">
                            Período: {new Date(customStartDate).toLocaleDateString('pt-BR')} a {new Date(customEndDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllItems}
                        className="w-10 h-10 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-300 flex items-center justify-center transition-colors"
                        title="Selecionar Todos"
                      >
                        <FaCheck className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={deselectAllItems}
                        className="w-10 h-10 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 flex items-center justify-center transition-colors"
                        title="Limpar Tudo"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lista de Encomendas com Subitens */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredOrders.map(order => {
                      const orderItems = getOrderItems(order)
                      const isExpanded = expandedOrders[order._id]
                      const orderSelectedItems = Object.keys(selectedItems).filter(key =>
                        key.startsWith(order._id)
                      ).length

                      if (orderItems.length === 0) return null

                      return (
                        <div key={order._id} className="border border-white/10 rounded-xl overflow-hidden">
                          {/* Cabeçalho da Encomenda */}
                          <div
                            className="p-3 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                            onClick={() => toggleOrderExpansion(order._id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="text-white font-medium text-sm">
                                  {order.orderNumber} - {order.customerName}
                                </div>
                                <div className="text-white/60 text-xs">
                                  {orderItems.length} itens • {new Date(order.deliveryDate).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-white/40 text-xs">
                                  {orderSelectedItems} selecionados
                                </span>
                                {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                              </div>
                            </div>
                          </div>

                          {/* Itens da Encomenda (expandido) */}
                          {isExpanded && (
                            <div className="p-3 bg-white/3 space-y-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-white/60 text-xs">Itens desta encomenda:</span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      selectAllInOrder(order._id)
                                    }}
                                    className="px-2 py-1 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-colors"
                                  >
                                    Todos
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deselectAllInOrder(order._id)
                                    }}
                                    className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
                                  >
                                    Limpar
                                  </button>
                                </div>
                              </div>

                              {orderItems.map(item => {
                                const itemKey = `${order._id}-${item.itemId}`
                                const isSelected = isItemSelected(order._id, item.itemId)

                                return (
                                  <div
                                    key={itemKey}
                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isSelected
                                      ? 'bg-green-500/20 border border-green-500/30'
                                      : 'bg-white/5 hover:bg-white/10'
                                      }`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleItemSelection(order._id, item)
                                    }}
                                  >
                                    <div className="flex-1">
                                      <div className="text-white font-medium text-sm">
                                        {item.productName}
                                      </div>
                                      <div className="text-white/60 text-xs">
                                        {item.quantity} unidades • R$ {item.unitPrice?.toFixed(2)}/un
                                      </div>
                                      {/* Informação específica do tipo */}
                                      {selectedType === 'docinhos' && item.product?.candyGrams && (
                                        <div className="text-white/40 text-xs">
                                          {item.product.candyGrams}g por unidade
                                        </div>
                                      )}
                                      {selectedType === 'bolos' && item.product?.totalWeight && (
                                        <div className="text-white/40 text-xs">
                                          {item.product.totalWeight}g por bolo
                                        </div>
                                      )}
                                      {item.product?.extras && item.product.extras.length > 0 && (
                                        <div className="text-blue-400 text-xs">
                                          {item.product.extras.length} extra(s)
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {isSelected && (
                                        <FaCheck className="text-green-400" size={14} />
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Mensagem quando não há encomendas */}
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 bg-white/5 rounded-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 mx-auto mb-4">
                    <FaSearch size={24} />
                  </div>
                  <p className="text-white/60">Nenhuma encomenda encontrada</p>
                  <p className="text-white/40 text-sm mt-1">
                    Verifique os filtros selecionados ou o tipo de produção
                  </p>
                </div>
              )}
            </>
          ) : (
            /* RESULTADOS DO CÁLCULO - Interface interativa */
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">
                    Resultados do Cálculo - {selectedType === 'docinhos' ? 'Docinhos' : 'Bolos'}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={saveAsPNG}
                      className="w-10 h-10 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 flex items-center justify-center transition-colors"
                      title="Salvar PNG"
                    >
                      <FaDownload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCalculations(null)}
                      className="w-10 h-10 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 flex items-center justify-center transition-colors"
                      title="Voltar"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Resumo Financeiro com Custo Materiais, Custo Tempo e Custo Total */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-blue-500/10 rounded-xl">
                  <div className="text-center">
                    <p className="text-orange-300 text-xs font-semibold">Custo Materiais</p>
                    <p className="text-orange-400 text-lg font-bold">R$ {calculations.totalMaterialCost}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-purple-300 text-xs font-semibold">Custo Tempo</p>
                    <p className="text-purple-400 text-lg font-bold">R$ {calculations.totalTimeCost}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-300 text-xs font-semibold">Custo Total</p>
                    <p className="text-red-400 text-lg font-bold">R$ {calculations.totalCost}</p>
                  </div>
                </div>

                {/* Receita e Lucro */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-green-500/10 rounded-xl">
                  <div className="text-center">
                    <p className="text-blue-300 text-xs font-semibold">Receita Total</p>
                    <p className="text-blue-400 text-lg font-bold">R$ {calculations.totalRevenue}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-green-300 text-xs font-semibold">Lucro Total</p>
                    <p className="text-green-400 text-lg font-bold">R$ {calculations.totalProfit}</p>
                  </div>
                </div>

                {/* Margem de Lucro */}
                <div className="text-center p-3 bg-purple-500/10 rounded-xl">
                  <p className="text-purple-300 text-sm font-semibold">Margem de Lucro</p>
                  <p className="text-purple-400 text-xl font-bold">
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

                {/* Conteúdo específico por tipo */}
                {calculations.type === 'bolos' ? (
                  /* INTERFACE PARA BOLOS */
                  <>
                    {/* Bolos do Lote */}
                    <div className="border border-white/10 rounded-xl overflow-hidden">
                      <div
                        className="p-3 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                        onClick={() => toggleResultsSection('items')}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                            <FaList className="w-4 h-4" />
                            Bolos do Lote ({calculations.cakeDetails?.length || 0})
                          </h4>
                          {expandedResults.items ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </div>
                      </div>

                      {expandedResults.items && (
                        <div className="p-3 bg-white/3 space-y-2 max-h-40 overflow-y-auto">
                          {calculations.cakeDetails?.map((item, idx) => {
                            const marginInfo = calculateProfitMargin(item.totalCost || 0, item.revenue || 0);

                            return (
                              <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                                <div className="flex-1">
                                  <span className="text-white font-medium text-sm">{item.cake.name}</span>
                                  <div className="text-white/60 text-xs">
                                    {item.quantity} un • R$ {(item.unitCost || 0).toFixed(2)}/un • {item.orderNumber}
                                  </div>
                                  <div className="text-xs space-y-1 mt-1">
                                    <div className="flex justify-between">
                                      <span className="text-orange-400">Materiais:</span>
                                      <span className="text-orange-300">R$ {(item.materialCost || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-purple-400">Tempo:</span>
                                      <span className="text-purple-300">R$ {(item.timeCost || 0).toFixed(2)}</span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-purple-400 mt-1">
                                    Margem: {marginInfo.profitMargin}% (Custo: {marginInfo.costMargin}%)
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
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Massas Agrupadas */}
                    {Object.keys(calculations.massGroups).length > 0 && (
                      <div className="border border-white/10 rounded-xl overflow-hidden">
                        <div
                          className="p-3 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                          onClick={() => toggleResultsSection('masses')}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                              <FaBox className="w-4 h-4" />
                              Massas Agrupadas ({Object.keys(calculations.massGroups).length})
                            </h4>
                            {expandedResults.masses ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                          </div>
                        </div>

                        {expandedResults.masses && (
                          <div className="p-3 bg-white/3 space-y-3 max-h-40 overflow-y-auto">
                            {Object.entries(calculations.massGroups).map(([massName, massData]) => {
                              const ingredients = calculateMassIngredients(massData.mass, massData.totalGrams)
                              const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.quantity > 0)

                              return (
                                <div key={massName} className="p-3 rounded-lg bg-white/5">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-white text-sm">{massName}</h5>
                                    <span className="text-yellow-300 font-bold text-sm">
                                      Total: {(massData.totalGrams || 0).toFixed(0)}g
                                    </span>
                                  </div>

                                  {/* Detalhes dos bolos que usam esta massa */}
                                  <div className="mb-3">
                                    <p className="text-white/60 text-xs mb-1">Bolos que usam esta massa:</p>
                                    <div className="space-y-1">
                                      {massData.cakes.map((cakeItem, idx) => (
                                        <div key={idx} className="flex justify-between text-xs text-white/60">
                                          <span>{cakeItem.cake.name}</span>
                                          <span className="text-yellow-300">
                                            {cakeItem.quantity} un • {cakeItem.gramsPerUnit}g/un
                                          </span>
                                        </div>
                                      ))}
                                    </div>
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
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Coberturas Agrupadas */}
                    {calculations.frostingGroups && Object.keys(calculations.frostingGroups).length > 0 && (
                      <div className="border border-white/10 rounded-xl overflow-hidden">
                        <div
                          className="p-3 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                          onClick={() => toggleResultsSection('frostings')}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                              <FaBox className="w-4 h-4" />
                              Coberturas Agrupadas ({Object.keys(calculations.frostingGroups).length})
                            </h4>
                            {expandedResults.frostings ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                          </div>
                        </div>

                        {expandedResults.frostings && (
                          <div className="p-3 bg-white/3 space-y-3 max-h-40 overflow-y-auto">
                            {Object.entries(calculations.frostingGroups).map(([frostingName, frostingData]) => {
                              const ingredients = calculateFrostingIngredients(frostingData.frosting, frostingData.totalGrams)
                              const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.quantity > 0)

                              return (
                                <div key={frostingName} className="p-3 rounded-lg bg-white/5">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-white text-sm">{frostingName}</h5>
                                    <span className="text-yellow-300 font-bold text-sm">
                                      Total: {(frostingData.totalGrams || 0).toFixed(0)}g
                                    </span>
                                  </div>

                                  {/* Detalhes dos bolos que usam esta cobertura */}
                                  <div className="mb-3">
                                    <p className="text-white/60 text-xs mb-1">Bolos que usam esta cobertura:</p>
                                    <div className="space-y-1">
                                      {frostingData.cakes.map((cakeItem, idx) => (
                                        <div key={idx} className="flex justify-between text-xs text-white/60">
                                          <span>{cakeItem.cake.name}</span>
                                          <span className="text-yellow-300">
                                            {cakeItem.quantity} un • {cakeItem.gramsPerUnit}g/un
                                          </span>
                                        </div>
                                      ))}
                                    </div>
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
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Extras e Insumos */}
                    {calculations.extrasGroups && Object.keys(calculations.extrasGroups).length > 0 && (
                      <div className="border border-white/10 rounded-xl overflow-hidden">
                        <div
                          className="p-3 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                          onClick={() => toggleResultsSection('extras')}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                              <FaBox className="w-4 h-4" />
                              Extras e Insumos ({Object.keys(calculations.extrasGroups).length})
                            </h4>
                            {expandedResults.extras ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                          </div>
                        </div>

                        {expandedResults.extras && (
                          <div className="p-3 bg-white/3 space-y-3 max-h-40 overflow-y-auto">
                            {Object.entries(calculations.extrasGroups).map(([productName, extraData]) => (
                              <div key={productName} className="p-3 rounded-lg bg-white/5">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-bold text-white text-sm">{productName}</h5>
                                  <span className="text-green-300 font-semibold text-sm">
                                    {extraData.unit === 'un' 
                                      ? `${extraData.totalQuantity} ${extraData.unit}`
                                      : `${extraData.totalQuantity}${extraData.unit}`
                                    }
                                  </span>
                                </div>
                                
                                <p className="text-white/60 text-xs mb-1">Utilizado em:</p>
                                <div className="space-y-1">
                                  {extraData.cakes.map((cakeItem, idx) => (
                                    <div key={idx} className="flex justify-between text-xs text-white/60">
                                      <span>{cakeItem.cake.name}</span>
                                      <span>
                                        {cakeItem.quantity} un • 
                                        {extraData.unit === 'un' 
                                          ? ` ${cakeItem.totalQuantity} ${extraData.unit}`
                                          : ` ${cakeItem.totalQuantity}${extraData.unit}`
                                        }
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ingredientes Consolidados */}
                    {calculations.consolidatedIngredients && Object.keys(calculations.consolidatedIngredients).length > 0 && (
                      <div className="border border-white/10 rounded-xl overflow-hidden">
                        <div
                          className="p-3 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                          onClick={() => toggleResultsSection('ingredients')}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                              <FaBox className="w-4 h-4" />
                              Ingredientes Consolidados ({Object.keys(calculations.consolidatedIngredients).length})
                            </h4>
                            {expandedResults.ingredients ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                          </div>
                        </div>

                        {expandedResults.ingredients && (
                          <div className="p-3 bg-white/3 space-y-2 max-h-40 overflow-y-auto">
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
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  /* INTERFACE PARA DOCINHOS */
                  <>
                    {/* Itens Selecionados */}
                    <div className="border border-white/10 rounded-xl overflow-hidden">
                      <div
                        className="p-3 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                        onClick={() => toggleResultsSection('items')}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                            <FaList className="w-4 h-4" />
                            Docinhos do Lote ({calculations.candyDetails?.length || 0})
                          </h4>
                          {expandedResults.items ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </div>
                      </div>

                      {expandedResults.items && (
                        <div className="p-3 bg-white/3 space-y-2 max-h-40 overflow-y-auto">
                          {calculations.candyDetails?.map((item, idx) => {
                            const marginInfo = calculateProfitMargin(item.totalCost || 0, item.totalRevenue || 0);

                            return (
                              <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                                <div className="flex-1">
                                  <span className="text-white font-medium text-sm">{item.candy.name}</span>
                                  <div className="text-white/60 text-xs">
                                    {item.quantity} un • R$ {(item.totalCost / item.quantity).toFixed(2)}/un • {item.orderNumber}
                                  </div>
                                  <div className="text-xs space-y-1 mt-1">
                                    <div className="flex justify-between">
                                      <span className="text-orange-400">Materiais:</span>
                                      <span className="text-orange-300">R$ {(item.materialCost || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-purple-400">Tempo:</span>
                                      <span className="text-purple-300">R$ {(item.timeCost || 0).toFixed(2)}</span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-purple-400 mt-1">
                                    Margem: {marginInfo.profitMargin}% (Custo: {marginInfo.costMargin}%)
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-green-400 font-semibold text-sm">
                                    R$ {(item.totalRevenue || 0).toFixed(2)}
                                  </div>
                                  <div className="text-green-300 text-xs">
                                    Lucro: R$ {(item.totalProfit || 0).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Massas Agrupadas para Docinhos */}
                    {Object.keys(calculations.massGroups).length > 0 && (
                      <div className="border border-white/10 rounded-xl overflow-hidden">
                        <div
                          className="p-3 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                          onClick={() => toggleResultsSection('masses')}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                              <FaBox className="w-4 h-4" />
                              Massas Utilizadas ({Object.keys(calculations.massGroups).length})
                            </h4>
                            {expandedResults.masses ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                          </div>
                        </div>

                        {expandedResults.masses && (
                          <div className="p-3 bg-white/3 space-y-3 max-h-40 overflow-y-auto">
                            {Object.entries(calculations.massGroups).map(([massName, massData]) => {
                              const ingredients = calculateMassIngredients(massData.mass, massData.totalGrams)
                              const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.quantity > 0)

                              return (
                                <div key={massName} className="p-3 rounded-lg bg-white/5">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-white text-sm">{massName}</h5>
                                    <span className="text-yellow-300 font-bold text-sm">
                                      Total: {(massData.totalGrams || 0).toFixed(0)}g
                                    </span>
                                  </div>

                                  {/* Detalhes dos docinhos que usam esta massa */}
                                  <div className="mb-3">
                                    <p className="text-white/60 text-xs mb-1">Docinhos que usam esta massa:</p>
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
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Extras e Insumos para Docinhos */}
                    {calculations.extrasGroups && Object.keys(calculations.extrasGroups).length > 0 && (
                      <div className="border border-white/10 rounded-xl overflow-hidden">
                        <div
                          className="p-3 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                          onClick={() => toggleResultsSection('extras')}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                              <FaBox className="w-4 h-4" />
                              Extras e Insumos ({Object.keys(calculations.extrasGroups).length})
                            </h4>
                            {expandedResults.extras ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                          </div>
                        </div>

                        {expandedResults.extras && (
                          <div className="p-3 bg-white/3 space-y-3 max-h-40 overflow-y-auto">
                            {Object.entries(calculations.extrasGroups).map(([productName, extraData]) => (
                              <div key={productName} className="p-3 rounded-lg bg-white/5">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-bold text-white text-sm">{productName}</h5>
                                  <span className="text-green-300 font-semibold text-sm">
                                    {extraData.unit === 'un' 
                                      ? `${extraData.totalQuantity} ${extraData.unit}`
                                      : `${extraData.totalQuantity}${extraData.unit}`
                                    }
                                  </span>
                                </div>
                                
                                <p className="text-white/60 text-xs mb-1">Utilizado em:</p>
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
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ingredientes Consolidados para Docinhos */}
                    {calculations.consolidatedIngredients && Object.keys(calculations.consolidatedIngredients).length > 0 && (
                      <div className="border border-white/10 rounded-xl overflow-hidden">
                        <div
                          className="p-3 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                          onClick={() => toggleResultsSection('ingredients')}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                              <FaBox className="w-4 h-4" />
                              Ingredientes Consolidados ({Object.keys(calculations.consolidatedIngredients).length})
                            </h4>
                            {expandedResults.ingredients ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                          </div>
                        </div>

                        {expandedResults.ingredients && (
                          <div className="p-3 bg-white/3 space-y-2 max-h-40 overflow-y-auto">
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
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Informação sobre unidades */}
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-blue-300 text-xs text-center">
                    💡 <strong>Sistema de unidades:</strong> Kg → g, L → ml, Unidades mantidas como "un"
                  </p>
                </div>
              </div>

              {/* Componente oculto para o PNG - versão completa com tema claro */}
              {calculations && (
                <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                  <div ref={resultsRef}>
                    <ResultsForPNG />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer fixo */}
        {!calculations && (
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
                type="button"
                onClick={handleCalculate}
                disabled={getSelectedItemsCount() === 0}
                className="flex-1 h-12"
              >
                <FaCalculator className="w-4 h-4" />
                <span>Calcular ({getSelectedItemsCount()} itens)</span>
              </GlassButton>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}