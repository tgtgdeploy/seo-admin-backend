/**
 * API: 生成蜘蛛池页面
 * POST /api/spider-pool/generate
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import spiderPoolService from '@repo/database/src/services/spider-pool.service'

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const body = await request.json()
    const { domainAliasId, theme, pageCount = 150, initSources = false } = body

    // 初始化内容源（仅第一次需要）
    if (initSources) {
      console.log('初始化内容源...')
      await spiderPoolService.initializeContentSources()
    }

    if (domainAliasId && theme) {
      // 为单个域名生成
      await spiderPoolService.generateSpiderPoolPages(domainAliasId, theme, pageCount)

      return NextResponse.json({
        success: true,
        message: `成功为域名生成 ${pageCount} 个页面`,
      })
    } else {
      // 为所有域名生成
      await spiderPoolService.generateAllSpiderPools()

      return NextResponse.json({
        success: true,
        message: '成功为所有蜘蛛池域名生成页面',
      })
    }
  } catch (error) {
    console.error('生成蜘蛛池页面失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '生成失败' },
      { status: 500 }
    )
  }
}
