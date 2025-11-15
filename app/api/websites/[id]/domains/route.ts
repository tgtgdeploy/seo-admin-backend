import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'
import { addDomainToVercel, isVercelConfigured } from '@/lib/vercel-api'

// GET /api/websites/[id]/domains - 获取网站的所有域名别名
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const domains = await prisma.domainAlias.findMany({
      where: { websiteId: params.id },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(domains)
  } catch (error) {
    console.error('Failed to fetch domains:', error)
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    )
  }
}

// POST /api/websites/[id]/domains - 添加新的域名别名
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

    // 检查域名是否已存在
    const existing = await prisma.domainAlias.findUnique({
      where: { domain: body.domain },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Domain already exists' },
        { status: 400 }
      )
    }

    // 创建域名别名（初始状态为PENDING）
    const domain = await prisma.domainAlias.create({
      data: {
        domain: body.domain,
        siteName: body.siteName,
        siteDescription: body.siteDescription,
        primaryTags: body.primaryTags || [],
        secondaryTags: body.secondaryTags || [],
        status: 'PENDING', // 初始状态为待配置
        isPrimary: body.isPrimary || false,
        websiteId: params.id,
      },
    })

    // 尝试自动添加到Vercel（如果已配置）
    let vercelResult
    if (isVercelConfigured()) {
      vercelResult = await addDomainToVercel(params.id, body.domain)

      if (vercelResult.success) {
        console.log(`Domain ${body.domain} added to Vercel successfully`)
      } else {
        console.warn(
          `Failed to add domain ${body.domain} to Vercel: ${vercelResult.error}`
        )
      }
    }

    return NextResponse.json(
      {
        ...domain,
        vercelAdded: vercelResult?.success || false,
        vercelError: vercelResult?.error,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create domain:', error)
    return NextResponse.json(
      { error: 'Failed to create domain' },
      { status: 500 }
    )
  }
}
