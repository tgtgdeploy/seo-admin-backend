/**
 * 蜘蛛池内容生成服务
 * 动态管理蜘蛛池页面，从数据库读取配置和内容源
 */

import { PrismaClient, SpiderPageStatus } from '@prisma/client'
import * as fs from 'fs'
import * as cheerio from 'cheerio'

const prisma = new PrismaClient()

// 主题配置
const THEME_PREFIXES: Record<string, string[]> = {
  auto: ['自动化推送', '智能分发', '快速传播'],
  content: ['内容优化', '文章管理', '内容营销'],
  crawl: ['爬虫优化', '索引加速', '收录提升'],
  engine: ['搜索引擎', '排名优化', 'SEO工具'],
  link: ['链接建设', '外链优化', '反向链接'],
  rank: ['排名提升', '关键词优化', '权重增长'],
  seo: ['SEO优化', '网站优化', '搜索优化'],
  track: ['数据追踪', '流量分析', '监控统计'],
  traffic: ['流量增长', '访问提升', '用户获取'],
}

// 主站配置
const MAIN_SITES = [
  { url: 'https://telegramtghub.com', name: 'Telegram Hub' },
  { url: 'https://telegramupdatecenter.com', name: 'Telegram Update Center' },
  { url: 'https://telegramtrendguide.com', name: 'Telegram Trend Guide' },
]

interface ExtractedContent {
  paragraphs: string[]
  headings: string[]
  keywords: string[]
}

/**
 * 随机打乱数组
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 获取主题前缀
 */
function getThemePrefix(theme: string): string {
  const prefixes = THEME_PREFIXES[theme] || ['SEO优化']
  return prefixes[Math.floor(Math.random() * prefixes.length)]
}

/**
 * 从HTML文件提取内容
 */
export async function extractContentFromHTML(filePath: string, name: string, keywords: string[]): Promise<void> {
  try {
    const html = fs.readFileSync(filePath, 'utf-8')
    const $ = cheerio.load(html)

    const paragraphs: string[] = []
    const headings: string[] = []

    // 提取段落
    $('p, .content p, article p, .post-content p').each((_, el) => {
      const text = $(el).text().trim()
      if (text.length > 20) paragraphs.push(text)
    })

    // 提取标题
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const text = $(el).text().trim()
      if (text.length > 0 && text.length < 200) headings.push(text)
    })

    // 保存到数据库
    await prisma.spiderPoolSource.upsert({
      where: { name },
      create: {
        name,
        description: `从 ${filePath} 提取的内容`,
        filePath,
        paragraphs,
        headings,
        keywords,
        totalParagraphs: paragraphs.length,
        totalHeadings: headings.length,
        totalKeywords: keywords.length,
        status: 'ACTIVE',
        isActive: true,
      },
      update: {
        paragraphs,
        headings,
        keywords,
        totalParagraphs: paragraphs.length,
        totalHeadings: headings.length,
        totalKeywords: keywords.length,
        lastUsed: new Date(),
      },
    })

    console.log(`✅ 提取 ${name}: ${paragraphs.length}段落, ${headings.length}标题, ${keywords.length}关键词`)
  } catch (error) {
    console.error(`❌ 提取 ${name} 失败:`, error)
    throw error
  }
}

/**
 * 初始化内容源（自动扫描 spider-pool-content 文件夹）
 */
