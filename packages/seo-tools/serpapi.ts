/**
 * SerpApi Integration
 *
 * 用于获取实时 Google 搜索结果和排名位置
 *
 * 使用方法：
 * 1. 注册账号: https://serpapi.com/users/sign_up
 * 2. 获取 API Key
 * 3. 设置环境变量: SERPAPI_KEY
 *
 * 价格：
 * - 免费版: 100 次/月
 * - 开发者版: $50/月 5,000 次
 * - 生产版: $250/月 30,000 次
 */

export interface SearchResult {
  position: number
  title: string
  link: string
  snippet: string
  displayed_link?: string
}

export interface RankingResult {
  keyword: string
  position: number | null
  url: string | null
  title: string | null
  totalResults: number
  searchedAt: Date
}

export interface SerpApiConfig {
  apiKey: string
  engine?: 'google' | 'bing' | 'baidu'
  location?: string
  language?: string
  country?: string
}

/**
 * 检查关键词排名位置
 * @param keyword 关键词
 * @param targetDomain 目标域名（如: telegramdata.com）
 * @param config API 配置
 * @returns 排名结果
 */
export async function checkKeywordRanking(
  keyword: string,
  targetDomain: string,
  config: SerpApiConfig
): Promise<RankingResult> {
  const {
    apiKey,
    engine = 'google',
    location = 'United States',
    language = 'en',
    country = 'us',
  } = config

  if (!apiKey) {
    throw new Error('SerpApi API key not provided')
  }

  const params = new URLSearchParams({
    engine,
    q: keyword,
    api_key: apiKey,
    location,
    hl: language,
    gl: country,
    num: '100', // 获取前100个结果
  })

  try {
    const response = await fetch(`https://serpapi.com/search?${params}`)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`SerpApi error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`SerpApi error: ${data.error}`)
    }

    const organicResults: any[] = data.organic_results || []
    const totalResults = data.search_information?.total_results || 0

    // 查找目标域名的排名
    const targetResult = organicResults.find((result) =>
      result.link?.includes(targetDomain)
    )

    return {
      keyword,
      position: targetResult?.position || null,
      url: targetResult?.link || null,
      title: targetResult?.title || null,
      totalResults,
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
 * @param config API 配置
 * @param delayMs 每次请求之间的延迟（毫秒）
 * @returns 排名结果数组
 */
export async function batchCheckRankings(
  keywords: string[],
  targetDomain: string,
  config: SerpApiConfig,
  delayMs: number = 1000
): Promise<RankingResult[]> {
  const results: RankingResult[] = []

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i]
    console.log(`Checking ranking ${i + 1}/${keywords.length}: "${keyword}"...`)

    try {
      const result = await checkKeywordRanking(keyword, targetDomain, config)
      results.push(result)

      // 避免 API 速率限制
      if (i < keywords.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    } catch (error) {
      console.error(`Failed to check ranking for "${keyword}":`, error)
      // 添加失败的结果
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
 * 获取完整的搜索结果（前100个）
 * @param keyword 关键词
 * @param config API 配置
 * @returns 搜索结果数组
 */
export async function getSearchResults(
  keyword: string,
  config: SerpApiConfig
): Promise<SearchResult[]> {
  const {
    apiKey,
    engine = 'google',
    location = 'United States',
    language = 'en',
    country = 'us',
  } = config

  const params = new URLSearchParams({
    engine,
    q: keyword,
    api_key: apiKey,
    location,
    hl: language,
    gl: country,
    num: '100',
  })

  try {
    const response = await fetch(`https://serpapi.com/search?${params}`)

    if (!response.ok) {
      throw new Error(`SerpApi error: ${response.status}`)
    }

    const data = await response.json()
    const organicResults: any[] = data.organic_results || []

    return organicResults.map((result) => ({
      position: result.position,
      title: result.title,
      link: result.link,
      snippet: result.snippet,
      displayed_link: result.displayed_link,
    }))
  } catch (error) {
    console.error(`Failed to get search results for "${keyword}":`, error)
    throw error
  }
}

/**
 * 获取相关搜索建议
 * @param keyword 关键词
 * @param config API 配置
 * @returns 相关搜索数组
 */
export async function getRelatedSearches(
  keyword: string,
  config: SerpApiConfig
): Promise<string[]> {
  const {
    apiKey,
    engine = 'google',
    location = 'United States',
    language = 'en',
    country = 'us',
  } = config

  const params = new URLSearchParams({
    engine,
    q: keyword,
    api_key: apiKey,
    location,
    hl: language,
    gl: country,
  })

  try {
    const response = await fetch(`https://serpapi.com/search?${params}`)
    const data = await response.json()

    const relatedSearches = data.related_searches || []
    return relatedSearches.map((item: any) => item.query)
  } catch (error) {
    console.error(`Failed to get related searches for "${keyword}":`, error)
    return []
  }
}

/**
 * 从环境变量创建配置
 */
export function getSerpApiConfigFromEnv(): SerpApiConfig {
  const apiKey = process.env.SERPAPI_KEY

  if (!apiKey) {
    throw new Error(
      'SerpApi API key not found in environment variables. ' +
      'Please set SERPAPI_KEY'
    )
  }

  return {
    apiKey,
    engine: (process.env.SERPAPI_ENGINE as any) || 'google',
    location: process.env.SERPAPI_LOCATION || 'United States',
    language: process.env.SERPAPI_LANGUAGE || 'en',
    country: process.env.SERPAPI_COUNTRY || 'us',
  }
}

/**
 * 检查 API 配额剩余
 */
export async function checkApiQuota(apiKey: string): Promise<{
  total: number
  used: number
  remaining: number
}> {
  try {
    const response = await fetch(
      `https://serpapi.com/account?api_key=${apiKey}`
    )
    const data = await response.json()

    return {
      total: data.total_searches_limit || 0,
      used: data.total_searches || 0,
      remaining: (data.total_searches_limit || 0) - (data.total_searches || 0),
    }
  } catch (error) {
    console.error('Failed to check API quota:', error)
    throw error
  }
}
