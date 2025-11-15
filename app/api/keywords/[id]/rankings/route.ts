import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'

// POST /api/keywords/[id]/rankings - 添加排名记录
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { position, url, searchEngine, domainAliasId } = body

    if (!position || !url || !searchEngine) {
      return NextResponse.json(
        { error: 'Position, URL, and searchEngine are required' },
        { status: 400 }
      )
    }

    // 检查关键词是否存在
    const keyword = await prisma.keyword.findUnique({
      where: { id: params.id },
    })

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword not found' }, { status: 404 })
    }

    // 如果提供了domainAliasId，验证它是否属于同一个网站
    if (domainAliasId) {
      const domainAlias = await prisma.domainAlias.findUnique({
        where: { id: domainAliasId },
      })

      if (!domainAlias || domainAlias.websiteId !== keyword.websiteId) {
        return NextResponse.json(
          { error: 'Invalid domain alias' },
          { status: 400 }
        )
      }
    }

    // 创建排名记录
    const ranking = await prisma.keywordRanking.create({
      data: {
        position: parseInt(position),
        url,
        searchEngine,
        domainAliasId: domainAliasId || null,
        keywordId: params.id,
      },
      include: {
        domainAlias: {
          select: {
            id: true,
            domain: true,
            siteName: true,
          },
        },
      },
    })

    return NextResponse.json(ranking, { status: 201 })
  } catch (error) {
    console.error('Failed to create ranking:', error)
    return NextResponse.json(
      { error: 'Failed to create ranking' },
      { status: 500 }
    )
  }
}

// GET /api/keywords/[id]/rankings - 获取排名历史
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const domainAliasId = searchParams.get('domainAliasId')
    const searchEngine = searchParams.get('searchEngine')
    const limit = searchParams.get('limit')

    const rankings = await prisma.keywordRanking.findMany({
      where: {
        keywordId: params.id,
        ...(domainAliasId && { domainAliasId }),
        ...(searchEngine && { searchEngine }),
      },
      include: {
        domainAlias: {
          select: {
            id: true,
            domain: true,
            siteName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit ? parseInt(limit) : 100,
    })

    return NextResponse.json(rankings)
  } catch (error) {
    console.error('Failed to fetch rankings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rankings' },
      { status: 500 }
    )
  }
}
