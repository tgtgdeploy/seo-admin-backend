import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'

// GET /api/domains/[domainId]/stats - 获取域名的SEO统计
export async function GET(
  request: NextRequest,
  { params }: { params: { domainId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '24h'

    // 计算时间范围
    const now = new Date()
    let startDate = new Date()

    switch (range) {
      case '1h':
        startDate.setHours(now.getHours() - 1)
        break
      case '24h':
        startDate.setHours(now.getHours() - 24)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      default:
        startDate.setHours(now.getHours() - 24)
    }

    // 获取爬虫访问统计
    const spiderLogs = await prisma.spiderLog.findMany({
      where: {
        domainAliasId: params.domainId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    // 统计爬虫类型
    const botCounts: Record<string, number> = {}
    spiderLogs.forEach((log) => {
      if (log.bot) {
        botCounts[log.bot] = (botCounts[log.bot] || 0) + 1
      }
    })

    const topBots = Object.entries(botCounts)
      .map(([bot, count]) => ({ bot, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return NextResponse.json({
      totalVisits: spiderLogs.length,
      uniqueBots: Object.keys(botCounts).length,
      topBots,
      recentVisits: spiderLogs.slice(0, 10),
    })
  } catch (error) {
    console.error('Failed to fetch domain stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch domain stats' },
      { status: 500 }
    )
  }
}
