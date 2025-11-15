import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'

interface PostStats {
  summary: {
    totalPosts: number
    byStatus: {
      DRAFT: number
      PUBLISHED: number
      SCHEDULED: number
      ARCHIVED: number
    }
    averageSeoScore: number
    totalSynced: number
  }
  byWebsite: {
    websiteId: string
    websiteName: string
    count: number
    published: number
    draft: number
    averageSeoScore: number
  }[]
  seoQuality: {
    withMetaTitle: number
    withMetaDescription: number
    withKeywords: number
    withAllMeta: number
    missingMeta: number
  }
  recentActivity: {
    last7Days: number
    last30Days: number
  }
}

/**
 * Calculate SEO score for a post (0-100)
 * - Meta title: 20 points
 * - Meta description: 20 points
 * - Keywords (3+): 20 points
 * - Content length (>500 chars): 20 points
 * - Tags (2+): 10 points
 * - Cover image: 10 points
 */
function calculateSeoScore(post: any): number {
  let score = 0

  // Meta title (20 points)
  if (post.metaTitle && post.metaTitle.length >= 30 && post.metaTitle.length <= 60) {
    score += 20
  } else if (post.metaTitle) {
    score += 10
  }

  // Meta description (20 points)
  if (post.metaDescription && post.metaDescription.length >= 120 && post.metaDescription.length <= 160) {
    score += 20
  } else if (post.metaDescription) {
    score += 10
  }

  // Keywords (20 points)
  if (post.metaKeywords && post.metaKeywords.length >= 5) {
    score += 20
  } else if (post.metaKeywords && post.metaKeywords.length >= 3) {
    score += 15
  } else if (post.metaKeywords && post.metaKeywords.length > 0) {
    score += 5
  }

  // Content length (20 points)
  if (post.content) {
    const contentLength = post.content.length
    if (contentLength >= 2000) {
      score += 20
    } else if (contentLength >= 1000) {
      score += 15
    } else if (contentLength >= 500) {
      score += 10
    } else if (contentLength >= 300) {
      score += 5
    }
  }

  // Tags (10 points)
  if (post.tags && post.tags.length >= 3) {
    score += 10
  } else if (post.tags && post.tags.length >= 2) {
    score += 7
  } else if (post.tags && post.tags.length > 0) {
    score += 3
  }

  // Cover image (10 points)
  if (post.coverImage) {
    score += 10
  }

  return Math.round(score)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all posts with their relationships
    const posts = await prisma.post.findMany({
      include: {
        website: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Calculate total posts by status
    const byStatus = {
      DRAFT: 0,
      PUBLISHED: 0,
      SCHEDULED: 0,
      ARCHIVED: 0,
    }

    posts.forEach((post) => {
      byStatus[post.status as keyof typeof byStatus]++
    })

    // Calculate SEO quality metrics
    const seoQuality = {
      withMetaTitle: 0,
      withMetaDescription: 0,
      withKeywords: 0,
      withAllMeta: 0,
      missingMeta: 0,
    }

    let totalSeoScore = 0

    posts.forEach((post) => {
      // Calculate SEO score
      const seoScore = calculateSeoScore(post)
      totalSeoScore += seoScore

      // SEO quality counts
      const hasMetaTitle = !!post.metaTitle
      const hasMetaDescription = !!post.metaDescription
      const hasKeywords = post.metaKeywords && post.metaKeywords.length >= 3

      if (hasMetaTitle) seoQuality.withMetaTitle++
      if (hasMetaDescription) seoQuality.withMetaDescription++
      if (hasKeywords) seoQuality.withKeywords++

      if (hasMetaTitle && hasMetaDescription && hasKeywords) {
        seoQuality.withAllMeta++
      } else {
        seoQuality.missingMeta++
      }
    })

    const averageSeoScore = posts.length > 0 ? Math.round(totalSeoScore / posts.length) : 0

    // Calculate synced posts count
    const totalSynced = posts.reduce((sum, post) => sum + post.syncedWebsites.length, 0)

    // Group by website
    const websiteGroups = new Map<string, any>()

    posts.forEach((post) => {
      const websiteId = post.website.id

      if (!websiteGroups.has(websiteId)) {
        websiteGroups.set(websiteId, {
          websiteId,
          websiteName: post.website.name,
          count: 0,
          published: 0,
          draft: 0,
          seoScores: [],
        })
      }

      const group = websiteGroups.get(websiteId)
      group.count++

      if (post.status === 'PUBLISHED') group.published++
      if (post.status === 'DRAFT') group.draft++

      group.seoScores.push(calculateSeoScore(post))
    })

    const byWebsite: any[] = []
    websiteGroups.forEach((group) => {
      byWebsite.push({
        websiteId: group.websiteId,
        websiteName: group.websiteName,
        count: group.count,
        published: group.published,
        draft: group.draft,
        averageSeoScore: group.seoScores.length > 0
          ? Math.round(group.seoScores.reduce((sum: number, score: number) => sum + score, 0) / group.seoScores.length)
          : 0,
      })
    })

    // Sort by count descending
    byWebsite.sort((a, b) => b.count - a.count)

    // Recent activity
    const now = new Date()
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const recentPosts7d = await prisma.post.count({
      where: {
        createdAt: {
          gte: last7Days,
        },
      },
    })

    const recentPosts30d = await prisma.post.count({
      where: {
        createdAt: {
          gte: last30Days,
        },
      },
    })

    const stats: PostStats = {
      summary: {
        totalPosts: posts.length,
        byStatus,
        averageSeoScore,
        totalSynced,
      },
      byWebsite,
      seoQuality,
      recentActivity: {
        last7Days: recentPosts7d,
        last30Days: recentPosts30d,
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('[API] Failed to fetch post stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post statistics' },
      { status: 500 }
    )
  }
}
