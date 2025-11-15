'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from '@/components/I18nProvider'
import Link from 'next/link'

interface DomainHealth {
  domain: string
  siteName: string
  isPrimary: boolean
  website: {
    id: string
    name: string
    domain: string
  }
  primaryTags: string[]
  healthScore: number
  metrics: {
    indexedPages: number
    totalPages: number
    indexedPercentage: number
    crawlCount24h: number
    topKeywords: number
    uniqueBots: number
  }
  issues: string[]
}

interface SEOHealthData {
  summary: {
    totalDomains: number
    averageHealth: number
    totalIndexed: number
    totalPages: number
    indexedRate: number
    totalCrawls24h: number
    totalTopKeywords: number
  }
  domains: DomainHealth[]
}

async function fetchSEOHealth(): Promise<SEOHealthData> {
  const response = await fetch('/api/seo/health')
  if (!response.ok) throw new Error('Failed to fetch SEO health')
  return response.json()
}

function getHealthColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-100'
  if (score >= 60) return 'text-yellow-600 bg-yellow-100'
  if (score >= 40) return 'text-orange-600 bg-orange-100'
  return 'text-red-600 bg-red-100'
}

function getHealthLabel(score: number, t: (key: string) => string): string {
  if (score >= 80) return t('seoDashboard.healthExcellent')
  if (score >= 60) return t('seoDashboard.healthGood')
  if (score >= 40) return t('seoDashboard.healthFair')
  return t('seoDashboard.healthPoor')
}

export default function SEODashboardPage() {
  const t = useTranslations()

  const { data, isLoading } = useQuery({
    queryKey: ['seo-health'],
    queryFn: fetchSEOHealth,
    refetchInterval: 60000, // Refresh every minute
  })

  const getIssueText = (issue: string): string => {
    const issueMap: Record<string, string> = {
      low_indexed_rate: t('seoDashboard.issueLowIndexed'),
      no_recent_crawls: t('seoDashboard.issueNoCrawls'),
      low_crawl_activity: t('seoDashboard.issueLowCrawls'),
      no_top_rankings: t('seoDashboard.issueNoRankings'),
      low_bot_diversity: t('seoDashboard.issueLowBots'),
    }
    return issueMap[issue] || issue
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('seoDashboard.title')}</h1>
        <p className="mt-2 text-gray-600">
          {t('seoDashboard.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Average Health */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-indigo-500 p-3">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {t('seoDashboard.averageHealth')}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-3xl font-semibold text-gray-900">
                          {data.summary.averageHealth}
                        </div>
                        <div className="ml-2 text-sm text-gray-500">/100</div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthColor(data.summary.averageHealth)}`}>
                    {getHealthLabel(data.summary.averageHealth, t)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Domains */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {t('seoDashboard.totalDomains')}
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {data.summary.totalDomains}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Indexed Pages */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-purple-500 p-3">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {t('seoDashboard.indexedPages')}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-3xl font-semibold text-gray-900">
                          {data.summary.totalIndexed}
                        </div>
                        <div className="ml-2 text-sm text-gray-500">
                          / {data.summary.totalPages}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xs text-gray-500">
                    {t('seoDashboard.indexedRate')}: {data.summary.indexedRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Spider Activity */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-orange-500 p-3">
                    <span className="text-2xl">🕷️</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {t('seoDashboard.crawls24h')}
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {data.summary.totalCrawls24h}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xs text-gray-500">
                    {t('seoDashboard.topKeywords')}: {data.summary.totalTopKeywords}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Domain Health Cards */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('seoDashboard.domainHealth')}
            </h2>

            {data.domains.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <span className="text-6xl">🌐</span>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  {t('seoDashboard.noDomains')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('seoDashboard.noDomainsDesc')}
                </p>
              </div>
            ) : (
              data.domains.map((domain) => (
                <div
                  key={domain.domain}
                  className="bg-white rounded-lg shadow border border-gray-200 p-6"
                >
                  {/* Domain Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {domain.domain}
                        </h3>
                        {domain.isPrimary && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {t('seoDashboard.primaryDomain')}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{domain.siteName}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {domain.primaryTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Health Score */}
                    <div className="text-center ml-6">
                      <div className={`text-4xl font-bold ${getHealthColor(domain.healthScore).replace('bg-', 'text-').replace('-100', '-600')}`}>
                        {domain.healthScore}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getHealthLabel(domain.healthScore, t)}
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs text-gray-500">{t('seoDashboard.indexed')}</div>
                      <div className="text-2xl font-semibold text-gray-900">
                        {domain.metrics.indexedPages}
                      </div>
                      <div className="text-xs text-gray-500">
                        {domain.metrics.indexedPercentage}% {t('seoDashboard.ofTotal')}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs text-gray-500">{t('seoDashboard.crawls')}</div>
                      <div className="text-2xl font-semibold text-gray-900">
                        {domain.metrics.crawlCount24h}
                      </div>
                      <div className="text-xs text-gray-500">{t('seoDashboard.last24h')}</div>
                    </div>

                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs text-gray-500">{t('seoDashboard.top10Keywords')}</div>
                      <div className="text-2xl font-semibold text-gray-900">
                        {domain.metrics.topKeywords}
                      </div>
                      <div className="text-xs text-gray-500">{t('seoDashboard.keywords')}</div>
                    </div>
                  </div>

                  {/* Issues */}
                  {domain.issues.length > 0 && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="text-sm font-medium text-yellow-800 mb-2">
                        ⚠️ {t('seoDashboard.issuesFound', { count: domain.issues.length })}
                      </div>
                      <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                        {domain.issues.map((issue) => (
                          <li key={issue}>{getIssueText(issue)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/sitemaps`}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
                    >
                      {t('seoDashboard.viewSitemap')}
                    </Link>
                    <Link
                      href={`/spider`}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                    >
                      {t('seoDashboard.viewSpiderLogs')}
                    </Link>
                    <Link
                      href={`/keywords`}
                      className="px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                    >
                      {t('seoDashboard.viewKeywords')}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
