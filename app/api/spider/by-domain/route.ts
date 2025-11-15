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

    // Get all domains
    const domains = await prisma.domainAlias.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        website: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
      orderBy: [
        { isPrimary: 'desc' },
        { domain: 'asc' },
      ],
    })

    // Get spider logs for each domain by matching URL patterns
    const domainStats = await Promise.all(
      domains.map(async (domain) => {
        // Count total visits for this domain (match URL contains domain)
        const totalVisits = await prisma.spiderLog.count({
          where: {
            createdAt: {
              gte: threshold,
            },
            url: {
              contains: domain.domain,
            },
          },
        })

        // Get bot breakdown for this domain
        const botBreakdown = await prisma.spiderLog.groupBy({
          by: ['bot'],
          where: {
            createdAt: {
              gte: threshold,
            },
            url: {
              contains: domain.domain,
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
        })

        const bots = botBreakdown.map((item) => ({
          name: item.bot!,
          count: item._count.bot,
        }))

        // Get most recent visit
        const recentVisit = await prisma.spiderLog.findFirst({
          where: {
            url: {
              contains: domain.domain,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            createdAt: true,
            bot: true,
          },
        })

        // Calculate health score (0-100)
        // Based on: total visits, bot diversity, and recency
        let healthScore = 0

        // Visit volume (max 40 points)
        healthScore += Math.min(40, (totalVisits / 50) * 40)

        // Bot diversity (max 30 points)
        healthScore += Math.min(30, bots.length * 10)

        // Recency (max 30 points)
        if (recentVisit) {
          const hoursSinceLastVisit = (now.getTime() - new Date(recentVisit.createdAt).getTime()) / (1000 * 60 * 60)
          if (hoursSinceLastVisit < 1) {
            healthScore += 30
          } else if (hoursSinceLastVisit < 24) {
            healthScore += 20
          } else if (hoursSinceLastVisit < 168) {
            healthScore += 10
          }
        }

        return {
          domain: domain.domain,
          siteName: domain.siteName,
          isPrimary: domain.isPrimary,
          website: domain.website,
          primaryTags: domain.primaryTags,
          totalVisits,
          bots,
          lastVisit: recentVisit?.createdAt,
          lastBot: recentVisit?.bot,
          healthScore: Math.round(healthScore),
        }
      })
    )

    // Sort by total visits descending
    domainStats.sort((a, b) => b.totalVisits - a.totalVisits)

    return NextResponse.json({
      domains: domainStats,
      totalDomains: domainStats.length,
      activeDomains: domainStats.filter(d => d.totalVisits > 0).length,
      averageHealth: Math.round(
        domainStats.reduce((sum, d) => sum + d.healthScore, 0) / domainStats.length || 0
      ),
    })
  } catch (error) {
    console.error('[API] Failed to fetch spider stats by domain:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spider statistics by domain' },
      { status: 500 }
    )
  }
}
