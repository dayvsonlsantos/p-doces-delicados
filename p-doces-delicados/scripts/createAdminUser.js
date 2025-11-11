// scripts/createAdminUser.js
const { MongoClient } = require('mongodb')
const crypto = require('crypto')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/docinhos'

async function createAdminUser() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Conectado ao MongoDB')
    
    const db = client.db('docinhos')
    const usersCollection = db.collection('users')
    
    // Verifica se o admin já existe
    const existingAdmin = await usersCollection.findOne({ email: 'admin@docinhos.com' })
    
    if (existingAdmin) {
      console.log('ℹ️ Usuário admin já existe!')
      console.log('📧 Email:', existingAdmin.email)
      console.log('👤 Nome:', existingAdmin.name)
      return
    }
    
    // Cria o usuário admin
    const hashedPassword = crypto.createHash('md5').update('admin123').digest('hex')
    
    const adminUser = {
      name: 'Administrador',
      email: 'admin@docinhos.com',
      password: hashedPassword,
      theme: 'dark',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await usersCollection.insertOne(adminUser)
    console.log('✅ Usuário admin criado com sucesso!')
    console.log('📧 Email: admin@docinhos.com')
    console.log('🔑 Senha: admin123')
    console.log('🆔 ID:', result.insertedId)
    console.log('\n💡 Agora você pode fazer login no sistema!')
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

// Executa o script
createAdminUser()