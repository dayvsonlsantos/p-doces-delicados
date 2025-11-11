import Layout from '../../components/Layout/Layout'
import GlassCard from '../../components/UI/GlassCard'
import GlassButton from '../../components/UI/GlassButton'
import CakeModal from '../../components/Cakes/CakeModal'
import CakeList from '../../components/Cakes/CakeList'
import { useState, useEffect } from 'react'

export default function Cakes() {
  const [cakes, setCakes] = useState([])
  const [cakeMasses, setCakeMasses] = useState([])
  const [cakeFrostings, setCakeFrostings] = useState([])
  const [products, setProducts] = useState([])
  const [supplies, setSupplies] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCake, setEditingCake] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [cakesRes, massesRes, frostingsRes, productsRes, suppliesRes] = await Promise.all([
        fetch('/api/cakes'),
        fetch('/api/cake-masses'),
        fetch('/api/cake-frostings'),
        fetch('/api/products'),
        fetch('/api/supplies')
      ])

      setCakes(await cakesRes.json())
      setCakeMasses(await massesRes.json())
      setCakeFrostings(await frostingsRes.json())
      setProducts(await productsRes.json())
      setSupplies(await suppliesRes.json())
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (cakeData) => {
    try {
      let url = '/api/cakes'
      let method = 'POST'
      let body = cakeData

      if (editingCake) {
        method = 'PUT'
        body = {
          ...cakeData,
          id: editingCake._id
        }
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar bolo')
      }

      await loadData()
      setIsModalOpen(false)
      setEditingCake(null)
      alert(editingCake ? 'Bolo atualizado com sucesso!' : 'Bolo criado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar bolo:', error)
      alert('Erro ao salvar bolo: ' + error.message)
    }
  }

  const handleEdit = (cake) => {
    setEditingCake(cake)
    setIsModalOpen(true)
  }

  const handleDelete = async (cakeId) => {
    if (confirm('Tem certeza que deseja excluir este bolo?')) {
      try {
        const response = await fetch('/api/cakes', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: cakeId })
        })

        if (!response.ok) {
          throw new Error('Erro ao excluir bolo')
        }

        await loadData()
        alert('Bolo excluído com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir bolo:', error)
        alert('Erro ao excluir bolo: ' + error.message)
      }
    }
  }

  const canCreateCake = cakeMasses.length > 0 && cakeFrostings.length > 0

  return (
    <Layout activePage="cakes">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Bolos</h1>
          <p className="text-white/60">Cadastre os tipos de bolos e visualize seus custos</p>
        </div>
        <GlassButton
          onClick={() => setIsModalOpen(true)}
          disabled={!canCreateCake}
        >
          <i className="fas fa-plus"></i>
          Novo Bolo
        </GlassButton>
      </div>

      {!canCreateCake && (
        <div className="glass rounded-3xl p-6 text-center mb-6 border border-orange-500/30">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-300 mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-xl"></i>
          </div>
          <h3 className="text-white font-semibold mb-2">Cadastre massas e coberturas primeiro</h3>
          <p className="text-white/60 mb-4">Você precisa cadastrar massas e coberturas antes de criar bolos</p>
          <div className="flex gap-3 justify-center">
            <GlassButton onClick={() => window.location.href = '/cakes/masses'}>
              <i className="fas fa-weight-scale"></i>
              Cadastrar Massas
            </GlassButton>
            <GlassButton onClick={() => window.location.href = '/cakes/frostings'}>
              <i className="fas fa-ice-cream"></i>
              Cadastrar Coberturas
            </GlassButton>
          </div>
        </div>
      )}

      {/* Content */}
      <GlassCard>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto mb-4">
              <i className="fas fa-spinner fa-spin text-xl"></i>
            </div>
            <p className="text-white/60">Carregando bolos...</p>
          </div>
        ) : (
          <CakeList
            cakes={cakes}
            cakeMasses={cakeMasses}
            cakeFrostings={cakeFrostings}
            products={products}
            supplies={supplies}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </GlassCard>

      {/* Modal */}
      <CakeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCake(null)
        }}
        onSave={handleSave}
        cake={editingCake}
        cakeMasses={cakeMasses}
        cakeFrostings={cakeFrostings}
        products={products}
        supplies={supplies}
      />
    </Layout>
  )
}