import Modal from '../UI/Modal'
import Input from '../UI/Input'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect } from 'react'
import { FaSave, FaTimes, FaPlus, FaTrash, FaCalculator, FaUser, FaBox } from 'react-icons/fa'

export default function OrderModal({
  isOpen,
  onClose,
  onSave,
  order,
  candies = [],
  cakes = [],
  supplies = []
}) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryDate: '',
    type: 'docinhos',
    status: 'encomendado',
    items: [],
    supplies: [],
    observations: '',
    profitMargin: '0.0',
    salePrice: ''
  })

  const [selectedType, setSelectedType] = useState('docinhos')
  const [profitInputType, setProfitInputType] = useState('none')
  const [costBreakdown, setCostBreakdown] = useState({
    candiesCost: 0,
    cakesCost: 0,
    suppliesCost: 0,
    totalCost: 0,
    salePrice: 0,
    profit: 0,
    profitMargin: 0
  })

  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    if (order) {
      setFormData({
        customerName: order.customerName || '',
        customerPhone: order.customerPhone || '',
        deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : '',
        type: order.type || 'docinhos',
        status: order.status || 'encomendado',
        items: order.items || [],
        supplies: order.supplies || [],
        observations: order.observations || '',
        profitMargin: order.costBreakdown?.profitMargin?.toFixed(1) || '0.0',
        salePrice: order.costBreakdown?.salePrice?.toFixed(2) || ''
      })
      setSelectedType(order.type || 'docinhos')
    } else {
      setFormData({
        customerName: '',
        customerPhone: '',
        deliveryDate: '',
        type: 'docinhos',
        status: 'encomendado',
        items: [],
        supplies: [],
        observations: '',
        profitMargin: '0.0',
        salePrice: ''
      })
      setSelectedType('docinhos')
    }
  }, [order, isOpen])

  // Função para calcular custo total e preço de venda da encomenda
  const calculateOrderCostAndPrice = (orderData) => {
    let candiesCost = 0
    let cakesCost = 0
    let suppliesCost = 0
    let totalSalePrice = 0

    // Calcular custo e preço de venda dos docinhos
    orderData.items.forEach(item => {
      if (item.itemType === 'candy') {
        const candy = candies.find(c => c._id === item.itemId)
        if (candy) {
          candiesCost += (Number(candy.costPerUnit) || 0) * (Number(item.quantity) || 0)
          totalSalePrice += (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0)
        }
      } else if (item.itemType === 'cake') {
        const cake = cakes.find(c => c._id === item.itemId)
        if (cake) {
          cakesCost += (Number(cake.costPerUnit) || 0) * (Number(item.quantity) || 0)
          totalSalePrice += (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0)
        }
      }
    })

    // Calcular custo dos insumos
    orderData.supplies.forEach(supply => {
      suppliesCost += (Number(supply.unitCost) || 0) * (Number(supply.quantity) || 0)
    })

    const totalCost = Number(candiesCost) + Number(cakesCost) + Number(suppliesCost)

    // Calcular margem de lucro baseada no custo total e preço de venda
    let profitMargin = 0
    if (totalCost > 0 && totalSalePrice > 0) {
      profitMargin = ((totalSalePrice - totalCost) / totalCost) * 100
    }

    const profit = totalSalePrice - totalCost

    return {
      candiesCost: Number(candiesCost) || 0,
      cakesCost: Number(cakesCost) || 0,
      suppliesCost: Number(suppliesCost) || 0,
      totalCost: Number(totalCost) || 0,
      salePrice: Number(totalSalePrice) || 0,
      profit: Number(profit) || 0,
      profitMargin: Number(profitMargin) || 0
    }
  }

  // Calcular preço de venda baseado no custo e margem
  const calculateSalePrice = (cost, profitMargin) => {
    return cost * (1 + profitMargin / 100)
  }

  // Calcular margem baseada no custo e preço de venda
  const calculateProfitMargin = (cost, salePrice) => {
    return ((salePrice - cost) / cost) * 100
  }

  // Atualizar cálculos automaticamente quando itens ou supplies mudarem
  useEffect(() => {
    if (isCalculating) return

    const calculatedData = calculateOrderCostAndPrice(formData)

    setCostBreakdown(calculatedData)

    // Sempre atualizar os campos com os valores calculados automaticamente
    // A menos que o usuário esteja editando manualmente
    if (profitInputType === 'none') {
      setFormData(prev => ({
        ...prev,
        salePrice: calculatedData.salePrice > 0 ? calculatedData.salePrice.toFixed(2) : '',
        profitMargin: calculatedData.profitMargin.toFixed(1)
      }))
    }

    // Atualizar preços totais nos itens
    const updatedItems = formData.items.map(item => {
      let unitCost = 0
      if (item.itemType === 'candy') {
        const candy = candies.find(c => c._id === item.itemId)
        unitCost = Number(candy?.costPerUnit) || 0
      } else if (item.itemType === 'cake') {
        const cake = cakes.find(c => c._id === item.itemId)
        unitCost = Number(cake?.costPerUnit) || 0
      }

      const totalPrice = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0)
      const cost = unitCost * (Number(item.quantity) || 0)

      return {
        ...item,
        totalPrice: totalPrice,
        cost: cost
      }
    })

    if (JSON.stringify(updatedItems) !== JSON.stringify(formData.items)) {
      setFormData(prev => ({ ...prev, items: updatedItems }))
    }
  }, [formData.items, formData.supplies])

  // Funções para itens
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        itemType: selectedType === 'docinhos' ? 'candy' : 'cake',
        itemId: '',
        itemName: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        cost: 0
      }]
    }))
  }

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, items: newItems }))
  }

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value

    // Atualizar nome e preço automaticamente quando selecionar item
    if (field === 'itemId') {
      if (newItems[index].itemType === 'candy') {
        const candy = candies.find(c => c._id === value)
        newItems[index].itemName = candy?.name || ''
        // Usar o preço de venda do produto como sugestão
        newItems[index].unitPrice = candy?.salePrice || 0
      } else {
        const cake = cakes.find(c => c._id === value)
        newItems[index].itemName = cake?.name || ''
        // Usar o preço de venda do produto como sugestão
        newItems[index].unitPrice = cake?.salePrice || 0
      }
    }

    // Calcular preço total do item automaticamente
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = Number(newItems[index].quantity) || 0
      const unitPrice = Number(newItems[index].unitPrice) || 0
      newItems[index].totalPrice = quantity * unitPrice
    }

    setFormData(prev => ({ ...prev, items: newItems }))
  }

  // Funções para insumos
  const addSupply = () => {
    setFormData(prev => ({
      ...prev,
      supplies: [...prev.supplies, {
        supplyId: '',
        supplyName: '',
        quantity: 1,
        unitCost: 0,
        totalCost: 0
      }]
    }))
  }

  const removeSupply = (index) => {
    const newSupplies = formData.supplies.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, supplies: newSupplies }))
  }

  const updateSupply = (index, field, value) => {
    const newSupplies = [...formData.supplies]
    newSupplies[index][field] = value

    if (field === 'supplyId') {
      const supply = supplies.find(s => s._id === value)
      newSupplies[index].supplyName = supply?.name || ''
      newSupplies[index].unitCost = Number(supply?.cost) || 0
    }

    // Calcular custo total automaticamente
    if (field === 'quantity' || field === 'unitCost') {
      newSupplies[index].totalCost = (Number(newSupplies[index].quantity) || 0) * (Number(newSupplies[index].unitCost) || 0)
    }

    setFormData(prev => ({ ...prev, supplies: newSupplies }))
  }

  // Funções para margem de lucro
  const handleProfitMarginChange = (value) => {
    setProfitInputType('percentage')
    setFormData(prev => ({
      ...prev,
      profitMargin: value
    }))
  }

  const handleSalePriceChange = (value) => {
    setProfitInputType('price')
    setFormData(prev => ({
      ...prev,
      salePrice: value
    }))
  }

  // Calcular quando o usuário terminar de editar (onBlur)
  const handleProfitMarginBlur = () => {
    if (formData.profitMargin === '' || formData.profitMargin === '0.0') {
      setProfitInputType('none')
      return
    }

    setIsCalculating(true)
    const profitMarginValue = parseFloat(formData.profitMargin) || 0
    const calculatedSalePrice = calculateSalePrice(costBreakdown.totalCost, profitMarginValue)

    setFormData(prev => ({
      ...prev,
      salePrice: calculatedSalePrice.toFixed(2),
      profitMargin: profitMarginValue.toFixed(1)
    }))

    setCostBreakdown(prev => ({
      ...prev,
      salePrice: calculatedSalePrice,
      profit: calculatedSalePrice - prev.totalCost,
      profitMargin: profitMarginValue
    }))

    setTimeout(() => {
      setIsCalculating(false)
      setProfitInputType('none')
    }, 100)
  }

  const handleSalePriceBlur = () => {
    if (formData.salePrice === '') {
      setProfitInputType('none')
      return
    }

    setIsCalculating(true)
    const salePriceValue = parseFloat(formData.salePrice) || 0
    let profitMarginValue = 0

    if (costBreakdown.totalCost > 0) {
      profitMarginValue = calculateProfitMargin(costBreakdown.totalCost, salePriceValue)
    }

    setFormData(prev => ({
      ...prev,
      profitMargin: profitMarginValue.toFixed(1)
    }))

    setCostBreakdown(prev => ({
      ...prev,
      salePrice: salePriceValue,
      profit: salePriceValue - prev.totalCost,
      profitMargin: profitMarginValue
    }))

    setTimeout(() => {
      setIsCalculating(false)
      setProfitInputType('none')
    }, 100)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.customerName || !formData.deliveryDate) {
      alert('Por favor, preencha o nome do cliente e a data de entrega')
      return
    }

    if (formData.items.length === 0) {
      alert('Por favor, adicione pelo menos um item à encomenda')
      return
    }

    const orderData = {
      ...formData,
      deliveryDate: new Date(formData.deliveryDate),
      costBreakdown,
      profitMargin: parseFloat(formData.profitMargin) || 0,
      salePrice: parseFloat(formData.salePrice) || costBreakdown.salePrice,
      items: formData.items.map(item => ({
        ...item,
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        totalPrice: Number(item.totalPrice) || 0,
        cost: Number(item.cost) || 0
      })),
      supplies: formData.supplies.map(supply => ({
        ...supply,
        quantity: Number(supply.quantity) || 0,
        unitCost: Number(supply.unitCost) || 0,
        totalCost: Number(supply.totalCost) || 0
      }))
    }

    onSave(orderData)
  }

  const availableItems = selectedType === 'docinhos' ? candies : cakes

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={order ? 'Editar Encomenda' : 'Nova Encomenda'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Header fixo */}
        <div className="flex-shrink-0 p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white text-center">
            {order ? 'Editar Encomenda' : 'Nova Encomenda'}
          </h2>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
            <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
              <FaBox className="w-4 h-4" />
              Sobre Encomendas
            </h4>
            <p className="text-blue-200 text-sm">
              Crie encomendas personalizadas com docinhos, bolos e insumos extras. O sistema calcula automaticamente custos e preços.
            </p>
          </div>

          {/* Informações do Cliente - REMOVIDO EMAIL */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome do Cliente *"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Nome completo do cliente"
                required
              />

              <Input
                label="Telefone"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>

            {/* Data de Entrega - CORRIGIDA RESPONSIVIDADE */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-white/60 text-xs mb-2">Data de Entrega *</label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                  className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Tipo e Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs mb-2">Tipo de Encomenda *</label>
              <select
                value={formData.type}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, type: e.target.value, items: [] }))
                  setSelectedType(e.target.value)
                }}
                className="w-full glass-input h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                required
                style={{
                  WebkitAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1em'
                }}
              >
                <option value="docinhos">Docinhos</option>
                <option value="bolos">Bolos</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>

            <div>
              <label className="block text-white/60 text-xs mb-2">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full glass-input h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                required
                style={{
                  WebkitAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1em'
                }}
              >
                <option value="encomendado">Encomendado</option>
                <option value="iniciando">Iniciando</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
          </div>

          {/* Seção de Itens - LAYOUT MOBILE FIRST */}
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">Itens da Encomenda</h3>
                <p className="text-white/60 text-sm">
                  {selectedType === 'docinhos' ? 'Selecione os docinhos' :
                    selectedType === 'bolos' ? 'Selecione os bolos' : 'Selecione docinhos e bolos'}
                </p>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="w-10 h-10 rounded-xl bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 flex items-center justify-center transition-colors"
              >
                <FaPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-3 border border-white/10">
                  {/* Header do item */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium text-sm">
                      Item {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 flex items-center justify-center transition-colors"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Campos do item */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/60 text-xs mb-2">Produto</label>
                      <select
                        value={item.itemId}
                        onChange={(e) => updateItem(index, 'itemId', e.target.value)}
                        className="w-full glass-input h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        required
                        style={{
                          WebkitAppearance: 'none',
                          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 1rem center',
                          backgroundSize: '1em'
                        }}
                      >
                        <option value="">Selecione o produto</option>
                        {availableItems && availableItems.map && availableItems.map(availableItem => (
                          <option key={availableItem?._id || index} value={availableItem?._id}>
                            {availableItem?.name} - R$ {availableItem?.salePrice?.toFixed(2) || '0.00'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white/60 text-xs mb-2">Quantidade</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white/60 text-xs mb-2">Preço Unitário (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                          className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">Total do item:</span>
                        <span className="text-green-400 font-bold text-lg">
                          R$ {item.totalPrice?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seção de Insumos - LAYOUT MOBILE FIRST */}
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">Insumos Adicionais</h3>
                <p className="text-white/60 text-sm">Adicione insumos extras para esta encomenda</p>
              </div>
              <button
                type="button"
                onClick={addSupply}
                className="w-10 h-10 rounded-xl bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 flex items-center justify-center transition-colors"
              >
                <FaPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {formData.supplies.map((supply, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-3 border border-white/10">
                  {/* Header do insumo */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium text-sm">
                      Insumo {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSupply(index)}
                      className="w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 flex items-center justify-center transition-colors"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Campos do insumo */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/60 text-xs mb-2">Insumo</label>
                      <select
                        value={supply.supplyId}
                        onChange={(e) => updateSupply(index, 'supplyId', e.target.value)}
                        className="w-full glass-input h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        style={{
                          WebkitAppearance: 'none',
                          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 1rem center',
                          backgroundSize: '1em'
                        }}
                      >
                        <option value="">Selecione o insumo</option>
                        {supplies && supplies.map && supplies.map(supplyItem => (
                          <option key={supplyItem?._id || index} value={supplyItem?._id}>
                            {supplyItem?.name} - R$ {Number(supplyItem?.cost).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white/60 text-xs mb-2">Quantidade</label>
                        <input
                          type="number"
                          min="1"
                          value={supply.quantity}
                          onChange={(e) => updateSupply(index, 'quantity', e.target.value)}
                          className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-white/60 text-xs mb-2">Custo Unitário (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={supply.unitCost}
                          onChange={(e) => updateSupply(index, 'unitCost', e.target.value)}
                          className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">Custo total:</span>
                        <span className="text-purple-400 font-bold text-lg">
                          R$ {supply.totalCost?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-white/60 text-xs mb-2">
              Observações (opcional)
            </label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              placeholder="Observações sobre a encomenda, detalhes especiais, etc."
              rows="3"
              className="w-full h-24 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
            />
          </div>

          {/* Cálculo Financeiro */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
            <h4 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
              <FaCalculator className="w-4 h-4" />
              Cálculo do Preço de Venda
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-xs mb-2">Margem de Lucro (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1000"
                  value={formData.profitMargin}
                  onChange={(e) => handleProfitMarginChange(e.target.value)}
                  onBlur={handleProfitMarginBlur}
                  className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  placeholder="0.0"
                />
                <p className="text-white/60 text-xs mt-1">
                  {formData.salePrice && `Preço: R$ ${formData.salePrice}`}
                </p>
              </div>

              <div>
                <label className="block text-white/60 text-xs mb-2">Preço de Venda (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.salePrice}
                  onChange={(e) => handleSalePriceChange(e.target.value)}
                  onBlur={handleSalePriceBlur}
                  className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  placeholder="0.00"
                />
                <p className="text-white/60 text-xs mt-1">
                  {formData.profitMargin && `Margem: ${formData.profitMargin}%`}
                </p>
              </div>
            </div>

            {/* Visualização do Custo em Tempo Real */}
            {(formData.items.length > 0) && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/80">Custo docinhos:</span>
                    <span className="text-blue-400">R$ {costBreakdown.candiesCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Custo bolos:</span>
                    <span className="text-pink-400">R$ {costBreakdown.cakesCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Custo insumos:</span>
                    <span className="text-purple-400">R$ {costBreakdown.suppliesCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/20 pt-2">
                    <span className="text-white font-semibold">Custo total:</span>
                    <span className="text-white font-bold">R$ {costBreakdown.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Preço de venda:</span>
                    <span className="text-green-400 font-bold">R$ {costBreakdown.salePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Lucro:</span>
                    <span className="text-green-300 font-semibold">R$ {costBreakdown.profit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Margem de lucro:</span>
                    <span className={`font-semibold ${costBreakdown.profitMargin >= 0 ? 'text-green-300' : 'text-red-300'
                      }`}>
                      {costBreakdown.profitMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer fixo */}
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
              type="submit"
              className="flex-1 h-12"
            >
              <FaSave className="w-4 h-4" />
              <span>{order ? 'Atualizar' : 'Criar'}</span>
            </GlassButton>
          </div>
        </div>
      </form>
    </Modal>
  )
}