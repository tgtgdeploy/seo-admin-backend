/**
 * API: 蜘蛛池统计数据
 * GET /api/spider-pool/stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'

export async function GET(request: NextRequest) {
  try {
    // 验证登录
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 获取统计数据
    const [
      totalPages,
      totalDomains,
      totalViews,
      totalCrawlerVisits,
      pagesByDomain,
      recentCrawls
    ] = await Promise.all([
      // 总页面数
      prisma.spiderPoolPage.count({
        where: { status: 'ACTIVE', published: true }
      }),

      // 域名数量
      prisma.domainAlias.count({
        where: {
          status: 'ACTIVE',
          spiderPoolPages: { some: {} }
        }
      }),

      // 总访问量
      prisma.spiderPoolPage.aggregate({
        _sum: { views: true }
      }),

      // 爬虫访问总数
      prisma.spiderPoolPage.aggregate({
        _sum: { crawlerVisits: true }
      }),

      // 每个域名的页面数
      prisma.spiderPoolPage.groupBy({
        by: ['domainAliasId'],
        _count: { id: true },
        where: { status: 'ACTIVE', published: true }
      }),

      // 最近被爬取的页面
      prisma.spiderPoolPage.findMany({
        where: {
          lastCrawled: { not: null }
        },
        select: {
          title: true,
          slug: true,
          lastCrawled: true,
          crawlerVisits: true,
          domainAlias: {
            select: { domain: true }
          }
        },
        orderBy: { lastCrawled: 'desc' },
        take: 10
      })
    ])

    // 获取域名详情
    const domainDetails = await prisma.domainAlias.findMany({
      where: {
        id: { in: pagesByDomain.map(d => d.domainAliasId) }
      },
      select: {
        id: true,
        domain: true,
        siteName: true,
      }
    })

    const domainStats = pagesByDomain.map(stat => {
      const domain = domainDetails.find(d => d.id === stat.domainAliasId)
      return {
        domainAliasId: stat.domainAliasId,
        domain: domain?.domain || '',
        siteName: domain?.siteName || '',
        pageCount: stat._count.id
      }
    })

    return NextResponse.json({
      overview: {
        totalPages,
        totalDomains,
        totalViews: totalViews._sum.views || 0,
        totalCrawlerVisits: totalCrawlerVisits._sum.crawlerVisits || 0,
      },
      domainStats,
      recentCrawls
    })
  } catch (error) {
    console.error('获取蜘蛛池统计失败:', error)
    return NextResponse.json(
      { error: '获取失败' },
      { status: 500 }
    )
  }
}
