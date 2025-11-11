// components/Candies/CandyModal.js
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import GlassButton from '../UI/GlassButton'
import { useState, useEffect } from 'react'

export default function CandyModal({ isOpen, onClose, onSave, candy, masses, products }) {
  const [formData, setFormData] = useState({
    name: '',
    candyGrams: '',
    masses: [{ massName: '', grams: '' }], // Agora é um array com gramas
    extras: [],
    supplies: [],
    profitMargin: 50,
    salePrice: ''
  })

  const [supplies, setSupplies] = useState([])
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
      setSupplies(data)
    } catch (error) {
      console.error('Erro ao carregar insumos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (candy) {
      console.log('Candy carregado para edição:', candy) // Para debug

      // Verificar se é formato antigo (uma massa) ou novo (múltiplas massas)
      let candyMasses = []

      if (candy.masses && candy.masses.length > 0) {
        // Já está no formato novo
        candyMasses = candy.masses.map(mass => ({
          massName: mass.massName || '',
          grams: mass.grams || ''
        }))
      } else if (candy.massName) {
        // Formato antigo - converter para novo formato
        candyMasses = [{
          massName: candy.massName,
          grams: candy.candyGrams || ''
        }]
      } else {
        // Nenhuma massa definida
        candyMasses = [{ massName: '', grams: '' }]
      }

      setFormData({
        name: candy.name || '',
        candyGrams: candy.candyGrams || '',
        masses: candyMasses,
        extras: candy.extras || [],
        supplies: candy.supplies || [],
        profitMargin: candy.profitMargin || 50,
        salePrice: candy.salePrice || ''
      })
    } else {
      setFormData({
        name: '',
        candyGrams: '',
        masses: [{ massName: '', grams: '' }],
        extras: [],
        supplies: [],
        profitMargin: 50,
        salePrice: ''
      })
    }
  }, [candy, isOpen])

  // Função para calcular custo da massa
  const calculateMassCost = (ingredients, products) => {
    let totalCost = 0

    ingredients.forEach(ingredient => {
      const product = products.find(p => p._id === ingredient.productId)
      if (product && ingredient.grams) {
        const ingredientGrams = parseFloat(ingredient.grams)
        let cost = 0

        if (product.unit === 'un') {
          cost = product.unitCost
        } else {
          cost = ingredientGrams * product.baseUnitCost
        }

        totalCost += cost
      }
    })

    return totalCost
  }

  // Função para calcular custo do docinho com múltiplas massas
  const calculateCandyCost = (candyData) => {
    if (!candyData.masses || candyData.masses.length === 0) {
      return { massCost: 0, extrasCost: 0, suppliesCost: 0, totalCost: 0, totalGrams: 0 }
    }

    let totalMassCost = 0
    let totalGrams = 0
    const costBreakdown = {
      massCost: 0,
      extrasCost: 0,
      suppliesCost: 0,
      totalCost: 0,
      totalGrams: 0,
      massDetails: []
    }

    // 1. CUSTO DAS MASSAS (agora múltiplas)
    candyData.masses.forEach(massItem => {
      if (massItem.massName && massItem.grams) {
        const mass = masses.find(m => m.name === massItem.massName)
        if (mass) {
          const massCostPerGram = calculateMassCost(mass.ingredients, products) / mass.totalGrams
          const massGrams = parseFloat(massItem.grams)
          const massCost = massCostPerGram * massGrams

          totalMassCost += massCost
          totalGrams += massGrams
          costBreakdown.massDetails.push({
            massName: massItem.massName,
            grams: massGrams,
            cost: massCost,
            costPerGram: massCostPerGram
          })
        }
      }
    })

    costBreakdown.massCost = totalMassCost
    costBreakdown.totalGrams = totalGrams

    // 2. CUSTO DOS EXTRAS
    let extrasCost = 0
    if (candyData.extras && candyData.extras.length > 0) {
      candyData.extras.forEach(extra => {
        const product = products.find(p => p._id === extra.productId)
        if (product && extra.grams) {
          const extraGrams = parseFloat(extra.grams)
          let extraCost = 0

          if (product.unit === 'un') {
            extraCost = product.unitCost * (extraGrams / 100)
          } else {
            extraCost = extraGrams * product.baseUnitCost
          }

          extrasCost += extraCost
        }
      })
    }
    costBreakdown.extrasCost = extrasCost

    // 3. CUSTO DOS INSUMOS
    let suppliesCost = 0
    if (candyData.supplies && candyData.supplies.length > 0) {
      candyData.supplies.forEach(supplyId => {
        const supply = supplies.find(s => s._id === supplyId)
        if (supply) {
          suppliesCost += supply.cost
        }
      })
    }
    costBreakdown.suppliesCost = suppliesCost

    costBreakdown.totalCost = totalMassCost + extrasCost + suppliesCost
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
    const costBreakdown = calculateCandyCost(formData)
    const totalCost = costBreakdown.totalCost

    if (profitInputType === 'percentage' && formData.profitMargin) {
      // Se está editando porcentagem, calcular preço
      const salePrice = calculateSalePrice(totalCost, parseFloat(formData.profitMargin))
      setFormData(prev => ({
        ...prev,
        salePrice: salePrice.toFixed(2),
        candyGrams: costBreakdown.totalGrams.toFixed(2) // Atualiza o total de gramas
      }))
    } else if (profitInputType === 'price' && formData.salePrice) {
      // Se está editando preço, calcular porcentagem
      const margin = calculateProfitMargin(totalCost, parseFloat(formData.salePrice))
      setFormData(prev => ({
        ...prev,
        profitMargin: margin.toFixed(1),
        candyGrams: costBreakdown.totalGrams.toFixed(2) // Atualiza o total de gramas
      }))
    } else {
      // Atualiza apenas as gramas totais
      setFormData(prev => ({
        ...prev,
        candyGrams: costBreakdown.totalGrams.toFixed(2)
      }))
    }
  }, [formData.masses, formData.extras, formData.supplies, formData.profitMargin, formData.salePrice, profitInputType])

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

  // Funções para extras
  const addExtra = () => {
    setFormData({
      ...formData,
      extras: [...formData.extras, { productId: '', grams: '' }]
    })
  }

  const removeExtra = (index) => {
    const newExtras = formData.extras.filter((_, i) => i !== index)
    setFormData({ ...formData, extras: newExtras })
  }

  const updateExtra = (index, field, value) => {
    const newExtras = [...formData.extras]
    newExtras[index][field] = value
    setFormData({ ...formData, extras: newExtras })
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

  // components/Candies/CandyModal.js - handleSubmit atualizado
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validar se há pelo menos uma massa com dados
    const validMasses = formData.masses.filter(mass => mass.massName && mass.grams)
    if (validMasses.length === 0) {
      alert('Por favor, adicione pelo menos uma massa ao docinho')
      return
    }

    const candyData = {
      ...formData,
      candyGrams: parseFloat(formData.candyGrams) || 0,
      profitMargin: parseFloat(formData.profitMargin) || 50, // Garantir valor padrão
      salePrice: parseFloat(formData.salePrice) || 0, // Garantir que é número
      masses: validMasses.map(mass => ({
        ...mass,
        grams: parseFloat(mass.grams)
      })),
      extras: formData.extras
        .filter(extra => extra.productId && extra.grams)
        .map(extra => ({
          ...extra,
          grams: parseFloat(extra.grams)
        })),
      supplies: formData.supplies.filter(supplyId => supplyId)
    }

    console.log('Dados a serem salvos:', candyData) // Para debug
    onSave(candyData)
  }

  const costBreakdown = calculateCandyCost(formData)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={candy ? 'Editar Docinho' : 'Novo Docinho'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <Input
          label="Nome do Docinho"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Brigadeiro Gourmet"
          required
        />

        {/* Seção de Massas Múltiplas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="block text-sm font-medium text-white/80">
                Massas do Docinho
              </label>
              <p className="text-white/60 text-xs">Adicione uma ou mais massas com suas quantidades em gramas</p>
            </div>
            <GlassButton
              type="button"
              variant="secondary"
              onClick={addMass}
              className="px-3 py-1 text-sm"
            >
              <i className="fas fa-plus"></i>
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
                      className="glass-input w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl 
                               text-white focus:outline-none focus:ring-2 focus:ring-primary-400 
                               focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Selecione a massa</option>
                      {masses.map(massItem => (
                        <option key={massItem.name} value={massItem.name}>
                          {massItem.name} ({massItem.totalGrams}g)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-white/60 mb-1">Gramas no Docinho</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={mass.grams}
                      onChange={(e) => updateMass(index, 'grams', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl 
                               text-white placeholder-white/50 focus:outline-none focus:ring-2 
                               focus:ring-primary-400 focus:border-transparent transition-all duration-300"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeMass(index)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl 
                           bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-400 
                           transition-colors duration-200"
                  disabled={formData.masses.length === 1}
                >
                  <i className="fas fa-times text-sm"></i>
                </button>
              </div>
            ))}
          </div>

          {/* Total de Gramas */}
          <div className="mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex justify-between items-center">
              <span className="text-white/80 text-sm">Peso total do docinho:</span>
              <span className="text-blue-400 font-bold">{costBreakdown.totalGrams.toFixed(2)}g</span>
            </div>
          </div>
        </div>

        {/* Seção de Extras */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-white/80">
              Extras (opcional)
            </label>
            <GlassButton
              type="button"
              variant="secondary"
              onClick={addExtra}
              className="px-3 py-1 text-sm"
            >
              <i className="fas fa-plus"></i>
              Adicionar Extra
            </GlassButton>
          </div>

          <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
            {formData.extras.map((extra, index) => (
              <div key={index} className="flex gap-3 items-start p-3 rounded-2xl bg-white/5">
                <div className="flex-1">
                  <select
                    value={extra.productId}
                    onChange={(e) => updateExtra(index, 'productId', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl 
                             text-white focus:outline-none focus:ring-2 focus:ring-primary-400 
                             focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Selecione o produto</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} ({product.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-32">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Gramas"
                    value={extra.grams}
                    onChange={(e) => updateExtra(index, 'grams', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl 
                             text-white placeholder-white/50 focus:outline-none focus:ring-2 
                             focus:ring-primary-400 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeExtra(index)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl 
                           bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-400 
                           transition-colors duration-200"
                >
                  <i className="fas fa-times text-sm"></i>
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
              <p className="text-white/60 text-xs">Papéis, embalagens, etc. (1 por docinho)</p>
            </div>
            <GlassButton
              type="button"
              variant="secondary"
              onClick={addSupply}
              className="px-3 py-1 text-sm"
              disabled={loading}
            >
              <i className="fas fa-plus"></i>
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
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl 
                             text-white focus:outline-none focus:ring-2 focus:ring-primary-400 
                             focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Selecione o insumo</option>
                    {supplies.map(supply => (
                      <option key={supply._id} value={supply._id}>
                        {supply.name} - R$ {supply.cost?.toFixed(4)}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => removeSupply(index)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl 
                           bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-400 
                           transition-colors duration-200"
                >
                  <i className="fas fa-times text-sm"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Margem de Lucro */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
          <h4 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
            <i className="fas fa-chart-line"></i>
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl 
                         text-white focus:outline-none focus:ring-2 focus:ring-primary-400 
                         focus:border-transparent transition-all duration-300"
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl 
                         text-white focus:outline-none focus:ring-2 focus:ring-primary-400 
                         focus:border-transparent transition-all duration-300"
                placeholder="0.00"
              />
              <p className="text-white/60 text-xs mt-1">
                {formData.profitMargin && `Margem: ${formData.profitMargin}%`}
              </p>
            </div>
          </div>
        </div>

        {/* Visualização do Custo em Tempo Real */}
        {(formData.masses.some(mass => mass.massName && mass.grams)) && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
            <h4 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
              <i className="fas fa-calculator"></i>
              Resumo Financeiro por Docinho
            </h4>

            <div className="space-y-3 text-sm">
              {/* Detalhes das Massas */}
              {costBreakdown.massDetails.map((massDetail, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-white/80">
                    {massDetail.massName} ({massDetail.grams.toFixed(2)}g):
                  </span>
                  <span className="text-white">R$ {massDetail.cost.toFixed(4)}</span>
                </div>
              ))}

              {costBreakdown.extrasCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/80">Custo dos extras:</span>
                  <span className="text-yellow-400">R$ {costBreakdown.extrasCost.toFixed(4)}</span>
                </div>
              )}

              {costBreakdown.suppliesCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/80">Custo dos insumos:</span>
                  <span className="text-blue-400">R$ {costBreakdown.suppliesCost.toFixed(4)}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-white/20 pt-2">
                <span className="text-white font-semibold">Custo total:</span>
                <span className="text-white font-bold">R$ {costBreakdown.totalCost.toFixed(4)}</span>
              </div>

              {formData.salePrice && (
                <>
                  <div className="flex justify-between">
                    <span className="text-white/80">Preço de venda:</span>
                    <span className="text-green-400 font-bold">R$ {parseFloat(formData.salePrice).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Lucro por unidade:</span>
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
            Cancelar
          </GlassButton>
          <GlassButton type="submit">
            <i className="fas fa-save"></i>
            {candy ? 'Atualizar' : 'Salvar'}
          </GlassButton>
        </div>
      </form>
    </Modal>
  )
}