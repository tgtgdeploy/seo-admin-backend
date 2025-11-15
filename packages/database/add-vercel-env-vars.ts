/**
 * 自动为 Vercel 项目添加环境变量
 *
 * 使用方法：
 * dotenv -e ../../.env.local -- npx tsx add-vercel-env-vars.ts
 */

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN || ''
const DATABASE_URL = process.env.DATABASE_URL || ''

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

interface EnvVar {
  type: 'encrypted' | 'plain' | 'secret' | 'system'
  key: string
  value: string
  target: ('production' | 'preview' | 'development')[]
}

async function addEnvVar(projectId: string, projectName: string, envVar: EnvVar) {
  const url = `https://api.vercel.com/v10/projects/${projectId}/env`

  const headers = {
    'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
    'Content-Type': 'application/json',
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(envVar),
    })

    if (!response.ok) {
      const error = await response.json()

      // 如果环境变量已存在，返回友好提示
      if (error.error?.code === 'ENV_ALREADY_EXISTS') {
        return {
          success: false,
          alreadyExists: true,
          message: '环境变量已存在',
        }
      }

      throw new Error(`Vercel API 错误: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return {
      success: true,
      alreadyExists: false,
      data,
    }
  } catch (error: any) {
    return {
      success: false,
      alreadyExists: false,
      message: error.message,
    }
  }
}

async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('🔧 为 Vercel 项目添加环境变量')
  console.log('='.repeat(70) + '\n')

  // 检查必需的环境变量
  if (!VERCEL_API_TOKEN) {
    console.log('❌ 错误: VERCEL_API_TOKEN 未设置\n')
    console.log('请运行: dotenv -e ../../.env.local -- npx tsx add-vercel-env-vars.ts\n')
    process.exit(1)
  }

  if (!DATABASE_URL) {
    console.log('❌ 错误: DATABASE_URL 未设置\n')
    console.log('请在 .env.local 中添加 DATABASE_URL\n')
    process.exit(1)
  }

  console.log('✅ VERCEL_API_TOKEN: ' + VERCEL_API_TOKEN.substring(0, 10) + '...')
  console.log('✅ DATABASE_URL: ' + DATABASE_URL.substring(0, 50) + '...\n')

  let successCount = 0
  let existsCount = 0
  let failedCount = 0

  for (const project of PROJECTS) {
    console.log(`\n📦 项目: ${project.name} (${project.id.substring(0, 20)}...)`)
    console.log('   ' + '-'.repeat(60))

    // 添加 DATABASE_URL 环境变量
    const result = await addEnvVar(project.id, project.name, {
      type: 'encrypted',  // 加密存储敏感数据
      key: 'DATABASE_URL',
      value: DATABASE_URL,
      target: ['production', 'preview', 'development'],  // 所有环境
    })

    if (result.success) {
      console.log('   ✅ DATABASE_URL 添加成功')
      console.log('      环境: Production, Preview, Development')
      successCount++
    } else if (result.alreadyExists) {
      console.log('   ⏭️  DATABASE_URL 已存在，跳过')
      existsCount++
    } else {
      console.log(`   ❌ 添加失败: ${result.message}`)
      failedCount++
    }
  }

  // 汇总结果
  console.log('\n' + '='.repeat(70))
  console.log('📊 添加结果汇总')
  console.log('='.repeat(70))
  console.log(`✅ 成功添加: ${successCount} 个项目`)
  console.log(`⏭️  已存在: ${existsCount} 个项目`)
  console.log(`❌ 失败: ${failedCount} 个项目`)
  console.log('='.repeat(70) + '\n')

  if (successCount > 0 || existsCount > 0) {
    console.log('💡 下一步:')
    console.log('1. 重新部署项目以应用新环境变量:')
    console.log('   → 访问 https://vercel.com/dashboard')
    console.log('   → 选择项目 → Deployments → Redeploy')
    console.log('\n2. 或者等待下次 git push 自动触发部署\n')
    console.log('3. 部署完成后，验证网站是否能正常访问数据库\n')
  }
}

main().catch((error) => {
  console.error('\n❌ 执行出错:', error)
  process.exit(1)
})
