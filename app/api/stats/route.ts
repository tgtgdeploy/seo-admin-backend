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
    const [totalWebsites, totalPosts, totalKeywords, recentSpiderVisits] =
      await Promise.all([
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
      ])

    return NextResponse.json({
      totalWebsites,
      totalPosts,
      totalKeywords,
      recentSpiderVisits,
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
