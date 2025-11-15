import axios, { AxiosRequestConfig } from 'axios'
import * as cheerio from 'cheerio'

// ============================================
// 类型定义
// ============================================

export interface RankResult {
  keyword: string
  position: number | null
  url: string | null
  searchEngine: string
  error?: string
  snippet?: string  // 搜索结果片段
  title?: string    // 搜索结果标题
  features?: string[]  // SERP 特征（featured snippet, PAA等）
}

export interface KeywordMetrics {
  keyword: string
  searchVolume?: number  // 搜索量
  competition?: 'low' | 'medium' | 'high'  // 竞争度
  cpc?: number  // 每次点击费用
  difficulty?: number  // SEO 难度（1-100）
  trend?: 'rising' | 'stable' | 'falling'  // 趋势
}

export interface CompetitorAnalysis {
  domain: string
  position: number
  url: string
  title?: string
  snippet?: string
}

export interface SERPFeature {
  type: 'featured_snippet' | 'people_also_ask' | 'local_pack' | 'knowledge_panel' | 'image_pack' | 'video_carousel' | 'shopping_results'
  present: boolean
  data?: any
}

export interface KeywordSuggestion {
  keyword: string
  relevance: number  // 相关度（0-1）
  source: 'related' | 'autocomplete' | 'lsi'  // 来源
}

// ============================================
// 排名检查（增强版）
// ============================================

/**
 * Google 排名检查（支持 API 和爬虫两种方式）
 */
export async function checkGoogleRank(
  keyword: string,
  domain: string,
  options?: {
    apiKey?: string
    searchEngineId?: string
    location?: string  // 地理位置（如 'us', 'cn'）
    language?: string  // 语言（如 'en', 'zh-CN'）
    maxResults?: number  // 最大检查结果数（默认 100）
  }
): Promise<RankResult> {
  try {
    if (options?.apiKey && options?.searchEngineId) {
      // 使用 Google Custom Search API（推荐）
      return await checkGoogleRankWithAPI(keyword, domain, {
        apiKey: options.apiKey,
        searchEngineId: options.searchEngineId,
        location: options.location,
        language: options.language,
        maxResults: options.maxResults,
      })
    } else {
      // 使用爬虫方式（仅用于测试，生产环境不推荐）
      return await checkGoogleRankWithScraper(keyword, domain, options)
    }
  } catch (error: any) {
    return {
      keyword,
      position: null,
      url: null,
      searchEngine: 'google',
      error: error.message || String(error),
    }
  }
}

/**
 * 使用 Google Custom Search API 检查排名
 */
async function checkGoogleRankWithAPI(
  keyword: string,
  domain: string,
  options: {
    apiKey: string
    searchEngineId: string
    location?: string
    language?: string
    maxResults?: number
  }
): Promise<RankResult> {
  const maxResults = Math.min(options.maxResults || 100, 100)  // API 限制最多 100
  const params: any = {
    key: options.apiKey,
    cx: options.searchEngineId,
    q: keyword,
    num: Math.min(maxResults, 10),  // 每次请求最多 10 个
  }

  if (options.location) {
    params.gl = options.location
  }

  if (options.language) {
    params.hl = options.language
  }

  let allItems: any[] = []
  let startIndex = 1

  // 分页获取结果
  while (allItems.length < maxResults) {
    if (startIndex > 1) {
      params.start = startIndex
    }

    const response = await axios.get(
      'https://www.googleapis.com/customsearch/v1',
      { params }
    )

    const items = response.data.items || []
    if (items.length === 0) break

    allItems = allItems.concat(items)
    startIndex += 10

    if (items.length < 10) break  // 没有更多结果
  }

  const position = allItems.findIndex((item: any) =>
    item.link.includes(domain)
  )

  if (position >= 0) {
    const result = allItems[position]
    return {
      keyword,
      position: position + 1,
      url: result.link,
      searchEngine: 'google',
      title: result.title,
      snippet: result.snippet,
    }
  }

  return {
    keyword,
    position: null,
    url: null,
    searchEngine: 'google',
  }
}

/**
 * 使用爬虫方式检查 Google 排名（仅供测试）
 */
