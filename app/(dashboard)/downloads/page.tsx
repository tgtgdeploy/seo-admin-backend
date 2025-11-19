'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useTranslations } from '@/components/I18nProvider'

interface Website {
  id: string
  name: string
  domain: string
}

interface DownloadConfig {
  id: string
  platform: string
  downloadUrl: string | null
  storeUrl: string | null
  version: string
  releaseDate: string
  fileSize: string | null
  minOsVersion: string | null
  status: string
  isDefault: boolean
  priority: number
  website: Website
  createdAt: string
}

async function fetchDownloads(): Promise<DownloadConfig[]> {
  const response = await fetch('/api/downloads')
  if (!response.ok) throw new Error('Failed to fetch downloads')
  return response.json()
}

async function fetchWebsites(): Promise<Website[]> {
  const response = await fetch('/api/websites')
  if (!response.ok) throw new Error('Failed to fetch websites')
  return response.json()
}

async function deleteDownload(id: string) {
  const response = await fetch(`/api/downloads/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete download config')
  return response.json()
}

export default function DownloadsPage() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)

  const { data: downloads, isLoading } = useQuery({
    queryKey: ['downloads'],
    queryFn: fetchDownloads
  })

  const { data: websites } = useQuery({
    queryKey: ['websites'],
    queryFn: fetchWebsites
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDownload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] })
    }
  })

  const handleDelete = async (id: string, platform: string) => {
    if (confirm(`确定要删除 ${platform} 的下载配置吗？`)) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (error) {
        alert('删除失败')
      }
    }
  }

  const platformNames: Record<string, string> = {
    android: 'Android',
    ios: 'iOS',
    windows: 'Windows',
    mac: 'macOS',
    linux: 'Linux',
    web: 'Web'
  }

  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    MAINTENANCE: 'bg-yellow-100 text-yellow-800',
    DEPRECATED: 'bg-red-100 text-red-800'
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">
              下载配置管理
            </h1>
            <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600">
              管理各平台的下载链接和版本信息
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex-shrink-0 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 text-center"
          >
            添加下载配置
          </button>
        </div>
      </div>

      {showCreateForm && (
        <CreateDownloadForm
          websites={websites || []}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
            queryClient.invalidateQueries({ queryKey: ['downloads'] })
          }}
        />
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-sm md:text-base text-gray-600">加载中...</p>
        </div>
      ) : downloads && downloads.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  网站
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  平台
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  版本
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  下载链接
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  发布日期
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {downloads.map((config) => (
                <tr key={config.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {config.website.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {config.website.domain}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">
                        {platformNames[config.platform] || config.platform}
                      </span>
                      {config.isDefault && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                          默认
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{config.version}</div>
                    {config.fileSize && (
                      <div className="text-xs text-gray-500">{config.fileSize}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {config.downloadUrl && (
                      <div className="text-xs text-gray-600 truncate max-w-xs" title={config.downloadUrl}>
                        {config.downloadUrl}
                      </div>
                    )}
                    {config.storeUrl && (
                      <div className="text-xs text-blue-600 truncate max-w-xs" title={config.storeUrl}>
                        {config.storeUrl}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${statusColors[config.status as keyof typeof statusColors]}`}>
                      {config.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(config.releaseDate), 'yyyy-MM-dd')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(config.id, platformNames[config.platform])}
                      className="text-red-600 hover:text-red-900"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <span className="text-6xl">📥</span>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            暂无下载配置
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            开始添加第一个下载配置
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              添加配置
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CreateDownloadForm({
  websites,
  onClose,
  onSuccess
}: {
  websites: Website[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    websiteId: '',
    platform: 'android',
    downloadUrl: '',
    storeUrl: '',
    version: '',
    releaseDate: new Date().toISOString().split('T')[0],
    fileSize: '',
    minOsVersion: '',
    status: 'ACTIVE',
    isDefault: true,
    priority: 0
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create download config')
      }

      onSuccess()
    } catch (error: any) {
      alert(error.message || '创建失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">添加下载配置</h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              网站 *
            </label>
            <select
              required
              value={formData.websiteId}
              onChange={(e) => setFormData({ ...formData, websiteId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">选择网站</option>
              {websites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.domain})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              平台 *
            </label>
            <select
              required
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="android">Android</option>
              <option value="ios">iOS</option>
              <option value="windows">Windows</option>
              <option value="mac">macOS</option>
              <option value="linux">Linux</option>
              <option value="web">Web</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              直接下载链接
            </label>
            <input
              type="url"
              value={formData.downloadUrl}
              onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
              placeholder="https://example.com/download/app.apk"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              应用商店链接
            </label>
            <input
              type="url"
              value={formData.storeUrl}
              onChange={(e) => setFormData({ ...formData, storeUrl: e.target.value })}
              placeholder="https://play.google.com/store/apps/details?id=..."
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                版本号 *
              </label>
              <input
                type="text"
                required
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="10.5.2"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                发布日期 *
              </label>
              <input
                type="date"
                required
                value={formData.releaseDate}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                文件大小
              </label>
              <input
                type="text"
                value={formData.fileSize}
                onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                placeholder="45.2 MB"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最低系统版本
              </label>
              <input
                type="text"
                value={formData.minOsVersion}
                onChange={(e) => setFormData({ ...formData, minOsVersion: e.target.value })}
                placeholder="Android 6.0+"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">设为默认配置</span>
            </label>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                优先级
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? '创建中...' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
