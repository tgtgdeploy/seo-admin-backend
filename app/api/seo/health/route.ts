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

    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Get all domains with their statistics
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

    // Calculate SEO health for each domain
    const domainHealth = await Promise.all(
      domains.map(async (domain) => {
        // 1. Count indexed pages (published posts)
        const publishedPosts = await prisma.post.count({
          where: {
            websiteId: domain.website.id,
            status: 'PUBLISHED',
            metaKeywords: {
              hasSome: domain.primaryTags,
            },
          },
        })

        // Total posts (for percentage)
        const totalPosts = await prisma.post.count({
          where: {
            websiteId: domain.website.id,
            status: 'PUBLISHED',
          },
        })

        // 2. Spider crawl activity (last 24h)
        const crawlCount = await prisma.spiderLog.count({
          where: {
            createdAt: {
              gte: last24h,
            },
            url: {
              contains: domain.domain,
            },
          },
        })

        // 3. Keyword rankings (count how many keywords have rankings)
        const keywordsWithRankings = await prisma.keywordRanking.findMany({
          where: {
            domainAliasId: domain.id,
            createdAt: {
              gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          include: {
            keyword: {
              select: {
                keyword: true,
              },
            },
          },
          distinct: ['keywordId'],
          orderBy: {
            position: 'asc',
          },
          take: 10,
        })

        const topKeywords = keywordsWithRankings.filter(r => r.position <= 10).length

        // 4. Bot diversity
        const uniqueBots = await prisma.spiderLog.groupBy({
          by: ['bot'],
          where: {
            createdAt: {
              gte: last24h,
            },
            url: {
              contains: domain.domain,
            },
            bot: {
              not: null,
            },
          },
        })

        // Calculate health score (0-100)
        let healthScore = 0
        const issues: string[] = []

        // Indexed pages (30 points)
        const indexedPercentage = totalPosts > 0 ? (publishedPosts / totalPosts) * 100 : 0
        const indexedScore = Math.min(30, (indexedPercentage / 100) * 30)
        healthScore += indexedScore

        if (indexedPercentage < 50) {
          issues.push('low_indexed_rate')
        }

        // Crawl activity (30 points)
        const crawlScore = Math.min(30, (crawlCount / 20) * 30)
        healthScore += crawlScore

        if (crawlCount === 0) {
          issues.push('no_recent_crawls')
        } else if (crawlCount < 5) {
          issues.push('low_crawl_activity')
        }

        // Keyword rankings (25 points)
        const rankingScore = Math.min(25, topKeywords * 5)
        healthScore += rankingScore

        if (topKeywords === 0) {
          issues.push('no_top_rankings')
        }

        // Bot diversity (15 points)
        const botScore = Math.min(15, uniqueBots.length * 5)
        healthScore += botScore

        if (uniqueBots.length < 2) {
          issues.push('low_bot_diversity')
        }

        return {
          domain: domain.domain,
          siteName: domain.siteName,
          isPrimary: domain.isPrimary,
          domainType: domain.domainType,
          website: domain.website,
          primaryTags: domain.primaryTags,
          healthScore: Math.round(healthScore),
          metrics: {
            indexedPages: publishedPosts,
            totalPages: totalPosts,
            indexedPercentage: Math.round(indexedPercentage),
            crawlCount24h: crawlCount,
            topKeywords,
            uniqueBots: uniqueBots.length,
          },
          issues,
        }
      })
    )

    // Calculate overall statistics
    const totalHealthScore = domainHealth.reduce((sum, d) => sum + d.healthScore, 0)
    const averageHealth = domainHealth.length > 0 ? Math.round(totalHealthScore / domainHealth.length) : 0

    const totalIndexed = domainHealth.reduce((sum, d) => sum + d.metrics.indexedPages, 0)
    const totalPages = domainHealth.reduce((sum, d) => sum + d.metrics.totalPages, 0)
    const totalCrawls = domainHealth.reduce((sum, d) => sum + d.metrics.crawlCount24h, 0)
    const totalTopKeywords = domainHealth.reduce((sum, d) => sum + d.metrics.topKeywords, 0)

    // Sort by health score descending
    domainHealth.sort((a, b) => b.healthScore - a.healthScore)

    return NextResponse.json({
      summary: {
        totalDomains: domainHealth.length,
        averageHealth,
        totalIndexed,
        totalPages,
        indexedRate: totalPages > 0 ? Math.round((totalIndexed / totalPages) * 100) : 0,
        totalCrawls24h: totalCrawls,
        totalTopKeywords,
      },
      domains: domainHealth,
    })
  } catch (error) {
    console.error('[API] Failed to fetch SEO health:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SEO health data' },
      { status: 500 }
    )
  }
}
