import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { getOpenAIModel } from '@/lib/openai-config'

export const runtime = 'nodejs'
export const maxDuration = 300

interface AnalyzeContentRequest {
  title: string
  content: string
  targetKeywords?: string[]
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeContentRequest = await req.json()
    const { title, content, targetKeywords = [] } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // 获取配置好的 OpenAI 模型实例
    const model = await getOpenAIModel()

    const keywordsStr = targetKeywords.length > 0 ? targetKeywords.join(', ') : 'none'

    const prompt = `You are an SEO content auditor. Perform a comprehensive SEO analysis of this blog post.

**Title:** ${title}

**Content:** ${content}

**Target Keywords:** ${keywordsStr}

Analyze the content and provide:
1. SEO Score (0-100)
2. Readability Score (0-100)
3. Keyword Density Analysis
4. Content Structure Evaluation (headings, paragraphs, lists)
5. Detailed Improvement Recommendations (at least 5)
6. Strengths of the current content
7. Missing elements (internal links, images, CTAs, etc.)

Return ONLY valid JSON in this format:
{
  "seoScore": number,
  "readabilityScore": number,
  "wordCount": number,
  "keywordDensity": {
    "keyword": "density percentage"
  },
  "structure": {
    "hasH1": boolean,
    "headingCount": number,
    "paragraphCount": number,
    "imageCount": number,
    "linkCount": number
  },
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "category": "string",
      "issue": "string",
      "solution": "string"
    }
  ],
  "strengths": ["string"],
  "missingElements": ["string"]
}`

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.6,
    })

    let analysis
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
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
      data: analysis,
    })
  } catch (error) {
    console.error('AI content analysis error:', error)
    return NextResponse.json(
      {
        error: 'Failed to analyze content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
