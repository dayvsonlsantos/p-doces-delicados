import Layout from '../../../components/Layout/Layout'
import GlassCard from '../../../components/UI/GlassCard'
import GlassButton from '../../../components/UI/GlassButton'
import CakeFrostingModal from '../../../components/Cakes/CakeFrostingModal'
import { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'

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

      setFrostings(await frostingsRes.json())
      setProducts(await productsRes.json())
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados: ' + error.message)
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Coberturas para Bolos</h1>
          <p className="text-white/60">Crie receitas de cobertura para seus bolos</p>
        </div>
        <GlassButton
          onClick={() => setIsModalOpen(true)}
          disabled={products.length === 0}
        >
          <FaPlus />
          Nova Cobertura
        </GlassButton>
      </div>

      {products.length === 0 && (
        <div className="glass rounded-3xl p-6 text-center mb-6 border border-orange-500/30">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-300 mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-xl"></i>
          </div>
          <h3 className="text-white font-semibold mb-2">Cadastre produtos primeiro</h3>
          <p className="text-white/60 mb-4">Você precisa cadastrar produtos antes de criar coberturas</p>
          <GlassButton onClick={() => window.location.href = '/products'}>
            <i className="fas fa-box"></i>
            Ir para Produtos
          </GlassButton>
        </div>
      )}

      <GlassCard>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto mb-4">
              <i className="fas fa-spinner fa-spin text-xl"></i>
            </div>
            <p className="text-white/60">Carregando coberturas...</p>
          </div>
        ) : frostings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center text-white/30 mx-auto mb-4">
              <i className="fas fa-ice-cream text-3xl"></i>
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">Nenhuma cobertura cadastrada</h3>
            <p className="text-white/60">Comece criando suas primeiras receitas de cobertura para bolos</p>
          </div>
        ) : (
          <div className="space-y-6">
            {frostings.map((frosting) => {
              const cost = calculateFrostingCost(frosting)
              const costPerCake = cost / (parseInt(frosting.yieldCakes) || 1)

              return (
                <div key={frosting._id} className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-pink-600 flex items-center justify-center text-white">
                        <i className="fas fa-ice-cream"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{frosting.name}</h3>
                        <p className="text-white/60">
                          Rendimento: {frosting.totalGrams}g • {frosting.yieldCakes} bolo(s)
                        </p>
                        <p className="text-white/60">
                          {frosting.gramsPerCake}g por bolo
                        </p>

                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/70">Custo total:</span>
                            <span className="text-green-400 font-semibold">
                              R$ {cost.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/70">Custo por bolo:</span>
                            <span className="text-primary-300 font-semibold">
                              R$ {costPerCake.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <GlassButton
                        variant="secondary"
                        onClick={() => handleEdit(frosting)}
                        className="px-4 py-2"
                      >
                        <FaEdit size={14} />
                      </GlassButton>
                      <GlassButton
                        variant="danger"
                        onClick={() => handleDelete(frosting._id)}
                        className="px-4 py-2"
                      >
                        <FaTrash size={14} />
                      </GlassButton>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {frosting.ingredients?.map((ingredient, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                        <div>
                          <span className="text-white font-medium">
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
        products={products}
      />
    </Layout>
  )
}