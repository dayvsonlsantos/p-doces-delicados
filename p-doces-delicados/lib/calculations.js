// lib/calculations.js

// Converte qualquer quantidade para gramas ou ml
export function convertToBaseUnit(quantity, fromUnit) {
  switch (fromUnit) {
    case 'kg':
      return quantity * 1000 // kg para g
    case 'l':
      return quantity * 1000 // L para ml
    case 'g':
    case 'ml':
      return quantity
    case 'un':
      return quantity // Unidades não convertemos
    default:
      return quantity
  }
}

// Calcula o custo baseado na quantidade e unidade
export function calculateCost(quantity, unit, product) {
  if (product.unit === 'un') {
    // Para produtos em unidades, a quantidade deve ser em unidades
    return quantity * product.unitCost
  } else {
    // Converte a quantidade para a unidade base do produto
    let quantityInBaseUnit = quantity
    
    // Se a receita está em gramas/ml mas o produto está em kg/L, converte
    if (unit === 'g' && product.unit === 'kg') {
      quantityInBaseUnit = quantity / 1000
    } else if (unit === 'ml' && product.unit === 'l') {
      quantityInBaseUnit = quantity / 1000
    }
    
    return quantityInBaseUnit * product.unitCost
  }
}

// Função simplificada para usar nas massas e docinhos
export function calculateIngredientCost(ingredientGrams, product) {
  if (product.unit === 'un') {
    // Se o produto é por unidade, precisamos saber quantas gramas por unidade
    // Por enquanto, assumimos 1 unidade = 1 grama (você pode ajustar isso)
    return ingredientGrams * product.unitCost
  }
  
  // Para produtos em peso/volume, usa o custo base (sempre em g/ml)
  return ingredientGrams * product.baseUnitCost
}