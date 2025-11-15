'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useTranslations } from '@/components/I18nProvider'
import { useState } from 'react'

interface DomainAlias {
  id: string
  domain: string
  siteName: string
  siteDescription: string
  isPrimary: boolean
  status: string
  primaryTags: string[]
  secondaryTags: string[]
  website: {
    id: string
    name: string
    domain: string
  }
}

interface Sitemap {
  id: string
  url: string
  updatedAt: string
  submittedAt: string | null
  website: {
    id: string
    name: string
    domain: string
  }
}

async function fetchDomains(): Promise<DomainAlias[]> {
  const response = await fetch('/api/domains')
  if (!response.ok) throw new Error('Failed to fetch domains')
  return response.json()
}

async function fetchSitemaps(): Promise<Sitemap[]> {
  const response = await fetch('/api/sitemaps')
  if (!response.ok) throw new Error('Failed to fetch sitemaps')
  return response.json()
}

async function generateSitemap(websiteId: string) {
  const response = await fetch(`/api/sitemaps/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ websiteId }),
  })
  if (!response.ok) throw new Error('Failed to generate sitemap')
  return response.json()
}

async function submitSitemap(sitemapId: string, engines: string[]) {
  const response = await fetch(`/api/sitemaps/${sitemapId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ engines }),
  })
  if (!response.ok) throw new Error('Failed to submit sitemap')
  return response.json()
}

export default function SitemapsPage() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [view, setView] = useState<'domains' | 'legacy'>('domains')

  const { data: domains, isLoading: domainsLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: fetchDomains,
  })

  const { data: sitemaps, isLoading } = useQuery({
    queryKey: ['sitemaps'],
    queryFn: fetchSitemaps,
  })

  const generateMutation = useMutation({
    mutationFn: generateSitemap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sitemaps'] })
    },
  })

  const submitMutation = useMutation({
    mutationFn: ({ id, engines }: { id: string; engines: string[] }) =>
      submitSitemap(id, engines),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sitemaps'] })
    },
  })

  const getSitemapUrl = (domain: string) => {
    if (domain.includes('localhost')) {
      return `http://${domain}/sitemap.xml`
    }
    return `https://${domain}/sitemap.xml`
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🗺️ {t('sitemaps.title')}</h1>
        <p className="mt-2 text-gray-600">
          {t('sitemaps.subtitle')}
        </p>
      </div>

      {/* View Toggle */}
      <div className="mb-6 flex space-x-2">
        <button
          onClick={() => setView('domains')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            view === 'domains'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {t('sitemaps.domainsView')}
        </button>
        <button
          onClick={() => setView('legacy')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            view === 'legacy'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {t('sitemaps.legacyView')}
        </button>
      </div>

      {/* Domains View */}
      {view === 'domains' && (
        <>
          {domainsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-2 text-gray-600">{t('common.loading')}</p>
            </div>
          ) : domains && domains.length > 0 ? (
            <div className="grid gap-6">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="bg-white rounded-lg shadow border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {domain.domain}
                        </h3>
                        {domain.isPrimary && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {t('sitemaps.primaryDomain')}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            domain.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {domain.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{domain.siteName}</p>
                      <p className="mt-1 text-sm text-gray-500">{domain.siteDescription}</p>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-medium text-gray-700 mb-2">
                            {t('sitemaps.relatedWebsite')}
                          </h4>
                          <p className="text-sm text-gray-900">{domain.website.name}</p>
                          <p className="text-xs text-gray-500">{domain.website.domain}</p>
                        </div>

                        <div>
                          <h4 className="text-xs font-medium text-gray-700 mb-2">
                            {t('sitemaps.primaryTags')}
                          </h4>
                          <div className="flex flex-wrap gap-1">
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
                      </div>

                      <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                        <h4 className="text-xs font-medium text-gray-700 mb-2">
                          {t('sitemaps.sitemapUrl')}
                        </h4>
                        <a
                          href={getSitemapUrl(domain.domain)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-900 font-mono break-all"
                        >
                          {getSitemapUrl(domain.domain)}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <a
                      href={getSitemapUrl(domain.domain)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
                    >
                      {t('sitemaps.viewSitemap')}
                    </a>
                    <button
                      onClick={() => {
                        window.open(
                          `https://www.google.com/ping?sitemap=${encodeURIComponent(
                            getSitemapUrl(domain.domain)
                          )}`,
                          '_blank'
                        )
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                    >
                      {t('sitemaps.submitToGoogle')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <span className="text-6xl">🌐</span>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                {t('sitemaps.noDomains')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('sitemaps.noDomainsDesc')}
              </p>
            </div>
          )}
        </>
      )}

      {/* Legacy View */}
      {view === 'legacy' && (
        <>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-2 text-gray-600">{t('common.loading')}</p>
            </div>
          ) : sitemaps && sitemaps.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sitemaps.table.website')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sitemaps.table.url')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sitemaps.table.lastGenerated')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sitemaps.table.lastSubmitted')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sitemaps.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sitemaps.map((sitemap) => (
                <tr key={sitemap.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {sitemap.website.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {sitemap.website.domain}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={sitemap.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-900 truncate block max-w-xs"
                    >
                      {sitemap.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sitemap.updatedAt
                      ? format(new Date(sitemap.updatedAt), 'MMM d, yyyy HH:mm')
                      : t('common.never')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sitemap.submittedAt
                      ? format(new Date(sitemap.submittedAt), 'MMM d, yyyy HH:mm')
                      : t('common.never')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => generateMutation.mutate(sitemap.website.id)}
                      disabled={generateMutation.isPending}
                      className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400"
                    >
                      {t('sitemaps.generate')}
                    </button>
                    <button
                      onClick={() =>
                        submitMutation.mutate({
                          id: sitemap.id,
                          engines: ['google', 'bing', 'baidu'],
                        })
                      }
                      disabled={submitMutation.isPending}
                      className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                    >
                      {t('sitemaps.submitAll')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <span className="text-6xl">🗺️</span>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                {t('sitemaps.noSitemaps')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('sitemaps.noSitemapsDesc')}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
