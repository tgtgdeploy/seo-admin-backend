# Public API Endpoints

这些API端点供Vercel部署的主站调用，无需认证。

## 文章API

### 获取文章列表

```
GET /api/public/posts?domain=telegramtghub.com&limit=10&offset=0
```

**参数：**
- `domain` (必需): 网站域名
- `limit` (可选): 返回数量，默认10
- `offset` (可选): 偏移量，默认0

**响应：**
```json
{
  "posts": [
    {
      "id": "xxx",
      "title": "文章标题",
      "slug": "article-slug",
      "excerpt": "摘要",
      "metaTitle": "SEO标题",
      "metaDescription": "SEO描述",
      "category": "tutorial",
      "tags": ["tag1", "tag2"],
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "name": "作者名"
      }
    }
  ],
  "total": 30,
  "limit": 10,
  "offset": 0,
  "hasMore": true
}
```

### 获取单篇文章

```
GET /api/public/posts?domain=telegramtghub.com&slug=article-slug
```

**参数：**
- `domain` (必需): 网站域名
- `slug` (必需): 文章slug

**响应：**
```json
{
  "post": {
    "id": "xxx",
    "title": "文章标题",
    "slug": "article-slug",
    "content": "完整内容...",
    "excerpt": "摘要",
    "metaTitle": "SEO标题",
    "metaDescription": "SEO描述",
    "metaKeywords": ["keyword1", "keyword2"],
    "category": "tutorial",
    "tags": ["tag1", "tag2"],
    "publishedAt": "2024-01-01T00:00:00.000Z",
    "author": {
      "name": "作者名",
      "email": "author@example.com"
    }
  }
}
```

## 使用示例（在Vercel主站中）

```typescript
// lib/api.ts
const API_BASE = 'https://adminseohub.xyz/api/public'

export async function getPosts(domain: string, limit = 10, offset = 0) {
  const res = await fetch(
    `${API_BASE}/posts?domain=${domain}&limit=${limit}&offset=${offset}`
  )
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

export async function getPost(domain: string, slug: string) {
  const res = await fetch(
    `${API_BASE}/posts?domain=${domain}&slug=${slug}`
  )
  if (!res.ok) throw new Error('Failed to fetch post')
  return res.json()
}
```

```tsx
// app/page.tsx
import { getPosts } from '@/lib/api'

export default async function HomePage() {
  const { posts } = await getPosts('telegramtghub.com', 10, 0)
  
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <Link href={`/${post.slug}`}>阅读更多</Link>
        </article>
      ))}
    </div>
  )
}
```

## CORS

所有公开API都已配置CORS，支持跨域访问。
