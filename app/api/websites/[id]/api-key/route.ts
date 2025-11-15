/**
 * API endpoint to generate/regenerate website API key
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@repo/database'
import { generateApiKey } from '@/lib/generate-api-key'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can generate API keys' },
        { status: 403 }
      )
    }

    // Generate new API key
    const apiKey = generateApiKey()

    // Update website
    const website = await prisma.website.update({
      where: { id: params.id },
      data: {
        apiKey,
        apiEnabled: true,
      },
      select: {
        id: true,
        name: true,
        domain: true,
        apiKey: true,
        apiEnabled: true,
      },
    })

    return NextResponse.json({
      message: 'API key generated successfully',
      website,
    })
  } catch (error: any) {
    console.error('Failed to generate API key:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to generate API key' },
      { status: 500 }
    )
  }
}

// Get current API key
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const website = await prisma.website.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        domain: true,
        apiKey: true,
        apiEnabled: true,
      },
    })

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    return NextResponse.json(website)
  } catch (error) {
    console.error('Failed to fetch API key:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API key' },
      { status: 500 }
    )
  }
}

// Delete/disable API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can delete API keys' },
        { status: 403 }
      )
    }

    const website = await prisma.website.update({
      where: { id: params.id },
      data: {
        apiEnabled: false,
      },
      select: {
        id: true,
        name: true,
        apiEnabled: true,
      },
    })

    return NextResponse.json({
      message: 'API key disabled successfully',
      website,
    })
  } catch (error) {
    console.error('Failed to disable API key:', error)
    return NextResponse.json(
      { error: 'Failed to disable API key' },
      { status: 500 }
    )
  }
}
