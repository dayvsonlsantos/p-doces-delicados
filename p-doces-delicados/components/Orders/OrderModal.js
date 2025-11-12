import Modal from '../UI/Modal'
import Input from '../UI/Input'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect, useRef } from 'react'
import { FaSave, FaTimes, FaPlus, FaTrash, FaCalculator, FaUser, FaBox, FaMoneyBillWave, FaCreditCard, FaReceipt, FaPercent, FaDollarSign, FaCalendar } from 'react-icons/fa'

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
    salePrice: '',
    paymentStatus: 'pending',
    paymentMethod: 'money',
    discount: '0',
    discountType: 'percentage',
    paymentParts: [{
      amount: '',
      dueDate: '',
      paid: false,
      paymentMethod: 'money'
    }]
  })

  const DeliveDateRef = useRef(null);
  const endPaymentDateRef = useRef(null);

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
  const [finalPrice, setFinalPrice] = useState(0)

  // CORREÇÃO: Quando a data de entrega muda, atualizar a data de vencimento das parcelas
  useEffect(() => {
    if (formData.deliveryDate) {
      setFormData(prev => ({
        ...prev,
        paymentParts: prev.paymentParts.map((part, index) => ({
          ...part,
          dueDate: index === 0 ? formData.deliveryDate : part.dueDate // Primeira parcela usa data de entrega
        }))
      }))
    }
  }, [formData.deliveryDate])

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
        salePrice: order.costBreakdown?.salePrice?.toFixed(2) || '',
        paymentStatus: order.paymentStatus || 'pending',
        paymentMethod: order.paymentMethod || 'money',
        discount: order.discount?.toString() || '0',
        discountType: order.discountType || 'percentage',
        paymentParts: order.paymentParts || [{
          amount: order.costBreakdown?.salePrice?.toFixed(2) || '',
          dueDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : '',
          paid: order.paymentStatus === 'paid',
          paymentMethod: order.paymentMethod || 'money'
        }]
      })
      setSelectedType(order.type || 'docinhos')
    } else {
      // CORREÇÃO: Para nova encomenda, definir data padrão como hoje
      const defaultDeliveryDate = new Date()

      setFormData({
        customerName: '',
        customerPhone: '',
        deliveryDate: defaultDeliveryDate.toISOString().split('T')[0], // Data de hoje
        type: 'docinhos',
        status: 'encomendado',
        items: [],
        supplies: [],
        observations: '',
        profitMargin: '0.0',
        salePrice: '',
        paymentStatus: 'pending',
        paymentMethod: 'money',
        discount: '0',
        discountType: 'percentage',
        paymentParts: [{
          amount: '',
          dueDate: defaultDeliveryDate.toISOString().split('T')[0], // CORREÇÃO: mesma data da entrega (hoje)
          paid: false,
          paymentMethod: 'money'
        }]
      })
      setSelectedType('docinhos')
    }
  }, [order, isOpen])

  // Calcular preço final com desconto - MELHORADO
  useEffect(() => {
    const salePrice = parseFloat(formData.salePrice) || 0
    const discount = parseFloat(formData.discount) || 0

    let finalPrice = salePrice
    let discountValue = 0

    if (formData.discountType === 'percentage' && discount > 0) {
      discountValue = salePrice * (discount / 100)
      finalPrice = salePrice - discountValue
    } else if (formData.discountType === 'fixed' && discount > 0) {
      discountValue = discount
      finalPrice = salePrice - discount
    }

    setFinalPrice(finalPrice > 0 ? finalPrice : 0)

    // Atualizar valores das parcelas
    if (formData.paymentParts.length === 1 && formData.paymentStatus !== 'partial') {
      setFormData(prev => ({
        ...prev,
        paymentParts: [{
          ...prev.paymentParts[0],
          amount: finalPrice.toFixed(2)
        }]
      }))
    } else if (formData.paymentStatus === 'partial') {
      // Para pagamento parcial, redistribuir o valor entre as parcelas
      const partValue = finalPrice / formData.paymentParts.length
      setFormData(prev => ({
        ...prev,
        paymentParts: prev.paymentParts.map(part => ({
          ...part,
          amount: partValue.toFixed(2)
        }))
      }))
    }
  }, [formData.salePrice, formData.discount, formData.discountType, formData.paymentStatus, formData.paymentParts.length])

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

    if (field === 'itemId') {
      if (newItems[index].itemType === 'candy') {
        const candy = candies.find(c => c._id === value)
        newItems[index].itemName = candy?.name || ''
        newItems[index].unitPrice = candy?.salePrice || 0
      } else {
        const cake = cakes.find(c => c._id === value)
        newItems[index].itemName = cake?.name || ''
        newItems[index].unitPrice = cake?.salePrice || 0
      }
    }

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

    if (field === 'quantity' || field === 'unitCost') {
      newSupplies[index].totalCost = (Number(newSupplies[index].quantity) || 0) * (Number(newSupplies[index].unitCost) || 0)
    }

    setFormData(prev => ({ ...prev, supplies: newSupplies }))
  }

  const handleDiscountChange = (value) => {
    setFormData(prev => ({ ...prev, discount: value }))
  }

  const handleDiscountTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      discountType: type,
      discount: '0' // Resetar desconto ao mudar o tipo
    }))
  }

  const calculateDiscountValue = () => {
    const salePrice = parseFloat(formData.salePrice) || 0
    const discount = parseFloat(formData.discount) || 0

    if (formData.discountType === 'percentage' && discount > 0) {
      return salePrice * (discount / 100)
    } else if (formData.discountType === 'fixed' && discount > 0) {
      return discount
    }
    return 0
  }

  // Funções para pagamento - COMPLETAS
  const addPaymentPart = () => {
    setFormData(prev => ({
      ...prev,
      paymentParts: [...prev.paymentParts, {
        amount: (finalPrice / (prev.paymentParts.length + 1)).toFixed(2),
        dueDate: prev.deliveryDate, // CORREÇÃO: usar data de entrega como padrão
        paid: false,
        paymentMethod: 'money'
      }]
    }))
  }

  const removePaymentPart = (index) => {
    if (formData.paymentParts.length <= 1) return
    const newParts = formData.paymentParts.filter((_, i) => i !== index)

    // Redistribuir o valor entre as parcelas restantes
    const newPartValue = finalPrice / newParts.length
    const updatedParts = newParts.map(part => ({
      ...part,
      amount: newPartValue.toFixed(2)
    }))

    setFormData(prev => ({ ...prev, paymentParts: updatedParts }))
  }

  const updatePaymentPart = (index, field, value) => {
    const newParts = [...formData.paymentParts]
    newParts[index][field] = value
    setFormData(prev => ({ ...prev, paymentParts: newParts }))
  }

  const handlePaymentStatusChange = (status) => {
    if (status === 'partial') {
      // Para pagamento parcial, dividir automaticamente em 2 partes
      setFormData(prev => ({
        ...prev,
        paymentStatus: status,
        paymentParts: [
          {
            amount: (finalPrice / 2).toFixed(2),
            dueDate: prev.deliveryDate, // CORREÇÃO: usar data de entrega
            paid: false,
            paymentMethod: 'money'
          },
          {
            amount: (finalPrice / 2).toFixed(2),
            dueDate: prev.deliveryDate, // CORREÇÃO: mesma data inicialmente
            paid: false,
            paymentMethod: 'money'
          }
        ]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        paymentStatus: status,
        paymentParts: [{
          amount: finalPrice.toFixed(2),
          dueDate: prev.deliveryDate, // CORREÇÃO: usar data de entrega
          paid: status === 'paid',
          paymentMethod: prev.paymentMethod
        }]
      }))
    }
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

    // Validar parcelas de pagamento
    if (formData.paymentStatus === 'partial') {
      const totalParts = formData.paymentParts.reduce((sum, part) => sum + (parseFloat(part.amount) || 0), 0)
      if (Math.abs(totalParts - finalPrice) > 0.01) {
        alert(`A soma das parcelas (R$ ${totalParts.toFixed(2)}) não corresponde ao valor final (R$ ${finalPrice.toFixed(2)})`)
        return
      }
    }

    const orderData = {
      ...formData,
      deliveryDate: new Date(formData.deliveryDate),
      costBreakdown,
      profitMargin: parseFloat(formData.profitMargin) || 0,
      salePrice: parseFloat(formData.salePrice) || costBreakdown.salePrice,
      discount: parseFloat(formData.discount) || 0,
      finalPrice: finalPrice,
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
      })),
      paymentParts: formData.paymentParts.map(part => ({
        ...part,
        amount: parseFloat(part.amount) || 0,
        dueDate: part.dueDate ? new Date(part.dueDate) : new Date(formData.deliveryDate) // CORREÇÃO: garantir data
      }))
    }

    onSave(orderData)
  }

  const availableItems = selectedType === 'docinhos' ? candies : cakes
  const discountValue = calculateDiscountValue()

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

          {/* Informações do Cliente */}
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

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-white/60 text-xs mb-2">Data de Entrega *</label>
                <div className='relative'>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                    className="w-full h-12 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent [&::-webkit-calendar-picker-indicator]:opacity-0"
                    required
                    ref={DeliveDateRef}
                  />
                  <button
                    type="button"
                    onClick={() => DeliveDateRef.current?.showPicker()}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    <FaCalendar />
                  </button>
                </div>
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

          {/* Seção de Itens */}
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

          {/* Seção de Insumos */}
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

            {/* Desconto - MELHORADO */}
            <div className="mt-4">
              <label className="block text-white/60 text-xs mb-2">Desconto</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Seletor de Tipo de Desconto */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDiscountTypeChange('percentage')}
                    className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border transition-all duration-200 ${formData.discountType === 'percentage'
                      ? 'bg-primary-500/20 border-primary-400 text-primary-300'
                      : 'bg-white/10 border-white/20 text-white/60 hover:bg-white/20'
                      }`}
                  >
                    <FaPercent className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDiscountTypeChange('fixed')}
                    className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border transition-all duration-200 ${formData.discountType === 'fixed'
                      ? 'bg-primary-500/20 border-primary-400 text-primary-300'
                      : 'bg-white/10 border-white/20 text-white/60 hover:bg-white/20'
                      }`}
                  >
                    <span>R$</span>
                  </button>
                </div>

                {/* Input do Desconto */}
                <div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    value={formData.discount}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    placeholder={formData.discountType === 'percentage' ? '0.00%' : '0.00'}
                  />
                </div>

                {/* Valor do Desconto */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm">Desconto:</span>
                    <span className="text-yellow-400 font-bold text-lg">
                      R$ {discountValue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preço Final */}
            <div className="mt-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-white/80 text-sm">Preço Final</span>
                    <p className="text-white/60 text-xs">
                      {formData.discount > 0 && (
                        formData.discountType === 'percentage'
                          ? `Desconto de ${formData.discount}% aplicado`
                          : `Desconto de R$ ${formData.discount} aplicado`
                      )}
                    </p>
                  </div>
                  <span className="text-green-400 font-bold text-xl">
                    R$ {finalPrice.toFixed(2)}
                  </span>
                </div>
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
                  {discountValue > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/80">Desconto:</span>
                      <span className="text-yellow-400 font-semibold">
                        - R$ {discountValue.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/20 pt-2">
                    <span className="text-white font-semibold">Preço final:</span>
                    <span className="text-green-300 font-bold">R$ {finalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Lucro:</span>
                    <span className="text-green-300 font-semibold">R$ {(finalPrice - costBreakdown.totalCost).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Margem de lucro:</span>
                    <span className={`font-semibold ${(finalPrice - costBreakdown.totalCost) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {costBreakdown.totalCost > 0 ? (((finalPrice - costBreakdown.totalCost) / costBreakdown.totalCost) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Seção de Pagamento */}
          <div className="bg-white/5 rounded-2xl p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FaMoneyBillWave className="w-4 h-4" />
              Informações de Pagamento
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-white/60 text-xs mb-2">Status do Pagamento</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => handlePaymentStatusChange(e.target.value)}
                  className="w-full glass-input h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  style={{
                    WebkitAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1em'
                  }}
                >
                  <option value="pending">A Pagar</option>
                  <option value="paid">Pago</option>
                  <option value="partial">Parcial</option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 text-xs mb-2">Método de Pagamento</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full glass-input h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  style={{
                    WebkitAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1em'
                  }}
                >
                  <option value="money">Dinheiro</option>
                  <option value="card">Cartão</option>
                  <option value="pix">PIX</option>
                  <option value="transfer">Transferência</option>
                </select>
              </div>
            </div>

            {/* Parcelas de Pagamento */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-white font-medium">Parcelas do Pagamento</h5>
                {formData.paymentStatus === 'partial' && (
                  <button
                    type="button"
                    onClick={addPaymentPart}
                    className="w-8 h-8 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 flex items-center justify-center transition-colors"
                  >
                    <FaPlus className="w-3 h-3" />
                  </button>
                )}
              </div>

              {formData.paymentParts.map((part, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium text-sm">
                      Parcela {index + 1}
                    </span>
                    {formData.paymentStatus === 'partial' && formData.paymentParts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePaymentPart(index)}
                        className="w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 flex items-center justify-center transition-colors"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-white/60 text-xs mb-2">Valor (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={part.amount}
                        onChange={(e) => updatePaymentPart(index, 'amount', e.target.value)}
                        className="w-full h-10 px-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-white/60 text-xs mb-2">Data de Vencimento</label>
                      <div className='relative'>
                        <input
                          type="date"
                          value={part.dueDate}
                          onChange={(e) => updatePaymentPart(index, 'dueDate', e.target.value)}
                          className="w-full h-10 px-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent [&::-webkit-calendar-picker-indicator]:opacity-0"
                          required
                          ref={endPaymentDateRef}
                        />
                        <button
                          type="button"
                          onClick={() => endPaymentDateRef.current?.showPicker()}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                        >
                          <FaCalendar />
                        </button>
                      </div>
                    </div>


                    <div>
                      <label className="block text-white/60 text-xs mb-2">Status</label>
                      <select
                        value={part.paid ? 'paid' : 'pending'}
                        onChange={(e) => updatePaymentPart(index, 'paid', e.target.value === 'paid')}
                        className="w-full h-10 px-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        style={{
                          WebkitAppearance: 'none',
                          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.5rem center',
                          backgroundSize: '1em'
                        }}
                      >
                        <option value="pending">Pendente</option>
                        <option value="paid">Pago</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {/* Resumo do Pagamento */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Total a pagar:</span>
                  <span className="text-blue-400 font-bold text-lg">
                    R$ {finalPrice.toFixed(2)}
                  </span>
                </div>
                {formData.paymentStatus === 'partial' && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-white/60 text-xs">Total das parcelas:</span>
                    <span className="text-blue-300 text-sm font-semibold">
                      R$ {formData.paymentParts.reduce((sum, part) => sum + (parseFloat(part.amount) || 0), 0).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
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