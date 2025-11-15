'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'

interface Post {
  id: string
  title: string
  metaTitle?: string | null
  metaDescription?: string | null
}

interface BatchOptimizerProps {
  posts: Post[]
  onComplete: () => void
}

interface OptimizationResult {
  postId: string
  success: boolean
  data?: {
    seoTitle: string
    metaDescription: string
    keywords: string[]
  }
  error?: string
}

async function batchOptimize(postIds: string[]): Promise<{
  summary: { total: number; successful: number; failed: number }
  results: OptimizationResult[]
}> {
  const response = await fetch('/api/ai/batch-optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postIds }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to batch optimize')
  }

  return response.json()
}

export default function BatchOptimizer({ posts, onComplete }: BatchOptimizerProps) {
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<OptimizationResult[] | null>(null)

  const optimizeMutation = useMutation({
    mutationFn: batchOptimize,
    onSuccess: (data) => {
      setResults(data.results)
    },
  })

  const handleTogglePost = (postId: string) => {
    setSelectedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    )
  }

  const handleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([])
    } else {
      setSelectedPosts(posts.map(p => p.id))
    }
  }

  const handleOptimize = () => {
    if (selectedPosts.length === 0) {
      alert('Please select at least one post')
      return
    }
    if (selectedPosts.length > 20) {
      alert('Maximum 20 posts can be optimized at once')
      return
    }
    setIsOpen(true)
    setResults(null)
    optimizeMutation.mutate(selectedPosts)
  }

  const handleClose = () => {
    setIsOpen(false)
    setResults(null)
    setSelectedPosts([])
    onComplete()
  }

  // Filter posts that don't have SEO optimization
  const unoptimizedPosts = posts.filter(
    p => !p.metaTitle || !p.metaDescription
  )

  return (
    <>
      {/* Trigger Button */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleOptimize}
            disabled={selectedPosts.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Batch AI Optimize ({selectedPosts.length} selected)
          </button>

          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {selectedPosts.length === posts.length ? 'Deselect All' : 'Select All'}
          </button>

          {unoptimizedPosts.length > 0 && (
            <span className="text-sm text-gray-500">
              {unoptimizedPosts.length} posts need optimization
            </span>
          )}
        </div>
      </div>

      {/* Posts Selection List */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">
            Select Posts to Optimize
          </h3>
        </div>
        <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {posts.map((post) => {
            const isSelected = selectedPosts.includes(post.id)
            const needsOptimization = !post.metaTitle || !post.metaDescription

            return (
              <li key={post.id} className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleTogglePost(post.id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {post.title}
                    </p>
                    <div className="flex items-center mt-1">
                      {needsOptimization ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Needs Optimization
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Optimized
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Results Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={handleClose}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Batch AI Optimization Results
                    </h3>

                    <div className="mt-4">
                      {optimizeMutation.isPending && (
                        <div className="text-center py-12">
                          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                          <p className="mt-2 text-sm text-gray-600">
                            Optimizing {selectedPosts.length} posts with AI...
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            This may take a few minutes
                          </p>
                        </div>
                      )}

                      {optimizeMutation.error && (
                        <div className="rounded-md bg-red-50 p-4">
                          <p className="text-sm text-red-800">
                            {(optimizeMutation.error as Error).message}
                          </p>
                        </div>
                      )}

                      {results && (
                        <div className="space-y-4">
                          {/* Summary */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Optimization Complete
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {results.filter(r => r.success).length} successful,
                                  {results.filter(r => !r.success).length} failed
                                </p>
                              </div>
                              <div className="flex items-center">
                                <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Results List */}
                          <div className="max-h-96 overflow-y-auto space-y-3">
                            {results.map((result) => {
                              const post = posts.find(p => p.id === result.postId)
                              return (
                                <div
                                  key={result.postId}
                                  className={`border rounded-lg p-4 ${
                                    result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                  }`}
                                >
                                  <div className="flex items-start">
                                    {result.success ? (
                                      <svg className="h-5 w-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <svg className="h-5 w-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                    <div className="ml-3 flex-1">
                                      <p className="text-sm font-medium text-gray-900">
                                        {post?.title}
                                      </p>
                                      {result.success && result.data && (
                                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                                          <p><strong>SEO Title:</strong> {result.data.seoTitle}</p>
                                          <p><strong>Description:</strong> {result.data.metaDescription}</p>
                                          <p><strong>Keywords:</strong> {result.data.keywords.join(', ')}</p>
                                        </div>
                                      )}
                                      {result.error && (
                                        <p className="mt-1 text-xs text-red-600">{result.error}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
