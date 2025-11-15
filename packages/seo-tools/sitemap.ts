import { SitemapStream, streamToPromise, SitemapItemLoose, EnumYesNo } from 'sitemap'
import { Readable } from 'stream'
import { createGzip } from 'zlib'

// ============================================
// 类型定义
// ============================================

export interface SitemapUrl {
  url: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  lastmod?: string | Date
  img?: Array<{
    url: string
    caption?: string
    title?: string
    geoLocation?: string
    license?: string
  }>
  video?: Array<{
    thumbnail_loc: string
    title: string
    description: string
    content_loc?: string
    player_loc?: string
    duration?: number
    publication_date?: string
    family_friendly?: boolean
    rating?: number
  }>
  news?: {
    publication: {
      name: string
      language: string
    }
    publication_date: string
    title: string
  }
  links?: Array<{
    lang: string
    url: string
  }>
}

export interface SitemapIndexEntry {
  url: string
  lastmod?: string | Date
}

export interface SitemapOptions {
  hostname: string
  compress?: boolean  // 是否生成 gzip 压缩版本
  xmlNs?: string[]  // 额外的 XML 命名空间
  lastmodDateOnly?: boolean  // lastmod 是否只显示日期（不含时间）
}

export interface SitemapSubmitResult {
  success: boolean
  status?: number
  data?: any
  error?: string
  message?: string
}

// ============================================
// Sitemap 生成（增强版）
// ============================================

/**
 * 生成标准 XML Sitemap
 * @param options 站点配置
 * @param urls URL 列表
 * @returns XML 字符串
 */
export async function generateSitemap(
  options: SitemapOptions,
  urls: SitemapUrl[]
): Promise<string> {
  const streamOptions: any = {
    hostname: options.hostname
  }

  if (options.xmlNs) {
    streamOptions.xmlNs = options.xmlNs
  }

  if (options.lastmodDateOnly) {
    streamOptions.lastmodDateOnly = true
  }

  const stream = new SitemapStream(streamOptions)

  // 转换为 SitemapItemLoose 格式
  const items = urls.map(url => ({
    ...url,
    lastmod: url.lastmod instanceof Date ? url.lastmod.toISOString() : url.lastmod
  })) as SitemapItemLoose[]

  const xmlString = await streamToPromise(
    Readable.from(items).pipe(stream)
  ).then((data) => data.toString())

  return xmlString
}

/**
 * 生成压缩的 Sitemap（gzip）
 * @param options 站点配置
 * @param urls URL 列表
 * @returns 压缩后的 Buffer
 */
export async function generateCompressedSitemap(
  options: SitemapOptions,
  urls: SitemapUrl[]
): Promise<Buffer> {
  const streamOptions: any = {
    hostname: options.hostname
  }

  const stream = new SitemapStream(streamOptions)
  const gzip = createGzip()

  const items = urls.map(url => ({
    ...url,
    lastmod: url.lastmod instanceof Date ? url.lastmod.toISOString() : url.lastmod
  })) as SitemapItemLoose[]

  const compressedData = await streamToPromise(
    Readable.from(items).pipe(stream).pipe(gzip)
  )

  return compressedData as Buffer
}

/**
 * 生成 Sitemap 索引文件
 * @param hostname 网站主机名
 * @param sitemaps Sitemap 列表
 * @returns XML 字符串
 */
export async function generateSitemapIndex(
  hostname: string,
  sitemaps: SitemapIndexEntry[]
): Promise<string> {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ]

  for (const sitemap of sitemaps) {
    lines.push('  <sitemap>')
    lines.push(`    <loc>${hostname}${sitemap.url}</loc>`)

    if (sitemap.lastmod) {
      const lastmodStr = sitemap.lastmod instanceof Date
        ? sitemap.lastmod.toISOString()
        : sitemap.lastmod
      lines.push(`    <lastmod>${lastmodStr}</lastmod>`)
    }

    lines.push('  </sitemap>')
  }

  lines.push('</sitemapindex>')

  return lines.join('\n')
}

