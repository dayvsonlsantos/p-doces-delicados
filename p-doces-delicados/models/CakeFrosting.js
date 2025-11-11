const CakeFrosting = {
  _id: ObjectId,
  name: "Cobertura de Chocolate",
  totalGrams: 800, // Rendimento total em gramas
  yieldCakes: 1, // Rendimento em número de bolos
  gramsPerCake: 800, // Calculado: totalGrams / yieldCakes
  ingredients: [
    {
      productId: ObjectId,
      grams: 200,
      productName: "Chocolate em Pó"
    }
  ],
  cost: 12.50, // Custo total
  costPerGram: 0.0156, // Custo por grama
  costPerCake: 12.50, // Custo por bolo
  createdAt: Date,
  updatedAt: Date
}