import { I18nProvider } from '@/components/I18nProvider'
import { getLocale, getTranslations } from '@/lib/i18n-utils'

export const dynamic = 'force-dynamic'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = getLocale()
  const messages = await getTranslations(locale)

  return (
    <I18nProvider messages={messages}>
      {children}
    </I18nProvider>
  )
}
