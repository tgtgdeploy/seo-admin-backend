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

// 推荐资源配置
const RECOMMENDED_SITES = [
  { name: 'Telegram 下载', url: 'https://adminapihub.xyz', desc: 'APK下载站' },
  { name: 'Telegram 中文版', url: 'https://telegramservice.com', desc: '中文主站' },
  { name: 'Telegram 工具箱', url: 'https://telegramtoolkit.com', desc: '工具主站' },
]

// 生成首页HTML
function generateIndexHTML(domain: string, siteName: string, pages: any[]): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${domain} - ${siteName}</title>
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
        .main-sites a:hover { background: #006699; }
    </style>
</head>
<body>
    <h1>${domain}</h1>
    <h2 style="text-align: center; color: #666; margin-bottom: 40px;">Telegram 中文资讯中心</h2>

    <div class="grid">
        ${pages.map(page => `
        <div class="card">
            <a href="/${page.slug}.html">
                📄 ${page.title}
            </a>
        </div>
        `).join('')}
    </div>

    <div class="main-sites">
        <h3>推荐资源</h3>
        ${RECOMMENDED_SITES.map(site => `<a href="${site.url}" target="_blank" rel="nofollow">${site.name}</a>`).join('')}
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

    // 返回HTML内容
    return new NextResponse(page.content, {
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
