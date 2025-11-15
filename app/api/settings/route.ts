import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllSettings, getSettingsByCategory } from '@repo/database/lib/settings'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let settings
    if (category) {
      settings = await getSettingsByCategory(category)
    } else {
      settings = await getAllSettings()
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('获取设置失败:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
