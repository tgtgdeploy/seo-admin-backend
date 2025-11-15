const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const COMPETITIVE_KEYWORDS = {
  'telegramtghub.com': [
    'Telegram', 'TG', '电报', 'Telegram中文', 'Telegram下载',
    'Telegram教程', 'Telegram使用', 'Telegram群组', 'Telegram频道',
    '即时通讯', 'Telegram安全', 'Telegram功能', 'Telegram技巧',
    'Telegram机器人', 'Telegram营销', 'TG中文版', '电报中文版',
    'Telegram指南', 'Telegram隐私', 'Telegram加密'
  ],
  'telegramupdatecenter.com': [
    'Telegram更新', 'Telegram新功能', 'Telegram版本', 'Telegram升级',
    'Telegram Premium', 'Telegram新特性', 'Telegram发布', 'Telegram改进',
    'Telegram动态', 'Telegram资讯', 'Telegram消息', 'Telegram公告',
    'Telegram Android', 'Telegram iOS', 'Telegram桌面版'
  ],
  'telegramtrendguide.com': [
    'Telegram趋势', 'Telegram分析', 'Telegram报告', 'Telegram数据',
    'Telegram营销', 'Telegram社群', 'Telegram运营', 'Telegram增长',
    'Telegram策略', 'Telegram应用', 'Telegram案例', 'Telegram发展',
    'Telegram商业', 'Telegram企业', 'Web3', 'NFT', '加密货币'
  ]
}

async function syncKeywords() {
  console.log('\n🔄 同步并优化关键词...\n')

  const websites = await prisma.website.findMany()

  for (const website of websites) {
    const keywords = COMPETITIVE_KEYWORDS[website.domain] || []
    
    console.log(website.name, '-', keywords.length, '个关键词')

    await prisma.website.update({
      where: { id: website.id },
      data: { seoKeywords: keywords }
    })

    await prisma.post.updateMany({
      where: { websiteId: website.id },
      data: {
        metaKeywords: {
          set: keywords.slice(0, 10)
        }
      }
    })

    const mainAlias = await prisma.domainAlias.findFirst({
      where: {
        websiteId: website.id,
        isPrimary: true
      }
    })

    if (mainAlias) {
      await prisma.domainAlias.update({
        where: { id: mainAlias.id },
        data: {
          primaryTags: keywords.slice(0, 5),
          secondaryTags: keywords.slice(5, 15)
        }
      })
    }

    console.log('  ✓ 网站SEO关键词已更新')
    console.log('  ✓ 文章关键词已更新')
    console.log('  ✓ 域名标签已更新')
    console.log('')
  }

  console.log('✅ 关键词同步完成！\n')
}

syncKeywords().catch(console.error).finally(() => prisma.$disconnect())
