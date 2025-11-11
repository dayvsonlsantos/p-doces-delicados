// pages/api/user/settings.js
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const client = await clientPromise
    const db = client.db('docinhos')
    
    const { settings } = req.body

    // Para demonstração, vamos usar o primeiro usuário do sistema
    // Em produção, você deve implementar autenticação adequada
    const users = await db.collection('users').find({}).toArray()
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Nenhum usuário encontrado' })
    }

    const userId = users[0]._id

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          settings,
          updatedAt: new Date()
        } 
      }
    )

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    res.json({ success: true, message: 'Configurações salvas com sucesso' })
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}