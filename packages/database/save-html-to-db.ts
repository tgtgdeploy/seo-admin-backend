/**
 * 从三个 website HTML 文件中提取内容并存储到数据库
 * 存储到 SpiderPoolSource 表中，供蜘蛛池页面生成使用
 */

import * as fs from 'fs'
import * as cheerio from 'cheerio'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// HTML 文件路径配置
const HTML_FILES = [
  {
    name: 'Website-1 电报中文版',
    filePath: '/home/ubuntu/WebstormProjects/seo-website-1/电报中文版 - Telegram官网2.html',
    description: 'Telegram官网 - 电报中文版内容源',
    baseKeywords: ['Telegram', '电报', '电报中文版', 'Telegram中文版', 'TG纸飞机', 'Windows', 'Mac', 'Android', 'iOS']
  },
  {
    name: 'Website-2 纸飞机',
    filePath: '/home/ubuntu/WebstormProjects/seo-website-2/纸飞机3.html',
    description: '纸飞机 - TG飞机下载内容源',
    baseKeywords: ['纸飞机', 'TG飞机', 'Telegram', '电报下载', '安卓版', 'Android', 'Apk', '电脑版', '桌面版']
  },
  {
    name: 'Website-TG 下载站',
    filePath: '/home/ubuntu/WebstormProjects/seo-website-tg/TG中文纸飞机1/Telegram官网 - Telegram下载.html',
    description: 'Telegram下载 - 安全即时通讯内容源',
    baseKeywords: ['Telegram', '电报', 'Telegram下载', '安全即时通讯', '隐私', '端到端加密', '秘密聊天']
  }
]

interface ExtractedContent {
  name: string
  description: string
  filePath: string
  paragraphs: string[]
  headings: string[]
  keywords: string[]
  totalParagraphs: number
  totalHeadings: number
  totalKeywords: number
}

/**
 * 提取单个 HTML 文件的内容
 */
function extractFromHTML(
  filePath: string,
  name: string,
  description: string,
  baseKeywords: string[]
): ExtractedContent {
  console.log(`\n📄 正在处理: ${name}`)
  console.log(`   文件路径: ${filePath}`)

  const html = fs.readFileSync(filePath, 'utf-8')
  const $ = cheerio.load(html)

  // 提取所有段落
  const paragraphs: string[] = []
  $('p, .content p, article p, .post-content p, div p, section p').each((_, el) => {
    const text = $(el).text().trim()
    // 过滤太短的段落和包含太多特殊字符的段落
    if (text.length > 20 && text.length < 1000) {
      paragraphs.push(text)
    }
  })

  // 去重段落
  const uniqueParagraphs = Array.from(new Set(paragraphs))

  // 提取标题
  const headings: string[] = []
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const text = $(el).text().trim()
    if (text.length > 0 && text.length < 200) {
      headings.push(text)
    }
  })

  // 去重标题
  const uniqueHeadings = Array.from(new Set(headings))

  // 从内容中提取额外的关键词
  const contentKeywords = extractKeywordsFromText([...uniqueParagraphs, ...uniqueHeadings].join(' '))

  // 合并基础关键词和提取的关键词
  const allKeywords = Array.from(new Set([...baseKeywords, ...contentKeywords]))

  console.log(`   ✅ 提取完成:`)
  console.log(`      - 段落: ${uniqueParagraphs.length}`)
  console.log(`      - 标题: ${uniqueHeadings.length}`)
  console.log(`      - 关键词: ${allKeywords.length}`)

  return {
    name,
    description,
    filePath,
    paragraphs: uniqueParagraphs,
    headings: uniqueHeadings,
    keywords: allKeywords,
    totalParagraphs: uniqueParagraphs.length,
    totalHeadings: uniqueHeadings.length,
    totalKeywords: allKeywords.length
  }
}

/**
 * 从文本中提取关键词
 */
function extractKeywordsFromText(text: string): string[] {
  // 中文停用词
  const commonWords = [
    '的', '是', '在', '和', '与', '为', '了', '等', '您', '我们', '可以',
    '这个', '那个', '一个', '什么', '怎么', '如何', '就是', '还是', '不是',
    '这样', '那样', '已经', '或者', '但是', '而且', '然后', '所以', '因为',
    '它', '他', '她', '我', '你', '我们', '你们', '他们', '她们'
  ]

  // 提取中文词汇（2-10个字）
  const chineseWords = text.match(/[\u4e00-\u9fa5]{2,10}/g) || []

  // 提取英文单词（3个字母以上）
  const englishWords = text.match(/[a-zA-Z]{3,}/gi) || []

  // 统计词频
  const wordCount = new Map<string, number>()

  chineseWords.forEach(word => {
    if (!commonWords.includes(word)) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    }
  })

  englishWords.forEach(word => {
    const normalized = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    wordCount.set(normalized, (wordCount.get(normalized) || 0) + 1)
  })

  // 返回出现频率最高的前30个关键词
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word]) => word)
}

/**
 * 保存内容到数据库
 */
async function saveToDatabase(content: ExtractedContent) {
  console.log(`\n💾 正在保存到数据库: ${content.name}`)

  try {
    const result = await prisma.spiderPoolSource.upsert({
      where: { name: content.name },
      create: {
        name: content.name,
        description: content.description,
        filePath: content.filePath,
        paragraphs: content.paragraphs,
        headings: content.headings,
        keywords: content.keywords,
        totalParagraphs: content.totalParagraphs,
        totalHeadings: content.totalHeadings,
        totalKeywords: content.totalKeywords,
        status: 'ACTIVE',
        isActive: true
      },
      update: {
        description: content.description,
        filePath: content.filePath,
        paragraphs: content.paragraphs,
        headings: content.headings,
        keywords: content.keywords,
        totalParagraphs: content.totalParagraphs,
        totalHeadings: content.totalHeadings,
        totalKeywords: content.totalKeywords,
        status: 'ACTIVE',
        isActive: true
      }
    })

    console.log(`   ✅ 保存成功 (ID: ${result.id})`)
    return result
  } catch (error) {
    console.error(`   ❌ 保存失败:`, error)
    throw error
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🕷️  开始从HTML文件提取内容并存储到数据库...')
  console.log('=' .repeat(60))

  const results = []

  for (const file of HTML_FILES) {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(file.filePath)) {
        console.error(`\n❌ 文件不存在: ${file.filePath}`)
        continue
      }

      // 提取内容
      const content = extractFromHTML(
        file.filePath,
        file.name,
        file.description,
        file.baseKeywords
      )

      // 保存到数据库
      const result = await saveToDatabase(content)
      results.push(result)
    } catch (error) {
      console.error(`\n❌ 处理 ${file.name} 失败:`, error)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 汇总统计:')
  console.log(`   - 成功处理: ${results.length}/${HTML_FILES.length} 个文件`)
  console.log(`   - 总段落数: ${results.reduce((sum, r) => sum + r.totalParagraphs, 0)}`)
  console.log(`   - 总标题数: ${results.reduce((sum, r) => sum + r.totalHeadings, 0)}`)
  console.log(`   - 总关键词: ${results.reduce((sum, r) => sum + r.totalKeywords, 0)}`)

  console.log('\n✅ 所有内容已成功存储到数据库！')
  console.log('\n📋 下一步:')
  console.log('   1. 使用这些内容源生成蜘蛛池页面')
  console.log('   2. 在管理后台查看内容源: /spider-pool/sources')
  console.log('   3. 运行蜘蛛池页面生成脚本')
}

// 执行主函数
main()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (error) => {
    console.error('\n❌ 执行失败:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
