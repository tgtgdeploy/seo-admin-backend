import { NextResponse } from 'next/server'
import { prisma } from '@repo/database'

/**
 * GET /api/spider-pool/domains
 * 获取所有蜘蛛池域名，按VPS分组
 */
export async function GET() {
  try {
    // 获取所有蜘蛛池域名
    const domains = await prisma.domainAlias.findMany({
      where: {
        domainType: 'SPIDER_POOL',
      },
      include: {
        _count: {
          select: {
            spiderPoolPages: true,
            spiderLogs: true,
          },
        },
      },
      orderBy: {
        domain: 'asc',
      },
    })

    // VPS域名映射
    const vpsMapping: { [key: string]: string[] } = {
      'VPS-1': ['autopushnetwork.xyz', 'contentpoolzone.site', 'crawlboostnet.xyz'],
      'VPS-2': [
        'seohubnetwork.xyz',
        'spidertrackzone.xyz',
        'trafficboostflow.site',
        'globalinsighthub.xyz',
        'adminapihub.xyz',
        'infostreammedia.xyz',
      ],
      'VPS-3': ['rankspiderchain.xyz', 'linkpushmatrix.site', 'crawlenginepro.xyz'],
    }

    // 按VPS分组
    const groupedDomains = {
      'VPS-1': [] as any[],
      'VPS-2': [] as any[],
      'VPS-3': [] as any[],
      'Unknown': [] as any[],
    }

    domains.forEach((domain) => {
      let assigned = false
      for (const [vps, domainList] of Object.entries(vpsMapping)) {
        if (domainList.includes(domain.domain)) {
          groupedDomains[vps].push({
            ...domain,
            pageCount: domain._count.spiderPoolPages,
            spiderLogCount: domain._count.spiderLogs,
          })
          assigned = true
          break
        }
      }
      if (!assigned) {
        groupedDomains['Unknown'].push({
          ...domain,
          pageCount: domain._count.spiderPoolPages,
          spiderLogCount: domain._count.spiderLogs,
        })
      }
    })

    // 计算统计数据
    const stats = {
      total: domains.length,
      active: domains.filter((d) => d.status === 'ACTIVE').length,
      inactive: domains.filter((d) => d.status === 'INACTIVE').length,
      totalVisits: domains.reduce((sum, d) => sum + d.visits, 0),
      'VPS-1': groupedDomains['VPS-1'].length,
      'VPS-2': groupedDomains['VPS-2'].length,
      'VPS-3': groupedDomains['VPS-3'].length,
    }

    return NextResponse.json({
      success: true,
      domains: groupedDomains,
      stats,
    })
  } catch (error) {
    console.error('Error fetching spider pool domains:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch domains' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/spider-pool/domains
 * 批量更新域名
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { domainIds, updates } = body

    if (!Array.isArray(domainIds) || domainIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'domainIds is required and must be a non-empty array' },
        { status: 400 }
      )
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { success: false, error: 'updates object is required' },
        { status: 400 }
      )
    }

    // 构建更新数据
    const updateData: any = {}

    if (updates.status) {
      updateData.status = updates.status
    }

    if (updates.primaryTags) {
      updateData.primaryTags = updates.primaryTags
    }

    if (updates.secondaryTags) {
      updateData.secondaryTags = updates.secondaryTags
    }

    if (updates.siteName) {
      updateData.siteName = updates.siteName
    }

    if (updates.siteDescription) {
      updateData.siteDescription = updates.siteDescription
    }

    // 批量更新
    const result = await prisma.domainAlias.updateMany({
      where: {
        id: {
          in: domainIds,
        },
        domainType: 'SPIDER_POOL', // 只允许更新蜘蛛池域名
      },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.count} domains`,
      count: result.count,
    })
  } catch (error) {
    console.error('Error batch updating domains:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update domains' },
      { status: 500 }
    )
  }
}
