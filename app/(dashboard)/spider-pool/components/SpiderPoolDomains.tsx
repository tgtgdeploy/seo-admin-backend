'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

interface Domain {
  id: string
  domain: string
  siteName: string
  siteDescription: string | null
  primaryTags: string[]
  secondaryTags: string[]
  status: string
  visits: number
  lastVisit: string | null
  pageCount: number
  spiderLogCount: number
}

interface DomainsResponse {
  success: boolean
  domains: {
    'VPS-1': Domain[]
    'VPS-2': Domain[]
    'VPS-3': Domain[]
    Unknown: Domain[]
  }
  stats: {
    total: number
    active: number
    inactive: number
    totalVisits: number
    'VPS-1': number
    'VPS-2': number
    'VPS-3': number
  }
}

async function fetchDomains(): Promise<DomainsResponse> {
  const response = await fetch('/api/spider-pool/domains')
  if (!response.ok) throw new Error('Failed to fetch domains')
  return response.json()
}

async function batchUpdateDomains(domainIds: string[], updates: any): Promise<any> {
  const response = await fetch('/api/spider-pool/domains', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domainIds, updates }),
  })
  if (!response.ok) throw new Error('Failed to update domains')
  return response.json()
}

export function SpiderPoolDomains() {
  const queryClient = useQueryClient()
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [activeVPS, setActiveVPS] = useState<string | null>(null)
  const [showBatchEdit, setShowBatchEdit] = useState(false)
  const [batchStatus, setBatchStatus] = useState<string>('')
  const [batchTags, setBatchTags] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['spider-pool-domains'],
    queryFn: fetchDomains,
  })

  const updateMutation = useMutation({
    mutationFn: ({ domainIds, updates }: { domainIds: string[]; updates: any }) =>
      batchUpdateDomains(domainIds, updates),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['spider-pool-domains'] })
      alert(`成功更新 ${result.count} 个域名！`)
      setSelectedDomains([])
      setShowBatchEdit(false)
      setBatchStatus('')
      setBatchTags('')
    },
    onError: (error: Error) => {
      alert(`更新失败: ${error.message}`)
    },
  })

  const toggleDomainSelection = (domainId: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domainId) ? prev.filter((id) => id !== domainId) : [...prev, domainId]
    )
  }

  const toggleVPSSelection = (vps: string, domains: Domain[]) => {
    const vpsDomainIds = domains.map((d) => d.id)
    const allSelected = vpsDomainIds.every((id) => selectedDomains.includes(id))

    if (allSelected) {
      setSelectedDomains((prev) => prev.filter((id) => !vpsDomainIds.includes(id)))
    } else {
      setSelectedDomains((prev) => [...new Set([...prev, ...vpsDomainIds])])
    }
  }

  const handleBatchUpdate = () => {
    if (selectedDomains.length === 0) {
      alert('请先选择要更新的域名')
      return
    }

    const updates: any = {}

    if (batchStatus) {
      updates.status = batchStatus
    }

    if (batchTags) {
      const tags = batchTags.split(',').map((t) => t.trim()).filter(Boolean)
      updates.primaryTags = tags
    }

    if (Object.keys(updates).length === 0) {
      alert('请至少选择一个要更新的字段')
      return
    }

    updateMutation.mutate({ domainIds: selectedDomains, updates })
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2 text-gray-600">加载中...</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">总域名数</div>
          <div className="text-2xl font-bold text-gray-900">{data.stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">
            VPS-1: {data.stats['VPS-1']} · VPS-2: {data.stats['VPS-2']} · VPS-3: {data.stats['VPS-3']}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">激活域名</div>
          <div className="text-2xl font-bold text-green-600">{data.stats.active}</div>
          <div className="text-xs text-gray-500 mt-1">
            {((data.stats.active / data.stats.total) * 100).toFixed(0)}% 激活率
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">停用域名</div>
          <div className="text-2xl font-bold text-gray-600">{data.stats.inactive}</div>
          <div className="text-xs text-gray-500 mt-1">
            {((data.stats.inactive / data.stats.total) * 100).toFixed(0)}% 停用率
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">总访问量</div>
          <div className="text-2xl font-bold text-purple-600">
            {data.stats.totalVisits.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">所有域名累计</div>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedDomains.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-indigo-900">
                已选择 {selectedDomains.length} 个域名
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBatchEdit(!showBatchEdit)}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                {showBatchEdit ? '取消编辑' : '批量编辑'}
              </button>
              <button
                onClick={() => setSelectedDomains([])}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                取消选择
              </button>
            </div>
          </div>

          {showBatchEdit && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  批量修改状态
                </label>
                <select
                  value={batchStatus}
                  onChange={(e) => setBatchStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- 不修改 --</option>
                  <option value="ACTIVE">激活</option>
                  <option value="INACTIVE">停用</option>
                  <option value="PENDING">待定</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  批量修改主要标签（逗号分隔）
                </label>
                <input
                  type="text"
                  value={batchTags}
                  onChange={(e) => setBatchTags(e.target.value)}
                  placeholder="例如: 下载,APK,安卓"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  onClick={handleBatchUpdate}
                  disabled={updateMutation.isPending}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {updateMutation.isPending ? '更新中...' : '应用批量更新'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VPS Groups */}
      <div className="space-y-6">
        {(['VPS-1', 'VPS-2', 'VPS-3'] as const).map((vps) => {
          const vpsDomains = data.domains[vps]
          if (vpsDomains.length === 0) return null

          const allSelected = vpsDomains.every((d) => selectedDomains.includes(d.id))

          return (
            <div key={vps} className="bg-white rounded-lg shadow">
              {/* VPS Header */}
              <div
                className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                onClick={() => setActiveVPS(activeVPS === vps ? null : vps)}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => {
                      e.stopPropagation()
                      toggleVPSSelection(vps, vpsDomains)
                    }}
                    className="h-4 w-4 text-indigo-600 rounded"
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {vps} ({vpsDomains.length} 个域名)
                  </h3>
                  <span className="text-sm text-gray-500">
                    访问量: {vpsDomains.reduce((sum, d) => sum + d.visits, 0).toLocaleString()}
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    activeVPS === vps ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Domain List */}
              {activeVPS === vps && (
                <div className="divide-y divide-gray-200">
                  {vpsDomains.map((domain) => (
                    <div
                      key={domain.id}
                      className={`p-4 ${
                        selectedDomains.includes(domain.id) ? 'bg-indigo-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedDomains.includes(domain.id)}
                          onChange={() => toggleDomainSelection(domain.id)}
                          className="mt-1 h-4 w-4 text-indigo-600 rounded"
                        />

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-base font-semibold text-gray-900">
                                {domain.domain}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">{domain.siteName}</p>
                              {domain.siteDescription && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {domain.siteDescription}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeColor(
                                domain.status
                              )}`}
                            >
                              {domain.status}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {domain.primaryTags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {domain.secondaryTags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="mt-3 grid grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">访问量:</span>
                              <span className="ml-1 font-medium text-gray-900">
                                {domain.visits.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">页面数:</span>
                              <span className="ml-1 font-medium text-gray-900">{domain.pageCount}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">爬虫日志:</span>
                              <span className="ml-1 font-medium text-gray-900">
                                {domain.spiderLogCount}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">最后访问:</span>
                              <span className="ml-1 font-medium text-gray-900">
                                {domain.lastVisit
                                  ? new Date(domain.lastVisit).toLocaleDateString('zh-CN')
                                  : '无'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Unknown Domains */}
      {data.domains.Unknown.length > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">
            ⚠️ 未分配VPS的域名 ({data.domains.Unknown.length})
          </h3>
          <div className="space-y-2">
            {data.domains.Unknown.map((domain) => (
              <div key={domain.id} className="text-sm text-yellow-800">
                • {domain.domain}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
