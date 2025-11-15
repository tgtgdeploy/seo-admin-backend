import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'
import {
  submitSitemapToGoogle,
  submitSitemapToBaidu,
  submitSitemapToBing,
} from '@repo/seo-tools'

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
    const { engines } = body

    if (!Array.isArray(engines) || engines.length === 0) {
      return NextResponse.json(
        { error: 'Engines array is required' },
        { status: 400 }
      )
    }

    const sitemap = await prisma.sitemap.findUnique({
      where: { id: params.id },
      include: {
        website: true,
      },
    })

    if (!sitemap) {
      return NextResponse.json({ error: 'Sitemap not found' }, { status: 404 })
    }

    const results: Record<string, any> = {}

    // Submit to requested engines
    for (const engine of engines) {
      try {
        switch (engine.toLowerCase()) {
          case 'google':
            results.google = await submitSitemapToGoogle(sitemap.url)
            break
          case 'bing':
            const bingApiKey = process.env.BING_API_KEY || ''
            results.bing = await submitSitemapToBing(sitemap.url, bingApiKey)
            break
          case 'baidu':
            const baiduToken = process.env.BAIDU_TOKEN || ''
            results.baidu = await submitSitemapToBaidu(
              sitemap.url,
              sitemap.website.domain,
              baiduToken
            )
            break
        }
      } catch (error: any) {
        results[engine] = { success: false, error: error.message }
      }
    }

    // Update last submitted time
    await prisma.sitemap.update({
      where: { id: params.id },
      data: {
        submitted: true,
        submittedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Sitemap submitted to search engines',
      results,
    })
  } catch (error) {
    console.error('Failed to submit sitemap:', error)
    return NextResponse.json(
      { error: 'Failed to submit sitemap' },
      { status: 500 }
    )
  }
}
