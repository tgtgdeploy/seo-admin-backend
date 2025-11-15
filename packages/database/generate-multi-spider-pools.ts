/**
 * 为9个蜘蛛池域名生成不同版本的页面
 * 避免内容完全重复导致被判定为镜像站
 */

import * as fs from 'fs'
import * as path from 'path'
import * as cheerio from 'cheerio'

// 9个蜘蛛池域名配置
const SPIDER_DOMAINS = [
  // VPS 1
  { domain: 'autopushnetwork.xyz', vps: 'vps1', pageCount: 150, theme: 'auto' },
  { domain: 'contentpoolzone.site', vps: 'vps1', pageCount: 150, theme: 'content' },
  { domain: 'crawlboostnet.xyz', vps: 'vps1', pageCount: 150, theme: 'crawl' },

  // VPS 2
  { domain: 'crawlenginepro.xyz', vps: 'vps2', pageCount: 150, theme: 'engine' },
  { domain: 'linkpushmatrix.site', vps: 'vps2', pageCount: 150, theme: 'link' },
  { domain: 'rankspiderchain.xyz', vps: 'vps2', pageCount: 150, theme: 'rank' },

  // VPS 3
  { domain: 'seohubnetwork.xyz', vps: 'vps3', pageCount: 150, theme: 'seo' },
  { domain: 'spidertrackzone.xyz', vps: 'vps3', pageCount: 150, theme: 'track' },
  { domain: 'trafficboostflow.site', vps: 'vps3', pageCount: 150, theme: 'traffic' },
]

// 主站配置
const MAIN_SITES = [
  { url: 'https://telegramtghub.com', name: 'Telegram Hub' },
  { url: 'https://telegramupdatecenter.com', name: 'Telegram Update Center' },
  { url: 'https://telegramtrendguide.com', name: 'Telegram Trend Guide' },
]

