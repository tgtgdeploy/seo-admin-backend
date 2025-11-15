/**
 * DataForSEO API Integration
 *
 * 提供关键词搜索量、难度、CPC 等数据
 *
 * 使用方法：
 * 1. 注册账号: https://app.dataforseo.com/register
 * 2. 获取 API 凭证
 * 3. 设置环境变量:
 *    - DATAFORSEO_LOGIN
 *    - DATAFORSEO_PASSWORD
 * 4. 充值测试（$1 起）
 *
 * 价格：
 * - Keywords Data: $0.003/关键词
 * - 例如查询 1000 个关键词 = $3
 */

export interface KeywordDataResult {
  keyword: string
  search_volume: number
  competition: number // 0-1
  cpc: number
  monthly_searches?: Array<{ year: number; month: number; search_volume: number }>
}

export interface DataForSEOConfig {
  login: string
  password: string
  locationCode?: number // Default: 2840 (USA)
  languageCode?: string // Default: 'en'
}

/**
 * 获取关键词搜索量数据
 * @param keywords 关键词数组（最多1000个）
 * @param config API 配置
 * @returns 关键词数据数组
 */
export async function getKeywordSearchVolume(
  keywords: string[],
  config: DataForSEOConfig
): Promise<KeywordDataResult[]> {
  const { login, password, locationCode = 2840, languageCode = 'en' } = config

  if (!login || !password) {
    throw new Error('DataForSEO credentials not provided')
  }

  if (keywords.length === 0) {
    return []
  }

  if (keywords.length > 1000) {
    throw new Error('Maximum 1000 keywords per request')
  }

  const auth = Buffer.from(`${login}:${password}`).toString('base64')

  try {
    const response = await fetch(
      'https://api.dataforseo.com/v3/keywords_data/google/search_volume/live',
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            language_code: languageCode,
            location_code: locationCode,
            keywords: keywords,
          },
        ]),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`DataForSEO API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (data.status_code !== 20000) {
      throw new Error(`DataForSEO API error: ${data.status_message}`)
    }

    const results = data.tasks?.[0]?.result || []
    return results.map((item: any) => ({
      keyword: item.keyword,
      search_volume: item.search_volume || 0,
      competition: item.competition || 0,
      cpc: item.cpc || 0,
      monthly_searches: item.monthly_searches || [],
    }))
  } catch (error) {
    console.error('Failed to fetch keyword data from DataForSEO:', error)
    throw error
  }
}

/**
 * 获取关键词难度评分
 * @param keywords 关键词数组
 * @param config API 配置
 * @returns 关键词难度数据
 */
export async function getKeywordDifficulty(
  keywords: string[],
  config: DataForSEOConfig
): Promise<Array<{ keyword: string; difficulty: number }>> {
  const { login, password, locationCode = 2840, languageCode = 'en' } = config

  const auth = Buffer.from(`${login}:${password}`).toString('base64')

  try {
    const response = await fetch(
      'https://api.dataforseo.com/v3/dataforseo_labs/google/bulk_keyword_difficulty/live',
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            language_code: languageCode,
            location_code: locationCode,
            keywords: keywords,
          },
        ]),
      }
    )

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status}`)
    }

    const data = await response.json()
    const results = data.tasks?.[0]?.result || []

    return results.map((item: any) => ({
      keyword: item.keyword,
      difficulty: item.keyword_difficulty || 0,
    }))
  } catch (error) {
    console.error('Failed to fetch keyword difficulty:', error)
    throw error
  }
}

/**
 * 批量更新关键词数据（分批处理）
 * @param keywords 关键词数组
 * @param config API 配置
 * @param batchSize 每批处理的关键词数量（默认100）
 * @returns 所有关键词数据
 */
export async function batchUpdateKeywords(
  keywords: string[],
  config: DataForSEOConfig,
  batchSize: number = 100
): Promise<KeywordDataResult[]> {
  const results: KeywordDataResult[] = []

  for (let i = 0; i < keywords.length; i += batchSize) {
    const batch = keywords.slice(i, i + batchSize)
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(keywords.length / batchSize)}...`)

    try {
      const batchResults = await getKeywordSearchVolume(batch, config)
      results.push(...batchResults)

      // 避免 API 速率限制
      if (i + batchSize < keywords.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error(`Failed to process batch starting at index ${i}:`, error)
      // 继续处理下一批
    }
  }

  return results
}

/**
 * 从环境变量创建配置
 */
export function getDataForSEOConfigFromEnv(): DataForSEOConfig {
  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD

  if (!login || !password) {
    throw new Error(
      'DataForSEO credentials not found in environment variables. ' +
      'Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD'
    )
  }

  return {
    login,
    password,
    locationCode: process.env.DATAFORSEO_LOCATION_CODE
      ? parseInt(process.env.DATAFORSEO_LOCATION_CODE)
      : 2840, // USA
    languageCode: process.env.DATAFORSEO_LANGUAGE_CODE || 'en',
  }
}
