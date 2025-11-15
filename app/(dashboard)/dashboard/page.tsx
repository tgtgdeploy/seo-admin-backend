'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from '@/components/I18nProvider'
import Link from 'next/link'

interface Stats {
  totalWebsites: number
  totalPosts: number
  totalKeywords: number
  recentSpiderVisits: number
}

async function fetchStats(): Promise<Stats> {
  const response = await fetch('/api/stats')
  if (!response.ok) throw new Error('Failed to fetch stats')
  return response.json()
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const t = useTranslations()
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  })

  const statCards = [
    {
      name: t('dashboard.totalWebsites'),
      value: stats?.totalWebsites ?? 0,
      icon: '🌐',
      color: 'bg-blue-500',
    },
    {
      name: t('dashboard.totalPosts'),
      value: stats?.totalPosts ?? 0,
      icon: '📝',
      color: 'bg-green-500',
    },
    {
      name: t('dashboard.keywordsTracked'),
      value: stats?.totalKeywords ?? 0,
      icon: '🔑',
      color: 'bg-purple-500',
    },
    {
      name: t('dashboard.spiderVisits'),
      value: stats?.recentSpiderVisits ?? 0,
      icon: '🕷️',
      color: 'bg-orange-500',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('dashboard.welcome')} {session?.user?.name || ''}
        </h1>
        <p className="mt-2 text-gray-600">
          {t('dashboard.overview')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-lg bg-white shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      {stat.name}
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {isLoading ? '...' : stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t('dashboard.quickActions')}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            title={t('dashboard.addWebsite')}
            description={t('dashboard.addWebsiteDesc')}
            icon="➕"
            href="/websites/new"
          />
          <QuickActionCard
            title={t('dashboard.createPost')}
            description={t('dashboard.createPostDesc')}
            icon="✍️"
            href="/posts/create"
          />
          <QuickActionCard
            title={t('dashboard.checkRankings')}
            description={t('dashboard.checkRankingsDesc')}
            icon="📈"
            href="/keywords"
          />
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({
  title,
  description,
  icon,
  href,
}: {
  title: string
  description: string
  icon: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-gray-200 bg-white p-6 hover:border-indigo-500 hover:shadow-md transition-all"
    >
      <div className="flex items-center">
        <span className="text-3xl mr-4">{icon}</span>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </Link>
  )
}
