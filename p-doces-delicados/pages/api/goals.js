// pages/api/goals.js
import { connectToDatabase } from '../../lib/mongodb'

export default async function handler(req, res) {
  const { db } = await connectToDatabase()

  if (req.method === 'GET') {
    try {
      const goals = await db.collection('goals').find({}).toArray()
      res.status(200).json(goals)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao carregar metas' })
    }
  }

  if (req.method === 'POST') {
    try {
      const goal = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await db.collection('goals').insertOne(goal)
      res.status(201).json({ ...goal, _id: result.insertedId })
    } catch (error) {
      res.status(500).json({ error: 'Erro ao salvar meta' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, ...updateData } = req.body
      await db.collection('goals').updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      )
      res.status(200).json({ message: 'Meta atualizada' })
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar meta' })
    }
  }
}