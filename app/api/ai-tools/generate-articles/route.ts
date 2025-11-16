import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'
import { generateText } from 'ai'
import { getOpenAIModel } from '@/lib/openai-config'

export const runtime = 'nodejs'
export const maxDuration = 300

interface GenerateArticlesRequest {
  count?: number
  websiteId?: string | null
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: GenerateArticlesRequest = await req.json()
    const { count = 10, websiteId } = body

    console.log(`[AI Tools] 开始生成 ${count} 篇文章...`)

    // 1. 获取目标网站
    let websites
    if (websiteId) {
      const website = await prisma.website.findUnique({
        where: { id: websiteId },
      })
      websites = website ? [website] : []
    } else {
      websites = await prisma.website.findMany({
        where: { status: 'ACTIVE' },
      })
    }

    if (websites.length === 0) {
      return NextResponse.json({
        success: false,
        message: '未找到可用网站',
      })
    }

    // 2. 获取关键词（按搜索量和难度排序）
    const keywords = await prisma.keyword.findMany({
      orderBy: [
        { volume: 'desc' },
        { difficulty: 'asc' },
      ],
      take: count,
    })

    if (keywords.length === 0) {
      return NextResponse.json({
        success: false,
        message: '没有可用的关键词，请先添加关键词',
      })
    }

    console.log(`[AI Tools] 找到 ${keywords.length} 个关键词`)

    // 3. 获取 AI 模型
    const model = await getOpenAIModel()

    // 4. 生成文章
    const results = []
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i]
      const website = websites[i % websites.length]

      console.log(`[AI Tools] [${i + 1}/${keywords.length}] 生成: ${keyword.keyword}`)

      try {
        // AI 生成文章
        const prompt = `你是一位专业的 SEO 内容写作专家，专注于 Telegram 相关主题。

目标关键词: ${keyword.keyword}
网站名称: ${website.name}

请创作一篇高质量的 SEO 优化文章，要求:
1. 标题 (50-60字符): 必须包含目标关键词
2. 文章内容 (1500-2500字): 结构清晰，使用 H2、H3 标题，关键词密度 2-3%
3. Meta Description (150-160字符)
4. 5-7 个相关关键词

返回 JSON 格式:
{
  "title": "文章标题",
  "slug": "url-friendly-slug",
  "excerpt": "文章摘要 (150字)",
  "content": "完整 Markdown 内容",
  "metaTitle": "SEO 标题",
  "metaDescription": "SEO 描述",
  "keywords": ["关键词1", "关键词2"],
  "tags": ["标签1", "标签2"]
}`

        const { text } = await generateText({
          model,
          prompt,
          temperature: 0.8,
          maxTokens: 4000,
        })

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error('AI 未返回有效的 JSON')
        }

        const article = JSON.parse(jsonMatch[0])

        // 保存到数据库
        const post = await prisma.post.create({
          data: {
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            content: article.content,
            metaTitle: article.metaTitle,
            metaDescription: article.metaDescription,
            metaKeywords: article.keywords,
            tags: article.tags || [],
            status: 'DRAFT',
            websiteId: website.id,
            authorId: session.user.id,
          },
        })

        results.push({
          keyword: keyword.keyword,
          title: article.title,
          postId: post.id,
          success: true,
        })

        successCount++
        console.log(`[AI Tools]   ✅ 成功: ${article.title}`)

      } catch (error) {
        console.error(`[AI Tools]   ❌ 失败:`, error)
        results.push({
          keyword: keyword.keyword,
          success: false,
          error: error instanceof Error ? error.message : '未知错误',
        })
        failCount++
      }

      // 避免 API 限流
      if (i < keywords.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    console.log(`[AI Tools] 完成! 成功: ${successCount}, 失败: ${failCount}`)

    return NextResponse.json({
      success: true,
      message: `成功生成 ${successCount} 篇文章，失败 ${failCount} 篇`,
      data: {
        total: keywords.length,
        successCount,
        failCount,
        results,
      },
      details: results.filter(r => r.success).map(r => `✅ ${r.title}`),
    })

  } catch (error) {
    console.error('[AI Tools] 生成文章失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '生成文章失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}
