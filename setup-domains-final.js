// 使用相对路径导入 Prisma
const path = require('path')
const prismaPath = path.join(__dirname, 'node_modules', '.prisma', 'client')
const { PrismaClient } = require(path.join(__dirname, 'node_modules', '@prisma', 'client'))
const prisma = new PrismaClient()

const domains = [
  // 蜘蛛池域名
  { domain: 'autopushnetwork.xyz', siteName: 'Auto Push Network', domainType: 'SPIDER_POOL', primaryTags: ['telegram', 'download'], secondaryTags: ['app', 'guide'] },
  { domain: 'contentpoolzone.site', siteName: 'Content Pool Zone', domainType: 'SPIDER_POOL', primaryTags: ['telegram', 'features'], secondaryTags: ['tutorial', 'tips'] },
  { domain: 'crawlboostnet.xyz', siteName: 'Crawl Boost Network', domainType: 'SPIDER_POOL', primaryTags: ['telegram', 'chinese'], secondaryTags: ['中文', '电报'] },
  { domain: 'crawlenginepro.xyz', siteName: 'Crawl Engine Pro', domainType: 'SPIDER_POOL', primaryTags: ['telegram', 'download'], secondaryTags: ['安装', 'install'] },
  { domain: 'linkpushmatrix.site', siteName: 'Link Push Matrix', domainType: 'SPIDER_POOL', primaryTags: ['telegram', 'features'], secondaryTags: ['功能', 'feature'] },
  { domain: 'rankspiderchain.xyz', siteName: 'Rank Spider Chain', domainType: 'SPIDER_POOL', primaryTags: ['telegram', 'guide'], secondaryTags: ['教程', 'tutorial'] },
  { domain: 'seohubnetwork.xyz', siteName: 'SEO Hub Network', domainType: 'SPIDER_POOL', primaryTags: ['telegram', 'download'], secondaryTags: ['下载', 'app'] },
  { domain: 'spidertrackzone.xyz', siteName: 'Spider Track Zone', domainType: 'SPIDER_POOL', primaryTags: ['telegram', 'chinese'], secondaryTags: ['中文版', 'chinese'] },
  { domain: 'trafficboostflow.site', siteName: 'Traffic Boost Flow', domainType: 'SPIDER_POOL', primaryTags: ['telegram', 'features'], secondaryTags: ['特性', 'features'] },
  
  // 跳转页域名
  { domain: 'adminapihub.xyz', siteName: 'Admin API Hub', domainType: 'REDIRECT_PAGE', primaryTags: ['telegram', 'download'], secondaryTags: ['redirect', 'api'] },
  { domain: 'globalinsighthub.xyz', siteName: 'Global Insight Hub', domainType: 'REDIRECT_PAGE', primaryTags: ['telegram', 'guide'], secondaryTags: ['insight', 'global'] },
  { domain: 'infostreammedia.xyz', siteName: 'Info Stream Media', domainType: 'REDIRECT_PAGE', primaryTags: ['telegram', 'news'], secondaryTags: ['media', 'stream'] },
  
  // 主站域名
  { domain: 'telegramtrendguide.com', siteName: 'Telegram Trend Guide', domainType: 'MAIN_SITE', primaryTags: ['telegram', 'guide', 'tutorial'], secondaryTags: ['trend', 'tips'], isPrimary: true },
  { domain: 'telegramupdatecenter.com', siteName: 'Telegram Update Center', domainType: 'MAIN_SITE', primaryTags: ['telegram', 'download', 'update'], secondaryTags: ['news', 'version'] },
  { domain: 'telegramtghub.com', siteName: 'Telegram TG Hub', domainType: 'MAIN_SITE', primaryTags: ['telegram', 'features', 'chinese'], secondaryTags: ['中文', 'hub'] },
]

async function main() {
  console.log('🚀 开始配置域名别名...\n')

  // 1. 获取或创建默认网站
  let website = await prisma.website.findFirst({
    where: { status: 'ACTIVE' }
  })

  if (!website) {
    console.log('📝 创建默认网站...')
    website = await prisma.website.create({
      data: {
        name: 'Telegram 中文网',
        domain: 'telegramtghub.com',
        description: 'Telegram 中文下载和使用指南',
        status: 'ACTIVE',
        seoTitle: 'Telegram 中文下载 | TG 中文版官网',
        seoDescription: 'Telegram 中文版下载和使用指南，提供最新的 TG 中文版下载、功能介绍和使用教程',
        seoKeywords: ['telegram', '电报', 'tg', '中文版', '下载'],
      }
    })
    console.log(`✅ 网站创建成功: ${website.name}\n`)
  } else {
    console.log(`✅ 使用现有网站: ${website.name}\n`)
  }

  // 2. 批量创建域名别名
  let created = 0
  let updated = 0
  let skipped = 0

  for (const domainData of domains) {
    const { domain, siteName, domainType, primaryTags, secondaryTags, isPrimary } = domainData

    try {
      const existing = await prisma.domainAlias.findUnique({
        where: { domain }
      })

      if (existing) {
        await prisma.domainAlias.update({
          where: { domain },
          data: {
            siteName,
            domainType,
            primaryTags,
            secondaryTags,
            isPrimary: isPrimary || false,
            status: 'ACTIVE',
          }
        })
        console.log(`🔄 更新: ${domain} [${domainType}]`)
        updated++
      } else {
        await prisma.domainAlias.create({
          data: {
            domain,
            siteName,
            siteDescription: `${siteName} - Telegram 相关服务`,
            domainType,
            primaryTags,
            secondaryTags,
            isPrimary: isPrimary || false,
            status: 'ACTIVE',
            websiteId: website.id,
          }
        })
        console.log(`✅ 创建: ${domain} [${domainType}]`)
        created++
      }
    } catch (error) {
      console.log(`❌ 失败: ${domain} - ${error.message}`)
      skipped++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 统计结果:')
  console.log(`   ✅ 新创建: ${created} 个`)
  console.log(`   🔄 已更新: ${updated} 个`)
  console.log(`   ❌ 跳过: ${skipped} 个`)
  console.log(`   📦 总计: ${domains.length} 个`)
  console.log('='.repeat(50))
  
  const stats = await prisma.domainAlias.groupBy({
    by: ['domainType'],
    where: { status: 'ACTIVE' },
    _count: true
  })

  console.log('\n📈 域名分类统计:')
  stats.forEach(stat => {
    const labels = {
      'MAIN_SITE': '主站点',
      'REDIRECT_PAGE': '跳转页',
      'SPIDER_POOL': '蜘蛛池'
    }
    console.log(`   ${labels[stat.domainType]}: ${stat._count} 个`)
  })

  console.log('\n✅ 域名配置完成！')
  console.log('\n现在可以访问 SEO 健康度监控页面查看数据了！')
  console.log('👉 https://adminseohub.xyz/seo-dashboard')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
