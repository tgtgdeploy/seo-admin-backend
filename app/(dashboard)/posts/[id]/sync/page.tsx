'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'

interface Website {
  id: string
  name: string
  domain: string
}

interface Post {
  id: string
  title: string
  syncedWebsites: string[]
}

async function fetchPost(id: string): Promise<Post> {
  const response = await fetch(`/api/posts/${id}`)
  if (!response.ok) throw new Error('Failed to fetch post')
  return response.json()
}

async function fetchWebsites(): Promise<Website[]> {
  const response = await fetch('/api/websites')
  if (!response.ok) throw new Error('Failed to fetch websites')
  return response.json()
}

async function syncPost(postId: string, websiteIds: string[]) {
  const response = await fetch(`/api/posts/${postId}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ websiteIds }),
  })
  if (!response.ok) throw new Error('Failed to sync post')
  return response.json()
}

export default function SyncPostPage() {
  const t = useTranslations()
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const postId = params.id as string

  const [selectedWebsites, setSelectedWebsites] = useState<string[]>([])

  const { data: post } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
  })

  const { data: websites } = useQuery({
    queryKey: ['websites'],
    queryFn: fetchWebsites,
  })

  const syncMutation = useMutation({
    mutationFn: () => syncPost(postId, selectedWebsites),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      router.push(`/posts/${postId}`)
    },
  })

  const handleToggleWebsite = (websiteId: string) => {
    setSelectedWebsites((prev) =>
      prev.includes(websiteId)
        ? prev.filter((id) => id !== websiteId)
        : [...prev, websiteId]
    )
  }

  const handleSync = () => {
    if (selectedWebsites.length === 0) {
      alert(t('postsSync.pleaseSelectOne'))
      return
    }
    syncMutation.mutate()
  }

  if (!post || !websites) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('postsSync.title')}</h1>
        <p className="mt-2 text-gray-600">
          {t('postsSync.subtitle')}: &quot;{post.title}&quot;
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {t('postsSync.selectWebsites')}
        </h2>

        {syncMutation.error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">
              {(syncMutation.error as Error).message}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {websites.map((website) => {
            const isSynced = post.syncedWebsites.includes(website.id)
            const isSelected = selectedWebsites.includes(website.id)

            return (
              <div
                key={website.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={website.id}
                    checked={isSelected}
                    onChange={() => handleToggleWebsite(website.id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor={website.id} className="ml-3 cursor-pointer">
                    <p className="text-sm font-medium text-gray-900">
                      {website.name}
                    </p>
                    <p className="text-sm text-gray-500">{website.domain}</p>
                  </label>
                </div>

                {isSynced && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {t('postsSync.alreadySynced')}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('postsSync.cancel')}
          </button>
          <button
            onClick={handleSync}
            disabled={syncMutation.isPending || selectedWebsites.length === 0}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-gray-400"
          >
            {syncMutation.isPending ? t('postsSync.syncing') : t('postsSync.syncToSelected')}
          </button>
        </div>
      </div>
    </div>
  )
}
