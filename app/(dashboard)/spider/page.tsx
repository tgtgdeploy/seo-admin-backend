'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from '@/components/I18nProvider'

interface SpiderLog {
  id: string
  ip: string
  userAgent: string
  url: string
  bot: string | null
  createdAt: string
  website: {
    name: string
  }
}

interface SpiderStats {
  totalVisits: number
  uniqueBots: number
  topBots: Array<{
    bot: string
    count: number
  }>
  recentVisits: SpiderLog[]
}

interface DomainSpiderStats {
  domain: string
  siteName: string
  isPrimary: boolean
  website: {
    id: string
    name: string
    domain: string
  }
  primaryTags: string[]
  totalVisits: number
  bots: Array<{
    name: string
    count: number
  }>
  lastVisit: string | null
  lastBot: string | null
  healthScore: number
}

interface SpiderByDomainData {
  domains: DomainSpiderStats[]
  totalDomains: number
  activeDomains: number
  averageHealth: number
}

async function fetchSpiderStats(timeRange: string = '24h'): Promise<SpiderStats> {
  const response = await fetch(`/api/spider/stats?range=${timeRange}`)
  if (!response.ok) throw new Error('Failed to fetch spider stats')
  return response.json()
}

async function fetchSpiderByDomain(timeRange: string = '24h'): Promise<SpiderByDomainData> {
  const response = await fetch(`/api/spider/by-domain?range=${timeRange}`)
  if (!response.ok) throw new Error('Failed to fetch spider stats by domain')
  return response.json()
}

