# 📡 SEO Admin 公开 API 集成指南

本文档说明如何从 Vercel 部署的网站（seo-website-1, seo-website-2, seo-website-tg）获取 Admin 后台的博文数据。

---

## 🎯 架构概览

```
┌─────────────────────┐
│  SEO Admin (VPS)    │
│  Port: 3100         │
│                     │
│  PostgreSQL         │
│  API Endpoints      │
└─────────┬───────────┘
          │
          │ HTTP API Calls
          │
    ┌─────┴──────────────────┐
    │                        │
    ▼                        ▼                        ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ seo-website-1│  │ seo-website-2│  │ seo-website-tg│
│   (Vercel)   │  │   (Vercel)   │  │   (Vercel)   │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## ⚙️ 配置步骤

### 1️⃣ 在 Admin 后台生成 API Key

#### 方式一：通过管理界面（推荐）

1. 登录 Admin 后台: `https://admin.yourdomain.com:3100`
2. 进入 **网站管理** (Websites)
3. 选择对应的网站 (seo-website-1)
4. 点击 **生成 API Key**
5. 复制生成的 API Key（格式：`sk_live_<32-char-random-string>`）

#### 方式二：通过 API 调用

```bash
# 登录获取 session token
curl -X POST https://admin.yourdomain.com:3100/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'

# 生成 API Key
curl -X POST https://admin.yourdomain.com:3100/api/websites/{websiteId}/api-key \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

---

### 2️⃣ 在 Vercel 网站配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```bash
# SEO Admin API 配置
NEXT_PUBLIC_ADMIN_API_URL=https://admin.yourdomain.com:3100
ADMIN_API_KEY=sk_live_YOUR_API_KEY_HERE

# 网站域名（用于获取对应的文章）
NEXT_PUBLIC_SITE_DOMAIN=seo-website-1.com
```

---

## 📚 API 端点说明

### 🟢 获取所有已发布文章

**端点:** `GET /api/public/posts`

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `domain` | string | 是* | 网站域名 (如 `seo-website-1.com`) |
| `websiteId` | string | 是* | 网站 ID |
| `limit` | number | 否 | 每页数量，默认 50 |
| `offset` | number | 否 | 偏移量，默认 0 |

**请求头:**

```
x-api-key: sk_live_YOUR_API_KEY_HERE
```

**示例请求:**

```bash
curl -X GET 'https://admin.yourdomain.com:3100/api/public/posts?domain=seo-website-1.com&limit=20' \
  -H 'x-api-key: sk_live_YOUR_API_KEY_HERE'
