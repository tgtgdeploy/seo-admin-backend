/**
 * Public API: Get published posts
 *
 * This endpoint is accessible without session authentication
 * Uses API key authentication for security
 *
 * Usage:
 *   GET /api/public/posts?domain=yourdomain.com
 *   Headers: x-api-key: your-api-key
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@repo/database'
import { verifyApiKey } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const websiteId = searchParams.get('websiteId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Verify API key (optional for public posts, but recommended)
    const apiKeyWebsiteId = await verifyApiKey(request)

    // Build query
    let websiteQuery: any = {}

    if (websiteId) {
      websiteQuery = { id: websiteId }
    } else if (domain) {
      // Support both main domain and aliases
      websiteQuery = {
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
    } else if (apiKeyWebsiteId) {
      // If API key provided, use that website
      websiteQuery = { id: apiKeyWebsiteId }
    } else {
      return NextResponse.json(
        { error: 'Either domain, websiteId, or API key is required' },
        { status: 400 }
      )
    }

    // Fetch posts
    const posts = await prisma.post.findMany({
      where: {
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
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    // Get total count for pagination
    const total = await prisma.post.count({
      where: {
        website: websiteQuery,
        status: 'PUBLISHED',
      },
    })

    return NextResponse.json({
      posts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + posts.length < total,
      },
    })
  } catch (error) {
    console.error('Failed to fetch public posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// Enable CORS for Vercel websites
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
