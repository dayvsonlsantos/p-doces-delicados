// models/Mass.js
export const Mass = {
  name: 'masses',
  schema: {
    name: { type: 'string', required: true },
    ingredients: [{
      productId: { type: 'string', required: true },
      grams: { type: 'number', required: true }
    }],
    totalGrams: { type: 'number', required: true },
    createdAt: { type: 'date', default: Date.now },
    updatedAt: { type: 'date', default: Date.now }
  }
}