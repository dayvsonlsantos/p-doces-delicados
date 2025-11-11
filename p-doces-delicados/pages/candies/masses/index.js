// pages/masses/index.js
import Layout from '../../../components/Layout/Layout'
import GlassCard from '../../../components/UI/GlassCard'
import GlassButton from '../../../components/UI/GlassButton'
import MassModal from '../../../components/Masses/MassModal'
import MassList from '../../../components/Masses/MassList'
import { useState, useEffect } from 'react'

export default function Masses() {
  const [masses, setMasses] = useState([])
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMass, setEditingMass] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  // pages/masses/index.js - função loadData melhorada
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

      // Define arrays vazios para evitar erros de renderização
      setMasses([])
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // pages/masses/index.js - corrigir handleSave
  const handleSave = async (massData) => {
    try {
      let url = '/api/masses'
      let method = 'POST'
      let body = massData

      // Se está editando, usa PUT
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
    <Layout activePage="masses">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Massas</h1>
          <p className="text-white/60">Crie receitas de massa para seus docinhos</p>
        </div>
        <GlassButton
          onClick={() => setIsModalOpen(true)}
          disabled={products.length === 0}
        >
          <i className="fas fa-plus"></i>
          Nova Massa
        </GlassButton>
      </div>

      {products.length === 0 && (
        <div className="glass rounded-3xl p-6 text-center mb-6 border border-orange-500/30">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-300 mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-xl"></i>
          </div>
          <h3 className="text-white font-semibold mb-2">Cadastre produtos primeiro</h3>
          <p className="text-white/60 mb-4">Você precisa cadastrar produtos antes de criar massas</p>
          <GlassButton onClick={() => window.location.href = '/products'}>
            <i className="fas fa-box"></i>
            Ir para Produtos
          </GlassButton>
        </div>
      )}

      {/* Content */}
      <GlassCard>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto mb-4">
              <i className="fas fa-spinner fa-spin text-xl"></i>
            </div>
            <p className="text-white/60">Carregando massas...</p>
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