// 搜索引擎蜘蛛检测 - 优化版

// 爬虫类型
export enum BotType {
  SEARCH_ENGINE = 'search_engine',      // 搜索引擎
  SOCIAL_MEDIA = 'social_media',        // 社交媒体
  AI_SCRAPER = 'ai_scraper',            // AI 爬虫（如 ChatGPT）
  SEO_TOOL = 'seo_tool',                // SEO 工具
  SITE_MONITOR = 'site_monitor',        // 网站监控
  FEED_READER = 'feed_reader',          // RSS 订阅器
  UNKNOWN = 'unknown'                   // 未知
}

// 爬虫信息
export interface SpiderInfo {
  isBot: boolean
  botName: string | null
  searchEngine: string | null
  botType: BotType | null
  version: string | null
  isTrusted: boolean  // 是否是可信的官方爬虫
  crawlPriority: number  // 爬取优先级（1-10，10最高）
}

// 爬虫配置
interface BotConfig {
  name: string
  engine: string
  pattern: RegExp
  type: BotType
  priority: number
  trusted: boolean
  versionPattern?: RegExp
}

// 完整的爬虫列表（大幅扩展）
const BOT_CONFIGS: BotConfig[] = [
  // === 主流搜索引擎 ===
  {
    name: 'Googlebot',
    engine: 'Google',
    pattern: /googlebot/i,
    type: BotType.SEARCH_ENGINE,
    priority: 10,
    trusted: true,
    versionPattern: /googlebot\/([0-9.]+)/i
  },
  {
    name: 'Google-InspectionTool',
    engine: 'Google',
    pattern: /google-inspectiontool/i,
    type: BotType.SEARCH_ENGINE,
    priority: 10,
    trusted: true
  },
  {
    name: 'Bingbot',
    engine: 'Bing',
    pattern: /bingbot/i,
    type: BotType.SEARCH_ENGINE,
    priority: 9,
    trusted: true,
    versionPattern: /bingbot\/([0-9.]+)/i
  },
  {
    name: 'Baiduspider',
    engine: 'Baidu',
    pattern: /baiduspider/i,
    type: BotType.SEARCH_ENGINE,
    priority: 9,
    trusted: true,
    versionPattern: /baiduspider\/([0-9.]+)/i
  },
  {
    name: 'YandexBot',
    engine: 'Yandex',
    pattern: /yandexbot/i,
    type: BotType.SEARCH_ENGINE,
    priority: 8,
    trusted: true
  },
  {
    name: 'Sogou Spider',
    engine: 'Sogou',
    pattern: /sogou.*spider/i,
    type: BotType.SEARCH_ENGINE,
    priority: 7,
    trusted: true
  },
  {
    name: '360Spider',
    engine: '360',
    pattern: /360spider/i,
    type: BotType.SEARCH_ENGINE,
    priority: 7,
    trusted: true
  },
  {
    name: 'Yahoo Slurp',
    engine: 'Yahoo',
    pattern: /slurp/i,
    type: BotType.SEARCH_ENGINE,
    priority: 6,
    trusted: true
  },
  {
    name: 'DuckDuckBot',
    engine: 'DuckDuckGo',
    pattern: /duckduckbot/i,
    type: BotType.SEARCH_ENGINE,
    priority: 6,
    trusted: true
  },

  // === 社交媒体爬虫 ===
  {
    name: 'Facebookbot',
    engine: 'Facebook',
    pattern: /facebookexternalhit|facebot/i,
    type: BotType.SOCIAL_MEDIA,
    priority: 8,
    trusted: true
  },
  {
    name: 'Twitterbot',
    engine: 'Twitter/X',
    pattern: /twitterbot/i,
    type: BotType.SOCIAL_MEDIA,
    priority: 8,
    trusted: true
  },
  {
    name: 'LinkedInBot',
    engine: 'LinkedIn',
    pattern: /linkedinbot/i,
    type: BotType.SOCIAL_MEDIA,
    priority: 7,
    trusted: true
  },
  {
    name: 'TelegramBot',
    engine: 'Telegram',
    pattern: /telegrambot/i,
    type: BotType.SOCIAL_MEDIA,
    priority: 7,
    trusted: true
  },
  {
    name: 'WhatsApp',
    engine: 'WhatsApp',
    pattern: /whatsapp/i,
    type: BotType.SOCIAL_MEDIA,
    priority: 7,
    trusted: true
  },
  {
    name: 'Discordbot',
    engine: 'Discord',
    pattern: /discordbot/i,
    type: BotType.SOCIAL_MEDIA,
    priority: 6,
    trusted: true
  },
  {
    name: 'Slackbot',
    engine: 'Slack',
    pattern: /slackbot/i,
    type: BotType.SOCIAL_MEDIA,
    priority: 6,
    trusted: true
  },

  // === AI 爬虫（生成式AI）===
  {
    name: 'GPTBot',
    engine: 'OpenAI',
    pattern: /gptbot/i,
    type: BotType.AI_SCRAPER,
    priority: 5,
    trusted: true
  },
  {
    name: 'ChatGPT-User',
    engine: 'OpenAI',
    pattern: /chatgpt-user/i,
    type: BotType.AI_SCRAPER,
    priority: 5,
    trusted: true
  },
  {
    name: 'Claude-Web',
    engine: 'Anthropic',
    pattern: /claude-web/i,
    type: BotType.AI_SCRAPER,
    priority: 5,
    trusted: true
  },
  {
    name: 'Google-Extended',
    engine: 'Google AI',
    pattern: /google-extended/i,
    type: BotType.AI_SCRAPER,
    priority: 5,
    trusted: true
  },
  {
    name: 'CCBot',
    engine: 'Common Crawl',
    pattern: /ccbot/i,
    type: BotType.AI_SCRAPER,
    priority: 4,
    trusted: false
  },
  {
    name: 'Bytespider',
    engine: 'ByteDance',
    pattern: /bytespider/i,
    type: BotType.AI_SCRAPER,
    priority: 4,
    trusted: false
  },

  // === SEO 工具 ===
  {
    name: 'Ahrefs Bot',
    engine: 'Ahrefs',
    pattern: /ahrefsbot/i,
    type: BotType.SEO_TOOL,
    priority: 6,
    trusted: true
  },
  {
    name: 'SEMrush Bot',
    engine: 'SEMrush',
    pattern: /semrushbot/i,
    type: BotType.SEO_TOOL,
    priority: 6,
    trusted: true
  },
  {
    name: 'Majestic Bot',
    engine: 'Majestic',
    pattern: /mj12bot/i,
    type: BotType.SEO_TOOL,
    priority: 5,
    trusted: true
  },
  {
    name: 'DotBot',
    engine: 'Moz',
    pattern: /dotbot/i,
    type: BotType.SEO_TOOL,
    priority: 5,
    trusted: true
  },
  {
    name: 'Screaming Frog',
    engine: 'Screaming Frog',
    pattern: /screaming frog/i,
    type: BotType.SEO_TOOL,
    priority: 4,
    trusted: true
  },

  // === 网站监控 ===
  {
    name: 'UptimeRobot',
    engine: 'UptimeRobot',
    pattern: /uptimerobot/i,
    type: BotType.SITE_MONITOR,
    priority: 5,
    trusted: true
  },
  {
    name: 'Pingdom',
    engine: 'Pingdom',
    pattern: /pingdom/i,
    type: BotType.SITE_MONITOR,
    priority: 5,
    trusted: true
  },

  // === RSS/Feed 阅读器 ===
  {
    name: 'Feedly',
    engine: 'Feedly',
    pattern: /feedly/i,
    type: BotType.FEED_READER,
    priority: 4,
    trusted: true
  },
]

