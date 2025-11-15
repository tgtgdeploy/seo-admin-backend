import { prisma } from '../index'
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto'

// 加密密钥（从环境变量获取，或使用默认值）
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || 'default-32-character-secret-key!'
const ALGORITHM = 'aes-256-cbc'

/**
 * 加密敏感数据
 */
function encrypt(text: string): string {
  // 使用固定的密钥派生
  const key = createHash('sha256').update(ENCRYPTION_KEY).digest()
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  // 返回 iv:encrypted 格式
  return iv.toString('hex') + ':' + encrypted
}

/**
 * 解密敏感数据
 */
function decrypt(text: string): string {
  try {
    const key = createHash('sha256').update(ENCRYPTION_KEY).digest()
    const parts = text.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encryptedText = parts[1]

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('解密失败:', error)
    return text // 如果解密失败，返回原文本
  }
}

/**
 * 获取单个设置值
 */
export async function getSetting(key: string, defaultValue?: string): Promise<string | null> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key },
  })

  if (!setting) {
    return defaultValue || null
  }

  // 如果是加密的，先解密
  if (setting.isEncrypted) {
    return decrypt(setting.value)
  }

  return setting.value
}

/**
 * 获取多个设置值
 */
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const settings = await prisma.systemSetting.findMany({
    where: {
      key: {
        in: keys,
      },
    },
  })

  const result: Record<string, string> = {}
  settings.forEach((setting: { key: string; value: string; isEncrypted: boolean }) => {
    result[setting.key] = setting.isEncrypted
      ? decrypt(setting.value)
      : setting.value
  })

  return result
}

/**
 * 获取分类下的所有设置
 */
export async function getSettingsByCategory(category: string): Promise<Record<string, any>[]> {
  const settings = await prisma.systemSetting.findMany({
    where: { category: category as any },
    orderBy: { key: 'asc' },
  })

  return settings.map((setting: any) => ({
    id: setting.id,
    key: setting.key,
    value: setting.isEncrypted ? '••••••••' : setting.value, // 敏感信息不返回实际值
    description: setting.description,
    category: setting.category,
    isEncrypted: setting.isEncrypted,
    updatedAt: setting.updatedAt,
  }))
}

/**
 * 设置单个值
 */
export async function setSetting(
  key: string,
  value: string,
  options?: {
    description?: string
    category?: string
    isEncrypted?: boolean
  }
): Promise<void> {
  const { description, category = 'GENERAL', isEncrypted = false } = options || {}

  // 如果需要加密，先加密值
  const finalValue = isEncrypted ? encrypt(value) : value

  await prisma.systemSetting.upsert({
    where: { key },
    update: {
      value: finalValue,
      description,
      category: category as any,
      isEncrypted,
    },
    create: {
      key,
      value: finalValue,
      description,
      category: category as any,
      isEncrypted,
    },
  })
}

/**
 * 批量设置
 */
export async function setSettings(
  settings: Array<{
    key: string
    value: string
    description?: string
    category?: string
    isEncrypted?: boolean
  }>
): Promise<void> {
  await Promise.all(
    settings.map((setting: any) =>
      setSetting(setting.key, setting.value, {
        description: setting.description,
        category: setting.category,
        isEncrypted: setting.isEncrypted,
      })
    )
  )
}

/**
 * 删除设置
 */
export async function deleteSetting(key: string): Promise<void> {
  await prisma.systemSetting.delete({
    where: { key },
  })
}

/**
 * 获取所有设置（用于管理界面）
 */
export async function getAllSettings(): Promise<Record<string, any>[]> {
  const settings = await prisma.systemSetting.findMany({
    orderBy: [
      { category: 'asc' },
      { key: 'asc' },
    ],
  })

  return settings.map((setting: any) => ({
    id: setting.id,
    key: setting.key,
    value: setting.isEncrypted ? '••••••••' : setting.value,
    description: setting.description,
    category: setting.category,
    isEncrypted: setting.isEncrypted,
    updatedAt: setting.updatedAt,
  }))
}

/**
 * 预定义的设置键
 */
export const SETTING_KEYS = {
  // API 配置
  OPENAI_API_KEY: 'openai_api_key',
  OPENAI_MODEL: 'openai_model',

  // Google 服务
  GOOGLE_ANALYTICS_ID: 'google_analytics_id',
  GOOGLE_SEARCH_CONSOLE_ID: 'google_search_console_id',

  // 其他搜索引擎
  BING_WEBMASTER_KEY: 'bing_webmaster_key',
  BAIDU_TONGJI_ID: 'baidu_tongji_id',

  // 通知
  SMTP_HOST: 'smtp_host',
  SMTP_PORT: 'smtp_port',
  SMTP_USER: 'smtp_user',
  SMTP_PASSWORD: 'smtp_password',

  // SEO 设置
  DEFAULT_SEO_TITLE_TEMPLATE: 'default_seo_title_template',
  DEFAULT_SEO_DESCRIPTION: 'default_seo_description',
} as const
