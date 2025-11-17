#!/usr/bin/env tsx
/**
 * 重新生成优化后的蜘蛛池页面 (TypeScript版本)
 */

import { PrismaClient } from '@repo/database'
import spiderPoolService from '@repo/database/src/services/spider-pool.service'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 开始重新生成优化后的蜘蛛池页面...\n')

  try {
    // 1. 初始化内容源
    console.log('📚 步骤 1/3: 初始化内容源...')
    await spiderPoolService.initializeContentSources()
    console.log('✅ 内容源初始化完成\n')

    // 2. 获取所有蜘蛛池域名
    console.log('🔍 步骤 2/3: 查找蜘蛛池域名...')
    const spiderDomains = await prisma.domainAlias.findMany({
      where: {
        domainType: 'SPIDER_POOL',
        status: 'ACTIVE',
      },
      include: {
        website: true,
      }
    })

    console.log(`   找到 ${spiderDomains.length} 个蜘蛛池域名\n`)

    if (spiderDomains.length === 0) {
      console.log('⚠️  没有找到蜘蛛池域名，请先在后台配置域名')
      console.log('   域名类型应为: SPIDER_POOL')
      console.log('   域名状态应为: ACTIVE')
      return
    }

    // 3. 为每个域名重新生成页面
    console.log('📄 步骤 3/3: 重新生成蜘蛛池页面...\n')

    // 主题映射
    const themeMap: Record<string, string> = {
      'autopushnetwork.xyz': 'auto',
      'contentpoolzone.site': 'content',
      'crawlboostnet.xyz': 'crawl',
      'crawlenginepro.xyz': 'engine',
      'linkpushmatrix.site': 'link',
      'rankspiderchain.xyz': 'rank',
      'seohubnetwork.xyz': 'seo',
      'spidertrackzone.xyz': 'track',
      'trafficboostflow.site': 'traffic',
    }

    let successCount = 0
    let failCount = 0

    for (const domain of spiderDomains) {
      const theme = themeMap[domain.domain] || 'seo'

      console.log(`\n🌐 处理: ${domain.domain}`)
      console.log(`   网站: ${domain.website?.name || '未指定'}`)
      console.log(`   主题: ${theme}`)

      try {
        await spiderPoolService.generateSpiderPoolPages(
          domain.id,
          theme,
          150 // 每个域名150个页面
        )

        successCount++
        console.log(`   ✅ 完成！`)
      } catch (error) {
        failCount++
        console.error(`   ❌ 失败:`, error instanceof Error ? error.message : error)
      }
    }

    // 4. 生成总结
    console.log('\n' + '='.repeat(60))
    console.log('📊 生成总结')
    console.log('='.repeat(60))
    console.log(`✅ 成功: ${successCount} 个域名`)
    console.log(`❌ 失败: ${failCount} 个域名`)
    console.log(`📄 总页面数: ${successCount * 150}`)

    console.log('\n🎉 优化完成！')
    console.log('\n下一步:')
    console.log('1. 检查数据库中的页面数据')
    console.log('2. 测试API端点: https://adminseohub.xyz/api/p/[domain]?slug=page-0001')
    console.log('3. 如果使用静态部署，运行部署脚本同步到VPS')

  } catch (error) {
    console.error('❌ 执行失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
