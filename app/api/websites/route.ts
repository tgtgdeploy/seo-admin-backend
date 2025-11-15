import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const websites = await prisma.website.findMany({
      include: {
        _count: {
          select: {
            posts: true,
            keywords: true,
            domainAliases: true,
          },
        },
        domainAliases: {
          where: {
            status: 'ACTIVE'
          },
          orderBy: {
            isPrimary: 'desc'
          },
          select: {
            id: true,
            domain: true,
            siteName: true,
            isPrimary: true,
            status: true,
            primaryTags: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 添加Vercel项目ID映射
    const vercelProjectMapping: Record<string, string> = {
      'TG中文纸飞机': 'prj_aN8JC3AfUyQsnTZVdpO84Pf5SPvH',
      'Demo Website 1': 'prj_dGal6NS8cuRCsXBHRysQ4rMUARWH',
      'Demo Website 2': 'prj_UCOP3BYbuHIu9QmVjSN70mzH1bFm',
    }

    const websitesWithVercel = websites.map(website => ({
      ...website,
      vercelProjectId: vercelProjectMapping[website.name] || null,
      vercelProjectName: website.name.includes('TG') ? 'website-tg' :
                        website.name.includes('1') ? 'website-1' : 'website-2',
    }))

    return NextResponse.json(websitesWithVercel)
  } catch (error) {
    console.error('Failed to fetch websites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch websites' },
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
    const { name, domain, description, seoTitle, seoDescription, seoKeywords } = body

    if (!name || !domain) {
      return NextResponse.json(
        { error: 'Name and domain are required' },
        { status: 400 }
      )
    }

    const website = await prisma.website.create({
      data: {
        name,
        domain,
        description,
        seoTitle,
        seoDescription,
        seoKeywords: seoKeywords || [],
      },
    })

    return NextResponse.json(website, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create website:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A website with this domain already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create website' },
      { status: 500 }
    )
  }
}
