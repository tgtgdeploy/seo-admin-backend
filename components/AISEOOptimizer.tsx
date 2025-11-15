'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'

interface AISEOOptimizerProps {
  title: string
  content: string
  onApply: (optimization: SEOOptimization) => void
}

interface SEOOptimization {
  seoTitle: string
  metaDescription: string
  keywords: string[]
  suggestions: string[]
}

async function optimizeSEO(title: string, content: string, keywords: string[]): Promise<SEOOptimization> {
  const response = await fetch('/api/ai/optimize-seo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, keywords }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to optimize SEO')
  }

  const result = await response.json()
  return result.data
}

export default function AISEOOptimizer({ title, content, onApply }: AISEOOptimizerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [optimization, setOptimization] = useState<SEOOptimization | null>(null)

  const optimizeMutation = useMutation({
    mutationFn: () => optimizeSEO(title, content, []),
    onSuccess: (data) => {
      setOptimization(data)
    },
  })

  const handleOptimize = () => {
    if (!title || !content) {
      alert('Please enter both title and content first')
      return
    }
    setIsOpen(true)
    optimizeMutation.mutate()
  }

  const handleApply = () => {
    if (optimization) {
      onApply(optimization)
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOptimize}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        AI SEO Optimization
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal panel */}
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
                      AI SEO Optimization Results
                    </h3>
                    <div className="mt-4">
                      {optimizeMutation.isPending && (
                        <div className="text-center py-12">
                          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                          <p className="mt-2 text-sm text-gray-600">Analyzing your content with AI...</p>
                        </div>
                      )}

                      {optimizeMutation.error && (
                        <div className="rounded-md bg-red-50 p-4">
                          <p className="text-sm text-red-800">
                            {(optimizeMutation.error as Error).message}
                          </p>
                        </div>
                      )}

                      {optimization && (
                        <div className="space-y-6">
                          {/* Optimized SEO Title */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Optimized SEO Title
                            </label>
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                              <p className="text-sm text-gray-900">{optimization.seoTitle}</p>
                            </div>
                          </div>

                          {/* Optimized Meta Description */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Optimized Meta Description
                            </label>
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                              <p className="text-sm text-gray-900">{optimization.metaDescription}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Length: {optimization.metaDescription.length} characters
                              </p>
                            </div>
                          </div>

                          {/* Recommended Keywords */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Recommended Keywords
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {optimization.keywords.map((keyword, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Suggestions */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Content Optimization Suggestions
                            </label>
                            <ul className="space-y-2">
                              {optimization.suggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-sm text-gray-700">{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={!optimization}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400"
                >
                  Apply Optimizations
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
