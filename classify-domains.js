const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function classifyDomains() {
  console.log('\n🏷️  域名分类配置...\n')

  // 主站域名列表（isPrimary = true 的域名）
  const MAIN_SITES = [
    'telegramtghub.com',
    'telegramupdatecenter.com',
    'telegramtrendguide.com'
  ]

  // 跳转页域名列表
  const REDIRECT_PAGES = [
    'globalinsighthub.xyz',
    'infostreammedia.xyz',
    'adminapihub.xyz'
  ]

  // 蜘蛛池域名列表
  const SPIDER_POOLS = [
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

  // 1. 设置主站域名
  console.log('1. 设置主站域名 (MAIN_SITE)...')
  for (const domain of MAIN_SITES) {
    const result = await prisma.domainAlias.updateMany({
      where: { domain },
      data: { domainType: 'MAIN_SITE' }
    })
    if (result.count > 0) {
      console.log(`  ✓ ${domain} → MAIN_SITE`)
    } else {
      console.log(`  ⚠️  ${domain} 未找到`)
    }
  }

  // 2. 设置跳转页域名
  console.log('\n2. 设置跳转页域名 (REDIRECT_PAGE)...')
  for (const domain of REDIRECT_PAGES) {
    const result = await prisma.domainAlias.updateMany({
      where: { domain },
      data: { domainType: 'REDIRECT_PAGE' }
    })
    if (result.count > 0) {
      console.log(`  ✓ ${domain} → REDIRECT_PAGE`)
    } else {
      console.log(`  ⚠️  ${domain} 未找到`)
    }
  }

  // 3. 设置蜘蛛池域名
  console.log('\n3. 设置蜘蛛池域名 (SPIDER_POOL)...')
  for (const domain of SPIDER_POOLS) {
    const result = await prisma.domainAlias.updateMany({
      where: { domain },
      data: { domainType: 'SPIDER_POOL' }
    })
    if (result.count > 0) {
      console.log(`  ✓ ${domain} → SPIDER_POOL`)
    } else {
      console.log(`  ⚠️  ${domain} 未找到`)
    }
  }

  // 验证结果
  console.log('\n📊 分类统计：')

  const mainSites = await prisma.domainAlias.count({
    where: { domainType: 'MAIN_SITE' }
  })
  console.log(`  主站域名: ${mainSites}`)

  const redirectPages = await prisma.domainAlias.count({
    where: { domainType: 'REDIRECT_PAGE' }
  })
  console.log(`  跳转页: ${redirectPages}`)

  const spiderPools = await prisma.domainAlias.count({
    where: { domainType: 'SPIDER_POOL' }
  })
  console.log(`  蜘蛛池域名: ${spiderPools}`)

  // 显示详细列表
  console.log('\n📋 域名详细列表：')
  const allDomains = await prisma.domainAlias.findMany({
    select: {
      domain: true,
      siteName: true,
      domainType: true,
      isPrimary: true
    },
    orderBy: [
      { domainType: 'asc' },
      { domain: 'asc' }
    ]
  })

  const grouped = {
    MAIN_SITE: [],
    REDIRECT_PAGE: [],
    SPIDER_POOL: []
  }

  allDomains.forEach(d => {
    grouped[d.domainType].push(d)
  })

  console.log('\n  【主站域名】')
  grouped.MAIN_SITE.forEach(d => {
    console.log(`    - ${d.domain} (${d.siteName})${d.isPrimary ? ' [主域名]' : ''}`)
  })

  console.log('\n  【跳转页】')
  grouped.REDIRECT_PAGE.forEach(d => {
    console.log(`    - ${d.domain} (${d.siteName})`)
  })

  console.log('\n  【蜘蛛池域名】')
  grouped.SPIDER_POOL.forEach(d => {
    console.log(`    - ${d.domain} (${d.siteName})`)
  })

  console.log('\n✅ 域名分类完成！')
}

classifyDomains()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
