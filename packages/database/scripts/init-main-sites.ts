#!/usr/bin/env tsx

/**
 * 初始化3个主站点和域名配置
 *
 * 主站点:
 * 1. telegramtghub.com (seo-website-1)
 * 2. telegramupdatecenter.com (seo-website-2)
 * 3. telegramtrendguide.com (seo-website-tg)
 *
 * 跳转域名:
 * - globalinsighthub.xyz → telegramtghub.com
 * - infostreammedia.xyz → telegramupdatecenter.com
 *
 * 旧域名已废弃: telegram1688.com, telegram2688.com, telegramcnfw.com
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MAIN_SITES = [
  {
    id: 'seo-website-1',
    name: 'Telegram Hub',
    domain: 'telegramtghub.com',
    description: 'Telegram资源中心 - 提供Telegram相关的综合性资源和信息',
    primaryDomain: {
      domain: 'telegramtghub.com',
      siteName: 'Telegram Hub',
      siteDescription: 'Telegram资源聚合中心，提供最全面的Telegram资讯、教程和资源',
      primaryTags: ['telegram', 'telegram资源', 'telegram中文', 'telegram hub'],
      secondaryTags: ['telegram下载', 'telegram使用', 'telegram群组'],
    },
    redirectDomain: {
      domain: 'globalinsighthub.xyz',
      siteName: 'Global Insight Hub',
      siteDescription: '跳转到 Telegram Hub 主站',
      status: 'REDIRECT' as const,
    },
  },
  {
    id: 'seo-website-2',
    name: 'Telegram Update Center',
    domain: 'telegramupdatecenter.com',
    description: 'Telegram更新中心 - 追踪Telegram最新动态和功能更新',
    primaryDomain: {
      domain: 'telegramupdatecenter.com',
      siteName: 'Telegram Update Center',
      siteDescription: 'Telegram官方更新追踪中心，第一时间获取Telegram最新功能和更新',
      primaryTags: ['telegram更新', 'telegram新功能', 'telegram news', 'telegram版本'],
      secondaryTags: ['telegram更新日志', 'telegram新版本', 'telegram changelog'],
    },
    redirectDomain: {
      domain: 'infostreammedia.xyz',
      siteName: 'Info Stream Media',
      siteDescription: '跳转到 Telegram Update Center 主站',
      status: 'REDIRECT' as const,
    },
  },
  {
    id: 'seo-website-tg',
    name: 'Telegram Trend Guide',
    domain: 'telegramtrendguide.com',
    description: 'Telegram趋势指南 - Telegram使用技巧和行业趋势分析',
    primaryDomain: {
      domain: 'telegramtrendguide.com',
      siteName: 'Telegram Trend Guide',
      siteDescription: 'Telegram使用技巧和趋势分析，提供最专业的Telegram教程和指南',
      primaryTags: ['telegram教程', 'telegram技巧', 'telegram指南', 'telegram趋势'],
      secondaryTags: ['telegram使用教程', 'telegram攻略', 'telegram设置'],
    },
    // 暂无跳转域名
    redirectDomain: null,
  },
]

async function main() {
  console.log('🚀 开始初始化主站点...\n')

  for (const site of MAIN_SITES) {
    console.log(`\n📦 处理站点: ${site.name} (${site.domain})`)

    // 检查网站是否已存在
    let website = await prisma.website.findFirst({
      where: { domain: site.domain },
    })

    if (website) {
      console.log(`  ✓ 网站已存在: ${website.name}`)
    } else {
      // 创建网站
      website = await prisma.website.create({
        data: {
          name: site.name,
          domain: site.domain,
          status: 'ACTIVE',
          description: site.description,
          seoKeywords: site.primaryDomain.primaryTags,
        },
      })
      console.log(`  ✓ 创建网站: ${website.name}`)
    }

    // 检查主域名是否已存在
    let primaryDomain = await prisma.domainAlias.findFirst({
      where: {
        websiteId: website.id,
        domain: site.primaryDomain.domain,
      },
    })

    if (primaryDomain) {
      console.log(`  ✓ 主域名已存在: ${primaryDomain.domain}`)
    } else {
      // 创建主域名
      primaryDomain = await prisma.domainAlias.create({
        data: {
          websiteId: website.id,
          domain: site.primaryDomain.domain,
          siteName: site.primaryDomain.siteName,
          siteDescription: site.primaryDomain.siteDescription,
          isPrimary: true,
          status: 'ACTIVE',
          primaryTags: site.primaryDomain.primaryTags,
          secondaryTags: site.primaryDomain.secondaryTags,
        },
      })
      console.log(`  ✓ 创建主域名: ${primaryDomain.domain}`)
    }

    // 检查跳转域名是否已存在（如果有配置）
    if (site.redirectDomain) {
      let redirectDomain = await prisma.domainAlias.findFirst({
        where: {
          websiteId: website.id,
          domain: site.redirectDomain.domain,
        },
      })

      if (redirectDomain) {
        console.log(`  ✓ 跳转域名已存在: ${redirectDomain.domain}`)
      } else {
        // 创建跳转域名
        redirectDomain = await prisma.domainAlias.create({
          data: {
            websiteId: website.id,
            domain: site.redirectDomain.domain,
            siteName: site.redirectDomain.siteName,
            siteDescription: site.redirectDomain.siteDescription,
            isPrimary: false,
            status: site.redirectDomain.status,
            primaryTags: [],
            secondaryTags: [],
          },
        })
        console.log(`  ✓ 创建跳转域名: ${redirectDomain.domain}`)
      }
    } else {
      console.log(`  ℹ️  该站点暂无跳转域名`)
    }

    console.log(`  ✅ ${site.name} 配置完成\n`)
  }

  // 显示统计信息
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 配置总结')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const totalWebsites = await prisma.website.count()
  const totalDomains = await prisma.domainAlias.count()
  const activeDomains = await prisma.domainAlias.count({
    where: { status: 'ACTIVE' },
  })
  const redirectDomains = await prisma.domainAlias.count({
    where: { status: 'REDIRECT' },
  })

  console.log(`总网站数: ${totalWebsites}`)
  console.log(`总域名数: ${totalDomains}`)
  console.log(`  - 活跃域名: ${activeDomains}`)
  console.log(`  - 跳转域名: ${redirectDomains}`)

  console.log('\n🎉 初始化完成！\n')

  console.log('📋 下一步操作:')
  console.log('1. 在Vercel创建3个项目，分别绑定主域名')
  console.log('2. 配置DNS记录指向Vercel')
  console.log('3. 在Vercel项目中添加跳转域名')
  console.log('4. 配置301重定向（vercel.json或middleware）')
  console.log('5. 部署蜘蛛池到VPS')
  console.log('6. 运行 npm run spider-pool:init 初始化蜘蛛池\n')

  console.log('📄 详细文档: MULTI_SITE_ARCHITECTURE.md\n')
}

main()
  .catch((error) => {
    console.error('❌ 初始化失败:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
