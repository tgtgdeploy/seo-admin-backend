const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()

  console.log('\n=== 检查数据库配置 ===\n')

  // 检查网站
  const websites = await prisma.website.findMany({
    include: {
      _count: {
        select: { posts: true, keywords: true, domainAliases: true }
      },
      domainAliases: {
        take: 5
      }
    }
  })

  console.log(`📊 网站总数: ${websites.length}`)
  websites.forEach((site, index) => {
    console.log(`\n${index + 1}. ${site.name}`)
    console.log(`   ID: ${site.id}`)
    console.log(`   域名: ${site.domain}`)
    console.log(`   状态: ${site.status}`)
    console.log(`   文章: ${site._count.posts} 篇`)
    console.log(`   关键词: ${site._count.keywords} 个`)
    console.log(`   域名别名: ${site._count.domainAliases} 个`)
    if (site.domainAliases.length > 0) {
      console.log(`   别名列表:`)
      site.domainAliases.forEach(alias => {
        console.log(`     - ${alias.domain} (${alias.siteName})`)
      })
    }
  })

  // 检查蜘蛛池域名
  const spiderDomains = await prisma.domainAlias.findMany({
    where: {
      domain: {
        in: [
          'autopushnetwork.xyz',
          'contentpoolzone.site',
          'crawlboostnet.xyz',
          'crawlenginepro.xyz',
          'linkpushmatrix.site',
          'rankspiderchain.xyz',
          'seohubnetwork.xyz',
          'spidertrackzone.xyz',
          'trafficboostflow.site'
        ]
      }
    }
  })

  console.log(`\n🕸️ 蜘蛛池域名数: ${spiderDomains.length}/9`)
  if (spiderDomains.length > 0) {
    spiderDomains.forEach(domain => {
      console.log(`   - ${domain.domain}`)
    })
  }

  // 检查蜘蛛池页面
  const spiderPages = await prisma.spiderPoolPage.count()
  console.log(`\n📄 蜘蛛池页面总数: ${spiderPages}`)

  // 检查用户
  const users = await prisma.user.count()
  console.log(`\n👤 用户总数: ${users}`)

  await prisma.$disconnect()
}

main().catch(console.error)
