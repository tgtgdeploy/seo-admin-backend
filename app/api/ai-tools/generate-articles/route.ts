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
        const prompt = `你是 Telegram 领域的专业内容创作者，为中文用户提供实用的使用指南和最佳实践。

主题: ${keyword.keyword}
网站: ${website.name}

请创作一篇实用且易读的文章，要求:
1. 标题自然流畅，围绕"${keyword.keyword}"展开
2. 内容详实 (1500-2000字)，包含实际使用案例和建议
3. 使用清晰的章节结构 (H2/H3 标题)
4. 提供简短摘要，帮助读者快速了解主题
5. 语气友好专业，避免生硬的重复表达

返回 JSON 格式:
{
  "title": "文章标题",
  "slug": "url-friendly-slug",
  "excerpt": "文章摘要 (120-150字)",
  "content": "完整 Markdown 内容",
  "metaTitle": "页面标题",
  "metaDescription": "页面描述 (140-160字)",
  "keywords": ["相关主题1", "相关主题2"],
  "tags": ["分类标签1", "分类标签2"]
}`

        // 增加 temperature 变化，避免生成模式过于规律
        const temperature = 0.7 + Math.random() * 0.4 // 0.7-1.1

        const { text } = await generateText({
          model,
          prompt,
          temperature,
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
            status: 'DRAFT', // 改为草稿，需人工审核后发布
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
