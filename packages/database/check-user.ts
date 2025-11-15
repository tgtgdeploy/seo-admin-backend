import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })
    
    if (!user) {
      console.log('❌ 用户不存在')
      return
    }
    
    console.log('✅ 用户存在')
    console.log('📧 Email:', user.email)
    console.log('👤 Name:', user.name)
    console.log('🔑 Role:', user.role)
    console.log('🔒 Password hash:', user.password.substring(0, 20) + '...')
    
    // 测试密码
    const testPasswords = ['admin123', 'admin123456', 'admin']
    for (const pwd of testPasswords) {
      const match = await bcrypt.compare(pwd, user.password)
      if (match) {
        console.log(`✅ 密码匹配: "${pwd}"`)
      }
    }
  } catch (error) {
    console.error('❌ 错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
