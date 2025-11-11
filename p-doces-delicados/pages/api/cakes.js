// pages/api/cakes.js
import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const client = await clientPromise
  const db = client.db('docinhos')
  
  try {
    switch (req.method) {
      case 'GET':
        const cakes = await db.collection('cakes').find({}).toArray()
        res.json(cakes)
        break
        
      case 'POST':
        const cake = {
          ...req.body,
          costPerUnit: req.body.costPerUnit || 0,
          costBreakdown: req.body.costBreakdown || {},
          profitMargin: req.body.profitMargin || 0,
          salePrice: req.body.salePrice || 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        const result = await db.collection('cakes').insertOne(cake)
        res.json({ success: true, insertedId: result.insertedId })
        break
        
      case 'PUT':
        const { id, ...updateData } = req.body
        await db.collection('cakes').updateOne(
          { _id: new ObjectId(id) },
          { 
            $set: { 
              ...updateData,
              updatedAt: new Date()
            } 
          }
        )
        res.json({ success: true })
        break
        
      case 'DELETE':
        await db.collection('cakes').deleteOne({ _id: new ObjectId(req.body.id) })
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