/**
 * 蜘蛛池初始化脚本
 * 一键完成：
 * 1. 初始化内容源
 * 2. 创建9个蜘蛛池域名
 * 3. 生成所有页面
 */

import { PrismaClient } from '@prisma/client'
import spiderPoolService from '../src/services/spider-pool.service'

const prisma = new PrismaClient()

// 9个蜘蛛池域名配置
const SPIDER_DOMAINS = [
  // VPS 1
  {
    domain: 'autopushnetwork.xyz',
    siteName: '自动化推送网络',
    siteDescription: 'Telegram自动化推送解决方案',
    theme: 'auto',
    primaryTags: ['Telegram', '自动化', '推送'],
    secondaryTags: ['营销', '工具', 'SEO'],
  },
  {
    domain: 'contentpoolzone.site',
    siteName: '内容池专区',
    siteDescription: 'Telegram内容管理与优化平台',
    theme: 'content',
    primaryTags: ['内容', '优化', 'Telegram'],
    secondaryTags: ['管理', '营销', 'SEO'],
  },
  {
    domain: 'crawlboostnet.xyz',
    siteName: '爬虫优化网络',
    siteDescription: 'Telegram SEO爬虫优化专家',
    theme: 'crawl',
    primaryTags: ['爬虫', 'SEO', 'Telegram'],
    secondaryTags: ['优化', '收录', '索引'],
  },

  // VPS 2
  {
    domain: 'crawlenginepro.xyz',
    siteName: '搜索引擎专家',
    siteDescription: 'Telegram搜索引擎优化服务',
    theme: 'engine',
    primaryTags: ['搜索引擎', 'SEO', 'Telegram'],
    secondaryTags: ['优化', '排名', 'Google'],
  },
  {
    domain: 'linkpushmatrix.site',
    siteName: '链接推送矩阵',
    siteDescription: 'Telegram外链建设与推送平台',
    theme: 'link',
    primaryTags: ['外链', '链接', 'Telegram'],
    secondaryTags: ['建设', 'SEO', '优化'],
  },
  {
    domain: 'rankspiderchain.xyz',
    siteName: '排名蜘蛛链',
    siteDescription: 'Telegram排名提升蜘蛛池',
    theme: 'rank',
    primaryTags: ['排名', '蜘蛛池', 'Telegram'],
    secondaryTags: ['提升', 'SEO', '优化'],
  },

  // VPS 3
  {
    domain: 'seohubnetwork.xyz',
    siteName: 'SEO中心网络',
    siteDescription: 'Telegram SEO优化中心',
    theme: 'seo',
    primaryTags: ['SEO', '优化', 'Telegram'],
    secondaryTags: ['排名', '收录', '流量'],
  },
  {
    domain: 'spidertrackzone.xyz',
    siteName: '蜘蛛追踪区',
    siteDescription: 'Telegram爬虫数据追踪分析',
    theme: 'track',
    primaryTags: ['追踪', '分析', 'Telegram'],
    secondaryTags: ['数据', '爬虫', 'SEO'],
  },
  {
    domain: 'trafficboostflow.site',
    siteName: '流量增长平台',
    siteDescription: 'Telegram流量增长解决方案',
    theme: 'traffic',
    primaryTags: ['流量', '增长', 'Telegram'],
    secondaryTags: ['优化', 'SEO', '推广'],
  },
]

async function main() {
  console.log('🕷️  蜘蛛池系统初始化开始...\n')

  // 步骤1: 查找或创建主网站
  console.log('📊 步骤1: 检查主网站...')

  let mainWebsite = await prisma.website.findFirst({
    where: {
      OR: [
        { domain: 'telegramtghub.com' },
        { domain: 'adminseohub.xyz' }
      ]
    }
  })

  if (!mainWebsite) {
    console.log('  创建主网站记录...')
    mainWebsite = await prisma.website.create({
      data: {
        name: 'Telegram Hub',
        domain: 'telegramtghub.com',
        description: 'Telegram资源聚合中心',
        status: 'ACTIVE',
        seoKeywords: ['Telegram', 'telegram资源', 'telegram中文', 'telegram hub'],
        isActive: true,
        apiEnabled: true,
      }
    })
  }

  console.log(`  ✓ 主网站: ${mainWebsite.name} (${mainWebsite.domain})`)

  // 步骤2: 初始化内容源
  console.log('\n📝 步骤2: 初始化内容源...')
  await spiderPoolService.initializeContentSources()

  const sources = await prisma.spiderPoolSource.count()
  console.log(`  ✓ 内容源数量: ${sources}`)

  // 步骤3: 创建蜘蛛池域名
  console.log('\n🌐 步骤3: 创建蜘蛛池域名...')

  for (const config of SPIDER_DOMAINS) {
    const existing = await prisma.domainAlias.findUnique({
      where: { domain: config.domain }
    })

    if (existing) {
      console.log(`  ⊙ ${config.domain} 已存在，跳过`)
      continue
    }

    await prisma.domainAlias.create({
      data: {
        domain: config.domain,
        siteName: config.siteName,
        siteDescription: config.siteDescription,
        primaryTags: config.primaryTags,
        secondaryTags: config.secondaryTags,
        status: 'ACTIVE',
        isPrimary: false,
        websiteId: mainWebsite.id,
      }
    })

    console.log(`  ✓ ${config.domain} - ${config.siteName}`)
  }

  // 步骤4: 生成蜘蛛池页面
  console.log('\n📄 步骤4: 生成蜘蛛池页面...')

  for (const config of SPIDER_DOMAINS) {
    const domainAlias = await prisma.domainAlias.findUnique({
      where: { domain: config.domain }
    })

    if (!domainAlias) {
      console.log(`  ⚠️  ${config.domain} 不存在，跳过`)
      continue
    }

    const existingPages = await prisma.spiderPoolPage.count({
      where: { domainAliasId: domainAlias.id }
    })

    if (existingPages > 0) {
      console.log(`  ⊙ ${config.domain} 已有 ${existingPages} 个页面，跳过`)
      continue
    }

    await spiderPoolService.generateSpiderPoolPages(
      domainAlias.id,
      config.theme,
      150
    )
  }

  // 步骤5: 显示统计
  console.log('\n📊 步骤5: 统计结果...')

  const [totalDomains, totalPages, totalSources] = await Promise.all([
    prisma.domainAlias.count({ where: { status: 'ACTIVE' } }),
    prisma.spiderPoolPage.count({ where: { status: 'ACTIVE' } }),
    prisma.spiderPoolSource.count({ where: { isActive: true } }),
  ])

  console.log(`  - 蜘蛛池域名: ${totalDomains}`)
  console.log(`  - 蜘蛛池页面: ${totalPages}`)
  console.log(`  - 内容源: ${totalSources}`)

  console.log('\n🎉 蜘蛛池系统初始化完成！')
  console.log('\n下一步:')
  console.log('  1. 配置DNS解析，将9个域名指向VPS')
  console.log('  2. 在VPS上配置Nginx反向代理')
  console.log('  3. 申请SSL证书')
  console.log('  4. 提交sitemap到搜索引擎')
  console.log('\n详细文档请查看: DYNAMIC_SPIDER_POOL.md')
}

main()
  .catch((error) => {
    console.error('❌ 初始化失败:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
