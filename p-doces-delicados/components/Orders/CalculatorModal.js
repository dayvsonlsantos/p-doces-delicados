import Modal from '../UI/Modal'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect, useRef } from 'react'
import { FaCalculator, FaCheck, FaTimes, FaSearch, FaChevronDown, FaChevronUp, FaDownload, FaBox, FaList } from 'react-icons/fa'
import html2canvas from 'html2canvas'

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
    masses: true
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
        masses: true
      })
    }
  }, [isOpen])

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
    
    return order.items.filter(item => {
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
        customerName: order.customerName
      }
    }).filter(item => item.product) // Só inclui itens com produto encontrado
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
        // Remove o item se já estiver selecionado
        const newItems = { ...prev }
        delete newItems[itemKey]
        return newItems
      } else {
        // Adiciona o item com a quantidade da encomenda
        return {
          ...prev,
          [itemKey]: {
            ...item,
            quantity: item.quantity // Usa a quantidade original da encomenda
          }
        }
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
        quantity: item.quantity
      }
    })
    
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
          quantity: item.quantity
        }
      })
    })
    
    setSelectedItems(newSelection)
  }

  const deselectAllItems = () => {
    setSelectedItems({})
  }

  // Função para calcular ingredientes totais de uma massa com arredondamento
  const calculateMassIngredients = (mass, totalGrams) => {
    if (!mass || !mass.ingredients) return {}
    
    const scaleFactor = totalGrams / mass.totalGrams
    const ingredients = {}

    mass.ingredients.forEach(ingredient => {
      const product = products.find(p => p._id === ingredient.productId)
      if (product) {
        let scaledGrams = ingredient.grams * scaleFactor
        scaledGrams = roundGrams(scaledGrams)
        
        if (scaledGrams >= 0.5) {
          ingredients[product.name] = {
            grams: scaledGrams,
            product: product
          }
        }
      }
    })

    return ingredients
  }

  const handleCalculate = () => {
    const selectedItemsArray = Object.values(selectedItems).filter(item => item.quantity > 0)
    if (selectedItemsArray.length === 0) {
      alert('Selecione pelo menos um item para calcular')
      return
    }

    // Cálculos
    const candyDetails = []
    const massGroups = {}
    let totalCost = 0
    let totalRevenue = 0
    let totalProfit = 0

    // Processar cada item selecionado
    selectedItemsArray.forEach(selectedItem => {
      const candy = selectedItem.product
      const quantity = selectedItem.quantity

      if (candy && quantity > 0) {
        const candyCost = candy.costPerUnit || 0
        const candyRevenue = candy.salePrice ? parseFloat(candy.salePrice) * quantity : 0
        const candyProfit = candyRevenue - (candyCost * quantity)

        candyDetails.push({
          candy,
          quantity,
          totalCost: candyCost * quantity,
          totalRevenue: candyRevenue,
          totalProfit: candyProfit,
          orderNumber: selectedItem.orderNumber
        })

        totalCost += candyCost * quantity
        totalRevenue += candyRevenue
        totalProfit += candyProfit

        // Agrupar por massa
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
                grams: massGrams,
                orderNumber: selectedItem.orderNumber
              })
            }
          }
        })
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

  const getSelectedItemsCount = () => {
    return Object.values(selectedItems).filter(item => item.quantity > 0).length
  }

  const getTotalSelectedQuantity = () => {
    return Object.values(selectedItems).reduce((total, item) => total + (item.quantity || 0), 0)
  }

  const isItemSelected = (orderId, itemId) => {
    return !!selectedItems[`${orderId}-${itemId}`]
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
        masses: true
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
        <h3 className="text-lg font-bold text-white">Resultados do Cálculo</h3>
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

      {/* Itens Selecionados - SEMPRE ABERTO no PNG */}
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
      {masses.length > 0 && (
        <div>
          <h4 className="text-white font-semibold text-sm mb-2 border-b border-white/20 pb-1">
            Massas Agrupadas ({Object.keys(calculations.massGroups).length})
          </h4>
          <div className="space-y-3">
            {Object.entries(calculations.massGroups).map(([massName, massData]) => {
              if (massData.totalGrams < 0.5) return null

              const ingredients = calculateMassIngredients(massData.mass, massData.totalGrams)
              const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.grams >= 0.5)

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
                              {roundGrams(data.grams)}g
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

      {/* Informação sobre arredondamento */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-blue-300 text-xs text-center">
          💡 <strong>Arredondamento aplicado:</strong> Valores abaixo de 0.5g = 0g, 0.5g+ = inteiro mais próximo
        </p>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Calculadora de Produção"
      size="lg" // Alterado para fullscreen no mobile
    >
      <div className="flex flex-col h-full">
        {/* Header fixo */}
        <div className="flex-shrink-0 p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white text-center">
            Calculadora de Produção
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
                                      {item.product?.candyGrams && (
                                        <div className="text-white/40 text-xs">
                                          {item.product.candyGrams}g por unidade
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
                  <h3 className="text-lg font-bold text-white">Resultados do Cálculo</h3>
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

                {/* Itens Selecionados - Interface interativa */}
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

                {/* Massas Agrupadas - Interface interativa */}
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
                          const validIngredients = Object.entries(ingredients).filter(([_, data]) => data.grams >= 0.5)

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
                                          {roundGrams(data.grams)}g
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

                {/* Informação sobre arredondamento */}
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-blue-300 text-xs text-center">
                    💡 <strong>Arredondamento aplicado:</strong> Valores abaixo de 0.5g = 0g, 0.5g+ = inteiro mais próximo
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