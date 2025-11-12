// components/Orders/OrderList.js
import GlassButton from '../UI/GlassButton'
import { FaEdit, FaTrash, FaCheck, FaCalculator, FaEye, FaFilter, FaChevronLeft, FaChevronRight, FaCalendar, FaMoneyBillWave, FaCreditCard, FaPix, FaExchangeAlt } from 'react-icons/fa'
import { useState, useEffect, useRef } from 'react'

export default function OrderList({ orders, onEdit, onDelete, onComplete, onCalculate }) {
  const [filteredOrders, setFilteredOrders] = useState([])
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    paymentStatus: 'all',
    hideCompleted: false,
    startDate: '',
    endDate: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  // Definir datas padrão (última semana)
  useEffect(() => {
    const endDate = new Date()
    const startDate = new Date()
    endDate.setDate(startDate.getDate() + 7)

    setFilters(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }))
  }, [])

  const getStatusColor = (status) => {
    const colors = {
      'encomendado': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'iniciando': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'concluido': 'bg-green-500/20 text-green-400 border-green-500/30',
      'cancelado': 'bg-red-500/20 text-red-400 border-red-500/30',
      'pendente': 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    }
    return colors[status] || colors.pendente
  }

  const getStatusText = (status) => {
    const texts = {
      'encomendado': 'Encomendado',
      'iniciando': 'Iniciando',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado',
      'pendente': 'Pendente'
    }
    return texts[status] || status
  }

  const getPaymentStatusColor = (paymentStatus) => {
    const colors = {
      'paid': 'bg-green-500/20 text-green-400 border-green-500/30',
      'pending': 'bg-red-500/20 text-red-400 border-red-500/30',
      'partial': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
    return colors[paymentStatus] || colors.pending
  }

  const getPaymentStatusText = (paymentStatus) => {
    const texts = {
      'paid': 'Pago',
      'pending': 'A Pagar',
      'partial': 'Parcial'
    }
    return texts[paymentStatus] || paymentStatus
  }

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'money': FaMoneyBillWave,
      'card': FaCreditCard,
      'pix': FaPix,
      'transfer': FaExchangeAlt
    }
    return icons[method] || FaMoneyBillWave
  }

  const getPaymentMethodText = (method) => {
    const texts = {
      'money': 'Dinheiro',
      'card': 'Cartão',
      'pix': 'PIX',
      'transfer': 'Transferência'
    }
    return texts[method] || method
  }

  // Função para corrigir o problema do fuso horário na exibição
  const formatDisplayDate = (dateString) => {
    if (!dateString) return ''

    const date = new Date(dateString)
    // Ajusta para o fuso horário local
    const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
    return adjustedDate.toLocaleDateString('pt-BR')
  }

  // Formatar data para input
  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  // Aplicar filtros
  useEffect(() => {
    let result = [...orders]

    // Filtro por tipo
    if (filters.type !== 'all') {
      result = result.filter(order => order.type === filters.type)
    }

    // Filtro por status
    if (filters.status !== 'all') {
      result = result.filter(order => order.status === filters.status)
    }

    // Filtro por status de pagamento
    if (filters.paymentStatus !== 'all') {
      result = result.filter(order => order.paymentStatus === filters.paymentStatus)
    }

    // Ocultar concluídas
    if (filters.hideCompleted) {
      result = result.filter(order => order.status !== 'concluido')
    }

    // Filtro por data
    if (filters.startDate || filters.endDate) {
      result = result.filter(order => {
        const orderDate = new Date(order.deliveryDate)
        orderDate.setHours(0, 0, 0, 0) // Normaliza para início do dia

        if (filters.startDate) {
          const startDate = new Date(filters.startDate)
          startDate.setHours(0, 0, 0, 0)
          if (orderDate < startDate) return false
        }

        if (filters.endDate) {
          const endDate = new Date(filters.endDate)
          endDate.setHours(23, 59, 59, 999) // Final do dia
          if (orderDate > endDate) return false
        }

        return true
      })
    }

    setFilteredOrders(result)
    setCurrentPage(1) // Reset para primeira página quando filtros mudam
  }, [orders, filters])

  // Calcular paginação
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

  const handleFilterChange = (field, value) => {
    if (field === 'startDate') {
      // Se mudou a data de início, calcula 1 semana à frente
      const newEndDate = value ? calculateOneWeekLater(value) : '';

      setFilters(prev => ({
        ...prev,
        startDate: value,
        endDate: newEndDate
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const calculateOneWeekLater = (startDate) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 8);

    // Formata para YYYY-MM-DD (formato do input date)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const clearFilters = () => {
    const endDate = new Date()
    const startDate = new Date()
    endDate.setDate(startDate.getDate() + 7)

    setFilters({
      type: 'all',
      status: 'all',
      paymentStatus: 'all',
      hideCompleted: false,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    })
  }

  const setDateRange = (days) => {
    const endDate = new Date()
    const startDate = new Date()
    endDate.setDate(startDate.getDate() + days)

    setFilters(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }))
  }

  const goToPage = (page) => {
    setCurrentPage(page)
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Calcular totais de pagamento
  const calculatePaymentTotals = (order) => {
    if (order.paymentStatus === 'partial' && order.paymentParts) {
      const totalPaid = order.paymentParts
        .filter(part => part.paid)
        .reduce((sum, part) => sum + (part.amount || 0), 0)

      const totalPending = order.paymentParts
        .filter(part => !part.paid)
        .reduce((sum, part) => sum + (part.amount || 0), 0)

      return { totalPaid, totalPending }
    }

    return { totalPaid: 0, totalPending: order.finalPrice || order.costBreakdown?.salePrice || 0 }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-white/10 flex items-center justify-center text-white/30 mx-auto mb-4">
          <FaCheck className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <h3 className="text-white text-base md:text-lg font-semibold mb-2">Nenhuma encomenda</h3>
        <p className="text-white/60 text-sm md:text-base">Comece criando sua primeira encomenda</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filtros - Layout Melhorado */}
      <div className="bg-white/5 rounded-2xl p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <FaFilter className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Filtros e Ordenação</span>
          </h3>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors whitespace-nowrap flex-shrink-0"
          >
            Limpar Filtros
          </button>
        </div>

        {/* Filtros Rápidos de Data */}
        <div className="mb-4">
          <label className="block text-white/60 text-sm font-medium mb-2">Período Rápido</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDateRange(7)}
              className={`px-3 py-2 text-sm rounded-xl transition-colors ${
                // Verifica se o filtro atual corresponde ao período de 7 dias à frente
                filters.endDate === formatDateForInput(new Date(new Date().setDate(new Date().getDate() + 7)))
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white/60'
                }`}
            >
              7 dias
            </button>
            <button
              onClick={() => setDateRange(30)}
              className={`px-3 py-2 text-sm rounded-xl transition-colors ${filters.endDate === formatDateForInput(new Date(new Date().setDate(new Date().getDate() + 30)))
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white/60'
                }`}
            >
              30 dias
            </button>
            <button
              onClick={() => setDateRange(90)}
              className={`px-3 py-2 text-sm rounded-xl transition-colors ${filters.endDate === formatDateForInput(new Date(new Date().setDate(new Date().getDate() + 90)))
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white/60'
                }`}
            >
              90 dias
            </button>
            <button
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  startDate: '',
                  endDate: ''
                }))
              }}
              className="px-3 py-2 text-sm bg-white/10 hover:bg-white/20 text-white/60 rounded-xl transition-colors"
            >
              Todas as datas
            </button>
            <button
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  startDate: '',
                  endDate: ''
                }))
              }}
              className="px-3 py-2 text-sm bg-white/10 hover:bg-white/20 text-white/60 rounded-xl transition-colors"
            >
              Todas as datas
            </button>
          </div>
        </div>

        {/* Grid de Filtros Melhorado */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {/* Filtro por Tipo */}
          <div className="space-y-2">
            <label className="block text-white/60 text-sm font-medium">Tipo</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full glass-input h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200"
              style={{
                WebkitAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1em'
              }}
            >
              <option value="all">Todos os tipos</option>
              <option value="docinhos">🍬 Docinhos</option>
              <option value="bolos">🎂 Bolos</option>
              <option value="ambos">🍰 Ambos</option>
            </select>
          </div>

          {/* Filtro por Status */}
          <div className="space-y-2">
            <label className="block text-white/60 text-sm font-medium">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full glass-input h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200"
              style={{
                WebkitAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1em'
              }}
            >
              <option value="all">Todos os status</option>
              <option value="encomendado">📋 Encomendado</option>
              <option value="iniciando">🔄 Iniciando</option>
              <option value="concluido">✅ Concluído</option>
              <option value="cancelado">❌ Cancelado</option>
              <option value="pendente">⏳ Pendente</option>
            </select>
          </div>

          {/* Filtro por Status de Pagamento */}
          <div className="space-y-2">
            <label className="block text-white/60 text-sm font-medium">Pagamento</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              className="w-full glass-input h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200"
              style={{
                WebkitAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1em'
              }}
            >
              <option value="all">Todos</option>
              <option value="paid">💳 Pago</option>
              <option value="pending">⏳ A Pagar</option>
              <option value="partial">💰 Parcial</option>
            </select>
          </div>

          {/* Filtro Data Início */}
          <div className="space-y-2">
            <label className="block text-white/60 text-sm font-medium">Data Início</label>
            <div className="relative">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full h-12 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 [&::-webkit-calendar-picker-indicator]:opacity-0"
                ref={startDateRef}
              />
              <button
                type="button"
                onClick={() => startDateRef.current?.showPicker()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
              >
                <FaCalendar />
              </button>
            </div>
          </div>

          {/* Filtro Data Fim */}
          <div className="space-y-2">
            <label className="block text-white/60 text-sm font-medium">Data Fim</label>
            <div className="relative">
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full h-12 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 [&::-webkit-calendar-picker-indicator]:opacity-0"
                ref={endDateRef}
              />
              <button
                type="button"
                onClick={() => endDateRef.current?.showPicker()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
              >
                <FaCalendar />
              </button>
            </div>
          </div>

          {/* Checkbox Ocultar Concluídas */}
          <div className="flex items-center justify-center lg:justify-start">
            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white/5 transition-colors duration-200">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={filters.hideCompleted}
                  onChange={(e) => handleFilterChange('hideCompleted', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${filters.hideCompleted
                  ? 'bg-green-500/20 border-green-400'
                  : 'bg-white/10 border-white/30 group-hover:border-white/50'
                  }`}>
                  {filters.hideCompleted && (
                    <FaCheck className="w-3 h-3 text-green-400" />
                  )}
                </div>
              </div>
              <span className="text-white text-sm font-medium whitespace-nowrap">
                Ocultar concluídas
              </span>
            </label>
          </div>
        </div>

        {/* Status dos Filtros Ativos */}
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.type !== 'all' && (
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30">
              Tipo: {filters.type === 'docinhos' ? '🍬 Docinhos' : filters.type === 'bolos' ? '🎂 Bolos' : '🍰 Ambos'}
            </span>
          )}
          {filters.status !== 'all' && (
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium border border-purple-500/30">
              Status: {getStatusText(filters.status)}
            </span>
          )}
          {filters.paymentStatus !== 'all' && (
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium border border-orange-500/30">
              Pagamento: {getPaymentStatusText(filters.paymentStatus)}
            </span>
          )}
          {(filters.startDate || filters.endDate) && (
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
              📅 {filters.startDate ? formatDisplayDate(filters.startDate) : 'Início'} - {filters.endDate ? formatDisplayDate(filters.endDate) : 'Fim'}
            </span>
          )}
          {filters.hideCompleted && (
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium border border-red-500/30">
              ✅ Concluídas ocultas
            </span>
          )}
        </div>
      </div>

      {/* Lista de Encomendas */}
      {currentOrders.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-white/30 mx-auto mb-4">
            <FaFilter className="w-8 h-8" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Nenhuma encomenda encontrada</h3>
          <p className="text-white/60 text-sm mb-4">Tente ajustar os filtros para ver mais resultados</p>
          <button
            onClick={clearFilters}
            className="px-6 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded-xl transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <>
          {/* Encomendas */}
          <div className="space-y-4 md:space-y-6">
            {currentOrders.map((order) => {
              const { totalPaid, totalPending } = calculatePaymentTotals(order)
              const PaymentMethodIcon = getPaymentMethodIcon(order.paymentMethod)

              return (
                <div key={order._id} className="p-4 md:p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
                  <div className="flex items-start justify-between flex-col lg:flex-row gap-4">
                    <div className="flex items-start gap-3 md:gap-4 flex-1 w-full min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                        <FaCheck className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                          <h3 className="font-semibold text-white text-lg truncate min-w-0">
                            {order.orderNumber} - {order.customerName}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)} flex-shrink-0 w-fit`}>
                              {getStatusText(order.status)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusColor(order.paymentStatus)} flex-shrink-0 w-fit`}>
                              {getPaymentStatusText(order.paymentStatus)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-4">
                          <div className="min-w-0">
                            <p className="text-white/60 text-xs mb-1">Data de Entrega</p>
                            <p className="text-white font-semibold text-sm">
                              {formatDisplayDate(order.deliveryDate)}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <p className="text-white/60 text-xs mb-1">Tipo</p>
                            <p className="text-white font-semibold text-sm capitalize">
                              {order.type === 'docinhos' ? '🍬 Docinhos' : order.type === 'bolos' ? '🎂 Bolos' : '🍰 Ambos'}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <p className="text-white/60 text-xs mb-1">Método Pag.</p>
                            <p className="text-white font-semibold text-sm flex items-center gap-1">
                              <PaymentMethodIcon className="w-3 h-3" />
                              {getPaymentMethodText(order.paymentMethod)}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <p className="text-white/60 text-xs mb-1">Preço Final</p>
                            <p className="text-green-400 font-semibold text-sm">
                              R$ {(order.finalPrice || order.costBreakdown?.salePrice || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Informações de Pagamento */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                            <p className="text-white/60 text-xs mb-1">Total</p>
                            <p className="text-green-400 font-bold text-lg">
                              R$ {(order.finalPrice || order.costBreakdown?.salePrice || 0).toFixed(2)}
                            </p>
                          </div>

                          {order.paymentStatus === 'partial' && (
                            <>
                              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                                <p className="text-white/60 text-xs mb-1">Pago</p>
                                <p className="text-blue-400 font-bold text-lg">
                                  R$ {totalPaid.toFixed(2)}
                                </p>
                              </div>
                              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                                <p className="text-white/60 text-xs mb-1">A Pagar</p>
                                <p className="text-yellow-400 font-bold text-lg">
                                  R$ {totalPending.toFixed(2)}
                                </p>
                              </div>
                            </>
                          )}

                          {order.paymentStatus === 'paid' && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                              <p className="text-white/60 text-xs mb-1">Status</p>
                              <p className="text-green-400 font-bold text-lg">
                                ✅ Totalmente Pago
                              </p>
                            </div>
                          )}

                          {order.discount > 0 && (
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                              <p className="text-white/60 text-xs mb-1">Desconto</p>
                              <p className="text-purple-400 font-bold text-lg">
                                {order.discountType === 'percentage' ? `${order.discount}%` : `R$ ${order.discount}`}
                              </p>
                            </div>
                          )}
                        </div>

                        {order.observations && (
                          <div className="mt-3 p-3 rounded-xl bg-white/5">
                            <p className="text-white/80 text-sm line-clamp-2">
                              <strong className="text-white">Observações:</strong> {order.observations}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
                      <GlassButton
                        variant="secondary"
                        onClick={() => onEdit(order)}
                        className="px-3 py-2 text-sm flex items-center gap-2"
                      >
                        <FaEdit className="w-3 h-3" />
                        <span className="hidden xs:inline">Editar</span>
                      </GlassButton>

                      <GlassButton
                        variant="danger"
                        onClick={() => onDelete(order._id)}
                        className="px-3 py-2 text-sm flex items-center gap-2"
                      >
                        <FaTrash className="w-3 h-3" />
                        <span className="hidden xs:inline">Excluir</span>
                      </GlassButton>
                    </div>
                  </div>

                  {/* Itens da Encomenda */}
                  <div className="mt-4">
                    <h4 className="text-white/80 text-sm font-medium mb-2">Itens da Encomenda:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                          <div className="min-w-0 flex-1">
                            <span className="text-white text-sm font-medium block truncate">
                              {item.itemName}
                            </span>
                            <div className="text-white/60 text-xs">
                              {item.quantity} un • R$ {item.unitPrice?.toFixed(2)}/un
                            </div>
                          </div>
                          <span className="text-green-400 text-sm font-semibold flex-shrink-0 ml-3">
                            R$ {item.totalPrice?.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insumos Adicionais */}
                  {order.supplies && order.supplies.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-white/80 text-sm font-medium mb-2">Insumos Adicionais:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {order.supplies.map((supply, index) => (
                          <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                            <span className="text-white text-sm truncate flex-1">{supply.supplyName}</span>
                            <span className="text-blue-400 text-sm font-semibold flex-shrink-0 ml-3">
                              {supply.quantity} un • R$ {supply.totalCost?.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Parcelas de Pagamento (se for parcial) */}
                  {order.paymentStatus === 'partial' && order.paymentParts && (
                    <div className="mt-4">
                      <h4 className="text-white/80 text-sm font-medium mb-2">Parcelas do Pagamento:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {order.paymentParts.map((part, index) => {
                          const PartPaymentIcon = getPaymentMethodIcon(part.paymentMethod)
                          return (
                            <div key={index} className={`p-3 rounded-xl border ${part.paid ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <PartPaymentIcon className={`w-4 h-4 ${part.paid ? 'text-green-400' : 'text-yellow-400'}`} />
                                  <span className="text-white text-sm font-medium">
                                    Parcela {index + 1}
                                  </span>
                                </div>
                                <span className={`text-sm font-semibold ${part.paid ? 'text-green-400' : 'text-yellow-400'}`}>
                                  R$ {part.amount?.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-2 text-xs">
                                <span className="text-white/60">
                                  {part.dueDate ? formatDisplayDate(part.dueDate) : 'Sem data'}
                                </span>
                                <span className={`px-2 py-1 rounded-full ${part.paid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                  {part.paid ? '✅ Pago' : '⏳ Pendente'}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Paginação Melhorada */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
              <div className="text-white/60 text-sm whitespace-nowrap">
                Página <span className="text-white font-semibold">{currentPage}</span> de <span className="text-white font-semibold">{totalPages}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft className="w-4 h-4 text-white" />
                </button>

                {/* Números das páginas */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${currentPage === page
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                        : 'bg-white/10 hover:bg-white/20 text-white/60'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="text-white/60 text-sm whitespace-nowrap">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOrders.length)} de {filteredOrders.length} itens
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}