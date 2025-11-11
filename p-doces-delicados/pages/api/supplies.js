// pages/api/supplies.js
import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const client = await clientPromise
  const db = client.db('docinhos')
  
  try {
    switch (req.method) {
      case 'GET':
        const supplies = await db.collection('supplies').find({}).toArray()
        res.json(supplies)
        break
        
      case 'POST':
        const supply = {
          ...req.body,
          unit: 'un', // Insumos são sempre por unidade
          unitCost: parseFloat(req.body.cost), // Custo por unidade
          baseUnitCost: parseFloat(req.body.cost), // Mesmo que unitCost para unidades
          createdAt: new Date(),
          updatedAt: new Date()
        }
        const result = await db.collection('supplies').insertOne(supply)
        res.json({ success: true, insertedId: result.insertedId })
        break
        
      case 'PUT':
        const { id, ...updateData } = req.body
        const updatedData = {
          ...updateData,
          unitCost: parseFloat(updateData.cost),
          baseUnitCost: parseFloat(updateData.cost),
          updatedAt: new Date()
        }
        await db.collection('supplies').updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        )
        res.json({ success: true })
        break
        
      case 'DELETE':
        await db.collection('supplies').deleteOne({ _id: new ObjectId(req.body.id) })
        res.json({ success: true })
        break
        
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).json({ error: `Method ${req.method} not allowed` })
    }
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}