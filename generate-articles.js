const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// 文章模板数据
const ARTICLE_TEMPLATES = {
  'telegramtghub.com': [
    { title: 'Telegram完整使用指南：新手入门到高级技巧', slug: 'telegram-complete-guide', category: '使用指南', tags: ['Telegram教程', '新手指南', '使用技巧'], metaKeywords: ['Telegram', 'TG', '电报', 'Telegram使用', 'Telegram教程', '即时通讯'] },
    { title: '如何在Telegram创建和管理超级群组', slug: 'telegram-supergroup-management', category: '群组管理', tags: ['超级群组', '群组管理', 'Telegram群组'], metaKeywords: ['Telegram群组', '超级群组', '群组管理', 'Telegram管理', '社群运营'] },
    { title: 'Telegram频道营销完全攻略', slug: 'telegram-channel-marketing', category: '营销推广', tags: ['频道营销', 'Telegram营销', '社交媒体'], metaKeywords: ['Telegram频道', '频道营销', 'Telegram推广', '社交营销', '内容营销'] },
    { title: 'Telegram Bot开发教程：从零开始创建你的机器人', slug: 'telegram-bot-development', category: '开发教程', tags: ['Bot开发', 'Telegram机器人', '编程教程'], metaKeywords: ['Telegram Bot', '机器人开发', 'Bot开发', 'Telegram API', '自动化'] },
    { title: 'Telegram隐私设置完整指南：保护你的个人信息', slug: 'telegram-privacy-settings', category: '隐私安全', tags: ['隐私设置', '安全保护', 'Telegram安全'], metaKeywords: ['Telegram隐私', '隐私设置', '安全保护', '个人信息', '账号安全'] }
  ],
  'telegramupdatecenter.com': [
    { title: 'Telegram 2024年最新功能更新汇总', slug: 'telegram-2024-features-update', category: '功能更新', tags: ['新功能', '2024更新', 'Telegram更新'], metaKeywords: ['Telegram更新', '2024新功能', '功能更新', '版本更新', '新特性'] },
    { title: 'Telegram Premium会员功能详细介绍', slug: 'telegram-premium-features', category: '会员服务', tags: ['Premium会员', '付费功能', '高级功能'], metaKeywords: ['Telegram Premium', '会员功能', '付费服务', '高级特权', '订阅'] },
    { title: 'Telegram Stories功能上线：使用教程和技巧', slug: 'telegram-stories-tutorial', category: '新功能', tags: ['Stories', '动态', '新功能'], metaKeywords: ['Telegram Stories', '动态功能', '故事', '社交分享', '新功能'] },
    { title: 'Telegram最新隐私政策更新解读', slug: 'telegram-privacy-policy-update', category: '政策更新', tags: ['隐私政策', '政策解读', '用户协议'], metaKeywords: ['隐私政策', 'Telegram政策', '用户协议', '数据保护', '法律条款'] },
    { title: 'Telegram Android版本更新日志', slug: 'telegram-android-changelog', category: '版本更新', tags: ['Android', '更新日志', '版本发布'], metaKeywords: ['Telegram Android', '更新日志', '版本更新', 'Android更新', '移动版'] }
  ],
  'telegramtrendguide.com': [
    { title: '2024年Telegram使用趋势分析报告', slug: 'telegram-trends-2024-analysis', category: '趋势报告', tags: ['趋势分析', '2024趋势', '行业报告'], metaKeywords: ['Telegram趋势', '2024分析', '用户趋势', '市场报告', '数据分析'] },
    { title: 'Telegram在企业协作中的应用趋势', slug: 'telegram-enterprise-collaboration-trends', category: '企业应用', tags: ['企业协作', '商业趋势', '团队协作'], metaKeywords: ['企业协作', 'Telegram企业', '团队协作', '商业应用', '办公工具'] },
    { title: 'Telegram营销自动化最佳实践', slug: 'telegram-marketing-automation-practices', category: '营销趋势', tags: ['营销自动化', '最佳实践', 'Telegram营销'], metaKeywords: ['营销自动化', 'Telegram营销', '自动化工具', '营销策略', '数字营销'] },
    { title: 'Telegram社群运营完全指南', slug: 'telegram-community-management-guide', category: '社群运营', tags: ['社群运营', '运营指南', '社区管理'], metaKeywords: ['社群运营', 'Telegram社群', '社区管理', '用户运营', '粉丝维护'] },
    { title: 'Telegram加密货币社区发展趋势', slug: 'telegram-crypto-community-trends', category: '行业趋势', tags: ['加密货币', 'Web3', '区块链'], metaKeywords: ['加密货币', 'Telegram加密', 'Web3', '区块链', 'Crypto社区'] }
  ]
}

function generateArticleContent(title, tags) {
  return '<article><h1>' + title + '</h1><section><h2>引言</h2><p>在当今数字化时代，' + tags[0] + '已经成为越来越多用户关注的焦点。本文将为您详细介绍相关知识和实用技巧。</p></section><section><h2>核心内容</h2><p>Telegram作为全球领先的即时通讯平台，凭借其强大的功能和出色的用户体验，赢得了数亿用户的青睐。</p><h3>主要特点</h3><ul><li>安全性高：采用端到端加密技术，确保用户隐私安全</li><li>功能丰富：支持文字、语音、视频等多种通讯方式</li><li>跨平台：支持iOS、Android、Windows、macOS等多个平台</li></ul></section><section><h2>总结</h2><p>通过本文的介绍，相信您已经对相关内容有了更深入的了解。继续探索Telegram的强大功能，让沟通变得更加高效便捷。</p></section></article>'
}

async function generateArticles() {
  console.log('\n📝 开始生成文章...\n')

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) {
    console.error('❌ 未找到管理员用户！')
    return
  }

  const websites = await prisma.website.findMany({
    where: { domain: { in: Object.keys(ARTICLE_TEMPLATES) } }
  })

  let totalCreated = 0

  for (const website of websites) {
    const templates = ARTICLE_TEMPLATES[website.domain]
    console.log(`\n为 ${website.name} 生成${templates.length}篇文章...`)

    for (const template of templates) {
      const content = generateArticleContent(template.title, template.tags)
      await prisma.post.create({
        data: {
          title: template.title,
          slug: template.slug,
          content: content,
          excerpt: template.title + ' - 详细介绍',
          metaTitle: template.title,
          metaDescription: template.title,
          metaKeywords: template.metaKeywords,
          category: template.category,
          tags: template.tags,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          websiteId: website.id,
          authorId: admin.id
        }
      })
      totalCreated++
    }
    console.log(`  ✓ 完成${templates.length}篇`)
  }

  console.log(`\n✅ 总共生成 ${totalCreated} 篇文章！\n`)
}

generateArticles().catch(console.error).finally(() => prisma.$disconnect())
