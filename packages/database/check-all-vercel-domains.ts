import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN || ''
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID

const TEST_PROJECT_IDS = [
  { id: 'prj_aN8JC3AfUyQsnTZVdpO84Pf5SPvH', name: 'website-tg' },
  { id: 'prj_dGal6NS8cuRCsXBHRysQ4rMUARWH', name: 'website-1' },
  { id: 'prj_UCOP3BYbuHIu9QmVjSN70mzH1bFm', name: 'website-2' },
]

async function checkAllDomains() {
  console.log('\n' + '='.repeat(70))
  console.log('🔍 检查 Vercel 项目的所有域名（包括 .vercel.app）')
  console.log('='.repeat(70) + '\n')

  for (const project of TEST_PROJECT_IDS) {
    try {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json'
      }

      let url = `https://api.vercel.com/v9/projects/${project.id}`
      if (VERCEL_TEAM_ID) {
        url += `?teamId=${VERCEL_TEAM_ID}`
      }

      console.log(`\n📦 ${project.name}`)
      console.log(`   项目 ID: ${project.id}`)
      console.log('   ' + '-'.repeat(60))

      const response = await fetch(url, { headers })

      if (!response.ok) {
        const error = await response.json()
        console.log(`   ❌ 失败: ${error.error?.message || response.statusText}`)
        continue
      }

      const projectData = await response.json()

      if (!projectData.domains || projectData.domains.length === 0) {
        console.log('   ⚠️  项目没有任何域名')
        continue
      }

      // 分类域名
      const vercelDomains = projectData.domains.filter(
        (d: any) => d.name.endsWith('.vercel.app')
      )
      const customDomains = projectData.domains.filter(
        (d: any) => !d.name.endsWith('.vercel.app')
      )

      console.log(`\n   总域名数: ${projectData.domains.length}`)

      if (vercelDomains.length > 0) {
        console.log(`\n   🟦 Vercel 默认域名 (${vercelDomains.length} 个):`)
        vercelDomains.forEach((domain: any) => {
          const status = domain.verified ? '✅ 已验证' : '⏳ 待验证'
          console.log(`      • ${domain.name} ${status}`)
        })
      }

      if (customDomains.length > 0) {
        console.log(`\n   🟩 自定义域名 (${customDomains.length} 个):`)
        customDomains.forEach((domain: any) => {
          const status = domain.verified ? '✅ 已验证' : '⏳ 待验证'
          console.log(`      • ${domain.name} ${status}`)
        })
      }

    } catch (error: any) {
      console.log(`   ❌ 异常: ${error.message}`)
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('💡 说明')
  console.log('='.repeat(70))
  console.log('\n🟦 Vercel 默认域名 (.vercel.app):')
  console.log('   - 由 Vercel 自动生成')
  console.log('   - 可以直接访问')
  console.log('   - 通常不需要同步到 Admin（用于测试）')
  console.log('\n🟩 自定义域名:')
  console.log('   - 你在 Vercel 手动添加的域名')
  console.log('   - 需要配置 DNS 解析')
  console.log('   - 建议同步到 Admin 进行蜘蛛池 SEO 管理')
  console.log('\n📝 下一步:')
  console.log('   1. 如果有自定义域名 → 运行 sync-vercel-domains.ts 同步')
  console.log('   2. 如果想同步 .vercel.app 域名 → 修改脚本移除过滤')
  console.log('   3. 如果想测试功能 → 运行 add-demo-domains.ts 添加示例域名\n')
}

async function main() {
  try {
    await checkAllDomains()
  } catch (error) {
    console.error('\n❌ 检查过程出错:', error)
    process.exit(1)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