// HTML 文件路径
const HTML_FILES = [
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

interface ExtractedContent {
  paragraphs: string[]
  headings: string[]
  keywords: string[]
}

/**
 * 提取HTML内容
 */
function extractContent(): ExtractedContent {
  const allParagraphs: string[] = []
  const allHeadings: string[] = []
  const allKeywords: string[] = []

  for (const file of HTML_FILES) {
    try {
      const html = fs.readFileSync(file.path, 'utf-8')
      const $ = cheerio.load(html)

      $('p').each((_, el) => {
        const text = $(el).text().trim()
        if (text.length > 20) allParagraphs.push(text)
      })

      $('h1, h2, h3, h4').each((_, el) => {
        const text = $(el).text().trim()
        if (text.length > 0) allHeadings.push(text)
      })

      allKeywords.push(...file.keywords)
    } catch (error) {
      console.error(`❌ 读取 ${file.name} 失败:`, error)
    }
  }

  return {
    paragraphs: allParagraphs,
    headings: allHeadings,
    keywords: Array.from(new Set(allKeywords))
  }
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
 * 生成主题相关的标题前缀
 */
function getThemePrefix(theme: string): string {
  const prefixes: Record<string, string[]> = {
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

  const list = prefixes[theme] || ['SEO优化']
  return list[Math.floor(Math.random() * list.length)]
}

/**
 * 生成单个域名的蜘蛛池页面
 */
function generateSpiderPool(
  config: typeof SPIDER_DOMAINS[0],
  content: ExtractedContent
) {
  const outputDir = path.join(__dirname, 'multi-spider-pools', config.domain)

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  console.log(`\n📄 生成 ${config.domain} (${config.pageCount}页)...`)

  for (let i = 0; i < config.pageCount; i++) {
    const randomParagraphs = shuffle(content.paragraphs).slice(0, 5 + Math.floor(Math.random() * 8))
    const randomKeywords = shuffle(content.keywords).slice(0, 8 + Math.floor(Math.random() * 12))
    const randomHeading = shuffle(content.headings)[0]

    const themePrefix = getThemePrefix(config.theme)
    const title = `${themePrefix} - ${randomHeading}`

    // 生成主站链接（随机顺序）
    const shuffledSites = shuffle(MAIN_SITES)
    const siteLinks = shuffledSites.map(site =>
      `<a href="${site.url}" target="_blank">${site.name}</a>`
    ).join(' | ')

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${randomParagraphs[0].substring(0, 160)}">
    <meta name="keywords" content="${randomKeywords.join(', ')}">
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
            color: #0088cc;
            font-size: 32px;
            margin-bottom: 20px;
            border-bottom: 3px solid #0088cc;
            padding-bottom: 15px;
        }
        h2 {
            color: #333;
            font-size: 24px;
            margin: 35px 0 15px;
            padding-left: 10px;
            border-left: 4px solid #0088cc;
        }
        p {
            margin-bottom: 18px;
            color: #555;
            text-align: justify;
        }
        .keywords {
            margin: 25px 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
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
            color: #0088cc;
            text-decoration: none;
            margin: 0 10px;
            transition: color 0.3s;
        }
        footer a:hover {
            color: #005580;
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
            来源: ${config.domain}
        </div>

        <div class="keywords">
            <strong>🏷️ 相关主题</strong>
            ${randomKeywords.map(k => `<span class="keyword">${k}</span>`).join('')}
        </div>

        ${randomParagraphs.map((p, idx) => {
          if (idx % 3 === 0 && idx > 0) {
            const subHeading = shuffle(content.headings)[0]
            return `<h2>${subHeading}</h2><p>${p}</p>`
          }
          return `<p>${p}</p>`
        }).join('\n        ')}

        <footer>
            <p><strong>推荐阅读</strong></p>
            <p>${siteLinks}</p>
            <p class="meta-info" style="margin-top: 15px;">
                © ${new Date().getFullYear()} ${config.domain} |
                本站内容仅供参考 |
                <a href="/sitemap.xml">网站地图</a>
            </p>
        </footer>
    </div>
</body>
</html>`

    const fileName = `page-${String(i + 1).padStart(4, '0')}.html`
    fs.writeFileSync(path.join(outputDir, fileName), html, 'utf-8')

    if ((i + 1) % 50 === 0) {
      console.log(`  ✓ 已生成 ${i + 1}/${config.pageCount} 页面`)
    }
  }

  // 生成 index.html (首页)
  const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.domain} - Telegram中文资讯导航</title>
    <meta name="description" content="Telegram中文资讯，提供最新的Telegram下载、使用教程和SEO优化技巧">
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 40px 20px; background: #f5f5f5; }
        h1 { color: #0088cc; text-align: center; margin-bottom: 40px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .card a { color: #333; text-decoration: none; font-size: 14px; }
        .card a:hover { color: #0088cc; }
        .main-sites { text-align: center; margin-top: 60px; padding: 30px; background: white; border-radius: 8px; }
        .main-sites a { display: inline-block; margin: 10px; padding: 12px 24px; background: #0088cc; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>${config.domain}</h1>
    <h2 style="text-align: center; color: #666; margin-bottom: 40px;">Telegram 中文资讯中心</h2>

    <div class="grid">
        ${Array.from({ length: Math.min(50, config.pageCount) }, (_, i) => `
        <div class="card">
            <a href="/page-${String(i + 1).padStart(4, '0')}.html">
                📄 第 ${i + 1} 篇 - ${getThemePrefix(config.theme)}
            </a>
        </div>
        `).join('')}
    </div>

    <div class="main-sites">
        <h3>访问我们的主站</h3>
        ${MAIN_SITES.map(site => `<a href="${site.url}" target="_blank">${site.name}</a>`).join('')}
    </div>
</body>
</html>`

  fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml, 'utf-8')

  console.log(`  ✅ ${config.domain} 完成！`)
}

/**
 * 生成Sitemap
 */
function generateSitemap(config: typeof SPIDER_DOMAINS[0]) {
  const outputDir = path.join(__dirname, 'multi-spider-pools', config.domain)
  const sitemapPath = path.join(outputDir, 'sitemap.xml')

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  // 首页
  xml += `  <url><loc>https://${config.domain}/</loc><priority>1.0</priority></url>\n`

  // 所有页面
  for (let i = 1; i <= config.pageCount; i++) {
    xml += `  <url><loc>https://${config.domain}/page-${String(i).padStart(4, '0')}.html</loc></url>\n`
  }

  xml += '</urlset>'

  fs.writeFileSync(sitemapPath, xml, 'utf-8')
}

/**
 * 生成robots.txt
 */
function generateRobots(config: typeof SPIDER_DOMAINS[0]) {
  const outputDir = path.join(__dirname, 'multi-spider-pools', config.domain)
  const robotsPath = path.join(outputDir, 'robots.txt')

  const robots = `User-agent: *
Allow: /

Sitemap: https://${config.domain}/sitemap.xml
`

  fs.writeFileSync(robotsPath, robots, 'utf-8')
}

/**
 * 主函数
 */
async function main() {
  console.log('🕷️  开始生成9个蜘蛛池网站...\n')
  console.log('📊 配置统计:')
  console.log(`  - 域名数量: ${SPIDER_DOMAINS.length}`)
  console.log(`  - VPS数量: 3`)
  console.log(`  - 总页面数: ${SPIDER_DOMAINS.reduce((sum, d) => sum + d.pageCount, 0)}`)
  console.log('')

  const content = extractContent()
  console.log(`✅ 内容提取完成:`)
  console.log(`  - 段落: ${content.paragraphs.length}`)
  console.log(`  - 标题: ${content.headings.length}`)
  console.log(`  - 关键词: ${content.keywords.length}`)

  for (const domain of SPIDER_DOMAINS) {
    generateSpiderPool(domain, content)
    generateSitemap(domain)
    generateRobots(domain)
  }

  console.log('\n🎉 所有蜘蛛池生成完成！')
  console.log('\n📁 输出目录: packages/database/multi-spider-pools/')
  console.log('\n下一步:')
  console.log('  1. 查看生成的页面')
  console.log('  2. 运行部署脚本分发到3个VPS')
  console.log('  3. 配置DNS和Nginx')
}

main()
