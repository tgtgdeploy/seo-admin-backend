import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { prisma } from '@repo/database'
import { getOpenAIModel } from '@/lib/openai-config'

export const runtime = 'nodejs' // 使用 Node.js runtime 以支持 Prisma
export const maxDuration = 300 // 5 minutes for batch processing

interface BatchOptimizeRequest {
  postIds: string[]
  targetLanguage?: string
}

interface OptimizationResult {
  postId: string
  success: boolean
  data?: {
    seoTitle: string
    metaDescription: string
    keywords: string[]
  }
  error?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: BatchOptimizeRequest = await req.json()
    const { postIds, targetLanguage = 'zh-CN' } = body

    if (!postIds || postIds.length === 0) {
      return NextResponse.json(
        { error: 'No post IDs provided' },
        { status: 400 }
      )
    }

    if (postIds.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 posts can be optimized at once' },
        { status: 400 }
      )
    }

    // 获取配置好的 OpenAI 模型实例
    const model = await getOpenAIModel()

    const results: OptimizationResult[] = []

    // Process each post
    for (const postId of postIds) {
      try {
        // Fetch post from database
        const post = await prisma.post.findUnique({
          where: { id: postId },
          select: {
            id: true,
            title: true,
            content: true,
          }
        })

        if (!post) {
          results.push({
            postId,
            success: false,
            error: 'Post not found'
          })
          continue
        }

        const lang = targetLanguage === 'zh-CN' ? '中文' : 'English'

        const prompt = `You are an expert SEO specialist. Optimize the following blog post for search engines.

**Blog Title:** ${post.title}

**Blog Content Preview:** ${post.content.substring(0, 500)}...

**Target Language:** ${lang}

Generate optimized SEO metadata in JSON format:
{
  "seoTitle": "string (50-60 characters, include primary keyword)",
  "metaDescription": "string (150-160 characters, compelling and keyword-rich)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Return ONLY valid JSON.`

        const { text } = await generateText({
          model,
          prompt,
          temperature: 0.7,
        })

        // Parse AI response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const optimizedSEO = JSON.parse(jsonMatch[0])

          // Update post in database
          await prisma.post.update({
            where: { id: postId },
            data: {
              metaTitle: optimizedSEO.seoTitle,
              metaDescription: optimizedSEO.metaDescription,
              metaKeywords: optimizedSEO.keywords,
            }
          })

          results.push({
            postId,
            success: true,
            data: optimizedSEO
          })
        } else {
          throw new Error('Failed to parse AI response')
        }

      } catch (error) {
        results.push({
          postId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      summary: {
        total: postIds.length,
        successful: successCount,
        failed: failureCount
      },
      results
    })

  } catch (error) {
    console.error('Batch AI optimization error:', error)
    return NextResponse.json(
      {
        error: 'Failed to batch optimize',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
