/**
 * Public API: Get single post by slug
 *
 * Usage:
 *   GET /api/public/posts/my-article-slug?domain=yourdomain.com
 *   Headers: x-api-key: your-api-key (optional)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@repo/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const websiteId = searchParams.get('websiteId')

    if (!domain && !websiteId) {
      return NextResponse.json(
        { error: 'Either domain or websiteId is required' },
        { status: 400 }
      )
    }

    // Build query
    const websiteQuery: any = websiteId
      ? { id: websiteId }
      : {
          OR: [
            { domain: domain },
            {
              domainAliases: {
                some: {
                  domain: domain,
                  isActive: true,
                },
              },
            },
          ],
        }

    // Fetch post
    const post = await prisma.post.findFirst({
      where: {
        slug: params.slug,
        website: websiteQuery,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        coverImage: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        tags: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        website: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Failed to fetch post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

// Enable CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key, authorization',
    },
  })
}
