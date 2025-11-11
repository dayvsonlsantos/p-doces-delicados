// pages/candies/index.js
import Layout from '../../components/Layout/Layout'
import GlassCard from '../../components/UI/GlassCard'
import GlassButton from '../../components/UI/GlassButton'
import CandyModal from '../../components/Candies/CandyModal'
import CandyList from '../../components/Candies/CandyList'
import { useState, useEffect } from 'react'

export default function Candies() {
  const [candies, setCandies] = useState([])
  const [masses, setMasses] = useState([])
  const [products, setProducts] = useState([])
  const [supplies, setSupplies] = useState([]) // Novo estado para insumos
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCandy, setEditingCandy] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [candiesRes, massesRes, productsRes, suppliesRes] = await Promise.all([
        fetch('/api/candies'),
        fetch('/api/masses'),
        fetch('/api/products'),
        fetch('/api/supplies') // Novo
      ])

      if (!candiesRes.ok || !massesRes.ok || !productsRes.ok || !suppliesRes.ok) {
        throw new Error('Erro ao carregar dados')
      }

      setCandies(await candiesRes.json())
      setMasses(await massesRes.json())
      setProducts(await productsRes.json())
      setSupplies(await suppliesRes.json()) // Novo
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // pages/candies/index.js - função handleSave atualizada
  const handleSave = async (candyData) => {
    try {
      // Calcular o custo antes de salvar
      const costBreakdown = calculateCandyCost(candyData, masses, products, supplies)

      const candyWithCost = {
        ...candyData,
        costPerUnit: costBreakdown.totalCost,
        costBreakdown: costBreakdown,
        // Garantir que os campos de preço são salvos
        profitMargin: candyData.profitMargin || 50,
        salePrice: candyData.salePrice || 0
      }

      // Definir URL e método corretamente
      let url = '/api/candies'
      let method = 'POST'
      let body = candyWithCost

      // Se está editando, usa PUT e inclui o ID
      if (editingCandy) {
        method = 'PUT'
        body = {
          ...candyWithCost,
          id: editingCandy._id
        }
      }

      console.log('Enviando dados:', body) // Para debug

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log('Resposta da API:', result) // Para debug

      await loadData()
      setIsModalOpen(false)
      setEditingCandy(null)
      alert(editingCandy ? 'Docinho atualizado com sucesso!' : 'Docinho criado com sucesso!')
    } catch (error) {
      console.error('Erro completo ao salvar:', error)
      alert('Erro ao salvar docinho: ' + error.message)
    }
  }

  // pages/candies/index.js - função calculateCandyCost atualizada
  const calculateCandyCost = (candyData, masses, products, supplies) => {
    // Verificar se é formato antigo ou novo
    const candyMasses = candyData.masses || [{ massName: candyData.massName, grams: candyData.candyGrams }]

    if (!candyMasses || candyMasses.length === 0 || !candyMasses.some(mass => mass.massName && mass.grams)) {
      return { massCost: 0, extrasCost: 0, suppliesCost: 0, totalCost: 0, totalGrams: 0 }
    }

    let totalMassCost = 0
    let totalGrams = 0
    const costBreakdown = {
      massCost: 0,
      extrasCost: 0,
      suppliesCost: 0,
      totalCost: 0,
      totalGrams: 0
    }

    // 1. CUSTO DAS MASSAS
    candyMasses.forEach(massItem => {
      if (massItem.massName && massItem.grams) {
        const mass = masses.find(m => m.name === massItem.massName)
        if (mass) {
          const massCostPerGram = calculateMassCost(mass.ingredients, products) / mass.totalGrams
          const massGrams = parseFloat(massItem.grams)
          const massCost = massCostPerGram * massGrams

          totalMassCost += massCost
          totalGrams += massGrams
        }
      }
    })

    costBreakdown.massCost = totalMassCost
    costBreakdown.totalGrams = totalGrams

    // 2. CUSTO DOS EXTRAS
    let extrasCost = 0
    if (candyData.extras && candyData.extras.length > 0) {
      candyData.extras.forEach(extra => {
        const product = products.find(p => p._id === extra.productId)
        if (product && extra.grams) {
          const extraGrams = parseFloat(extra.grams)
          let extraCost = 0

          if (product.unit === 'un') {
            extraCost = product.unitCost * (extraGrams / 100)
          } else {
            extraCost = extraGrams * product.baseUnitCost
          }

          extrasCost += extraCost
        }
      })
    }
    costBreakdown.extrasCost = extrasCost

    // 3. CUSTO DOS INSUMOS
    let suppliesCost = 0
    if (candyData.supplies && candyData.supplies.length > 0) {
      candyData.supplies.forEach(supplyId => {
        const supply = supplies.find(s => s._id === supplyId)
        if (supply) {
          suppliesCost += supply.cost
        }
      })
    }
    costBreakdown.suppliesCost = suppliesCost

    costBreakdown.totalCost = totalMassCost + extrasCost + suppliesCost
    return costBreakdown
  }
  
  // Função auxiliar para calcular custo da massa
  const calculateMassCost = (ingredients, products) => {
    let totalCost = 0

    ingredients.forEach(ingredient => {
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

  const handleEdit = (candy) => {
    setEditingCandy(candy)
    setIsModalOpen(true)
  }

  const handleDelete = async (candyId) => {
    if (confirm('Tem certeza que deseja excluir este docinho?')) {
      try {
        const response = await fetch('/api/candies', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: candyId })
        })

        if (!response.ok) {
          throw new Error('Erro ao excluir docinho')
        }

        await loadData()
        alert('Docinho excluído com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir docinho:', error)
        alert('Erro ao excluir docinho: ' + error.message)
      }
    }
  }

  const canCreateCandy = masses.length > 0 && products.length > 0

  return (
    <Layout activePage="candies">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Docinhos</h1>
          <p className="text-white/60">Cadastre os tipos de docinhos e visualize seus custos</p>
        </div>
        <GlassButton
          onClick={() => setIsModalOpen(true)}
          disabled={!canCreateCandy}
        >
          <i className="fas fa-plus"></i>
          Novo Docinho
        </GlassButton>
      </div>

      {!canCreateCandy && (
        <div className="glass rounded-3xl p-6 text-center mb-6 border border-orange-500/30">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-300 mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-xl"></i>
          </div>
          <h3 className="text-white font-semibold mb-2">Cadastre massas e produtos primeiro</h3>
          <p className="text-white/60 mb-4">Você precisa cadastrar massas e produtos antes de criar docinhos</p>
          <div className="flex gap-3 justify-center">
            <GlassButton onClick={() => window.location.href = '/masses'}>
              <i className="fas fa-weight-scale"></i>
              Cadastrar Massas
            </GlassButton>
            <GlassButton onClick={() => window.location.href = '/products'}>
              <i className="fas fa-box"></i>
              Cadastrar Produtos
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
            <p className="text-white/60">Carregando docinhos...</p>
          </div>
        ) : (
          <CandyList
            candies={candies}
            masses={masses}
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </GlassCard>

      {/* Modal */}
      <CandyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCandy(null)
        }}
        onSave={handleSave}
        candy={editingCandy}
        masses={masses}
        products={products}
      />
    </Layout>
  )
}