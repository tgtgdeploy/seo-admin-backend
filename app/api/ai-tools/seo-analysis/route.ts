import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'
import { generateText } from 'ai'
import { getOpenAIModel } from '@/lib/openai-config'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[AI Tools] 开始 SEO 分析...`)

    // 收集网站数据
    const websites = await prisma.website.findMany({
      where: { status: 'ACTIVE' },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
        domainAliases: {
          where: { isPrimary: true },
        },
      },
    })

    const keywords = await prisma.keyword.findMany({
      take: 20,
      orderBy: { volume: 'desc' },
    })

    const recentPosts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 10,
      select: {
        title: true,
        metaKeywords: true,
        viewCount: true,
      },
    })

    const totalPosts = await prisma.post.count({
      where: { status: 'PUBLISHED' },
    })

    const spiderPoolPages = await prisma.spiderPoolPage.count()

    // 构建分析数据
    const analysisData = {
      websites: websites.map(w => ({
        name: w.name,
        domain: w.domainAliases[0]?.domain || 'N/A',
        postCount: w._count.posts,
      })),
      totalPosts,
      spiderPoolPages,
      topKeywords: keywords.slice(0, 10).map(k => ({
        keyword: k.keyword,
        volume: k.volume,
        difficulty: k.difficulty,
      })),
      recentPosts: recentPosts.map(p => ({
        title: p.title,
        views: p.viewCount,
      })),
    }

    console.log(`[AI Tools] 数据收集完成，开始 AI 分析...`)

    // AI 分析
    const model = await getOpenAIModel()

    const prompt = `你是一位资深的 SEO 专家。请分析以下网站数据并提供专业的 SEO 优化建议:

**网站概况**:
${analysisData.websites.map(w => `- ${w.name} (${w.domain}): ${w.postCount} 篇文章`).join('\n')}

**总体数据**:
- 总发布文章: ${totalPosts} 篇
- 蜘蛛池页面: ${spiderPoolPages} 个
- 重点关键词: ${analysisData.topKeywords.map(k => `${k.keyword} (${k.volume}/月)`).join(', ')}

**最近文章**:
${analysisData.recentPosts.map(p => `- ${p.title} (${p.views} 次浏览)`).join('\n')}

请提供:
1. **整体评估** (1-10分): 当前 SEO 状况评分
2. **优势分析** (3-5 点): 当前做得好的地方
3. **问题诊断** (3-5 点): 存在的主要问题
4. **改进建议** (5-7 点): 具体可执行的优化建议
5. **30天行动计划** (5 个具体任务)

返回 JSON 格式:
{
  "score": 7.5,
  "strengths": ["优势1", "优势2", ...],
  "issues": ["问题1", "问题2", ...],
  "recommendations": ["建议1", "建议2", ...],
  "actionPlan": ["任务1", "任务2", ...],
  "summary": "总结性评语 (100字)"
}`

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('AI 未返回有效的 JSON')
    }

    const analysis = JSON.parse(jsonMatch[0])

    console.log(`[AI Tools] AI 分析完成，评分: ${analysis.score}/10`)

    return NextResponse.json({
      success: true,
      message: `SEO 分析完成，综合评分: ${analysis.score}/10`,
      data: {
        ...analysis,
        siteData: analysisData,
      },
      details: [
        `📊 评分: ${analysis.score}/10`,
        `✅ 优势: ${analysis.strengths.length} 项`,
        `⚠️  问题: ${analysis.issues.length} 项`,
        `💡 建议: ${analysis.recommendations.length} 项`,
      ],
    })

  } catch (error) {
    console.error('[AI Tools] SEO 分析失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'SEO 分析失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}
