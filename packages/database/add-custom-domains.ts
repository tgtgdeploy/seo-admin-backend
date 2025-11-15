/**
 * 添加自定义域名到数据库
 * 方案 A: 按网站均匀分配
 *
 * 使用方法：
 * dotenv -e ../../.env.local -- npx tsx add-custom-domains.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface DomainConfig {
  domain: string
  websiteName: string
  siteName: string
  siteDescription: string
  isPrimary: boolean
  primaryTags: string[]
  secondaryTags: string[]
}

// 方案 A: 按网站均匀分配
const DOMAINS: DomainConfig[] = [
  // website-tg (TG中文纸飞机) - 3个域名
  {
    domain: 'telegram1688.com',
    websiteName: 'TG中文纸飞机',
    siteName: 'Telegram中文站 - TG纸飞机中文版下载',
    siteDescription: 'Telegram1688提供最新TG中文版下载、使用教程和功能介绍',
    isPrimary: true,  // 第一个域名设为主域名
    primaryTags: ['telegram', 'tg', '中文版'],
    secondaryTags: ['下载', '教程', '安装', '注册'],
  },
  {
    domain: 'telegram2688.com',
    websiteName: 'TG中文纸飞机',
    siteName: 'Telegram2688 - 纸飞机中文官方下载',
    siteDescription: 'Telegram2688官方中文网站，提供安全可靠的TG下载和使用指南',
    isPrimary: false,
    primaryTags: ['telegram', 'tg', '纸飞机'],
    secondaryTags: ['官方', '中文', '安全', '下载'],
  },
  {
    domain: 'telegramcnfw.com',
    websiteName: 'TG中文纸飞机',
    siteName: 'Telegram中文服务 - TG中文版资讯',
    siteDescription: 'TelegramCN服务站，专注Telegram中文版下载、使用和技术支持',
    isPrimary: false,
    primaryTags: ['telegram', '中文', '服务'],
    secondaryTags: ['技术支持', '教程', '资讯', 'cn'],
  },

  // website-1 - 2个域名
  {
    domain: 'telegramcny28.com',
    websiteName: 'Demo Website 1',
    siteName: 'TelegramCNY - 中文纸飞机社区',
    siteDescription: 'Telegram中文社区，分享使用技巧、功能教程和最新资讯',
    isPrimary: true,  // website-1的主域名
    primaryTags: ['telegram', '社区', '中文'],
    secondaryTags: ['技巧', '分享', '交流', '教程'],
  },
  {
    domain: 'telegramfuwu.com',
    websiteName: 'Demo Website 1',
    siteName: 'Telegram服务站 - TG使用指南',
    siteDescription: 'Telegram服务站，提供全面的TG使用指南和问题解答',
    isPrimary: false,
    primaryTags: ['telegram', '服务', '指南'],
    secondaryTags: ['使用', '教程', '帮助', '问答'],
  },

  // website-2 - 2个域名
  {
    domain: 'telegramjiaoyu.com',
    websiteName: 'Demo Website 2',
    siteName: 'Telegram教育站 - TG学习平台',
    siteDescription: 'Telegram教育平台，系统学习TG功能和使用技巧',
    isPrimary: true,  // website-2的主域名
    primaryTags: ['telegram', '教育', '学习'],
    secondaryTags: ['教程', '培训', '课程', '技巧'],
  },
  {
    domain: 'telegramrmb28.com',
    websiteName: 'Demo Website 2',
    siteName: 'TelegramRMB - 中文纸飞机资源站',
    siteDescription: 'Telegram资源站，汇集优质TG频道、群组和使用资源',
    isPrimary: false,
    primaryTags: ['telegram', '资源', '中文'],
    secondaryTags: ['频道', '群组', '分享', '推荐'],
  },
]

async function addDomains() {
  console.log('\n' + '='.repeat(70))
  console.log('📝 添加自定义域名到数据库 (方案 A)')
  console.log('='.repeat(70) + '\n')

  let successCount = 0
  let existsCount = 0
  let failedCount = 0

  for (const domainConfig of DOMAINS) {
    console.log(`\n🌐 域名: ${domainConfig.domain}`)
    console.log(`   网站: ${domainConfig.websiteName}`)
    console.log('   ' + '-'.repeat(60))

    try {
      // 查找对应的网站
      const website = await prisma.website.findFirst({
        where: {
          name: domainConfig.websiteName,
        },
      })

      if (!website) {
        console.log(`   ❌ 未找到网站: ${domainConfig.websiteName}`)
        failedCount++
        continue
      }

      // 检查域名是否已存在
      const existingDomain = await prisma.domainAlias.findUnique({
        where: {
          domain: domainConfig.domain,
        },
      })

      if (existingDomain) {
        console.log(`   ⏭️  域名已存在，跳过`)
        existsCount++
        continue
      }

      // 创建域名别名
      const created = await prisma.domainAlias.create({
        data: {
          domain: domainConfig.domain,
          siteName: domainConfig.siteName,
          siteDescription: domainConfig.siteDescription,
          isPrimary: domainConfig.isPrimary,
          primaryTags: domainConfig.primaryTags,
          secondaryTags: domainConfig.secondaryTags,
          websiteId: website.id,
        },
      })

      console.log(`   ✅ 已添加`)
      console.log(`      ${created.isPrimary ? '🔵 主域名' : '⚪ 副域名'}`)
      console.log(`      站点名称: ${created.siteName}`)
      console.log(`      主标签: ${created.primaryTags.join(', ')}`)
      console.log(`      副标签: ${created.secondaryTags.join(', ')}`)

      successCount++
    } catch (error: any) {
      console.error(`   ❌ 添加失败: ${error.message}`)
      failedCount++
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('📊 添加结果汇总')
  console.log('='.repeat(70))
  console.log(`✅ 成功添加: ${successCount} 个域名`)
  console.log(`⏭️  已存在: ${existsCount} 个域名`)
  console.log(`❌ 失败: ${failedCount} 个域名`)
  console.log('='.repeat(70) + '\n')

  if (successCount > 0) {
    console.log('💡 下一步:')
    console.log('')
    console.log('1️⃣  在域名注册商配置 DNS CNAME 记录:')
    console.log('   类型: CNAME')
    console.log('   记录: @')
    console.log('   指向: cname.vercel-dns.com.')
    console.log('')
    console.log('2️⃣  在 Vercel 添加自定义域名:')
    console.log('   website-tg 添加: telegram1688.com, telegram2688.com, telegramcnfw.com')
    console.log('   website-1 添加: telegramcny28.com, telegramfuwu.com')
    console.log('   website-2 添加: telegramjiaoyu.com, telegramrmb28.com')
    console.log('')
    console.log('   步骤:')
    console.log('   → 访问 https://vercel.com/dashboard')
    console.log('   → 选择项目 → Settings → Domains')
    console.log('   → 点击 "Add Domain"')
    console.log('   → 输入域名并验证')
    console.log('')
    console.log('3️⃣  验证域名配置:')
    console.log('   → 等待 DNS 生效（可能需要几分钟到几小时）')
    console.log('   → 访问域名确认能正常访问')
    console.log('   → 检查不同域名显示的文章是否正确筛选')
    console.log('')
  }
}

async function main() {
  try {
    await addDomains()
  } catch (error) {
    console.error('\n❌ 执行出错:', error)
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
