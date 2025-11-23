const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// 为每个主题定义优化的SEO关键词库
const OPTIMIZED_KEYWORDS = {
  auto: [
    'SEO自动化', '内容推送', '自动发布', '智能营销', '自动优化',
    '批量管理', '定时发布', '自动更新', '智能分发', '效率工具',
    '营销自动化', '内容管理', '自动索引', '快速收录', '智能推送',
    'Telegram自动化', '批量操作', '智能工具', '自动同步', '效率提升'
  ],
  content: [
    '内容营销', 'SEO内容', '文章优化', '内容策略', '原创内容',
    '优质内容', '内容管理', '文章发布', 'Telegram内容', '内容池',
    '内容分发', '内容聚合', '文章采集', '内容优化', '营销文案',
    '内容创作', 'SEO文章', '内容策划', '文章管理', '内容运营'
  ],
  crawl: [
    'SEO爬虫', '网页抓取', '索引优化', '爬虫技术', '收录加速',
    '搜索引擎抓取', '爬虫优化', '快速收录', '索引提升', '抓取频率',
    '蜘蛛池', 'GoogleBot', 'BaiduSpider', '网站收录', 'SEO抓取',
    '爬虫策略', '索引管理', '收录优化', '抓取工具', '蜘蛛优化'
  ],
  engine: [
    '搜索引擎优化', 'SEO工具', '排名优化', '搜索引擎', 'Google优化',
    'Baidu SEO', 'Bing优化', '搜索排名', '引擎收录', 'SEO策略',
    '搜索算法', '排名提升', '搜索引擎营销', 'SEM', 'SEO技术',
    '搜索优化', '引擎营销', 'SEO专家', '搜索引擎工具', '优化技巧'
  ],
  link: [
    '外链建设', '反向链接', '链接优化', '内链策略', 'SEO链接',
    '友情链接', '高质量外链', '链接权重', 'DoFollow链接', '锚文本',
    '链接建设', '外链推广', '链接矩阵', '链接推送', 'Backlink',
    '链接优化', '外链工具', '链接策略', '权重传递', '链接分析'
  ],
  rank: [
    '关键词排名', 'SEO排名', '排名提升', 'Google排名', '搜索排名',
    '排名优化', 'Baidu排名', '关键词优化', '排名跟踪', '排名工具',
    'SERP排名', '排名监控', '排名分析', 'SEO排名提升', '网站排名',
    '排名策略', '快速排名', '排名因素', '排名算法', '排名优化技巧'
  ],
  seo: [
    'SEO优化', 'SEO技术', 'SEO策略', 'SEO工具', 'SEO教程',
    'SEO推广', 'SEO营销', 'SEO分析', 'SEO方案', 'SEO诊断',
    'SEO顾问', 'SEO服务', 'SEO培训', 'SEO优化方案', 'SEO技巧',
    'SEO实战', 'SEO案例', 'SEO指南', 'SEO资源', 'SEO网站优化'
  ],
  track: [
    'SEO监控', '流量分析', '数据统计', '访问追踪', '用户行为',
    'Google Analytics', '流量监控', '访问统计', '数据分析', 'SEO追踪',
    '转化追踪', '效果监控', '流量统计', '访客分析', '数据监测',
    'SEO报告', '统计工具', '监控面板', '实时统计', '数据可视化'
  ],
  traffic: [
    '流量增长', 'SEO流量', '网站流量', '流量提升', '访问量优化',
    '流量获取', '自然流量', '有机流量', '流量转化', '流量来源',
    '流量优化', '流量策略', '用户获取', '访客增长', '流量分析',
    '流量工具', '增长黑客', '流量渠道', 'CTR优化', '流量变现'
  ]
}

// 为每个页面随机选择8-12个关键词，确保多样性
function selectKeywords(theme, pageNum) {
  const themeKeywords = OPTIMIZED_KEYWORDS[theme] || []
  const numKeywords = 8 + Math.floor(Math.random() * 5) // 8-12个关键词

  // 添加一些通用SEO关键词
  const generalKeywords = [
    'Telegram', 'TG', '电报', 'Telegram中文', 'Telegram下载',
    'SEO', '搜索优化', '网站优化', '排名优化', '关键词优化',
    '网络营销', '数字营销', '在线推广', '网站推广', 'Telegram营销'
  ]

  // 混合主题关键词和通用关键词
  const allKeywords = [...themeKeywords, ...generalKeywords]

  // 随机打乱并选择
  const shuffled = allKeywords.sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, numKeywords)

  // 确保至少有3个主题关键词
  const themeSelected = selected.filter(k => themeKeywords.includes(k))
  if (themeSelected.length < 3) {
    const additionalThemeKeywords = themeKeywords
      .filter(k => !selected.includes(k))
      .slice(0, 3 - themeSelected.length)
    selected.push(...additionalThemeKeywords)
  }

  return selected.slice(0, numKeywords)
}

async function optimizeKeywords() {
  console.log('\n🔧 优化蜘蛛池关键词...\n')

  // 获取所有蜘蛛池页面
  const pages = await prisma.spiderPoolPage.findMany({
    include: {
      domainAlias: {
        select: {
          domain: true
        }
      }
    }
  })

  console.log(`找到 ${pages.length} 个页面需要优化关键词\n`)

  let updated = 0

  // Process sequentially to avoid connection pool timeout
  for (const page of pages) {
    const optimizedKeywords = selectKeywords(page.theme, page.pageNum)

    await prisma.spiderPoolPage.update({
      where: { id: page.id },
      data: { keywords: optimizedKeywords }
    })

    updated++

    if (updated % 100 === 0) {
      console.log(`  已优化 ${updated}/${pages.length} 个页面...`)
    }
  }

  console.log(`\n✅ 成功优化 ${updated} 个页面的关键词！\n`)

  // 验证结果
  console.log('📊 优化后关键词统计：\n')

  const updatedPages = await prisma.spiderPoolPage.findMany({
    select: {
      theme: true,
      keywords: true
    },
    take: 3
  })

  updatedPages.forEach((page, idx) => {
    console.log(`  [示例 ${idx + 1}] 主题: ${page.theme}`)
    console.log(`  关键词 (${page.keywords.length}个): ${page.keywords.slice(0, 8).join(', ')}`)
    console.log('')
  })

  // 统计关键词分布
  const allUpdatedPages = await prisma.spiderPoolPage.findMany({
    select: {
      keywords: true
    }
  })

  const keywordFrequency = {}
  allUpdatedPages.forEach(page => {
    page.keywords.forEach(keyword => {
      keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + 1
    })
  })

  const sortedKeywords = Object.entries(keywordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)

  console.log('📈 TOP 20 优化后关键词：\n')
  sortedKeywords.forEach(([keyword, count], idx) => {
    console.log(`  ${idx + 1}. ${keyword}: ${count}次`)
  })

  console.log(`\n总计: ${Object.keys(keywordFrequency).length} 个不同的关键词\n`)
}

optimizeKeywords()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
