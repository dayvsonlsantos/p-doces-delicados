import Modal from '../UI/Modal'
import Input from '../UI/Input'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect } from 'react'
import { FaSave, FaTimes, FaPlus, FaTrash, FaCalculator } from 'react-icons/fa'

export default function CakeModal({ 
  isOpen, 
  onClose, 
  onSave, 
  cake, 
  cakeMasses, 
  cakeFrostings, 
  products, 
  supplies 
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    masses: [{ massName: '', grams: '' }],
    frostings: [{ frostingName: '', grams: '' }],
    supplies: [],
    profitMargin: 50,
    salePrice: ''
  })

  const [profitInputType, setProfitInputType] = useState('percentage')

  useEffect(() => {
    if (cake) {
      setFormData({
        name: cake.name || '',
        description: cake.description || '',
        masses: cake.masses || [{ massName: '', grams: '' }],
        frostings: cake.frostings || [{ frostingName: '', grams: '' }],
        supplies: cake.supplies || [],
        profitMargin: cake.profitMargin || 50,
        salePrice: cake.salePrice || ''
      })
    } else {
      setFormData({
        name: '',
        description: '',
        masses: [{ massName: '', grams: '' }],
        frostings: [{ frostingName: '', grams: '' }],
        supplies: [],
        profitMargin: 50,
        salePrice: ''
      })
    }
  }, [cake, isOpen])

  // Função para calcular custo do bolo
  const calculateCakeCost = (cakeData) => {
    let totalCost = 0
    const costBreakdown = {
      massCost: 0,
      frostingCost: 0,
      suppliesCost: 0,
      totalCost: 0
    }

    // Custo das massas
    if (cakeData.masses) {
      cakeData.masses.forEach(massItem => {
        const mass = cakeMasses.find(m => m.name === massItem.massName)
        if (mass && massItem.grams) {
          const massCostPerGram = (mass.cost || 0) / mass.totalGrams
          const massCost = massCostPerGram * parseFloat(massItem.grams)
          costBreakdown.massCost += massCost
          totalCost += massCost
        }
      })
    }

    // Custo das coberturas
    if (cakeData.frostings) {
      cakeData.frostings.forEach(frostingItem => {
        const frosting = cakeFrostings.find(f => f.name === frostingItem.frostingName)
        if (frosting && frostingItem.grams) {
          const frostingCostPerGram = (frosting.cost || 0) / frosting.totalGrams
          const frostingCost = frostingCostPerGram * parseFloat(frostingItem.grams)
          costBreakdown.frostingCost += frostingCost
          totalCost += frostingCost
        }
      })
    }

    // Custo dos insumos
    let suppliesCost = 0
    if (cakeData.supplies && cakeData.supplies.length > 0) {
      cakeData.supplies.forEach(supplyId => {
        const supply = supplies.find(s => s._id === supplyId)
        if (supply) {
          suppliesCost += supply.cost
        }
      })
    }
    costBreakdown.suppliesCost = suppliesCost
    totalCost += suppliesCost

    costBreakdown.totalCost = totalCost
    return costBreakdown
  }

  // Calcular preço de venda baseado no custo e margem
  const calculateSalePrice = (cost, profitMargin) => {
    return cost * (1 + profitMargin / 100)
  }

  // Calcular margem baseada no custo e preço de venda
  const calculateProfitMargin = (cost, salePrice) => {
    return ((salePrice - cost) / cost) * 100
  }

  // Atualizar cálculos quando dados mudarem
  useEffect(() => {
    const costBreakdown = calculateCakeCost(formData)
    const totalCost = costBreakdown.totalCost

    if (profitInputType === 'percentage' && formData.profitMargin) {
      const salePrice = calculateSalePrice(totalCost, parseFloat(formData.profitMargin))
      setFormData(prev => ({
        ...prev,
        salePrice: salePrice.toFixed(2)
      }))
    } else if (profitInputType === 'price' && formData.salePrice) {
      const margin = calculateProfitMargin(totalCost, parseFloat(formData.salePrice))
      setFormData(prev => ({
        ...prev,
        profitMargin: margin.toFixed(1)
      }))
    }
  }, [formData.masses, formData.frostings, formData.supplies, formData.profitMargin, formData.salePrice, profitInputType])

  // Funções para gerenciar massas
  const addMass = () => {
    setFormData({
      ...formData,
      masses: [...formData.masses, { massName: '', grams: '' }]
    })
  }

  const removeMass = (index) => {
    if (formData.masses.length > 1) {
      const newMasses = formData.masses.filter((_, i) => i !== index)
      setFormData({ ...formData, masses: newMasses })
    }
  }

  const updateMass = (index, field, value) => {
    const newMasses = [...formData.masses]
    newMasses[index][field] = value
    setFormData({ ...formData, masses: newMasses })
  }

  // Funções para gerenciar coberturas
  const addFrosting = () => {
    setFormData({
      ...formData,
      frostings: [...formData.frostings, { frostingName: '', grams: '' }]
    })
  }

  const removeFrosting = (index) => {
    if (formData.frostings.length > 1) {
      const newFrostings = formData.frostings.filter((_, i) => i !== index)
      setFormData({ ...formData, frostings: newFrostings })
    }
  }

  const updateFrosting = (index, field, value) => {
    const newFrostings = [...formData.frostings]
    newFrostings[index][field] = value
    setFormData({ ...formData, frostings: newFrostings })
  }

  // Funções para insumos
  const addSupply = () => {
    setFormData({
      ...formData,
      supplies: [...formData.supplies, '']
    })
  }

  const removeSupply = (index) => {
    const newSupplies = formData.supplies.filter((_, i) => i !== index)
    setFormData({ ...formData, supplies: newSupplies })
  }

  const updateSupply = (index, value) => {
    const newSupplies = [...formData.supplies]
    newSupplies[index] = value
    setFormData({ ...formData, supplies: newSupplies })
  }

  // Funções para margem de lucro
  const handleProfitMarginChange = (value) => {
    setProfitInputType('percentage')
    setFormData({ ...formData, profitMargin: value })
  }

  const handleSalePriceChange = (value) => {
    setProfitInputType('price')
    setFormData({ ...formData, salePrice: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validar se há pelo menos uma massa e uma cobertura
    const validMasses = formData.masses.filter(mass => mass.massName && mass.grams)
    const validFrostings = formData.frostings.filter(frosting => frosting.frostingName && frosting.grams)
    
    if (validMasses.length === 0) {
      alert('Por favor, adicione pelo menos uma massa ao bolo')
      return
    }

    if (validFrostings.length === 0) {
      alert('Por favor, adicione pelo menos uma cobertura ao bolo')
      return
    }

    const cakeData = {
      ...formData,
      profitMargin: parseFloat(formData.profitMargin) || 50,
      salePrice: parseFloat(formData.salePrice) || 0,
      masses: validMasses.map(mass => ({
        ...mass,
        grams: parseFloat(mass.grams)
      })),
      frostings: validFrostings.map(frosting => ({
        ...frosting,
        grams: parseFloat(frosting.grams)
      })),
      supplies: formData.supplies.filter(supplyId => supplyId)
    }

    onSave(cakeData)
  }

  const costBreakdown = calculateCakeCost(formData)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={cake ? 'Editar Bolo' : 'Novo Bolo'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <Input
          label="Nome do Bolo"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Bolo de Chocolate Premium"
          required
        />

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Descrição (opcional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição do bolo, características especiais..."
            rows="3"
            className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
          />
        </div>

        {/* Seção de Massas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="block text-sm font-medium text-white/80">
                Massas do Bolo
              </label>
              <p className="text-white/60 text-xs">Adicione uma ou mais massas com suas quantidades em gramas</p>
            </div>
            <GlassButton
              type="button"
              variant="secondary"
              onClick={addMass}
              className="px-3 py-1 text-sm"
            >
              <FaPlus />
              Adicionar Massa
            </GlassButton>
          </div>

          <div className="space-y-3">
            {formData.masses.map((mass, index) => (
              <div key={index} className="flex gap-3 items-start p-4 rounded-2xl bg-white/5">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Massa</label>
                    <select
                      value={mass.massName}
                      onChange={(e) => updateMass(index, 'massName', e.target.value)}
                      className="glass-input w-full"
                      required
                    >
                      <option value="">Selecione a massa</option>
                      {cakeMasses.map(massItem => (
                        <option key={massItem.name} value={massItem.name}>
                          {massItem.name} ({massItem.totalGrams}g total)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-white/60 mb-1">Gramas no Bolo</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={mass.grams}
                      onChange={(e) => updateMass(index, 'grams', e.target.value)}
                      className="glass-input w-full"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeMass(index)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-400 transition-colors duration-200"
                  disabled={formData.masses.length === 1}
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Coberturas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="block text-sm font-medium text-white/80">
                Coberturas do Bolo
              </label>
              <p className="text-white/60 text-xs">Adicione uma ou mais coberturas com suas quantidades em gramas</p>
            </div>
            <GlassButton
              type="button"
              variant="secondary"
              onClick={addFrosting}
              className="px-3 py-1 text-sm"
            >
              <FaPlus />
              Adicionar Cobertura
            </GlassButton>
          </div>

          <div className="space-y-3">
            {formData.frostings.map((frosting, index) => (
              <div key={index} className="flex gap-3 items-start p-4 rounded-2xl bg-white/5">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Cobertura</label>
                    <select
                      value={frosting.frostingName}
                      onChange={(e) => updateFrosting(index, 'frostingName', e.target.value)}
                      className="glass-input w-full"
                      required
                    >
                      <option value="">Selecione a cobertura</option>
                      {cakeFrostings.map(frostingItem => (
                        <option key={frostingItem.name} value={frostingItem.name}>
                          {frostingItem.name} ({frostingItem.totalGrams}g total)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-white/60 mb-1">Gramas no Bolo</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={frosting.grams}
                      onChange={(e) => updateFrosting(index, 'grams', e.target.value)}
                      className="glass-input w-full"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFrosting(index)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-400 transition-colors duration-200"
                  disabled={formData.frostings.length === 1}
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Insumos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="block text-sm font-medium text-white/80">
                Insumos (opcional)
              </label>
              <p className="text-white/60 text-xs">Formas, velas, decorações, etc. (1 por bolo)</p>
            </div>
            <GlassButton
              type="button"
              variant="secondary"
              onClick={addSupply}
              className="px-3 py-1 text-sm"
            >
              <FaPlus />
              Adicionar Insumo
            </GlassButton>
          </div>

          <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
            {formData.supplies.map((supplyId, index) => (
              <div key={index} className="flex gap-3 items-start p-3 rounded-2xl bg-white/5">
                <div className="flex-1">
                  <select
                    value={supplyId}
                    onChange={(e) => updateSupply(index, e.target.value)}
                    className="glass-input w-full"
                  >
                    <option value="">Selecione o insumo</option>
                    {supplies.map(supply => (
                      <option key={supply._id} value={supply._id}>
                        {supply.name} - R$ {supply.cost?.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => removeSupply(index)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-400 transition-colors duration-200"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Margem de Lucro */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
          <h4 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
            <FaCalculator />
            Preço de Venda
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Margem de Lucro (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1000"
                value={formData.profitMargin}
                onChange={(e) => handleProfitMarginChange(e.target.value)}
                className="glass-input w-full"
                placeholder="50"
              />
              <p className="text-white/60 text-xs mt-1">
                {formData.salePrice && `Preço: R$ ${formData.salePrice}`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Preço de Venda (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.salePrice}
                onChange={(e) => handleSalePriceChange(e.target.value)}
                className="glass-input w-full"
                placeholder="0.00"
              />
              <p className="text-white/60 text-xs mt-1">
                {formData.profitMargin && `Margem: ${formData.profitMargin}%`}
              </p>
            </div>
          </div>
        </div>

        {/* Visualização do Custo em Tempo Real */}
        {(formData.masses.some(mass => mass.massName && mass.grams) || formData.frostings.some(frosting => frosting.frostingName && frosting.grams)) && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
            <h4 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
              <FaCalculator />
              Resumo Financeiro por Bolo
            </h4>

            <div className="space-y-3 text-sm">
              {costBreakdown.massCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/80">Custo massas:</span>
                  <span className="text-blue-400">R$ {costBreakdown.massCost.toFixed(2)}</span>
                </div>
              )}
              
              {costBreakdown.frostingCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/80">Custo coberturas:</span>
                  <span className="text-pink-400">R$ {costBreakdown.frostingCost.toFixed(2)}</span>
                </div>
              )}
              
              {costBreakdown.suppliesCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/80">Custo insumos:</span>
                  <span className="text-purple-400">R$ {costBreakdown.suppliesCost.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between border-t border-white/20 pt-2">
                <span className="text-white font-semibold">Custo total:</span>
                <span className="text-white font-bold">R$ {costBreakdown.totalCost.toFixed(2)}</span>
              </div>

              {formData.salePrice && (
                <>
                  <div className="flex justify-between">
                    <span className="text-white/80">Preço de venda:</span>
                    <span className="text-green-400 font-bold">R$ {parseFloat(formData.salePrice).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Lucro por bolo:</span>
                    <span className="text-green-400 font-semibold">
                      R$ {(parseFloat(formData.salePrice) - costBreakdown.totalCost).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Margem de lucro:</span>
                    <span className="text-green-400 font-semibold">{formData.profitMargin}%</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
          <GlassButton type="button" variant="secondary" onClick={onClose}>
            <FaTimes />
            Cancelar
          </GlassButton>
          <GlassButton type="submit">
            <FaSave />
            {cake ? 'Atualizar' : 'Salvar'}
          </GlassButton>
        </div>
      </form>
    </Modal>
  )
}