// pages/api/candies.js - adicionar método PUT
import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const client = await clientPromise
  const db = client.db('docinhos')

  try {
    switch (req.method) {
      case 'GET':
        const candies = await db.collection('candies').find({}).toArray()
        res.json(candies)
        break

      case 'POST':
        const candy = {
          ...req.body,
          costPerUnit: req.body.costPerUnit || 0,
          costBreakdown: req.body.costBreakdown || {},
          profitMargin: req.body.profitMargin || 0,
          salePrice: req.body.salePrice || 0,
          masses: req.body.masses || [], // Garantir que salva as massas
          extras: req.body.extras || [],
          supplies: req.body.supplies || [],
          // Mantém compatibilidade com versão anterior
          massName: req.body.masses && req.body.masses.length > 0 ? req.body.masses[0].massName : '',
          candyGrams: req.body.candyGrams || 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        const result = await db.collection('candies').insertOne(candy)
        res.json({ success: true, insertedId: result.insertedId })
        break

      case 'PUT':
        const { id, ...updateData } = req.body
        const updatedData = {
          ...updateData,
          costPerUnit: updateData.costPerUnit || 0,
          costBreakdown: updateData.costBreakdown || {},
          profitMargin: updateData.profitMargin || 0,
          salePrice: updateData.salePrice || 0,
          masses: updateData.masses || [],
          extras: updateData.extras || [],
          supplies: updateData.supplies || [],
          // Mantém compatibilidade
          massName: updateData.masses && updateData.masses.length > 0 ? updateData.masses[0].massName : '',
          candyGrams: updateData.candyGrams || 0,
          updatedAt: new Date()
        }
        await db.collection('candies').updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        )
        res.json({ success: true })
        break

      case 'DELETE':
        await db.collection('candies').deleteOne({ _id: new ObjectId(req.body.id) })
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