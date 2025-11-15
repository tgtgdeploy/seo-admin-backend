const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN || ''

const PROJECT_IDS = [
  { id: 'prj_aN8JC3AfUyQsnTZVdpO84Pf5SPvH', name: 'website-tg' },
  { id: 'prj_dGal6NS8cuRCsXBHRysQ4rMUARWH', name: 'website-1' },
  { id: 'prj_UCOP3BYbuHIu9QmVjSN70mzH1bFm', name: 'website-2' },
]

async function checkProductionDomains() {
  console.log('\n' + '='.repeat(70))
  console.log('🔍 检查 Vercel 生产域名配置')
  console.log('='.repeat(70))

  for (const project of PROJECT_IDS) {
    console.log(`\n📦 ${project.name}`)
    console.log(`   项目 ID: ${project.id}`)
    console.log('   ' + '-'.repeat(60))

    try {
      const headers = {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
      }

      // 获取项目信息
      const projectResponse = await fetch(
        `https://api.vercel.com/v9/projects/${project.id}`,
        { headers }
      )

      if (!projectResponse.ok) {
        console.log(`   ❌ 无法访问项目`)
        continue
      }

      const projectData = await projectResponse.json()

      // 检查生产部署
      console.log(`\n   🚀 生产部署:`)
      if (projectData.targets?.production) {
        const prodAlias = projectData.targets.production.alias || []
        if (prodAlias.length > 0) {
          console.log(`      ✅ 已配置生产域名:`)
          prodAlias.forEach((alias: string) => {
            console.log(`         • https://${alias}`)
          })
        } else {
          console.log(`      ⚠️  未配置生产域名别名`)
        }
      } else {
        console.log(`      ⚠️  未设置生产环境`)
      }

      // 获取最新的生产部署
      const deploymentsResponse = await fetch(
        `https://api.vercel.com/v6/deployments?projectId=${project.id}&target=production&limit=1`,
        { headers }
      )

      if (deploymentsResponse.ok) {
        const deploymentsData = await deploymentsResponse.json()
        const deployments = deploymentsData.deployments || []

        if (deployments.length > 0) {
          const latestProd = deployments[0]
          console.log(`\n   📌 当前生产部署:`)
          console.log(`      URL: https://${latestProd.url}`)
          console.log(`      状态: ${latestProd.state}`)
          console.log(`      时间: ${new Date(latestProd.createdAt).toLocaleString('zh-CN')}`)

          // 检查别名
          if (latestProd.aliasAssigned) {
            console.log(`      ✅ 已分配别名`)
          } else {
            console.log(`      ⚠️  未分配别名`)
          }
        } else {
          console.log(`\n   ⚠️  没有生产部署`)
        }
      }

      // 尝试构建推荐的生产域名
      const recommendedDomain = `${projectData.name}.vercel.app`
      console.log(`\n   💡 推荐的生产域名:`)
      console.log(`      ${recommendedDomain}`)

    } catch (error: any) {
      console.log(`   ❌ 错误: ${error.message}`)
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('📝 配置生产域名步骤')
  console.log('='.repeat(70))
  console.log('\n1️⃣  访问 Vercel Dashboard:')
  console.log('   https://vercel.com/dashboard')
  console.log('\n2️⃣  为每个项目添加域名:')
  console.log('   • 选择项目 → Settings → Domains')
  console.log('   • 点击 "Add Domain"')
  console.log('   • 输入域名（如 seo-websites-monorepo-website-tg.vercel.app）')
  console.log('   • Vercel 会自动设置为生产域名')
  console.log('\n3️⃣  等待配置生效后运行同步:')
  console.log('   dotenv -e ../../.env.local -- npx tsx sync-vercel-domains.ts')
  console.log('')
}

checkProductionDomains()
