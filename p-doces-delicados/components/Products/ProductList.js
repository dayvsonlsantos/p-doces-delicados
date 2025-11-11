// components/Products/ProductList.js
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
      <div className="text-center py-12">
        <div className="w-24 h-24 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 mx-auto mb-4">
          <FaBox size={32} />
        </div>
        <h3 className="text-primary text-lg font-semibold mb-2">Nenhum produto cadastrado</h3>
        <p className="text-secondary">Comece adicionando suas primeiras matérias-primas</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product._id} className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white">
                <FaBox size={18} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-primary text-lg">{product.name}</h3>
                  <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-secondary capitalize">
                    {product.unit}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-secondary">Embalagem:</p>
                    <p className="text-primary font-semibold">{getUnitDisplay(product)}</p>
                  </div>
                  
                  <div>
                    <p className="text-secondary">Custo total:</p>
                    <p className="text-primary font-semibold">R$ {product.cost?.toFixed(2)}</p>
                  </div>
                  
                  <div>
                    <p className="text-secondary">Custo unitário:</p>
                    <p className="text-green-400 font-semibold">
                      R$ {product.unitCost?.toFixed(4)}/{product.unit}
                    </p>
                  </div>

                  <div>
                    <p className="text-secondary flex items-center gap-1">
                      <FaExchangeAlt size={10} />
                      Custo base:
                    </p>
                    <p className="text-blue-400 font-semibold text-xs">
                      {getBaseCostInfo(product)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <GlassButton
                variant="secondary"
                onClick={() => onEdit(product)}
                className="px-3 py-2"
              >
                <FaEdit size={14} />
              </GlassButton>
              <GlassButton
                variant="danger"
                onClick={() => onDelete(product._id)}
                className="px-3 py-2"
              >
                <FaTrash size={14} />
              </GlassButton>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}