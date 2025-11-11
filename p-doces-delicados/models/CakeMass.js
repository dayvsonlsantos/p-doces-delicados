const CakeMass = {
  _id: ObjectId,
  name: "Massa de Bolo de Chocolate",
  totalGrams: 2000, // Rendimento total em gramas
  yieldCakes: 2, // Rendimento em número de bolos
  gramsPerCake: 1000, // Calculado: totalGrams / yieldCakes
  ingredients: [
    {
      productId: ObjectId,
      grams: 500,
      productName: "Farinha de Trigo"
    }
  ],
  cost: 18.00, // Custo total
  costPerGram: 0.009, // Custo por grama
  costPerCake: 9.00, // Custo por bolo
  createdAt: Date,
  updatedAt: Date
}