/**
 * 检测用户代理是否为爬虫
 * @param userAgent 用户代理字符串
 * @returns 爬虫信息
 */
export function detectSpider(userAgent: string): SpiderInfo {
  if (!userAgent) {
    return {
      isBot: false,
      botName: null,
      searchEngine: null,
      botType: null,
      version: null,
      isTrusted: false,
      crawlPriority: 0
    }
  }

  const ua = userAgent.toLowerCase()

  for (const bot of BOT_CONFIGS) {
    if (bot.pattern.test(ua)) {
      // 提取版本号（如果有）
      let version: string | null = null
      if (bot.versionPattern) {
        const match = userAgent.match(bot.versionPattern)
        if (match && match[1]) {
          version = match[1]
        }
      }

      return {
        isBot: true,
        botName: bot.name,
        searchEngine: bot.engine,
        botType: bot.type,
        version,
        isTrusted: bot.trusted,
        crawlPriority: bot.priority
      }
    }
  }

  // 通用爬虫检测（后备）
  if (/bot|crawler|spider|scraper|crawl|spider/i.test(ua)) {
    return {
      isBot: true,
      botName: 'Unknown Bot',
      searchEngine: null,
      botType: BotType.UNKNOWN,
      version: null,
      isTrusted: false,
      crawlPriority: 1
    }
  }

  return {
    isBot: false,
    botName: null,
    searchEngine: null,
    botType: null,
    version: null,
    isTrusted: false,
    crawlPriority: 0
  }
}

