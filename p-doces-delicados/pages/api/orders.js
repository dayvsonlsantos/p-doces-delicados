// pages/api/orders.js (corrigido)
import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const client = await clientPromise
  const db = client.db('docinhos')

  try {
    switch (req.method) {
      // pages/api/orders.js (FILTRO CORRIGIDO)
      case 'GET':

        // Buscar TODAS as encomendas para debug
        const allOrders = await db.collection('orders')
          .find({})
          .sort({ deliveryDate: 1, createdAt: -1 })
          .toArray()
        const { startDate, endDate, type: filterType, status: filterStatus, hideCompleted } = req.query


        let query = {}

        // Filtro por tipo
        if (filterType && filterType !== 'all') {
          query.type = filterType
        }

        // Filtro por status
        if (filterStatus && filterStatus !== 'all') {
          query.status = filterStatus
        }

        // Ocultar concluídas
        if (hideCompleted === 'true') {
          query.status = { $ne: 'concluido' }
        }

        // CORREÇÃO: Aplicar filtro de data APENAS se for explicitamente fornecido
        // REMOVIDO o filtro padrão de uma semana
        if (startDate || endDate) {
          query.deliveryDate = {}

          if (startDate) {
            query.deliveryDate.$gte = new Date(startDate)
          }

          if (endDate) {
            const endDateObj = new Date(endDate)
            endDateObj.setDate(endDateObj.getDate() + 1)
            query.deliveryDate.$lt = endDateObj
          }
        }
        // REMOVIDO: else com filtro padrão

        const filteredOrders = await db.collection('orders')
          .find(query)
          .sort({ deliveryDate: 1, createdAt: -1 })
          .toArray()

        res.json(filteredOrders)
        break

      case 'POST':
        // Gerar número único para encomenda
        const lastOrder = await db.collection('orders').find().sort({ orderNumber: -1 }).limit(1).toArray()
        const lastNumber = lastOrder.length > 0 ? parseInt(lastOrder[0].orderNumber.replace('ENC', '')) : 0
        const orderNumber = `ENC${String(lastNumber + 1).padStart(4, '0')}`

        const {
          customerName,
          customerPhone,
          deliveryDate,
          type: orderType, // Renomeado para orderType
          status: orderStatus, // Renomeado para orderStatus
          items,
          supplies,
          observations,
          profitMargin,
          salePrice,
          // Novos campos de pagamento
          paymentStatus = 'pending',
          paymentMethod = 'money',
          discount = 0,
          discountType = 'percentage',
          finalPrice,
          paymentParts,
          costBreakdown
        } = req.body

        // Preparar dados da encomenda
        const orderData = {
          orderNumber,
          customerName,
          customerPhone,
          deliveryDate: new Date(deliveryDate),
          type: orderType, // Usando orderType
          status: orderStatus, // Usando orderStatus
          items: items.map(item => ({
            ...item,
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.unitPrice) || 0,
            totalPrice: Number(item.totalPrice) || 0,
            cost: Number(item.cost) || 0
          })),
          supplies: supplies.map(supply => ({
            ...supply,
            quantity: Number(supply.quantity) || 0,
            unitCost: Number(supply.unitCost) || 0,
            totalCost: Number(supply.totalCost) || 0
          })),
          observations,
          // Campos de pagamento
          paymentStatus,
          paymentMethod,
          discount: Number(discount) || 0,
          discountType,
          finalPrice: Number(finalPrice) || Number(salePrice) || 0,
          paymentParts: paymentParts ? paymentParts.map(part => ({
            ...part,
            amount: Number(part.amount) || 0,
            dueDate: part.dueDate ? new Date(part.dueDate) : null,
            paid: Boolean(part.paid),
            paymentMethod: part.paymentMethod || 'money'
          })) : [{
            amount: Number(finalPrice) || Number(salePrice) || 0,
            dueDate: new Date(deliveryDate),
            paid: paymentStatus === 'paid',
            paymentMethod: paymentMethod
          }],
          costBreakdown: {
            candiesCost: Number(costBreakdown?.candiesCost) || 0,
            cakesCost: Number(costBreakdown?.cakesCost) || 0,
            suppliesCost: Number(costBreakdown?.suppliesCost) || 0,
            totalCost: Number(costBreakdown?.totalCost) || 0,
            salePrice: Number(costBreakdown?.salePrice) || Number(salePrice) || 0,
            profit: Number(costBreakdown?.profit) || 0,
            profitMargin: Number(costBreakdown?.profitMargin) || Number(profitMargin) || 0
          },
          isCompleted: orderStatus === 'concluido', // Usando orderStatus
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const result = await db.collection('orders').insertOne(orderData)

        // Retornar a encomenda completa criada
        const createdOrder = await db.collection('orders').findOne({ _id: result.insertedId })
        res.status(201).json({ success: true, order: createdOrder })
        break

      case 'PUT':
        const { id, ...updateData } = req.body

        // Preparar dados para atualização
        const updateFields = {
          ...updateData,
          updatedAt: new Date()
        }

        // Garantir que datas sejam convertidas corretamente
        if (updateData.deliveryDate) {
          updateFields.deliveryDate = new Date(updateData.deliveryDate)
        }

        // Processar items se fornecidos
        if (updateData.items) {
          updateFields.items = updateData.items.map(item => ({
            ...item,
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.unitPrice) || 0,
            totalPrice: Number(item.totalPrice) || 0,
            cost: Number(item.cost) || 0
          }))
        }

        // Processar supplies se fornecidos
        if (updateData.supplies) {
          updateFields.supplies = updateData.supplies.map(supply => ({
            ...supply,
            quantity: Number(supply.quantity) || 0,
            unitCost: Number(supply.unitCost) || 0,
            totalCost: Number(supply.totalCost) || 0
          }))
        }

        // Processar paymentParts se fornecidos
        if (updateData.paymentParts) {
          updateFields.paymentParts = updateData.paymentParts.map(part => ({
            ...part,
            amount: Number(part.amount) || 0,
            dueDate: part.dueDate ? new Date(part.dueDate) : null,
            paid: Boolean(part.paid),
            paymentMethod: part.paymentMethod || 'money'
          }))
        }

        // Processar costBreakdown se fornecido
        if (updateData.costBreakdown) {
          updateFields.costBreakdown = {
            candiesCost: Number(updateData.costBreakdown.candiesCost) || 0,
            cakesCost: Number(updateData.costBreakdown.cakesCost) || 0,
            suppliesCost: Number(updateData.costBreakdown.suppliesCost) || 0,
            totalCost: Number(updateData.costBreakdown.totalCost) || 0,
            salePrice: Number(updateData.costBreakdown.salePrice) || 0,
            profit: Number(updateData.costBreakdown.profit) || 0,
            profitMargin: Number(updateData.costBreakdown.profitMargin) || 0
          }
        }

        // Garantir que campos numéricos sejam convertidos
        if (updateData.discount !== undefined) {
          updateFields.discount = Number(updateData.discount) || 0
        }

        if (updateData.finalPrice !== undefined) {
          updateFields.finalPrice = Number(updateData.finalPrice) || 0
        }

        if (updateData.salePrice !== undefined) {
          updateFields.salePrice = Number(updateData.salePrice) || 0
        }

        // Atualizar isCompleted baseado no status
        if (updateData.status) {
          updateFields.isCompleted = updateData.status === 'concluido'
        }

        const updateResult = await db.collection('orders').updateOne(
          { _id: new ObjectId(id) },
          { $set: updateFields }
        )

        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ success: false, error: 'Encomenda não encontrada' })
        }

        // Retornar a encomenda atualizada
        const updatedOrder = await db.collection('orders').findOne({ _id: new ObjectId(id) })
        res.json({ success: true, order: updatedOrder })
        break

      case 'DELETE':
        const deleteResult = await db.collection('orders').deleteOne({
          _id: new ObjectId(req.body.id)
        })

        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ success: false, error: 'Encomenda não encontrada' })
        }

        res.json({ success: true })
        break

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).json({ error: `Method ${req.method} not allowed` })
    }
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}