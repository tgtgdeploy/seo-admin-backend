import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get stats in parallel
    const [
      totalWebsites,
      totalPosts,
      totalKeywords,
      recentSpiderVisits,
      spiderPoolDomains,
      spiderPoolPages,
      totalDomainVisits,
      activeDomains,
    ] = await Promise.all([
      prisma.website.count(),
      prisma.post.count(),
      prisma.keyword.count(),
      prisma.spiderLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
      // Spider Pool stats
      prisma.domainAlias.count({
        where: { domainType: 'SPIDER_POOL' },
      }),
      prisma.spiderPoolPage.count(),
      prisma.domainAlias.aggregate({
        where: { domainType: 'SPIDER_POOL' },
        _sum: { visits: true },
      }),
      prisma.domainAlias.count({
        where: {
          domainType: 'SPIDER_POOL',
          status: 'ACTIVE',
        },
      }),
    ])

    return NextResponse.json({
      totalWebsites,
      totalPosts,
      totalKeywords,
      recentSpiderVisits,
      spiderPool: {
        totalDomains: spiderPoolDomains,
        totalPages: spiderPoolPages,
        totalVisits: totalDomainVisits._sum.visits || 0,
        activeDomains,
      },
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
