# 多站点SEO架构方案

## 域名配置总览

### 主站点（3个 - Vercel部署）
1. **telegramtghub.com** (seo-website-1)
2. **telegramupdatecenter.com** (seo-website-2)
3. **telegramtrendguide.com** (seo-website-tg)

### 蜘蛛池域名（9个 - VPS部署）
- VPS 1: autopushnetwork.xyz, contentpoolzone.site, crawlboostnet.xyz
- VPS 2: crawlenginepro.xyz, linkpushmatrix.site, rankspiderchain.xyz
- VPS 3: seohubnetwork.xyz, spidertrackzone.xyz, trafficboostflow.site

### 跳转域名（中转页）
- **globalinsighthub.xyz** → telegramtghub.com (301重定向)
- **infostreammedia.xyz** → telegramupdatecenter.com (301重定向)

**已废弃域名**: telegram1688.com, telegram2688.com, telegramcnfw.com

---

## 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Backend (Vercel)                    │
│                   adminseohub.xyz                            │
│  - 内容管理                                                  │
│  - 蜘蛛池API                                                 │
│  - 统一后台                                                  │
└──────────────┬──────────────────────────────────────────────┘
               │
               ├───────────────┬────────────────┬──────────────┐
               │               │                │              │
               ▼               ▼                ▼              ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   主站点1    │ │   主站点2    │ │   主站点3    │ │  跳转域名组  │
    │ tghub.com    │ │updatecenter  │ │trendguide    │ │ (3个中转域名)│
    │  (Vercel)    │ │   (Vercel)   │ │  (Vercel)    │ │  (Redirect)  │
    └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
               │               │                │
               └───────────────┴────────────────┘
                              │
                              │ 内链引流
                              ▼
                    ┌────────────────────┐
                    │   蜘蛛池域名组     │
                    │   (9个域名)        │
                    │   1350个页面       │
                    │   VPS Nginx        │
                    └────────────────────┘
                              │
                              ▼
                        搜索引擎爬虫
```

---

## 使用场景和流量路径

### 场景1: 直接访问主站
```
用户 → telegramtghub.com → 浏览内容 → 内链到蜘蛛池域名
```

### 场景2: 通过跳转域名
```
用户 → globalinsighthub.xyz → 301跳转 → telegramtghub.com
用户 → infostreammedia.xyz  → 301跳转 → telegramupdatecenter.com
```

### 场景3: 搜索引擎抓取路径
```
搜索引擎爬虫 → 蜘蛛池域名 (autopushnetwork.xyz)
              → 内链指向主站 (telegramtghub.com)
              → 提升主站权重
```

### 场景4: SEO链接网络
```
蜘蛛池域名1 ←→ 蜘蛛池域名2 ←→ 蜘蛛池域名3
      ↓              ↓              ↓
   主站1          主站2          主站3
      ↓              ↓              ↓
   跳转域名组 (可选对外宣传域名)
```

---

## 数据库配置方案

### Website表配置

```sql
-- 主站点1
INSERT INTO websites (name, domain, status, description)
VALUES (
  'Telegram Hub',
  'telegramtghub.com',
  'ACTIVE',
  'Telegram资源中心 - 主站点1'
);

-- 主站点2
INSERT INTO websites (name, domain, status, description)
VALUES (
  'Telegram Update Center',
  'telegramupdatecenter.com',
  'ACTIVE',
  'Telegram更新中心 - 主站点2'
);

-- 主站点3
INSERT INTO websites (name, domain, status, description)
VALUES (
  'Telegram Trend Guide',
  'telegramtrendguide.com',
  'ACTIVE',
  'Telegram趋势指南 - 主站点3'
);
```

### DomainAlias配置

每个主站点可以绑定多个域名别名：

```typescript
// 主站1的域名配置
{
  websiteId: "seo-website-1-id",
  domains: [
    {
      domain: "telegramtghub.com",
      isPrimary: true,  // 主域名
      siteName: "Telegram Hub",
      status: "ACTIVE"
    },
    {
      domain: "telegram1688.com",
      isPrimary: false,  // 跳转域名
      siteName: "Telegram 1688",
      status: "REDIRECT"  // 标记为跳转
    }
  ]
}

