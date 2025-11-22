import Layout from '../../components/Layout/Layout'
import GlassCard from '../../components/UI/GlassCard'
import GlassButton from '../../components/UI/GlassButton'
import OrderModal from '../../components/Orders/OrderModal'
import CalculatorModal from '../../components/Orders/CalculatorModal'
import { useState, useEffect } from 'react'
import { FaPlus, FaCalculator, FaEdit, FaTrash, FaBox, FaUser, FaCalendar, FaMoneyBillWave, FaSearch, FaFilter, FaSpinner } from 'react-icons/fa'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [candies, setCandies] = useState([])
  const [cakes, setCakes] = useState([])
  const [supplies, setSupplies] = useState([])
  const [masses, setMasses] = useState([])
  const [cakeFrostings, setCakeFrostings] = useState([])
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('docinhos') // Padrão para docinhos
  const [dateFilter, setDateFilter] = useState('next10')

  useEffect(() => {
    loadData()
  }, [])

  // FUNÇÃO ÚNICA DE CARREGAMENTO - CORRIGIDA
  const loadData = async () => {
    try {
      setLoading(true)

      // Carregar TODOS os dados de uma vez
      const [ordersRes, candiesRes, cakesRes, suppliesRes, productsRes, docinhoMassesRes, boloMassesRes, frostingsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/candies'),
        fetch('/api/cakes'),
        fetch('/api/supplies'),
        fetch('/api/products'),
        fetch('/api/masses'),           // Massas de docinhos
        fetch('/api/cake-masses'),      // Massas de bolos
        fetch('/api/cake-frostings')    // Coberturas de bolos
      ])

      if (!ordersRes.ok) throw new Error('Erro ao carregar encomendas')

      // Settar dados básicos
      setOrders(await ordersRes.json())
      setCandies(await candiesRes.json())
      setCakes(await cakesRes.json())
      setSupplies(await suppliesRes.json())
      setProducts(await productsRes.json())

      // Combinar TODAS as massas (docinhos + bolos)
      const docinhoMasses = docinhoMassesRes.ok ? await docinhoMassesRes.json() : []
      const boloMasses = boloMassesRes.ok ? await boloMassesRes.json() : []
      const allMasses = [...docinhoMasses, ...boloMasses]

      setMasses(allMasses)
      setCakeFrostings(frostingsRes.ok ? await frostingsRes.json() : [])

      console.log('✅ Dados carregados:', {
        orders: orders.length,
        candies: candies.length,
        cakes: cakes.length,
        allMasses: allMasses.length,
        docinhoMasses: docinhoMasses.length,
        boloMasses: boloMasses.length,
        frostings: cakeFrostings.length,
        products: products.length
      })

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Função para carregar massas baseado no tipo - CORRIGIDA
  const loadMassesByType = async (type) => {
    try {
      console.log(`🔄 Carregando massas para: ${type}`)

      if (type === 'docinhos' || type === 'all') {
        // Para docinhos: carregar massas de docinhos
        const massesRes = await fetch('/api/masses')
        if (massesRes.ok) {
          const massesData = await massesRes.json()
          setMasses(massesData)
          console.log(`✅ Carregadas ${massesData.length} massas para docinhos`)
        }
        setCakeFrostings([]) // Limpar frostings para docinhos
      }

      if (type === 'bolos' || type === 'all') {
        // Para bolos: carregar massas e frostings de bolos
        const [massesRes, frostingsRes] = await Promise.all([
          fetch('/api/cake-masses'),
          fetch('/api/cake-frostings')
        ])

        if (massesRes.ok) {
          const massesData = await massesRes.json()
          setMasses(massesData)
          console.log(`✅ Carregadas ${massesData.length} massas para bolos`)
        }

        if (frostingsRes.ok) {
          const frostingsData = await frostingsRes.json()
          setCakeFrostings(frostingsData)
          console.log(`✅ Carregadas ${frostingsData.length} coberturas para bolos`)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar massas:', error)
    }
  }

  // Quando mudar o filtro de tipo, carregar as massas apropriadas
  const handleTypeFilterChange = async (newType) => {
    setTypeFilter(newType)
    await loadMassesByType(newType)
  }

  const handleSave = async (orderData) => {
    try {
      let url = '/api/orders'
      let method = 'POST'

      if (editingOrder) {
        method = 'PUT'
        orderData = {
          ...orderData,
          id: editingOrder._id
        }
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar encomenda')
      }

      await loadData()
      setIsModalOpen(false)
      setEditingOrder(null)
      alert(editingOrder ? 'Encomenda atualizada com sucesso!' : 'Encomenda criada com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar encomenda:', error)
      alert('Erro ao salvar encomenda: ' + error.message)
    }
  }

  const handleEdit = (order) => {
    setEditingOrder(order)
    setIsModalOpen(true)
  }

  const handleDelete = async (orderId) => {
    if (confirm('Tem certeza que deseja excluir esta encomenda?')) {
      try {
        const response = await fetch('/api/orders', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: orderId })
        })

        if (!response.ok) {
          throw new Error('Erro ao excluir encomenda')
        }

        await loadData()
        alert('Encomenda excluída com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir encomenda:', error)
        alert('Erro ao excluir encomenda: ' + error.message)
      }
    }
  }

  // Filtrar encomendas
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesType = typeFilter === 'all' || order.type === typeFilter

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
    } else if (dateFilter === 'all') {
      matchesDate = true
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate
  })

  // Calcular totais
  const getOrderTotal = (order) => {
    return order.costBreakdown?.salePrice || 0
  }

  const getStatusColor = (status) => {
    const colors = {
      'encomendado': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'iniciando': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'concluido': 'bg-green-500/20 text-green-300 border-green-500/30',
      'cancelado': 'bg-red-500/20 text-red-300 border-red-500/30',
      'pendente': 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    }
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  const getPaymentStatusColor = (status) => {
    const colors = {
      'pending': 'bg-red-500/20 text-red-300 border-red-500/30',
      'paid': 'bg-green-500/20 text-green-300 border-green-500/30',
      'partial': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    }
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  return (
    <Layout activePage="orders">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Encomendas - {typeFilter === 'docinhos' ? 'Docinhos' : 'Bolos'}
          </h1>
          <p className="text-white/60">
            Gerencie encomendas de {typeFilter === 'docinhos' ? 'docinhos' : 'bolos'}
          </p>
        </div>
        <div className="flex gap-3">
          <GlassButton
            onClick={() => setIsCalculatorOpen(true)}
            variant="secondary"
            className="text-sm"
          >
            <FaCalculator className="w-4 h-4" />
            Calculadora
          </GlassButton>
          <GlassButton
            onClick={() => setIsModalOpen(true)}
            className="text-sm"
          >
            <FaPlus className="w-4 h-4" />
            Nova Encomenda
          </GlassButton>
        </div>
      </div>

      {/* Filtros e Busca */}
      <GlassCard className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente ou número..."
              className="w-full h-12 px-4 pl-10 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="encomendado">Encomendado</option>
            <option value="iniciando">Iniciando</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
            <option value="pendente">Pendente</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          >
            <option value="docinhos">🍬 Docinhos</option>
            <option value="bolos">🎂 Bolos</option>
            <option value="all">Todos os tipos</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          >
            <option value="next10">Próximos 10 dias</option>
            <option value="last4">Últimos 4 dias</option>
            <option value="all">Todas as datas</option>
          </select>
        </div>
      </GlassCard>

      {/* Lista de Encomendas */}
      <GlassCard className="p-4 md:p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto mb-4">
              <FaSpinner className="animate-spin w-6 h-6" />
            </div>
            <p className="text-white/60">Carregando encomendas...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white/30 mx-auto mb-4">
              <FaBox className="w-6 h-6" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">Nenhuma encomenda encontrada</h3>
            <p className="text-white/60">Comece criando sua primeira encomenda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="p-4 md:p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
                <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                      <FaUser className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between flex-col md:flex-row gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white text-lg truncate">
                              {order.customerName}
                            </h3>
                            <span className="text-white/60 text-sm">
                              #{order.orderNumber}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getPaymentStatusColor(order.paymentStatus)}`}>
                              {order.paymentStatus === 'pending' ? 'A Pagar' :
                                order.paymentStatus === 'paid' ? 'Pago' : 'Parcial'}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs bg-white/10 text-white/80 border border-white/20">
                              {order.type}
                            </span>
                          </div>

                          <div className="text-white/60 text-sm space-y-1">
                            <div className="flex items-center gap-2">
                              <FaCalendar className="w-3 h-3" />
                              <span>Entrega: {new Date(order.deliveryDate).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaMoneyBillWave className="w-3 h-3" />
                              <span>Total: R$ {getOrderTotal(order).toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Itens da encomenda */}
                          {order.items && order.items.length > 0 && (
                            <div className="mt-3">
                              <p className="text-white/60 text-sm mb-2">Itens:</p>
                              <div className="flex flex-wrap gap-2">
                                {order.items.slice(0, 3).map((item, index) => (
                                  <span key={index} className="px-2 py-1 bg-white/5 rounded-lg text-xs text-white/80">
                                    {item.itemName} ({item.quantity}x)
                                  </span>
                                ))}
                                {order.items.length > 3 && (
                                  <span className="px-2 py-1 bg-white/5 rounded-lg text-xs text-white/60">
                                    +{order.items.length - 3} mais
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Valores */}
                        <div className="text-right">
                          <div className="text-green-400 font-bold text-xl mb-2">
                            R$ {getOrderTotal(order).toFixed(2)}
                          </div>
                          {order.costBreakdown && (
                            <div className="text-white/60 text-sm space-y-1">
                              <div>Custo: R$ {order.costBreakdown.totalCost?.toFixed(2)}</div>
                              <div>Lucro: R$ {order.costBreakdown.profit?.toFixed(2)}</div>
                              <div>Margem: {order.costBreakdown.profitMargin?.toFixed(1)}%</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <GlassButton
                      variant="secondary"
                      onClick={() => handleEdit(order)}
                      className="px-3 py-2 text-sm"
                    >
                      <FaEdit className="w-3 h-3" />
                    </GlassButton>
                    <GlassButton
                      variant="danger"
                      onClick={() => handleDelete(order._id)}
                      className="px-3 py-2 text-sm"
                    >
                      <FaTrash className="w-3 h-3" />
                    </GlassButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Modals */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingOrder(null)
        }}
        onSave={handleSave}
        order={editingOrder}
        candies={candies}
        cakes={cakes}
        supplies={supplies}
      />

      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        orders={orders}
        candies={candies}
        cakes={cakes}
        masses={masses}
        cakeFrostings={cakeFrostings}
        products={products}
      />
    </Layout>
  )
}