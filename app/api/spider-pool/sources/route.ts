/**
 * API: 内容源管理
 * GET /api/spider-pool/sources - 获取内容源列表
 * POST /api/spider-pool/sources - 初始化内容源
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import spiderPoolService from '@repo/database/src/services/spider-pool.service'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // 验证登录
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const sources = await prisma.spiderPoolSource.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ sources })
  } catch (error) {
    console.error('获取内容源失败:', error)
    return NextResponse.json(
      { error: '获取失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    await spiderPoolService.initializeContentSources()

    return NextResponse.json({
      success: true,
      message: '内容源初始化成功'
    })
  } catch (error) {
    console.error('初始化内容源失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '初始化失败' },
      { status: 500 }
    )
  }
}
