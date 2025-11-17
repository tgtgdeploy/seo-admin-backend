#!/usr/bin/env node

/**
 * 部署后验证脚本
 * 验证 Prisma Client 和数据库连接是否正常
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('========================================')
  console.log('🔍 开始验证部署结果...')
  console.log('========================================\n')

  try {
    // 1. 测试数据库连接
    console.log('1️⃣  测试数据库连接...')
    await prisma.$queryRaw`SELECT 1`
    console.log('   ✅ 数据库连接正常\n')

    // 2. 验证 domainType 列是否可访问
    console.log('2️⃣  验证 domainType 字段...')
    const testDomain = await prisma.domainAlias.findFirst({
      select: {
        domain: true,
        domainType: true,
        siteName: true
      }
    })

    if (testDomain) {
      console.log(`   ✅ domainType 字段正常: ${testDomain.domain} [${testDomain.domainType}]\n`)
    } else {
      console.log('   ⚠️  数据库中暂无域名数据\n')
    }

    // 3. 统计活跃域名
    console.log('3️⃣  统计活跃域名...')
    const domainStats = await prisma.domainAlias.groupBy({
      by: ['domainType'],
      where: { status: 'ACTIVE' },
      _count: true
    })

    if (domainStats.length > 0) {
      console.log('   域名类型分布:')
      const labels = {
        'MAIN_SITE': '主站点',
        'REDIRECT_PAGE': '跳转页',
        'SPIDER_POOL': '蜘蛛池'
      }
      domainStats.forEach(stat => {
        console.log(`   - ${labels[stat.domainType]}: ${stat._count} 个`)
      })

      const totalCount = domainStats.reduce((sum, stat) => sum + stat._count, 0)
      console.log(`   ✅ 总计 ${totalCount} 个活跃域名\n`)
    } else {
      console.log('   ⚠️  没有找到活跃域名\n')
    }

    // 4. 列出所有活跃域名
    console.log('4️⃣  活跃域名列表:')
    const domains = await prisma.domainAlias.findMany({
      where: { status: 'ACTIVE' },
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

    if (domains.length > 0) {
      let currentType = null
      domains.forEach(d => {
        if (d.domainType !== currentType) {
          currentType = d.domainType
          const typeLabels = {
            'MAIN_SITE': '【主站点】',
            'REDIRECT_PAGE': '【跳转页】',
            'SPIDER_POOL': '【蜘蛛池】'
          }
          console.log(`\n   ${typeLabels[d.domainType]}`)
        }
        const primaryMark = d.isPrimary ? ' ⭐ 主域名' : ''
        console.log(`   - ${d.domain} (${d.siteName})${primaryMark}`)
      })
      console.log('')
    }

    // 5. 验证网站数据
    console.log('5️⃣  验证网站配置...')
    const websiteCount = await prisma.website.count({
      where: { status: 'ACTIVE' }
    })
    console.log(`   ✅ 活跃网站: ${websiteCount} 个\n`)

    // 6. 检查蜘蛛池页面
    console.log('6️⃣  检查蜘蛛池页面...')
    const spiderPoolPages = await prisma.spiderPoolPage.count()
    if (spiderPoolPages > 0) {
      console.log(`   ✅ 蜘蛛池页面: ${spiderPoolPages} 个\n`)
    } else {
      console.log('   ℹ️  尚未生成蜘蛛池页面\n')
    }

    console.log('========================================')
    console.log('✅ 验证完成！所有检查通过！')
    console.log('========================================\n')

    console.log('📝 后续步骤:')
    console.log('   1. 访问 SEO 健康度页面:')
    console.log('      https://adminseohub.xyz/seo-dashboard')
    console.log('')
    console.log('   2. 访问 AI SEO 工具:')
    console.log('      https://adminseohub.xyz/ai-seo-tools')
    console.log('')
    console.log('   3. 查看 PM2 日志确认无错误:')
    console.log('      pm2 logs seo-admin --lines 50')
    console.log('')

  } catch (error) {
    console.error('\n❌ 验证失败!')
    console.error('错误信息:', error.message)

    if (error.code === 'P2022') {
      console.error('\n⚠️  Prisma Client 仍然存在缓存问题!')
      console.error('请尝试以下步骤:')
      console.error('  1. rm -rf node_modules/@prisma node_modules/.prisma')
      console.error('  2. cd packages/database && npx prisma generate')
      console.error('  3. cd ../.. && pnpm build')
      console.error('  4. pm2 restart seo-admin')
    } else if (error.code === 'P1001') {
      console.error('\n⚠️  无法连接到数据库!')
      console.error('请检查 .env 文件中的 DATABASE_URL 配置')
    }

    process.exit(1)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
