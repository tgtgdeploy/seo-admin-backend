import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { setSetting, setSettings } from '@repo/database/lib/settings'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { settings } = body

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    // 批量更新设置
    await setSettings(settings)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('更新设置失败:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { key, value, description, category, isEncrypted } = body

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      )
    }

    await setSetting(key, value, { description, category, isEncrypted })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('更新设置失败:', error)
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    )
  }
}
