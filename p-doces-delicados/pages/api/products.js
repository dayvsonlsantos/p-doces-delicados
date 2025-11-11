// pages/api/products.js
import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'

// Função para calcular custos com conversão
function calculateCosts(unit, quantity, cost) {
  const unitCost = cost / quantity
  let baseUnitCost = unitCost

  // Converte para unidade base (g ou ml)
  switch (unit) {
    case 'kg':
      baseUnitCost = unitCost / 1000 // R$ por kg -> R$ por g
      break
    case 'l':
      baseUnitCost = unitCost / 1000 // R$ por litro -> R$ por ml
      break
    // g, ml e un já estão na unidade base ou não precisam conversão
    default:
      baseUnitCost = unitCost
  }

  return {
    unitCost: parseFloat(unitCost.toFixed(6)),
    baseUnitCost: parseFloat(baseUnitCost.toFixed(8)) // Mais precisão para valores pequenos
  }
}

export default async function handler(req, res) {
  const client = await clientPromise
  const db = client.db('docinhos')
  
  try {
    switch (req.method) {
      case 'GET':
        const products = await db.collection('products').find({}).toArray()
        res.json(products)
        break
        
      case 'POST':
        const { unit, quantity, cost, ...rest } = req.body
        const costs = calculateCosts(unit, quantity, cost)
        
        const productData = {
          ...rest,
          unit,
          quantity: parseFloat(quantity),
          cost: parseFloat(cost),
          ...costs,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        const result = await db.collection('products').insertOne(productData)
        res.json({ success: true, insertedId: result.insertedId })
        break
        
      case 'PUT':
        const { id, ...updateData } = req.body
        const { unit: updateUnit, quantity: updateQuantity, cost: updateCost } = updateData
        const updatedCosts = calculateCosts(updateUnit, updateQuantity, updateCost)
        
        const finalData = {
          ...updateData,
          quantity: parseFloat(updateQuantity),
          cost: parseFloat(updateCost),
          ...updatedCosts,
          updatedAt: new Date()
        }
        
        await db.collection('products').updateOne(
          { _id: new ObjectId(id) },
          { $set: finalData }
        )
        res.json({ success: true })
        break
        
      case 'DELETE':
        await db.collection('products').deleteOne({ _id: new ObjectId(req.body.id) })
        res.json({ success: true })
        break
        
      default:
        res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}