'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from '@/components/I18nProvider'

interface Keyword {
  id: string
  keyword: string
  volume: number | null
  difficulty: number | null
  cpc: number | null
  website: {
    id: string
    name: string
  }
  rankings: Array<{
    position: number | null
    createdAt: string
    searchEngine: string
    domainAlias: {
      domain: string
      siteName: string
    } | null
  }>
}

async function fetchKeywords(websiteId?: string, domainAliasId?: string): Promise<Keyword[]> {
  const params = new URLSearchParams()
  if (websiteId) params.append('websiteId', websiteId)
  if (domainAliasId) params.append('domainAliasId', domainAliasId)

  const response = await fetch(`/api/keywords?${params.toString()}`)
  if (!response.ok) throw new Error('Failed to fetch keywords')
  return response.json()
}

async function fetchWebsites() {
  const response = await fetch('/api/websites')
  if (!response.ok) return []
  return response.json()
}

async function fetchDomainAliases(websiteId: string) {
  const response = await fetch(`/api/websites/${websiteId}/domains`)
  if (!response.ok) return []
  return response.json()
}

export default function KeywordsPage() {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const domainParam = searchParams?.get('domain') || null

  const [selectedWebsite, setSelectedWebsite] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('')

  const { data: websites } = useQuery({
    queryKey: ['websites'],
    queryFn: fetchWebsites,
  })

  const { data: domainAliases } = useQuery({
    queryKey: ['domainAliases', selectedWebsite],
    queryFn: () => fetchDomainAliases(selectedWebsite),
    enabled: !!selectedWebsite,
  })

  const { data: keywords, isLoading } = useQuery({
    queryKey: ['keywords', selectedWebsite, selectedDomain],
    queryFn: () => fetchKeywords(selectedWebsite, selectedDomain),
  })

  const handleWebsiteChange = (websiteId: string) => {
    setSelectedWebsite(websiteId)
    setSelectedDomain('') // 重置域名选择
  }

  const getLatestRanking = (rankings: Keyword['rankings']) => {
    if (rankings.length === 0) return null
    return rankings[0]
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('keywords.title')}</h1>
          <p className="mt-2 text-gray-600">
            {t('keywords.subtitle')}
          </p>
          {domainParam && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm">
              <span className="mr-2">🔍</span>
              {t('keywords.filteringBy')}: {domainParam}
            </div>
          )}
        </div>
        <Link
          href="/keywords/create"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          {t('keywords.add')}
        </Link>
      </div>

      {/* 筛选器 */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('keywords.filterByWebsite')}
            </label>
            <select
              value={selectedWebsite}
              onChange={(e) => handleWebsiteChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('keywords.allWebsites')}</option>
              {websites?.map((website: any) => (
                <option key={website.id} value={website.id}>
                  {website.name}
                </option>
              ))}
            </select>
          </div>
          {selectedWebsite && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('keywords.filterByDomain')}
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('keywords.allDomains')}</option>
                {domainAliases?.map((domain: any) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.siteName} ({domain.domain})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : keywords && keywords.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('keywords.table.keyword')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('keywords.table.website')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('keywords.table.volume')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('keywords.table.difficulty')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('keywords.table.ranking')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('keywords.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {keywords.map((keyword) => {
                const latestRanking = getLatestRanking(keyword.rankings)
                return (
                  <tr key={keyword.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {keyword.keyword}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {keyword.website.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {keyword.volume ? keyword.volume.toLocaleString() : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {keyword.difficulty ? (
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${keyword.difficulty}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">{keyword.difficulty}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {latestRanking ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">
                            #{latestRanking.position}
                          </span>
                          <span className="text-xs text-gray-500">
                            {latestRanking.domainAlias?.siteName || t('keywords.mainDomain')} / {latestRanking.searchEngine}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">{t('keywords.notRanked')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/keywords/${keyword.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {t('keywords.viewDetails')}
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <span className="text-6xl">🔑</span>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            {t('keywords.noKeywords')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('keywords.noKeywordsDesc')}
          </p>
          <div className="mt-6">
            <Link
              href="/keywords/create"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              {t('keywords.addFirst')}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
