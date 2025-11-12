import Layout from '../components/Layout/Layout'
import GlassCard from '../components/UI/GlassCard'
import { useState, useEffect } from 'react'
import { 
  FaBox, FaTag, FaCookie, FaBirthdayCake, 
  FaArrowRight, FaWeight, FaIceCream, 
  FaCalculator, FaClipboardList,
  FaMoneyBillWave, FaChartLine, FaDollarSign
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
    orders: 0
  })

  const [financialStats, setFinancialStats] = useState({
    expenses: 0,
    projectedProfit: 0,
    confirmedProfit: 0
  })

  const router = useRouter()

  useEffect(() => {
    loadStats()
    loadFinancialStats()
  }, [])

  const loadStats = async () => {
    try {
      const [
        productsRes, suppliesRes, candyMassesRes, candiesRes,
        cakeMassesRes, cakeFrostingsRes, cakesRes, ordersRes
      ] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/supplies'),
        fetch('/api/masses'),
        fetch('/api/candies'),
        fetch('/api/cake-masses'),
        fetch('/api/cake-frostings'),
        fetch('/api/cakes'),
        fetch('/api/orders')
      ])
      
      setStats({
        products: (await productsRes.json()).length,
        supplies: (await suppliesRes.json()).length,
        candyMasses: (await candyMassesRes.json()).length,
        candies: (await candiesRes.json()).length,
        cakeMasses: (await cakeMassesRes.json()).length,
        cakeFrostings: (await cakeFrostingsRes.json()).length,
        cakes: (await cakesRes.json()).length,
        orders: (await ordersRes.json()).length
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const loadFinancialStats = async () => {
    try {
      const ordersRes = await fetch('/api/orders')
      const orders = await ordersRes.json()

      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      let totalExpenses = 0
      let totalProjectedProfit = 0
      let totalConfirmedProfit = 0

      orders.forEach(order => {
        const orderDate = new Date(order.deliveryDate || order.createdAt)
        
        // Verifica se a encomenda é do mês atual
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          
          // Cálculo de despesas (custo total)
          const orderCost = order.costBreakdown?.totalCost || 
                           (order.items?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0)
          totalExpenses += orderCost

          // Cálculo do lucro projetado (todas as encomendas)
          const orderRevenue = order.finalPrice || order.costBreakdown?.salePrice || 0
          const orderProfit = orderRevenue - orderCost
          totalProjectedProfit += orderProfit

          // Cálculo do lucro confirmado (apenas encomendas pagas)
          if (order.paymentStatus === 'paid') {
            totalConfirmedProfit += orderProfit
          } else if (order.paymentStatus === 'partial' && order.paymentParts) {
            // Para pagamentos parciais, considerar apenas a parte paga
            const paidAmount = order.paymentParts
              .filter(part => part.paid)
              .reduce((sum, part) => sum + (part.amount || 0), 0)
            
            // Calcular o lucro proporcional ao valor pago
            const paidRatio = paidAmount / orderRevenue
            totalConfirmedProfit += orderProfit * paidRatio
          }
        }
      })

      setFinancialStats({
        expenses: totalExpenses,
        projectedProfit: totalProjectedProfit,
        confirmedProfit: totalConfirmedProfit
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas financeiras:', error)
    }
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

      {/* Estatísticas Financeiras - NOVO BLOCO */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2">
          <FaChartLine className="w-4 h-4 md:w-5 md:h-5" />
          Financeiro do Mês
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
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
                <p className="text-white/60 text-xs">Custo total das encomendas</p>
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
                <p className={`text-xl md:text-2xl font-bold ${
                  financialStats.projectedProfit >= 0 ? 'text-blue-400' : 'text-red-400'
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
                <p className={`text-xl md:text-2xl font-bold ${
                  financialStats.confirmedProfit >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  R$ {financialStats.confirmedProfit.toFixed(2)}
                </p>
                <p className="text-white/60 text-xs">Encomendas pagas</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
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

      {/* Ação Rápida - Encomendas */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4 flex items-center gap-2">
          <FaClipboardList className="w-4 h-4 md:w-5 md:h-5" />
          Encomendas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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