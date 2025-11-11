// pages/api/cake-masses.js
import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const client = await clientPromise
  const db = client.db('docinhos')
  
  try {
    switch (req.method) {
      case 'GET':
        const masses = await db.collection('cake_masses').find({}).toArray()
        res.json(masses)
        break
        
      case 'POST':
        const massData = {
          ...req.body,
          gramsPerCake: parseFloat(req.body.totalGrams) / parseFloat(req.body.yieldCakes),
          createdAt: new Date(),
          updatedAt: new Date()
        }
        const result = await db.collection('cake_masses').insertOne(massData)
        res.json({ success: true, insertedId: result.insertedId })
        break
        
      case 'PUT':
        const { id, ...updateData } = req.body
        const updatedData = {
          ...updateData,
          gramsPerCake: parseFloat(updateData.totalGrams) / parseFloat(updateData.yieldCakes),
          updatedAt: new Date()
        }
        await db.collection('cake_masses').updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        )
        res.json({ success: true })
        break
        
      case 'DELETE':
        await db.collection('cake_masses').deleteOne({ _id: new ObjectId(req.body.id) })
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