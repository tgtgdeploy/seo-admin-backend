const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function redistribute() {
  console.log('\n🔄 重新分配蜘蛛池域名...\n')

  const websites = await prisma.website.findMany({
    orderBy: { domain: 'asc' }
  })

  const site1 = websites.find(w => w.domain === 'telegramtghub.com')
  const site2 = websites.find(w => w.domain === 'telegramupdatecenter.com')
  const site3 = websites.find(w => w.domain === 'telegramtrendguide.com')

  const spiderDomains = {
    site1: ['autopushnetwork.xyz', 'contentpoolzone.site', 'crawlboostnet.xyz'],
    site2: ['crawlenginepro.xyz', 'linkpushmatrix.site', 'rankspiderchain.xyz'],
    site3: ['seohubnetwork.xyz', 'spidertrackzone.xyz', 'trafficboostflow.site']
  }

  console.log('分配方案:')
  console.log('Telegram Hub:', spiderDomains.site1.join(', '))
  console.log('Telegram Update Center:', spiderDomains.site2.join(', '))
  console.log('Telegram Trend Guide:', spiderDomains.site3.join(', '))
  console.log('')

  for (const domain of spiderDomains.site2) {
    await prisma.domainAlias.updateMany({
      where: { domain },
      data: { websiteId: site2.id }
    })
    console.log('✓', domain, '→ Telegram Update Center')
  }

  for (const domain of spiderDomains.site3) {
    await prisma.domainAlias.updateMany({
      where: { domain },
      data: { websiteId: site3.id }
    })
    console.log('✓', domain, '→ Telegram Trend Guide')
  }

  console.log('\n✅ 重新分配完成！\n')
}

redistribute().catch(console.error).finally(() => prisma.$disconnect())
