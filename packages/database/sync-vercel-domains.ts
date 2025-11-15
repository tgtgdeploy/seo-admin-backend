import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Vercel API 配置
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN || ''
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID // 可选，如果是团队项目需要

interface VercelDomain {
  name: string
  verified: boolean
  primary?: boolean
  // 其他字段...
}

interface VercelProject {
  id: string
  name: string
  domains?: VercelDomain[]
  targets?: {
    production?: {
      alias?: string[]
      [key: string]: any
    }
    [key: string]: any
  }
}

interface ProjectMapping {
  vercelProjectId?: string       // Vercel 项目 ID（优先）
  vercelProjectName: string       // Vercel 项目名称（备用）
  websiteName: string             // Admin 网站名称
  defaultSiteName: string         // 默认站点名称
  defaultSiteDescription: string  // 默认站点描述
  defaultPrimaryTags: string[]    // 默认主标签（数组）
  defaultSecondaryTags: string[]  // 默认副标签（数组）
}

// 项目映射配置
// 支持使用 Project ID 或 Project Name
const PROJECT_MAPPINGS: ProjectMapping[] = [
  {
    vercelProjectId: 'prj_aN8JC3AfUyQsnTZVdpO84Pf5SPvH',
    vercelProjectName: 'website-tg',
    websiteName: 'TG中文纸飞机',
    defaultSiteName: 'TG中文纸飞机 - Telegram 中文资讯',
    defaultSiteDescription: '提供最全面的 Telegram 中文使用教程、下载指南和功能介绍',
    defaultPrimaryTags: ['telegram'],
    defaultSecondaryTags: ['app', 'download', 'guide', 'tutorial']
  },
  {
    vercelProjectId: 'prj_dGal6NS8cuRCsXBHRysQ4rMUARWH',
    vercelProjectName: 'website-1',
    websiteName: 'Demo Website 1',
    defaultSiteName: 'Demo Website 1',
    defaultSiteDescription: 'Demo website for testing multi-domain SEO',
    defaultPrimaryTags: ['demo'],
    defaultSecondaryTags: ['app', 'tutorial']
  },
  {
    vercelProjectId: 'prj_UCOP3BYbuHIu9QmVjSN70mzH1bFm',
    vercelProjectName: 'website-2',
    websiteName: 'Demo Website 2',
    defaultSiteName: 'Demo Website 2',
    defaultSiteDescription: 'Demo website for testing multi-domain SEO',
    defaultPrimaryTags: ['demo'],
    defaultSecondaryTags: ['guide', 'howto']
  }
]