/**
 * 将大型 URL 列表分片为多个 Sitemap
 * @param urls 完整 URL 列表
 * @param maxUrlsPerSitemap 每个 sitemap 的最大 URL 数量（默认 50000）
 * @returns 分片后的 URL 数组
 */
export function splitSitemapUrls(
  urls: SitemapUrl[],
  maxUrlsPerSitemap: number = 50000
): SitemapUrl[][] {
  const chunks: SitemapUrl[][] = []

  for (let i = 0; i < urls.length; i += maxUrlsPerSitemap) {
    chunks.push(urls.slice(i, i + maxUrlsPerSitemap))
  }

  return chunks
}

/**
 * 自动生成多个 Sitemap 和索引文件
 * @param options 站点配置
 * @param urls 完整 URL 列表
 * @param basePath Sitemap 文件的基础路径（如 '/sitemap'）
 * @returns 包含索引和各个 sitemap 的对象
 */
export async function generateMultipleSitemaps(
  options: SitemapOptions,
  urls: SitemapUrl[],
  basePath: string = '/sitemap'
): Promise<{
  index: string
  sitemaps: Array<{ filename: string; content: string }>
}> {
  const chunks = splitSitemapUrls(urls)
  const sitemaps: Array<{ filename: string; content: string }> = []
  const indexEntries: SitemapIndexEntry[] = []

  for (let i = 0; i < chunks.length; i++) {
    const filename = `${basePath}-${i + 1}.xml`
    const content = await generateSitemap(options, chunks[i])

    sitemaps.push({ filename, content })
    indexEntries.push({
      url: filename,
      lastmod: new Date()
    })
  }

  const index = await generateSitemapIndex(options.hostname, indexEntries)

  return { index, sitemaps }
}

// ============================================
// 特殊类型 Sitemap
// ============================================

/**
 * 生成图片 Sitemap
 */
export async function generateImageSitemap(
  options: SitemapOptions,
  urls: Array<{
    url: string
    images: Array<{
      url: string
      caption?: string
      title?: string
    }>
  }>
): Promise<string> {
  const sitemapUrls: SitemapUrl[] = urls.map(item => ({
    url: item.url,
    img: item.images
  }))

  return generateSitemap({
    ...options,
    xmlNs: [
      'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
    ]
  }, sitemapUrls)
}

/**
 * 生成视频 Sitemap
 */
export async function generateVideoSitemap(
  options: SitemapOptions,
  urls: Array<{
    url: string
    videos: Array<{
      thumbnail_loc: string
      title: string
      description: string
      content_loc?: string
      duration?: number
    }>
  }>
): Promise<string> {
  const sitemapUrls: SitemapUrl[] = urls.map(item => ({
    url: item.url,
    video: item.videos
  }))

  return generateSitemap({
    ...options,
    xmlNs: [
      'xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"'
    ]
  }, sitemapUrls)
}

/**
 * 生成多语言 Sitemap（hreflang）
 */
export async function generateMultilingualSitemap(
  options: SitemapOptions,
  urls: Array<{
    url: string
    alternates: Array<{
      lang: string
      url: string
    }>
  }>
): Promise<string> {
  const sitemapUrls: SitemapUrl[] = urls.map(item => ({
    url: item.url,
    links: item.alternates
  }))

  return generateSitemap({
    ...options,
    xmlNs: [
      'xmlns:xhtml="http://www.w3.org/1999/xhtml"'
    ]
  }, sitemapUrls)
}

// ============================================
// Sitemap 验证
// ============================================

export interface SitemapValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    totalUrls: number
    invalidUrls: number
    duplicateUrls: number
  }
}

/**
 * 验证 Sitemap 配置
 * @param urls URL 列表
 * @returns 验证结果
 */
