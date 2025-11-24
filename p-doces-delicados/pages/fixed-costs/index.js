// pages/fixed-costs/index.js
import Layout from '../../components/Layout/Layout'
import GlassCard from '../../components/UI/GlassCard'
import GlassButton from '../../components/UI/GlassButton'
import FixedCostsModal from '../../components/FixedCosts/FixedCostsModal'
import FixedCostsList from '../../components/FixedCosts/FixedCostsList'
import { useState, useEffect } from 'react'
import { FaPlus, FaDollarSign, FaCalculator } from 'react-icons/fa'

export default function FixedCosts() {
  const [fixedCosts, setFixedCosts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCost, setEditingCost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [totalCostPerMinute, setTotalCostPerMinute] = useState(0)

  useEffect(() => {
    loadFixedCosts()
  }, [])

  const loadFixedCosts = async () => {
    try {
      const res = await fetch('/api/fixed-costs')
      const data = await res.json()
      setFixedCosts(data)
      
      // Calcular custo total por minuto
      const total = data.reduce((sum, cost) => sum + (parseFloat(cost.costPerMinute) || 0), 0)
      setTotalCostPerMinute(total)
    } catch (error) {
      console.error('Erro ao carregar custos fixos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (costData) => {
    try {
      const url = '/api/fixed-costs'
      const method = editingCost ? 'PUT' : 'POST'
      const body = editingCost ? { ...costData, id: editingCost._id } : costData

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      await loadFixedCosts()
      setIsModalOpen(false)
      setEditingCost(null)
    } catch (error) {
      console.error('Erro ao salvar custo fixo:', error)
      alert('Erro ao salvar custo fixo: ' + error.message)
    }
  }

  const handleNewCost = () => {
    setEditingCost(null)
    setIsModalOpen(true)
  }

  const handleEdit = (cost) => {
    setEditingCost(cost)
    setIsModalOpen(true)
  }

  const handleDelete = async (costId) => {
    if (confirm('Tem certeza que deseja excluir este custo fixo?')) {
      try {
        await fetch('/api/fixed-costs', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: costId })
        })
        await loadFixedCosts()
      } catch (error) {
        console.error('Erro ao excluir custo fixo:', error)
        alert('Erro ao excluir custo fixo: ' + error.message)
      }
    }
  }

  return (
    <Layout activePage="fixed-costs">
      <div className="flex items-center justify-between mb-6 md:mb-8 flex-col sm:flex-row gap-4 sm:gap-0">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Custos Fixos</h1>
          <p className="text-secondary text-sm md:text-base">
            Cadastre seus custos mensais e calcule o custo por minuto de trabalho
          </p>
        </div>
        <GlassButton onClick={handleNewCost} className="w-full sm:w-auto">
          <FaPlus className="w-4 h-4" />
          <span className="text-sm md:text-base">Novo Custo</span>
        </GlassButton>
      </div>

      {/* Card de custo total por minuto */}
      {totalCostPerMinute > 0 && (
        <div className="mb-6">
          <GlassCard className="p-4 md:p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg md:text-xl mb-2">
                  Custo Total por Minuto
                </h3>
                <p className="text-white/60 text-sm md:text-base">
                  Some este valor ao custo de cada produto considerando o tempo de preparo
                </p>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold text-2xl md:text-3xl">
                  R$ {totalCostPerMinute.toFixed(8)}
                </div>
                <div className="text-white/60 text-sm">por minuto</div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      <GlassCard className="p-4 md:p-6">
        {loading ? (
          <div className="text-center py-8 md:py-12">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-500 mx-auto mb-4">
              <FaDollarSign className="animate-spin w-6 h-6 md:w-8 md:h-8" />
            </div>
            <p className="text-secondary text-sm md:text-base">Carregando custos fixos...</p>
          </div>
        ) : (
          <FixedCostsList
            fixedCosts={fixedCosts}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </GlassCard>

      <FixedCostsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        fixedCost={editingCost}
      />
    </Layout>
  )
}