// models/Mass.js
export const Mass = {
  name: 'masses',
  schema: {
    name: { type: 'string', required: true },
    ingredients: [{
      productId: { type: 'string', required: true },
      grams: { type: 'number', required: true },
      productName: { type: 'string' },
      lastPurchaseCost: { type: 'number' }
    }],
    totalGrams: { type: 'number', required: true },
    lastCostUpdate: { type: 'date' },
    currentCost: { type: 'number' },
    costHistory: [{
      date: { type: 'date' },
      cost: { type: 'number' },
      reason: { type: 'string' }
    }],
    createdAt: { type: 'date', default: Date.now },
    updatedAt: { type: 'date', default: Date.now } // NOVO CAMPO
  }
}