export function validateSitemap(urls: SitemapUrl[]): SitemapValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const urlSet = new Set<string>()
  let invalidUrls = 0
  let duplicateUrls = 0

  urls.forEach((item, index) => {
    // 检查必填字段
    if (!item.url) {
      errors.push(`URL ${index + 1}: 缺少必填字段 'url'`)
      invalidUrls++
      return
    }

    // 检查 URL 格式
    try {
      new URL(item.url)
    } catch {
      errors.push(`URL ${index + 1}: 无效的 URL 格式 '${item.url}'`)
      invalidUrls++
    }

    // 检查重复 URL
    if (urlSet.has(item.url)) {
      warnings.push(`URL ${index + 1}: 重复的 URL '${item.url}'`)
      duplicateUrls++
    }
    urlSet.add(item.url)

    // 检查 priority 范围
    if (item.priority !== undefined && (item.priority < 0 || item.priority > 1)) {
      warnings.push(`URL ${index + 1}: priority 应该在 0-1 之间，当前值: ${item.priority}`)
    }

    // 检查 URL 长度
    if (item.url.length > 2048) {
      warnings.push(`URL ${index + 1}: URL 长度超过 2048 字符`)
    }
  })

  // 检查总数限制
  if (urls.length > 50000) {
    errors.push(`Sitemap 包含 ${urls.length} 个 URL，超过限制 50000`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalUrls: urls.length,
      invalidUrls,
      duplicateUrls
    }
  }
}

// ============================================
// Sitemap 提交（增强版）
// ============================================

/**
 * 提交 Sitemap 到 Google
 * @param sitemapUrl 完整的 sitemap URL
 * @returns 提交结果
 */
export async function submitSitemapToGoogle(sitemapUrl: string): Promise<SitemapSubmitResult> {
  const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`

  try {
    const response = await fetch(pingUrl)
    return {
      success: response.ok,
      status: response.status,
      message: response.ok ? 'Successfully submitted to Google' : 'Failed to submit to Google'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Error submitting to Google'
    }
  }
}

/**
 * 提交 Sitemap 到百度
 * @param sitemapUrl 完整的 sitemap URL 或 URL 列表
 * @param site 站点域名
 * @param token 百度站长平台 token
 * @returns 提交结果
 */
export async function submitSitemapToBaidu(
  sitemapUrl: string | string[],
  site: string,
  token: string
): Promise<SitemapSubmitResult> {
  const baiduUrl = `http://data.zz.baidu.com/urls?site=${site}&token=${token}`

  try {
    const urls = Array.isArray(sitemapUrl) ? sitemapUrl.join('\n') : sitemapUrl

    const response = await fetch(baiduUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: urls,
    })
    const data = await response.json()

    return {
      success: response.ok,
      data,
      message: response.ok
        ? `Successfully submitted ${data.success || 0} URLs to Baidu`
        : 'Failed to submit to Baidu'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Error submitting to Baidu'
    }
  }
}

/**
 * 提交 Sitemap 到 Bing
 * @param sitemapUrl 完整的 sitemap URL
 * @param apiKey Bing Webmaster API Key
 * @returns 提交结果
 */
export async function submitSitemapToBing(
  sitemapUrl: string,
  apiKey: string
): Promise<SitemapSubmitResult> {
  const siteUrl = new URL(sitemapUrl).origin
  const bingUrl = `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${apiKey}`

  try {
    const response = await fetch(bingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        siteUrl,
        urlList: [sitemapUrl],
      }),
    })

    const data = response.headers.get('content-type')?.includes('json')
      ? await response.json()
      : null

    return {
      success: response.ok,
      status: response.status,
      data,
      message: response.ok ? 'Successfully submitted to Bing' : 'Failed to submit to Bing'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Error submitting to Bing'
    }
  }
}

/**
 * 提交 Sitemap 到 Yandex
 * @param sitemapUrl 完整的 sitemap URL
 * @param userId Yandex User ID
 * @param host 站点主机名
 * @returns 提交结果
 */
