const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN || ''

const PROJECT_IDS = [
  'prj_aN8JC3AfUyQsnTZVdpO84Pf5SPvH',
  'prj_dGal6NS8cuRCsXBHRysQ4rMUARWH',
  'prj_UCOP3BYbuHIu9QmVjSN70mzH1bFm',
]

async function checkProjectDetails() {
  console.log('\n' + '='.repeat(70))
  console.log('🔍 检查 Vercel 项目详细信息')
  console.log('='.repeat(70))

  for (const projectId of PROJECT_IDS) {
    console.log(`\n📦 项目 ID: ${projectId}`)
    console.log('   ' + '-'.repeat(60))

    try {
      const headers = {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
      }

      const response = await fetch(
        `https://api.vercel.com/v9/projects/${projectId}`,
        { headers }
      )

      if (!response.ok) {
        console.log(`   ❌ HTTP ${response.status}: ${response.statusText}`)
        continue
      }

      const project = await response.json()

      console.log(`   ✅ 项目名称: ${project.name}`)
      console.log(`   框架: ${project.framework || '未检测到'}`)
      console.log(`   创建时间: ${new Date(project.createdAt).toLocaleString('zh-CN')}`)
      console.log(`   更新时间: ${new Date(project.updatedAt).toLocaleString('zh-CN')}`)

      // 检查部署
      const deploymentsResponse = await fetch(
        `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=5`,
        { headers }
      )

      if (deploymentsResponse.ok) {
        const deploymentsData = await deploymentsResponse.json()
        const deployments = deploymentsData.deployments || []

        console.log(`\n   📊 最近部署:`)
        if (deployments.length === 0) {
          console.log(`      ⚠️  该项目还没有任何部署`)
        } else {
          deployments.slice(0, 3).forEach((d: any) => {
            const status = d.state === 'READY' ? '✅' : d.state === 'ERROR' ? '❌' : '⏳'
            console.log(`      ${status} ${d.url || '无域名'} (${d.state})`)
          })
        }
      }

      // 检查域名
      console.log(`\n   🌐 域名配置:`)
      if (!project.targets || Object.keys(project.targets).length === 0) {
        console.log(`      ⚠️  未配置生产环境`)
      }

      if (!project.alias || project.alias.length === 0) {
        console.log(`      ⚠️  未配置域名别名`)
      } else {
        console.log(`      找到 ${project.alias.length} 个别名:`)
        project.alias.forEach((alias: any) => {
          console.log(`      - ${alias.domain || alias}`)
        })
      }

    } catch (error: any) {
      console.log(`   ❌ 错误: ${error.message}`)
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('💡 建议')
  console.log('='.repeat(70))
  console.log('\n如果项目还没有部署:')
  console.log('  1. 访问 https://vercel.com/dashboard')
  console.log('  2. 选择项目 → Deployments')
  console.log('  3. 触发一次部署（或推送代码自动部署）')
  console.log('  4. 部署成功后会自动生成 .vercel.app 域名')
  console.log('\n如果想添加自定义域名:')
  console.log('  1. 项目 → Settings → Domains')
  console.log('  2. 添加你的域名')
  console.log('  3. 配置 DNS 解析')
  console.log('  4. 然后运行同步脚本\n')
}

checkProjectDetails()
