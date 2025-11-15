'use client'

import { createContext, useContext } from 'react'
import { createTranslator } from '@/lib/i18n-shared'

type Messages = any
type TranslatorFunc = (key: string, params?: Record<string, string | number>) => string

const I18nContext = createContext<TranslatorFunc>(() => '')

export function I18nProvider({
  children,
  messages
}: {
  children: React.ReactNode
  messages: Messages
}) {
  const t = createTranslator(messages)

  return (
    <I18nContext.Provider value={t}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslations() {
  return useContext(I18nContext)
}
