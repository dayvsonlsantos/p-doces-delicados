// pages/api/auth/register.js
import clientPromise from '../../../lib/mongodb'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }

  const { name, email, password, theme = 'dark' } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' })
  }

  try {
    const client = await clientPromise
    const db = client.db('docinhos')

    // Verifica se o usuário já existe
    const existingUser = await db.collection('users').findOne({ 
      email: email.toLowerCase() 
    })

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Usuário já existe' })
    }

    // Hash da senha com MD5
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex')

    const user = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      theme,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('users').insertOne(user)

    // Remove a senha do objeto de retorno
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: { ...userWithoutPassword, _id: result.insertedId }
    })

  } catch (error) {
    console.error('Erro no registro:', error)
    res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}