export async function initializeContentSources(): Promise<void> {
  console.log('🔄 开始提取内容源...')

  const contentDir = '/home/ubuntu/WebstormProjects/seo-admin/spider-pool-content'

  // 检查文件夹是否存在
  if (!fs.existsSync(contentDir)) {
    console.log(`⚠️  内容文件夹不存在: ${contentDir}`)
    console.log('使用默认配置...')

    // 使用默认配置（兼容旧版本）
    const defaultSources = [
      {
        name: 'website-1',
        path: '/home/ubuntu/WebstormProjects/seo-website-1/电报中文版 - Telegram官网2.html',
        keywords: ['Telegram', '电报', '电报中文版', 'Telegram中文版', 'TG纸飞机']
      },
      {
        name: 'website-2',
        path: '/home/ubuntu/WebstormProjects/seo-website-2/纸飞机3.html',
        keywords: ['纸飞机', 'TG飞机', 'Telegram', '电报下载']
      },
      {
        name: 'website-tg',
        path: '/home/ubuntu/WebstormProjects/seo-website-tg/TG中文纸飞机1/Telegram官网 - Telegram下载.html',
        keywords: ['Telegram', '电报', 'Telegram下载', '安全即时通讯']
      }
    ]

    for (const source of defaultSources) {
      if (fs.existsSync(source.path)) {
        await extractContentFromHTML(source.path, source.name, source.keywords)
      }
    }
    return
  }

  // 读取文件夹中的所有 HTML 文件
  const files = fs.readdirSync(contentDir)
    .filter(file => file.endsWith('.html'))

  console.log(`📁 发现 ${files.length} 个 HTML 文件`)

  // 默认关键词（通用）
  const defaultKeywords = ['Telegram', '电报', 'TG', '纸飞机', '即时通讯']

  for (const file of files) {
    const filePath = `${contentDir}/${file}`
    const name = file.replace('.html', '')

    // 根据文件名自动生成关键词
    let keywords = [...defaultKeywords]
    if (file.includes('telegram')) keywords.push('Telegram中文版', 'TG纸飞机')
    if (file.includes('zhifei')) keywords.push('纸飞机', 'TG飞机', '电报下载')
    if (file.includes('download')) keywords.push('Telegram下载', '安全即时通讯')

    await extractContentFromHTML(filePath, name, keywords)
  }

  console.log('✅ 内容源提取完成')
}

/**
 * 获取所有激活的内容源
 */
async function getActiveSources(): Promise<ExtractedContent> {
  const sources = await prisma.spiderPoolSource.findMany({
    where: { isActive: true, status: 'ACTIVE' }
  })

  const allParagraphs: string[] = []
  const allHeadings: string[] = []
  const allKeywords: string[] = []

  for (const source of sources) {
    allParagraphs.push(...source.paragraphs)
    allHeadings.push(...source.headings)
    allKeywords.push(...source.keywords)
  }

  return {
    paragraphs: allParagraphs,
    headings: allHeadings,
    keywords: Array.from(new Set(allKeywords))
  }
}

/**
 * 为指定域名生成蜘蛛池页面
 */
export async function generateSpiderPoolPages(
  domainAliasId: string,
  theme: string,
  pageCount: number = 150
): Promise<void> {
  console.log(`\n📄 为域名生成 ${pageCount} 个蜘蛛池页面 (主题: ${theme})...`)

  // 获取内容源
  const content = await getActiveSources()

  if (content.paragraphs.length === 0) {
    throw new Error('没有可用的内容源，请先初始化内容源')
  }

  console.log(`使用内容源: ${content.paragraphs.length}段落, ${content.headings.length}标题, ${content.keywords.length}关键词`)

  // 获取域名信息
  const domainAlias = await prisma.domainAlias.findUnique({
    where: { id: domainAliasId }
  })

  if (!domainAlias) {
    throw new Error('域名不存在')
  }

  // 删除该域名的旧页面
  await prisma.spiderPoolPage.deleteMany({
    where: { domainAliasId }
  })

  // 批量生成页面（增强差异化）
  const pages = []
  for (let i = 1; i <= pageCount; i++) {
    // 根据页面编号变化段落数量（增加差异化）
    const minParagraphs = 4 + (i % 3)  // 4-6
    const maxParagraphs = 10 + (i % 5) // 10-14
    const paragraphCount = minParagraphs + Math.floor(Math.random() * (maxParagraphs - minParagraphs))

    const randomParagraphs = shuffle(content.paragraphs).slice(0, paragraphCount)
    const randomKeywords = shuffle(content.keywords).slice(0, 6 + Math.floor(Math.random() * 15))
    const randomHeading = shuffle(content.headings)[0]

    const themePrefix = getThemePrefix(theme)
    const title = `${themePrefix} - ${randomHeading}`
    const slug = `page-${String(i).padStart(4, '0')}`

    // 生成主站链接（随机选择1个，添加nofollow）
    const randomSite = MAIN_SITES[Math.floor(Math.random() * MAIN_SITES.length)]
    const siteLinks = `<a href="${randomSite.url}" target="_blank" rel="nofollow">${randomSite.name}</a>`

    // 生成HTML内容（传递页码信息用于内部链接）
    const htmlContent = generatePageHTML({
      title,
      description: randomParagraphs[0].substring(0, 160),
      keywords: randomKeywords,
      paragraphs: randomParagraphs,
      headings: content.headings,
      domain: domainAlias.domain,
      siteLinks,
      pageNum: i,
      totalPages: pageCount,
    })

    pages.push({
      domainAliasId,
      pageNum: i,
      slug,
      title,
      description: randomParagraphs[0].substring(0, 160),
      keywords: randomKeywords,
      content: htmlContent,
      theme,
      status: SpiderPageStatus.ACTIVE,
      published: true,
      generatedBy: 'auto',
      sourceContent: ['website-1', 'website-2', 'website-tg'],
    })

    if (i % 50 === 0) {
      console.log(`  ✓ 已生成 ${i}/${pageCount} 页面`)
    }
  }

  // 批量插入数据库
  await prisma.spiderPoolPage.createMany({
    data: pages
  })

  console.log(`  ✅ 成功生成 ${pageCount} 个页面`)
}

