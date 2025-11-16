import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'
import { generateText } from 'ai'
import { getOpenAIModel } from '@/lib/openai-config'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { limit = 20 } = body

    console.log(`[AI Tools] 开始优化内容...`)

    // 获取需要优化的文章
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { metaTitle: null },
          { metaDescription: null },
          { metaKeywords: { isEmpty: true } },
        ],
      },
      take: limit,
    })

    console.log(`[AI Tools] 找到 ${posts.length} 篇需要优化的文章`)

    if (posts.length === 0) {
      return NextResponse.json({
        success: true,
        message: '所有文章的 SEO 信息都已优化！',
        data: { total: 0, optimizedCount: 0 },
      })
    }

    const model = await getOpenAIModel()

    const results = []
    let successCount = 0

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]

      console.log(`[AI Tools] [${i + 1}/${posts.length}] 优化: ${post.title}`)

      try {
        const prompt = `你是 SEO 专家。请优化以下文章的 SEO 元信息:

**标题**: ${post.title}
**当前 Meta**: ${post.metaDescription || '无'}
**内容预览**: ${post.content.substring(0, 500)}...

提供优化建议，返回 JSON:
{
  "optimizedTitle": "优化后的 SEO 标题 (50-60字符)",
  "optimizedMetaDescription": "优化后的描述 (150-160字符)",
  "optimizedKeywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"],
  "suggestions": ["改进建议1", "改进建议2"]
}`

        const { text } = await generateText({
          model,
          prompt,
          temperature: 0.7,
          maxTokens: 1500,
        })

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error('AI 未返回有效的 JSON')
        }

        const optimization = JSON.parse(jsonMatch[0])

        // 更新文章
        await prisma.post.update({
          where: { id: post.id },
          data: {
            metaTitle: optimization.optimizedTitle,
            metaDescription: optimization.optimizedMetaDescription,
            metaKeywords: optimization.optimizedKeywords,
          },
        })

        results.push({
          title: post.title,
          optimized: true,
          suggestions: optimization.suggestions,
        })

        successCount++
        console.log(`[AI Tools]   ✅ 成功优化`)

      } catch (error) {
        console.error(`[AI Tools]   ❌ 优化失败:`, error)
        results.push({
          title: post.title,
          optimized: false,
          error: error instanceof Error ? error.message : '未知错误',
        })
      }

      // 避免 API 限流
      if (i < posts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
    }

    console.log(`[AI Tools] 优化完成! 成功: ${successCount}/${posts.length}`)

    return NextResponse.json({
      success: true,
      message: `成功优化 ${successCount} 篇文章`,
      data: {
        total: posts.length,
        optimizedCount: successCount,
        results,
      },
      details: results.filter(r => r.optimized).map(r => `✅ ${r.title}`),
    })

  } catch (error) {
    console.error('[AI Tools] 优化内容失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '优化内容失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}
