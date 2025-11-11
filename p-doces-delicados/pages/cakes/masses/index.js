// pages/cakes/masses/index.js (atualizado)
import Layout from '../../../components/Layout/Layout'
import GlassCard from '../../../components/UI/GlassCard'
import GlassButton from '../../../components/UI/GlassButton'
import CakeMassModal from '../../../components/Cakes/CakeMassModal'
import { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaPlus, FaWeight } from 'react-icons/fa'

export default function CakeMasses() {
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
        fetch('/api/cake-masses'),
        fetch('/api/products')
      ])

      setMasses(await massesRes.json())
      setProducts(await productsRes.json())
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (massData) => {
    try {
      let url = '/api/cake-masses'
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
    if (confirm('Tem certeza que deseja excluir esta massa? Bolos que usam esta massa serão afetados.')) {
      try {
        const response = await fetch('/api/cake-masses', {
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

  const calculateMassCost = (mass) => {
    let totalCost = 0
    mass.ingredients?.forEach(ingredient => {
      const product = products.find(p => p._id === ingredient.productId)
      if (product && ingredient.grams) {
        const ingredientGrams = parseFloat(ingredient.grams)
        let cost = 0

        if (product.unit === 'un') {
          cost = product.unitCost
        } else {
          cost = ingredientGrams * product.baseUnitCost
        }

        totalCost += cost
      }
    })
    return totalCost
  }

  const getProductName = (productId) => {
    const product = products.find(p => p._id === productId)
    return product ? product.name : 'Produto não encontrado'
  }

  return (
    <Layout activePage="cakes">
      <div className="flex items-center justify-between mb-6 md:mb-8 flex-col sm:flex-row gap-4 sm:gap-0">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Massas para Bolos</h1>
          <p className="text-white/60 text-sm md:text-base">Crie receitas de massa para seus bolos</p>
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
            <i className="fas fa-exclamation-triangle text-lg md:text-xl"></i>
          </div>
          <h3 className="text-white font-semibold text-base md:text-lg mb-2">Cadastre produtos primeiro</h3>
          <p className="text-white/60 text-sm md:text-base mb-4">Você precisa cadastrar produtos antes de criar massas</p>
          <GlassButton onClick={() => window.location.href = '/products'} className="text-xs md:text-sm">
            <i className="fas fa-box"></i>
            Ir para Produtos
          </GlassButton>
        </div>
      )}

      <GlassCard className="p-4 md:p-6">
        {loading ? (
          <div className="text-center py-8 md:py-12">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto mb-4">
              <i className="fas fa-spinner fa-spin text-xl md:text-2xl"></i>
            </div>
            <p className="text-white/60 text-sm md:text-base">Carregando massas...</p>
          </div>
        ) : masses.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-white/10 flex items-center justify-center text-white/30 mx-auto mb-4">
              <FaWeight className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-white text-base md:text-lg font-semibold mb-2">Nenhuma massa cadastrada</h3>
            <p className="text-white/60 text-sm md:text-base">Comece criando suas primeiras receitas de massa para bolos</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {masses.map((mass) => {
              const cost = calculateMassCost(mass)
              const costPerCake = cost / (parseInt(mass.yieldCakes) || 1)

              return (
                <div key={mass._id} className="p-4 md:p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
                  <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                    <div className="flex items-center gap-3 md:gap-4 w-full">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white flex-shrink-0">
                        <FaWeight className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-base md:text-lg mb-1 truncate">{mass.name}</h3>
                        <p className="text-white/60 text-xs md:text-sm">
                          Rendimento: {mass.totalGrams}g • {mass.yieldCakes} bolo(s)
                        </p>
                        <p className="text-white/60 text-xs md:text-sm">
                          {mass.gramsPerCake}g por bolo
                        </p>

                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs md:text-sm">
                            <span className="text-white/70">Custo total:</span>
                            <span className="text-green-400 font-semibold">
                              R$ {cost.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs md:text-sm">
                            <span className="text-white/70">Custo por bolo:</span>
                            <span className="text-primary-300 font-semibold">
                              R$ {costPerCake.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <GlassButton
                        variant="secondary"
                        onClick={() => handleEdit(mass)}
                        className="px-3 py-2 text-xs md:text-sm"
                      >
                        <FaEdit className="w-3 h-3" />
                      </GlassButton>
                      <GlassButton
                        variant="danger"
                        onClick={() => handleDelete(mass._id)}
                        className="px-3 py-2 text-xs md:text-sm"
                      >
                        <FaTrash className="w-3 h-3" />
                      </GlassButton>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-4">
                    {mass.ingredients?.map((ingredient, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                        <div className="min-w-0">
                          <span className="text-white font-medium text-sm md:text-base truncate">
                            {getProductName(ingredient.productId)}
                          </span>
                          <div className="text-white/60 text-xs">
                            {ingredient.grams}g
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </GlassCard>

      <CakeMassModal
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