// 主站2的域名配置
{
  websiteId: "seo-website-2-id",
  domains: [
    {
      domain: "telegramupdatecenter.com",
      isPrimary: true,
      siteName: "Telegram Update Center",
      status: "ACTIVE"
    },
    {
      domain: "telegram2688.com",
      isPrimary: false,
      siteName: "Telegram 2688",
      status: "REDIRECT"
    }
  ]
}

// 主站3的域名配置
{
  websiteId: "seo-website-tg-id",
  domains: [
    {
      domain: "telegramtrendguide.com",
      isPrimary: true,
      siteName: "Telegram Trend Guide",
      status: "ACTIVE"
    },
    {
      domain: "telegramcnfw.com",
      isPrimary: false,
      siteName: "Telegram CNFW",
      status: "REDIRECT"
    }
  ]
}
```

---

## 跳转域名实现方案

### 方案A: Vercel配置（推荐）

在每个Vercel项目中配置多个域名，使用Vercel自带的域名管理：

**vercel.json**
```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "host",
          "value": "telegram1688.com"
        }
      ],
      "destination": "https://telegramtghub.com/$1",
      "permanent": true
    },
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "host",
          "value": "telegram2688.com"
        }
      ],
      "destination": "https://telegramupdatecenter.com/$1",
      "permanent": true
    },
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "host",
          "value": "telegramcnfw.com"
        }
      ],
      "destination": "https://telegramtrendguide.com/$1",
      "permanent": true
    }
  ]
}
```

### 方案B: Next.js Middleware

**middleware.ts**
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const REDIRECT_MAP: Record<string, string> = {
  'telegram1688.com': 'https://telegramtghub.com',
  'telegram2688.com': 'https://telegramupdatecenter.com',
  'telegramcnfw.com': 'https://telegramtrendguide.com',
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''

  const redirectTo = REDIRECT_MAP[hostname]
  if (redirectTo) {
    const url = new URL(request.url)
    return NextResponse.redirect(
      `${redirectTo}${url.pathname}${url.search}`,
      { status: 301 }  // 永久重定向
    )
  }

  return NextResponse.next()
}
```

### 方案C: CloudFlare页面规则（最简单）

在CloudFlare中为每个跳转域名设置页面规则：

```
telegram1688.com/*  → 301重定向 → https://telegramtghub.com/$1
telegram2688.com/*  → 301重定向 → https://telegramupdatecenter.com/$1
telegramcnfw.com/*  → 301重定向 → https://telegramtrendguide.com/$1
```

---

## 蜘蛛池与主站的链接策略

### 1. 蜘蛛池页面链接到主站

在蜘蛛池生成的HTML中添加主站链接：

```typescript
// packages/database/src/services/spider-pool.service.ts

function generatePageContent(pageNum: number, theme: string, domainAliasId: string) {
  // 随机选择一个主站链接
  const mainSites = [
    { url: 'https://telegramtghub.com', name: 'Telegram Hub' },
    { url: 'https://telegramupdatecenter.com', name: 'Telegram Update Center' },
    { url: 'https://telegramtrendguide.com', name: 'Telegram Trend Guide' }
  ]

  const randomSite = mainSites[Math.floor(Math.random() * mainSites.length)]

  const html = `
    <html>
      <head>...</head>
      <body>
        <article>
          ${content}

          <!-- 内链到主站 -->
          <div class="related-links">
            <h3>推荐阅读</h3>
            <ul>
              <li><a href="${randomSite.url}" rel="bookmark">${randomSite.name}</a></li>
              <li><a href="${randomSite.url}/blog">最新文章</a></li>
            </ul>
          </div>
        </article>
      </body>
    </html>
  `

  return html
}
```

### 2. 主站链接到蜘蛛池

在主站文章底部添加相关链接：

