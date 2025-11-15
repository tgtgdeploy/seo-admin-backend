import { Sidebar } from '@/components/Sidebar'
import { MobileSidebar } from '@/components/MobileSidebar'
import { I18nProvider } from '@/components/I18nProvider'
import { getLocale, getTranslations } from '@/lib/i18n-utils'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = getLocale()
  const messages = await getTranslations(locale)

  return (
    <I18nProvider messages={messages}>
      <div className="flex h-screen overflow-hidden bg-gray-100">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Sidebar */}
        <MobileSidebar />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden lg:pt-0 pt-16">
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </I18nProvider>
  )
}
