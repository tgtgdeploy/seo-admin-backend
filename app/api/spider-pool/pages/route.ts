/**
 * API: 获取蜘蛛池页面列表
 * GET /api/spider-pool/pages?domainAliasId=xxx
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // 验证登录
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const domainAliasId = searchParams.get('domainAliasId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where = domainAliasId ? { domainAliasId } : {}

    const [pages, total] = await Promise.all([
      prisma.spiderPoolPage.findMany({
        where,
        include: {
          domainAlias: {
            select: {
              domain: true,
              siteName: true,
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { domainAliasId: 'asc' },
          { pageNum: 'asc' }
        ]
      }),
      prisma.spiderPoolPage.count({ where })
    ])

    return NextResponse.json({
      pages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取蜘蛛池页面列表失败:', error)
    return NextResponse.json(
      { error: '获取失败' },
      { status: 500 }
    )
  }
}
