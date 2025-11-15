/**
 * HTML 关键词提取工具
 *
 * 功能：
 * 1. 从 HTML 文件中提取关键词
 * 2. 分析关键词密度和重要性
 * 3. 生成 SEO 建议
 *
 * 使用方法：
 * dotenv -e ../../.env.local -- npx tsx extract-keywords-from-html.ts <html-file-path>
 */

import * as fs from 'fs'
import * as path from 'path'

interface KeywordInfo {
  keyword: string
  count: number
  density: number  // 密度百分比
  locations: string[]  // 出现的位置 (title, meta, h1, h2, body等)
}

interface SEOAnalysis {
  totalWords: number
  uniqueWords: number
  keywords: KeywordInfo[]
  metaKeywords: string[]
  metaDescription: string | null
  title: string | null
  headings: {
    h1: string[]
    h2: string[]
    h3: string[]
  }
  recommendations: string[]
}

// 中文分词简单实现（基于常见词长度）
function simpleChineseTokenize(text: string): string[] {
  // 移除HTML标签
  text = text.replace(/<[^>]+>/g, ' ')
  // 移除特殊字符，保留中文、英文和数字
  text = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
  // 转换为小写
  text = text.toLowerCase()

  const words: string[] = []

  // 提取英文单词
  const englishWords = text.match(/[a-z]+/g) || []
  words.push(...englishWords)

  // 简单的中文分词：提取2-4个字的词组
  const chineseText = text.replace(/[a-z0-9\s]/g, '')
  for (let len = 4; len >= 2; len--) {
    for (let i = 0; i <= chineseText.length - len; i++) {
      const word = chineseText.substring(i, i + len)
      if (word.length === len) {
        words.push(word)
      }
    }
  }

  return words
}

// 停用词列表（常见的无意义词）
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has',
  'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may',
  '的', '了', '和', '是', '在', '有', '我', '你', '他', '她', '它',
  '们', '这', '那', '什么', '怎么', '为什么', '吗', '呢', '啊',
])

