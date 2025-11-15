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

    // Get the original post with all details
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: true
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Track results
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[]
    }

    // Sync to each selected website
    for (const websiteId of websiteIds) {
      try {
        // Check if post already exists for this website
        const existingPost = await prisma.post.findFirst({
          where: {
            slug: post.slug,
            websiteId: websiteId
          }
        })

        if (existingPost) {
          // Update existing post
          await prisma.post.update({
            where: { id: existingPost.id },
            data: {
              title: post.title,
              content: post.content,
              excerpt: post.excerpt,
              coverImage: post.coverImage,
              metaTitle: post.metaTitle,
              metaDescription: post.metaDescription,
              metaKeywords: post.metaKeywords,
              category: post.category,
              tags: post.tags,
              status: post.status,
              publishedAt: post.publishedAt,
              updatedAt: new Date()
            }
          })
          results.updated++
        } else {
          // Create new post for this website
          await prisma.post.create({
            data: {
              title: post.title,
              slug: post.slug,
              content: post.content,
              excerpt: post.excerpt,
              coverImage: post.coverImage,
              metaTitle: post.metaTitle,
              metaDescription: post.metaDescription,
              metaKeywords: post.metaKeywords,
              category: post.category,
              tags: post.tags,
              websiteId: websiteId,
              authorId: post.authorId,
              status: post.status,
              publishedAt: post.publishedAt || new Date()
            }
          })
          results.created++
        }
      } catch (error) {
        console.error(`Failed to sync to website ${websiteId}:`, error)
        results.errors.push(`Website ${websiteId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Update original post's syncedWebsites array
    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        syncedWebsites: {
          set: [...new Set([...post.syncedWebsites, ...websiteIds])],
        },
      },
    })

    return NextResponse.json({
      success: true,
      post: updatedPost,
      results,
      message: `Created: ${results.created}, Updated: ${results.updated}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`,
    })
  } catch (error) {
    console.error('Failed to sync post:', error)
    return NextResponse.json({ error: 'Failed to sync post' }, { status: 500 })
  }
}