```

**响应示例:**

```json
{
  "posts": [
    {
      "id": "cm1234567890",
      "title": "如何优化 SEO",
      "slug": "how-to-optimize-seo",
      "content": "完整的文章内容...",
      "excerpt": "摘要...",
      "coverImage": "https://cdn.example.com/image.jpg",
      "metaTitle": "SEO 优化指南 - 2024 年最新",
      "metaDescription": "学习最新的 SEO 优化技巧...",
      "metaKeywords": ["SEO", "优化", "搜索引擎"],
      "tags": ["SEO", "教程"],
      "publishedAt": "2024-01-15T10:00:00.000Z",
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z",
      "website": {
        "id": "cm0987654321",
        "name": "SEO Website 1",
        "domain": "seo-website-1.com"
      }
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 🟢 获取单篇文章

**端点:** `GET /api/public/posts/{slug}`

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| `slug` | string | 文章 slug |

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `domain` | string | 是 | 网站域名 |

**示例请求:**

```bash
curl -X GET 'https://admin.yourdomain.com:3100/api/public/posts/how-to-optimize-seo?domain=seo-website-1.com' \
  -H 'x-api-key: sk_live_YOUR_API_KEY_HERE'
```

**响应:** 同上，返回单个 post 对象

---

## 🚀 Next.js 集成示例

### 方式一：Server Components (推荐)

```typescript
// app/blog/page.tsx
import { getPosts } from '@/lib/api'

export default async function BlogPage() {
  const { posts } = await getPosts()

  return (
    <div>
      <h1>博客文章</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <a href={`/blog/${post.slug}`}>阅读更多</a>
        </article>
      ))}
    </div>
  )
}
```

```typescript
// lib/api.ts
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL
const API_KEY = process.env.ADMIN_API_KEY
const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN

export async function getPosts(limit = 50, offset = 0) {
  const url = `${ADMIN_API_URL}/api/public/posts?domain=${SITE_DOMAIN}&limit=${limit}&offset=${offset}`

  const response = await fetch(url, {
    headers: {
      'x-api-key': API_KEY!,
    },
    next: {
      revalidate: 60, // ISR: 每 60 秒重新验证
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch posts')
  }

  return response.json()
}

export async function getPost(slug: string) {
  const url = `${ADMIN_API_URL}/api/public/posts/${slug}?domain=${SITE_DOMAIN}`

  const response = await fetch(url, {
    headers: {
      'x-api-key': API_KEY!,
    },
    next: {
      revalidate: 60,
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error('Failed to fetch post')
  }

  return response.json()
}
```

---

### 方式二：使用 React Query（客户端）

```typescript
// lib/hooks/usePosts.ts
'use client'

import { useQuery } from '@tanstack/react-query'

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await fetch('/api/posts') // 通过代理路由
      if (!response.ok) throw new Error('Failed to fetch posts')
      return response.json()
    },
  })
}
```

```typescript
// app/api/posts/route.ts (代理路由，隐藏 API Key)
import { NextResponse } from 'next/server'

export async function GET() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADMIN_API_URL}/api/public/posts?domain=${process.env.NEXT_PUBLIC_SITE_DOMAIN}`,
    {
      headers: {
        'x-api-key': process.env.ADMIN_API_KEY!,
      },
    }
  )

  const data = await response.json()
  return NextResponse.json(data)
}
```

---

## 🔒 安全注意事项

### ✅ DO（推荐做法）

1. **使用服务器端 API 调用**: 在 Server Components 或 API Routes 中调用，不要在客户端暴露 API Key
2. **启用 HTTPS**: 生产环境必须使用 HTTPS
3. **定期轮换 API Key**: 每 3-6 个月更新一次
4. **限制 CORS**: 在 Admin 后台配置允许的域名白名单
5. **监控 API 使用**: 查看访问日志，发现异常立即禁用 API Key

### ❌ DON'T（禁止）

1. ❌ 不要在客户端代码中硬编码 API Key
2. ❌ 不要将 API Key 提交到 Git 仓库
3. ❌ 不要在 `NEXT_PUBLIC_*` 环境变量中存储 API Key
4. ❌ 不要在浏览器控制台打印 API Key

---

## 🧪 测试 API

### 使用 cURL

```bash
# 测试获取文章列表
curl -X GET 'http://localhost:3100/api/public/posts?domain=seo-website-1.com' \
  -H 'x-api-key: sk_live_YOUR_API_KEY_HERE'

# 测试获取单篇文章
curl -X GET 'http://localhost:3100/api/public/posts/test-article?domain=seo-website-1.com' \
  -H 'x-api-key: sk_live_YOUR_API_KEY_HERE'
```

### 使用 Postman

1. Method: `GET`
2. URL: `http://localhost:3100/api/public/posts?domain=seo-website-1.com`
3. Headers:
   - `x-api-key`: `sk_live_YOUR_API_KEY_HERE`

---

## 🔧 故障排查

### 问题 1: 401 Unauthorized

**原因**: API Key 无效或未提供

**解决**:
- 检查请求头是否包含 `x-api-key`
- 验证 API Key 格式是否正确
- 确认 API Key 未被禁用

### 问题 2: 返回空数组

**原因**: 数据库中没有已发布的文章

**解决**:
```bash
# 检查数据库
cd packages/database
pnpm run db:studio

# 确认有 status='PUBLISHED' 的文章
```

### 问题 3: CORS 错误

**原因**: 跨域请求被阻止

**解决**: API 已配置 CORS 允许所有域名，如果仍有问题，检查：
- Admin 后台是否运行在 HTTPS
- Vercel 网站是否也使用 HTTPS

---

## 📊 性能优化建议

### 1. 使用 ISR（增量静态再生成）

```typescript
export const revalidate = 60 // 每 60 秒重新生成
```

### 2. 缓存策略

```typescript
fetch(url, {
  next: {
    revalidate: 300, // 5 分钟缓存
    tags: ['posts'], // 使用标签便于手动刷新
  },
})
```

### 3. 分页加载

```typescript
// 只加载前 20 篇
const { posts } = await getPosts(20, 0)
```

### 4. 使用 CDN

- 将 coverImage 上传到 CDN（Cloudflare, Vercel Blob）
- 使用图片优化（Next.js Image 组件）

---

## 📝 下一步

1. ✅ 在 Admin 后台为每个网站生成 API Key
2. ✅ 在 Vercel 配置环境变量
3. ✅ 在网站中集成 API 调用
4. ✅ 发布至少 3-5 篇测试文章
5. ✅ 验证网站能正确显示文章

---

## 🆘 需要帮助？

如有问题，请检查：
- Admin 后台日志: `pm2 logs seo-admin`
- Vercel 部署日志
- 浏览器控制台错误

---

**生成时间**: 2024-01-15
**文档版本**: v1.0