export async function submitSitemapToYandex(
  sitemapUrl: string,
  userId: string,
  host: string
): Promise<SitemapSubmitResult> {
  const yandexUrl = `https://webmaster.yandex.ru/api/v4/user/${userId}/hosts/${encodeURIComponent(host)}/sitemap`

  try {
    const response = await fetch(yandexUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: sitemapUrl
      }),
    })

    const data = response.headers.get('content-type')?.includes('json')
      ? await response.json()
      : null

    return {
      success: response.ok,
      status: response.status,
      data,
      message: response.ok ? 'Successfully submitted to Yandex' : 'Failed to submit to Yandex'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Error submitting to Yandex'
    }
  }
}

/**
 * 批量提交 Sitemap 到多个搜索引擎
 * @param sitemapUrl 完整的 sitemap URL
 * @param config 各搜索引擎的配置
 * @returns 各搜索引擎的提交结果
 */
export async function submitSitemapToAll(
  sitemapUrl: string,
  config: {
    google?: boolean
    baidu?: { site: string; token: string }
    bing?: { apiKey: string }
    yandex?: { userId: string; host: string }
  }
): Promise<{
  google?: SitemapSubmitResult
  baidu?: SitemapSubmitResult
  bing?: SitemapSubmitResult
  yandex?: SitemapSubmitResult
}> {
  const results: any = {}

  // 提交到 Google
  if (config.google) {
    results.google = await submitSitemapToGoogle(sitemapUrl)
  }

  // 提交到百度
  if (config.baidu) {
    results.baidu = await submitSitemapToBaidu(
      sitemapUrl,
      config.baidu.site,
      config.baidu.token
    )
  }

  // 提交到 Bing
  if (config.bing) {
    results.bing = await submitSitemapToBing(sitemapUrl, config.bing.apiKey)
  }

  // 提交到 Yandex
  if (config.yandex) {
    results.yandex = await submitSitemapToYandex(
      sitemapUrl,
      config.yandex.userId,
      config.yandex.host
    )
  }

  return results
}

// ============================================
// 辅助函数
// ============================================

/**
 * 从数据库或 CMS 生成 Sitemap URLs
 * @param items 内容项列表
 * @param config URL 生成配置
 * @returns Sitemap URL 列表
 */
export function generateSitemapUrls<T extends Record<string, any>>(
  items: T[],
  config: {
    urlTemplate: (item: T) => string
    lastmod?: (item: T) => string | Date
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
    priority?: number | ((item: T) => number)
  }
): SitemapUrl[] {
  return items.map(item => {
    const sitemapUrl: SitemapUrl = {
      url: config.urlTemplate(item),
      changefreq: config.changefreq || 'weekly',
      priority: typeof config.priority === 'function'
        ? config.priority(item)
        : (config.priority || 0.5)
    }

    if (config.lastmod) {
      sitemapUrl.lastmod = config.lastmod(item)
    }

    return sitemapUrl
  })
}

/**
 * 获取推荐的 changefreq
 * @param contentType 内容类型
 * @returns changefreq 值
 */
export function getRecommendedChangefreq(
  contentType: 'homepage' | 'blog' | 'product' | 'category' | 'static'
): 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' {
  const recommendations = {
    homepage: 'daily' as const,
    blog: 'weekly' as const,
    product: 'weekly' as const,
    category: 'weekly' as const,
    static: 'monthly' as const
  }

  return recommendations[contentType]
}

/**
 * 获取推荐的 priority
 * @param contentType 内容类型
 * @returns priority 值 (0-1)
 */
export function getRecommendedPriority(
  contentType: 'homepage' | 'blog' | 'product' | 'category' | 'static'
): number {
  const recommendations = {
    homepage: 1.0,
    blog: 0.7,
    product: 0.8,
    category: 0.6,
    static: 0.5
  }

  return recommendations[contentType]
}
