/**
 * 修复域名的 primaryTags 配置
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixDomainTags() {
  console.log('\n🔧 修复域名 primaryTags 配置\n')
  console.log('='.repeat(70))

  // 修复 telegram1688.com
  const telegram1688 = await prisma.domainAlias.findFirst({
    where: { domain: 'telegram1688.com' }
  })

  if (telegram1688 && telegram1688.primaryTags.length === 0) {
    await prisma.domainAlias.update({
      where: { id: telegram1688.id },
      data: {
        siteName: 'Telegram1688 - TG中文纸飞机官网',
        siteDescription: 'Telegram1688提供最新TG中文版下载、使用教程和功能介绍，支持全平台安装',
        primaryTags: ['telegram', 'tg', '官网', '中文版'],
        secondaryTags: ['下载', '教程', '纸飞机', '安装', '注册'],
        isPrimary: true,
      }
    })
    console.log('✅ 已修复 telegram1688.com 的标签配置')
  }

  // 检查并显示所有域名配置
  const allDomains = await prisma.domainAlias.findMany({
    where: {
      domain: {
        contains: 'telegram'
      }
    },
    orderBy: {
      domain: 'asc'
    }
  })

  console.log('\n📋 Telegram 相关域名配置：\n')
  allDomains.forEach(d => {
    const primary = d.isPrimary ? '[主]' : '   '
    const tags = d.primaryTags.length > 0 ? d.primaryTags.join(', ') : '⚠️  无标签'
    console.log(`${primary} ${d.domain}`)
    console.log(`    标签: ${tags}`)
    console.log(`    标题: ${d.siteName}`)
    console.log()
  })

  console.log('='.repeat(70))
}

async function main() {
  try {
    await fixDomainTags()
  } catch (error) {
    console.error('❌ 执行出错:', error)
    process.exit(1)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
