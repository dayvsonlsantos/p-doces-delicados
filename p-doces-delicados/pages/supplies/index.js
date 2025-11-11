import Layout from '../../components/Layout/Layout'
import GlassCard from '../../components/UI/GlassCard'
import GlassButton from '../../components/UI/GlassButton'
import SupplyModal from '../../components/Supplies/SupplyModal'
import SupplyList from '../../components/Supplies/SupplyList'
import { useState, useEffect } from 'react'
import { FaPlus, FaTag } from 'react-icons/fa'

export default function Supplies() {
  const [supplies, setSupplies] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupply, setEditingSupply] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSupplies()
  }, [])

  const loadSupplies = async () => {
    try {
      const res = await fetch('/api/supplies')
      const data = await res.json()
      setSupplies(data)
    } catch (error) {
      console.error('Erro ao carregar insumos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (supplyData) => {
    try {
      const url = '/api/supplies'
      const method = editingSupply ? 'PUT' : 'POST'
      const body = editingSupply ? { ...supplyData, id: editingSupply._id } : supplyData

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      await loadSupplies()
      setIsModalOpen(false)
      setEditingSupply(null)
    } catch (error) {
      console.error('Erro ao salvar insumo:', error)
      alert('Erro ao salvar insumo: ' + error.message)
    }
  }

  const handleNewSupply = () => {
    setEditingSupply(null)
    setIsModalOpen(true)
  }

  const handleEdit = (supply) => {
    setEditingSupply(supply)
    setIsModalOpen(true)
  }

  const handleDelete = async (supplyId) => {
    if (confirm('Tem certeza que deseja excluir este insumo?')) {
      try {
        await fetch('/api/supplies', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: supplyId })
        })
        await loadSupplies()
      } catch (error) {
        console.error('Erro ao excluir insumo:', error)
        alert('Erro ao excluir insumo: ' + error.message)
      }
    }
  }

  return (
    <Layout activePage="supplies">
      <div className="flex items-center justify-between mb-6 md:mb-8 flex-col sm:flex-row gap-4 sm:gap-0">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl md:text-4xl font-bold text-primary mb-2">Insumos</h1>
          <p className="text-secondary text-sm md:text-base">Cadastre papéis, embalagens e outros itens por unidade</p>
        </div>
        <GlassButton onClick={handleNewSupply} className="w-full sm:w-auto">
          <FaPlus className="w-4 h-4" />
          <span className="text-sm md:text-base">Novo Insumo</span>
        </GlassButton>
      </div>

      <GlassCard className="p-4 md:p-6">
        {loading ? (
          <div className="text-center py-8 md:py-12">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500 mx-auto mb-4">
              <FaTag className="animate-spin w-6 h-6 md:w-8 md:h-8" />
            </div>
            <p className="text-secondary text-sm md:text-base">Carregando insumos...</p>
          </div>
        ) : (
          <SupplyList
            supplies={supplies}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </GlassCard>

      <SupplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        supply={editingSupply}
      />
    </Layout>
  )
}