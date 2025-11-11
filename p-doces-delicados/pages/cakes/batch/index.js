import Layout from '../../../components/Layout/Layout'
import GlassCard from '../../../components/UI/GlassCard'
import GlassButton from '../../../components/UI/GlassButton'
import CakeBatchCalculator from '../../../components/Cakes/CakeBatchCalculator'
import { useState, useEffect } from 'react'

export default function CakeBatch() {
  const [cakes, setCakes] = useState([])
  const [cakeMasses, setCakeMasses] = useState([])
  const [cakeFrostings, setCakeFrostings] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [cakesRes, massesRes, frostingsRes, productsRes] = await Promise.all([
        fetch('/api/cakes'),
        fetch('/api/cake-masses'),
        fetch('/api/cake-frostings'),
        fetch('/api/products')
      ])

      setCakes(await cakesRes.json())
      setCakeMasses(await massesRes.json())
      setCakeFrostings(await frostingsRes.json())
      setProducts(await productsRes.json())
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout activePage="cakes-batch">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Calculadora de Lote - Bolos</h1>
        <p className="text-white/60">Calcule os ingredientes necessários para produção de bolos em lote</p>
      </div>

      {loading ? (
        <GlassCard>
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto mb-4">
              <i className="fas fa-spinner fa-spin text-xl"></i>
            </div>
            <p className="text-white/60">Carregando dados...</p>
          </div>
        </GlassCard>
      ) : (
        <CakeBatchCalculator
          cakes={cakes}
          cakeMasses={cakeMasses}
          cakeFrostings={cakeFrostings}
          products={products}
        />
      )}
    </Layout>
  )
}