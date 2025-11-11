// models/Product.js
export const Product = {
  name: 'products',
  schema: {
    name: { type: 'string', required: true },
    unit: { type: 'string', required: true }, // g, ml, un
    cost: { type: 'number', required: true },
    createdAt: { type: 'date', default: Date.now },
    updatedAt: { type: 'date', default: Date.now }
  }
}