async function getVercelProjectDomains(projectIdOrName: string): Promise<VercelDomain[]> {
  if (!VERCEL_API_TOKEN) {
    throw new Error('❌ VERCEL_API_TOKEN 环境变量未设置')
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
    'Content-Type': 'application/json'
  }

  // 使用 Project ID 或 Project Name
  // Project ID 格式：prj_xxxxx
  let url = `https://api.vercel.com/v9/projects/${projectIdOrName}`
  if (VERCEL_TEAM_ID) {
    url += `?teamId=${VERCEL_TEAM_ID}`
  }

  try {
    const response = await fetch(url, { headers })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Vercel API 错误: ${error.error?.message || response.statusText}`)
    }

    const project: VercelProject = await response.json()

    const allDomains: VercelDomain[] = []

    // 方法 1: 从 project.domains 获取（如果存在）
    if (project.domains && project.domains.length > 0) {
      allDomains.push(...project.domains)
    }

    // 方法 2: 从 targets.production.alias 获取（生产域名）
    if (project.targets?.production?.alias) {
      const productionAliases = project.targets.production.alias
      productionAliases.forEach((alias: string) => {
        // 避免重复
        if (!allDomains.find(d => d.name === alias)) {
          allDomains.push({
            name: alias,
            verified: true, // 生产域名默认已验证
            primary: alias === productionAliases[0] // 第一个为主域名
          })
        }
      })
    }

    // 过滤掉 .vercel.app 域名，只保留自定义域名
    // 注意：如果你想同步 .vercel.app 域名到 Admin，可以注释掉下面这行
    const customDomains = allDomains.filter(
      domain => !domain.name.endsWith('.vercel.app')
    )

    // 如果没有自定义域名，返回所有域名（包括 .vercel.app）
    // 这样可以让用户至少看到一些域名
    if (customDomains.length === 0) {
      return allDomains.slice(0, 3) // 最多返回3个 .vercel.app 域名
    }

    return customDomains
  } catch (error) {
    console.error(`❌ 获取项目 ${projectIdOrName} 的域名失败:`, error)
    return []
  }
}

async function syncDomainsToAdmin() {
  console.log('\n' + '='.repeat(70))
  console.log('🔄 从 Vercel 同步域名到 Admin')
  console.log('='.repeat(70) + '\n')

  if (!VERCEL_API_TOKEN) {
    console.log('⚠️  未检测到 VERCEL_API_TOKEN 环境变量\n')
    console.log('📝 使用方法:')
    console.log('1. 获取 Vercel API Token:')
    console.log('   → https://vercel.com/account/tokens')
    console.log('   → 点击 "Create Token"')
    console.log('   → 复制生成的 token\n')
    console.log('2. 设置环境变量并运行:')
    console.log('   export VERCEL_API_TOKEN="your-token-here"')
    console.log('   dotenv -e ../../.env.local -- npx tsx sync-vercel-domains.ts\n')
    console.log('或者在 .env.local 文件中添加:')
    console.log('   VERCEL_API_TOKEN=your-token-here\n')
    return
  }

  let totalSynced = 0
  let totalSkipped = 0
  let totalFailed = 0

  for (const mapping of PROJECT_MAPPINGS) {
    // 优先使用 Project ID，如果没有则使用 Project Name
    const projectIdentifier = mapping.vercelProjectId || mapping.vercelProjectName
    const displayName = mapping.vercelProjectId
      ? `${mapping.vercelProjectName} (ID: ${mapping.vercelProjectId.substring(0, 15)}...)`
      : mapping.vercelProjectName

    console.log(`\n📦 处理项目: ${displayName}`)
    console.log(`   对应网站: ${mapping.websiteName}`)
    console.log('   ' + '-'.repeat(50))

    // 查找对应的网站
    const website = await prisma.website.findFirst({
      where: {
        name: mapping.websiteName
      }
    })

    if (!website) {
      console.log(`   ⚠️  未找到网站: ${mapping.websiteName}`)
      totalSkipped++
      continue
    }

    // 从 Vercel 获取域名
    console.log(`   🔍 从 Vercel 获取域名...`)
    const vercelDomains = await getVercelProjectDomains(projectIdentifier)

    if (vercelDomains.length === 0) {
      console.log(`   ℹ️  该项目没有自定义域名（或只有 .vercel.app 域名）`)
      continue
    }

    console.log(`   ✅ 找到 ${vercelDomains.length} 个自定义域名\n`)

    // 同步每个域名
    for (let i = 0; i < vercelDomains.length; i++) {
      const vercelDomain = vercelDomains[i]

      try {
        // 检查域名是否已存在
        const existingDomain = await prisma.domainAlias.findUnique({
          where: {
            domain: vercelDomain.name
          }
        })

        if (existingDomain) {
          console.log(`   ⏭️  已存在: ${vercelDomain.name}`)
          totalSkipped++
          continue
        }

        // 第一个域名设为主域名，其他为副域名
        const isPrimary = i === 0

        // 创建域名别名
        const created = await prisma.domainAlias.create({
          data: {
            domain: vercelDomain.name,
            siteName: mapping.defaultSiteName,
            siteDescription: mapping.defaultSiteDescription,
            isPrimary: isPrimary,
            primaryTags: mapping.defaultPrimaryTags,
            secondaryTags: mapping.defaultSecondaryTags,
            websiteId: website.id
          }
        })

        console.log(`   ✅ 已添加: ${created.domain}`)
        console.log(`      ${created.isPrimary ? '🔵 主域名' : '⚪ 副域名'}`)
        console.log(`      站点名称: ${created.siteName}`)
        console.log(`      主标签: ${created.primaryTags.join(', ')}`)
        console.log(`      副标签: ${created.secondaryTags.join(', ')}`)
        console.log(`      Vercel 验证: ${vercelDomain.verified ? '✅' : '⏳ 待验证'}\n`)

        totalSynced++
      } catch (error) {
        console.error(`   ❌ 添加失败: ${vercelDomain.name}`, error)
        totalFailed++
      }
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('📊 同步结果汇总')
  console.log('='.repeat(70))
  console.log(`✅ 成功同步: ${totalSynced} 个域名`)
  console.log(`⏭️  已存在跳过: ${totalSkipped} 个`)
  console.log(`❌ 失败: ${totalFailed} 个`)
  console.log('='.repeat(70) + '\n')

  if (totalSynced > 0) {
    console.log('💡 下一步:')
    console.log('1. 在 Admin 后台查看域名配置')
    console.log('   → http://localhost:3100')
    console.log('   → 网站管理 → 选择网站 → 域名管理')
    console.log('2. 根据需要调整主/副标签配置')
    console.log('3. 验证不同域名的文章筛选效果\n')
  }
}

async function main() {
  try {
    await syncDomainsToAdmin()
  } catch (error) {
    console.error('\n❌ 同步过程出错:', error)
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
