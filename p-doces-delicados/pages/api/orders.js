import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const client = await clientPromise
  const db = client.db('docinhos')
  
  try {
    switch (req.method) {
      case 'GET':
        const orders = await db.collection('orders')
          .find({})
          .sort({ deliveryDate: 1 })
          .toArray()
        res.json(orders)
        break
        
      case 'POST':
        // Gerar número de encomenda automático
        const lastOrder = await db.collection('orders')
          .find({})
          .sort({ _id: -1 })
          .limit(1)
          .toArray()
        
        const lastNumber = lastOrder.length > 0 ? 
          parseInt(lastOrder[0].orderNumber?.replace('ENC', '') || '0') : 0
        const newNumber = `ENC${String(lastNumber + 1).padStart(4, '0')}`
        
        const order = {
          ...req.body,
          orderNumber: newNumber,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        const result = await db.collection('orders').insertOne(order)
        res.json({ success: true, insertedId: result.insertedId, orderNumber: newNumber })
        break
        
      case 'PUT':
        const { id, ...updateData } = req.body
        await db.collection('orders').updateOne(
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
        await db.collection('orders').deleteOne({ _id: new ObjectId(req.body.id) })
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