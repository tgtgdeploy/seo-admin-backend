import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '下载管理 - SEO管理系统',
  description: '管理多平台应用下载链接、版本信息和发布配置。支持Android、iOS、Windows、Mac、Linux等多个平台。',
  keywords: ['下载管理', '版本管理', '应用分发', 'APK管理', 'App Store', 'Google Play'],
}

export default function DownloadsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
