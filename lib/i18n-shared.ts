/**
 * 共享的 i18n 工具函数（客户端和服务端都可以使用）
 */

export type Locale = 'en' | 'zh'

export const defaultLocale: Locale = 'zh'
export const locales: Locale[] = ['en', 'zh']

/**
 * 创建翻译函数
 * 可以在客户端和服务端组件中使用
 */
export function createTranslator(messages: any) {
  return function t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.')
    let value: any = messages

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key // 返回 key 作为降级
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    // 替换参数
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match
      })
    }

    return value
  }
}
