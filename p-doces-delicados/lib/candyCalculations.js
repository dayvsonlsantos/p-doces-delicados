// lib/candyCalculations.js
// lib/candyCalculations.js - atualizar para usar insumos
export function calculateCandyCost(candy, masses, products, supplies) {
  if (!candy.massName || !candy.candyGrams) return 0

  const mass = masses.find(m => m.name === candy.massName)
  if (!mass) return 0

  let totalCost = 0
  const costBreakdown = {
    massCost: 0,
    extrasCost: 0,
    suppliesCost: 0,
    totalCost: 0
  }

  // 1. CUSTO DA MASSA
  const massCostPerGram = calculateMassCost(mass.ingredients, products) / mass.totalGrams
  const massCost = massCostPerGram * parseFloat(candy.candyGrams)
  costBreakdown.massCost = massCost
  totalCost += massCost

  // 2. CUSTO DOS EXTRAS
  let extrasCost = 0
  if (candy.extras && candy.extras.length > 0) {
    candy.extras.forEach(extra => {
      const product = products.find(p => p._id === extra.productId)
      if (product && extra.grams) {
        const extraGrams = parseFloat(extra.grams)
        let extraCost = 0

        if (product.unit === 'un') {
          extraCost = product.unitCost * (extraGrams / 100) // placeholder
        } else {
          extraCost = extraGrams * product.baseUnitCost
        }

        extrasCost += extraCost
      }
    })
  }
  costBreakdown.extrasCost = extrasCost
  totalCost += extrasCost

  // 3. CUSTO DOS INSUMOS (usando a coleção supplies)
  let suppliesCost = 0
  if (candy.supplies && candy.supplies.length > 0) {
    candy.supplies.forEach(supplyId => {
      const supply = supplies.find(s => s._id === supplyId)
      if (supply) {
        suppliesCost += supply.unitCost
      }
    })
  }
  costBreakdown.suppliesCost = suppliesCost
  totalCost += suppliesCost

  costBreakdown.totalCost = totalCost
  return costBreakdown
}

// Função auxiliar para calcular custo da massa
export function calculateMassCost(ingredients, products) {
  let totalCost = 0

  ingredients.forEach(ingredient => {
    const product = products.find(p => p._id === ingredient.productId)
    if (product && ingredient.grams) {
      const ingredientGrams = parseFloat(ingredient.grams)
      let cost = 0

      if (product.unit === 'un') {
        // Para unidades, precisamos saber quantas gramas por unidade
        // Por enquanto, assumimos 1 unidade = o peso informado no ingrediente
        cost = product.unitCost
      } else {
        // Para produtos em peso/volume
        cost = ingredientGrams * product.baseUnitCost
      }

      totalCost += cost
    }
  })

  return totalCost
}