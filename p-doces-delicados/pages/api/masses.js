// pages/api/masses.js - garantir que tem método PUT
import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const client = await clientPromise
  const db = client.db('docinhos')
  
  try {
    switch (req.method) {
      case 'GET':
        const masses = await db.collection('masses').find({}).toArray()
        res.json(masses)
        break
        
      case 'POST':
        const mass = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        const result = await db.collection('masses').insertOne(mass)
        res.json({ success: true, insertedId: result.insertedId })
        break
        
      case 'PUT':
        const { id, ...updateData } = req.body
        await db.collection('masses').updateOne(
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
        await db.collection('masses').deleteOne({ _id: new ObjectId(req.body.id) })
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