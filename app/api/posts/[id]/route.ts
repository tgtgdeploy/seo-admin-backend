import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        website: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Failed to fetch post:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
