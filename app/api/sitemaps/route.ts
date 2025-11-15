import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sitemaps = await prisma.sitemap.findMany({
      include: {
        website: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json(sitemaps)
  } catch (error) {
    console.error('Failed to fetch sitemaps:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sitemaps' },
      { status: 500 }
    )
  }
}
