import Layout from '../../components/Layout/Layout'
import GlassCard from '../../components/UI/GlassCard'
import GlassButton from '../../components/UI/GlassButton'
import CakeModal from '../../components/Cakes/CakeModal'
import CakeList from '../../components/Cakes/CakeList'
import { useState, useEffect } from 'react'
import { FaPlus, FaBirthdayCake, FaExclamationTriangle, FaWeight, FaIceCream, FaSpinner } from 'react-icons/fa'

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

  // AGORA SÓ VERIFICA SE HÁ MASSAS - COBERTURAS SÃO OPCIONAIS
  const canCreateCake = cakeMasses.length > 0

  return (
    <Layout activePage="cakes">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6 flex-col xs:flex-row gap-3 xs:gap-0">
        <div className="text-center xs:text-left w-full xs:w-auto">
          <h1 className="text-xl xs:text-2xl md:text-4xl font-bold text-white mb-1 xs:mb-2">Bolos</h1>
          <p className="text-white/60 text-xs xs:text-sm md:text-base">Cadastre os tipos de bolos e visualize seus custos</p>
        </div>
        <GlassButton
          onClick={() => setIsModalOpen(true)}
          disabled={!canCreateCake}
          className="w-full xs:w-auto text-xs xs:text-sm px-3 xs:px-4 py-2 xs:py-3"
        >
          <FaPlus className="w-3 h-3 xs:w-4 xs:h-4" />
          <span>Novo Bolo</span>
        </GlassButton>
      </div>

      {!canCreateCake && (
        <div className="glass rounded-xl md:rounded-2xl p-3 md:p-4 text-center mb-4 md:mb-6 border border-orange-500/30">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-300 mx-auto mb-2 md:mb-3">
            <FaExclamationTriangle className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <h3 className="text-white font-semibold text-sm md:text-base mb-1 md:mb-2">
            Cadastre massas primeiro
          </h3>
          <p className="text-white/60 text-xs md:text-sm mb-3 md:mb-4">
            Você precisa cadastrar massas antes de criar bolos. Coberturas são opcionais.
          </p>
          <div className="flex flex-col xs:flex-row gap-2 md:gap-3 justify-center">
            <GlassButton 
              onClick={() => window.location.href = '/cakes/masses'} 
              className="text-xs px-3 py-2"
            >
              <FaWeight className="w-3 h-3" />
              Cadastrar Massas
            </GlassButton>
            {/* Botão opcional para coberturas */}
            <GlassButton 
              onClick={() => window.location.href = '/cakes/frostings'} 
              className="text-xs px-3 py-2"
              variant="secondary"
            >
              <FaIceCream className="w-3 h-3" />
              Cadastrar Coberturas (Opcional)
            </GlassButton>
          </div>
        </div>
      )}

      {/* Content */}
      <GlassCard className="p-3 md:p-4">
        {loading ? (
          <div className="text-center py-6 md:py-8">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mx-auto mb-3 md:mb-4">
              <FaSpinner className="animate-spin w-5 h-5 md:w-6 md:h-6" />
            </div>
            <p className="text-white/60 text-sm md:text-base">Carregando bolos...</p>
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