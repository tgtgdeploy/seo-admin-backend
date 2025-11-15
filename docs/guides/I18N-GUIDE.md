# 🌐 Admin 后台国际化（i18n）使用指南

本指南介绍如何在 Admin 后台使用中英文切换功能。

## 📋 目录

- [架构概述](#架构概述)
- [翻译文件](#翻译文件)
- [使用方法](#使用方法)
- [语言切换器](#语言切换器)
- [示例代码](#示例代码)

---

## 架构概述

### 核心文件

```
apps/admin/
├── i18n.ts                    # i18n 配置
├── lib/
│   └── i18n-utils.ts         # i18n 工具函数
├── messages/
│   ├── en.json               # 英文翻译
│   └── zh.json               # 中文翻译
└── components/
    └── LanguageSwitcher.tsx  # 语言切换器组件
```

### 工作原理

1. **语言存储**: 使用 Cookie (`NEXT_LOCALE`) 存储用户语言偏好
2. **服务端渲染**: 服务端组件从 Cookie 读取语言并加载对应翻译
3. **客户端切换**: 客户端组件可以切换语言并刷新页面

---

## 翻译文件

### 文件结构

翻译文件使用 JSON 格式，按模块组织：

```json
{
  "common": {
    "appName": "SEO 管理系统",
    "save": "保存",
    "cancel": "取消"
  },
  "nav": {
    "dashboard": "仪表板",
    "posts": "文章管理"
  },
  "posts": {
    "title": "文章管理",
    "create": "创建文章"
  }
}
```

### 添加新翻译

1. 在 `messages/zh.json` 添加中文翻译
2. 在 `messages/en.json` 添加对应的英文翻译
3. 保持两个文件的 key 结构一致

---

## 使用方法

### 1. 服务端组件（Server Component）

```tsx
import { getLocale, getTranslations, createTranslator } from '@/lib/i18n-utils'

export default async function MyPage() {
  // 获取当前语言
  const locale = getLocale()

  // 加载翻译
  const messages = await getTranslations(locale)

  // 创建翻译函数
  const t = createTranslator(messages)

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.overview')}</p>
    </div>
  )
}
```

### 2. 客户端组件（Client Component）

客户端组件需要通过 props 接收翻译：

```tsx
// 父组件（Server Component）
import ClientComponent from './ClientComponent'
import { getLocale, getTranslations, createTranslator } from '@/lib/i18n-utils'

export default async function ParentPage() {
  const locale = getLocale()
  const messages = await getTranslations(locale)
  const t = createTranslator(messages)

  return <ClientComponent translations={messages} />
}

// 子组件（Client Component）
'use client'

import { createTranslator } from '@/lib/i18n-utils'

export default function ClientComponent({ translations }: { translations: any }) {
  const t = createTranslator(translations)

  return (
    <button onClick={() => alert(t('common.success'))}>
      {t('common.save')}
    </button>
  )
}
```

### 3. 带参数的翻译

```tsx
// 翻译文件
{
  "validation": {
    "minLength": "长度至少为 {min} 个字符"
  }
}

// 使用
t('validation.minLength', { min: 8 })
// 输出: "长度至少为 8 个字符"
```

---

## 语言切换器

### 添加到布局

在布局文件中添加语言切换器：

```tsx
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Layout({ children }: { children: React.Node }) {
  return (
    <div>
      <header>
        <nav>
          {/* 其他导航项 */}
          <LanguageSwitcher />
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
```

---

## 示例代码

### 示例 1: 登录页面

```tsx
// app/(auth)/login/page.tsx
import { getLocale, getTranslations, createTranslator } from '@/lib/i18n-utils'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const locale = getLocale()
  const messages = await getTranslations(locale)
  const t = createTranslator(messages)

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <h2>{t('auth.signInTitle')}</h2>
        <p>{t('auth.signInSubtitle')}</p>
        <LoginForm translations={messages} />
      </div>
    </div>
  )
}
```

### 示例 2: Dashboard 页面

```tsx
// app/(dashboard)/dashboard/page.tsx
import { getLocale, getTranslations, createTranslator } from '@/lib/i18n-utils'

export default async function DashboardPage() {
  const locale = getLocale()
  const messages = await getTranslations(locale)
  const t = createTranslator(messages)

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.totalWebsites')}
          value="10"
        />
        <StatCard
          title={t('dashboard.totalPosts')}
          value="150"
        />
      </div>
    </div>
  )
}
```

### 示例 3: 导航菜单

```tsx
// components/Sidebar.tsx
import { getLocale, getTranslations, createTranslator } from '@/lib/i18n-utils'
import Link from 'next/link'

export default async function Sidebar() {
  const locale = getLocale()
  const messages = await getTranslations(locale)
  const t = createTranslator(messages)

  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: '📊' },
    { name: t('nav.posts'), href: '/posts', icon: '📝' },
    { name: t('nav.websites'), href: '/websites', icon: '🌐' },
    { name: t('nav.keywords'), href: '/keywords', icon: '🔑' },
    { name: t('nav.sitemaps'), href: '/sitemaps', icon: '🗺️' },
    { name: t('nav.spider'), href: '/spider', icon: '🕷️' },
    { name: t('nav.settings'), href: '/settings', icon: '⚙️' },
  ]

  return (
    <nav>
      {navigation.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.icon} {item.name}
        </Link>
      ))}
    </nav>
  )
}
```

---

## 快速迁移步骤

### 1. 找到硬编码的文本

搜索你的代码中的中文或英文字符串：

```tsx
// ❌ 之前（硬编码）
<h1>仪表板</h1>
<button>保存</button>

// ✅ 之后（使用翻译）
<h1>{t('dashboard.title')}</h1>
<button>{t('common.save')}</button>
```

### 2. 添加翻译 key

在 `messages/zh.json` 和 `messages/en.json` 中添加对应的翻译：

```json
// zh.json
{
  "dashboard": {
    "title": "仪表板"
  },
  "common": {
    "save": "保存"
  }
}

// en.json
{
  "dashboard": {
    "title": "Dashboard"
  },
  "common": {
    "save": "Save"
  }
}
```

### 3. 在组件中使用

```tsx
import { getLocale, getTranslations, createTranslator } from '@/lib/i18n-utils'

export default async function MyComponent() {
  const locale = getLocale()
  const messages = await getTranslations(locale)
  const t = createTranslator(messages)

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  )
}
```

---

## 📝 注意事项

1. **服务端组件优先**: 尽可能使用服务端组件，性能更好
2. **翻译文件同步**: 确保中英文翻译文件的 key 结构一致
3. **语义化 key**: 使用有意义的 key 名称，如 `posts.create` 而不是 `label1`
4. **参数化文本**: 对于动态文本，使用参数替换
5. **降级处理**: 如果翻译缺失，会显示原始 key

---

## 🚀 下一步

现在你可以开始逐步迁移你的页面：

1. ✅ 从简单页面开始（Dashboard、Login）
2. ✅ 然后迁移复杂页面（Posts、Websites）
3. ✅ 最后处理表单和交互组件

**所有翻译文本已经准备好了，只需要在组件中使用！**
