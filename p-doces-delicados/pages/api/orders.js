// pages/api/orders.js (atualizado)
import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const client = await clientPromise
  const db = client.db('docinhos')
  
  try {
    switch (req.method) {
      case 'GET':
        const { startDate, endDate } = req.query
        
        // Construir query base
        let query = {}
        
        // Filtro por datas se fornecidas
        if (startDate || endDate) {
          query.deliveryDate = {}
          
          if (startDate) {
            query.deliveryDate.$gte = new Date(startDate)
          }
          
          if (endDate) {
            // Adiciona 1 dia para incluir a data final completa
            const endDateObj = new Date(endDate)
            endDateObj.setDate(endDateObj.getDate() + 1)
            query.deliveryDate.$lt = endDateObj
          }
        } else {
          // Por padrão, traz encomendas da última semana
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
          query.deliveryDate = { $gte: oneWeekAgo }
        }
        
        const orders = await db.collection('orders')
          .find(query)
          .sort({ deliveryDate: 1, createdAt: -1 })
          .toArray()
        
        res.json(orders)
        break
        
      case 'POST':
        // Gerar número único para encomenda
        const lastOrder = await db.collection('orders').find().sort({ orderNumber: -1 }).limit(1).toArray()
        const lastNumber = lastOrder.length > 0 ? parseInt(lastOrder[0].orderNumber.replace('ENC', '')) : 0
        const orderNumber = `ENC${String(lastNumber + 1).padStart(4, '0')}`
        
        const orderData = {
          ...req.body,
          orderNumber,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        const result = await db.collection('orders').insertOne(orderData)
        res.json({ success: true, insertedId: result.insertedId, orderNumber })
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