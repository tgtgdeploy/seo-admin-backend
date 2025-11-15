/**
 * 检查 Vercel 项目部署状态
 *
 * 使用方法：
 * dotenv -e ../../.env.local -- npx tsx check-vercel-deployments.ts
 */

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN || ''

const PROJECTS = [
  {
    id: 'prj_aN8JC3AfUyQsnTZVdpO84Pf5SPvH',
    name: 'website-tg',
    app: '前端网站 - TG中文纸飞机',
  },
  {
    id: 'prj_dGal6NS8cuRCsXBHRysQ4rMUARWH',
    name: 'website-1',
    app: '前端网站 - Demo 1',
  },
  {
    id: 'prj_UCOP3BYbuHIu9QmVjSN70mzH1bFm',
    name: 'website-2',
    app: '前端网站 - Demo 2',
  },
]

// 需要找到 Admin 项目的 ID
// 可以通过列出所有项目来找到

async function listAllProjects() {
  const url = 'https://api.vercel.com/v9/projects'

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
    return data.projects || []
  } catch (error: any) {
    console.error(`❌ 获取项目列表失败: ${error.message}`)
    return []
  }
}

async function getLatestDeployment(projectId: string) {
  const url = `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1`

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
    return data.deployments?.[0] || null
  } catch (error: any) {
    console.error(`❌ 获取部署失败: ${error.message}`)
    return null
  }
}

async function getProductionDeployment(projectId: string) {
  const url = `https://api.vercel.com/v6/deployments?projectId=${projectId}&target=production&limit=1`

  const headers = {
    'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
  }

  try {
    const response = await fetch(url, { headers })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.deployments?.[0] || null
  } catch (error: any) {
    return null
  }
}

function getStatusEmoji(state: string) {
  switch (state) {
    case 'READY':
      return '✅'
    case 'BUILDING':
      return '🔨'
    case 'ERROR':
      return '❌'
    case 'QUEUED':
      return '⏳'
    case 'CANCELED':
      return '🚫'
    default:
      return '❓'
  }
}

function getStatusText(state: string) {
  switch (state) {
    case 'READY':
      return '部署成功'
    case 'BUILDING':
      return '构建中'
    case 'ERROR':
      return '部署失败'
    case 'QUEUED':
      return '排队中'
    case 'CANCELED':
      return '已取消'
    default:
      return state
  }
}

async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('🔍 检查 Vercel 部署状态')
  console.log('='.repeat(70) + '\n')

  if (!VERCEL_API_TOKEN) {
    console.log('❌ 错误: VERCEL_API_TOKEN 未设置\n')
    process.exit(1)
  }

  // 首先列出所有项目，找到 Admin 项目
  console.log('📋 获取所有项目列表...\n')
  const allProjects = await listAllProjects()

  const adminProject = allProjects.find((p: any) =>
    p.name.toLowerCase().includes('admin') ||
    p.name === 'seo-websites-monorepo-admin'
  )

  const projectsToCheck = [...PROJECTS]

  if (adminProject) {
    projectsToCheck.unshift({
      id: adminProject.id,
      name: adminProject.name,
      app: '管理后台 - Admin',
    })
  }

  let successCount = 0
  let failedCount = 0
  let buildingCount = 0

  for (const project of projectsToCheck) {
    console.log(`\n📦 ${project.app}`)
    console.log(`   项目名: ${project.name}`)
    console.log(`   项目 ID: ${project.id}`)
    console.log('   ' + '-'.repeat(60))

    // 获取最新部署
    const latestDeployment = await getLatestDeployment(project.id)

    if (!latestDeployment) {
      console.log('   ⚠️  未找到部署记录')
      continue
    }

    const emoji = getStatusEmoji(latestDeployment.state)
    const statusText = getStatusText(latestDeployment.state)

    console.log(`   ${emoji} 状态: ${statusText}`)
    console.log(`   🔗 URL: https://${latestDeployment.url}`)
    console.log(`   🕐 时间: ${new Date(latestDeployment.createdAt).toLocaleString('zh-CN')}`)
    console.log(`   📌 分支: ${latestDeployment.meta?.githubCommitRef || 'N/A'}`)

    if (latestDeployment.state === 'READY') {
      successCount++

      // 检查是否为生产部署
      const productionDeployment = await getProductionDeployment(project.id)
      if (productionDeployment && productionDeployment.uid === latestDeployment.uid) {
        console.log(`   ⭐ 当前生产环境`)
      }
    } else if (latestDeployment.state === 'ERROR') {
      failedCount++
      console.log(`   ⚠️  错误信息: ${latestDeployment.error?.message || '未知错误'}`)
    } else if (latestDeployment.state === 'BUILDING') {
      buildingCount++
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('📊 部署状态汇总')
  console.log('='.repeat(70))
  console.log(`✅ 成功: ${successCount} 个项目`)
  console.log(`❌ 失败: ${failedCount} 个项目`)
  console.log(`🔨 构建中: ${buildingCount} 个项目`)
  console.log('='.repeat(70) + '\n')

  if (failedCount > 0) {
    console.log('⚠️  部分项目部署失败，请检查 Vercel Dashboard:')
    console.log('   https://vercel.com/dashboard\n')
  } else if (successCount === projectsToCheck.length) {
    console.log('🎉 所有项目部署成功！\n')
    console.log('💡 下一步:')
    console.log('1. 访问 Admin 后台测试功能')
    console.log('2. 访问前端网站验证数据库连接')
    console.log('3. 检查文章是否正确显示\n')
  }
}

main().catch((error) => {
  console.error('\n❌ 执行出错:', error)
  process.exit(1)
})
