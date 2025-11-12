// models/Order.js
export const Order = {
  _id: ObjectId,
  orderNumber: String, // Número único da encomenda
  customerName: String,
  customerPhone: String,
  deliveryDate: Date,
  status: {
    type: String,
    enum: ['encomendado', 'iniciando', 'concluido', 'cancelado', 'pendente'],
    default: 'encomendado'
  },
  type: {
    type: String,
    enum: ['docinhos', 'bolos', 'ambos'],
    default: 'docinhos'
  },
  items: [{
    itemType: { type: String, enum: ['candy', 'cake'] },
    itemId: ObjectId,
    itemName: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    cost: Number
  }],
  supplies: [{
    supplyId: ObjectId,
    supplyName: String,
    quantity: Number,
    unitCost: Number,
    totalCost: Number
  }],
  observations: String,
  
  // NOVOS CAMPOS DE PAGAMENTO
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['money', 'card', 'pix', 'transfer'],
    default: 'money'
  },
  discount: {
    type: Number,
    default: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  finalPrice: {
    type: Number,
    default: 0
  },
  paymentParts: [{
    amount: Number,
    dueDate: Date,
    paid: {
      type: Boolean,
      default: false
    },
    paymentMethod: {
      type: String,
      enum: ['money', 'card', 'pix', 'transfer'],
      default: 'money'
    },
    paidAt: Date
  }],
  
  costBreakdown: {
    candiesCost: Number,
    cakesCost: Number,
    suppliesCost: Number,
    totalCost: Number,
    salePrice: Number,
    profit: Number,
    profitMargin: Number
  },
  isCompleted: { type: Boolean, default: false },
  createdAt: Date,
  updatedAt: Date
}