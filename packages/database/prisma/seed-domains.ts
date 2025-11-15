import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 域名配置一键部署脚本
 *
 * 自动添加所有 15 个域名到数据库，包括：
 * - 5 个域名绑定到 Website 1
 * - 5 个域名绑定到 Website 2
 * - 5 个域名绑定到 Website TG
 */
async function main() {
  console.log('🚀 开始部署域名配置...\n')

  // 获取所有网站
  const websites = await prisma.website.findMany({
    orderBy: { createdAt: 'asc' }
  })

  if (websites.length < 3) {
    console.error('❌ 错误：数据库中至少需要 3 个网站')
    console.log('请先运行: npm run db:seed')
    process.exit(1)
  }

  const [website1, website2, websiteTG] = websites

  console.log('📋 找到以下网站：')
  console.log(`   1. ${website1.name} (${website1.domain})`)
  console.log(`   2. ${website2.name} (${website2.domain})`)
  console.log(`   3. ${websiteTG.name} (${websiteTG.domain})`)
  console.log('')

  // Website 1 的域名配置
  const website1Domains = [
    {
      domain: 'telegram1688.com',
      siteName: 'Telegram中文网',
      siteDescription: 'Telegram中文官方服务平台，提供中文版下载、使用教程、最新资讯',
      isPrimary: true, // 主域名
    },
    {
      domain: 'telegram2688.com',
      siteName: 'Telegram中文服务',
      siteDescription: 'Telegram中文服务平台，提供TG中文版下载和使用指南',
      isPrimary: false,
    },
    {
      domain: 'telegramcny28.com',
      siteName: 'Telegram中文28',
      siteDescription: 'Telegram中文版下载和使用教程，安全可靠的即时通讯工具',
      isPrimary: false,
    },
    {
      domain: 'telegramrmb28.com',
      siteName: 'Telegram中文平台',
      siteDescription: 'Telegram中文官网，提供最新版本下载和详细使用教程',
      isPrimary: false,
    },
    {
      domain: 'telegramxzb.com',
      siteName: 'Telegram下载吧',
      siteDescription: 'Telegram官方下载站，支持全平台中文版下载',
      isPrimary: false,
    },
  ]

  // Website 2 的域名配置
  const website2Domains = [
    {
      domain: 'telegramcnfw.com',
      siteName: 'Telegram中文服务',
      siteDescription: 'Telegram中文服务网，提供专业的TG中文版下载和技术支持',
      isPrimary: true,
    },
    {
      domain: 'telegramfuwu.com',
      siteName: 'Telegram服务网',
      siteDescription: 'Telegram官方服务平台，提供中文版下载、教程和技术支持',
      isPrimary: false,
    },
    {
      domain: 'telegramfwfw.com',
      siteName: 'Telegram服务站',
      siteDescription: 'Telegram中文服务站，专注于TG中文版推广和使用指导',
      isPrimary: false,
    },
    {
      domain: 'telegramxzfw.com',
      siteName: 'Telegram下载服务',
      siteDescription: 'Telegram官方下载服务平台，提供全平台中文版下载',
      isPrimary: false,
    },
    {
      domain: 'telegramzhfw.com',
      siteName: 'Telegram中文服务',
      siteDescription: 'Telegram中文服务平台，提供专业的下载和使用指导',
      isPrimary: false,
    },
  ]

  // Website TG 的域名配置
  const websiteTGDomains = [
    {
      domain: 'telegramgzzh.com',
      siteName: 'Telegram官方中文',
      siteDescription: 'Telegram官方中文网，提供最新版本下载和使用教程',
      isPrimary: true,
    },
    {
      domain: 'telegramhnzh.com',
      siteName: 'Telegram中文网',
      siteDescription: 'Telegram中文官网，安全可靠的即时通讯工具',
      isPrimary: false,
    },
    {
      domain: 'telegramjiaoyu.com',
      siteName: 'Telegram教育网',
      siteDescription: 'Telegram使用教程和技巧分享平台',
      isPrimary: false,
    },
    {
      domain: 'xztelegram.com',
      siteName: '下载Telegram',
      siteDescription: 'Telegram官方下载站，支持iOS、Android、Windows、Mac全平台',
      isPrimary: false,
    },
    {
      domain: 'zhxztelegram.com',
      siteName: '中文下载Telegram',
      siteDescription: 'Telegram中文版下载平台，提供安全快速的下载服务',
      isPrimary: false,
    },
  ]

  // Telegram 相关的通用标签
  const primaryTags = [
    'telegram',
    'telegram中文',
    'telegram下载',
    'tg',
    '纸飞机',
  ]

  const secondaryTags = [
    'telegram中文版',
    'telegram官网',
    'telegram安装',
    'telegram教程',
    'telegram使用',
    'tg中文版',
    'tg下载',
    '电报',
    '即时通讯',
    '安全聊天',
  ]

  let createdCount = 0
  let updatedCount = 0
  let errorCount = 0

  // 添加 Website 1 的域名
  console.log('📌 正在配置 Website 1 的域名...')
  for (const domainConfig of website1Domains) {
    try {
      const existing = await prisma.domainAlias.findUnique({
        where: { domain: domainConfig.domain }
      })

      if (existing) {
        await prisma.domainAlias.update({
          where: { domain: domainConfig.domain },
          data: {
            siteName: domainConfig.siteName,
            siteDescription: domainConfig.siteDescription,
            primaryTags,
            secondaryTags,
            isPrimary: domainConfig.isPrimary,
            status: 'ACTIVE',
            websiteId: website1.id,
          }
        })
        console.log(`   ✅ 更新: ${domainConfig.domain}`)
        updatedCount++
      } else {
        await prisma.domainAlias.create({
          data: {
            domain: domainConfig.domain,
            siteName: domainConfig.siteName,
            siteDescription: domainConfig.siteDescription,
            primaryTags,
            secondaryTags,
            isPrimary: domainConfig.isPrimary,
            status: 'ACTIVE',
            websiteId: website1.id,
          }
        })
        console.log(`   ✅ 创建: ${domainConfig.domain}`)
        createdCount++
      }
    } catch (error) {
      console.error(`   ❌ 错误: ${domainConfig.domain} - ${error}`)
      errorCount++
    }
  }
  console.log('')

  // 添加 Website 2 的域名
  console.log('📌 正在配置 Website 2 的域名...')
  for (const domainConfig of website2Domains) {
    try {
      const existing = await prisma.domainAlias.findUnique({
        where: { domain: domainConfig.domain }
      })

      if (existing) {
        await prisma.domainAlias.update({
          where: { domain: domainConfig.domain },
          data: {
            siteName: domainConfig.siteName,
            siteDescription: domainConfig.siteDescription,
            primaryTags,
            secondaryTags,
            isPrimary: domainConfig.isPrimary,
            status: 'ACTIVE',
            websiteId: website2.id,
          }
        })
        console.log(`   ✅ 更新: ${domainConfig.domain}`)
        updatedCount++
      } else {
        await prisma.domainAlias.create({
          data: {
            domain: domainConfig.domain,
            siteName: domainConfig.siteName,
            siteDescription: domainConfig.siteDescription,
            primaryTags,
            secondaryTags,
            isPrimary: domainConfig.isPrimary,
            status: 'ACTIVE',
            websiteId: website2.id,
          }
        })
        console.log(`   ✅ 创建: ${domainConfig.domain}`)
        createdCount++
      }
    } catch (error) {
      console.error(`   ❌ 错误: ${domainConfig.domain} - ${error}`)
      errorCount++
    }
  }
  console.log('')

  // 添加 Website TG 的域名
  console.log('📌 正在配置 Website TG 的域名...')
  for (const domainConfig of websiteTGDomains) {
    try {
      const existing = await prisma.domainAlias.findUnique({
        where: { domain: domainConfig.domain }
      })

      if (existing) {
        await prisma.domainAlias.update({
          where: { domain: domainConfig.domain },
          data: {
            siteName: domainConfig.siteName,
            siteDescription: domainConfig.siteDescription,
            primaryTags,
            secondaryTags,
            isPrimary: domainConfig.isPrimary,
            status: 'ACTIVE',
            websiteId: websiteTG.id,
          }
        })
        console.log(`   ✅ 更新: ${domainConfig.domain}`)
        updatedCount++
      } else {
        await prisma.domainAlias.create({
          data: {
            domain: domainConfig.domain,
            siteName: domainConfig.siteName,
            siteDescription: domainConfig.siteDescription,
            primaryTags,
            secondaryTags,
            isPrimary: domainConfig.isPrimary,
            status: 'ACTIVE',
            websiteId: websiteTG.id,
          }
        })
        console.log(`   ✅ 创建: ${domainConfig.domain}`)
        createdCount++
      }
    } catch (error) {
      console.error(`   ❌ 错误: ${domainConfig.domain} - ${error}`)
      errorCount++
    }
  }
  console.log('')

  // 统计信息
  console.log('═══════════════════════════════════════')
  console.log('🎉 域名配置部署完成！')
  console.log('═══════════════════════════════════════')
  console.log(`📊 统计信息:`)
  console.log(`   新创建: ${createdCount} 个域名`)
  console.log(`   已更新: ${updatedCount} 个域名`)
  console.log(`   失败数: ${errorCount} 个域名`)
  console.log(`   总计: ${createdCount + updatedCount} / 15 个域名`)
  console.log('')

  // 显示域名分配情况
  console.log('📋 域名分配情况:')
  console.log('')
  console.log(`🌐 Website 1: ${website1.name}`)
  const w1Domains = await prisma.domainAlias.findMany({
    where: { websiteId: website1.id },
    orderBy: { isPrimary: 'desc' }
  })
  w1Domains.forEach(d => {
    console.log(`   ${d.isPrimary ? '⭐' : '  '} ${d.domain} - ${d.siteName}`)
  })
  console.log('')

  console.log(`🌐 Website 2: ${website2.name}`)
  const w2Domains = await prisma.domainAlias.findMany({
    where: { websiteId: website2.id },
    orderBy: { isPrimary: 'desc' }
  })
  w2Domains.forEach(d => {
    console.log(`   ${d.isPrimary ? '⭐' : '  '} ${d.domain} - ${d.siteName}`)
  })
  console.log('')

  console.log(`🌐 Website TG: ${websiteTG.name}`)
  const wTGDomains = await prisma.domainAlias.findMany({
    where: { websiteId: websiteTG.id },
    orderBy: { isPrimary: 'desc' }
  })
  wTGDomains.forEach(d => {
    console.log(`   ${d.isPrimary ? '⭐' : '  '} ${d.domain} - ${d.siteName}`)
  })
  console.log('')

  console.log('💡 下一步:')
  console.log('   1. 配置 Nginx 反向代理（参考《域名配置指南.md》）')
  console.log('   2. 申请 SSL 证书（在宝塔面板操作）')
  console.log('   3. 添加 DNS 解析记录')
  console.log('   4. 测试所有域名访问')
  console.log('')
  console.log('📖 详细文档: 域名配置指南.md')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ 部署失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
