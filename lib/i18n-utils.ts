import { cookies } from 'next/headers'
import { Locale, defaultLocale, locales, createTranslator } from './i18n-shared'

// 重新导出类型和共享函数
export type { Locale }
export { defaultLocale, locales, createTranslator }

/**
 * 从 Cookie 获取当前语言（仅服务端）
 */
export function getLocale(): Locale {
  const cookieStore = cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')

  const locale = localeCookie?.value as Locale
  return locales.includes(locale) ? locale : defaultLocale
}

/**
 * 加载翻译文件（仅服务端）
 */
export async function getTranslations(locale: Locale = 'zh') {
  try {
    const messages = await import(`@/messages/${locale}.json`)
    return messages.default
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error)
    const fallbackMessages = await import(`@/messages/${defaultLocale}.json`)
    return fallbackMessages.default
  }
}
