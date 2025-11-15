import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN || ''
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID

// 测试用的 Project IDs
const TEST_PROJECT_IDS = [
  'prj_aN8JC3AfUyQsnTZVdpO84Pf5SPvH',  // website-tg
  'prj_dGal6NS8cuRCsXBHRysQ4rMUARWH',  // website-1
  'prj_UCOP3BYbuHIu9QmVjSN70mzH1bFm',  // website-2
]

async function testVercelAPI() {
  console.log('\n' + '='.repeat(70))
  console.log('🧪 测试 Vercel API 连接')
  console.log('='.repeat(70) + '\n')

  if (!VERCEL_API_TOKEN) {
    console.log('❌ VERCEL_API_TOKEN 未设置\n')
    console.log('请先设置环境变量:')
    console.log('  export VERCEL_API_TOKEN="your-token-here"')
    console.log('或在 .env.local 添加:')
    console.log('  VERCEL_API_TOKEN=your-token-here\n')
    return
  }

  console.log('✅ VERCEL_API_TOKEN 已设置')
  console.log(`   Token: ${VERCEL_API_TOKEN.substring(0, 20)}...`)

  if (VERCEL_TEAM_ID) {
    console.log(`✅ VERCEL_TEAM_ID 已设置: ${VERCEL_TEAM_ID}`)
  } else {
    console.log('ℹ️  VERCEL_TEAM_ID 未设置（个人项目不需要）')
  }

  console.log('\n' + '-'.repeat(70))
  console.log('测试项目访问权限\n')

  for (const projectId of TEST_PROJECT_IDS) {
    try {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json'
      }

      let url = `https://api.vercel.com/v9/projects/${projectId}`
      if (VERCEL_TEAM_ID) {
        url += `?teamId=${VERCEL_TEAM_ID}`
      }

      console.log(`\n📦 测试项目: ${projectId}`)
      console.log(`   请求 URL: ${url.substring(0, 80)}...`)

      const response = await fetch(url, { headers })

      if (!response.ok) {
        const error = await response.json()
        console.log(`   ❌ 失败: ${error.error?.message || response.statusText}`)
        console.log(`   HTTP 状态: ${response.status}`)
        continue
      }

      const project = await response.json()

      console.log(`   ✅ 成功访问`)
      console.log(`   项目名称: ${project.name}`)
      console.log(`   项目 ID: ${project.id}`)

      if (project.domains && project.domains.length > 0) {
        const customDomains = project.domains.filter(
          (d: any) => !d.name.endsWith('.vercel.app')
        )
        const vercelDomains = project.domains.filter(
          (d: any) => d.name.endsWith('.vercel.app')
        )

        console.log(`   总域名数: ${project.domains.length}`)
        console.log(`   ├─ 自定义域名: ${customDomains.length}`)
        console.log(`   └─ Vercel 域名: ${vercelDomains.length}`)

        if (customDomains.length > 0) {
          console.log(`\n   自定义域名列表:`)
          customDomains.forEach((domain: any, index: number) => {
            console.log(`   ${index + 1}. ${domain.name} ${domain.verified ? '✅ 已验证' : '⏳ 待验证'}`)
          })
        }

        if (vercelDomains.length > 0 && vercelDomains.length <= 3) {
          console.log(`\n   Vercel 域名:`)
          vercelDomains.forEach((domain: any) => {
            console.log(`   - ${domain.name}`)
          })
        }
      } else {
        console.log(`   ⚠️  该项目没有配置任何域名`)
      }

    } catch (error: any) {
      console.log(`   ❌ 异常: ${error.message}`)
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('💡 下一步')
  console.log('='.repeat(70))
  console.log('\n如果所有项目都测试成功，运行同步脚本:')
  console.log('  dotenv -e ../../.env.local -- npx tsx sync-vercel-domains.ts\n')
}

async function main() {
  try {
    await testVercelAPI()
  } catch (error) {
    console.error('\n❌ 测试过程出错:', error)
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
