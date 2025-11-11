import GlassButton from '../UI/GlassButton'
import { FaEdit, FaTrash, FaTag } from 'react-icons/fa'

export default function SupplyList({ supplies, onEdit, onDelete }) {
  if (supplies.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500 mx-auto mb-4">
          <FaTag className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <h3 className="text-primary text-base md:text-lg font-semibold mb-2">Nenhum insumo cadastrado</h3>
        <p className="text-secondary text-sm md:text-base">Comece adicionando seus primeiros insumos</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {supplies.map((supply) => (
        <div key={supply._id} className="flex items-center justify-between p-4 md:p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors flex-col sm:flex-row gap-4 sm:gap-0">
          <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white flex-shrink-0">
              <FaTag className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-primary text-base md:text-lg mb-1 truncate">
                {supply.name}
              </h3>
              <p className="text-secondary text-xs md:text-sm">
                Custo: R$ {supply.cost?.toFixed(2)} /un
              </p>
              {supply.description && (
                <p className="text-white/60 text-xs md:text-sm mt-1 line-clamp-2">
                  {supply.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <GlassButton
              variant="secondary"
              onClick={() => onEdit(supply)}
              className="px-3 py-2 text-xs md:text-sm"
            >
              <FaEdit className="w-3 h-3" />
            </GlassButton>
            <GlassButton
              variant="danger"
              onClick={() => onDelete(supply._id)}
              className="px-3 py-2 text-xs md:text-sm"
            >
              <FaTrash className="w-3 h-3" />
            </GlassButton>
          </div>
        </div>
      ))}
    </div>
  )
}