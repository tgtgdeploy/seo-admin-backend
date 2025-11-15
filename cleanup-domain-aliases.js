const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanup() {
  console.log('\n🧹 清理多余的域名别名...\n')

  // 蜘蛛池域名列表（这些不应该是主站点的别名）
  const SPIDER_DOMAINS = [
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

  // 删除蜘蛛池域名的别名（它们不应该作为主站点的别名）
  console.log('删除蜘蛛池域名别名...')
  const deleteResult = await prisma.domainAlias.deleteMany({
    where: {
      domain: {
        in: SPIDER_DOMAINS
      }
    }
  })
  console.log(`✓ 删除了 ${deleteResult.count} 个多余的域名别名`)

  // 检查每个网站的域名别名
  console.log('\n检查各网站的域名别名：')
  const websites = await prisma.website.findMany({
    include: {
      domainAliases: true
    }
  })

  for (const site of websites) {
    console.log(`\n${site.name} (${site.domain}):`)
    console.log(`  域名别名数量: ${site.domainAliases.length}`)
    site.domainAliases.forEach(alias => {
      console.log(`  - ${alias.domain} (${alias.name})`)
    })
  }

  console.log('\n✅ 清理完成！')
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
