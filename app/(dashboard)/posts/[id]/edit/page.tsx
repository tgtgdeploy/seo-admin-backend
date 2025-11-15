'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from '@/components/I18nProvider'

interface Post {
  id: string
  title: string
  slug: string
  content: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords: string[]
  status: string
  websiteId: string
  website: {
    id: string
    name: string
  }
}

interface Website {
  id: string
  name: string
  domain: string
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

export default function EditPostPage({ params }: { params: { id: string } }) {
  const t = useTranslations()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { data: post, isLoading: isPostLoading } = useQuery({
    queryKey: ['post', params.id],
    queryFn: () => fetchPost(params.id),
  })

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
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '更新失败')
      }

      router.push(`/posts/${params.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isPostLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2 text-gray-600">{t('common.loading')}</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl">❌</span>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">文章未找到</h3>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">编辑文章</h1>
        <p className="mt-2 text-gray-600">更新文章的标题、内容和 SEO 设置</p>
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
              网站 *
            </label>
            <select
              name="websiteId"
              id="websiteId"
              required
              defaultValue={post.websiteId}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            >
              <option value="">选择网站</option>
              {websites?.map((website) => (
                <option key={website.id} value={website.id}>
                  {website.name} ({website.domain})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              标题 *
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              defaultValue={post.title}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              placeholder="文章标题"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              Slug *
            </label>
            <input
              type="text"
              name="slug"
              id="slug"
              required
              defaultValue={post.slug}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              placeholder="article-slug"
            />
            <p className="mt-1 text-sm text-gray-500">URL 友好的文章标识符</p>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              内容 *
            </label>
            <textarea
              name="content"
              id="content"
              required
              rows={12}
              defaultValue={post.content}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border font-mono"
              placeholder="文章内容（支持 Markdown）"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              状态 *
            </label>
            <select
              name="status"
              id="status"
              required
              defaultValue={post.status}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            >
              <option value="DRAFT">草稿</option>
              <option value="PUBLISHED">已发布</option>
              <option value="SCHEDULED">定时发布</option>
            </select>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">SEO 元标签</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
                Meta Title
              </label>
              <input
                type="text"
                name="metaTitle"
                id="metaTitle"
                defaultValue={post.metaTitle || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="SEO 标题"
              />
            </div>

            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                id="metaDescription"
                rows={2}
                defaultValue={post.metaDescription || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="SEO 描述"
              />
            </div>

            <div>
              <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700">
                Meta Keywords
              </label>
              <input
                type="text"
                name="metaKeywords"
                id="metaKeywords"
                defaultValue={post.metaKeywords.join(', ')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="关键词1, 关键词2, 关键词3"
              />
              <p className="mt-1 text-sm text-gray-500">用逗号分隔多个关键词</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 border-t pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-gray-400"
          >
            {isLoading ? '保存中...' : '保存更改'}
          </button>
        </div>
      </form>
    </div>
  )
}
