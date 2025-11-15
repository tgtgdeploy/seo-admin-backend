import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '24h'

    // Calculate time threshold based on range
    const now = new Date()
    let threshold = new Date()

    switch (range) {
      case '1h':
        threshold = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '24h':
        threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        threshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    // Get total visits
    const totalVisits = await prisma.spiderLog.count({
      where: {
        createdAt: {
          gte: threshold,
        },
      },
    })

    // Get unique bots
    const uniqueBotsResult = await prisma.spiderLog.groupBy({
      by: ['bot'],
      where: {
        createdAt: {
          gte: threshold,
        },
        bot: {
          not: null,
        },
      },
    })
    const uniqueBots = uniqueBotsResult.length

    // Get top bots with counts
    const topBotsData = await prisma.spiderLog.groupBy({
      by: ['bot'],
      where: {
        createdAt: {
          gte: threshold,
        },
        bot: {
          not: null,
        },
      },
      _count: {
        bot: true,
      },
      orderBy: {
        _count: {
          bot: 'desc',
        },
      },
      take: 5,
    })

    const topBots = topBotsData.map((item: { bot: string | null; _count: { bot: number } }) => ({
      bot: item.bot!,
      count: item._count.bot,
    }))

    // Get recent visits
    const recentVisits = await prisma.spiderLog.findMany({
      where: {
        createdAt: {
          gte: threshold,
        },
      },
      include: {
        website: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    return NextResponse.json({
      totalVisits,
      uniqueBots,
      topBots,
      recentVisits,
    })
  } catch (error) {
    console.error('Failed to fetch spider stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spider statistics' },
      { status: 500 }
    )
  }
}
