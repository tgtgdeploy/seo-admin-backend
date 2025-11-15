'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useTranslations } from '@/components/I18nProvider'

interface DomainAlias {
  id: string
  domain: string
  siteName: string
  siteDescription: string
  primaryTags: string[]
  secondaryTags: string[]
  status: string
  isPrimary: boolean
  visits: number
  lastVisit: string | null
  createdAt: string
}

interface DomainStats {
  totalVisits: number
  uniqueBots: number
  topBots: Array<{ bot: string; count: number }>
}

async function fetchDomains(websiteId: string): Promise<DomainAlias[]> {
  const response = await fetch(`/api/websites/${websiteId}/domains`)
  if (!response.ok) throw new Error('Failed to fetch domains')
  return response.json()
}

async function createDomain(websiteId: string, data: Partial<DomainAlias>) {
  const response = await fetch(`/api/websites/${websiteId}/domains`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create domain')
  }
  return response.json()
}

async function updateDomain(websiteId: string, domainId: string, data: Partial<DomainAlias>) {
  const response = await fetch(`/api/websites/${websiteId}/domains/${domainId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update domain')
  return response.json()
}

async function deleteDomain(websiteId: string, domainId: string) {
  const response = await fetch(`/api/websites/${websiteId}/domains/${domainId}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete domain')
  return response.json()
}

export default function DomainsPage() {
  const params = useParams()
  const queryClient = useQueryClient()
  const websiteId = params.id as string
  const t = useTranslations()

  const [showForm, setShowForm] = useState(false)
  const [editingDomain, setEditingDomain] = useState<DomainAlias | null>(null)
  const [formData, setFormData] = useState({
    domain: '',
    siteName: '',
    siteDescription: '',
    primaryTags: '',
    secondaryTags: '',
    status: 'ACTIVE',
    isPrimary: false,
  })

  const [selectedDomainForStats, setSelectedDomainForStats] = useState<string | null>(null)

  const { data: domains, isLoading } = useQuery({
    queryKey: ['domains', websiteId],
    queryFn: () => fetchDomains(websiteId),
  })

  const { data: domainStats } = useQuery({
    queryKey: ['domain-stats', selectedDomainForStats],
    queryFn: async () => {
      if (!selectedDomainForStats) return null
      const response = await fetch(`/api/domains/${selectedDomainForStats}/stats?range=7d`)
      if (!response.ok) return null
      return response.json()
    },
    enabled: !!selectedDomainForStats,
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<DomainAlias>) => createDomain(websiteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains', websiteId] })
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ domainId, data }: { domainId: string; data: Partial<DomainAlias> }) =>
      updateDomain(websiteId, domainId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains', websiteId] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (domainId: string) => deleteDomain(websiteId, domainId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains', websiteId] })
    },
  })

  const resetForm = () => {
    setShowForm(false)
    setEditingDomain(null)
    setFormData({
      domain: '',
      siteName: '',
      siteDescription: '',
      primaryTags: '',
      secondaryTags: '',
      status: 'ACTIVE',
      isPrimary: false,
    })
  }

  const handleEdit = (domain: DomainAlias) => {
    setEditingDomain(domain)
    setFormData({
      domain: domain.domain,
      siteName: domain.siteName,
      siteDescription: domain.siteDescription,
      primaryTags: domain.primaryTags.join(', '),
      secondaryTags: domain.secondaryTags.join(', '),
      status: domain.status,
      isPrimary: domain.isPrimary,
    })
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      domain: formData.domain,
      siteName: formData.siteName,
      siteDescription: formData.siteDescription,
      primaryTags: formData.primaryTags.split(',').map((t) => t.trim()).filter(Boolean),
      secondaryTags: formData.secondaryTags.split(',').map((t) => t.trim()).filter(Boolean),
      status: formData.status,
      isPrimary: formData.isPrimary,
    }

    if (editingDomain) {
      updateMutation.mutate({ domainId: editingDomain.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDelete = (domainId: string) => {
    if (confirm(t('domainsPage.deleteConfirm'))) {
      deleteMutation.mutate(domainId)
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('domainsPage.title')}</h1>
            <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600">{t('domainsPage.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex-shrink-0 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            {showForm ? t('common.cancel') : t('domainsPage.addDomain')}
          </button>
        </div>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="mb-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingDomain ? t('domainsPage.editDomain') : t('domainsPage.addNewDomain')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('domainsPage.domainLabel')} *</label>
                <input
                  type="text"
                  required
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder={t('domainsPage.domainPlaceholder')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{t('domainsPage.siteNameLabel')} *</label>
                <input
                  type="text"
                  required
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  placeholder={t('domainsPage.siteNamePlaceholder')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('domainsPage.siteDescLabel')} *</label>
              <input
                type="text"
                required
                value={formData.siteDescription}
                onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                placeholder={t('domainsPage.siteDescPlaceholder')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('domainsPage.primaryTagsLabel')}
              </label>
              <input
                type="text"
                value={formData.primaryTags}
                onChange={(e) => setFormData({ ...formData, primaryTags: e.target.value })}
                placeholder={t('domainsPage.primaryTagsPlaceholder')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('domainsPage.secondaryTagsLabel')}
              </label>
              <input
                type="text"
                value={formData.secondaryTags}
                onChange={(e) => setFormData({ ...formData, secondaryTags: e.target.value })}
                placeholder={t('domainsPage.secondaryTagsPlaceholder')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('common.status')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="ACTIVE">{t('domainsPage.statusActive')}</option>
                  <option value="INACTIVE">{t('domainsPage.statusInactive')}</option>
                  <option value="PENDING">{t('domainsPage.statusPending')}</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">{t('domainsPage.setPrimary')}</label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? t('domainsPage.saving') : t('common.save')}
              </button>
            </div>

            {(createMutation.isError || updateMutation.isError) && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  {(createMutation.error as Error)?.message || (updateMutation.error as Error)?.message}
                </p>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Domain list */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-sm md:text-base text-gray-600">{t('common.loading')}</p>
        </div>
      ) : domains && domains.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* 移动端卡片视图 */}
          <div className="block md:hidden divide-y divide-gray-200">
            {domains.map((domain) => (
              <div key={domain.id} className={`p-4 ${domain.isPrimary ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{domain.domain}</h3>
                      {domain.isPrimary && (
                        <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {t('domainsPage.primaryDomain')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 mb-1">{domain.siteName}</p>
                    <p className="text-xs text-gray-500">{domain.siteDescription}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {domain.primaryTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                      >
                        {tag}
                      </span>
                    ))}
                    {domain.primaryTags.length > 3 && (
                      <span className="text-xs text-gray-500">+{domain.primaryTags.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        domain.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : domain.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {domain.status === 'ACTIVE' ? t('domainsPage.statusActive') : domain.status === 'PENDING' ? t('domainsPage.statusPendingShort') : t('domainsPage.statusInactive')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {domain.visits.toLocaleString()} {t('domainsPage.visits')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDomainForStats(domain.id)}
                      className="text-xs text-blue-600 hover:text-blue-900"
                    >
                      {t('domainsPage.stats')}
                    </button>
                    <button
                      onClick={() => handleEdit(domain)}
                      className="text-xs text-indigo-600 hover:text-indigo-900"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(domain.id)}
                      className="text-xs text-red-600 hover:text-red-900"
                      disabled={domain.isPrimary}
                    >
                      {domain.isPrimary ? t('domainsPage.cannotDelete') : t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <table className="hidden md:table min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('domainsPage.domain')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('domainsPage.siteName')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('domainsPage.primaryTags')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('domainsPage.visitsCount')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {domains.map((domain) => (
                <tr key={domain.id} className={domain.isPrimary ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{domain.domain}</div>
                      {domain.isPrimary && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {t('domainsPage.primaryDomain')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{domain.siteName}</div>
                    <div className="text-sm text-gray-500">{domain.siteDescription}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {domain.primaryTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {domain.primaryTags.length > 3 && (
                        <span className="text-xs text-gray-500">+{domain.primaryTags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        domain.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : domain.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {domain.status === 'ACTIVE' ? t('domainsPage.statusActive') : domain.status === 'PENDING' ? t('domainsPage.statusPendingShort') : t('domainsPage.statusInactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {domain.visits.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedDomainForStats(domain.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      {t('domainsPage.stats')}
                    </button>
                    <button
                      onClick={() => handleEdit(domain)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(domain.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={domain.isPrimary}
                    >
                      {domain.isPrimary ? t('domainsPage.cannotDelete') : t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <span className="text-6xl">🌐</span>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('domainsPage.noDomains')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('domainsPage.noDomainsDesc')}</p>
        </div>
      )}
    </div>
  )
}