/**
 * 获取爬虫列表
 * @param type 可选，按类型筛选
 * @returns 爬虫配置列表
 */
export function getBotList(type?: BotType): BotConfig[] {
  if (type) {
    return BOT_CONFIGS.filter(bot => bot.type === type)
  }
  return BOT_CONFIGS
}

/**
 * 获取爬虫统计信息
 */
export function getBotStatistics() {
  const stats = {
    total: BOT_CONFIGS.length,
    byType: {} as Record<BotType, number>,
    trusted: 0,
    untrusted: 0
  }

  BOT_CONFIGS.forEach(bot => {
    // 按类型统计
    if (!stats.byType[bot.type]) {
      stats.byType[bot.type] = 0
    }
    stats.byType[bot.type]++

    // 统计可信度
    if (bot.trusted) {
      stats.trusted++
    } else {
      stats.untrusted++
    }
  })

  return stats
}

// ============================================
// 爬虫访问频率限制器（增强版）
// ============================================

export interface RateLimitConfig {
  maxVisitsPerMinute: number
  maxVisitsPerHour?: number
  burstSize?: number  // 突发流量大小
}

export interface BotRateLimitConfig extends RateLimitConfig {
  botType: BotType
}

export class SpiderRateLimiter {
  private visits: Map<string, number[]> = new Map()
  private defaultConfig: RateLimitConfig
  private botConfigs: Map<BotType, RateLimitConfig> = new Map()

  constructor(defaultConfig?: RateLimitConfig) {
    this.defaultConfig = defaultConfig || {
      maxVisitsPerMinute: 10,
      maxVisitsPerHour: 100,
      burstSize: 5
    }

    // 预设不同类型爬虫的默认配额
    this.setDefaultBotConfigs()
  }

  /**
   * 设置默认的爬虫配额
   */
  private setDefaultBotConfigs() {
    // 搜索引擎：高配额
    this.botConfigs.set(BotType.SEARCH_ENGINE, {
      maxVisitsPerMinute: 30,
      maxVisitsPerHour: 500,
      burstSize: 10
    })

    // 社交媒体：中等配额
    this.botConfigs.set(BotType.SOCIAL_MEDIA, {
      maxVisitsPerMinute: 20,
      maxVisitsPerHour: 300,
      burstSize: 8
    })

    // AI 爬虫：限制配额（可选择阻止）
    this.botConfigs.set(BotType.AI_SCRAPER, {
      maxVisitsPerMinute: 5,
      maxVisitsPerHour: 50,
      burstSize: 2
    })

    // SEO 工具：中等配额
    this.botConfigs.set(BotType.SEO_TOOL, {
      maxVisitsPerMinute: 15,
      maxVisitsPerHour: 200,
      burstSize: 5
    })

    // 网站监控：低配额
    this.botConfigs.set(BotType.SITE_MONITOR, {
      maxVisitsPerMinute: 3,
      maxVisitsPerHour: 30,
      burstSize: 1
    })

    // Feed 阅读器：低配额
    this.botConfigs.set(BotType.FEED_READER, {
      maxVisitsPerMinute: 5,
      maxVisitsPerHour: 50,
      burstSize: 2
    })

    // 未知爬虫：最低配额
    this.botConfigs.set(BotType.UNKNOWN, {
      maxVisitsPerMinute: 2,
      maxVisitsPerHour: 20,
      burstSize: 1
    })
  }

  /**
   * 设置特定爬虫类型的配额
   */
  setBotConfig(botType: BotType, config: RateLimitConfig) {
    this.botConfigs.set(botType, config)
  }

