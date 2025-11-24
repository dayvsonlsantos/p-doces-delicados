const Supply = {
  _id: ObjectId,
  name: "Papel de Docinho",
  category: "papel",
  cost: 0.05,
  unit: "un",
  unitCost: 0.05,
  baseUnitCost: 0.05,
  purchaseDate: Date, // NOVO CAMPO
  lastPurchaseCost: 0.05, // NOVO CAMPO
  description: "Papel branco para docinhos",
  createdAt: Date,
  updatedAt: Date
}