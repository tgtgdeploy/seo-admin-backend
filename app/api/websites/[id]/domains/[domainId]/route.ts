import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'
import {
  removeDomainFromVercel,
  isVercelConfigured,
} from '@/lib/vercel-api'

// PATCH /api/websites/[id]/domains/[domainId] - 更新域名别名
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; domainId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const domain = await prisma.domainAlias.update({
      where: { id: params.domainId },
      data: {
        domain: body.domain,
        siteName: body.siteName,
        siteDescription: body.siteDescription,
        primaryTags: body.primaryTags,
        secondaryTags: body.secondaryTags,
        status: body.status,
        isPrimary: body.isPrimary,
      },
    })

    return NextResponse.json(domain)
  } catch (error) {
    console.error('Failed to update domain:', error)
    return NextResponse.json(
      { error: 'Failed to update domain' },
      { status: 500 }
    )
  }
}

// DELETE /api/websites/[id]/domains/[domainId] - 删除域名别名
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; domainId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 获取域名信息
    const domain = await prisma.domainAlias.findUnique({
      where: { id: params.domainId },
    })

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    // 从数据库删除
    await prisma.domainAlias.delete({
      where: { id: params.domainId },
    })

    // 尝试从Vercel删除（如果已配置）
    if (isVercelConfigured()) {
      const vercelResult = await removeDomainFromVercel(
        params.id,
        domain.domain
      )

      if (vercelResult.success) {
        console.log(`Domain ${domain.domain} removed from Vercel successfully`)
      } else {
        console.warn(
          `Failed to remove domain ${domain.domain} from Vercel: ${vercelResult.error}`
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete domain:', error)
    return NextResponse.json(
      { error: 'Failed to delete domain' },
      { status: 500 }
    )
  }
}