function extractKeywords(html: string): SEOAnalysis {
  const analysis: SEOAnalysis = {
    totalWords: 0,
    uniqueWords: 0,
    keywords: [],
    metaKeywords: [],
    metaDescription: null,
    title: null,
    headings: {
      h1: [],
      h2: [],
      h3: [],
    },
    recommendations: [],
  }

  // 提取 title
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
  if (titleMatch) {
    analysis.title = titleMatch[1].trim()
  }

  // 提取 meta keywords
  const metaKeywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["']/i)
  if (metaKeywordsMatch) {
    analysis.metaKeywords = metaKeywordsMatch[1].split(',').map(k => k.trim()).filter(Boolean)
  }

  // 提取 meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
  if (metaDescMatch) {
    analysis.metaDescription = metaDescMatch[1].trim()
  }

  // 提取标题
  const h1Matches = html.match(/<h1[^>]*>(.*?)<\/h1>/gi) || []
  analysis.headings.h1 = h1Matches.map(h => h.replace(/<[^>]+>/g, '').trim())

  const h2Matches = html.match(/<h2[^>]*>(.*?)<\/h2>/gi) || []
  analysis.headings.h2 = h2Matches.map(h => h.replace(/<[^>]+>/g, '').trim())

  const h3Matches = html.match(/<h3[^>]*>(.*?)<\/h3>/gi) || []
  analysis.headings.h3 = h3Matches.map(h => h.replace(/<[^>]+>/g, '').trim())

  // 提取body文本
  const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/is)
  const bodyText = bodyMatch ? bodyMatch[1] : html

  // 分词
  const allWords = simpleChineseTokenize(bodyText)
  const filteredWords = allWords.filter(word =>
    word.length > 1 && !STOP_WORDS.has(word)
  )

  analysis.totalWords = filteredWords.length
  analysis.uniqueWords = new Set(filteredWords).size

  // 统计词频和位置
  const wordCount: Map<string, { count: number; locations: Set<string> }> = new Map()

  filteredWords.forEach(word => {
    if (!wordCount.has(word)) {
      wordCount.set(word, { count: 0, locations: new Set() })
    }
    wordCount.get(word)!.count++
    wordCount.get(word)!.locations.add('body')
  })

  // 标记title中的关键词
  if (analysis.title) {
    simpleChineseTokenize(analysis.title).forEach(word => {
      if (word.length > 1 && !STOP_WORDS.has(word)) {
        if (!wordCount.has(word)) {
          wordCount.set(word, { count: 0, locations: new Set() })
        }
        wordCount.get(word)!.locations.add('title')
      }
    })
  }

  // 标记meta keywords中的关键词
  analysis.metaKeywords.forEach(keyword => {
    const words = simpleChineseTokenize(keyword)
    words.forEach(word => {
      if (!wordCount.has(word)) {
        wordCount.set(word, { count: 0, locations: new Set() })
      }
      wordCount.get(word)!.locations.add('meta-keywords')
    })
  })

  // 标记h1中的关键词
  analysis.headings.h1.forEach(h1 => {
    simpleChineseTokenize(h1).forEach(word => {
      if (word.length > 1 && !STOP_WORDS.has(word)) {
        if (!wordCount.has(word)) {
          wordCount.set(word, { count: 0, locations: new Set() })
        }
        wordCount.get(word)!.locations.add('h1')
      }
    })
  })

  // 标记h2中的关键词
  analysis.headings.h2.forEach(h2 => {
    simpleChineseTokenize(h2).forEach(word => {
      if (word.length > 1 && !STOP_WORDS.has(word)) {
        if (!wordCount.has(word)) {
          wordCount.set(word, { count: 0, locations: new Set() })
        }
        wordCount.get(word)!.locations.add('h2')
      }
    })
  })

  // 转换为 KeywordInfo 数组
  const keywords: KeywordInfo[] = []
  wordCount.forEach((info, word) => {
    keywords.push({
      keyword: word,
      count: info.count,
      density: (info.count / analysis.totalWords) * 100,
      locations: Array.from(info.locations),
    })
  })

  // 按出现次数排序
  keywords.sort((a, b) => b.count - a.count)

  // 只保留前50个关键词
  analysis.keywords = keywords.slice(0, 50)

  // 生成SEO建议
  generateRecommendations(analysis)

  return analysis
}

function generateRecommendations(analysis: SEOAnalysis) {
  const recommendations: string[] = []

  // 检查title
  if (!analysis.title) {
    recommendations.push('❌ 缺少 <title> 标签')
  } else if (analysis.title.length < 30) {
    recommendations.push('⚠️  标题太短（建议 30-60 字符）')
  } else if (analysis.title.length > 60) {
    recommendations.push('⚠️  标题太长（建议 30-60 字符）')
  }

  // 检查 meta description
  if (!analysis.metaDescription) {
    recommendations.push('❌ 缺少 meta description')
  } else if (analysis.metaDescription.length < 100) {
    recommendations.push('⚠️  描述太短（建议 100-160 字符）')
  } else if (analysis.metaDescription.length > 160) {
    recommendations.push('⚠️  描述太长（建议 100-160 字符）')
  }

  // 检查 meta keywords
  if (analysis.metaKeywords.length === 0) {
    recommendations.push('⚠️  建议添加 meta keywords（虽然搜索引擎已不太重视）')
  }

  // 检查 h1
  if (analysis.headings.h1.length === 0) {
    recommendations.push('❌ 缺少 <h1> 标签')
  } else if (analysis.headings.h1.length > 1) {
    recommendations.push('⚠️  建议每页只使用一个 <h1> 标签')
  }

  // 检查关键词密度
  const topKeywords = analysis.keywords.slice(0, 5)
  topKeywords.forEach(kw => {
    if (kw.density > 5) {
      recommendations.push(`⚠️  关键词 "${kw.keyword}" 密度过高 (${kw.density.toFixed(2)}%)，可能被视为关键词堆砌`)
    }
  })

  // 检查title和body关键词的一致性
  const titleKeywords = new Set(analysis.title ? simpleChineseTokenize(analysis.title) : [])
  const topBodyKeywords = new Set(analysis.keywords.slice(0, 10).map(k => k.keyword))
  const intersection = Array.from(titleKeywords).filter(k => topBodyKeywords.has(k))

  if (intersection.length === 0 && analysis.title) {
    recommendations.push('⚠️  标题中的关键词与页面主要内容不匹配')
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ SEO 优化良好！')
  }

  analysis.recommendations = recommendations
}

