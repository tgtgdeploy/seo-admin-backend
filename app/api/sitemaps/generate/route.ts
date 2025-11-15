import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'
import { generateSitemap } from '@repo/seo-tools'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { websiteId } = body

    if (!websiteId) {
      return NextResponse.json(
        { error: 'Website ID is required' },
        { status: 400 }
      )
    }

    // Get website details
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        posts: {
          where: {
            status: 'PUBLISHED',
          },
          select: {
            slug: true,
            updatedAt: true,
          },
        },
      },
    })

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    // Generate sitemap URLs
    const baseUrl = `https://${website.domain}`
    const urls = [
      {
        url: '/',
        changefreq: 'daily' as const,
        priority: 1.0,
      },
      {
        url: '/blog',
        changefreq: 'daily' as const,
        priority: 0.9,
      },
      ...website.posts.map((post: { slug: string; updatedAt: Date }) => ({
        url: `/blog/${post.slug}`,
        changefreq: 'weekly' as const,
        priority: 0.8,
        lastmod: post.updatedAt.toISOString(),
      })),
    ]

    const sitemapXml = await generateSitemap({ hostname: baseUrl }, urls)
    const sitemapUrl = `${baseUrl}/sitemap.xml`

    // Update or create sitemap record
    const existingSitemap = await prisma.sitemap.findFirst({
      where: { websiteId },
    })

    if (existingSitemap) {
      await prisma.sitemap.update({
        where: { id: existingSitemap.id },
        data: {
          urls: urls.length,
        },
      })
    } else {
      await prisma.sitemap.create({
        data: {
          url: sitemapUrl,
          websiteId,
          urls: urls.length,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Sitemap generated successfully',
      url: sitemapUrl,
      totalUrls: urls.length,
    })
  } catch (error) {
    console.error('Failed to generate sitemap:', error)
    return NextResponse.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 }
    )
  }
}
