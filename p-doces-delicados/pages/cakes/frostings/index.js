// pages/cakes/frostings/index.js (corrigido)
import Layout from '../../../components/Layout/Layout'
import GlassCard from '../../../components/UI/GlassCard'
import GlassButton from '../../../components/UI/GlassButton'
import CakeFrostingModal from '../../../components/Cakes/CakeFrostingModal'
import { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaPlus, FaIceCream, FaExclamationTriangle, FaBox, FaSpinner } from 'react-icons/fa'

export default function CakeFrostings() {
  const [frostings, setFrostings] = useState([])
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFrosting, setEditingFrosting] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [frostingsRes, productsRes] = await Promise.all([
        fetch('/api/cake-frostings'),
        fetch('/api/products')
      ])

      if (!frostingsRes.ok) throw new Error('Erro ao carregar coberturas')
      if (!productsRes.ok) throw new Error('Erro ao carregar produtos')

      const frostingsData = await frostingsRes.json()
      const productsData = await productsRes.json()

      setFrostings(frostingsData || [])
      setProducts(productsData || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados: ' + error.message)
      setFrostings([])
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (frostingData) => {
    try {
      let url = '/api/cake-frostings'
      let method = 'POST'
      let body = frostingData

      if (editingFrosting) {
        method = 'PUT'
        body = {
          ...frostingData,
          id: editingFrosting._id
        }
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar cobertura')
      }

      await loadData()
      setIsModalOpen(false)
      setEditingFrosting(null)
      alert(editingFrosting ? 'Cobertura atualizada com sucesso!' : 'Cobertura criada com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar cobertura:', error)
      alert('Erro ao salvar cobertura: ' + error.message)
    }
  }

  const handleEdit = (frosting) => {
    setEditingFrosting(frosting)
    setIsModalOpen(true)
  }

  const handleDelete = async (frostingId) => {
    if (confirm('Tem certeza que deseja excluir esta cobertura? Bolos que usam esta cobertura serão afetados.')) {
      try {
        const response = await fetch('/api/cake-frostings', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: frostingId })
        })

        if (!response.ok) {
          throw new Error('Erro ao excluir cobertura')
        }

        await loadData()
        alert('Cobertura excluída com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir cobertura:', error)
        alert('Erro ao excluir cobertura: ' + error.message)
      }
    }
  }

  const calculateFrostingCost = (frosting) => {
    let totalCost = 0
    frosting.ingredients?.forEach(ingredient => {
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
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Coberturas para Bolos</h1>
          <p className="text-white/60 text-sm md:text-base">Crie receitas de cobertura para seus bolos</p>
        </div>
        <GlassButton
          onClick={() => setIsModalOpen(true)}
          disabled={!products || products.length === 0}
          className="w-full sm:w-auto"
        >
          <FaPlus className="w-4 h-4" />
          <span className="text-sm md:text-base">Nova Cobertura</span>
        </GlassButton>
      </div>

      {(!products || products.length === 0) && (
        <div className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 text-center mb-4 md:mb-6 border border-orange-500/30">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-300 mx-auto mb-3 md:mb-4">
            <FaExclamationTriangle className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h3 className="text-white font-semibold text-base md:text-lg mb-2">Cadastre produtos primeiro</h3>
          <p className="text-white/60 text-sm md:text-base mb-4">Você precisa cadastrar produtos antes de criar coberturas</p>
          <GlassButton onClick={() => window.location.href = '/products'} className="text-xs md:text-sm">
            <FaBox className="w-3 h-3 md:w-4 md:h-4" />
            Ir para Produtos
          </GlassButton>
        </div>
      )}

      <GlassCard className="p-4 md:p-6">
        {loading ? (
          <div className="text-center py-8 md:py-12">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto mb-4">
              <FaSpinner className="animate-spin w-6 h-6 md:w-8 md:h-8" />
            </div>
            <p className="text-white/60 text-sm md:text-base">Carregando coberturas...</p>
          </div>
        ) : !frostings || frostings.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-white/10 flex items-center justify-center text-white/30 mx-auto mb-4">
              <FaIceCream className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-white text-base md:text-lg font-semibold mb-2">Nenhuma cobertura cadastrada</h3>
            <p className="text-white/60 text-sm md:text-base">Comece criando suas primeiras receitas de cobertura para bolos</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {frostings.map((frosting) => {
              const cost = calculateFrostingCost(frosting)
              const costPerCake = cost / (parseInt(frosting.yieldCakes) || 1)

              return (
                <div key={frosting._id} className="p-4 md:p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
                  <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                    <div className="flex items-center gap-3 md:gap-4 w-full">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-pink-600 flex items-center justify-center text-white flex-shrink-0">
                        <FaIceCream className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-base md:text-lg mb-1 truncate">{frosting.name}</h3>
                        <p className="text-white/60 text-xs md:text-sm">
                          Rendimento: {frosting.totalGrams}g • {frosting.yieldCakes} bolo(s)
                        </p>
                        <p className="text-white/60 text-xs md:text-sm">
                          {frosting.gramsPerCake}g por bolo
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
                        onClick={() => handleEdit(frosting)}
                        className="px-3 py-2 text-xs md:text-sm"
                      >
                        <FaEdit className="w-3 h-3" />
                      </GlassButton>
                      <GlassButton
                        variant="danger"
                        onClick={() => handleDelete(frosting._id)}
                        className="px-3 py-2 text-xs md:text-sm"
                      >
                        <FaTrash className="w-3 h-3" />
                      </GlassButton>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-4">
                    {frosting.ingredients?.map((ingredient, index) => (
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

      <CakeFrostingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingFrosting(null)
        }}
        onSave={handleSave}
        frosting={editingFrosting}
        products={products || []}
      />
    </Layout>
  )
}