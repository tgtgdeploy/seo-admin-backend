/**
 * 验证蜘蛛池内容源是否正确存储到数据库
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  console.log('🔍 正在查询数据库中的蜘蛛池内容源...\n')

  try {
    const sources = await prisma.spiderPoolSource.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ 找到 ${sources.length} 个内容源\n`)
    console.log('=' .repeat(80))

    sources.forEach((source, index) => {
      console.log(`\n📦 内容源 #${index + 1}:`)
      console.log(`   ID: ${source.id}`)
      console.log(`   名称: ${source.name}`)
      console.log(`   描述: ${source.description || '无'}`)
      console.log(`   文件路径: ${source.filePath || '无'}`)
      console.log(`   状态: ${source.status} (激活: ${source.isActive ? '是' : '否'})`)
      console.log(`\n   📊 统计:`)
      console.log(`      - 段落数: ${source.totalParagraphs} (实际: ${source.paragraphs.length})`)
      console.log(`      - 标题数: ${source.totalHeadings} (实际: ${source.headings.length})`)
      console.log(`      - 关键词: ${source.totalKeywords} (实际: ${source.keywords.length})`)
      console.log(`\n   🏷️  关键词预览 (前10个):`)
      console.log(`      ${source.keywords.slice(0, 10).join(', ')}`)
      console.log(`\n   📝 段落预览 (前2个):`)
      source.paragraphs.slice(0, 2).forEach((p, i) => {
        const preview = p.length > 100 ? p.substring(0, 100) + '...' : p
        console.log(`      ${i + 1}. ${preview}`)
      })
      console.log(`\n   📑 标题预览 (前5个):`)
      source.headings.slice(0, 5).forEach((h, i) => {
        console.log(`      ${i + 1}. ${h}`)
      })
      console.log(`\n   ⏰ 时间:`)
      console.log(`      创建: ${source.createdAt.toLocaleString('zh-CN')}`)
      console.log(`      更新: ${source.updatedAt.toLocaleString('zh-CN')}`)
      if (source.lastUsed) {
        console.log(`      最后使用: ${source.lastUsed.toLocaleString('zh-CN')}`)
      }
      console.log('\n' + '-'.repeat(80))
    })

    console.log('\n' + '='.repeat(80))
    console.log('📊 汇总:')
    console.log(`   - 总内容源: ${sources.length}`)
    console.log(`   - 激活状态: ${sources.filter(s => s.isActive).length}`)
    console.log(`   - 总段落数: ${sources.reduce((sum, s) => sum + s.totalParagraphs, 0)}`)
    console.log(`   - 总标题数: ${sources.reduce((sum, s) => sum + s.totalHeadings, 0)}`)
    console.log(`   - 总关键词: ${sources.reduce((sum, s) => sum + s.totalKeywords, 0)}`)
    console.log('\n✅ 验证完成！数据已正确存储到数据库。')
  } catch (error) {
    console.error('❌ 查询失败:', error)
    throw error
  }
}

verify()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (error) => {
    console.error('执行失败:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
