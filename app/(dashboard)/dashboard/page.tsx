'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

interface Stats {
  totalWebsites: number
  totalPosts: number
  totalKeywords: number
  recentSpiderVisits: number
  spiderPool: {
    totalDomains: number
    totalPages: number
    totalVisits: number
    activeDomains: number
  }
}

async function fetchStats(): Promise<Stats> {
  const response = await fetch('/api/stats')
  if (!response.ok) throw new Error('Failed to fetch stats')
  return response.json()
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          欢迎回来, {session?.user?.name || '管理员'}
        </h1>
        <p className="mt-2 text-gray-600">
          蜘蛛池SEO管理系统 - 统览您的SEO策略
        </p>
      </div>

      {/* Spider Pool Highlight Section */}
      <div className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">🕸️ 蜘蛛池总览</h2>
            <p className="text-indigo-100 mt-1">12个域名，3台VPS，全方位SEO覆盖</p>
          </div>
          <Link
            href="/spider-pool"
            className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
          >
            进入管理 →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/20 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-white/40 rounded mb-2"></div>
                <div className="h-8 bg-white/40 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-sm text-indigo-100">域名总数</div>
              <div className="text-3xl font-bold mt-1">{stats?.spiderPool.totalDomains || 0}</div>
              <div className="text-xs text-indigo-200 mt-1">
                {stats?.spiderPool.activeDomains || 0} 个激活
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-sm text-indigo-100">蜘蛛池页面</div>
              <div className="text-3xl font-bold mt-1">{stats?.spiderPool.totalPages.toLocaleString() || 0}</div>
              <div className="text-xs text-indigo-200 mt-1">SEO优化页面</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-sm text-indigo-100">总访问量</div>
              <div className="text-3xl font-bold mt-1">{stats?.spiderPool.totalVisits.toLocaleString() || 0}</div>
              <div className="text-xs text-indigo-200 mt-1">所有域名累计</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-sm text-indigo-100">爬虫访问 (24h)</div>
              <div className="text-3xl font-bold mt-1">{stats?.recentSpiderVisits.toLocaleString() || 0}</div>
              <div className="text-xs text-indigo-200 mt-1">最近24小时</div>
            </div>
          </div>
        )}
      </div>

      {/* General Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard
          title="网站数量"
          value={stats?.totalWebsites ?? 0}
          icon="🌐"
          color="bg-blue-500"
          isLoading={isLoading}
        />
        <StatCard
          title="文章总数"
          value={stats?.totalPosts ?? 0}
          icon="📝"
          color="bg-green-500"
          isLoading={isLoading}
        />
        <StatCard
          title="关键词"
          value={stats?.totalKeywords ?? 0}
          icon="🔑"
          color="bg-purple-500"
          isLoading={isLoading}
        />
      </div>

      {/* VPS Distribution */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">VPS 分布</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <VPSCard
            vps="VPS-1"
            domains={3}
            domainList={['autopushnetwork.xyz', 'contentpoolzone.site', 'crawlboostnet.xyz']}
          />
          <VPSCard
            vps="VPS-2"
            domains={6}
            domainList={[
              'seohubnetwork.xyz',
              'spidertrackzone.xyz',
              'trafficboostflow.site',
              'globalinsighthub.xyz',
              'adminapihub.xyz',
              'infostreammedia.xyz',
            ]}
          />
          <VPSCard
            vps="VPS-3"
            domains={3}
            domainList={['rankspiderchain.xyz', 'linkpushmatrix.site', 'crawlenginepro.xyz']}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            title="域名管理"
            description="管理12个蜘蛛池域名"
            icon="🕸️"
            href="/spider-pool?tab=domains"
            highlight
          />
          <QuickActionCard
            title="SEO健康"
            description="查看SEO健康状态"
            icon="🎯"
            href="/seo-dashboard"
          />
          <QuickActionCard
            title="创建文章"
            description="发布新的SEO文章"
            icon="✍️"
            href="/posts/create"
          />
          <QuickActionCard
            title="AI优化"
            description="使用AI优化内容"
            icon="🤖"
            href="/ai-seo-tools"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
  isLoading,
}: {
  title: string
  value: number
  icon: string
  color: string
  isLoading: boolean
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {isLoading ? '...' : value.toLocaleString()}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

function VPSCard({
  vps,
  domains,
  domainList,
}: {
  vps: string
  domains: number
  domainList: string[]
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-gray-900">{vps}</h4>
        <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
          {domains} 个域名
        </span>
      </div>
      <ul className="space-y-1">
        {domainList.map((domain, i) => (
          <li key={i} className="text-xs text-gray-600 truncate">
            • {domain}
          </li>
        ))}
      </ul>
    </div>
  )
}

function QuickActionCard({
  title,
  description,
  icon,
  href,
  highlight = false,
}: {
  title: string
  description: string
  icon: string
  href: string
  highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className={`block rounded-lg border p-6 transition-all ${
        highlight
          ? 'border-indigo-500 bg-indigo-50 hover:border-indigo-600 hover:shadow-lg'
          : 'border-gray-200 bg-white hover:border-indigo-500 hover:shadow-md'
      }`}
    >
      <div className="flex items-center">
        <span className="text-3xl mr-4">{icon}</span>
        <div>
          <h3
            className={`text-lg font-medium ${
              highlight ? 'text-indigo-900' : 'text-gray-900'
            }`}
          >
            {title}
          </h3>
          <p
            className={`mt-1 text-sm ${
              highlight ? 'text-indigo-700' : 'text-gray-500'
            }`}
          >
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}