export default function SpiderPage() {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const domainParam = searchParams?.get('domain') || null

  const [timeRange, setTimeRange] = useState('24h')
  const [view, setView] = useState<'overview' | 'by-domain'>('overview')

  // Auto-switch to by-domain view if domain parameter is present
  useEffect(() => {
    if (domainParam) {
      setView('by-domain')
    }
  }, [domainParam])

  const { data: stats, isLoading } = useQuery({
    queryKey: ['spider-stats', timeRange],
    queryFn: () => fetchSpiderStats(timeRange),
    enabled: view === 'overview',
  })

  const { data: domainData, isLoading: isDomainLoading } = useQuery({
    queryKey: ['spider-by-domain', timeRange],
    queryFn: () => fetchSpiderByDomain(timeRange),
    enabled: view === 'by-domain',
  })

  const isLoadingAny = isLoading || isDomainLoading

  const botIcons: Record<string, string> = {
    googlebot: '🔍',
    bingbot: '🦅',
    baiduspider: '🐻',
    yandexbot: '🟥',
    sogou: '🟧',
    '360spider': '🔵',
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('spider.title')}</h1>
            <p className="mt-2 text-gray-600">
              {t('spider.subtitle')}
            </p>
            {domainParam && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm">
                <span className="mr-2">🔍</span>
                {t('spider.filteringBy')}: {domainParam}
              </div>
            )}
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
          >
            <option value="1h">{t('spider.lastHour')}</option>
            <option value="24h">{t('spider.last24Hours')}</option>
            <option value="7d">{t('spider.last7Days')}</option>
            <option value="30d">{t('spider.last30Days')}</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => setView('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              view === 'overview'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t('spider.overviewView')}
          </button>
          <button
            onClick={() => setView('by-domain')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              view === 'by-domain'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t('spider.byDomainView')}
          </button>
        </div>
      </div>

      {isLoadingAny ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : view === 'overview' && stats ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-indigo-500 p-3">
                    <span className="text-2xl">🕷️</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {t('spider.totalVisits')}
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stats?.totalVisits ?? 0}
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
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {t('spider.uniqueBots')}
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stats?.uniqueBots ?? 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex-shrink-0 rounded-md bg-purple-500 p-3 inline-flex">
                  <span className="text-2xl">📊</span>
                </div>
                <dl className="mt-2">
                  <dt className="text-sm font-medium text-gray-500">{t('spider.topBot')}</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats?.topBots[0] ? (
                      <span className="flex items-center">
                        <span className="mr-2">
                          {botIcons[stats.topBots[0].bot.toLowerCase()] || '🤖'}
                        </span>
                        {stats.topBots[0].bot} ({stats.topBots[0].count})
                      </span>
                    ) : (
                      t('common.notAvailable')
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top Bots */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {t('spider.topCrawlers')}
              </h2>
              {stats?.topBots && stats.topBots.length > 0 ? (
                <div className="space-y-3">
                  {stats.topBots.map((bot, index) => (
                    <div key={bot.bot} className="flex items-center">
                      <span className="text-2xl mr-3">
                        {botIcons[bot.bot.toLowerCase()] || '🤖'}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {bot.bot}
                          </span>
                          <span className="text-sm text-gray-500">
                            {t('spider.visitsCount', { count: bot.count })}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{
                              width: `${(bot.count / stats.topBots[0].count) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  {t('spider.noVisits')}
                </p>
              )}
            </div>

            {/* Recent Visits */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {t('spider.recentVisits')}
              </h2>
              {stats?.recentVisits && stats.recentVisits.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {stats.recentVisits.map((visit) => (
                    <div
                      key={visit.id}
                      className="border-l-4 border-indigo-500 bg-gray-50 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">
                          {botIcons[visit.bot?.toLowerCase() || ''] || '🤖'}{' '}
                          {visit.bot || t('common.unknown')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(visit.createdAt), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      <p className="text-gray-600 truncate">{visit.url}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{visit.ip}</span>
                        <span className="text-xs text-gray-500">
                          {visit.website.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  {t('spider.noRecentVisits')}
                </p>
              )}
            </div>
          </div>
        </>
      ) : view === 'by-domain' && domainData ? (
        <>
          {/* Domain Stats Summary */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-indigo-500 p-3">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {t('spider.totalDomains')}
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {domainData.totalDomains}
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
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {t('spider.activeDomains')}
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {domainData.activeDomains}
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
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {t('spider.averageHealth')}
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {domainData.averageHealth}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Domain Cards */}
          <div className="space-y-6">
            {(domainData.domains || [])
              .filter((domain) => !domainParam || domain.domain === domainParam)
              .map((domain) => (
              <div
                key={domain.domain}
                className="bg-white rounded-lg shadow p-6"
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
                          {t('spider.primaryDomain')}
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

                  {/* Health Score Badge */}
                  <div className="text-center ml-6">
                    <div className={`text-3xl font-bold ${
                      domain.healthScore >= 80 ? 'text-green-600' :
                      domain.healthScore >= 60 ? 'text-yellow-600' :
                      domain.healthScore >= 40 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {domain.healthScore}
                    </div>
                    <div className="text-xs text-gray-500">{t('spider.healthScore')}</div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500">{t('spider.totalVisits')}</div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {domain.totalVisits}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500">{t('spider.uniqueBots')}</div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {domain.bots.length}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500">{t('spider.lastBot')}</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {domain.lastBot ? (
                        <span className="flex items-center">
                          {botIcons[domain.lastBot.toLowerCase()] || '🤖'} {domain.lastBot}
                        </span>
                      ) : (
                        <span className="text-gray-400">{t('common.never')}</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500">{t('spider.lastVisit')}</div>
                    <div className="text-xs text-gray-900">
                      {domain.lastVisit
                        ? format(new Date(domain.lastVisit), 'MMM d, HH:mm')
                        : t('common.never')}
                    </div>
                  </div>
                </div>

                {/* Bot Breakdown */}
                {domain.bots.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      {t('spider.botBreakdown')}
                    </h4>
                    <div className="space-y-2">
                      {domain.bots.map((bot) => (
                        <div key={bot.name} className="flex items-center">
                          <span className="text-lg mr-2">
                            {botIcons[bot.name.toLowerCase()] || '🤖'}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {bot.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {bot.count} {t('spider.visits')}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-indigo-600 h-1.5 rounded-full"
                                style={{
                                  width: `${(bot.count / domain.totalVisits) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {domain.totalVisits === 0 && (
                  <div className="text-center py-4 text-sm text-gray-500">
                    {t('spider.noVisitsForDomain')}
                  </div>
                )}
              </div>
            ))}

            {domainData.domains.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <span className="text-6xl">🌐</span>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  {t('spider.noDomains')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('spider.noDomainsDesc')}
                </p>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
