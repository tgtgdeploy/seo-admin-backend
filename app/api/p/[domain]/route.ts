/**
 * 公开API: 根据域名提供蜘蛛池页面
 * GET /api/p/[domain]?slug=page-0001
 * GET /api/p/[domain]?type=sitemap
 * GET /api/p/[domain]?type=robots
 *
 * 这个API将被蜘蛛池域名通过反向代理调用来获取页面内容
 * Nginx配置示例:
 * location / {
 *   proxy_pass https://adminseohub.xyz/api/p/autopushnetwork.xyz?slug=$uri;
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@repo/database'
import spiderPoolService from '@repo/database/src/services/spider-pool.service'

// 检测是否为爬虫
function isCrawler(userAgent: string): boolean {
  const crawlerPatterns = [
    'googlebot',
    'bingbot',
    'baiduspider',
    'yandexbot',
    'duckduckbot',
    'slurp', // Yahoo
    'teoma',
    'ia_archiver',
  ]

  const ua = userAgent.toLowerCase()
  return crawlerPatterns.some(pattern => ua.includes(pattern))
}

// 识别具体的爬虫类型
function detectBot(userAgent: string): string | null {
  const ua = userAgent.toLowerCase()

  if (ua.includes('googlebot')) return 'googlebot'
  if (ua.includes('bingbot')) return 'bingbot'
  if (ua.includes('baiduspider')) return 'baiduspider'
  if (ua.includes('yandexbot')) return 'yandexbot'
  if (ua.includes('duckduckbot')) return 'duckduckbot'
  if (ua.includes('slurp')) return 'slurp'

  return null
}

// 主站链接配置 (dofollow - 传递权重)
const MAIN_SITES = [
  { name: 'Telegram 中文版', url: 'https://telegramservice.com', desc: '官方中文主站' },
  { name: 'Telegram 工具箱', url: 'https://telegramtoolkit.com', desc: '工具主站' },
  { name: 'Telegram 下载中心', url: 'https://adminapihub.xyz', desc: 'APK下载站' },
]

// 下载页链接配置 (dofollow - 重点传递权重给下载页)
const DOWNLOAD_PAGES = [
  { name: 'Telegram 安卓下载', url: 'https://telegramservice.com/download', platform: 'Android' },
  { name: 'Telegram iOS下载', url: 'https://telegramtoolkit.com/download', platform: 'iOS' },
  { name: 'Telegram 电脑版下载', url: 'https://adminapihub.xyz/download', platform: 'Windows' },
  { name: 'Telegram APK直接下载', url: 'https://adminapihub.xyz', platform: 'APK' },
]

// 生成内页HTML（包含下载链接）
function generatePageHTML(domain: string, page: any): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title || 'Telegram资讯'}</title>
    <meta name="description" content="${page.description || 'Telegram中文版下载和使用教程'}">
    <meta name="keywords" content="${(page.keywords || []).join(',')}">
    <link rel="canonical" href="https://${domain}/${page.slug}.html">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 20px; background: #f5f5f5; line-height: 1.8; color: #333; }
        .content { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        h1 { color: #0088cc; margin-bottom: 20px; }
        p { margin-bottom: 16px; }
        .download-section { margin-top: 40px; padding: 30px; background: linear-gradient(135deg, #0088cc 0%, #005580 100%); border-radius: 10px; text-align: center; }
        .download-section h3 { color: white; margin-bottom: 20px; font-size: 1.3em; }
        .download-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
        .download-btn { display: block; padding: 14px 20px; background: white; color: #0088cc; text-decoration: none; border-radius: 8px; font-weight: bold; transition: transform 0.2s; }
        .download-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .download-btn .platform { display: block; font-size: 12px; color: #666; font-weight: normal; margin-top: 4px; }
        .footer { margin-top: 40px; padding: 25px 0; border-top: 2px solid #eee; text-align: center; color: #666; font-size: 14px; }
        .footer a { color: #0088cc; text-decoration: none; margin: 0 10px; }
    </style>
</head>
<body>
    <div class="content">
        ${page.content}

        <!-- 下载区域 - dofollow传递权重 -->
        <div class="download-section">
            <h3>立即下载 Telegram</h3>
            <div class="download-grid">
                ${DOWNLOAD_PAGES.map(dl => `
                <a href="${dl.url}" class="download-btn" title="${dl.name}">
                    ${dl.name}
                    <span class="platform">${dl.platform}版</span>
                </a>
                `).join('')}
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Telegram中文资讯中心 | 提供最新下载和使用教程</p>
        <p>
            ${MAIN_SITES.map(site => `<a href="${site.url}" title="${site.desc}">${site.name}</a>`).join('')}
        </p>
        <p style="margin-top: 10px;">
            ${DOWNLOAD_PAGES.map(dl => `<a href="${dl.url}">${dl.platform}版下载</a>`).join(' | ')}
        </p>
    </div>
</body>
</html>`
}

// 生成首页HTML
function generateIndexHTML(domain: string, siteName: string, pages: any[]): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteName} - Telegram下载 | 电报中文版官网</title>
    <meta name="description" content="Telegram中文版下载，提供安卓APK、iOS、Windows、Mac等全平台客户端下载，最新版本免费获取">
    <meta name="keywords" content="Telegram下载,电报下载,Telegram安卓,Telegram iOS,Telegram中文版,纸飞机下载">
    <link rel="canonical" href="https://${domain}/">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 40px 20px; background: #f5f5f5; line-height: 1.6; }
        h1 { color: #0088cc; text-align: center; margin-bottom: 20px; font-size: 2em; }
        h2 { text-align: center; color: #666; margin-bottom: 40px; font-size: 1.2em; font-weight: normal; }
        .download-section { background: linear-gradient(135deg, #0088cc 0%, #005580 100%); padding: 40px 30px; border-radius: 12px; margin-bottom: 40px; text-align: center; }
        .download-section h3 { color: white; margin-bottom: 25px; font-size: 1.5em; }
        .download-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; max-width: 900px; margin: 0 auto; }
        .download-btn { display: block; padding: 16px 24px; background: white; color: #0088cc; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; transition: transform 0.2s, box-shadow 0.2s; }
        .download-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .download-btn .platform { display: block; font-size: 12px; color: #666; font-weight: normal; margin-top: 4px; }
        .main-sites { background: white; padding: 30px; border-radius: 12px; margin-bottom: 40px; text-align: center; }
        .main-sites h3 { color: #333; margin-bottom: 20px; }
        .main-sites .links { display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; }
        .main-sites a { display: inline-block; padding: 12px 28px; background: #0088cc; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; }
        .main-sites a:hover { background: #006699; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: box-shadow 0.2s; }
        .card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
        .card a { color: #333; text-decoration: none; font-size: 15px; display: block; }
        .card a:hover { color: #0088cc; }
        .footer { text-align: center; margin-top: 60px; padding: 30px; color: #666; font-size: 14px; }
        .footer a { color: #0088cc; text-decoration: none; margin: 0 10px; }
    </style>
</head>
<body>
    <h1>Telegram 中文下载中心</h1>
    <h2>快速、安全、免费 - 全平台Telegram客户端下载</h2>

    <!-- 下载区域 - dofollow传递权重 -->
    <div class="download-section">
        <h3>📥 立即下载 Telegram</h3>
        <div class="download-grid">
            ${DOWNLOAD_PAGES.map(dl => `
            <a href="${dl.url}" class="download-btn" title="${dl.name}">
                ${dl.name}
                <span class="platform">${dl.platform}版</span>
            </a>
            `).join('')}
        </div>
    </div>

    <!-- 主站链接 - dofollow传递权重 -->
    <div class="main-sites">
        <h3>🌐 Telegram 官方资源</h3>
        <div class="links">
            ${MAIN_SITES.map(site => `<a href="${site.url}" title="${site.desc}">${site.name}</a>`).join('')}
        </div>
    </div>

    <!-- 文章列表 -->
    <h3 style="color: #333; margin-bottom: 20px;">📚 最新资讯</h3>
    <div class="grid">
        ${pages.map(page => `
        <div class="card">
            <a href="/${page.slug}.html">
                ${page.title}
            </a>
        </div>
        `).join('')}
    </div>

    <div class="footer">
        <p>Telegram中文资讯中心 | 提供最新下载和使用教程</p>
        <p>
            ${MAIN_SITES.map(site => `<a href="${site.url}">${site.name}</a>`).join('')}
        </p>
    </div>
</body>
</html>`
}

interface RouteParams {
  params: {
    domain: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const domain = params.domain
    const searchParams = request.nextUrl.searchParams
    let slug = searchParams.get('slug') || 'index'
    const type = searchParams.get('type')

    // 清理slug（移除开头的/和结尾的.html）
    slug = slug.replace(/^\//, '').replace(/\.html$/, '')

    // 查找域名
    const domainAlias = await prisma.domainAlias.findUnique({
      where: { domain },
      include: {
        website: true
      }
    })

    if (!domainAlias) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    // 获取User-Agent和IP
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''
    const clientIP = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    const isBot = isCrawler(userAgent)
    const botType = detectBot(userAgent)

    // 特殊类型：sitemap.xml
    if (type === 'sitemap' || slug === 'sitemap') {
      const sitemap = await spiderPoolService.generateSitemap(domainAlias.id)

      await prisma.spiderLog.create({
        data: {
          websiteId: domainAlias.websiteId,
          domainAliasId: domainAlias.id,
          ip: clientIP,
          userAgent,
          url: `https://${domain}/sitemap.xml`,
          method: 'GET',
          statusCode: 200,
          referer: referer || null,
          bot: botType,
        }
      })

      return new NextResponse(sitemap, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=86400',
        }
      })
    }

    // 特殊类型：robots.txt
    if (type === 'robots' || slug === 'robots') {
      const robots = await spiderPoolService.generateRobotsTxt(domainAlias.id)

      await prisma.spiderLog.create({
        data: {
          websiteId: domainAlias.websiteId,
          domainAliasId: domainAlias.id,
          ip: clientIP,
          userAgent,
          url: `https://${domain}/robots.txt`,
          method: 'GET',
          statusCode: 200,
          referer: referer || null,
          bot: botType,
        }
      })

      return new NextResponse(robots, {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=86400',
        }
      })
    }

    // 首页
    if (slug === 'index' || slug === '' || slug === '/') {
      const pages = await prisma.spiderPoolPage.findMany({
        where: {
          domainAliasId: domainAlias.id,
          status: 'ACTIVE',
          published: true
        },
        select: {
          pageNum: true,
          slug: true,
          title: true,
          theme: true,
        },
        orderBy: { pageNum: 'asc' },
        take: 50
      })

      const indexHTML = generateIndexHTML(domainAlias.domain, domainAlias.siteName, pages)

      await prisma.spiderLog.create({
        data: {
          websiteId: domainAlias.websiteId,
          domainAliasId: domainAlias.id,
          ip: clientIP,
          userAgent,
          url: `https://${domain}/`,
          method: 'GET',
          statusCode: 200,
          referer: referer || null,
          bot: botType,
        }
      })

      return new NextResponse(indexHTML, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        }
      })
    }

    // 查找页面
    const page = await spiderPoolService.getPageBySlug(domainAlias.id, slug)

    if (!page || page.status !== 'ACTIVE' || !page.published) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // 记录访问和爬虫统计
    await Promise.all([
      spiderPoolService.trackPageView(page.id, isBot),
      prisma.spiderLog.create({
        data: {
          websiteId: domainAlias.websiteId,
          domainAliasId: domainAlias.id,
          ip: clientIP,
          userAgent,
          url: `https://${domain}/${slug}.html`,
          method: 'GET',
          statusCode: 200,
          referer: referer || null,
          bot: botType,
        }
      })
    ])

    // 生成完整的HTML页面（包含下载链接）
    const fullHTML = generatePageHTML(domain, page)

    // 返回HTML内容
    return new NextResponse(fullHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      }
    })

  } catch (error) {
    console.error('[API] 获取蜘蛛池页面失败:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
