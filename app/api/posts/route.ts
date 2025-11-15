import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'

/**
 * Calculate SEO score for a post (0-100)
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

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')
    const status = searchParams.get('status')

    const posts = await prisma.post.findMany({
      where: {
        ...(websiteId && { websiteId }),
        ...(status && { status: status as any }),
      },
      include: {
        website: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Add SEO scores to each post
    const postsWithScores = posts.map((post) => ({
      ...post,
      seoScore: calculateSeoScore(post),
    }))

    return NextResponse.json(postsWithScores)
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      content,
      metaTitle,
      metaDescription,
      metaKeywords,
      websiteId,
      status,
    } = body

    if (!title || !slug || !content || !websiteId) {
      return NextResponse.json(
        { error: 'Title, slug, content, and website are required' },
        { status: 400 }
      )
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        metaTitle,
        metaDescription,
        metaKeywords: metaKeywords || [],
        websiteId,
        status: status || 'DRAFT',
        authorId: session.user.id,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create post:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A post with this slug already exists for this website' },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
