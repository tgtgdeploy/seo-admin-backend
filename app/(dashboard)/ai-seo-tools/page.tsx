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

  const [isGenerating, setIsGenerating] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const [generateResult, setGenerateResult] = useState<ToolResult | null>(null)
  const [optimizeResult, setOptimizeResult] = useState<ToolResult | null>(null)
  const [submitResult, setSubmitResult] = useState<ToolResult | null>(null)
  const [analysisResult, setAnalysisResult] = useState<ToolResult | null>(null)

  const [articleCount, setArticleCount] = useState(10)
  const [targetWebsite, setTargetWebsite] = useState('all')

  /**
   * 批量生成 AI 文章
   */
  const handleGenerateArticles = async () => {
    setIsGenerating(true)
    setGenerateResult(null)

    try {
      const response = await fetch('/api/ai-tools/generate-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: articleCount,
          websiteId: targetWebsite === 'all' ? null : targetWebsite,
        }),
      })

      const data = await response.json()
      setGenerateResult(data)
    } catch (error) {
      setGenerateResult({
        success: false,
        message: error instanceof Error ? error.message : '生成失败',
      })
    } finally {
      setIsGenerating(false)
    }
  }

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

  /**
   * 提交到搜索引擎
   */
  const handleSubmitToSearchEngines = async () => {
    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const response = await fetch('/api/ai-tools/submit-sitemaps', {
        method: 'POST',
      })

      const data = await response.json()
      setSubmitResult(data)
    } catch (error) {
      setSubmitResult({
        success: false,
        message: error instanceof Error ? error.message : '提交失败',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * SEO 分析报告
   */
  const handleGenerateAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      const response = await fetch('/api/ai-tools/seo-analysis', {
        method: 'POST',
      })

      const data = await response.json()
      setAnalysisResult(data)
    } catch (error) {
      setAnalysisResult({
        success: false,
        message: error instanceof Error ? error.message : '分析失败',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const ResultCard = ({ result, title }: { result: ToolResult | null; title: string }) => {
    if (!result) return null

    return (
      <div
        className={`mt-4 p-4 rounded-lg border-2 ${
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
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          🤖 {t('aiTools.title')}
        </h1>
        <p className="mt-2 text-gray-600">
          {t('aiTools.subtitle')}
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. AI 文章生成器 */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📝</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('aiTools.generateArticles.title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('aiTools.generateArticles.description')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('aiTools.generateArticles.count')}
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={articleCount}
                onChange={(e) => setArticleCount(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <button
              onClick={handleGenerateArticles}
              disabled={isGenerating}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('aiTools.generating')}
                </span>
              ) : (
                t('aiTools.generateArticles.button')
              )}
            </button>
          </div>

          <ResultCard result={generateResult} title={t('aiTools.generateArticles.result')} />
        </div>

        {/* 2. 内容优化器 */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">✨</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('aiTools.optimizeContent.title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('aiTools.optimizeContent.description')}
              </p>
            </div>
          </div>

          <button
            onClick={handleOptimizeContent}
            disabled={isOptimizing}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isOptimizing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('aiTools.optimizing')}
              </span>
            ) : (
              t('aiTools.optimizeContent.button')
            )}
          </button>

          <ResultCard result={optimizeResult} title={t('aiTools.optimizeContent.result')} />
        </div>

        {/* 3. 搜索引擎提交 */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🚀</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('aiTools.submitSitemaps.title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('aiTools.submitSitemaps.description')}
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmitToSearchEngines}
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('aiTools.submitting')}
              </span>
            ) : (
              t('aiTools.submitSitemaps.button')
            )}
          </button>

          <ResultCard result={submitResult} title={t('aiTools.submitSitemaps.result')} />
        </div>

        {/* 4. SEO 分析报告 */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📊</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('aiTools.seoAnalysis.title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('aiTools.seoAnalysis.description')}
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateAnalysis}
            disabled={isAnalyzing}
            className="w-full px-4 py-3 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('aiTools.analyzing')}
              </span>
            ) : (
              t('aiTools.seoAnalysis.button')
            )}
          </button>

          <ResultCard result={analysisResult} title={t('aiTools.seoAnalysis.result')} />
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          💡 {t('aiTools.tips.title')}
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• {t('aiTools.tips.tip1')}</li>
          <li>• {t('aiTools.tips.tip2')}</li>
          <li>• {t('aiTools.tips.tip3')}</li>
          <li>• {t('aiTools.tips.tip4')}</li>
        </ul>
      </div>
    </div>
  )
}
