// components/FixedCosts/FixedCostsModal.js
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect } from 'react'
import { FaSave, FaTimes, FaInfoCircle, FaCalculator, FaDollarSign } from 'react-icons/fa'

export default function FixedCostsModal({ isOpen, onClose, onSave, fixedCost }) {
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    divisor: 1,
    workDays: 22,
    workHours: 8,
  })

  const [costPerMinute, setCostPerMinute] = useState(0)

  useEffect(() => {
    if (fixedCost) {
      setFormData({
        name: fixedCost.name || '',
        cost: fixedCost.cost || '',
        divisor: fixedCost.divisor || 1,
        workDays: fixedCost.workDays || 22,
        workHours: fixedCost.workHours || 8,
      })
    } else {
      setFormData({
        name: '',
        cost: '',
        divisor: 1,
        workDays: 22,
        workHours: 8,
      })
    }
  }, [fixedCost, isOpen])

  // Calcular custo por minuto em tempo real
  useEffect(() => {
    calculateCostPerMinute()
  }, [formData.cost, formData.divisor, formData.workDays, formData.workHours])

  const calculateCostPerMinute = () => {
    const cost = parseFloat(formData.cost) || 0
    const divisor = parseFloat(formData.divisor) || 1
    const workDays = parseFloat(formData.workDays) || 1
    const workHours = parseFloat(formData.workHours) || 1

    if (cost > 0 && divisor > 0 && workDays > 0 && workHours > 0) {
      const confeitariaCost = cost / divisor
      const costPerDay = confeitariaCost / workDays
      const costPerHour = costPerDay / workHours
      const costPerMin = costPerHour / 60

      setCostPerMinute(costPerMin)
    } else {
      setCostPerMinute(0)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.name || !formData.cost) {
      alert('Por favor, preencha o nome e o custo')
      return
    }

    const fixedCostData = {
      ...formData,
      cost: parseFloat(formData.cost),
      divisor: parseFloat(formData.divisor),
      workDays: parseFloat(formData.workDays),
      workHours: parseFloat(formData.workHours),
      costPerMinute: costPerMinute
    }

    onSave(fixedCostData)
  }

  const [showDivisorInfo, setShowDivisorInfo] = useState(false)

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fixedCost ? 'Editar Custo Fixo' : 'Novo Custo Fixo'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <Input
          label="Nome da Despesa"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Gás, Energia, Água, Aluguel..."
          required
        />

        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Custo Total (R$)"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              placeholder="0.00"
              required
            />
            <Input
              label={
                <div className="flex items-center gap-2">
                  <span>Divisor</span>
                  <button
                    type="button"
                    onClick={() => setShowDivisorInfo(true)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <FaInfoCircle className="w-4 h-4" />
                  </button>
                </div>
              }
              type="number"
              step="1"
              min="1"
              value={formData.divisor}
              onChange={(e) => setFormData({ ...formData, divisor: e.target.value })}
              placeholder="1"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Dias de Trabalho/Mês"
            type="number"
            step="1"
            min="1"
            max="31"
            value={formData.workDays}
            onChange={(e) => setFormData({ ...formData, workDays: e.target.value })}
            placeholder="22"
            required
          />

          <Input
            label="Horas de Trabalho/Dia"
            type="number"
            step="1"
            min="1"
            max="24"
            value={formData.workHours}
            onChange={(e) => setFormData({ ...formData, workHours: e.target.value })}
            placeholder="8"
            required
          />
        </div>

        {/* Cálculos em tempo real */}
        {costPerMinute > 0 && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
            <h4 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
              <FaCalculator className="w-4 h-4" />
              Cálculo do Custo
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/80">Custo para a Confeitaria:</span>
                <span className="text-green-400 font-semibold">
                  R$ {(parseFloat(formData.cost) / parseFloat(formData.divisor)).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-white/80">Custo por Dia:</span>
                <span className="text-blue-400">
                  R$ {((parseFloat(formData.cost) / parseFloat(formData.divisor)) / parseFloat(formData.workDays)).toFixed(4)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-white/80">Custo por Hora:</span>
                <span className="text-purple-400">
                  R$ {((parseFloat(formData.cost) / parseFloat(formData.divisor)) / parseFloat(formData.workDays) / parseFloat(formData.workHours)).toFixed(6)}
                </span>
              </div>

              <div className="flex justify-between border-t border-white/20 pt-2">
                <span className="text-white font-semibold">Custo por Minuto:</span>
                <span className="text-green-400 font-bold">
                  R$ {costPerMinute.toFixed(8)}
                </span>
              </div>

              {formData.preparationTime > 0 && (
                <div className="flex justify-between border-t border-white/20 pt-2">
                  <span className="text-white/80">Custo do Tempo de Preparo:</span>
                  <span className="text-orange-400 font-semibold">
                    R$ {(costPerMinute * parseFloat(formData.preparationTime)).toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informações sobre o divisor */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
          <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
            <FaDollarSign className="w-4 h-4" />
            Sobre o Divisor
          </h4>
          <p className="text-blue-200 text-sm">
            Use o divisor quando o custo não é 100% da confeitaria. Exemplo: se divide o aluguel com outra pessoa, use divisor 2.
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
          <GlassButton type="button" variant="secondary" onClick={onClose}>
            <FaTimes />
            Cancelar
          </GlassButton>
          <GlassButton type="submit">
            <FaSave />
            {fixedCost ? 'Atualizar' : 'Salvar'}
          </GlassButton>
        </div>
      </form>

      {/* Modal de informações do divisor */}
      {showDivisorInfo && (
        <Modal
          isOpen={showDivisorInfo}
          onClose={() => setShowDivisorInfo(false)}
          title="Como usar o Divisor"
          size="sm"
        >
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h5 className="text-blue-300 font-semibold mb-2">1 - UTILIZE QUANDO O NEGÓCIO CONSOME 100% DAS DESPESAS DO LOCAL</h5>
                <p className="text-blue-200 text-sm">
                  Divisor = 1 (Ex: aluguel de uma loja exclusiva para a confeitaria)
                </p>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <h5 className="text-green-300 font-semibold mb-2">2 - UTILIZE QUANDO VOCÊ DEDICA 50% DO SEU TEMPO PARA O NEGÓCIO</h5>
                <p className="text-green-200 text-sm">
                  Divisor = 2 (Ex: trabalha meio período na confeitaria e meio em outro emprego)
                </p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <h5 className="text-purple-300 font-semibold mb-2">3 - UTILIZE QUANDO VOCÊ UTILIZA 8 HORAS DE PRODUÇÃO DIÁRIAS NO SEU NEGÓCIO</h5>
                <p className="text-purple-200 text-sm">
                  Ou seja, das 24 horas do dia podemos ponderar conforme sua dedicação
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <GlassButton onClick={() => setShowDivisorInfo(false)}>
                Entendi
              </GlassButton>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  )
}