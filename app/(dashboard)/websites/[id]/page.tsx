'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { useTranslations } from '@/components/I18nProvider'

interface WebsiteDetail {
  id: string
  name: string
  domain: string
  status: string
  description: string | null
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string[]
  gaId: string | null
  gscId: string | null
  baiduTongjiId: string | null
  createdAt: string
  updatedAt: string
  posts: Array<{
    id: string
    title: string
    status: string
    createdAt: string
  }>
  keywords: Array<{
    id: string
    keyword: string
    searchEngine: string
  }>
}

async function fetchWebsite(id: string): Promise<WebsiteDetail> {
  const response = await fetch(`/api/websites/${id}`)
  if (!response.ok) throw new Error('Failed to fetch website')
  return response.json()
}

export default function WebsiteDetailPage() {
  const params = useParams()
  const id = params.id as string
  const t = useTranslations()

  const { data: website, isLoading } = useQuery({
    queryKey: ['website', id],
    queryFn: () => fetchWebsite(id),
  })

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2 text-gray-600">{t('websiteDetail.loadingWebsite')}</p>
      </div>
    )
  }

  if (!website) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{t('websiteDetail.websiteNotFound')}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{website.name}</h1>
            <p className="mt-2 text-gray-600">{website.domain}</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/websites/${id}/domains`}
              className="rounded-md border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
            >
              {t('websiteDetail.domainsManagement')}
            </Link>
            <Link
              href={`/websites/${id}/edit`}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('websiteDetail.edit')}
            </Link>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                website.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {website.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* SEO Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {t('websiteDetail.seoConfig')}
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('websiteDetail.seoTitle')}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {website.seoTitle || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  {t('websiteDetail.seoDescription')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {website.seoDescription || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('websiteDetail.keywords')}</dt>
                <dd className="mt-1">
                  {website.seoKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {website.seoKeywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Recent Posts */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {t('websiteDetail.recentPosts')} ({website.posts.length})
              </h2>
              <Link
                href={`/posts?website=${id}`}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                {t('websiteDetail.viewAll')}
              </Link>
            </div>
            {website.posts.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {website.posts.slice(0, 5).map((post) => (
                  <li key={post.id} className="py-3">
                    <Link
                      href={`/posts/${post.id}`}
                      className="flex justify-between items-center hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(post.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          post.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {post.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                {t('websiteDetail.noPosts')}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Analytics */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('websiteDetail.analytics')}</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  {t('websiteDetail.gaId')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {website.gaId || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  {t('websiteDetail.gscId')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {website.gscId || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  {t('websiteDetail.baiduTongjiId')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {website.baiduTongjiId || '-'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Keywords */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {t('websiteDetail.trackedKeywords')} ({website.keywords.length})
              </h2>
              <Link
                href={`/keywords?website=${id}`}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                {t('websiteDetail.viewAll')}
              </Link>
            </div>
            {website.keywords.length > 0 ? (
              <ul className="space-y-2">
                {website.keywords.slice(0, 5).map((keyword) => (
                  <li key={keyword.id} className="text-sm">
                    <span className="text-gray-900">{keyword.keyword}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({keyword.searchEngine})
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                {t('websiteDetail.noKeywords')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
