import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'

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
    const { websiteIds } = body

    if (!Array.isArray(websiteIds) || websiteIds.length === 0) {
      return NextResponse.json(
        { error: 'Website IDs array is required' },
        { status: 400 }
      )
    }

    // Get the original post
    const post = await prisma.post.findUnique({
      where: { id: params.id },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Update the post with synced website IDs
    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        syncedWebsites: {
          set: [...new Set([...post.syncedWebsites, ...websiteIds])],
        },
      },
    })

    // In a real implementation, you would also:
    // 1. Create duplicate posts for each target website
    // 2. Or trigger webhook/API calls to sync content to external systems
    // 3. Or add to a sync queue for background processing

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: `Post synced to ${websiteIds.length} website(s)`,
    })
  } catch (error) {
    console.error('Failed to sync post:', error)
    return NextResponse.json({ error: 'Failed to sync post' }, { status: 500 })
  }
}