  /**
   * 检查是否允许访问
   * @param identifier 标识符（IP 或 botName）
   * @param botType 爬虫类型（可选）
   * @returns 是否允许访问
   */
  canVisit(identifier: string, botType?: BotType): boolean {
    const now = Date.now()
    const config = botType ? (this.botConfigs.get(botType) || this.defaultConfig) : this.defaultConfig

    // 获取访问记录
    let timestamps = this.visits.get(identifier) || []

    // 检查每分钟限制
    const oneMinuteAgo = now - 60000
    const recentVisits = timestamps.filter(t => t > oneMinuteAgo)

    if (recentVisits.length >= config.maxVisitsPerMinute) {
      return false
    }

    // 检查每小时限制（如果配置了）
    if (config.maxVisitsPerHour) {
      const oneHourAgo = now - 3600000
      const hourlyVisits = timestamps.filter(t => t > oneHourAgo)

      if (hourlyVisits.length >= config.maxVisitsPerHour) {
        return false
      }
    }

    // 检查突发流量（短时间内的连续访问）
    if (config.burstSize && recentVisits.length >= 1) {
      const lastVisit = recentVisits[recentVisits.length - 1]
      const timeSinceLastVisit = now - lastVisit

      // 如果在1秒内有超过 burstSize 的访问，拒绝
      const oneSecondAgo = now - 1000
      const burstVisits = timestamps.filter(t => t > oneSecondAgo)

      if (burstVisits.length >= config.burstSize) {
        return false
      }
    }

    // 记录本次访问
    timestamps.push(now)
    this.visits.set(identifier, timestamps)
    return true
  }

  /**
   * 获取访问统计
   */
  getVisitStats(identifier: string): {
    lastMinute: number
    lastHour: number
    lastVisit: Date | null
  } {
    const timestamps = this.visits.get(identifier) || []
    const now = Date.now()

    const lastMinute = timestamps.filter(t => t > now - 60000).length
    const lastHour = timestamps.filter(t => t > now - 3600000).length
    const lastVisit = timestamps.length > 0
      ? new Date(timestamps[timestamps.length - 1])
      : null

    return { lastMinute, lastHour, lastVisit }
  }

  /**
   * 定期清理过期数据
   */
  cleanup() {
    const oneHourAgo = Date.now() - 3600000
    Array.from(this.visits.entries()).forEach(([identifier, timestamps]) => {
      const filtered = timestamps.filter(t => t > oneHourAgo)
      if (filtered.length === 0) {
        this.visits.delete(identifier)
      } else {
        this.visits.set(identifier, filtered)
      }
    })
  }

  /**
   * 清除特定标识符的记录
   */
  clear(identifier: string) {
    this.visits.delete(identifier)
  }

  /**
   * 清除所有记录
   */
  clearAll() {
    this.visits.clear()
  }
}

// ============================================
// Robots.txt 生成器（增强版）
// ============================================

export interface RobotsConfig {
  allowPaths?: string[]
  disallowPaths?: string[]
  sitemapUrl?: string | string[]
  crawlDelay?: number

  // 高级选项
  customRules?: Record<string, {
    allow?: string[]
    disallow?: string[]
    crawlDelay?: number
  }>

  // 是否阻止 AI 爬虫
  blockAI?: boolean

  // 主机名（用于多域名）
  host?: string
}

/**
 * 生成 robots.txt 内容（增强版）
 * @param config 配置选项
 * @returns robots.txt 内容
 */
