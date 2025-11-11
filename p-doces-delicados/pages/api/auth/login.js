// pages/api/auth/login.js
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios' })
  }

  try {
    const client = await clientPromise
    const db = client.db('docinhos')

    // Verifica se o usuário existe
    const user = await db.collection('users').findOne({ 
      email: email.toLowerCase()
    })

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email não encontrado. Verifique o email digitado.' 
      })
    }

    // Hash da senha com MD5
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex')

    if (user.password !== hashedPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Senha incorreta. Tente novamente.' 
      })
    }

    // Remove a senha do objeto de retorno
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token: 'fake-jwt-token-' + Date.now() // Em produção, use JWT real
    })

  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor. Tente novamente em alguns instantes.' 
    })
  }
}