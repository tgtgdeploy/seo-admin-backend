'use client'

import { useState } from 'react'
import { useTranslations } from '@/components/I18nProvider'

interface ToolResult {
  success: boolean
  message: string
  data?: any
  details?: string[]
}

export default function AISEOToolsPage() {
  const t = useTranslations()

  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizeResult, setOptimizeResult] = useState<ToolResult | null>(null)

  /**
   * 优化现有内容
   */
  const handleOptimizeContent = async () => {
    setIsOptimizing(true)
    setOptimizeResult(null)

    try {
      const response = await fetch('/api/ai-tools/optimize-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limit: 20,
        }),
      })

      const data = await response.json()
      setOptimizeResult(data)
    } catch (error) {
      setOptimizeResult({
        success: false,
        message: error instanceof Error ? error.message : '优化失败',
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const ResultCard = ({ result, title }: { result: ToolResult | null; title: string }) => {
    if (!result) return null

    return (
      <div
        className={`mt-6 p-4 rounded-lg border-2 ${
          result.success
            ? 'bg-green-50 border-green-300'
            : 'bg-red-50 border-red-300'
        }`}
      >
        <h4 className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
          {result.success ? '✅ ' : '❌ '}
          {title}
        </h4>
        <p className={`mt-2 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
          {result.message}
        </p>

        {result.data && (
          <div className="mt-3 p-3 bg-white rounded border border-gray-200">
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}

        {result.details && result.details.length > 0 && (
          <ul className="mt-3 space-y-1">
            {result.details.map((detail, i) => (
              <li key={i} className="text-sm text-gray-700">
                • {detail}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          🤖 AI 内容优化工具
        </h1>
        <p className="mt-2 text-gray-600">
          使用AI技术优化文章的SEO元数据，提升搜索引擎排名
        </p>
      </div>

      {/* 内容优化器 */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-5xl">✨</span>
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">
              内容优化器
            </h3>
            <p className="text-gray-600 mt-1">
              自动优化文章的标题、描述和关键词，提升SEO评分
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">优化范围：</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• 自动优化最近 20 篇文章</li>
            <li>• 优先选择 SEO 评分低于 80 分的文章</li>
            <li>• 生成优化的标题、描述和关键词</li>
            <li>• 自动保存优化结果到数据库</li>
          </ul>
        </div>

        <button
          onClick={handleOptimizeContent}
          disabled={isOptimizing}
          className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-medium text-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isOptimizing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              正在优化内容...
            </span>
          ) : (
            <>开始优化文章</>
          )}
        </button>

        <ResultCard result={optimizeResult} title="优化结果" />
      </div>

      {/* Usage Tips */}
      <div className="mt-8 bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-amber-900 mb-3">
          💡 使用建议
        </h3>
        <ul className="space-y-2 text-sm text-amber-800">
          <li>• 定期运行优化，建议每周优化一次</li>
          <li>• 优化后检查文章列表，查看SEO评分提升情况</li>
          <li>• AI生成的内容可能需要人工审核和调整</li>
          <li>• 优化过程需要几分钟，请耐心等待</li>
        </ul>
      </div>
    </div>
  )
}
