const Cake = {
  _id: ObjectId,
  name: "Bolo de Chocolate Premium",
  description: "Bolo com massa de chocolate e cobertura especial",
  // Massas do bolo
  masses: [
    {
      massName: "Massa de Bolo de Chocolate",
      grams: 800 // Gramas usadas neste bolo
    }
  ],
  // Coberturas do bolo
  frostings: [
    {
      frostingName: "Cobertura de Chocolate", 
      grams: 300 // Gramas usadas neste bolo
    }
  ],
  supplies: [ObjectId], // Insumos (formas, velas, etc.)
  costPerUnit: 25.50, // Custo total por bolo
  costBreakdown: {
    massCost: 15.00,
    frostingCost: 8.50,
    suppliesCost: 2.00,
    totalCost: 25.50
  },
  profitMargin: 60, // Percentual de lucro
  salePrice: 40.80, // Preço de venda
  createdAt: Date,
  updatedAt: Date
}