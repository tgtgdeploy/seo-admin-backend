/**
 * Health Check Endpoint
 *
 * Usage: GET /api/health
 * Returns system status and version info
 */

import { NextResponse } from 'next/server'
import { prisma } from '@repo/database'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`

    // Get stats
    const [websiteCount, postCount] = await Promise.all([
      prisma.website.count(),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
    ])

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      stats: {
        websites: websiteCount,
        publishedPosts: postCount,
      },
      version: '1.0.0',
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: 'Database connection failed',
      },
      { status: 503 }
    )
  }
}
