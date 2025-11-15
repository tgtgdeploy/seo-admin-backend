'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { format } from 'date-fns'
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
  createdAt: string
  updatedAt: string
  website: {
    id: string
    name: string
    domain: string
  }
  author: {
    id: string
    email: string
  }
}

async function fetchPost(id: string): Promise<Post> {
  const response = await fetch(`/api/posts/${id}`)
  if (!response.ok) throw new Error('Failed to fetch post')
  return response.json()
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const t = useTranslations()

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', params.id],
    queryFn: () => fetchPost(params.id),
  })

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2 text-gray-600">{t('common.loading')}</p>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl">❌</span>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">文章未找到</h3>
        <p className="mt-1 text-sm text-gray-500">
          该文章可能已被删除或不存在
        </p>
        <div className="mt-6">
          <Link
            href="/posts"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            返回文章列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/posts"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← 返回文章列表
          </Link>
          <div className="flex space-x-2">
            <Link
              href={`/posts/${post.id}/sync`}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
            >
              同步文章
            </Link>
            <Link
              href={`/posts/${post.id}/edit`}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              编辑文章
            </Link>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>

        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            {post.website.name}
          </span>
          <span>
            创建于 {format(new Date(post.createdAt), 'yyyy-MM-dd HH:mm')}
          </span>
          <span>
            更新于 {format(new Date(post.updatedAt), 'yyyy-MM-dd HH:mm')}
          </span>
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
              post.status === 'PUBLISHED'
                ? 'bg-green-100 text-green-800'
                : post.status === 'DRAFT'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {post.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">基本信息</h2>
          <dl className="grid grid-cols-1 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">标题</dt>
              <dd className="mt-1 text-sm text-gray-900">{post.title}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Slug</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{post.slug}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">网站</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {post.website.name} ({post.website.domain})
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">作者</dt>
              <dd className="mt-1 text-sm text-gray-900">{post.author.email}</dd>
            </div>
          </dl>
        </div>

        {/* SEO Meta Tags */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">SEO 元标签</h2>
          <dl className="grid grid-cols-1 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Meta Title</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {post.metaTitle || <span className="text-gray-400 italic">未设置</span>}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Meta Description</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {post.metaDescription || <span className="text-gray-400 italic">未设置</span>}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Meta Keywords</dt>
              <dd className="mt-1">
                {post.metaKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {post.metaKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">未设置</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Content */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">文章内容</h2>
          <div
            className="prose max-w-none text-sm text-gray-900 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded border border-gray-200"
            style={{ maxHeight: '500px', overflowY: 'auto' }}
          >
            {post.content}
          </div>
        </div>
      </div>
    </div>
  )
}
