'use client'

import { Fragment, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from './I18nProvider'
import LanguageSwitcher from './LanguageSwitcher'

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const t = useTranslations()

  const navigation = [
    { key: 'dashboard', href: '/dashboard', icon: '📊' },
    { key: 'websites', href: '/websites', icon: '🌐' },
    { key: 'posts', href: '/posts', icon: '📝' },
    { key: 'keywords', href: '/keywords', icon: '🔑' },
    { key: 'sitemaps', href: '/sitemaps', icon: '🗺️' },
    { key: 'spider', href: '/spider', icon: '🕷️' },
  ]

  const adminOnlyNavigation = [
    { key: 'settings', href: '/settings', icon: '⚙️' },
  ]

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-lg font-bold text-white">{t('common.appName')}</h1>
          <button
            onClick={toggleMenu}
            className="text-white p-2 rounded-md hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`
          lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-gray-900
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-800">
            <h1 className="text-xl font-bold text-white">{t('common.appName')}</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={closeMenu}
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
                      onClick={closeMenu}
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
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm">
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                closeMenu()
                signOut({ callbackUrl: '/login' })
              }}
              className="mt-3 w-full rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              {t('auth.signOut')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
