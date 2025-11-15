/**
 * 验证 Vercel 项目的环境变量
 *
 * 使用方法：
 * dotenv -e ../../.env.local -- npx tsx verify-vercel-env-vars.ts
 */

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN || ''

const PROJECTS = [
  {
    id: 'prj_aN8JC3AfUyQsnTZVdpO84Pf5SPvH',
    name: 'website-tg',
  },
  {
    id: 'prj_dGal6NS8cuRCsXBHRysQ4rMUARWH',
    name: 'website-1',
  },
  {
    id: 'prj_UCOP3BYbuHIu9QmVjSN70mzH1bFm',
    name: 'website-2',
  },
]

async function getEnvVars(projectId: string) {
  const url = `https://api.vercel.com/v9/projects/${projectId}/env`

  const headers = {
    'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
  }

  try {
    const response = await fetch(url, { headers })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Vercel API 错误: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return data.envs || []
  } catch (error: any) {
    console.error(`   ❌ 获取失败: ${error.message}`)
    return []
  }
}

async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('🔍 验证 Vercel 项目环境变量')
  console.log('='.repeat(70) + '\n')

  if (!VERCEL_API_TOKEN) {
    console.log('❌ 错误: VERCEL_API_TOKEN 未设置\n')
    process.exit(1)
  }

  for (const project of PROJECTS) {
    console.log(`\n📦 项目: ${project.name}`)
    console.log(`   ID: ${project.id}`)
    console.log('   ' + '-'.repeat(60))

    const envVars = await getEnvVars(project.id)

    if (envVars.length === 0) {
      console.log('   ⚠️  未找到任何环境变量')
      continue
    }

    // 查找 DATABASE_URL
    const databaseUrl = envVars.find((env: any) => env.key === 'DATABASE_URL')

    if (databaseUrl) {
      console.log('   ✅ DATABASE_URL 已配置')
      console.log(`      类型: ${databaseUrl.type}`)
      console.log(`      环境: ${databaseUrl.target?.join(', ') || 'N/A'}`)
      console.log(`      值: ${databaseUrl.value ? '***已加密***' : '(未显示)'}`)
      console.log(`      创建时间: ${new Date(databaseUrl.createdAt).toLocaleString('zh-CN')}`)
    } else {
      console.log('   ❌ DATABASE_URL 未配置')
    }

    // 显示所有环境变量
    console.log(`\n   📋 共有 ${envVars.length} 个环境变量:`)
    envVars.forEach((env: any) => {
      const targets = env.target?.join(',') || 'all'
      console.log(`      • ${env.key} (${targets})`)
    })
  }

  console.log('\n' + '='.repeat(70))
  console.log('✅ 验证完成')
  console.log('='.repeat(70) + '\n')
}

main().catch((error) => {
  console.error('\n❌ 执行出错:', error)
  process.exit(1)
})
