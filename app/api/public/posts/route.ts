/**
 * 公开API: 获取文章列表
 * 供Vercel部署的主站调用
 * GET /api/public/posts?domain=telegramtghub.com
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@repo/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const slug = searchParams.get('slug')

    if (!domain) {
      return NextResponse.json(
        { error: 'Missing domain parameter' },
        { status: 400 }
      )
    }

    // 查找网站
    const website = await prisma.website.findFirst({
      where: {
        OR: [
          { domain },
          { domainAliases: { some: { domain } } }
        ],
        status: 'ACTIVE'
      }
    })

    if (!website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      )
    }

    // 如果请求单个文章
    if (slug) {
      const post = await prisma.post.findFirst({
        where: {
          slug,
          websiteId: website.id,
          status: 'PUBLISHED'
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
          category: true,
          tags: true,
          publishedAt: true,
          updatedAt: true,
          author: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })

      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ post })
    }

    // 获取文章列表
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          websiteId: website.id,
          status: 'PUBLISHED'
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          metaTitle: true,
          metaDescription: true,
          category: true,
          tags: true,
          publishedAt: true,
          updatedAt: true,
          author: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          publishedAt: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.post.count({
        where: {
          websiteId: website.id,
          status: 'PUBLISHED'
        }
      })
    ])

    // 添加CORS头
    const response = NextResponse.json({
      posts,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    })

    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return response

  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS请求处理（CORS预检）
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}
