'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from './I18nProvider'
import LanguageSwitcher from './LanguageSwitcher'

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const t = useTranslations()

  const navigation = [
    { key: 'dashboard', href: '/dashboard', icon: '📊' },
    { key: 'seoDashboard', href: '/seo-dashboard', icon: '🎯' },
    { key: 'spiderPool', href: '/spider-pool', icon: '🕸️' },
    { key: 'spider', href: '/spider', icon: '🕷️' },
    { key: 'websites', href: '/websites', icon: '🌐' },
    { key: 'posts', href: '/posts', icon: '📝' },
    { key: 'downloads', href: '/downloads', icon: '📥' },
    { key: 'sitemaps', href: '/sitemaps', icon: '🗺️' },
    { key: 'aiTools', href: '/ai-seo-tools', icon: '🤖' },
  ]

  const adminOnlyNavigation = [
    { key: 'settings', href: '/settings', icon: '⚙️' },
  ]

  return (
    <div className="hidden lg:flex h-screen w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">{t('common.appName')}</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              {t(`nav.${item.key}`)}
            </Link>
          )
        })}

        {/* Admin Only Navigation */}
        {session?.user?.role === 'ADMIN' && (
          <>
            <div className="my-2 border-t border-gray-700" />
            {adminOnlyNavigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  {t(`nav.${item.key}`)}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Language Switcher */}
      <div className="border-t border-gray-800 px-4 py-3">
        <div className="text-xs text-gray-400 mb-2">{t('common.language')}</div>
        <LanguageSwitcher />
      </div>

      {/* User info */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white">
              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-white">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-gray-400">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-3 w-full rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          {t('auth.signOut')}
        </button>
      </div>
    </div>
  )
}