```typescript
// 主站文章模板
export default function BlogPost({ post, relatedSpiderPools }) {
  return (
    <article>
      {post.content}

      {/* 蜘蛛池外链 */}
      <aside className="related-resources">
        <h3>相关资源</h3>
        <ul>
          {relatedSpiderPools.map(pool => (
            <li key={pool.domain}>
              <a href={`https://${pool.domain}`} target="_blank" rel="nofollow">
                {pool.siteName}
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </article>
  )
}
```

### 3. 蜘蛛池域名互链

9个蜘蛛池域名之间相互链接，形成链接网络：

```html
<!-- 每个蜘蛛池页面底部 -->
<footer>
  <nav class="spider-network">
    <h4>资源网络</h4>
    <ul>
      <li><a href="https://autopushnetwork.xyz">Auto Push Network</a></li>
      <li><a href="https://contentpoolzone.site">Content Pool Zone</a></li>
      <li><a href="https://crawlboostnet.xyz">Crawl Boost Net</a></li>
      <!-- 其他6个... -->
    </ul>
  </nav>
</footer>
```

---

## Vercel部署配置

### 项目结构

```
seo-admin/
├── apps/
│   ├── web/                    # 主站点共享代码
│   │   ├── app/
│   │   ├── components/
│   │   └── public/
│   └── admin/                  # Admin后台
│       └── ...
├── packages/
│   ├── database/
│   └── ui/
└── vercel.json                 # Vercel配置
```

### Vercel项目配置

需要创建4个Vercel项目：

1. **admin-backend** (adminseohub.xyz)
   - 构建命令: `cd apps/admin && npm run build`
   - 域名: adminseohub.xyz

2. **seo-website-1** (telegramtghub.com)
   - 构建命令: `cd apps/web && npm run build`
   - 域名: telegramtghub.com, telegram1688.com
   - 环境变量: `SITE_ID=seo-website-1`

3. **seo-website-2** (telegramupdatecenter.com)
   - 构建命令: `cd apps/web && npm run build`
   - 域名: telegramupdatecenter.com, telegram2688.com
   - 环境变量: `SITE_ID=seo-website-2`

4. **seo-website-tg** (telegramtrendguide.com)
   - 构建命令: `cd apps/web && npm run build`
   - 域名: telegramtrendguide.com, telegramcnfw.com
   - 环境变量: `SITE_ID=seo-website-tg`

### 环境变量配置

每个Vercel项目需要配置：

```bash
# 公共环境变量
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://domain.com"
NEXTAUTH_SECRET="..."

# 站点特定变量
SITE_ID="seo-website-1"  # 或 seo-website-2, seo-website-tg
ADMIN_API_URL="https://adminseohub.xyz"
```

---

## 域名DNS配置清单

### Vercel主站（A记录或CNAME）

```
telegramtghub.com          → CNAME → cname.vercel-dns.com
www.telegramtghub.com      → CNAME → cname.vercel-dns.com

telegramupdatecenter.com   → CNAME → cname.vercel-dns.com
www.telegramupdatecenter.com → CNAME → cname.vercel-dns.com

telegramtrendguide.com     → CNAME → cname.vercel-dns.com
www.telegramtrendguide.com → CNAME → cname.vercel-dns.com
```

### 跳转域名（同样指向Vercel）

```
telegram1688.com           → CNAME → cname.vercel-dns.com
telegram2688.com           → CNAME → cname.vercel-dns.com
telegramcnfw.com           → CNAME → cname.vercel-dns.com
```

### 蜘蛛池域名（VPS A记录）

```
autopushnetwork.xyz        → A → 95.111.231.110
contentpoolzone.site       → A → 95.111.231.110
crawlboostnet.xyz          → A → 95.111.231.110

crawlenginepro.xyz         → A → 37.60.254.52
linkpushmatrix.site        → A → 37.60.254.52
rankspiderchain.xyz        → A → 37.60.254.52

