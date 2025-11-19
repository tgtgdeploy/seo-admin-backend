import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'

// GET - 获取所有下载配置
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

    const where = websiteId ? { websiteId } : {}

    const configs = await prisma.downloadConfig.findMany({
      where,
      include: {
        website: {
          select: {
            id: true,
            name: true,
            domain: true
          }
        }
      },
      orderBy: [
        { websiteId: 'asc' },
        { platform: 'asc' },
        { priority: 'desc' }
      ]
    })

    return NextResponse.json(configs)
  } catch (error) {
    console.error('Failed to fetch download configs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch download configs' },
      { status: 500 }
    )
  }
}

// POST - 创建新的下载配置
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      websiteId,
      platform,
      downloadUrl,
      storeUrl,
      version,
      releaseDate,
      fileSize,
      minOsVersion,
      status,
      isDefault,
      priority
    } = body

    if (!websiteId || !platform || !version || !releaseDate) {
      return NextResponse.json(
        { error: 'websiteId, platform, version, and releaseDate are required' },
        { status: 400 }
      )
    }

    // 如果设置为默认，将同一网站的同一平台的其他配置设为非默认
    if (isDefault) {
      await prisma.downloadConfig.updateMany({
        where: {
          websiteId,
          platform,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      })
    }

    const config = await prisma.downloadConfig.create({
      data: {
        websiteId,
        platform,
        downloadUrl,
        storeUrl,
        version,
        releaseDate: new Date(releaseDate),
        fileSize,
        minOsVersion,
        status: status || 'ACTIVE',
        isDefault: isDefault || false,
        priority: priority || 0
      },
      include: {
        website: {
          select: {
            id: true,
            name: true,
            domain: true
          }
        }
      }
    })

    return NextResponse.json(config, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create download config:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A default configuration for this website and platform already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create download config' },
      { status: 500 }
    )
  }
}
