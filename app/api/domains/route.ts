import { prisma } from '@repo/database'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const domains = await prisma.domainAlias.findMany({
      include: {
        website: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
      orderBy: [
        { isPrimary: 'desc' },
        { domain: 'asc' },
      ],
    })

    return NextResponse.json(domains)
  } catch (error) {
    console.error('[API] Error fetching domains:', error)
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    )
  }
}
