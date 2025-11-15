'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from '@/components/I18nProvider'

export default function CreateKeywordPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations()

  const [formData, setFormData] = useState({
    keyword: '',
    volume: '',
    difficulty: '',
    cpc: '',
    websiteId: '',
  })

  // 获取所有网站列表
  const { data: websites } = useQuery({
    queryKey: ['websites'],
    queryFn: async () => {
      const res = await fetch('/api/websites')
      if (!res.ok) throw new Error('Failed to fetch websites')
      return res.json()
    },
  })

  // 创建关键词
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create keyword')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] })
      router.push('/keywords')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.keyword || !formData.websiteId) {
      alert(t('keywordsCreate.validation'))
      return
    }
    createMutation.mutate(formData)
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('keywordsCreate.title')}
        </h1>
        <p className="text-gray-600 mt-2">{t('keywordsCreate.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* 网站选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('keywordsCreate.websiteLabel')} *
          </label>
          <select
            value={formData.websiteId}
            onChange={(e) => setFormData({ ...formData, websiteId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">{t('keywordsCreate.selectWebsite')}</option>
            {websites?.map((website: any) => (
              <option key={website.id} value={website.id}>
                {website.name}
              </option>
            ))}
          </select>
        </div>

        {/* 关键词 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('keywordsCreate.keywordLabel')} *
          </label>
          <input
            type="text"
            value={formData.keyword}
            onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
            placeholder={t('keywordsCreate.keywordPlaceholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* 搜索量 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('keywordsCreate.volumeLabel')}
          </label>
          <input
            type="number"
            value={formData.volume}
            onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
            placeholder={t('keywordsCreate.volumePlaceholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
          />
        </div>

        {/* 难度评分 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('keywordsCreate.difficultyLabel')}
          </label>
          <input
            type="number"
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            placeholder={t('keywordsCreate.difficultyPlaceholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            max="100"
          />
        </div>

        {/* CPC */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('keywordsCreate.cpcLabel')}
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.cpc}
            onChange={(e) => setFormData({ ...formData, cpc: e.target.value })}
            placeholder={t('keywordsCreate.cpcPlaceholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
          />
        </div>

        {/* 错误提示 */}
        {createMutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {createMutation.error?.message || t('keywordsCreate.error')}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {createMutation.isPending
              ? t('keywordsCreate.creating')
              : t('keywordsCreate.create')}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
          >
            {t('keywordsCreate.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
