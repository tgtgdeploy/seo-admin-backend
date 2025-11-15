/**
 * Tavily API Integration
 *
 * 用于获取实时搜索结果和检查关键词排名
 *
 * 使用方法：
 * 1. 注册账号: https://tavily.com/
 * 2. 获取 API Key
 * 3. 设置环境变量: TAVILY_API_KEY
 *
 * 价格：
 * - 免费版: 1,000 credits/月
 * - 付费版: $30/月 4,000 credits
 * - Basic Search: 1 credit/次
 * - Advanced Search: 2 credits/次
 *
 * 优势：
 * - 免费额度是 SerpApi 的 10 倍（1000 vs 100）
 * - 为 AI 应用优化，返回结构化数据
 * - 支持深度搜索和内容提取
 */

export interface TavilySearchResult {
  title: string
  url: string
  content: string
  score: number
  raw_content?: string
}

export interface TavilySearchResponse {
  query: string
  follow_up_questions: string[] | null
  answer: string | null
  images: string[]
  results: TavilySearchResult[]
  response_time: number
}

export interface TavilyConfig {
  apiKey: string
  searchDepth?: 'basic' | 'advanced' // basic=1 credit, advanced=2 credits
  maxResults?: number // 默认 5，最大 10
  includeDomains?: string[]
  excludeDomains?: string[]
}

export interface RankingResult {
  keyword: string
  position: number | null
  url: string | null
  title: string | null
  totalResults: number
  searchedAt: Date
}

/**
 * 执行搜索查询
 * @param query 搜索关键词
 * @param config Tavily 配置
 * @returns 搜索结果
 */
export async function searchWithTavily(
  query: string,
  config: TavilyConfig
): Promise<TavilySearchResponse> {
  const {
    apiKey,
    searchDepth = 'basic',
    maxResults = 10,
    includeDomains,
    excludeDomains,
  } = config

  if (!apiKey) {
    throw new Error('Tavily API key not provided')
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: searchDepth,
        max_results: maxResults,
        include_domains: includeDomains,
        exclude_domains: excludeDomains,
        include_answer: false,
        include_raw_content: false,
        include_images: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Tavily API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Failed to search with Tavily for "${query}":`, error)
    throw error
  }
}

/**
 * 检查关键词排名位置
 * @param keyword 关键词
 * @param targetDomain 目标域名（如: telegramdata.com）
 * @param config Tavily 配置
 * @returns 排名结果
 */
export async function checkKeywordRanking(
  keyword: string,
  targetDomain: string,
  config: TavilyConfig
): Promise<RankingResult> {
  try {
    // 使用 basic search 节省 credits（1 credit vs 2 credits）
    const searchConfig: TavilyConfig = {
      ...config,
      searchDepth: 'basic',
      maxResults: 10, // 检查前 10 个结果
    }

    const searchResults = await searchWithTavily(keyword, searchConfig)

    // 查找目标域名的排名
    const targetResult = searchResults.results.find((result) =>
      result.url?.includes(targetDomain)
    )

    // Tavily 不直接提供 position，需要根据数组索引计算
    const position = targetResult
      ? searchResults.results.indexOf(targetResult) + 1
      : null

    return {
      keyword,
      position,
      url: targetResult?.url || null,
      title: targetResult?.title || null,
      totalResults: searchResults.results.length,
      searchedAt: new Date(),
    }
  } catch (error) {
    console.error(`Failed to check ranking for keyword "${keyword}":`, error)
    throw error
  }
}

/**
 * 批量检查多个关键词的排名
 * @param keywords 关键词数组
 * @param targetDomain 目标域名
 * @param config Tavily 配置
 * @param delayMs 每次请求之间的延迟（毫秒）
 * @returns 排名结果数组
 */
export async function batchCheckRankings(
  keywords: string[],
  targetDomain: string,
  config: TavilyConfig,
  delayMs: number = 1000
): Promise<RankingResult[]> {
  const results: RankingResult[] = []

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i]
    console.log(`Checking ranking ${i + 1}/${keywords.length}: "${keyword}"...`)

    try {
      const result = await checkKeywordRanking(keyword, targetDomain, config)
      results.push(result)

      if (result.position) {
        console.log(`   ✓ 找到排名: 第 ${result.position} 位`)
      } else {
        console.log(`   - 未找到排名（前10位之外）`)
      }

      // 避免 API 速率限制
      if (i < keywords.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    } catch (error) {
      console.error(`Failed to check ranking for "${keyword}":`, error)
      results.push({
        keyword,
        position: null,
        url: null,
        title: null,
        totalResults: 0,
        searchedAt: new Date(),
      })
    }
  }

  return results
}

/**
 * 获取相关搜索建议
 * @param keyword 关键词
 * @param config Tavily 配置
 * @returns 相关关键词数组
 */
export async function getRelatedKeywords(
  keyword: string,
  config: TavilyConfig
): Promise<string[]> {
  try {
    const searchConfig: TavilyConfig = {
      ...config,
      searchDepth: 'advanced', // 使用 advanced 获取更多信息
      maxResults: 5,
    }

    const searchResults = await searchWithTavily(keyword, searchConfig)

    // Tavily 返回 follow_up_questions 可以作为相关关键词
    return searchResults.follow_up_questions || []
  } catch (error) {
    console.error(`Failed to get related keywords for "${keyword}":`, error)
    return []
  }
}

/**
 * 从环境变量创建配置
 */
export function getTavilyConfigFromEnv(): TavilyConfig {
  const apiKey = process.env.TAVILY_API_KEY

  if (!apiKey) {
    throw new Error(
      'Tavily API key not found in environment variables. ' +
      'Please set TAVILY_API_KEY'
    )
  }

  return {
    apiKey,
    searchDepth: (process.env.TAVILY_SEARCH_DEPTH as 'basic' | 'advanced') || 'basic',
    maxResults: process.env.TAVILY_MAX_RESULTS
      ? parseInt(process.env.TAVILY_MAX_RESULTS)
      : 10,
  }
}

/**
 * 检查 API 配额使用情况
 * 注意：Tavily 没有直接的配额查询 API，需要根据使用情况估算
 */
export function estimateCreditsUsed(
  searchCount: number,
  searchDepth: 'basic' | 'advanced' = 'basic'
): number {
  const creditsPerSearch = searchDepth === 'basic' ? 1 : 2
  return searchCount * creditsPerSearch
}

/**
 * 计算剩余配额
 */
export function calculateRemainingCredits(
  monthlyLimit: number,
  usedCredits: number
): { remaining: number; percentage: number } {
  const remaining = monthlyLimit - usedCredits
  const percentage = (remaining / monthlyLimit) * 100

  return {
    remaining: Math.max(0, remaining),
    percentage: Math.max(0, Math.min(100, percentage)),
  }
}

/**
 * 获取搜索结果的所有 URL（用于分析竞争对手）
 */
export async function getTopRankingUrls(
  keyword: string,
  config: TavilyConfig,
  limit: number = 10
): Promise<Array<{ position: number; url: string; title: string }>> {
  try {
    const searchConfig: TavilyConfig = {
      ...config,
      searchDepth: 'basic',
      maxResults: limit,
    }

    const searchResults = await searchWithTavily(keyword, searchConfig)

    return searchResults.results.map((result, index) => ({
      position: index + 1,
      url: result.url,
      title: result.title,
    }))
  } catch (error) {
    console.error(`Failed to get top ranking URLs for "${keyword}":`, error)
    return []
  }
}
