// components/Cakes/CakeModal.js (corrigido)
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect } from 'react'
import { FaTrash, FaSave, FaTimes, FaPlus, FaCalculator, FaChartLine } from 'react-icons/fa'

export default function CakeModal({ isOpen, onClose, onSave, cake, cakeMasses, cakeFrostings, products, supplies }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    masses: [{ massName: '', grams: '' }],
    frostings: [{ frostingName: '', grams: '' }],
    supplies: [],
    profitMargin: 50,
    salePrice: ''
  })

  const [suppliesList, setSuppliesList] = useState([])
  const [loading, setLoading] = useState(false)
  const [profitInputType, setProfitInputType] = useState('percentage')

  // Carregar insumos quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadSupplies()
    }
  }, [isOpen])

  const loadSupplies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/supplies')
      const data = await response.json()
      setSuppliesList(data)
    } catch (error) {
      console.error('Erro ao carregar insumos:', error)
    } finally {
      setLoading(false)
    }
  }

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

  // CORREÇÃO: Usar a mesma lógica de cálculo que está na página de massas
  const calculateMassCost = (mass) => {
    let totalCost = 0
    mass.ingredients?.forEach(ingredient => {
      const product = products.find(p => p._id === ingredient.productId)
      if (product && ingredient.grams) {
        const ingredientGrams = parseFloat(ingredient.grams)
        let cost = 0

        // CORREÇÃO: Usar a mesma lógica
        if (product.unit === 'un') {
          const unitWeight = 50 // padrão 50g por unidade
          const units = ingredientGrams / unitWeight
          cost = units * product.unitCost
        } else {
          cost = ingredientGrams * product.baseUnitCost
        }

        totalCost += cost
      }
    })
    return totalCost
  }

  // Função para calcular custo do bolo - CORRIGIDA
  const calculateCakeCost = (cakeData) => {
    let totalCost = 0
    const costBreakdown = {
      massCost: 0,
      frostingCost: 0,
      suppliesCost: 0,
      totalCost: 0,
      totalGrams: 0,
      massDetails: [],
      frostingDetails: []
    }

    // 1. CUSTO DAS MASSAS - CORREÇÃO: Buscar o custo calculado da massa
    cakeData.masses.forEach(massItem => {
      if (massItem.massName && massItem.grams) {
        const mass = cakeMasses.find(m => m.name === massItem.massName)
        if (mass) {
          // CORREÇÃO: Buscar o custo total da massa ou calcular na hora
          const massTotalCost = mass.cost || calculateMassCost(mass)
          const massCostPerGram = massTotalCost / mass.totalGrams
          const massGrams = parseFloat(massItem.grams)
          const massCost = massCostPerGram * massGrams

          totalCost += massCost
          costBreakdown.totalGrams += massGrams
          costBreakdown.massDetails.push({
            massName: massItem.massName,
            grams: massGrams,
            cost: massCost,
            costPerGram: massCostPerGram,
            massTotalCost: massTotalCost,
            massTotalGrams: mass.totalGrams
          })
        }
      }
    })
    costBreakdown.massCost = costBreakdown.massDetails.reduce((sum, m) => sum + m.cost, 0)

    // 2. CUSTO DAS COBERTURAS - CORREÇÃO: Mesma lógica para coberturas
    cakeData.frostings.forEach(frostingItem => {
      if (frostingItem.frostingName && frostingItem.grams) {
        const frosting = cakeFrostings.find(f => f.name === frostingItem.frostingName)
        if (frosting) {
          const frostingTotalCost = frosting.cost || calculateMassCost(frosting)
          const frostingCostPerGram = frostingTotalCost / frosting.totalGrams
          const frostingGrams = parseFloat(frostingItem.grams)
          const frostingCost = frostingCostPerGram * frostingGrams

          totalCost += frostingCost
          costBreakdown.totalGrams += frostingGrams
          costBreakdown.frostingDetails.push({
            frostingName: frostingItem.frostingName,
            grams: frostingGrams,
            cost: frostingCost,
            costPerGram: frostingCostPerGram,
            frostingTotalCost: frostingTotalCost,
            frostingTotalGrams: frosting.totalGrams
          })
        }
      }
    })
    costBreakdown.frostingCost = costBreakdown.frostingDetails.reduce((sum, f) => sum + f.cost, 0)

    // 3. CUSTO DOS INSUMOS
    let suppliesCost = 0
    if (cakeData.supplies && cakeData.supplies.length > 0) {
      cakeData.supplies.forEach(supplyId => {
        const supply = suppliesList.find(s => s._id === supplyId)
        if (supply) {
          suppliesCost += supply.cost
        }
      })
    }
    costBreakdown.suppliesCost = suppliesCost

    costBreakdown.totalCost = totalCost + suppliesCost
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

  // ... (restante das funções addMass, removeMass, updateMass, etc. permanecem iguais)
  // Funções para gerenciar múltiplas massas
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

  // Funções para coberturas
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

    const validMasses = formData.masses.filter(mass => mass.massName && mass.grams)
    if (validMasses.length === 0) {
      alert('Por favor, adicione pelo menos uma massa ao bolo')
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
      frostings: formData.frostings
        .filter(frosting => frosting.frostingName && frosting.grams)
        .map(frosting => ({
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
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Header fixo */}
        <div className="flex-shrink-0 p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white text-center">
            {cake ? 'Editar Bolo' : 'Novo Bolo'}
          </h2>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
            <h4 className="text-orange-300 font-semibold mb-2 flex items-center gap-2">
              <FaChartLine className="w-4 h-4" />
              Sobre Bolos
            </h4>
            <p className="text-orange-200 text-sm">
              Crie bolos combinando massas, coberturas e insumos. O sistema calcula automaticamente custos e preços.
            </p>
          </div>

          <Input
            label="Nome do Bolo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Bolo de Chocolate, Bolo de Festa..."
            required
          />

          <Input
            label="Descrição (opcional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ex: Bolo de chocolate com recheio de brigadeiro..."
          />

          {/* Seção de Massas */}
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">Massas do Bolo</h3>
                <p className="text-white/60 text-sm">Adicione uma ou mais massas com suas quantidades</p>
              </div>
              <button
                type="button"
                onClick={addMass}
                className="w-10 h-10 rounded-xl bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 flex items-center justify-center transition-colors"
              >
                <FaPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {formData.masses.map((mass, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium text-sm">
                      Massa {index + 1}
                    </span>
                    {formData.masses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMass(index)}
                        className="w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 flex items-center justify-center transition-colors"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/60 text-xs mb-2">Massa</label>
                      <select
                        value={mass.massName}
                        onChange={(e) => updateMass(index, 'massName', e.target.value)}
                        className="w-full glass-input h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        required
                        style={{ 
                          WebkitAppearance: 'none',
                          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 1rem center',
                          backgroundSize: '1em'
                        }}
                      >
                        <option value="">Selecione a massa</option>
                        {cakeMasses && cakeMasses.map && cakeMasses.map(massItem => (
                          <option key={massItem.name} value={massItem.name}>
                            {massItem.name} ({massItem.totalGrams}g) - R$ {(massItem.cost || calculateMassCost(massItem)).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-white/60 text-xs mb-2">Quantidade (gramas)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={mass.grams}
                        onChange={(e) => updateMass(index, 'grams', e.target.value)}
                        className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seção de Coberturas */}
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">Coberturas (opcional)</h3>
                <p className="text-white/60 text-sm">Adicione coberturas ao bolo</p>
              </div>
              <button
                type="button"
                onClick={addFrosting}
                className="w-10 h-10 rounded-xl bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 flex items-center justify-center transition-colors"
              >
                <FaPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {formData.frostings.map((frosting, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium text-sm">
                      Cobertura {index + 1}
                    </span>
                    {formData.frostings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFrosting(index)}
                        className="w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 flex items-center justify-center transition-colors"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/60 text-xs mb-2">Cobertura</label>
                      <select
                        value={frosting.frostingName}
                        onChange={(e) => updateFrosting(index, 'frostingName', e.target.value)}
                        className="w-full glass-input h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        style={{ 
                          WebkitAppearance: 'none',
                          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 1rem center',
                          backgroundSize: '1em'
                        }}
                      >
                        <option value="">Selecione a cobertura</option>
                        {cakeFrostings && cakeFrostings.map && cakeFrostings.map(frostingItem => (
                          <option key={frostingItem.name} value={frostingItem.name}>
                            {frostingItem.name} ({frostingItem.totalGrams}g) - R$ {(frostingItem.cost || calculateMassCost(frostingItem)).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-white/60 text-xs mb-2">Quantidade (gramas)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={frosting.grams}
                        onChange={(e) => updateFrosting(index, 'grams', e.target.value)}
                        className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seção de Insumos */}
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">Insumos (opcional)</h3>
                <p className="text-white/60 text-sm">Velas, decorações, embalagens, etc.</p>
              </div>
              <button
                type="button"
                onClick={addSupply}
                className="w-10 h-10 rounded-xl bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 flex items-center justify-center transition-colors"
                disabled={loading}
              >
                <FaPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {formData.supplies.map((supplyId, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium text-sm">
                      Insumo {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSupply(index)}
                      className="w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 flex items-center justify-center transition-colors"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-white/60 text-xs mb-2">Insumo</label>
                    <select
                      value={supplyId}
                      onChange={(e) => updateSupply(index, e.target.value)}
                      className="w-full glass-input h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                      style={{ 
                        WebkitAppearance: 'none',
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1em'
                      }}
                    >
                      <option value="">Selecione o insumo</option>
                      {suppliesList && suppliesList.map && suppliesList.map(supply => (
                        <option key={supply?._id || index} value={supply?._id}>
                          {supply?.name} - R$ {supply?.cost?.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seção de Margem de Lucro */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
            <h4 className="text-orange-300 font-semibold mb-3 flex items-center gap-2">
              <FaChartLine className="w-4 h-4" />
              Preço de Venda
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-xs mb-2">Margem de Lucro (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1000"
                  value={formData.profitMargin}
                  onChange={(e) => handleProfitMarginChange(e.target.value)}
                  className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  placeholder="50"
                />
                <p className="text-white/60 text-xs mt-1">
                  {formData.salePrice && `Preço: R$ ${formData.salePrice}`}
                </p>
              </div>

              <div>
                <label className="block text-white/60 text-xs mb-2">Preço de Venda (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.salePrice}
                  onChange={(e) => handleSalePriceChange(e.target.value)}
                  className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  placeholder="0.00"
                />
                <p className="text-white/60 text-xs mt-1">
                  {formData.profitMargin && `Margem: ${formData.profitMargin}%`}
                </p>
              </div>
            </div>
          </div>

          {/* VISUALIZAÇÃO DO CUSTO EM TEMPO REAL - CORRIGIDA */}
          {(formData.masses.some(mass => mass.massName && mass.grams)) && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
              <h4 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
                <FaCalculator className="w-4 h-4" />
                Resumo Financeiro do Bolo
              </h4>

              <div className="space-y-2 text-sm">
                {/* Detalhes das Massas */}
                {costBreakdown.massDetails.map((massDetail, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-white/80 truncate">
                      {massDetail.massName} ({massDetail.grams.toFixed(2)}g):
                    </span>
                    <span className="text-blue-400 flex-shrink-0 ml-2">R$ {massDetail.cost.toFixed(2)}</span>
                  </div>
                ))}

                {/* Detalhes das Coberturas */}
                {costBreakdown.frostingDetails.map((frostingDetail, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-white/80 truncate">
                      {frostingDetail.frostingName} ({frostingDetail.grams.toFixed(2)}g):
                    </span>
                    <span className="text-pink-400 flex-shrink-0 ml-2">R$ {frostingDetail.cost.toFixed(2)}</span>
                  </div>
                ))}

                {costBreakdown.suppliesCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/80">Custo dos insumos:</span>
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
                      <span className="text-white/80">Lucro:</span>
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

                {/* Peso total */}
                <div className="flex justify-between border-t border-white/20 pt-2">
                  <span className="text-white/80">Peso total do bolo:</span>
                  <span className="text-orange-400 font-semibold">{costBreakdown.totalGrams.toFixed(2)}g</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer fixo */}
        <div className="flex-shrink-0 p-4 border-t border-white/10 bg-white/5">
          <div className="flex gap-3">
            <GlassButton
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 h-12"
            >
              <FaTimes className="w-4 h-4" />
              <span>Cancelar</span>
            </GlassButton>
            <GlassButton
              type="submit"
              className="flex-1 h-12"
            >
              <FaSave className="w-4 h-4" />
              <span>{cake ? 'Atualizar' : 'Criar'}</span>
            </GlassButton>
          </div>
        </div>
      </form>
    </Modal>
  )
}