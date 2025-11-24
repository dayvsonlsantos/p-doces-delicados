// pages/api/fixed-costs/index.js
import { MongoClient, ObjectId } from 'mongodb'

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)

export default async function handler(req, res) {
  try {
    await client.connect()
    const database = client.db('confeitaria')
    const collection = database.collection('fixedCosts')

    switch (req.method) {
      case 'GET':
        const costs = await collection.find({}).toArray()
        res.status(200).json(costs)
        break

      case 'POST':
        const newCost = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        const result = await collection.insertOne(newCost)
        res.status(201).json({ ...newCost, _id: result.insertedId })
        break

      case 'PUT':
        const { id, ...updateData } = req.body
        await collection.updateOne(
          { _id: new ObjectId(id) },
          { 
            $set: {
              ...updateData,
              updatedAt: new Date()
            }
          }
        )
        res.status(200).json({ message: 'Custo atualizado com sucesso' })
        break

      case 'DELETE':
        await collection.deleteOne({ _id: new ObjectId(req.body.id) })
        res.status(200).json({ message: 'Custo excluído com sucesso' })
        break

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Erro na API de custos fixos:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  } finally {
    await client.close()
  }
}