async function checkGoogleRankWithScraper(
  keyword: string,
  domain: string,
  options?: {
    location?: string
    language?: string
    maxResults?: number
  }
): Promise<RankResult> {
  const maxResults = options?.maxResults || 100
  const params: any = {
    q: keyword,
    num: Math.min(maxResults, 100),
  }

  if (options?.location) {
    params.gl = options.location
  }

  if (options?.language) {
    params.hl = options.language
  }

  const queryString = new URLSearchParams(params).toString()

  const response = await axios.get(
    `https://www.google.com/search?${queryString}`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': options?.language || 'en-US,en;q=0.9',
      },
      timeout: 10000,
    }
  )

  const $ = cheerio.load(response.data)
  let position: number | null = null
  let url: string | null = null
  let title: string | undefined
  let snippet: string | undefined

  // 解析搜索结果
  $('div.g, div[data-hveid]').each((index: number, element: any) => {
    if (position !== null) return  // 已找到，停止查找

    const link = $(element).find('a').first().attr('href')
    if (link && link.includes(domain)) {
      position = index + 1
      url = link
      title = $(element).find('h3').first().text()
      snippet = $(element).find('div[data-sncf="1"]').first().text() ||
                $(element).find('.VwiC3b').first().text()
    }
  })

  return {
    keyword,
    position,
    url,
    searchEngine: 'google',
    title,
    snippet,
  }
}

/**
 * 百度排名检查
 */
export async function checkBaiduRank(
  keyword: string,
  domain: string,
  options?: {
    maxResults?: number
  }
): Promise<RankResult> {
  try {
    const maxResults = options?.maxResults || 100

    const response = await axios.get(
      `https://www.baidu.com/s?wd=${encodeURIComponent(keyword)}&rn=${maxResults}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'zh-CN,zh;q=0.9',
        },
        timeout: 10000,
      }
    )

    const $ = cheerio.load(response.data)
    let position: number | null = null
    let url: string | null = null
    let title: string | undefined
    let snippet: string | undefined

    $('div.result').each((index: number, element: any) => {
      if (position !== null) return

      const link = $(element).find('a').first().attr('href')
      if (link && link.includes(domain)) {
        position = index + 1
        url = link
        title = $(element).find('h3').first().text()
        snippet = $(element).find('.c-abstract').first().text()
      }
    })

    return {
      keyword,
      position,
      url,
      searchEngine: 'baidu',
      title,
      snippet,
    }
  } catch (error: any) {
    return {
      keyword,
      position: null,
      url: null,
      searchEngine: 'baidu',
      error: error.message || String(error),
    }
  }
}

/**
 * Bing 排名检查
 */
export async function checkBingRank(
  keyword: string,
  domain: string,
  options?: {
    apiKey?: string
    location?: string
    maxResults?: number
  }
): Promise<RankResult> {
  try {
    const maxResults = options?.maxResults || 100

    const params: any = {
      q: keyword,
      count: Math.min(maxResults, 50),  // Bing 限制
    }

    if (options?.location) {
      params.mkt = options.location  // 如 'en-US', 'zh-CN'
    }

    const response = await axios.get(
      `https://www.bing.com/search?${new URLSearchParams(params).toString()}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      }
    )

    const $ = cheerio.load(response.data)
    let position: number | null = null
    let url: string | null = null
    let title: string | undefined
    let snippet: string | undefined

    $('.b_algo').each((index: number, element: any) => {
      if (position !== null) return

      const link = $(element).find('a').first().attr('href')
      if (link && link.includes(domain)) {
        position = index + 1
        url = link
        title = $(element).find('h2').first().text()
        snippet = $(element).find('.b_caption p').first().text()
      }
    })

    return {
      keyword,
      position,
      url,
      searchEngine: 'bing',
      title,
      snippet,
    }
  } catch (error: any) {
    return {
      keyword,
      position: null,
      url: null,
      searchEngine: 'bing',
      error: error.message || String(error),
    }
  }
}

/**
 * 批量检查排名（增强版）
 */
