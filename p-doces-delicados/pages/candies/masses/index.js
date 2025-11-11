import Layout from '../../../components/Layout/Layout'
import GlassCard from '../../../components/UI/GlassCard'
import GlassButton from '../../../components/UI/GlassButton'
import MassModal from '../../../components/Masses/MassModal'
import MassList from '../../../components/Masses/MassList'
import { useState, useEffect } from 'react'
import { FaPlus, FaWeight, FaExclamationTriangle, FaBox } from 'react-icons/fa'

export default function CandyMasses() {
  const [masses, setMasses] = useState([])
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMass, setEditingMass] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [massesRes, productsRes] = await Promise.all([
        fetch('/api/masses'),
        fetch('/api/products')
      ])

      if (!massesRes.ok) {
        throw new Error(`Erro ao carregar massas: ${massesRes.status} ${massesRes.statusText}`)
      }

      if (!productsRes.ok) {
        throw new Error(`Erro ao carregar produtos: ${productsRes.status} ${productsRes.statusText}`)
      }

      const massesData = await massesRes.json()
      const productsData = await productsRes.json()

      setMasses(massesData)
      setProducts(productsData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados: ' + error.message)
      setMasses([])
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (massData) => {
    try {
      let url = '/api/masses'
      let method = 'POST'
      let body = massData

      if (editingMass) {
        method = 'PUT'
        body = {
          ...massData,
          id: editingMass._id
        }
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar massa')
      }

      await loadData()
      setIsModalOpen(false)
      setEditingMass(null)
      alert(editingMass ? 'Massa atualizada com sucesso!' : 'Massa criada com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar massa:', error)
      alert('Erro ao salvar massa: ' + error.message)
    }
  }

  const handleEdit = (mass) => {
    setEditingMass(mass)
    setIsModalOpen(true)
  }

  const handleDelete = async (massId) => {
    if (confirm('Tem certeza que deseja excluir esta massa? Docinhos que usam esta massa serão afetados.')) {
      try {
        const response = await fetch('/api/masses', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: massId })
        })

        if (!response.ok) {
          throw new Error('Erro ao excluir massa')
        }

        await loadData()
        alert('Massa excluída com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir massa:', error)
        alert('Erro ao excluir massa: ' + error.message)
      }
    }
  }

  return (
    <Layout activePage="candies">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8 flex-col sm:flex-row gap-4 sm:gap-0">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl md:text-4xl font-bold text-primary mb-2">Massas para Docinhos</h1>
          <p className="text-secondary text-sm md:text-base">Crie receitas de massa para seus docinhos</p>
        </div>
        <GlassButton
          onClick={() => setIsModalOpen(true)}
          disabled={products.length === 0}
          className="w-full sm:w-auto"
        >
          <FaPlus className="w-4 h-4" />
          <span className="text-sm md:text-base">Nova Massa</span>
        </GlassButton>
      </div>

      {products.length === 0 && (
        <div className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 text-center mb-4 md:mb-6 border border-orange-500/30">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-300 mx-auto mb-3 md:mb-4">
            <FaExclamationTriangle className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h3 className="text-white font-semibold text-base md:text-lg mb-2">Cadastre produtos primeiro</h3>
          <p className="text-white/60 text-sm md:text-base mb-4">Você precisa cadastrar produtos antes de criar massas</p>
          <GlassButton onClick={() => window.location.href = '/products'} className="text-xs md:text-sm">
            <FaBox className="w-3 h-3 md:w-4 md:h-4" />
            Ir para Produtos
          </GlassButton>
        </div>
      )}

      {/* Content */}
      <GlassCard className="p-4 md:p-6">
        {loading ? (
          <div className="text-center py-8 md:py-12">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto mb-4">
              <FaWeight className="animate-spin w-6 h-6 md:w-8 md:h-8" />
            </div>
            <p className="text-white/60 text-sm md:text-base">Carregando massas...</p>
          </div>
        ) : (
          <MassList
            masses={masses}
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </GlassCard>

      {/* Modal */}
      <MassModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingMass(null)
        }}
        onSave={handleSave}
        mass={editingMass}
        products={products}
      />
    </Layout>
  )
}