/**
 * 生成单个页面的HTML内容（带主题样式和内部链接）
 */
function generatePageHTML(params: {
  title: string
  description: string
  keywords: string[]
  paragraphs: string[]
  headings: string[]
  domain: string
  siteLinks: string
  pageNum?: number
  totalPages?: number
}): string {
  const { title, description, keywords, paragraphs, headings, domain, siteLinks, pageNum = 1, totalPages = 150 } = params

  // 根据域名哈希生成不同的主题颜色
  const domainHash = domain.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const themeColors = [
    { primary: '#0088cc', gradient: '#667eea, #764ba2' },     // 蓝紫
    { primary: '#ff6b6b', gradient: '#f093fb, #f5576c' },     // 红粉
    { primary: '#2ecc71', gradient: '#11998e, #38ef7d' },     // 绿
    { primary: '#f39c12', gradient: '#fa709a, #fee140' },     // 橙黄
    { primary: '#9b59b6', gradient: '#667eea, #764ba2' },     // 紫
    { primary: '#1abc9c', gradient: '#56ccf2, #2f80ed' },     // 青蓝
    { primary: '#e74c3c', gradient: '#ee0979, #ff6a00' },     // 深红
    { primary: '#3498db', gradient: '#00c6ff, #0072ff' },     // 天蓝
    { primary: '#e67e22', gradient: '#f77062, #fe5196' },     // 橙红
  ]
  const theme = themeColors[domainHash % themeColors.length]

  // 生成随机内部链接（3-5个）
  const internalLinks = []
  const linkCount = 3 + Math.floor(Math.random() * 3)
  for (let i = 0; i < linkCount; i++) {
    const randomPage = Math.floor(Math.random() * totalPages) + 1
    if (randomPage !== pageNum) {
      internalLinks.push(`page-${String(randomPage).padStart(4, '0')}`)
    }
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords.join(', ')}">
    <meta name="robots" content="index, follow">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 30px 20px;
            line-height: 1.8;
            color: #333;
            background: #f9f9f9;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        h1 {
            color: ${theme.primary};
            font-size: 32px;
            margin-bottom: 20px;
            border-bottom: 3px solid ${theme.primary};
            padding-bottom: 15px;
        }
        h2 {
            color: #333;
            font-size: 24px;
            margin: 35px 0 15px;
            padding-left: 10px;
            border-left: 4px solid ${theme.primary};
        }
        p {
            margin-bottom: 18px;
            color: #555;
            text-align: justify;
        }
        .keywords {
            margin: 25px 0;
            padding: 20px;
            background: linear-gradient(135deg, ${theme.gradient});
            border-radius: 8px;
        }
        .related-links {
            margin-top: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid ${theme.primary};
        }
        .related-links h3 {
            color: ${theme.primary};
            margin-bottom: 15px;
            font-size: 18px;
        }
        .related-links a {
            display: inline-block;
            margin: 5px 10px 5px 0;
            padding: 8px 16px;
            background: white;
            color: ${theme.primary};
            text-decoration: none;
            border-radius: 5px;
            border: 1px solid ${theme.primary};
            font-size: 14px;
            transition: all 0.3s;
        }
        .related-links a:hover {
            background: ${theme.primary};
            color: white;
        }
        .keywords strong {
            color: white;
            font-size: 16px;
            display: block;
            margin-bottom: 12px;
        }
        .keyword {
            display: inline-block;
            padding: 6px 14px;
            margin: 4px;
            background: rgba(255,255,255,0.2);
            color: white;
            border-radius: 20px;
            font-size: 13px;
            backdrop-filter: blur(10px);
            transition: all 0.3s;
        }
        .keyword:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
        footer {
            margin-top: 60px;
            padding: 25px 0;
            border-top: 2px solid #eee;
            text-align: center;
            color: #999;
        }
        footer a {
            color: ${theme.primary};
            text-decoration: none;
            margin: 0 10px;
            transition: color 0.3s;
        }
        footer a:hover {
            opacity: 0.8;
            text-decoration: underline;
        }
        .meta-info {
            font-size: 14px;
            color: #888;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        <div class="meta-info">
            发布时间: ${new Date().toLocaleDateString('zh-CN')} |
            来源: ${domain}
        </div>

        <div class="keywords">
            <strong>🏷️ 相关主题</strong>
            ${keywords.map(k => `<span class="keyword">${k}</span>`).join('')}
        </div>

        ${paragraphs.map((p, idx) => {
          if (idx % 3 === 0 && idx > 0) {
            const subHeading = shuffle(headings)[0]
            return `<h2>${subHeading}</h2><p>${p}</p>`
          }
          return `<p>${p}</p>`
        }).join('\n        ')}

        ${internalLinks.length > 0 ? `
        <div class="related-links">
            <h3>📚 相关文章</h3>
            ${internalLinks.map(link => `<a href="/${link}.html">阅读更多</a>`).join('')}
        </div>
        ` : ''}

        <footer>
            <p><strong>推荐资源</strong></p>
            <p>${siteLinks}</p>
            <p class="meta-info" style="margin-top: 15px;">
                © ${new Date().getFullYear()} ${domain} |
                本站内容仅供参考 |
                <a href="/sitemap.xml">网站地图</a>
            </p>
        </footer>
    </div>
</body>
</html>`
}

/**
 * 获取域名的所有页面（用于Sitemap生成）
 */
export async function getDomainPages(domainAliasId: string) {
  return await prisma.spiderPoolPage.findMany({
    where: {
      domainAliasId,
      status: 'ACTIVE',
      published: true,
    },
    orderBy: { pageNum: 'asc' }
  })
}

/**
 * 根据slug获取页面
 */
export async function getPageBySlug(domainAliasId: string, slug: string) {
  return await prisma.spiderPoolPage.findUnique({
    where: {
      domainAliasId_slug: {
        domainAliasId,
        slug,
      }
    }
  })
}

/**
 * 记录页面访问（用于统计）
 */
export async function trackPageView(pageId: string, isCrawler: boolean = false) {
  await prisma.spiderPoolPage.update({
    where: { id: pageId },
    data: {
      views: { increment: 1 },
      ...(isCrawler ? {
        crawlerVisits: { increment: 1 },
        lastCrawled: new Date(),
      } : {}),
    }
  })
}

/**
 * 生成Sitemap XML（差异化格式）
 */
export async function generateSitemap(domainAliasId: string): Promise<string> {
  const domainAlias = await prisma.domainAlias.findUnique({
    where: { id: domainAliasId }
  })

  if (!domainAlias) {
    throw new Error('域名不存在')
  }

  const pages = await getDomainPages(domainAliasId)

  // 根据域名哈希决定sitemap格式
  const domainHash = domainAlias.domain.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const format = domainHash % 3

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'

  // 格式1: 标准sitemap
  if (format === 0) {
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  }
  // 格式2: 带图片扩展的sitemap
  else if (format === 1) {
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
    xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
  }
  // 格式3: 带移动端标签的sitemap
  else {
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
    xml += '        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">\n'
  }

  // 首页
  xml += `  <url>\n    <loc>https://${domainAlias.domain}/</loc>\n`
  xml += `    <priority>1.0</priority>\n`
  if (format === 2) xml += `    <mobile:mobile/>\n`
  xml += `  </url>\n`

  // 所有页面
  for (const page of pages) {
    xml += `  <url>\n    <loc>https://${domainAlias.domain}/${page.slug}.html</loc>\n`
    if (format === 2) xml += `    <mobile:mobile/>\n`
    xml += `  </url>\n`
  }

  xml += '</urlset>'

  return xml
}

