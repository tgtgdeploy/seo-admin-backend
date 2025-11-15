const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixAliases() {
  console.log('\n🔧 修复域名别名配置...\n')

  // 获取三个网站
  const site1 = await prisma.website.findFirst({
    where: { domain: 'telegramtghub.com' }
  })
  const site2 = await prisma.website.findFirst({
    where: { domain: 'telegramupdatecenter.com' }
  })
  const site3 = await prisma.website.findFirst({
    where: { domain: 'telegramtrendguide.com' }
  })

  if (!site1 || !site2 || !site3) {
    console.error('❌ 找不到网站！')
    return
  }

  // 1. 更新 Telegram Hub 的别名名称
  console.log('1. 更新 Telegram Hub 别名...')
  await prisma.domainAlias.updateMany({
    where: {
      websiteId: site1.id,
      domain: 'telegramtghub.com'
    },
    data: { siteName: 'Telegram Hub' }
  })
  await prisma.domainAlias.updateMany({
    where: {
      websiteId: site1.id,
      domain: 'globalinsighthub.xyz'
    },
    data: { siteName: 'Global Insight Hub' }
  })

  // 2. 更新 Telegram Update Center 的别名名称
  console.log('2. 更新 Telegram Update Center 别名...')
  await prisma.domainAlias.updateMany({
    where: {
      websiteId: site2.id,
      domain: 'telegramupdatecenter.com'
    },
    data: { siteName: 'Telegram Update Center' }
  })
  await prisma.domainAlias.updateMany({
    where: {
      websiteId: site2.id,
      domain: 'infostreammedia.xyz'
    },
    data: { siteName: 'Info Stream Media' }
  })

  // 3. 更新 Telegram Trend Guide 的别名名称
  console.log('3. 更新 Telegram Trend Guide 别名...')
  await prisma.domainAlias.updateMany({
    where: {
      websiteId: site3.id,
      domain: 'telegramtrendguide.com'
    },
    data: { siteName: 'Telegram Trend Guide' }
  })

  // 4. 添加第三个跳转页 adminapihub.xyz
  console.log('4. 添加 adminapihub.xyz 跳转页...')
  const existingAlias = await prisma.domainAlias.findFirst({
    where: { domain: 'adminapihub.xyz' }
  })

  if (!existingAlias) {
    await prisma.domainAlias.create({
      data: {
        domain: 'adminapihub.xyz',
        siteName: 'Admin API Hub',
        siteDescription: 'Admin API Hub - 管理接口中心',
        primaryTags: [],
        secondaryTags: [],
        websiteId: site3.id, // 关联到 Telegram Trend Guide
        isPrimary: false
      }
    })
    console.log('  ✓ 添加成功')
  } else {
    console.log('  ⚠️ 已存在，跳过')
  }

  // 验证结果
  console.log('\n📊 最终配置：')
  const websites = await prisma.website.findMany({
    include: {
      domainAliases: true
    }
  })

  for (const site of websites) {
    console.log(`\n${site.name} (${site.domain}):`)
    site.domainAliases.forEach(alias => {
      console.log(`  - ${alias.domain} → ${alias.siteName}`)
    })
  }

  console.log('\n✅ 修复完成！')
}

fixAliases()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
