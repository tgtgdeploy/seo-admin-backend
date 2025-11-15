import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'

// GET /api/keywords/[id] - 获取单个关键词详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const keyword = await prisma.keyword.findUnique({
      where: { id: params.id },
      include: {
        website: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
        rankings: {
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
        },
      },
    })

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword not found' }, { status: 404 })
    }

    return NextResponse.json(keyword)
  } catch (error) {
    console.error('Failed to fetch keyword:', error)
    return NextResponse.json(
      { error: 'Failed to fetch keyword' },
      { status: 500 }
    )
  }
}

// PUT /api/keywords/[id] - 更新关键词
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { keyword, volume, difficulty, cpc } = body

    // 检查关键词是否存在
    const existing = await prisma.keyword.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Keyword not found' }, { status: 404 })
    }

    // 如果更新了关键词名称，检查是否与其他关键词重复
    if (keyword && keyword !== existing.keyword) {
      const duplicate = await prisma.keyword.findUnique({
        where: {
          websiteId_keyword: {
            websiteId: existing.websiteId,
            keyword,
          },
        },
      })

      if (duplicate) {
        return NextResponse.json(
          { error: 'Keyword already exists for this website' },
          { status: 409 }
        )
      }
    }

    const updated = await prisma.keyword.update({
      where: { id: params.id },
      data: {
        keyword: keyword || existing.keyword,
        volume: volume !== undefined ? (volume ? parseInt(volume) : null) : existing.volume,
        difficulty: difficulty !== undefined ? (difficulty ? parseInt(difficulty) : null) : existing.difficulty,
        cpc: cpc !== undefined ? (cpc ? parseFloat(cpc) : null) : existing.cpc,
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

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update keyword:', error)
    return NextResponse.json(
      { error: 'Failed to update keyword' },
      { status: 500 }
    )
  }
}

// DELETE /api/keywords/[id] - 删除关键词
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 检查关键词是否存在
    const existing = await prisma.keyword.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Keyword not found' }, { status: 404 })
    }

    // 删除关键词（会级联删除所有排名记录）
    await prisma.keyword.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Keyword deleted successfully' })
  } catch (error) {
    console.error('Failed to delete keyword:', error)
    return NextResponse.json(
      { error: 'Failed to delete keyword' },
      { status: 500 }
    )
  }
}