function printAnalysis(analysis: SEOAnalysis) {
  console.log('\n' + '='.repeat(70))
  console.log('📊 HTML SEO 关键词分析报告')
  console.log('='.repeat(70) + '\n')

  console.log('📄 基本信息')
  console.log('-'.repeat(70))
  console.log(`标题: ${analysis.title || '(无)'}`)
  console.log(`描述: ${analysis.metaDescription || '(无)'}`)
  console.log(`Meta 关键词: ${analysis.metaKeywords.join(', ') || '(无)'}`)
  console.log(`总词数: ${analysis.totalWords}`)
  console.log(`不重复词数: ${analysis.uniqueWords}\n`)

  console.log('🏷️  标题结构')
  console.log('-'.repeat(70))
  console.log(`H1 (${analysis.headings.h1.length}): ${analysis.headings.h1.join(' | ')}`)
  console.log(`H2 (${analysis.headings.h2.length}): ${analysis.headings.h2.slice(0, 5).join(' | ')}${analysis.headings.h2.length > 5 ? ' ...' : ''}`)
  console.log(`H3 (${analysis.headings.h3.length}): ${analysis.headings.h3.slice(0, 5).join(' | ')}${analysis.headings.h3.length > 5 ? ' ...' : ''}\n`)

  console.log('🔑 Top 20 关键词')
  console.log('-'.repeat(70))
  console.log('排名  关键词              次数    密度    位置')
  console.log('-'.repeat(70))

  analysis.keywords.slice(0, 20).forEach((kw, index) => {
    const rank = (index + 1).toString().padEnd(6)
    const keyword = kw.keyword.padEnd(18)
    const count = kw.count.toString().padEnd(8)
    const density = `${kw.density.toFixed(2)}%`.padEnd(8)
    const locations = kw.locations.join(', ')

    console.log(`${rank}${keyword}${count}${density}${locations}`)
  })

  console.log('\n💡 SEO 优化建议')
  console.log('-'.repeat(70))
  analysis.recommendations.forEach(rec => {
    console.log(rec)
  })

  console.log('\n📋 推荐的 Primary Tags')
  console.log('-'.repeat(70))
  const primaryTags = analysis.keywords
    .filter(kw => kw.count >= 3 && kw.density > 0.5 && kw.density < 5)
    .slice(0, 5)
    .map(kw => kw.keyword)

  console.log(primaryTags.join(', '))

  console.log('\n📋 推荐的 Secondary Tags')
  console.log('-'.repeat(70))
  const secondaryTags = analysis.keywords
    .filter(kw => kw.count >= 2 && kw.density > 0.2 && kw.density < 3)
    .slice(5, 15)
    .map(kw => kw.keyword)

  console.log(secondaryTags.join(', '))

  console.log('\n' + '='.repeat(70) + '\n')
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('用法: dotenv -e ../../.env.local -- npx tsx extract-keywords-from-html.ts <html-file-path>')
    console.error('示例: dotenv -e ../../.env.local -- npx tsx extract-keywords-from-html.ts ../../apps/website-1/电报中文版\\ -\\ Telegram官网2.html')
    process.exit(1)
  }

  const htmlFilePath = args[0]

  if (!fs.existsSync(htmlFilePath)) {
    console.error(`❌ 文件不存在: ${htmlFilePath}`)
    process.exit(1)
  }

  console.log(`\n📖 读取 HTML 文件: ${htmlFilePath}`)

  const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8')
  const analysis = extractKeywords(htmlContent)

  printAnalysis(analysis)
}

main().catch(console.error)
