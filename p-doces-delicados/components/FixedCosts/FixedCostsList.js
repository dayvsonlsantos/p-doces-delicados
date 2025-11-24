// components/FixedCosts/FixedCostsList.js
import GlassButton from '../UI/GlassButton'
import { FaEdit, FaTrash, FaDollarSign, FaClock, FaInfoCircle } from 'react-icons/fa'

export default function FixedCostsList({ fixedCosts, onEdit, onDelete }) {
  if (fixedCosts.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-500 mx-auto mb-4">
          <FaDollarSign className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <h3 className="text-white text-base md:text-lg font-semibold mb-2">Nenhum custo fixo cadastrado</h3>
        <p className="text-white/60 text-sm md:text-base">Comece adicionando seus custos fixos mensais</p>
      </div>
    )
  }

  // Calcular totais
  const totalCost = fixedCosts.reduce((sum, cost) => sum + (parseFloat(cost.cost) || 0), 0)
  const totalConfeitariaCost = fixedCosts.reduce((sum, cost) => sum + (parseFloat(cost.cost) || 0) / (parseFloat(cost.divisor) || 1), 0)
  const totalCostPerMinute = fixedCosts.reduce((sum, cost) => sum + (parseFloat(cost.costPerMinute) || 0), 0)

  return (
    <div className="space-y-4">
      {/* Resumo dos custos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-2xl p-4 text-center">
          <div className="text-yellow-400 font-bold text-lg">R$ {totalCost.toFixed(2)}</div>
          <div className="text-white/60 text-sm">Custo Total</div>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 text-center">
          <div className="text-green-400 font-bold text-lg">R$ {totalConfeitariaCost.toFixed(2)}</div>
          <div className="text-white/60 text-sm">Para Confeitaria</div>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 text-center">
          <div className="text-blue-400 font-bold text-lg">R$ {totalCostPerMinute.toFixed(8)}</div>
          <div className="text-white/60 text-sm">Custo por Minuto</div>
        </div>
      </div>

      {/* Lista de custos */}
      <div className="space-y-3">
        {fixedCosts.map((cost) => {
          const confeitariaCost = (parseFloat(cost.cost) || 0) / (parseFloat(cost.divisor) || 1)
          const preparationCost = (parseFloat(cost.costPerMinute) || 0) * (parseFloat(cost.preparationTime) || 0)

          return (
            <div key={cost._id} className="p-4 md:p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                <div className="flex items-start gap-3 md:gap-4 flex-1 w-full">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-yellow-500 flex items-center justify-center text-white flex-shrink-0">
                    <FaDollarSign className="w-4 h-4 md:w-5 md:h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-white text-base md:text-lg truncate">
                        {cost.name}
                      </h3>
                      {cost.divisor > 1 && (
                        <span className="px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300 flex items-center gap-1">
                          <FaInfoCircle className="w-3 h-3" />
                          Divisor: {cost.divisor}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-sm">
                      <div className="min-w-0">
                        <p className="text-secondary text-xs md:text-sm">Custo Total:</p>
                        <p className="text-white font-semibold text-sm md:text-base">
                          R$ {parseFloat(cost.cost).toFixed(2)}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-secondary text-xs md:text-sm">Custo Confeitaria:</p>
                        <p className="text-green-400 font-semibold text-sm md:text-base">
                          R$ {confeitariaCost.toFixed(2)}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-secondary text-xs md:text-sm flex items-center gap-1">
                          <FaClock size={10} />
                          Custo por Minuto:
                        </p>
                        <p className="text-blue-400 font-semibold text-xs truncate">
                          R$ {parseFloat(cost.costPerMinute).toFixed(8)}
                        </p>
                      </div>
                    </div>

                    {/* Custo do tempo de preparo */}
                    {cost.preparationTime > 0 && (
                      <div className="mt-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <div className="flex justify-between items-center">
                          <span className="text-white/80 text-sm">Custo do Tempo de Preparo:</span>
                          <span className="text-orange-400 font-bold">
                            R$ {preparationCost.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <GlassButton
                    variant="secondary"
                    onClick={() => onEdit(cost)}
                    className="px-3 py-2 text-xs md:text-sm"
                  >
                    <FaEdit className="w-3 h-3" />
                  </GlassButton>
                  <GlassButton
                    variant="danger"
                    onClick={() => onDelete(cost._id)}
                    className="px-3 py-2 text-xs md:text-sm"
                  >
                    <FaTrash className="w-3 h-3" />
                  </GlassButton>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}