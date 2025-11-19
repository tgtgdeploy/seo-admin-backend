import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'

// GET - 获取单个下载配置
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = await prisma.downloadConfig.findUnique({
      where: { id: params.id },
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

    if (!config) {
      return NextResponse.json(
        { error: 'Download config not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Failed to fetch download config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch download config' },
      { status: 500 }
    )
  }
}

// PATCH - 更新下载配置
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
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

    // 检查配置是否存在
    const existingConfig = await prisma.downloadConfig.findUnique({
      where: { id: params.id }
    })

    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Download config not found' },
        { status: 404 }
      )
    }

    // 如果设置为默认，将同一网站的同一平台的其他配置设为非默认
    if (isDefault && !existingConfig.isDefault) {
      await prisma.downloadConfig.updateMany({
        where: {
          websiteId: existingConfig.websiteId,
          platform: existingConfig.platform,
          isDefault: true,
          id: { not: params.id }
        },
        data: {
          isDefault: false
        }
      })
    }

    const updateData: any = {}
    if (downloadUrl !== undefined) updateData.downloadUrl = downloadUrl
    if (storeUrl !== undefined) updateData.storeUrl = storeUrl
    if (version !== undefined) updateData.version = version
    if (releaseDate !== undefined) updateData.releaseDate = new Date(releaseDate)
    if (fileSize !== undefined) updateData.fileSize = fileSize
    if (minOsVersion !== undefined) updateData.minOsVersion = minOsVersion
    if (status !== undefined) updateData.status = status
    if (isDefault !== undefined) updateData.isDefault = isDefault
    if (priority !== undefined) updateData.priority = priority

    const config = await prisma.downloadConfig.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(config)
  } catch (error) {
    console.error('Failed to update download config:', error)
    return NextResponse.json(
      { error: 'Failed to update download config' },
      { status: 500 }
    )
  }
}

// DELETE - 删除下载配置
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.downloadConfig.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to delete download config:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Download config not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete download config' },
      { status: 500 }
    )
  }
}
