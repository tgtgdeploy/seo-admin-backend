import { getSetting, SETTING_KEYS } from '@repo/database/lib/settings'
import { createOpenAI } from '@ai-sdk/openai'

/**
 * 获取 OpenAI 配置
 * 优先级：数据库 > 环境变量
 */
export async function getOpenAIConfig(): Promise<{
  apiKey: string
  model: string
  useGateway: boolean
  gatewayKey?: string
}> {
  // 尝试从数据库获取
  const dbApiKey = await getSetting(SETTING_KEYS.OPENAI_API_KEY)
  const dbModel = await getSetting(SETTING_KEYS.OPENAI_MODEL)

  // 使用数据库配置，或回退到环境变量
  const apiKey = dbApiKey || process.env.OPENAI_API_KEY || ''
  const model = dbModel || process.env.OPENAI_MODEL || 'gpt-4-turbo'

  // Vercel AI Gateway 配置
  const gatewayKey = process.env.VERCEL_AI_GATEWAY_KEY || ''
  const useGateway = !!gatewayKey

  if (!apiKey && !useGateway) {
    throw new Error(
      'AI API 未配置。请设置 OPENAI_API_KEY 或 VERCEL_AI_GATEWAY_KEY 环境变量'
    )
  }

  return { apiKey, model, useGateway, gatewayKey }
}

/**
 * 获取配置好的 OpenAI 模型实例
 * 支持 Vercel AI Gateway
 * 优先级：Vercel Gateway > OpenAI Direct
 */
export async function getOpenAIModel() {
  const { apiKey, model, useGateway, gatewayKey } = await getOpenAIConfig()

  // 如果使用 Vercel AI Gateway
  if (useGateway && gatewayKey) {
    console.log('Using Vercel AI Gateway')
    const openai = createOpenAI({
      apiKey: gatewayKey, // 使用 Vercel Gateway Key
      baseURL: 'https://gateway.vercel.com/v1/openai',
    })
    return openai(model)
  }

  // 直接使用 OpenAI API
  console.log('Using OpenAI API directly')
  const openai = createOpenAI({
    apiKey,
  })

  return openai(model)
}

/**
 * 验证 OpenAI API Key 是否有效
 */
export async function validateOpenAIKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error('验证 OpenAI Key 失败:', error)
    return false
  }
}
