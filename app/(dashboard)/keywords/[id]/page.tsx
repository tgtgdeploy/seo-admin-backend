'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from '@/components/I18nProvider'
import Link from 'next/link'

interface KeywordDetailsPageProps {
  params: { id: string }
}

export default function KeywordDetailsPage({ params }: KeywordDetailsPageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations()
  const [showAddRanking, setShowAddRanking] = useState(false)
  const [rankingForm, setRankingForm] = useState({
    position: '',
    url: '',
    searchEngine: 'google',
    domainAliasId: '',
  })

  // 获取关键词详情
  const { data: keyword, isLoading } = useQuery({
    queryKey: ['keyword', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/keywords/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch keyword')
      return res.json()
    },
  })

  // 获取域名列表（用于添加排名时选择）
  const { data: domainAliases } = useQuery({
    queryKey: ['domainAliases', keyword?.websiteId],
    queryFn: async () => {
      if (!keyword?.websiteId) return []
      const res = await fetch(`/api/websites/${keyword.websiteId}/domains`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: !!keyword?.websiteId,
  })

  // 添加排名记录
  const addRankingMutation = useMutation({
    mutationFn: async (data: typeof rankingForm) => {
      const res = await fetch(`/api/keywords/${params.id}/rankings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to add ranking')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyword', params.id] })
      setShowAddRanking(false)
      setRankingForm({ position: '', url: '', searchEngine: 'google', domainAliasId: '' })
    },
  })

  // 删除关键词
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/keywords/${params.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete keyword')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] })
      router.push('/keywords')
    },
  })

  const handleAddRanking = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rankingForm.position || !rankingForm.url) {
      alert(t('keywordsDetails.validation'))
      return
    }
    addRankingMutation.mutate(rankingForm)
  }

  const handleDelete = () => {
    if (confirm(t('keywordsDetails.confirmDelete'))) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) {
    return <div className="p-8">{t('keywordsDetails.loading')}</div>
  }

  if (!keyword) {
    return <div className="p-8">{t('keywordsDetails.notFound')}</div>
  }

  // 按域名和搜索引擎分组排名数据
  const groupedRankings: Record<string, any[]> = {}
  keyword.rankings?.forEach((ranking: any) => {
    const key = `${ranking.domainAlias?.siteName || '主域名'} - ${ranking.searchEngine}`
    if (!groupedRankings[key]) {
      groupedRankings[key] = []
    }
    groupedRankings[key].push(ranking)
  })

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* 头部 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link href="/keywords" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← {t('keywordsDetails.back')}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{keyword.keyword}</h1>
            <p className="text-gray-600 mt-1">{keyword.website.name}</p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
          >
            {deleteMutation.isPending ? t('keywordsDetails.deleting') : t('keywordsDetails.delete')}
          </button>
        </div>

        {/* 关键词指标 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">{t('keywordsDetails.volume')}</div>
            <div className="text-2xl font-bold text-gray-900">
              {keyword.volume?.toLocaleString() || '-'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">{t('keywordsDetails.difficulty')}</div>
            <div className="text-2xl font-bold text-gray-900">
              {keyword.difficulty || '-'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">{t('keywordsDetails.cpc')}</div>
            <div className="text-2xl font-bold text-gray-900">
              ${keyword.cpc?.toFixed(2) || '-'}
            </div>
          </div>
        </div>
      </div>

      {/* 添加排名记录按钮 */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddRanking(!showAddRanking)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showAddRanking ? t('keywordsDetails.cancelAdd') : t('keywordsDetails.addRanking')}
        </button>
      </div>

      {/* 添加排名表单 */}
      {showAddRanking && (
        <form onSubmit={handleAddRanking} className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">{t('keywordsDetails.addRankingTitle')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('keywordsDetails.domain')}
              </label>
              <select
                value={rankingForm.domainAliasId}
                onChange={(e) => setRankingForm({ ...rankingForm, domainAliasId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">{t('keywordsDetails.mainDomain')}</option>
                {domainAliases?.map((domain: any) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.siteName} ({domain.domain})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('keywordsDetails.searchEngine')} *
              </label>
              <select
                value={rankingForm.searchEngine}
                onChange={(e) => setRankingForm({ ...rankingForm, searchEngine: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="google">Google</option>
                <option value="baidu">Baidu</option>
                <option value="bing">Bing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('keywordsDetails.position')} *
              </label>
              <input
                type="number"
                value={rankingForm.position}
                onChange={(e) => setRankingForm({ ...rankingForm, position: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('keywordsDetails.url')} *
              </label>
              <input
                type="url"
                value={rankingForm.url}
                onChange={(e) => setRankingForm({ ...rankingForm, url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={addRankingMutation.isPending}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {addRankingMutation.isPending ? t('keywordsDetails.adding') : t('keywordsDetails.add')}
          </button>
        </form>
      )}

      {/* 排名历史 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{t('keywordsDetails.rankingHistory')}</h2>
        </div>
        <div className="p-6 space-y-6">
          {Object.keys(groupedRankings).length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('keywordsDetails.noRankings')}</p>
          ) : (
            Object.entries(groupedRankings).map(([key, rankings]) => (
              <div key={key} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">{key}</h3>
                <div className="space-y-2">
                  {rankings.map((ranking: any) => (
                    <div key={ranking.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">#{ranking.position}</span>
                        <a
                          href={ranking.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 text-sm text-gray-600 hover:text-blue-600"
                        >
                          {ranking.url}
                        </a>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(ranking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
