import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'
import { checkDomainStatus, isVercelConfigured } from '@/lib/vercel-api'

// POST /api/websites/[id]/domains/sync - 同步域名验证状态
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isVercelConfigured()) {
      return NextResponse.json(
        { error: 'Vercel API is not configured' },
        { status: 400 }
      )
    }

    // 获取所有待验证的域名
    const pendingDomains = await prisma.domainAlias.findMany({
      where: {
        websiteId: params.id,
        status: 'PENDING',
      },
    })

    const results = []

    for (const domain of pendingDomains) {
      const status = await checkDomainStatus(params.id, domain.domain)

      if (status.verified) {
        // 更新数据库状态为ACTIVE
        await prisma.domainAlias.update({
          where: { id: domain.id },
          data: { status: 'ACTIVE' },
        })

        results.push({
          domain: domain.domain,
          status: 'ACTIVE',
          message: 'Domain verified and activated',
        })
      } else {
        results.push({
          domain: domain.domain,
          status: 'PENDING',
          message: status.error || 'Domain not yet verified',
        })
      }
    }

    return NextResponse.json({
      synced: results.filter((r) => r.status === 'ACTIVE').length,
      results,
    })
  } catch (error) {
    console.error('Failed to sync domain statuses:', error)
    return NextResponse.json(
      { error: 'Failed to sync domain statuses' },
      { status: 500 }
    )
  }
}
