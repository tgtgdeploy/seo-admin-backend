import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

/**
 * POST /api/seo/update
 *
 * 手动触发 SEO 数据更新
 *
 * Query Parameters:
 * - type: 'keywords' | 'rankings' | 'both' (default: 'both')
 * - websiteId: string (optional) - 只更新特定网站的关键词
 * - limit: number (optional) - 限制处理的关键词数量
 * - dryRun: boolean (optional) - 试运行，不写入数据库
 */
export async function POST(request: NextRequest) {
  try {
    // 验证登录状态
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 解析查询参数
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'both'
    const websiteId = searchParams.get('websiteId')
    const limit = searchParams.get('limit')
    const dryRun = searchParams.get('dryRun') === 'true'

    // 构建命令参数
    const args: string[] = []

    if (type === 'keywords') {
      args.push('--keywords-only')
    } else if (type === 'rankings') {
      args.push('--rankings-only')
    }

    if (websiteId) {
      args.push(`--website-id=${websiteId}`)
    }

    if (limit) {
      args.push(`--limit=${limit}`)
    }

    if (dryRun) {
      args.push('--dry-run')
    }

    // 获取项目根目录
    const projectRoot = path.resolve(process.cwd(), '../..')

    // 构建完整命令
    const command = `cd ${projectRoot} && npx tsx scripts/update-keyword-data.ts ${args.join(' ')}`

    console.log('Executing SEO update command:', command)

    // 执行脚本（设置30分钟超时）
    const { stdout, stderr } = await execAsync(command, {
      timeout: 30 * 60 * 1000, // 30 minutes
      maxBuffer: 10 * 1024 * 1024, // 10MB
    })

    return NextResponse.json({
      success: true,
      output: stdout,
      errors: stderr || null,
      executedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('SEO update failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        output: error.stdout || null,
        errors: error.stderr || null,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/seo/update/status
 *
 * 检查 SEO API 配置状态和配额
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const status = {
      dataForSEO: {
        configured: !!(
          process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD
        ),
        login: process.env.DATAFORSEO_LOGIN || null,
      },
      serpApi: {
        configured: !!process.env.SERPAPI_KEY,
        hasKey: !!process.env.SERPAPI_KEY,
        quota: undefined as { total: number; used: number; remaining: number } | undefined,
      },
      googleSearchConsole: {
        configured: !!(
          process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GSC_SITE_URL
        ),
        credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || null,
        siteUrl: process.env.GSC_SITE_URL || null,
      },
    }

    // 如果有 SerpApi key，尝试获取配额
    if (status.serpApi.configured && process.env.SERPAPI_KEY) {
      try {
        const quotaResponse = await fetch(
          `https://serpapi.com/account?api_key=${process.env.SERPAPI_KEY}`
        )
        const quotaData = await quotaResponse.json()

        status.serpApi.quota = {
          total: quotaData.total_searches_limit || 0,
          used: quotaData.total_searches || 0,
          remaining:
            (quotaData.total_searches_limit || 0) -
            (quotaData.total_searches || 0),
        }
      } catch (error) {
        console.error('Failed to fetch SerpApi quota:', error)
      }
    }

    return NextResponse.json(status)
  } catch (error: any) {
    console.error('Failed to get SEO status:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
