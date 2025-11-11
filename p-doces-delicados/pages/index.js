import Layout from '../components/Layout/Layout'
import GlassCard from '../components/UI/GlassCard'
import { useState, useEffect } from 'react'
import { 
  FaBox, FaTag, FaCookie, FaBirthdayCake, 
  FaArrowRight, FaWeight, FaIceCream, 
  FaCalculator
} from 'react-icons/fa'
import { useRouter } from 'next/router' // Importar useRouter

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    products: 0, 
    supplies: 0,
    candyMasses: 0,
    candies: 0,
    cakeMasses: 0,
    cakeFrostings: 0,
    cakes: 0
  })

  const router = useRouter() // Usar o router

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [
        productsRes, suppliesRes, candyMassesRes, candiesRes,
        cakeMassesRes, cakeFrostingsRes, cakesRes
      ] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/supplies'),
        fetch('/api/masses'),
        fetch('/api/candies'),
        fetch('/api/cake-masses'),
        fetch('/api/cake-frostings'),
        fetch('/api/cakes')
      ])
      
      setStats({
        products: (await productsRes.json()).length,
        supplies: (await suppliesRes.json()).length,
        candyMasses: (await candyMassesRes.json()).length,
        candies: (await candiesRes.json()).length,
        cakeMasses: (await cakeMassesRes.json()).length,
        cakeFrostings: (await cakeFrostingsRes.json()).length,
        cakes: (await cakesRes.json()).length
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  // Função para navegação
  const navigateTo = (path) => {
    router.push(path)
  }

  const QuickActionCard = ({ icon: Icon, title, description, path, color }) => (
    <div 
      className="cursor-pointer"
      onClick={() => navigateTo(path)} // Usar a função de navegação
    >
      <GlassCard className="hover:scale-105 transition-transform duration-300 group h-full">
        <div className="text-center">
          <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
          </div>
          <h3 className="font-bold text-primary mb-2 group-hover:text-blue-500 transition-colors">{title}</h3>
          <p className="text-secondary text-sm mb-3">{description}</p>
          <div className="flex items-center justify-center text-blue-500 text-sm font-semibold">
            <span>Acessar</span>
            <FaArrowRight size={12} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </GlassCard>
    </div>
  )

  return (
    <Layout activePage="dashboard">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Dashboard</h1>
        <p className="text-secondary">Gerencie sua confeitaria de forma inteligente</p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white">
              <FaBox size={20} />
            </div>
            <div>
              <p className="text-secondary text-sm">Produtos</p>
              <p className="text-2xl font-bold text-primary">{stats.products}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white">
              <FaTag size={20} />
            </div>
            <div>
              <p className="text-secondary text-sm">Insumos</p>
              <p className="text-2xl font-bold text-primary">{stats.supplies}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white">
              <FaCookie size={20} />
            </div>
            <div>
              <p className="text-secondary text-sm">Docinhos</p>
              <p className="text-2xl font-bold text-primary">{stats.candies}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white">
              <FaBirthdayCake size={20} />
            </div>
            <div>
              <p className="text-secondary text-sm">Bolos</p>
              <p className="text-2xl font-bold text-primary">{stats.cakes}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Ações Rápidas - Docinhos */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
          <FaCookie />
          Docinhos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
          <FaBirthdayCake />
          Bolos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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