export async function checkRankings(
  keywords: string[],
  domain: string,
  searchEngines: ('google' | 'baidu' | 'bing')[] = ['google', 'baidu'],
  options?: {
    delay?: number  // 请求间隔（毫秒）
    parallel?: boolean  // 是否并行请求
    onProgress?: (completed: number, total: number) => void  // 进度回调
  }
): Promise<RankResult[]> {
  const results: RankResult[] = []
  const delay = options?.delay || 2000
  const total = keywords.length * searchEngines.length

  if (options?.parallel) {
    // 并行请求（更快，但可能被限流）
    const promises: Promise<RankResult>[] = []

    for (const keyword of keywords) {
      for (const engine of searchEngines) {
        promises.push(
          engine === 'google'
            ? checkGoogleRank(keyword, domain)
            : engine === 'bing'
            ? checkBingRank(keyword, domain)
            : checkBaiduRank(keyword, domain)
        )
      }
    }

    return Promise.all(promises)
  } else {
    // 串行请求（更安全）
    let completed = 0

    for (const keyword of keywords) {
      for (const engine of searchEngines) {
        let result: RankResult

        if (engine === 'google') {
          result = await checkGoogleRank(keyword, domain)
        } else if (engine === 'bing') {
          result = await checkBingRank(keyword, domain)
        } else {
          result = await checkBaiduRank(keyword, domain)
        }

        results.push(result)
        completed++

        options?.onProgress?.(completed, total)

        // 添加延迟，避免被封IP
        if (completed < total) {
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    return results
  }
}

// ============================================
// SERP 特征检测
// ============================================

/**
 * 检测 Google SERP 特征
 */
export async function detectGoogleSERPFeatures(keyword: string): Promise<SERPFeature[]> {
  try {
    const response = await axios.get(
      `https://www.google.com/search?q=${encodeURIComponent(keyword)}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      }
    )

    const $ = cheerio.load(response.data)
    const features: SERPFeature[] = []

    // Featured Snippet
    if ($('[data-attrid="FeaturedSnippet"]').length > 0 || $('.xpdopen').length > 0) {
      features.push({
        type: 'featured_snippet',
        present: true,
        data: {
          content: $('.xpdopen').first().text().trim()
        }
      })
    }

    // People Also Ask
    if ($('[jsname="yEVEwb"]').length > 0 || $('.related-question-pair').length > 0) {
      features.push({
        type: 'people_also_ask',
        present: true,
        data: {
          questions: $('.related-question-pair').map((_, el) => $(el).text().trim()).get()
        }
      })
    }

    // Local Pack
    if ($('[data-feature-type="local_results"]').length > 0) {
      features.push({
        type: 'local_pack',
        present: true
      })
    }

    // Knowledge Panel
    if ($('[data-attrid="kc:/"]').length > 0 || $('.kp-wholepage').length > 0) {
      features.push({
        type: 'knowledge_panel',
        present: true
      })
    }

    // Image Pack
    if ($('.islrtb').length > 0 || $('#imagebox_bigimages').length > 0) {
      features.push({
        type: 'image_pack',
        present: true
      })
    }

    // Video Carousel
    if ($('[data-ved*="2ahUKEwj"]').length > 0) {
      features.push({
        type: 'video_carousel',
        present: true
      })
    }

    // Shopping Results
    if ($('.commercial-unit-desktop-top').length > 0) {
      features.push({
        type: 'shopping_results',
        present: true
      })
    }

    return features
  } catch (error) {
    console.error('Error detecting SERP features:', error)
    return []
  }
}

// ============================================
// 竞争对手分析
// ============================================

/**
 * 分析关键词的竞争对手
 */
export async function analyzeCompetitors(
  keyword: string,
  searchEngine: 'google' | 'baidu' | 'bing' = 'google',
  topN: number = 10
): Promise<CompetitorAnalysis[]> {
  try {
    let response

    if (searchEngine === 'google') {
      response = await axios.get(
        `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=${topN}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          timeout: 10000,
        }
      )
    } else if (searchEngine === 'baidu') {
      response = await axios.get(
        `https://www.baidu.com/s?wd=${encodeURIComponent(keyword)}&rn=${topN}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          timeout: 10000,
        }
      )
    } else {
      response = await axios.get(
        `https://www.bing.com/search?q=${encodeURIComponent(keyword)}&count=${topN}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          timeout: 10000,
        }
      )
    }

    const $ = cheerio.load(response.data)
    const competitors: CompetitorAnalysis[] = []

    const selector = searchEngine === 'google'
      ? 'div.g'
      : searchEngine === 'baidu'
      ? 'div.result'
      : '.b_algo'

    $(selector).each((index: number, element: any) => {
      if (competitors.length >= topN) return

      const link = $(element).find('a').first().attr('href')
      if (!link) return

      try {
        const url = new URL(link)
        const domain = url.hostname.replace('www.', '')

        competitors.push({
          domain,
          position: index + 1,
          url: link,
          title: $(element).find('h3, h2').first().text().trim(),
          snippet: $(element).find('.VwiC3b, .c-abstract, .b_caption p').first().text().trim()
        })
      } catch {
        // 跳过无效 URL
      }
    })

    return competitors
  } catch (error) {
    console.error('Error analyzing competitors:', error)
    return []
  }
}

// ============================================
// 关键词建议
// ============================================

/**
 * 获取关键词建议（Google Autocomplete）
 */