export function generateRobotsTxt(config: RobotsConfig): string {
  const lines: string[] = []

  // === 针对所有爬虫的通用规则 ===
  lines.push('# Robots.txt - Generated by SEO Tools')
  lines.push('# Last updated: ' + new Date().toISOString())
  lines.push('')
  lines.push('User-agent: *')

  // 允许的路径
  if (config.allowPaths && config.allowPaths.length > 0) {
    config.allowPaths.forEach(path => {
      lines.push(`Allow: ${path}`)
    })
  }

  // 禁止的路径
  if (config.disallowPaths && config.disallowPaths.length > 0) {
    config.disallowPaths.forEach(path => {
      lines.push(`Disallow: ${path}`)
    })
  }

  // 爬取延迟
  if (config.crawlDelay) {
    lines.push(`Crawl-delay: ${config.crawlDelay}`)
  }

  // === 阻止 AI 爬虫（如果启用）===
  if (config.blockAI) {
    lines.push('')
    lines.push('# Block AI scrapers')

    const aiCrawlers = [
      'GPTBot',
      'ChatGPT-User',
      'Google-Extended',
      'CCBot',
      'anthropic-ai',
      'Claude-Web',
      'Bytespider',
      'PerplexityBot',
      'Applebot-Extended'
    ]

    aiCrawlers.forEach(bot => {
      lines.push(`User-agent: ${bot}`)
      lines.push('Disallow: /')
      lines.push('')
    })
  }

  // === 自定义规则（针对特定爬虫）===
  if (config.customRules) {
    lines.push('')
    lines.push('# Custom rules for specific bots')

    Object.entries(config.customRules).forEach(([userAgent, rules]) => {
      lines.push('')
      lines.push(`User-agent: ${userAgent}`)

      if (rules.allow) {
        rules.allow.forEach(path => lines.push(`Allow: ${path}`))
      }

      if (rules.disallow) {
        rules.disallow.forEach(path => lines.push(`Disallow: ${path}`))
      }

      if (rules.crawlDelay) {
        lines.push(`Crawl-delay: ${rules.crawlDelay}`)
      }
    })
  }

  // === Sitemap 位置 ===
  if (config.sitemapUrl) {
    lines.push('')
    const sitemaps = Array.isArray(config.sitemapUrl)
      ? config.sitemapUrl
      : [config.sitemapUrl]

    sitemaps.forEach(url => {
      lines.push(`Sitemap: ${url}`)
    })
  }

  // === 主机名（可选）===
  if (config.host) {
    lines.push('')
    lines.push(`Host: ${config.host}`)
  }

  return lines.join('\n') + '\n'
}

/**
 * 生成针对 SEO 优化的 robots.txt
 */
export function generateSEOFriendlyRobotsTxt(sitemapUrl: string, blockAI: boolean = false): string {
  return generateRobotsTxt({
    allowPaths: [
      '/',
      '/blog',
      '/blog/*',
      '/sitemap.xml',
      '/sitemap-*.xml'
    ],
    disallowPaths: [
      '/api/*',
      '/admin/*',
      '/_next/*',
      '/private/*',
      '/*.json$',
      '/*?*utm_',  // 屏蔽带 UTM 参数的 URL
      '/*?*session',
      '/*?*sid'
    ],
    sitemapUrl,
    crawlDelay: 1,
    blockAI,
    customRules: {
      'Googlebot': {
        crawlDelay: 0  // Google 不需要延迟
      },
      'Baiduspider': {
        crawlDelay: 2  // 百度稍微慢一点
      }
    }
  })
}

// ============================================
// 爬虫行为分析
// ============================================

export interface CrawlPattern {
  totalVisits: number
  uniquePages: Set<string>
  visitFrequency: number  // 平均访问间隔（毫秒）
  avgTimeOnSite: number
  bounceRate: number
  crawlDepth: number
}

export class SpiderAnalytics {
  private patterns: Map<string, CrawlPattern> = new Map()

  /**
   * 记录爬虫访问
   */
  recordVisit(botName: string, page: string, timestamp: number) {
    let pattern = this.patterns.get(botName)

    if (!pattern) {
      pattern = {
        totalVisits: 0,
        uniquePages: new Set(),
        visitFrequency: 0,
        avgTimeOnSite: 0,
        bounceRate: 0,
        crawlDepth: 0
      }
      this.patterns.set(botName, pattern)
    }

    pattern.totalVisits++
    pattern.uniquePages.add(page)
  }

  /**
   * 获取爬虫友好度评分 (0-100)
   */
  getCrawlabilityScore(botName: string): number {
    const pattern = this.patterns.get(botName)
    if (!pattern) return 0

    let score = 0

    // 访问页面数量（40分）
    score += Math.min(pattern.uniquePages.size / 10, 1) * 40

    // 总访问次数（30分）
    score += Math.min(pattern.totalVisits / 100, 1) * 30

    // 爬取深度（30分）
    score += Math.min(pattern.crawlDepth / 5, 1) * 30

    return Math.round(score)
  }

  /**
   * 获取所有爬虫的统计
   */
  getAllStats() {
    const stats: Record<string, any> = {}

    this.patterns.forEach((pattern, botName) => {
      stats[botName] = {
        totalVisits: pattern.totalVisits,
        uniquePages: pattern.uniquePages.size,
        crawlabilityScore: this.getCrawlabilityScore(botName)
      }
    })

    return stats
  }
}