seohubnetwork.xyz          → A → 75.119.154.120
spidertrackzone.xyz        → A → 75.119.154.120
trafficboostflow.site      → A → 75.119.154.120
```

### Admin后台

```
adminseohub.xyz            → CNAME → cname.vercel-dns.com
```

---

## SEO策略

### 1. 主站定位

**telegramtghub.com** (Hub - 中心)
- 定位: Telegram资源聚合中心
- 内容: 综合性内容，导航中心
- 关键词: telegram, telegram资源, telegram中文

**telegramupdatecenter.com** (Update - 更新)
- 定位: Telegram最新动态和更新
- 内容: 新闻、更新、版本发布
- 关键词: telegram更新, telegram新功能, telegram news

**telegramtrendguide.com** (Trend - 趋势)
- 定位: Telegram使用技巧和趋势分析
- 内容: 教程、指南、趋势报告
- 关键词: telegram教程, telegram技巧, telegram指南

### 2. 跳转域名用途

- 易记域名，对外推广使用
- 短链接分享
- 品牌保护

### 3. 蜘蛛池作用

- 快速生成大量索引页面（1350个）
- 内链指向主站，传递权重
- 吸引搜索引擎爬虫
- 占据长尾关键词搜索结果

### 4. 链接流向

```
搜索引擎 → 蜘蛛池页面 → 内链 → 主站页面 → 用户转化
              ↓
        提升主站爬取频率和权重
```

---

## 部署步骤

### 第1步: 数据库初始化

```bash
cd packages/database

# 运行数据库迁移
npm run db:push

# 创建3个主站点
npm run website:init
```

### 第2步: 部署Admin后台

```bash
cd apps/admin
vercel --prod
# 绑定域名: adminseohub.xyz
```

### 第3步: 部署3个主站

```bash
# 站点1
cd apps/web
vercel --prod
# 绑定域名: telegramtghub.com, telegram1688.com
# 环境变量: SITE_ID=seo-website-1

# 站点2
vercel --prod
# 绑定域名: telegramupdatecenter.com, telegram2688.com
# 环境变量: SITE_ID=seo-website-2

# 站点3
vercel --prod
# 绑定域名: telegramtrendguide.com, telegramcnfw.com
# 环境变量: SITE_ID=seo-website-tg
```

### 第4步: 初始化蜘蛛池

```bash
cd packages/database
npm run spider-pool:init
```

### 第5步: 部署蜘蛛池到VPS

```bash
# 上传到3台VPS
scp -r spider-pool-deployment root@95.111.231.110:/root/
scp -r spider-pool-deployment root@37.60.254.52:/root/
scp -r spider-pool-deployment root@75.119.154.120:/root/

# 在每台VPS上运行
ssh root@95.111.231.110
cd /root/spider-pool-deployment
bash scripts/deploy.sh 1

# 重复VPS2和VPS3...
```

### 第6步: 配置DNS

参照上面的DNS配置清单配置所有域名。

### 第7步: 申请SSL证书

```bash
# 在每台VPS上
bash scripts/ssl.sh 1 your-email@example.com
```

---

## 监控和维护

### 主站监控

- Vercel Analytics
- Google Analytics
- Search Console监控收录情况

### 蜘蛛池监控

```bash
# 在VPS上运行监控
bash scripts/monitor.sh 1
```

### Admin后台查看

- `/dashboard` - 总览
- `/seo-dashboard` - SEO健康
- `/spider` - 爬虫访问统计
- `/spider-pool` - 蜘蛛池管理

---

## 总结

这个架构实现了：

1. ✅ **3个主站点** - 不同定位，覆盖更多关键词
2. ✅ **3个跳转域名** - 品牌保护，易于推广
3. ✅ **9个蜘蛛池域名** - SEO助推器，1350个页面
4. ✅ **统一后台管理** - 一个Admin管理所有内容
5. ✅ **完整的链接网络** - 蜘蛛池 ↔ 主站相互引流

**成本估算:**
- Vercel: 免费（Hobby计划）或 $20/月（Pro计划）
- VPS: $15-18/月（3台）
- 域名: ~$100/年（12个域名）
- **总计**: 约 $30-40/月

**预期效果:**
- 快速建立SEO基础（1350个索引页面）
- 3个主站分别优化，互不干扰
- 蜘蛛池引流，加速主站收录
- 灵活的跳转域名策略
