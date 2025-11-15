'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/components/I18nProvider'

export default function NewWebsitePage() {
  const router = useRouter()
  const t = useTranslations()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      domain: formData.get('domain'),
      description: formData.get('description'),
      seoTitle: formData.get('seoTitle'),
      seoDescription: formData.get('seoDescription'),
      seoKeywords: formData.get('seoKeywords')
        ? (formData.get('seoKeywords') as string).split(',').map((k) => k.trim())
        : [],
    }

    try {
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create website')
      }

      const website = await response.json()
      router.push(`/websites/${website.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('websiteNew.title')}</h1>
        <p className="mt-2 text-gray-600">
          {t('websiteNew.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {t('websiteNew.basicInfo')}
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('websiteNew.nameRequired')}
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder={t('websiteNew.namePlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                {t('websiteNew.domainRequired')}
              </label>
              <input
                type="text"
                name="domain"
                id="domain"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder={t('websiteNew.domainPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                {t('websiteNew.descriptionLabel')}
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder={t('websiteNew.descriptionPlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {t('websiteNew.seoSettings')}
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700">
                {t('websiteNew.seoTitleLabel')}
              </label>
              <input
                type="text"
                name="seoTitle"
                id="seoTitle"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder={t('websiteNew.seoTitlePlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">
                {t('websiteNew.seoDescriptionLabel')}
              </label>
              <textarea
                name="seoDescription"
                id="seoDescription"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder={t('websiteNew.seoDescriptionPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700">
                {t('websiteNew.seoKeywordsLabel')}
              </label>
              <input
                type="text"
                name="seoKeywords"
                id="seoKeywords"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder={t('websiteNew.seoKeywordsPlaceholder')}
              />
              <p className="mt-1 text-sm text-gray-500">
                {t('websiteNew.keywordsSeparator')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('websiteNew.cancel')}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-gray-400"
          >
            {isLoading ? t('websiteNew.creating') : t('websiteNew.createWebsite')}
          </button>
        </div>
      </form>
    </div>
  )
}
