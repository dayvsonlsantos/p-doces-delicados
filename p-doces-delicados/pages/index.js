import Layout from '../components/Layout/Layout'
import GlassCard from '../components/UI/GlassCard'
import { useState, useEffect } from 'react'
import {
  FaBox, FaTag, FaCookie, FaBirthdayCake,
  FaArrowRight, FaWeight, FaIceCream,
  FaCalculator, FaClipboardList,
  FaMoneyBillWave, FaChartLine, FaDollarSign,
  FaCog, FaBullseye,
  FaChevronLeft, FaChevronRight, FaCalendarAlt
} from 'react-icons/fa'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    supplies: 0,
    candyMasses: 0,
    candies: 0,
    cakeMasses: 0,
    cakeFrostings: 0,
    cakes: 0,
    orders: 0,
    fixedCosts: 0
  })

  const [financialStats, setFinancialStats] = useState({
    expenses: 0,
    projectedProfit: 0,
    confirmedProfit: 0,
    fixedCostsTotal: 0,
    costPerMinute: 0
  })

  // NOVO: Estado para controle do mês selecionado
  const [selectedDate, setSelectedDate] = useState(new Date())
  const router = useRouter()

  useEffect(() => {
    loadStats()
    loadFinancialStats()
  }, [selectedDate]) // NOVO: Recarregar quando o mês selecionado mudar

  const loadStats = async () => {
    try {
      const [
        productsRes, suppliesRes, candyMassesRes, candiesRes,
        cakeMassesRes, cakeFrostingsRes, cakesRes, ordersRes,
        fixedCostsRes
      ] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/supplies'),
        fetch('/api/masses'),
        fetch('/api/candies'),
        fetch('/api/cake-masses'),
        fetch('/api/cake-frostings'),
        fetch('/api/cakes'),
        fetch('/api/orders'),
        fetch('/api/fixed-costs')
      ])

      const fixedCostsData = await fixedCostsRes.json()

      // ATUALIZADO: Contar apenas custos da confeitaria (sem divisor ou divisor = 1)
      const confeitariaCosts = fixedCostsData.filter(cost =>
        !cost.divisor || cost.divisor === 1
      )

      setStats({
        products: (await productsRes.json()).length,
        supplies: (await suppliesRes.json()).length,
        candyMasses: (await candyMassesRes.json()).length,
        candies: (await candiesRes.json()).length,
        cakeMasses: (await cakeMassesRes.json()).length,
        cakeFrostings: (await cakeFrostingsRes.json()).length,
        cakes: (await cakesRes.json()).length,
        orders: (await ordersRes.json()).length,
        fixedCosts: confeitariaCosts.length // AGORA: Apenas custos da confeitaria
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }
  const loadFinancialStats = async () => {
    try {
      const [ordersRes, fixedCostsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/fixed-costs')
      ])

      const orders = await ordersRes.json()
      const fixedCosts = await fixedCostsRes.json()

      // NOVO: Usar o mês selecionado em vez do mês atual
      const selectedMonth = selectedDate.getMonth()
      const selectedYear = selectedDate.getFullYear()

      let totalExpenses = 0
      let totalProjectedProfit = 0
      let totalConfirmedProfit = 0

      // Cálculo das encomendas (atualizado para usar o mês selecionado)
      orders.forEach(order => {
        const orderDate = new Date(order.deliveryDate || order.createdAt)

        if (orderDate.getMonth() === selectedMonth && orderDate.getFullYear() === selectedYear) {
          const orderCost = order.costBreakdown?.totalCost ||
            (order.items?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0)
          totalExpenses += orderCost

          const orderRevenue = order.finalPrice || order.costBreakdown?.salePrice || 0
          const orderProfit = orderRevenue - orderCost
          totalProjectedProfit += orderProfit

          if (order.paymentStatus === 'paid') {
            totalConfirmedProfit += orderProfit
          } else if (order.paymentStatus === 'partial' && order.paymentParts) {
            const paidAmount = order.paymentParts
              .filter(part => part.paid)
              .reduce((sum, part) => sum + (part.amount || 0), 0)

            const paidRatio = paidAmount / orderRevenue
            totalConfirmedProfit += orderProfit * paidRatio
          }
        }
      })

      // ATUALIZADO: Calcular custo da confeitaria (custo / divisor)
      let confeitariaCostsTotal = 0
      let confeitariaCostPerMinute = 0

      fixedCosts.forEach(cost => {
        // Se for custo da confeitaria (sem divisão ou com divisor específico)
        if (!cost.divisor || cost.divisor === 1) {
          const costValue = parseFloat(cost.cost) || 0
          confeitariaCostsTotal += costValue

          const costPerMinuteValue = parseFloat(cost.costPerMinute) || 0
          confeitariaCostPerMinute += costPerMinuteValue
        }
        // Se for custo pessoal/outros com divisor, calcular a parte da confeitaria
        else if (cost.divisor > 1) {
          const costValue = parseFloat(cost.cost) || 0
          const divisor = parseFloat(cost.divisor) || 1
          const confeitariaPart = costValue / divisor
          confeitariaCostsTotal += confeitariaPart

          const costPerMinuteValue = parseFloat(cost.costPerMinute) || 0
          const confeitariaCostPerMinutePart = costPerMinuteValue / divisor
          confeitariaCostPerMinute += confeitariaCostPerMinutePart
        }
      })

      setFinancialStats({
        expenses: totalExpenses,
        projectedProfit: totalProjectedProfit,
        confirmedProfit: totalConfirmedProfit,
        fixedCostsTotal: confeitariaCostsTotal, // AGORA: Apenas custos da confeitaria
        costPerMinute: confeitariaCostPerMinute // AGORA: Apenas custo por minuto da confeitaria
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas financeiras:', error)
    }
  }

  // NOVO: Funções para navegação entre meses
  const navigateToPreviousMonth = () => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(selectedDate.getMonth() - 1)
    setSelectedDate(newDate)
  }

  const navigateToNextMonth = () => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(selectedDate.getMonth() + 1)
    setSelectedDate(newDate)
  }

  const navigateToCurrentMonth = () => {
    setSelectedDate(new Date())
  }

  // NOVO: Verificar se é o mês atual
  const isCurrentMonth = () => {
    const now = new Date()
    return selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear()
  }

  // NOVO: Formatar nome do mês
  const getMonthName = (date) => {
    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    }).replace(/^./, letter => letter.toUpperCase())
  }

  const navigateTo = (path) => {
    router.push(path)
  }

  const openCalculator = () => {
    console.log('🔢 Abrindo calculadora de encomendas...')
    router.push('/orders?calculator=true')
  }

  const QuickActionCard = ({ icon: Icon, title, description, path, color, onClick }) => (
    <div
      className="cursor-pointer group"
      onClick={onClick ? onClick : () => navigateTo(path)}
    >
      <GlassCard className="hover:scale-105 transition-transform duration-300 h-full btn-mobile">
        <div className="text-center">
          <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${color} flex items-center justify-center text-white mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
            <Icon size={20} className="md:w-6 md:h-6" />
          </div>
          <h3 className="font-bold text-primary mb-2 text-sm md:text-base group-hover:text-blue-500 transition-colors">
            {title}
          </h3>
          <p className="text-secondary text-xs md:text-sm mb-3 leading-tight">
            {description}
          </p>
          <div className="flex items-center justify-center text-blue-500 text-xs md:text-sm font-semibold">
            <span>Acessar</span>
            <FaArrowRight size={10} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </GlassCard>
    </div>
  )

  return (
    <Layout activePage="dashboard">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-primary mb-2 text-mobile-lg">
          Dashboard
        </h1>
        <p className="text-secondary text-sm md:text-base">
          Gerencie sua confeitaria de forma inteligente
        </p>
      </div>

      {/* NOVO: Navegação entre Meses */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
            <FaChartLine className="w-4 h-4 md:w-5 md:h-5" />
            Financeiro
          </h2>

          <div className="flex items-center gap-3 bg-white/10 dark:bg-gray-800/50 rounded-2xl px-4 py-2">
            <button
              onClick={navigateToPreviousMonth}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 dark:bg-gray-700/50 dark:hover:bg-gray-600/50 text-primary transition-colors"
              title="Mês anterior"
            >
              <FaChevronLeft size={14} />
            </button>

            <div className="flex items-center gap-2 px-3">
              <FaCalendarAlt className="text-blue-400" size={16} />
              <span className="font-semibold text-primary text-sm md:text-base">
                {getMonthName(selectedDate)}
              </span>
              {!isCurrentMonth() && (
                <button
                  onClick={navigateToCurrentMonth}
                  className="ml-2 px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                >
                  Hoje
                </button>
              )}
            </div>

            <button
              onClick={navigateToNextMonth}
              disabled={isCurrentMonth()} // Desabilita se for o mês atual
              className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${isCurrentMonth()
                ? 'bg-white/5 text-gray-400 cursor-not-allowed'
                : 'bg-white/10 hover:bg-white/20 dark:bg-gray-700/50 dark:hover:bg-gray-600/50 text-primary'
                }`}
              title={isCurrentMonth() ? "Você está no mês atual" : "Próximo mês"}
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Estatísticas Financeiras */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          {/* Despesas */}
          <GlassCard className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-2xl bg-red-500 flex items-center justify-center text-white">
                <FaMoneyBillWave size={16} className="md:w-5 md:h-5" />
              </div>
              <div>
                <p className="text-secondary text-xs md:text-sm">Despesas</p>
                <p className="text-xl md:text-2xl font-bold text-red-400">
                  R$ {financialStats.expenses.toFixed(2)}
                </p>
                <p className="text-white/60 text-xs">Custo das encomendas</p>
              </div>
            </div>
          </GlassCard>

          {/* Custos Fixos */}
          <GlassCard className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-2xl bg-yellow-500 flex items-center justify-center text-white">
                <FaCog size={16} className="md:w-5 md:h-5" />
              </div>
              <div>
                <p className="text-secondary text-xs md:text-sm">Custos Confeitaria</p>
                <p className="text-xl md:text-2xl font-bold text-yellow-400">
                  R$ {financialStats.fixedCostsTotal.toFixed(2)}
                </p>
                <p className="text-white/60 text-xs">Parte da confeitaria</p>
              </div>
            </div>
          </GlassCard>

          {/* Lucro Projetado */}
          <GlassCard className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white">
                <FaChartLine size={16} className="md:w-5 md:h-5" />
              </div>
              <div>
                <p className="text-secondary text-xs md:text-sm">Lucro Projetado</p>
                <p className={`text-xl md:text-2xl font-bold ${financialStats.projectedProfit >= 0 ? 'text-blue-400' : 'text-red-400'
                  }`}>
                  R$ {financialStats.projectedProfit.toFixed(2)}
                </p>
                <p className="text-white/60 text-xs">Todas as encomendas</p>
              </div>
            </div>
          </GlassCard>

          {/* Lucro Confirmado */}
          <GlassCard className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white">
                <FaDollarSign size={16} className="md:w-5 md:h-5" />
              </div>
              <div>
                <p className="text-secondary text-xs md:text-sm">Lucro Confirmado</p>
                <p className={`text-xl md:text-2xl font-bold ${financialStats.confirmedProfit >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                  R$ {financialStats.confirmedProfit.toFixed(2)}
                </p>
                <p className="text-white/60 text-xs">Encomendas pagas</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Custo por Minuto */}
        {financialStats.costPerMinute > 0 && (
          <div className="mt-4">
            <GlassCard className="p-4 md:p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg md:text-xl mb-2 flex items-center gap-2">
                    <FaCog className="w-5 h-5" />
                    Custo Total por Minuto
                  </h3>
                  <p className="text-white/60 text-sm md:text-base">
                    Some este valor ao custo de cada produto considerando o tempo de preparo
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-purple-400 font-bold text-2xl md:text-3xl">
                    R$ {financialStats.costPerMinute.toFixed(8)}
                  </div>
                  <div className="text-white/60 text-sm">por minuto</div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Estatísticas Gerais - ATUALIZADO */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
        <GlassCard className="p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white">
              <FaBox size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <p className="text-secondary text-xs md:text-sm">Produtos</p>
              <p className="text-xl md:text-2xl font-bold text-primary">{stats.products}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white">
              <FaTag size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <p className="text-secondary text-xs md:text-sm">Insumos</p>
              <p className="text-xl md:text-2xl font-bold text-primary">{stats.supplies}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-2xl bg-yellow-500 flex items-center justify-center text-white">
              <FaCog size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <p className="text-secondary text-xs md:text-sm">Custos Fixos</p>
              <p className="text-xl md:text-2xl font-bold text-primary">{stats.fixedCosts}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white">
              <FaClipboardList size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <p className="text-secondary text-xs md:text-sm">Encomendas</p>
              <p className="text-xl md:text-2xl font-bold text-primary">{stats.orders}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white">
              <FaBirthdayCake size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <p className="text-secondary text-xs md:text-sm">Bolos</p>
              <p className="text-xl md:text-2xl font-bold text-primary">{stats.cakes}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2">
          <FaBullseye className="w-4 h-4 md:w-5 md:h-5" />
          Metas de Vendas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <QuickActionCard
            icon={FaBullseye}
            title="Metas Mensais"
            description="Defina e acompanhe suas metas de lucro por produto"
            path="/goals"
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Ação Rápida - Configurações e Encomendas */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2">
          <FaCog className="w-4 h-4 md:w-5 md:h-5" />
          Configurações e Encomendas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <QuickActionCard
            icon={FaCog}
            title="Custos Fixos"
            description="Gerenciar custos mensais e calcular custo por minuto"
            path="/fixed-costs"
            color="bg-yellow-500"
          />

          <QuickActionCard
            icon={FaClipboardList}
            title="Encomendas"
            description="Gerenciar encomendas de docinhos e bolos"
            path="/orders"
            color="bg-indigo-500"
          />

          <QuickActionCard
            icon={FaCalculator}
            title="Calculadora"
            description="Calcular ingredientes para produção"
            onClick={openCalculator}
            color="bg-teal-500"
          />
        </div>
      </div>

      {/* Ações Rápidas - Docinhos */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2">
          <FaCookie className="w-4 h-4 md:w-5 md:h-5" />
          Docinhos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <QuickActionCard
            icon={FaWeight}
            title="Massas"
            description="Gerenciar receitas de massa"
            path="/candies/masses"
            color="bg-blue-500"
          />

          <QuickActionCard
            icon={FaCookie}
            title="Docinhos"
            description="Gerenciar tipos de docinhos"
            path="/candies"
            color="bg-purple-500"
          />

          <QuickActionCard
            icon={FaCalculator}
            title="Calcular Lote"
            description="Calcular produção em lote"
            path="/candies/batch"
            color="bg-green-500"
          />
        </div>
      </div>

      {/* Ações Rápidas - Bolos */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2">
          <FaBirthdayCake className="w-4 h-4 md:w-5 md:h-5" />
          Bolos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <QuickActionCard
            icon={FaWeight}
            title="Massas"
            description="Gerenciar massas de bolo"
            path="/cakes/masses"
            color="bg-orange-500"
          />

          <QuickActionCard
            icon={FaIceCream}
            title="Coberturas"
            description="Gerenciar coberturas"
            path="/cakes/frostings"
            color="bg-pink-500"
          />

          <QuickActionCard
            icon={FaBirthdayCake}
            title="Bolos"
            description="Gerenciar tipos de bolos"
            path="/cakes"
            color="bg-red-500"
          />

          <QuickActionCard
            icon={FaCalculator}
            title="Calcular"
            description="Calcular produção"
            path="/cakes/batch"
            color="bg-indigo-500"
          />
        </div>
      </div>
    </Layout>
  )
}