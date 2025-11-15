const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  console.log('\n🔐 创建管理员账号...\n')

  // 检查是否已有管理员
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (existingAdmin) {
    console.log('✅ 管理员账号已存在:')
    console.log(`   邮箱: ${existingAdmin.email}`)
    console.log(`   姓名: ${existingAdmin.name}`)
    console.log(`   角色: ${existingAdmin.role}`)
    console.log('\n提示: 如需重置密码，请删除现有账号后重新创建')
    return
  }

  // 创建管理员
  const email = 'admin@telegram1688.com'
  const password = 'Admin123456'  // 默认密码
  const hashedPassword = await bcrypt.hash(password, 10)

  const admin = await prisma.user.create({
    data: {
      email: email,
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log('✅ 管理员账号创建成功!')
  console.log('\n登录信息:')
  console.log(`   邮箱: ${email}`)
  console.log(`   密码: ${password}`)
  console.log(`   角色: ${admin.role}`)
  console.log('\n⚠️  重要: 首次登录后请立即修改密码!')
  console.log('\n登录地址: https://admin.telegram1688.com/login')
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
