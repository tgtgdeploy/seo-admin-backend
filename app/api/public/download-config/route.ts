/**
 * 公开API: 获取下载配置
 * 供下载页调用，支持多平台下载配置
 * GET /api/public/download-config?domain=telegramtghub.com
 * GET /api/public/download-config?domain=telegramtghub.com&platform=android
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@repo/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const platform = searchParams.get('platform')

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
      },
      include: {
        downloadConfigs: {
          where: {
            status: 'ACTIVE'
          },
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' }
          ]
        }
      }
    })

    if (!website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      )
    }

    // 如果指定了平台，只返回该平台的配置
    if (platform) {
      const config = website.downloadConfigs.find(c => c.platform === platform)

      if (!config) {
        return NextResponse.json(
          { error: 'Platform configuration not found' },
          { status: 404 }
        )
      }

      const response = NextResponse.json({
        platform: config.platform,
        downloadUrl: config.downloadUrl,
        storeUrl: config.storeUrl,
        version: config.version,
        releaseDate: config.releaseDate,
        fileSize: config.fileSize,
        minOsVersion: config.minOsVersion,
        websiteName: website.name
      })

      // 添加CORS头
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type')

      return response
    }

    // 返回所有平台配置
    const configs = website.downloadConfigs.map(config => ({
      platform: config.platform,
      downloadUrl: config.downloadUrl,
      storeUrl: config.storeUrl,
      version: config.version,
      releaseDate: config.releaseDate,
      fileSize: config.fileSize,
      minOsVersion: config.minOsVersion
    }))

    const response = NextResponse.json({
      websiteName: website.name,
      domain: website.domain,
      configs
    })

    // 添加CORS头
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return response

  } catch (error) {
    console.error('Failed to fetch download config:', error)
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