/**
 * 生成robots.txt（差异化内容）
 */
export async function generateRobotsTxt(domainAliasId: string): Promise<string> {
  const domainAlias = await prisma.domainAlias.findUnique({
    where: { id: domainAliasId }
  })

  if (!domainAlias) {
    throw new Error('域名不存在')
  }

  // 根据域名哈希决定robots.txt格式
  const domainHash = domainAlias.domain.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const format = domainHash % 3

  let robots = ''

  // 格式1: 标准格式
  if (format === 0) {
    robots = `User-agent: *
Allow: /

Sitemap: https://${domainAlias.domain}/sitemap.xml
`
  }
  // 格式2: 添加 Crawl-delay
  else if (format === 1) {
    robots = `User-agent: *
Allow: /
Crawl-delay: 5

Sitemap: https://${domainAlias.domain}/sitemap.xml
`
  }
  // 格式3: 特定爬虫规则
  else {
    robots = `User-agent: *
Allow: /

User-agent: Bingbot
Crawl-delay: 10

User-agent: Googlebot
Allow: /

Sitemap: https://${domainAlias.domain}/sitemap.xml
`
  }

  return robots
}

/**
 * 批量为所有蜘蛛池域名生成页面
 */
export async function generateAllSpiderPools(): Promise<void> {
  console.log('🕷️ 开始为所有蜘蛛池域名生成页面...\n')

  // 定义9个蜘蛛池域名配置
  const spiderDomains = [
    // VPS 1
    { domain: 'autopushnetwork.xyz', theme: 'auto', pageCount: 150 },
    { domain: 'contentpoolzone.site', theme: 'content', pageCount: 150 },
    { domain: 'crawlboostnet.xyz', theme: 'crawl', pageCount: 150 },
    // VPS 2
    { domain: 'crawlenginepro.xyz', theme: 'engine', pageCount: 150 },
    { domain: 'linkpushmatrix.site', theme: 'link', pageCount: 150 },
    { domain: 'rankspiderchain.xyz', theme: 'rank', pageCount: 150 },
    // VPS 3
    { domain: 'seohubnetwork.xyz', theme: 'seo', pageCount: 150 },
    { domain: 'spidertrackzone.xyz', theme: 'track', pageCount: 150 },
    { domain: 'trafficboostflow.site', theme: 'traffic', pageCount: 150 },
  ]

  for (const config of spiderDomains) {
    // 查找或创建域名别名
    const domainAlias = await prisma.domainAlias.findUnique({
      where: { domain: config.domain }
    })

    if (!domainAlias) {
      console.log(`⚠️  域名 ${config.domain} 不存在，请先在后台创建`)
      continue
    }

    await generateSpiderPoolPages(domainAlias.id, config.theme, config.pageCount)
  }

  console.log('\n🎉 所有蜘蛛池页面生成完成！')
}

export default {
  initializeContentSources,
  generateSpiderPoolPages,
  generateAllSpiderPools,
  getDomainPages,
  getPageBySlug,
  trackPageView,
  generateSitemap,
  generateRobotsTxt,
}
