const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verifyDomains() {
  console.log('\n📋 验证域名配置...\n')

  // 用户提供的正确域名列表
  const CORRECT_DOMAINS = {
    SPIDER_POOL: [
      'autopushnetwork.xyz',
      'contentpoolzone.site',
      'crawlboostnet.xyz',
      'crawlenginepro.xyz',
      'linkpushmatrix.site',
      'rankspiderchain.xyz',
      'seohubnetwork.xyz',
      'spidertrackzone.xyz',
      'trafficboostflow.site'
    ],
    REDIRECT_PAGE: [
      'adminapihub.xyz',
      'globalinsighthub.xyz',
      'infostreammedia.xyz'
    ],
    MAIN_SITE: [
      'telegramtrendguide.com',
      'telegramupdatecenter.com',
      'telegramtghub.com'
    ]
  }

  // 获取所有域名别名
  const allDomains = await prisma.domainAlias.findMany({
    select: {
      id: true,
      domain: true,
      siteName: true,
      domainType: true,
      isPrimary: true,
      website: {
        select: {
          id: true,
          name: true,
          domain: true
        }
      }
    },
    orderBy: [
      { domainType: 'asc' },
      { domain: 'asc' }
    ]
  })

  console.log(`数据库中共有 ${allDomains.length} 个域名别名\n`)

  // 创建所有正确域名的集合
  const correctDomainSet = new Set([
    ...CORRECT_DOMAINS.MAIN_SITE,
    ...CORRECT_DOMAINS.REDIRECT_PAGE,
    ...CORRECT_DOMAINS.SPIDER_POOL
  ])

  // 检查多余的域名
  const extraDomains = allDomains.filter(d => !correctDomainSet.has(d.domain))

  // 检查缺失的域名
  const existingDomains = new Set(allDomains.map(d => d.domain))
  const missingDomains = Array.from(correctDomainSet).filter(d => !existingDomains.has(d))

  // 检查类型不正确的域名
  const wrongTypeDomains = allDomains.filter(d => {
    if (CORRECT_DOMAINS.MAIN_SITE.includes(d.domain)) {
      return d.domainType !== 'MAIN_SITE'
    }
    if (CORRECT_DOMAINS.REDIRECT_PAGE.includes(d.domain)) {
      return d.domainType !== 'REDIRECT_PAGE'
    }
    if (CORRECT_DOMAINS.SPIDER_POOL.includes(d.domain)) {
      return d.domainType !== 'SPIDER_POOL'
    }
    return false
  })

  console.log('📊 分析结果：\n')

  if (extraDomains.length > 0) {
    console.log('❌ 发现多余的域名（需要删除）:')
    extraDomains.forEach(d => {
      console.log(`  - ${d.domain} (${d.siteName}) [${d.domainType}]`)
    })
    console.log('')
  }

  if (missingDomains.length > 0) {
    console.log('⚠️  缺失的域名（需要添加）:')
    missingDomains.forEach(d => {
      console.log(`  - ${d}`)
    })
    console.log('')
  }

  if (wrongTypeDomains.length > 0) {
    console.log('⚠️  类型不正确的域名:')
    wrongTypeDomains.forEach(d => {
      const correctType =
        CORRECT_DOMAINS.MAIN_SITE.includes(d.domain) ? 'MAIN_SITE' :
        CORRECT_DOMAINS.REDIRECT_PAGE.includes(d.domain) ? 'REDIRECT_PAGE' : 'SPIDER_POOL'
      console.log(`  - ${d.domain}: 当前 ${d.domainType}, 应该是 ${correctType}`)
    })
    console.log('')
  }

  if (extraDomains.length === 0 && missingDomains.length === 0 && wrongTypeDomains.length === 0) {
    console.log('✅ 所有域名配置正确！')
  }

  console.log('\n📋 当前域名列表：\n')

  const grouped = {
    MAIN_SITE: [],
    REDIRECT_PAGE: [],
    SPIDER_POOL: []
  }

  allDomains.forEach(d => {
    grouped[d.domainType].push(d)
  })

  console.log('【主站域名】(3个)')
  grouped.MAIN_SITE.forEach(d => {
    console.log(`  ✓ ${d.domain} (${d.siteName})${d.isPrimary ? ' [主域名]' : ''}`)
  })

  console.log('\n【跳转页】(3个)')
  grouped.REDIRECT_PAGE.forEach(d => {
    console.log(`  ✓ ${d.domain} (${d.siteName})`)
  })

  console.log('\n【蜘蛛池域名】(9个)')
  grouped.SPIDER_POOL.forEach(d => {
    console.log(`  ✓ ${d.domain} (${d.siteName})`)
  })

  console.log(`\n总计: ${allDomains.length} 个域名别名`)
  console.log('注: adminseohub.xyz 是管理后台域名，不在 DomainAlias 表中\n')

  return {
    extraDomains,
    missingDomains,
    wrongTypeDomains
  }
}

verifyDomains()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
