'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslations } from '@/components/I18nProvider'
import { SpiderPoolDomains } from './components/SpiderPoolDomains'

interface SpiderPoolStats {
  overview: {
    totalPages: number
    totalDomains: number
    totalViews: number
    totalCrawlerVisits: number
  }
  domainStats: Array<{
    domainAliasId: string
    domain: string
    siteName: string
    pageCount: number
  }>
  recentCrawls: Array<{
    title: string
    slug: string
    lastCrawled: string
    crawlerVisits: number
    domainAlias: {
      domain: string
    }
  }>
}

interface ContentSource {
  id: string
  name: string
  description: string | null
  filePath: string | null
  totalParagraphs: number
  totalHeadings: number
  totalKeywords: number
  status: string
  isActive: boolean
  lastUsed: string | null
  createdAt: string
}

async function fetchSpiderPoolStats(): Promise<SpiderPoolStats> {
  const response = await fetch('/api/spider-pool/stats')
  if (!response.ok) throw new Error('Failed to fetch spider pool stats')
  return response.json()
}

async function fetchContentSources(): Promise<{ sources: ContentSource[] }> {
  const response = await fetch('/api/spider-pool/sources')
  if (!response.ok) throw new Error('Failed to fetch content sources')
  return response.json()
}

async function initializeContentSources(): Promise<void> {
  const response = await fetch('/api/spider-pool/sources', {
    method: 'POST',
  })
  if (!response.ok) throw new Error('Failed to initialize content sources')
}

async function generateSpiderPool(initSources: boolean = false): Promise<void> {
  const response = await fetch('/api/spider-pool/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initSources }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to generate spider pool')
  }
}

export default function SpiderPoolPage() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'overview' | 'domains' | 'sources'>('overview')

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['spider-pool-stats'],
    queryFn: fetchSpiderPoolStats,
  })

  const { data: sourcesData, isLoading: isLoadingSources } = useQuery({
    queryKey: ['spider-pool-sources'],
    queryFn: fetchContentSources,
    enabled: activeTab === 'sources',
  })

  const initSourcesMutation = useMutation({
    mutationFn: initializeContentSources,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spider-pool-sources'] })
      alert('内容源初始化成功！')
    },
    onError: (error: Error) => {
      alert(`初始化失败: ${error.message}`)
    },
  })

  const generateMutation = useMutation({
    mutationFn: generateSpiderPool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spider-pool-stats'] })
      alert('蜘蛛池页面生成成功！')
    },
    onError: (error: Error) => {
      alert(`生成失败: ${error.message}`)
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🕸️ 蜘蛛池管理</h1>
        <p className="mt-2 text-gray-600">
          动态管理9个蜘蛛池域名和1,350个SEO优化页面
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            📊 概览统计
          </button>
          <button
            onClick={() => setActiveTab('domains')}
            className={`${
              activeTab === 'domains'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            🌐 域名管理
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`${
              activeTab === 'sources'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            📝 内容源
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Action Buttons */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => generateMutation.mutate(false)}
              disabled={generateMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {generateMutation.isPending ? '生成中...' : '🔄 重新生成所有页面'}
            </button>
            <button
              onClick={() => generateMutation.mutate(true)}
              disabled={generateMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {generateMutation.isPending ? '初始化中...' : '⚡ 初始化并生成'}
            </button>
          </div>

          {isLoadingStats ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-md bg-indigo-500 p-3">
                        <span className="text-2xl">📄</span>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            总页面数
                          </dt>
                          <dd className="text-3xl font-semibold text-gray-900">
                            {stats.overview.totalPages}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
                        <span className="text-2xl">🌐</span>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            蜘蛛池域名
                          </dt>
                          <dd className="text-3xl font-semibold text-gray-900">
                            {stats.overview.totalDomains}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-md bg-purple-500 p-3">
                        <span className="text-2xl">👀</span>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            总访问量
                          </dt>
                          <dd className="text-3xl font-semibold text-gray-900">
                            {stats.overview.totalViews}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-md bg-yellow-500 p-3">
                        <span className="text-2xl">🕷️</span>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            爬虫访问
                          </dt>
                          <dd className="text-3xl font-semibold text-gray-900">
                            {stats.overview.totalCrawlerVisits}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Domain Stats */}
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  域名分布统计
                </h2>
                <div className="space-y-4">
                  {stats.domainStats.map((domain) => (
                    <div
                      key={domain.domainAliasId}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {domain.domain}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {domain.siteName}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">
                          {domain.pageCount}
                        </div>
                        <div className="text-xs text-gray-500">页面</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Crawls */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  最近爬虫访问
                </h2>
                {stats.recentCrawls.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentCrawls.map((crawl, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-indigo-500 bg-gray-50 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {crawl.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {crawl.domainAlias.domain}/{crawl.slug}.html
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">
                              {crawl.crawlerVisits} 次
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(crawl.lastCrawled).toLocaleString('zh-CN')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    暂无爬虫访问记录
                  </p>
                )}
              </div>
            </>
          ) : null}
        </>
      )}

      {/* Domains Tab */}
      {activeTab === 'domains' && <SpiderPoolDomains />}

      {/* Sources Tab */}
      {activeTab === 'sources' && (
        <>
          <div className="mb-6">
            <button
              onClick={() => initSourcesMutation.mutate()}
              disabled={initSourcesMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {initSourcesMutation.isPending ? '初始化中...' : '🔄 重新提取内容源'}
            </button>
          </div>

          {isLoadingSources ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : sourcesData?.sources ? (
            <div className="grid grid-cols-1 gap-6">
              {sourcesData.sources.map((source) => (
                <div
                  key={source.id}
                  className="bg-white shadow rounded-lg p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {source.name}
                      </h3>
                      {source.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {source.description}
                        </p>
                      )}
                      {source.filePath && (
                        <p className="text-xs text-gray-500 mt-2 font-mono">
                          {source.filePath}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        source.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {source.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded p-3">
                      <div className="text-xs text-gray-600">段落数</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {source.totalParagraphs}
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded p-3">
                      <div className="text-xs text-gray-600">标题数</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {source.totalHeadings}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded p-3">
                      <div className="text-xs text-gray-600">关键词数</div>
                      <div className="text-2xl font-bold text-green-600">
                        {source.totalKeywords}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>创建: {new Date(source.createdAt).toLocaleString('zh-CN')}</span>
                    {source.lastUsed && (
                      <span>最后使用: {new Date(source.lastUsed).toLocaleString('zh-CN')}</span>
                    )}
                  </div>
                </div>
              ))}

              {sourcesData.sources.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <span className="text-6xl">📝</span>
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    暂无内容源
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    点击上方按钮初始化内容源
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
