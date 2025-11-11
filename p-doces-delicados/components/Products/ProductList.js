// components/Products/ProductList.js (atualizado)
import GlassButton from '../UI/GlassButton'
import { FaEdit, FaTrash, FaBox, FaInfoCircle, FaExchangeAlt } from 'react-icons/fa'

export default function ProductList({ products, onEdit, onDelete }) {
  const getUnitDisplay = (product) => {
    switch (product.unit) {
      case 'g': return `${product.quantity}g`;
      case 'kg': return `${product.quantity}kg`;
      case 'ml': return `${product.quantity}ml`;
      case 'l': return `${product.quantity}L`;
      case 'un': return `${product.quantity} un`;
      default: return product.quantity;
    }
  }

  const getBaseCostInfo = (product) => {
    if (product.unit === 'un') {
      return `R$ ${product.unitCost?.toFixed(4)}/un`
    }
    return `R$ ${product.baseUnitCost?.toFixed(6)}/${product.unit === 'kg' || product.unit === 'g' ? 'g' : 'ml'}`
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 mx-auto mb-4">
          <FaBox size={24} className="md:w-8 md:h-8" />
        </div>
        <h3 className="text-primary text-base md:text-lg font-semibold mb-2">Nenhum produto cadastrado</h3>
        <p className="text-secondary text-sm md:text-base">Comece adicionando suas primeiras matérias-primas</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {products.map((product) => (
        <div key={product._id} className="p-4 md:p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-start justify-between flex-col md:flex-row gap-4">
            <div className="flex items-start gap-3 md:gap-4 flex-1 w-full">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                <FaBox size={16} className="md:w-5 md:h-5" />
              </div>
              
              <div className="flex-1 min-w-0"> {/* min-w-0 para truncate funcionar */}
                <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                  <h3 className="font-semibold text-primary text-base md:text-lg truncate">
                    {product.name}
                  </h3>
                  <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-secondary capitalize flex-shrink-0">
                    {product.unit}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-sm">
                  <div className="min-w-0">
                    <p className="text-secondary text-xs md:text-sm">Embalagem:</p>
                    <p className="text-primary font-semibold text-sm md:text-base truncate">
                      {getUnitDisplay(product)}
                    </p>
                  </div>
                  
                  <div className="min-w-0">
                    <p className="text-secondary text-xs md:text-sm">Custo total:</p>
                    <p className="text-primary font-semibold text-sm md:text-base">
                      R$ {product.cost?.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="min-w-0">
                    <p className="text-secondary text-xs md:text-sm">Custo unitário:</p>
                    <p className="text-green-400 font-semibold text-xs md:text-sm">
                      R$ {product.unitCost?.toFixed(4)}/{product.unit}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-secondary text-xs md:text-sm flex items-center gap-1">
                      <FaExchangeAlt size={10} />
                      Custo base:
                    </p>
                    <p className="text-blue-400 font-semibold text-xs truncate">
                      {getBaseCostInfo(product)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <GlassButton
                variant="secondary"
                onClick={() => onEdit(product)}
                className="px-3 py-2 text-xs md:text-sm"
              >
                <FaEdit size={12} className="md:w-3 md:h-3" />
              </GlassButton>
              <GlassButton
                variant="danger"
                onClick={() => onDelete(product._id)}
                className="px-3 py-2 text-xs md:text-sm"
              >
                <FaTrash size={12} className="md:w-3 md:h-3" />
              </GlassButton>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}