import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 域名配置总览')
  console.log('='.repeat(60) + '\n')

  const websites = await prisma.website.findMany({
    include: {
      domainAliases: {
        orderBy: {
          isPrimary: 'desc'
        }
      }
    }
  })

  for (const website of websites) {
    console.log(`\n📌 ${website.name}`)
    console.log(`   默认域名: ${website.domain}`)
    console.log(`   状态: ${website.isActive ? '✅ 活跃' : '❌ 未激活'}`)

    if (website.domainAliases.length === 0) {
      console.log(`   ⚠️  未配置域名别名`)
      console.log(`   💡 建议: 在 Admin 后台添加域名以启用蜘蛛池 SEO`)
    } else {
      console.log(`   已配置 ${website.domainAliases.length} 个域名别名:\n`)

      website.domainAliases.forEach((domain, index) => {
        const prefix = domain.isPrimary ? '   🔵 主域名' : '   ⚪ 副域名'
        console.log(`   ${index + 1}. ${prefix}: ${domain.domain}`)
        console.log(`      └─ 主标签: ${domain.primaryTag || '未设置'}`)
        if (domain.secondaryTags && domain.secondaryTags.length > 0) {
          console.log(`      └─ 副标签: ${domain.secondaryTags.join(', ')}`)
        }
      })
    }
    console.log('')
  }

  console.log('='.repeat(60))
  console.log('📝 操作说明:')
  console.log('='.repeat(60))
  console.log('')
  console.log('1️⃣  在 Vercel 添加域名 (控制访问):')
  console.log('   → https://vercel.com/dashboard')
  console.log('   → Settings → Domains → Add Domain')
  console.log('')
  console.log('2️⃣  在 Admin 添加域名 (控制内容):')
  console.log('   → http://localhost:3100/login')
  console.log('   → 网站管理 → 选择网站 → 域名管理 → 添加域名')
  console.log('')
  console.log('⚠️  两个步骤都需要完成才能正常工作!')
  console.log('')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
