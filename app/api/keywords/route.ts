import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 支持按网站和域名筛选
    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')
    const domainAliasId = searchParams.get('domainAliasId')

    const keywords = await prisma.keyword.findMany({
      where: websiteId ? { websiteId } : undefined,
      include: {
        website: {
          select: {
            id: true,
            name: true,
          },
        },
        rankings: {
          where: domainAliasId ? { domainAliasId } : undefined,
          select: {
            position: true,
            createdAt: true,
            searchEngine: true,
            domainAliasId: true,
            domainAlias: {
              select: {
                domain: true,
                siteName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(keywords)
  } catch (error) {
    console.error('Failed to fetch keywords:', error)
    return NextResponse.json(
      { error: 'Failed to fetch keywords' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { keyword, volume, difficulty, cpc, websiteId } = body

    if (!keyword || !websiteId) {
      return NextResponse.json(
        { error: 'Keyword and websiteId are required' },
        { status: 400 }
      )
    }

    // 检查关键词是否已存在
    const existing = await prisma.keyword.findUnique({
      where: {
        websiteId_keyword: {
          websiteId,
          keyword,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Keyword already exists for this website' },
        { status: 409 }
      )
    }

    const newKeyword = await prisma.keyword.create({
      data: {
        keyword,
        volume: volume ? parseInt(volume) : null,
        difficulty: difficulty ? parseInt(difficulty) : null,
        cpc: cpc ? parseFloat(cpc) : null,
        websiteId,
      },
      include: {
        website: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(newKeyword, { status: 201 })
  } catch (error) {
    console.error('Failed to create keyword:', error)
    return NextResponse.json(
      { error: 'Failed to create keyword' },
      { status: 500 }
    )
  }
}
