/**
 * 从三个 website HTML 文件中提取文章和关键词
 * 用于生成蜘蛛池页面
 */

import * as fs from 'fs'
import * as path from 'path'
import * as cheerio from 'cheerio'

// HTML 文件路径配置
const HTML_FILES = [
  {
    name: 'website-1',
    path: '/home/ubuntu/WebstormProjects/seo-website-1/电报中文版 - Telegram官网2.html',
    keywords: ['Telegram', '电报', '电报中文版', 'Telegram中文版', 'TG纸飞机', 'Windows', 'Mac', 'Android', 'iOS']
  },
  {
    name: 'website-2',
    path: '/home/ubuntu/WebstormProjects/seo-website-2/纸飞机3.html',
    keywords: ['纸飞机', 'TG飞机', 'Telegram', '电报下载', '安卓版', 'Android', 'Apk', '电脑版', '桌面版']
  },
  {
    name: 'website-tg',
    path: '/home/ubuntu/WebstormProjects/seo-website-tg/TG中文纸飞机1/Telegram官网 - Telegram下载.html',
    keywords: ['Telegram', '电报', 'Telegram下载', '安全即时通讯', '隐私', '端到端加密', '秘密聊天']
  }
]

interface ExtractedContent {
  website: string
  title: string
  description: string
  keywords: string[]
  paragraphs: string[]
  headings: string[]
  links: Array<{ text: string; href: string }>
}

/**
 * 提取单个 HTML 文件的内容
 */
function extractFromHTML(filePath: string, websiteName: string, baseKeywords: string[]): ExtractedContent {
  const html = fs.readFileSync(filePath, 'utf-8')
  const $ = cheerio.load(html)

  // 提取标题
  const title = $('title').text() || ''

  // 提取 meta description
  const description = $('meta[name="description"]').attr('content') || ''

  // 提取所有段落
  const paragraphs: string[] = []
  $('p, .content p, article p, .post-content p').each((_, el) => {
    const text = $(el).text().trim()
    if (text.length > 20) {  // 过滤太短的段落
      paragraphs.push(text)
    }
  })

  // 提取标题
  const headings: string[] = []
  $('h1, h2, h3, h4').each((_, el) => {
    const text = $(el).text().trim()
    if (text.length > 0) {
      headings.push(text)
    }
  })

  // 提取链接
  const links: Array<{ text: string; href: string }> = []
  $('a').each((_, el) => {
    const text = $(el).text().trim()
    const href = $(el).attr('href') || ''
    if (text.length > 0 && href && !href.startsWith('#')) {
      links.push({ text, href })
    }
  })

  // 从内容中提取额外的关键词
  const contentKeywords = extractKeywordsFromText([...paragraphs, ...headings].join(' '))

  return {
    website: websiteName,
    title,
    description,
    keywords: Array.from(new Set([...baseKeywords, ...contentKeywords])),
    paragraphs: paragraphs.slice(0, 50),  // 限制数量
    headings: headings.slice(0, 20),
    links: links.slice(0, 30)
  }
}

/**
 * 从文本中提取关键词
 */
function extractKeywordsFromText(text: string): string[] {
  const commonWords = ['的', '是', '在', '和', '与', '为', '了', '等', '您', '我们', '可以']
  const words = text.match(/[\u4e00-\u9fa5]{2,}/g) || []

  const wordCount = new Map<string, number>()
  words.forEach(word => {
    if (!commonWords.includes(word)) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    }
  })

  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word)
}

/**
 * 生成蜘蛛池JSON数据
 */
