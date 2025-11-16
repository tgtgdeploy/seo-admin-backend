import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'

export const runtime = 'nodejs'
export const maxDuration = 60

async function submitToGoogle(url: string) {
  const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(url)}`

  try {
    const response = await fetch(pingUrl)
    return { success: response.ok, status: response.status }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[AI Tools] 开始提交 Sitemap...`)

    // 获取所有主站
    const websites = await prisma.website.findMany({
      where: { status: 'ACTIVE' },
      include: {
        domainAliases: {
          where: {
            isPrimary: true,
            status: 'ACTIVE',
          },
        },
      },
    })

    console.log(`[AI Tools] 找到 ${websites.length} 个网站`)

    const results = []
    let successCount = 0

    for (const website of websites) {
      if (website.domainAliases.length === 0) {
        results.push({
          website: website.name,
          success: false,
          message: '没有主域名',
        })
        continue
      }

      const domain = website.domainAliases[0].domain
      const sitemapUrl = `https://${domain}/sitemap.xml`

      console.log(`[AI Tools] 提交: ${sitemapUrl}`)

      const result = await submitToGoogle(sitemapUrl)

      results.push({
        website: website.name,
        domain,
        sitemapUrl,
        success: result.success,
        status: result.status,
      })

      if (result.success) {
        successCount++
        console.log(`[AI Tools]   ✅ 提交成功`)
      } else {
        console.log(`[AI Tools]   ❌ 提交失败`)
      }

      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`[AI Tools] 提交完成! 成功: ${successCount}/${websites.length}`)

    return NextResponse.json({
      success: true,
      message: `成功提交 ${successCount} 个网站的 Sitemap`,
      data: {
        total: websites.length,
        successCount,
        results,
      },
      details: results
        .filter(r => r.success)
        .map(r => `✅ ${r.website} - ${r.sitemapUrl}`),
    })

  } catch (error) {
    console.error('[AI Tools] 提交 Sitemap 失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '提交 Sitemap 失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}
