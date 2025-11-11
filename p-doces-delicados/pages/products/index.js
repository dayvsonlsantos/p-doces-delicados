// pages/products/index.js (atualizado)
import Layout from '../../components/Layout/Layout'
import GlassCard from '../../components/UI/GlassCard'
import GlassButton from '../../components/UI/GlassButton'
import ProductModal from '../../components/Products/ProductModal'
import ProductList from '../../components/Products/ProductList'
import { useState, useEffect } from 'react'
import { FaPlus, FaBox } from 'react-icons/fa'

export default function Products() {
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (productData) => {
    try {
      const url = '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'
      const body = editingProduct ? { ...productData, id: editingProduct._id } : productData

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      await loadProducts()
      setIsModalOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
    }
  }

  const handleNewProduct = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (productId) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await fetch('/api/products', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: productId })
        })
        await loadProducts()
      } catch (error) {
        console.error('Erro ao excluir produto:', error)
      }
    }
  }

  return (
    <Layout activePage="products">
      <div className="flex items-center justify-between mb-6 md:mb-8 flex-col sm:flex-row gap-4 sm:gap-0">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl md:text-4xl font-bold text-primary mb-2">Produtos</h1>
          <p className="text-secondary text-sm md:text-base">Cadastre as matérias-primas usadas nas receitas</p>
        </div>
        <GlassButton onClick={handleNewProduct} className="w-full sm:w-auto">
          <FaPlus className="w-4 h-4" />
          <span className="text-sm md:text-base">Novo Produto</span>
        </GlassButton>
      </div>

      <GlassCard className="p-4 md:p-6">
        {loading ? (
          <div className="text-center py-8 md:py-12">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 mx-auto mb-4">
              <FaBox className="animate-spin w-6 h-6 md:w-8 md:h-8" />
            </div>
            <p className="text-secondary text-sm md:text-base">Carregando produtos...</p>
          </div>
        ) : (
          <ProductList
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </GlassCard>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        product={editingProduct}
      />
    </Layout>
  )
}