async function generateSpiderPoolData() {
  console.log('🕷️  开始提取HTML内容生成蜘蛛池数据...\n')

  const allContent: ExtractedContent[] = []

  for (const file of HTML_FILES) {
    try {
      console.log(`📄 处理 ${file.name}...`)
      const content = extractFromHTML(file.path, file.name, file.keywords)
      allContent.push(content)
      console.log(`✅ ${file.name}: 提取到 ${content.paragraphs.length} 段落, ${content.headings.length} 标题, ${content.keywords.length} 关键词\n`)
    } catch (error) {
      console.error(`❌ 处理 ${file.name} 失败:`, error)
    }
  }

  // 保存到JSON文件
  const outputPath = path.join(__dirname, 'spider-pool-data.json')
  fs.writeFileSync(outputPath, JSON.stringify(allContent, null, 2), 'utf-8')

  console.log(`\n✅ 蜘蛛池数据已保存到: ${outputPath}`)
  console.log(`\n📊 统计信息:`)
  console.log(`  - 网站数量: ${allContent.length}`)
  console.log(`  - 总段落数: ${allContent.reduce((sum, c) => sum + c.paragraphs.length, 0)}`)
  console.log(`  - 总关键词: ${allContent.reduce((sum, c) => sum + c.keywords.length, 0)}`)

  return allContent
}

/**
 * 生成蜘蛛池HTML页面
 */
function generateSpiderPoolHTML(data: ExtractedContent[], pageCount: number = 100): void {
  const outputDir = path.join(__dirname, 'spider-pool-pages')

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  console.log(`\n🌐 开始生成 ${pageCount} 个蜘蛛池页面...\n`)

  // 合并所有内容
  const allParagraphs = data.flatMap(d => d.paragraphs)
  const allKeywords = Array.from(new Set(data.flatMap(d => d.keywords)))
  const allHeadings = data.flatMap(d => d.headings)

  for (let i = 0; i < pageCount; i++) {
    // 随机选择内容
    const randomParagraphs = shuffle(allParagraphs).slice(0, 5 + Math.floor(Math.random() * 10))
    const randomKeywords = shuffle(allKeywords).slice(0, 10 + Math.floor(Math.random() * 10))
    const randomHeading = allHeadings[Math.floor(Math.random() * allHeadings.length)]

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${randomHeading} | Telegram中文资讯</title>
    <meta name="description" content="${randomParagraphs[0].substring(0, 160)}">
    <meta name="keywords" content="${randomKeywords.join(', ')}">
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #0088cc; }
        h2 { color: #333; margin-top: 30px; }
        p { margin-bottom: 15px; color: #555; }
        .keywords { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
        .keyword { display: inline-block; padding: 5px 10px; margin: 5px; background: #0088cc; color: white; border-radius: 3px; font-size: 14px; }
        footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; }
    </style>
</head>
<body>
    <h1>${randomHeading}</h1>

    <div class="keywords">
        <strong>相关关键词：</strong>
        ${randomKeywords.map(k => `<span class="keyword">${k}</span>`).join('')}
    </div>

    ${randomParagraphs.map((p, idx) => {
      if (idx % 3 === 0 && idx > 0) {
        return `<h2>${allHeadings[Math.floor(Math.random() * allHeadings.length)]}</h2><p>${p}</p>`
      }
      return `<p>${p}</p>`
    }).join('\n    ')}

    <footer>
        <p>© 2025 Telegram中文资讯 | <a href="https://telegram1688.com">主站1</a> | <a href="https://telegram2688.com">主站2</a> | <a href="https://telegramcnfw.com">主站3</a></p>
    </footer>
</body>
</html>`

    const fileName = `page-${String(i + 1).padStart(4, '0')}.html`
    fs.writeFileSync(path.join(outputDir, fileName), html, 'utf-8')

    if ((i + 1) % 10 === 0) {
      console.log(`✅ 已生成 ${i + 1}/${pageCount} 页面`)
    }
  }

  console.log(`\n✅ 成功生成 ${pageCount} 个蜘蛛池页面到: ${outputDir}`)
}

/**
 * 数组随机打乱
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 主函数
async function main() {
  try {
    const data = await generateSpiderPoolData()
    generateSpiderPoolHTML(data, 100)  // 生成100个页面

    console.log('\n🎉 蜘蛛池页面生成完成！')
    console.log('\n📋 下一步:')
    console.log('  1. 将 spider-pool-pages 目录上传到服务器')
    console.log('  2. 配置 Nginx 指向该目录')
    console.log('  3. 每个页面都包含指向三个主站的链接')
  } catch (error) {
    console.error('❌ 生成失败:', error)
    process.exit(1)
  }
}

main()
