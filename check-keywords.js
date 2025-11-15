const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkKeywords() {
  console.log('\n🔍 检查蜘蛛池页面关键词...\n')

  // 统计每个域名的页面数和关键词
  const domains = await prisma.domainAlias.findMany({
    where: {
      domainType: 'SPIDER_POOL'
    },
    include: {
      spiderPoolPages: {
        select: {
          id: true,
          slug: true,
          title: true,
          keywords: true,
          theme: true
        },
        take: 3 // 只取前3个作为示例
      }
    }
  })

  console.log('📊 蜘蛛池域名关键词分析：\n')

  for (const domain of domains) {
    const totalPages = await prisma.spiderPoolPage.count({
      where: { domainAliasId: domain.id }
    })

    console.log(`\n${domain.domain} (${domain.siteName})`)
    console.log(`  总页面数: ${totalPages}`)

    if (domain.spiderPoolPages.length > 0) {
      console.log(`  主题: ${domain.spiderPoolPages[0].theme}`)
      console.log(`  示例页面关键词:`)

      domain.spiderPoolPages.forEach((page, idx) => {
        console.log(`    [${idx + 1}] ${page.slug}`)
        console.log(`        标题: ${page.title.substring(0, 60)}...`)
        console.log(`        关键词 (${page.keywords.length}个): ${page.keywords.slice(0, 5).join(', ')}${page.keywords.length > 5 ? '...' : ''}`)
      })
    }
  }

  // 统计所有关键词
  const allPages = await prisma.spiderPoolPage.findMany({
    select: {
      keywords: true
    }
  })

  const keywordFrequency = {}
  allPages.forEach(page => {
    page.keywords.forEach(keyword => {
      keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + 1
    })
  })

  const sortedKeywords = Object.entries(keywordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)

  console.log('\n\n📈 TOP 20 高频关键词：\n')
  sortedKeywords.forEach(([keyword, count], idx) => {
    console.log(`  ${idx + 1}. ${keyword}: ${count}次`)
  })

  console.log(`\n总计: ${allPages.length} 个页面, ${Object.keys(keywordFrequency).length} 个不同的关键词\n`)
}

checkKeywords()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
