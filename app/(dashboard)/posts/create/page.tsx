'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from '@/components/I18nProvider'

interface Website {
  id: string
  name: string
  domain: string
}

async function fetchWebsites(): Promise<Website[]> {
  const response = await fetch('/api/websites')
  if (!response.ok) throw new Error('Failed to fetch websites')
  return response.json()
}

export default function CreatePostPage() {
  const t = useTranslations()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { data: websites } = useQuery({
    queryKey: ['websites'],
    queryFn: fetchWebsites,
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      content: formData.get('content'),
      metaTitle: formData.get('metaTitle'),
      metaDescription: formData.get('metaDescription'),
      metaKeywords: formData.get('metaKeywords')
        ? (formData.get('metaKeywords') as string).split(',').map((k) => k.trim())
        : [],
      websiteId: formData.get('websiteId'),
      status: formData.get('status'),
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || t('postsCreate.createFailed'))
      }

      const post = await response.json()
      router.push(`/posts/${post.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('postsCreate.title')}</h1>
        <p className="mt-2 text-gray-600">{t('postsCreate.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label htmlFor="websiteId" className="block text-sm font-medium text-gray-700">
              {t('postsCreate.websiteRequired')}
            </label>
            <select
              name="websiteId"
              id="websiteId"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            >
              <option value="">{t('postsCreate.selectWebsite')}</option>
              {websites?.map((website) => (
                <option key={website.id} value={website.id}>
                  {website.name} ({website.domain})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              {t('postsCreate.titleRequired')}
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              placeholder={t('postsCreate.titlePlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              {t('postsCreate.slugRequired')}
            </label>
            <input
              type="text"
              name="slug"
              id="slug"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              placeholder={t('postsCreate.slugPlaceholder')}
            />
            <p className="mt-1 text-sm text-gray-500">{t('postsCreate.slugHelper')}</p>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              {t('postsCreate.contentRequired')}
            </label>
            <textarea
              name="content"
              id="content"
              required
              rows={12}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border font-mono"
              placeholder={t('postsCreate.contentPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              {t('postsCreate.statusRequired')}
            </label>
            <select
              name="status"
              id="status"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            >
              <option value="DRAFT">{t('postsCreate.statusDraft')}</option>
              <option value="PUBLISHED">{t('postsCreate.statusPublished')}</option>
              <option value="SCHEDULED">{t('postsCreate.statusScheduled')}</option>
            </select>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('postsCreate.seoMetaTags')}</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
                {t('postsCreate.metaTitleLabel')}
              </label>
              <input
                type="text"
                name="metaTitle"
                id="metaTitle"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder={t('postsCreate.metaTitlePlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
                {t('postsCreate.metaDescriptionLabel')}
              </label>
              <textarea
                name="metaDescription"
                id="metaDescription"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder={t('postsCreate.metaDescriptionPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700">
                {t('postsCreate.metaKeywordsLabel')}
              </label>
              <input
                type="text"
                name="metaKeywords"
                id="metaKeywords"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder={t('postsCreate.metaKeywordsPlaceholder')}
              />
              <p className="mt-1 text-sm text-gray-500">{t('postsCreate.keywordsSeparator')}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 border-t pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('postsCreate.cancel')}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-gray-400"
          >
            {isLoading ? t('postsCreate.creating') : t('postsCreate.createPost')}
          </button>
        </div>
      </form>
    </div>
  )
}
