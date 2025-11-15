'use client'

import { Suspense, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { format } from 'date-fns'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from '@/components/I18nProvider'

interface Post {
  id: string
  title: string
  slug: string
  status: string
  createdAt: string
  tags: string[]
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string[]
  coverImage: string | null
  website: {
    id: string
    name: string
  }
  syncedWebsites: string[]
  seoScore: number
}

interface PostStats {
  summary: {
    totalPosts: number
    byStatus: {
      DRAFT: number
      PUBLISHED: number
      SCHEDULED: number
      ARCHIVED: number
    }
    averageSeoScore: number
    totalSynced: number
  }
  byWebsite: {
    websiteId: string
    websiteName: string
    count: number
    published: number
    draft: number
    averageSeoScore: number
  }[]
  seoQuality: {
    withMetaTitle: number
    withMetaDescription: number
    withKeywords: number
    withAllMeta: number
    missingMeta: number
  }
  recentActivity: {
    last7Days: number
    last30Days: number
  }
}

async function fetchPosts(websiteId?: string, status?: string): Promise<Post[]> {
  const params = new URLSearchParams()
  if (websiteId) params.append('websiteId', websiteId)
  if (status) params.append('status', status)

  const url = `/api/posts${params.toString() ? `?${params.toString()}` : ''}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch posts')
  return response.json()
}

async function fetchPostStats(): Promise<PostStats> {
  const response = await fetch('/api/posts/stats')
  if (!response.ok) throw new Error('Failed to fetch post stats')
  return response.json()
}

function getSeoScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-100'
  if (score >= 60) return 'text-blue-600 bg-blue-100'
  if (score >= 40) return 'text-yellow-600 bg-yellow-100'
  return 'text-red-600 bg-red-100'
}

function getSeoScoreLabel(score: number, t: (key: string) => string): string {
  if (score >= 80) return t('posts.seoExcellent')
  if (score >= 60) return t('posts.seoGood')
  if (score >= 40) return t('posts.seoFair')
  return t('posts.seoPoor')
}

function PostsContent() {
  const searchParams = useSearchParams()
  const websiteId = searchParams.get('website')
  const t = useTranslations()

  const [statusFilter, setStatusFilter] = useState<string>('')
  const [seoFilter, setSeoFilter] = useState<string>('')

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['posts-stats'],
    queryFn: fetchPostStats,
  })

  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ['posts', websiteId, statusFilter],
    queryFn: () => fetchPosts(websiteId || undefined, statusFilter || undefined),
  })

  // Apply client-side SEO filter
  const filteredPosts = posts?.filter((post) => {
    if (!seoFilter) return true
    if (seoFilter === 'excellent') return post.seoScore >= 80
    if (seoFilter === 'good') return post.seoScore >= 60 && post.seoScore < 80
    if (seoFilter === 'fair') return post.seoScore >= 40 && post.seoScore < 60
    if (seoFilter === 'poor') return post.seoScore < 40
    if (seoFilter === 'missing') return !post.metaTitle || !post.metaDescription || post.metaKeywords.length < 3
    return true
  })

  const isLoading = isStatsLoading || isPostsLoading

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('posts.title')}</h1>
          <p className="mt-2 text-gray-600">
            {t('posts.subtitle')}
          </p>
        </div>
        <Link
          href="/posts/create"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          {t('posts.create')}
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {/* Total Posts */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-indigo-500 p-3">
                      <span className="text-2xl">📝</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {t('posts.totalPosts')}
                        </dt>
                        <dd className="text-3xl font-semibold text-gray-900">
                          {stats.summary.totalPosts}
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">{t('posts.published')}: </span>
                      <span className="font-semibold text-green-600">{stats.summary.byStatus.PUBLISHED}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('posts.draft')}: </span>
                      <span className="font-semibold text-gray-600">{stats.summary.byStatus.DRAFT}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Average SEO Score */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {t('posts.averageSeoScore')}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-3xl font-semibold text-gray-900">
                            {stats.summary.averageSeoScore}
                          </div>
                          <div className="ml-2 text-sm text-gray-500">/100</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeoScoreColor(stats.summary.averageSeoScore)}`}>
                      {getSeoScoreLabel(stats.summary.averageSeoScore, t)}
                    </span>
                  </div>
                </div>
              </div>

              {/* SEO Quality */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-purple-500 p-3">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {t('posts.seoComplete')}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-3xl font-semibold text-gray-900">
                            {stats.seoQuality.withAllMeta}
                          </div>
                          <div className="ml-2 text-sm text-gray-500">
                            / {stats.summary.totalPosts}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {Math.round((stats.seoQuality.withAllMeta / stats.summary.totalPosts) * 100)}% {t('posts.complete')}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-orange-500 p-3">
                      <span className="text-2xl">📈</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {t('posts.recentActivity')}
                        </dt>
                        <dd className="text-3xl font-semibold text-gray-900">
                          {stats.recentActivity.last7Days}
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {t('posts.last7Days')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('posts.filterByStatus')}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">{t('posts.allStatus')}</option>
                  <option value="PUBLISHED">{t('posts.published')}</option>
                  <option value="DRAFT">{t('posts.draft')}</option>
                  <option value="SCHEDULED">{t('posts.scheduled')}</option>
                  <option value="ARCHIVED">{t('posts.archived')}</option>
                </select>
              </div>

              {/* SEO Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('posts.filterBySeo')}
                </label>
                <select
                  value={seoFilter}
                  onChange={(e) => setSeoFilter(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">{t('posts.allSeo')}</option>
                  <option value="excellent">{t('posts.seoExcellent')} (≥80)</option>
                  <option value="good">{t('posts.seoGood')} (60-79)</option>
                  <option value="fair">{t('posts.seoFair')} (40-59)</option>
                  <option value="poor">{t('posts.seoPoor')} (&lt;40)</option>
                  <option value="missing">{t('posts.seoMissing')}</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  {t('posts.showingResults', { count: filteredPosts?.length || 0 })}
                </div>
              </div>
            </div>
          </div>

          {/* Posts Table */}
          {filteredPosts && filteredPosts.length > 0 ? (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('posts.table.title')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('posts.table.website')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('posts.table.seoScore')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('posts.table.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('posts.table.synced')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('posts.table.created')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('posts.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <Link
                            href={`/posts/${post.id}`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                          >
                            {post.title}
                          </Link>
                          {post.tags && post.tags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-xs text-gray-500">+{post.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {post.website.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getSeoScoreColor(post.seoScore)}`}>
                            {post.seoScore}
                          </span>
                          <div className="flex gap-1">
                            {!post.metaTitle && (
                              <span className="text-xs text-red-500" title={t('posts.missingMetaTitle')}>
                                T
                              </span>
                            )}
                            {!post.metaDescription && (
                              <span className="text-xs text-red-500" title={t('posts.missingMetaDesc')}>
                                D
                              </span>
                            )}
                            {post.metaKeywords.length < 3 && (
                              <span className="text-xs text-red-500" title={t('posts.missingKeywords')}>
                                K
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            post.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-800'
                              : post.status === 'DRAFT'
                              ? 'bg-gray-100 text-gray-800'
                              : post.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {t(`posts.status.${post.status.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {t('posts.syncedCount', { count: post.syncedWebsites.length })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(post.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link
                          href={`/posts/${post.id}/sync`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {t('posts.sync')}
                        </Link>
                        <Link
                          href={`/posts/${post.id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {t('common.edit')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <span className="text-6xl">📝</span>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('posts.noPosts')}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('posts.noPostsDesc')}
              </p>
              <div className="mt-6">
                <Link
                  href="/posts/create"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  {t('posts.createFirst')}
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function LoadingFallback() {
  const t = useTranslations()
  return (
    <div className="text-center py-12">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      <p className="mt-2 text-gray-600">{t('common.loading')}</p>
    </div>
  )
}

export default function PostsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PostsContent />
    </Suspense>
  )
}
