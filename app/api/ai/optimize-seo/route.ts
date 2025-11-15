import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { getOpenAIModel } from '@/lib/openai-config'

// 改为 Node.js runtime 以支持数据库访问
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 分钟超时

interface OptimizeSEORequest {
  title: string
  content: string
  keywords?: string[]
  targetLanguage?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: OptimizeSEORequest = await req.json()
    const { title, content, keywords = [], targetLanguage = 'zh-CN' } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // 获取配置好的 OpenAI 模型实例
    const model = await getOpenAIModel()

    // Prepare the prompt for SEO optimization
    const keywordsStr = keywords.length > 0 ? keywords.join(', ') : 'none provided'
    const lang = targetLanguage === 'zh-CN' ? '中文' : 'English'

    const prompt = `You are an expert SEO specialist. Analyze the following blog post and generate optimized SEO metadata.

**Blog Title:** ${title}

**Blog Content Preview:** ${content.substring(0, 500)}...

**Target Keywords:** ${keywordsStr}

**Target Language:** ${lang}

Please provide the following in JSON format:
1. An optimized SEO title (50-60 characters, include primary keyword)
2. An optimized meta description (150-160 characters, compelling and keyword-rich)
3. 5-7 recommended SEO keywords based on the content
4. Content optimization suggestions (3-5 bullet points)

Return ONLY valid JSON in this exact format:
{
  "seoTitle": "string",
  "metaDescription": "string",
  "keywords": ["keyword1", "keyword2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...]
}`

    // Generate AI response（使用配置的模型和 API Key）
    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
    })

    // Parse the AI response
    let optimizedSEO
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        optimizedSEO = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No valid JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: text },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: optimizedSEO,
    })
  } catch (error) {
    console.error('AI SEO optimization error:', error)
    return NextResponse.json(
      {
        error: 'Failed to optimize SEO',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