export async function getKeywordSuggestions(
  seed: string,
  language: string = 'en'
): Promise<KeywordSuggestion[]> {
  try {
    const response = await axios.get(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seed)}&hl=${language}`,
      {
        timeout: 5000,
      }
    )

    const suggestions = response.data[1] || []

    return suggestions.map((keyword: string, index: number) => ({
      keyword,
      relevance: 1 - (index / suggestions.length),  // 越靠前相关度越高
      source: 'autocomplete' as const
    }))
  } catch (error) {
    console.error('Error getting keyword suggestions:', error)
    return []
  }
}

/**
 * 获取相关关键词
 */
export async function getRelatedKeywords(
  keyword: string,
  searchEngine: 'google' | 'baidu' = 'google'
): Promise<KeywordSuggestion[]> {
  try {
    const url = searchEngine === 'google'
      ? `https://www.google.com/search?q=${encodeURIComponent(keyword)}`
      : `https://www.baidu.com/s?wd=${encodeURIComponent(keyword)}`

    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    })

    const $ = cheerio.load(response.data)
    const related: KeywordSuggestion[] = []

    if (searchEngine === 'google') {
      // Google "Searches related to"
      $('div[data-hveid] a').each((index, element) => {
        const text = $(element).text().trim()
        if (text && text !== keyword) {
          related.push({
            keyword: text,
            relevance: 1 - (index / 10),
            source: 'related'
          })
        }
      })
    } else {
      // 百度相关搜索
      $('#rs a').each((index, element) => {
        const text = $(element).text().trim()
        if (text && text !== keyword) {
          related.push({
            keyword: text,
            relevance: 1 - (index / 10),
            source: 'related'
          })
        }
      })
    }

    return related.slice(0, 10)  // 返回前10个
  } catch (error) {
    console.error('Error getting related keywords:', error)
    return []
  }
}

// ============================================
// 关键词难度分析
// ============================================

/**
 * 估算关键词 SEO 难度（简化版本）
 * 真实难度需要使用专业 API（如 Ahrefs, SEMrush）
 */
export async function estimateKeywordDifficulty(
  keyword: string,
  searchEngine: 'google' | 'baidu' = 'google'
): Promise<{
  difficulty: number  // 1-100
  competition: 'low' | 'medium' | 'high'
  factors: {
    resultsCount?: number
    topDomainsAuthority?: 'low' | 'medium' | 'high'
    serpFeatures?: number
  }
}> {
  try {
    const url = searchEngine === 'google'
      ? `https://www.google.com/search?q=${encodeURIComponent(keyword)}`
      : `https://www.baidu.com/s?wd=${encodeURIComponent(keyword)}`

    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    })

    const $ = cheerio.load(response.data)

    // 提取结果数量
    let resultsCount = 0
    const resultsText = $('#result-stats, .nums').first().text()
    const match = resultsText.match(/[\d,]+/)
    if (match) {
      resultsCount = parseInt(match[0].replace(/,/g, ''))
    }

    // 检测 SERP 特征数量
    const serpFeaturesCount = searchEngine === 'google'
      ? $('.xpdopen, [data-attrid], .related-question-pair').length
      : 0

    // 简单难度计算
    let difficulty = 0

    // 基于结果数量
    if (resultsCount > 100000000) difficulty += 40
    else if (resultsCount > 10000000) difficulty += 30
    else if (resultsCount > 1000000) difficulty += 20
    else difficulty += 10

    // 基于 SERP 特征
    difficulty += Math.min(serpFeaturesCount * 10, 40)

    // 基于顶部域名（简化判断）
    const hasWikipedia = response.data.includes('wikipedia.org')
    const hasGov = response.data.includes('.gov')
    if (hasWikipedia || hasGov) difficulty += 20

    difficulty = Math.min(difficulty, 100)

    const competition: 'low' | 'medium' | 'high' =
      difficulty < 30 ? 'low' : difficulty < 60 ? 'medium' : 'high'

    return {
      difficulty,
      competition,
      factors: {
        resultsCount,
        topDomainsAuthority: hasWikipedia || hasGov ? 'high' : 'medium',
        serpFeatures: serpFeaturesCount
      }
    }
  } catch (error) {
    console.error('Error estimating keyword difficulty:', error)
    return {
      difficulty: 50,  // 默认中等难度
      competition: 'medium',
      factors: {}
    }
  }
}

// ============================================
// 辅助函数
// ============================================

/**
 * 添加随机延迟（避免被检测为机器人）
 */
export async function randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
  const delay = Math.random() * (max - min) + min
  return new Promise(resolve => setTimeout(resolve, delay))
}

/**
 * 重试机制
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}
