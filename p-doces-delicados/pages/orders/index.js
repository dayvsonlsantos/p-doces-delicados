import Layout from '../../components/Layout/Layout'
import GlassCard from '../../components/UI/GlassCard'
import GlassButton from '../../components/UI/GlassButton'
import OrderModal from '../../components/Orders/OrderModal'
import OrderList from '../../components/Orders/OrderList'
import CalculatorModal from '../../components/Orders/CalculatorModal'
import { useState, useEffect } from 'react'
import { FaPlus, FaCalculator } from 'react-icons/fa'
import { useRouter } from 'next/router'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [candies, setCandies] = useState([])
  const [cakes, setCakes] = useState([])
  const [supplies, setSupplies] = useState([])
  const [masses, setMasses] = useState([])
  const [products, setProducts] = useState([])
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const { calculator } = router.query

  useEffect(() => {
    loadData()
  }, [])

  // CORREÇÃO: Detectar parâmetro da calculadora
  useEffect(() => {
    console.log('🔍 Verificando parâmetro calculator:', calculator)
    if (calculator === 'true') {
      console.log('🎯 Abrindo calculadora automaticamente...')
      setIsCalculatorModalOpen(true)

      // Remove o parâmetro da URL sem recarregar a página
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('calculator')
      window.history.replaceState({}, '', newUrl.toString())
      console.log('🔄 URL atualizada:', newUrl.toString())
    }
  }, [calculator])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ordersRes, candiesRes, cakesRes, suppliesRes, massesRes, productsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/candies'),
        fetch('/api/cakes'),
        fetch('/api/supplies'),
        fetch('/api/masses'),
        fetch('/api/products')
      ])

      setOrders(await ordersRes.json())
      setCandies(await candiesRes.json())
      setCakes(await cakesRes.json())
      setSupplies(await suppliesRes.json())
      setMasses(await massesRes.json())
      setProducts(await productsRes.json())
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // CORREÇÃO: Função para fechar a calculadora
  const handleCloseCalculator = () => {
    console.log('🗑️ Fechando calculadora...')
    setIsCalculatorModalOpen(false)
  }

  const handleSave = async (orderData) => {
    try {
      let url = '/api/orders'
      let method = 'POST'
      let body = orderData

      if (editingOrder) {
        method = 'PUT'
        body = {
          ...orderData,
          id: editingOrder._id
        }
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar encomenda')
      }

      await loadData()
      setIsOrderModalOpen(false)
      setEditingOrder(null)
      alert(editingOrder ? 'Encomenda atualizada com sucesso!' : 'Encomenda criada com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar encomenda:', error)
      alert('Erro ao salvar encomenda: ' + error.message)
    }
  }

  const handleEdit = (order) => {
    setEditingOrder(order)
    setIsOrderModalOpen(true)
  }

  const handleDelete = async (orderId) => {
    if (confirm('Tem certeza que deseja excluir esta encomenda?')) {
      try {
        const response = await fetch('/api/orders', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: orderId })
        })

        if (!response.ok) {
          throw new Error('Erro ao excluir encomenda')
        }

        await loadData()
        alert('Encomenda excluída com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir encomenda:', error)
        alert('Erro ao excluir encomenda: ' + error.message)
      }
    }
  }

  const handleCalculate = (selectedItems) => {
    console.log('Itens selecionados para cálculo:', selectedItems)
    const totalItems = selectedItems.length
    const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0)

    alert(`✅ ${totalItems} tipos de itens selecionados\n📦 ${totalQuantity} unidades no total\n\nOs ingredientes foram calculados com sucesso!`)
  }

  return (
    <Layout activePage="orders">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8 flex-col sm:flex-row gap-4 sm:gap-0">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl md:text-4xl font-bold text-primary mb-2">Encomendas</h1>
          <p className="text-secondary text-sm md:text-base">Gerencie as encomendas de docinhos e bolos</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <GlassButton
            variant="secondary"
            onClick={() => setIsCalculatorModalOpen(true)}
            className="flex-1 sm:flex-none text-xs md:text-sm"
          >
            <FaCalculator className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm">Calculadora</span>
          </GlassButton>
          <GlassButton
            onClick={() => setIsOrderModalOpen(true)}
            className="flex-1 sm:flex-none text-xs md:text-sm"
          >
            <FaPlus className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm">Nova Encomenda</span>
          </GlassButton>
        </div>
      </div>

      {/* Content */}
      <GlassCard className="p-4 md:p-6">
        {loading ? (
          <div className="text-center py-8 md:py-12">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto mb-4">
              <i className="fas fa-spinner fa-spin text-xl md:text-2xl"></i>
            </div>
            <p className="text-white/60 text-sm md:text-base">Carregando encomendas...</p>
          </div>
        ) : (
          <OrderList
            orders={orders}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCalculate={() => setIsCalculatorModalOpen(true)}
          />
        )}
      </GlassCard>

      {/* Modals */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false)
          setEditingOrder(null)
        }}
        onSave={handleSave}
        order={editingOrder}
        candies={candies}
        cakes={cakes}
        supplies={supplies}
      />

      {/* CORREÇÃO: Passar a função correta para fechar */}
      <CalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={handleCloseCalculator} // Usar a função corrigida
        orders={orders}
        candies={candies}
        cakes={cakes}
        masses={masses}
        products={products}
        onCalculate={handleCalculate}
      />
    </Layout>
  )
}
