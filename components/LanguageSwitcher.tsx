'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Cookies from 'js-cookie'

const languages = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  // 从 Cookie 读取当前语言，默认中文
  const [currentLang, setCurrentLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return Cookies.get('NEXT_LOCALE') || 'zh'
    }
    return 'zh'
  })

  const switchLanguage = (langCode: string) => {
    // 设置 Cookie
    Cookies.set('NEXT_LOCALE', langCode, { expires: 365 })
    setCurrentLang(langCode)

    // 刷新页面以应用新语言
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="relative inline-block text-left">
      <select
        value={currentLang}
        onChange={(e) => switchLanguage(e.target.value)}
        disabled={isPending}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 dark:text-white disabled:opacity-50"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  )
}
