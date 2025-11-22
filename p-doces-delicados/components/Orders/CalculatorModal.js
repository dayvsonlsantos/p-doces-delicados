import Modal from '../UI/Modal'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect, useRef } from 'react'
import { FaCalculator, FaCheck, FaTimes, FaSearch, FaChevronDown, FaChevronUp, FaDownload, FaBox, FaList } from 'react-icons/fa'
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

export default function CalculatorModal({ 
  isOpen, 
  onClose, 
  orders = [],
  candies = [],
  cakes = [],
  masses = [],
  cakeFrostings = [],
  products = [],
  onCalculate 
}) {
  const [selectedType, setSelectedType] = useState('docinhos')
  const [expandedOrders, setExpandedOrders] = useState({})
  const [selectedItems, setSelectedItems] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [calculations, setCalculations] = useState(null)
  const [expandedResults, setExpandedResults] = useState({
    items: true,
    masses: true,
    frostings: true
  })
  
  const resultsRef = useRef(null)

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
        frostings: true
      })
    }
  }, [isOpen])

  // DEBUG: Log dos dados recebidos
  useEffect(() => {
    console.log('🔍 CalculatorModal - Dados recebidos:', {
      isOpen,
      ordersCount: orders.length,
      candiesCount: candies.length,
      cakesCount: cakes.length,
      massesCount: masses.length,
      cakeFrostingsCount: cakeFrostings.length,
      productsCount: products.length,
      selectedType
    })
    
    if (orders.length > 0) {
      console.log('📦 Primeira encomenda:', orders[0])
    }
    if (candies.length > 0) {
      console.log('🍬 Primeiro doce:', candies[0])
    }
    if (cakes.length > 0) {
      console.log('🎂 Primeiro bolo:', cakes[0])
    }
  }, [isOpen, orders, candies, cakes, masses, cakeFrostings, products])

  // Filtrar encomendas por tipo e termo de busca
  const filteredOrders = orders.filter(order => {
    const matchesType = !selectedType || 
      order.type === selectedType || 
      order.type === 'ambos'
    
    const matchesSearch = !searchTerm || 
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesType && matchesSearch
  })

  // Obter itens de uma encomenda baseado no tipo selecionado
  const getOrderItems = (order) => {
    if (!order.items) return []
    
    const items = order.items.filter(item => {
      if (selectedType === 'docinhos') return item.itemType === 'candy'
      if (selectedType === 'bolos') return item.itemType === 'cake'
      return true // ambos
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
    }).filter(item => item.product) // Só inclui itens com produto encontrado

    console.log(`📋 Itens da encomenda ${order.orderNumber}:`, items)
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
    
    console.log(`🔘 Toggle item selection:`, { orderId, itemId: item.itemId, itemKey, item })
    
    setSelectedItems(prev => {
      if (prev[itemKey]) {
        // Remove o item se já estiver selecionado
        const newItems = { ...prev }
        delete newItems[itemKey]
        console.log('❌ Item removido:', itemKey)
        return newItems
      } else {
        // Adiciona o item com a quantidade da encomenda
        const newItems = {
          ...prev,
          [itemKey]: {
            ...item,
            quantity: item.quantity,
            product: item.product
          }
        }
        console.log('✅ Item adicionado:', itemKey, newItems[itemKey])
        return newItems
      }
    })
  }

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
    
    console.log(`📥 Selecionar todos na encomenda ${orderId}:`, newSelection)
    setSelectedItems(newSelection)
  }

  const deselectAllInOrder = (orderId) => {
    setSelectedItems(prev => {
      const newItems = { ...prev }
      Object.keys(newItems).forEach(key => {
        if (key.startsWith(orderId)) {
          delete newItems[key]
        }
      })
      console.log(`📤 Desselecionar todos na encomenda ${orderId}`)
      return newItems
    })
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
    
    console.log('📥 Selecionar todos os itens:', newSelection)
    setSelectedItems(newSelection)
  }

  const deselectAllItems = () => {
    console.log('📤 Desselecionar todos os itens')
    setSelectedItems({})
  }

  // Função para calcular custo de massa/cobertura
  const calculateMassCost = (mass) => {
    if (!mass || !mass.ingredients) return 0
    
    let totalCost = 0
    mass.ingredients.forEach(ingredient => {
      const product = products.find(p => p._id === ingredient.productId)
      if (product && ingredient.grams) {
        const ingredientGrams = parseFloat(ingredient.grams)
        let cost = 0

        if (product.unit === 'un') {
          const unitWeight = product.unitWeight || 50
          const units = ingredientGrams / unitWeight
          cost = units * (product.unitCost || product.costPerUnit || 0)
        } else {
          const convertedGrams = convertUnit(ingredientGrams, 'g', product.unit)
          cost = convertedGrams * (product.baseUnitCost || product.costPerUnit || 0)
        }

        totalCost += cost
      }
    })
    return totalCost
  }

  // Função para calcular custo completo do bolo
  const calculateCakeCost = (cake) => {
    if (!cake) return 0
    
    let totalCost = 0

    // Cálculo das massas do bolo
    if (cake.masses) {
      cake.masses.forEach(massItem => {
        const mass = masses.find(m => m.name === massItem.massName)
        if (mass && massItem.grams) {
          const massTotalCost = mass.cost || calculateMassCost(mass)
          const massCostPerGram = massTotalCost / mass.totalGrams
          const massGrams = parseFloat(massItem.grams)
          const massCost = massCostPerGram * massGrams
          totalCost += massCost
        }
      })
    }

    // Cálculo das coberturas do bolo
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

    console.log(`🎂 Custo do bolo ${cake?.name}: R$ ${totalCost.toFixed(2)}`)
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
          // Para unidades, calcula quantas unidades inteiras são necessárias
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
          // Para outros, converte para a unidade apropriada
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

  // Função para calcular custo correto baseado no tipo de produto
  const calculateItemCost = (item, product) => {
    if (!product) return 0
    
    if (selectedType === 'docinhos') {
      // Para docinhos: custo por unidade × quantidade
      const cost = (product.costPerUnit || 0) * item.quantity
      console.log(`🍬 Custo do doce ${product.name}: ${product.costPerUnit} × ${item.quantity} = R$ ${cost}`)
      return cost
    } else if (selectedType === 'bolos') {
      // Para bolos: calcular custo detalhado do bolo
      const cost = calculateCakeCost(product) * item.quantity
      console.log(`🎂 Custo do bolo ${product.name}: ${calculateCakeCost(product)} × ${item.quantity} = R$ ${cost}`)
      return cost
    }
    
    return 0
  }

  // Função para obter as massas corretamente baseado no tipo
  const getProductMasses = (product) => {
    if (!product) return []
    
    if (selectedType === 'docinhos') {
      // Para docinhos: usar masses array ou fallback para propriedades antigas
      return product.masses || [{ 
        massName: product.massName, 
        grams: product.candyGrams 
      }]
    } else if (selectedType === 'bolos') {
      // Para bolos: usar cakeMasses ou fallback
      return product.masses || product.cakeMasses || [{ 
        massName: product.massName, 
        grams: product.totalWeight 
      }]
    }
    
    return []
  }

  // Função principal de cálculo
  const handleCalculate = () => {
    console.log('🧮 Iniciando cálculo...')
    console.log('📊 Itens selecionados:', selectedItems)
    
    const selectedItemsArray = Object.values(selectedItems).filter(item => item.quantity > 0)
    console.log('📦 Itens selecionados (filtrados):', selectedItemsArray)
    
    if (selectedItemsArray.length === 0) {
      alert('Selecione pelo menos um item para calcular')
      return
    }

    if (selectedType === 'docinhos') {
      console.log('🍬 Calculando para docinhos...')
      // Cálculo para docinhos
      const candyDetails = []
      const massGroups = {}
      let totalCost = 0
      let totalRevenue = 0
      let totalProfit = 0

      selectedItemsArray.forEach((selectedItem, index) => {
        console.log(`📝 Processando doce ${index + 1}:`, selectedItem)
        const product = selectedItem.product
        const quantity = selectedItem.quantity

        if (product && quantity > 0) {
          // Calcular custo corretamente
          const itemCost = calculateItemCost(selectedItem, product)
          
          // Calcular receita corretamente
          let itemRevenue = 0
          if (selectedItem.unitPrice && selectedItem.unitPrice > 0) {
            itemRevenue = selectedItem.unitPrice * quantity
          } else if (product.salePrice) {
            itemRevenue = parseFloat(product.salePrice) * quantity
          }
          
          const itemProfit = itemRevenue - itemCost

          console.log(`💰 Doce ${product.name}: Custo R$ ${itemCost}, Receita R$ ${itemRevenue}, Lucro R$ ${itemProfit}`)

          candyDetails.push({
            candy: product,
            quantity,
            unitCost: product.costPerUnit || 0,
            totalCost: itemCost,
            salePrice: selectedItem.unitPrice || product.salePrice || 0,
            totalRevenue: itemRevenue,
            totalProfit: itemProfit,
            orderNumber: selectedItem.orderNumber
          })

          totalCost += itemCost
          totalRevenue += itemRevenue
          totalProfit += itemProfit

          // Processar massas dos docinhos
          const productMasses = getProductMasses(product)
          console.log(`🥣 Massas do doce ${product.name}:`, productMasses)

          productMasses.forEach(massItem => {
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
                  candy: product,
                  quantity: quantity,
                  grams: massGrams,
                  orderNumber: selectedItem.orderNumber
                })

                console.log(`⚖️ Massa ${massItem.massName}: +${massGrams}g (total: ${massGroups[massItem.massName].totalGrams}g)`)
              }
            }
          })
        }
      })

      console.log('📈 Resultado final docinhos:', {
        candyDetails,
        massGroups,
        totalCost,
        totalRevenue,
        totalProfit
      })

      setCalculations({
        candyDetails,
        massGroups,
        totalCost: totalCost.toFixed(2),
        totalRevenue: totalRevenue.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        type: 'docinhos'
      })
      
    } else if (selectedType === 'bolos') {
      console.log('🎂 Calculando para bolos...')
      // Cálculo para bolos
      const cakeDetails = []
      const massGroups = {}
      const frostingGroups = {}
      let totalCost = 0
      let totalRevenue = 0
      let totalProfit = 0

      // Processar cada bolo selecionado
      selectedItemsArray.forEach((selectedItem, index) => {
        console.log(`📝 Processando bolo ${index + 1}:`, selectedItem)
        const product = selectedItem.product
        const quantity = selectedItem.quantity

        if (product && quantity > 0) {
          // Calcular custo detalhado do bolo
          const cakeUnitCost = calculateCakeCost(product) || 0
          const cakeTotalCost = cakeUnitCost * quantity
          
          // Calcular receita
          let itemRevenue = 0
          if (selectedItem.unitPrice && selectedItem.unitPrice > 0) {
            itemRevenue = selectedItem.unitPrice * quantity
          } else if (product.salePrice) {
            itemRevenue = parseFloat(product.salePrice) * quantity
          } else {
            itemRevenue = cakeUnitCost * 3 * quantity // Fallback: 3x o custo
          }
          
          const itemProfit = itemRevenue - cakeTotalCost

          console.log(`💰 Bolo ${product.name}: Custo R$ ${cakeTotalCost}, Receita R$ ${itemRevenue}, Lucro R$ ${itemProfit}`)

          cakeDetails.push({
            cake: product,
            quantity,
            unitCost: cakeUnitCost,
            totalCost: cakeTotalCost,
            salePrice: selectedItem.unitPrice || product.salePrice || (cakeUnitCost * 3),
            revenue: itemRevenue,
            profit: itemProfit,
            orderNumber: selectedItem.orderNumber
          })

          totalCost += cakeTotalCost
          totalRevenue += itemRevenue
          totalProfit += itemProfit

          // Agrupar por massa
          if (product.masses) {
            console.log(`🥣 Massas do bolo ${product.name}:`, product.masses)
            product.masses.forEach(massItem => {
              if (massItem.massName && massItem.grams) {
                const mass = masses.find(m => m.name === massItem.massName)
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
                    orderNumber: selectedItem.orderNumber
                  })

                  console.log(`⚖️ Massa ${massItem.massName}: +${massGrams}g (total: ${massGroups[massItem.massName].totalGrams}g)`)
                }
              }
            })
          }

          // Agrupar por cobertura
          if (product.frostings) {
            console.log(`🍰 Coberturas do bolo ${product.name}:`, product.frostings)
            product.frostings.forEach(frostingItem => {
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
                    cake: product,
                    quantity: quantity,
                    grams: frostingGrams,
                    orderNumber: selectedItem.orderNumber
                  })

                  console.log(`🎂 Cobertura ${frostingItem.frostingName}: +${frostingGrams}g (total: ${frostingGroups[frostingItem.frostingName].totalGrams}g)`)
                }
              }
            })
          }
        }
      })

      console.log('📈 Resultado final bolos:', {
        cakeDetails,
        massGroups,
        frostingGroups,
        totalCost,
        totalRevenue,
        totalProfit
      })

      setCalculations({
        cakeDetails,
        massGroups,
        frostingGroups,
        totalCost: totalCost.toFixed(2),
        totalRevenue: totalRevenue.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        type: 'bolos'
      })
    }
  }

  const getSelectedItemsCount = () => {
    const count = Object.values(selectedItems).filter(item => item.quantity > 0).length
    console.log(`🔢 Itens selecionados: ${count}`)
    return count
  }

  const getTotalSelectedQuantity = () => {
    const total = Object.values(selectedItems).reduce((total, item) => total + (item.quantity || 0), 0)
    console.log(`🔢 Quantidade total selecionada: ${total}`)
    return total
  }

  const isItemSelected = (orderId, itemId) => {
    const selected = !!selectedItems[`${orderId}-${itemId}`]
    return selected
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
      // Salvar estado atual das seções
      const originalExpandedState = { ...expandedResults }
      
      // Expandir todas as seções temporariamente
      setExpandedResults({
        items: true,
        masses: true,
        frostings: true
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
      link.download = `calculo-producao-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

      // Restaurar estado original das seções
      setExpandedResults(originalExpandedState)

    } catch (error) {
      console.error('Erro ao salvar PNG:', error)
      alert('Erro ao salvar imagem. Tente novamente.')
    }
  }

  // Componente para renderizar os resultados expandidos (sempre aberto no PNG)
  const ResultsForPNG = () => (
    <div className="space-y-4 bg-gray-900 p-4 rounded-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">
          Resultados do Cálculo - {selectedType === 'docinhos' ? 'Docinhos' : 'Bolos'}
        </h3>
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

      {/* Conteúdo específico por tipo */}
      {calculations.type === 'bolos' ? (
        /* RESULTADOS PARA BOLOS - COMPLETO */
        <>
          {/* Bolos do Lote */}
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
                      {item.quantity} un • R$ {item.unitCost.toFixed(2)}/un • {item.orderNumber}
                    </div>
                    <div className="text-white/40 text-xs">
                      Custo: R$ {item.totalCost.toFixed(2)} • Receita: R$ {item.revenue.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-semibold text-sm">
                      R$ {item.revenue.toFixed(2)}
                    </div>
                    <div className="text-green-300 text-xs">
                      Lucro: R$ {item.profit.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Massas Agrupadas */}
          {Object.keys(calculations.massGroups).length > 0 && (
            <div>
              <h4 className="text-white font-semibold text-sm mb-2 border-b border-white/20 pb-1">
                Massas Agrupadas ({Object.keys(calculations.massGroups).length})
              </h4>
              <div className="space-y-3">
                {Object.entries(calculations.massGroups).map(([massName, massData]) => {
                  const ingredients = calculateMassIngredients(massData.mass, massData.totalGrams)
                  const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.quantity > 0)

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
            </div>
          )}

          {/* Coberturas Agrupadas */}
          {calculations.frostingGroups && Object.keys(calculations.frostingGroups).length > 0 && (
            <div>
              <h4 className="text-white font-semibold text-sm mb-2 border-b border-white/20 pb-1">
                Coberturas Agrupadas ({Object.keys(calculations.frostingGroups).length})
              </h4>
              <div className="space-y-3">
                {Object.entries(calculations.frostingGroups).map(([frostingName, frostingData]) => {
                  const ingredients = calculateFrostingIngredients(frostingData.frosting, frostingData.totalGrams)
                  const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.quantity > 0)

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
            </div>
          )}
        </>
      ) : (
        /* RESULTADOS PARA DOCINHOS */
        <>
          {/* Itens Selecionados */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-2 border-b border-white/20 pb-1">
              Itens Selecionados ({calculations.candyDetails.length})
            </h4>
            <div className="space-y-2">
              {calculations.candyDetails.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <div className="flex-1">
                    <span className="text-white font-medium text-sm">{item.candy.name}</span>
                    <div className="text-white/60 text-xs">
                      {item.quantity} un • {item.orderNumber}
                    </div>
                    <div className="text-white/40 text-xs">
                      Custo: R$ {item.totalCost.toFixed(2)} • Receita: R$ {item.totalRevenue.toFixed(2)}
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

          {/* Massas Agrupadas */}
          {masses.length > 0 && (
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
                      
                      {validIngredients.length > 0 ? (
                        <div>
                          <p className="text-white/60 text-xs mb-1">Ingredientes:</p>
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
                          Configure as massas e produtos para ver os ingredientes
                        </p>
                      )}
                    </div>
                  )
                }).filter(Boolean)}
              </div>
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
              </div>

              {/* Seleção de Tipo */}
              <div className="bg-white/5 rounded-2xl p-4">
                <h3 className="text-white font-semibold text-lg mb-3">Tipo de Produção</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedType('docinhos')}
                    className={`h-12 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2 ${
                      selectedType === 'docinhos'
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
                    className={`h-12 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2 ${
                      selectedType === 'bolos'
                        ? 'bg-primary-500/20 border-primary-400 text-primary-300'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-base">🎂</span>
                    <span className="text-sm font-medium">Bolos</span>
                  </button>
                </div>
              </div>

              {/* Busca */}
              <div className="bg-white/5 rounded-2xl p-4">
                <h3 className="text-white font-semibold text-lg mb-3">Buscar Encomendas</h3>
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
              </div>

              {/* Controles Globais */}
              {filteredOrders.length > 0 && (
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg">Encomendas</h3>
                      <p className="text-white/60 text-sm">
                        {getSelectedItemsCount()} itens selecionados • {getTotalSelectedQuantity()} unidades
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
                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                      isSelected
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
            </>
          ) : (
            /* RESULTADOS DO CÁLCULO - Interface interativa */
            <>
              {/* Interface normal com expansão */}
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
                            Bolos do Lote ({calculations.cakeDetails.length})
                          </h4>
                          {expandedResults.items ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </div>
                      </div>
                      
                      {expandedResults.items && (
                        <div className="p-3 bg-white/3 space-y-2 max-h-40 overflow-y-auto">
                          {calculations.cakeDetails.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                              <div className="flex-1">
                                <span className="text-white font-medium text-sm">{item.cake.name}</span>
                                <div className="text-white/60 text-xs">
                                  {item.quantity} un • R$ {item.unitCost.toFixed(2)}/un • {item.orderNumber}
                                </div>
                                <div className="text-white/40 text-xs">
                                  Custo: R$ {item.totalCost.toFixed(2)} • Receita: R$ {item.revenue.toFixed(2)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-green-400 font-semibold text-sm">
                                  R$ {item.revenue.toFixed(2)}
                                </div>
                                <div className="text-green-300 text-xs">
                                  Lucro: R$ {item.profit.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))}
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
                            Itens Selecionados ({calculations.candyDetails.length})
                          </h4>
                          {expandedResults.items ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </div>
                      </div>
                      
                      {expandedResults.items && (
                        <div className="p-3 bg-white/3 space-y-2 max-h-40 overflow-y-auto">
                          {calculations.candyDetails.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                              <div className="flex-1">
                                <span className="text-white font-medium text-sm">{item.candy.name}</span>
                                <div className="text-white/60 text-xs">
                                  {item.quantity} un • {item.orderNumber}
                                </div>
                                <div className="text-white/40 text-xs">
                                  Custo: R$ {item.totalCost.toFixed(2)} • Receita: R$ {item.totalRevenue.toFixed(2)}
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
                      )}
                    </div>

                    {/* Massas Agrupadas */}
                    {masses.length > 0 && (
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
                              if (massData.totalGrams < 0.5) return null

                              const ingredients = calculateMassIngredients(massData.mass, massData.totalGrams)
                              const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.quantity > 0)

                              return (
                                <div key={massName} className="p-3 rounded-lg bg-white/5">
                                  <h5 className="font-bold text-white text-sm mb-2">{massName}</h5>
                                  <p className="text-white/60 text-xs mb-2">
                                    Total necessário: <strong>{roundGrams(massData.totalGrams)}g</strong>
                                  </p>
                                  
                                  {validIngredients.length > 0 ? (
                                    <div>
                                      <p className="text-white/60 text-xs mb-1">Ingredientes:</p>
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
                                      Configure as massas e produtos para ver os ingredientes
                                    </p>
                                  )}
                                </div>
                              )
                            }).filter(Boolean)}
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

              {/* Componente oculto para o PNG - sempre expandido */}
              <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <div ref={resultsRef}>
                  <ResultsForPNG />
                </div>
              </div>
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