import { prisma } from './packages/database/src/index.js'

const domains = [
  // 蜘蛛池
  { domain: 'autopushnetwork.xyz', siteName: 'Auto Push Network', type: 'SPIDER_POOL', tags: ['telegram', 'download'] },
  { domain: 'contentpoolzone.site', siteName: 'Content Pool Zone', type: 'SPIDER_POOL', tags: ['telegram', 'features'] },
  { domain: 'crawlboostnet.xyz', siteName: 'Crawl Boost Network', type: 'SPIDER_POOL', tags: ['telegram', 'chinese'] },
  { domain: 'crawlenginepro.xyz', siteName: 'Crawl Engine Pro', type: 'SPIDER_POOL', tags: ['telegram', 'download'] },
  { domain: 'linkpushmatrix.site', siteName: 'Link Push Matrix', type: 'SPIDER_POOL', tags: ['telegram', 'features'] },
  { domain: 'rankspiderchain.xyz', siteName: 'Rank Spider Chain', type: 'SPIDER_POOL', tags: ['telegram', 'guide'] },
  { domain: 'seohubnetwork.xyz', siteName: 'SEO Hub Network', type: 'SPIDER_POOL', tags: ['telegram', 'download'] },
  { domain: 'spidertrackzone.xyz', siteName: 'Spider Track Zone', type: 'SPIDER_POOL', tags: ['telegram', 'chinese'] },
  { domain: 'trafficboostflow.site', siteName: 'Traffic Boost Flow', type: 'SPIDER_POOL', tags: ['telegram', 'features'] },
  
  // 跳转页
  { domain: 'adminapihub.xyz', siteName: 'Admin API Hub', type: 'REDIRECT_PAGE', tags: ['telegram', 'download'] },
  { domain: 'globalinsighthub.xyz', siteName: 'Global Insight Hub', type: 'REDIRECT_PAGE', tags: ['telegram', 'guide'] },
  { domain: 'infostreammedia.xyz', siteName: 'Info Stream Media', type: 'REDIRECT_PAGE', tags: ['telegram', 'news'] },
  
  // 主站
  { domain: 'telegramtrendguide.com', siteName: 'Telegram Trend Guide', type: 'MAIN_SITE', tags: ['telegram', 'guide'], isPrimary: true },
  { domain: 'telegramupdatecenter.com', siteName: 'Telegram Update Center', type: 'MAIN_SITE', tags: ['telegram', 'download'] },
  { domain: 'telegramtghub.com', siteName: 'Telegram TG Hub', type: 'MAIN_SITE', tags: ['telegram', 'features'] },
]

async function main() {
  console.log('🚀 配置域名别名...\n')

  const website = await prisma.website.findFirst({ where: { status: 'ACTIVE' } })
  if (!website) {
    console.log('❌ 请先创建一个网站!')
    return
  }
  
  console.log(`✅ 网站: ${website.name}\n`)

  let created = 0, updated = 0

  for (const d of domains) {
    try {
      const existing = await prisma.domainAlias.findUnique({ where: { domain: d.domain } })
      
      if (existing) {
        await prisma.domainAlias.update({
          where: { domain: d.domain },
          data: { siteName: d.siteName, domainType: d.type, primaryTags: d.tags, status: 'ACTIVE' }
        })
        console.log(`🔄 ${d.domain} [${d.type}]`)
        updated++
      } else {
        await prisma.domainAlias.create({
          data: {
            domain: d.domain,
            siteName: d.siteName,
            siteDescription: `${d.siteName} - Telegram`,
            domainType: d.type,
            primaryTags: d.tags,
            secondaryTags: [],
            isPrimary: d.isPrimary || false,
            status: 'ACTIVE',
            websiteId: website.id,
          }
        })
        console.log(`✅ ${d.domain} [${d.type}]`)
        created++
      }
    } catch (e) {
      console.log(`❌ ${d.domain}: ${e.message}`)
    }
  }

  console.log(`\n📊 新创建: ${created}, 已更新: ${updated}`)
  console.log('\n✅ 完成! 刷新 SEO 健康度页面查看数据')
}

main().finally(() => prisma.$disconnect())
