import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '蜘蛛池管理 - SEO管理系统',
  description: 'SEO蜘蛛池生成与管理工具。自动生成搜索引擎优化页面，提升网站索引效率和搜索引擎爬虫访问频率。',
  keywords: ['蜘蛛池', 'SEO优化', '搜索引擎优化', '页面生成', '爬虫优化', '索引提升'],
}

export default function SpiderPoolLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
