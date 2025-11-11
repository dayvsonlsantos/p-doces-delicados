// components/Supplies/SupplyList.js
import GlassButton from '../UI/GlassButton'
import { FaEdit, FaTrash, FaTag } from 'react-icons/fa'

export default function SupplyList({ supplies, onEdit, onDelete }) {
  if (supplies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500 mx-auto mb-4">
          <FaTag size={32} />
        </div>
        <h3 className="text-primary text-lg font-semibold mb-2">Nenhum insumo cadastrado</h3>
        <p className="text-secondary">Comece adicionando seus primeiros insumos</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {supplies.map((supply) => (
        <div key={supply._id} className="flex items-center justify-between p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white">
              <FaTag size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-primary text-lg">{supply.name}</h3>
              <p className="text-secondary text-sm">
                Custo: R$ {supply.cost?.toFixed(2)} /un
              </p>
              {supply.description && (
                <p className="text-white/60 text-sm mt-1">{supply.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <GlassButton
              variant="secondary"
              onClick={() => onEdit(supply)}
              className="px-3 py-2"
            >
              <FaEdit size={14} />
            </GlassButton>
            <GlassButton
              variant="danger"
              onClick={() => onDelete(supply._id)}
              className="px-3 py-2"
            >
              <FaTrash size={14} />
            </GlassButton>
          </div>
        </div>
      ))}
    </div>
  )
}