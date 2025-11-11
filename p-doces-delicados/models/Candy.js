// models/Candy.js
export const Candy = {
  name: 'candies',
  schema: {
    name: { type: 'string', required: true },
    massName: { type: 'string', required: true },
    candyGrams: { type: 'number', required: true },
    extras: [{
      productId: { type: 'string', required: true },
      grams: { type: 'number', required: true }
    }],
    costPerUnit: { type: 'number', required: true },
    createdAt: { type: 'date', default: Date.now },
    updatedAt: { type: 'date', default: Date.now }
  }
}