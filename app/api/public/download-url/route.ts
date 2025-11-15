/**
 * 公开API: 获取下载链接
 * 供Vercel部署的主站调用
 * GET /api/public/download-url?domain=telegramtghub.com
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@repo/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')

    if (!domain) {
      return NextResponse.json(
        { error: 'Missing domain parameter' },
        { status: 400 }
      )
    }

    // 查找网站
    const website = await prisma.website.findFirst({
      where: {
        OR: [
          { domain },
          { domainAliases: { some: { domain } } }
        ],
        status: 'ACTIVE'
      }
    })

    if (!website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      )
    }

    // 根据域名查找对应的下载链接设置
    // 规则：download_url_{网站域名（去掉.com等后缀）}
    const domainKey = domain.replace(/\.(com|net|org|cn)$/, '').replace(/[.-]/g, '')
    const settingKey = `download_url_${domainKey}`

    // 查找特定域名的下载链接
    let downloadSetting = await prisma.systemSetting.findUnique({
      where: { key: settingKey }
    })

    // 如果没有找到，使用默认下载链接
    if (!downloadSetting) {
      downloadSetting = await prisma.systemSetting.findUnique({
        where: { key: 'download_url_default' }
      })
    }

    // 如果还是没有找到，返回官方下载链接
    const downloadUrl = downloadSetting?.value || 'https://telegram.org/android'

    // 添加CORS头
    const response = NextResponse.json({
      downloadUrl,
      domain,
      websiteName: website.name
    })

    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return response

  } catch (error) {
    console.error('Failed to fetch download URL:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS请求处理（CORS预检）
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}
