# 正确的域名配置总结

**更新时间**: 2025-11-15
**状态**: ✅ 已确认所有16个域名
**重要**: 此文档覆盖之前的所有配置！

---

## ⚠️ 重要更正

**管理后台域名**:
- ✅ **adminseohub.xyz** ← 这才是管理后台！
- ❌ ~~adminapihub.xyz~~ ← 这是跳转页，不是管理后台！

**跳转页共3个**:
1. globalinsighthub.xyz
2. infostreammedia.xyz
3. **adminapihub.xyz** ← 第3个跳转页！

---

## 完整域名列表（16个）

| # | 域名 | 用途 | 部署位置 | 状态 |
|---|------|------|----------|------|
| **主站点（3个）** |
| 1 | **telegramtghub.com** | 主站点1 | Vercel | ✅ 活跃 |
| 2 | **telegramupdatecenter.com** | 主站点2 | Vercel | ✅ 活跃 |
| 3 | **telegramtrendguide.com** | 主站点3 | Vercel | ✅ 活跃 |
| **跳转页（3个）** |
| 4 | **globalinsighthub.xyz** | 跳转页 | Vercel | ✅ 301重定向 |
| 5 | **infostreammedia.xyz** | 跳转页 | Vercel | ✅ 301重定向 |
| 6 | **adminapihub.xyz** | 跳转页 | Vercel | ✅ 301重定向 |
| **管理后台（1个）** |
| 7 | **adminseohub.xyz** | 管理后台 | VPS/Vercel | ✅ 活跃 |
| **蜘蛛池（9个）** |
| 8 | **autopushnetwork.xyz** | 蜘蛛池 | VPS1 (95.111.231.110) | ✅ 活跃 |
| 9 | **contentpoolzone.site** | 蜘蛛池 | VPS1 (95.111.231.110) | ✅ 活跃 |
| 10 | **crawlboostnet.xyz** | 蜘蛛池 | VPS1 (95.111.231.110) | ✅ 活跃 |
| 11 | **crawlenginepro.xyz** | 蜘蛛池 | VPS2 (37.60.254.52) | ✅ 活跃 |
| 12 | **linkpushmatrix.site** | 蜘蛛池 | VPS2 (37.60.254.52) | ✅ 活跃 |
| 13 | **rankspiderchain.xyz** | 蜘蛛池 | VPS2 (37.60.254.52) | ✅ 活跃 |
| 14 | **seohubnetwork.xyz** | 蜘蛛池 | VPS3 (75.119.154.120) | ✅ 活跃 |
| 15 | **spidertrackzone.xyz** | 蜘蛛池 | VPS3 (75.119.154.120) | ✅ 活跃 |
| 16 | **trafficboostflow.site** | 蜘蛛池 | VPS3 (75.119.154.120) | ✅ 活跃 |

**总计**: 16个域名

---

## 域名分组详解

### 主站点（3个 - Vercel）
1. **telegramtghub.com** (seo-website-1)
   - 跳转域名: globalinsighthub.xyz
2. **telegramupdatecenter.com** (seo-website-2)
   - 跳转域名: infostreammedia.xyz
3. **telegramtrendguide.com** (seo-website-tg)
   - 跳转域名: adminapihub.xyz

### 跳转页（3个 - Vercel 301重定向）

**问题**: 3个跳转页，但只有3个主站，如何分配？

**推荐方案A**: 每个主站1个跳转域名
- globalinsighthub.xyz → telegramtghub.com
- infostreammedia.xyz → telegramupdatecenter.com
- adminapihub.xyz → telegramtrendguide.com

**推荐方案B**: 多个跳转域名可以指向同一主站
- globalinsighthub.xyz → telegramtghub.com
- infostreammedia.xyz → telegramupdatecenter.com
- adminapihub.xyz → telegramtghub.com (或其他主站)

**请确认**: adminapihub.xyz 应该跳转到哪个主站？

### 管理后台（1个）
- **adminseohub.xyz** - 统一管理后台和API服务
- 部署: VPS (38.147.178.158) 或 Vercel

### 蜘蛛池域名（9个 - 3台VPS）

**VPS 1 (95.111.231.110)** - 3个域名:
- autopushnetwork.xyz
- contentpoolzone.site
- crawlboostnet.xyz

**VPS 2 (37.60.254.52)** - 3个域名:
- crawlenginepro.xyz
- linkpushmatrix.site
- rankspiderchain.xyz

**VPS 3 (75.119.154.120)** - 3个域名:
- seohubnetwork.xyz
- spidertrackzone.xyz
- trafficboostflow.site

---

## 环境变量配置

### 所有Vercel项目通用

**数据库连接**:
```bash
DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
```

**Admin API地址** ← 重要！
```bash
NEXT_PUBLIC_API_URL="https://adminseohub.xyz"
```

### 主站1 (telegramtghub.com)

```bash
DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
NEXTAUTH_URL="https://telegramtghub.com"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="https://adminseohub.xyz"
SITE_ID="seo-website-1"
```

**Vercel域名绑定**:
- telegramtghub.com
- www.telegramtghub.com
- globalinsighthub.xyz (跳转域名)

**vercel.json**:
```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [{"type": "host", "value": "globalinsighthub.xyz"}],
      "destination": "https://telegramtghub.com/:path*",
      "permanent": true,
      "statusCode": 301
    }
  ]
}
```

### 主站2 (telegramupdatecenter.com)

```bash
DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
NEXTAUTH_URL="https://telegramupdatecenter.com"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="https://adminseohub.xyz"
SITE_ID="seo-website-2"
```

**Vercel域名绑定**:
- telegramupdatecenter.com
- www.telegramupdatecenter.com
- infostreammedia.xyz (跳转域名)

**vercel.json**:
```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [{"type": "host", "value": "infostreammedia.xyz"}],
      "destination": "https://telegramupdatecenter.com/:path*",
      "permanent": true,
      "statusCode": 301
    }
  ]
}
```

### 主站3 (telegramtrendguide.com)

```bash
DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
NEXTAUTH_URL="https://telegramtrendguide.com"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="https://adminseohub.xyz"
SITE_ID="seo-website-tg"
```

**Vercel域名绑定**:
- telegramtrendguide.com
- www.telegramtrendguide.com
- **adminapihub.xyz** (跳转域名) ← 如果分配给主站3

**vercel.json** (如果 adminapihub.xyz → 主站3):
```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [{"type": "host", "value": "adminapihub.xyz"}],
      "destination": "https://telegramtrendguide.com/:path*",
      "permanent": true,
      "statusCode": 301
    }
  ]
}
```

---

## DNS配置完整清单

### Vercel CNAME记录

```dns
# 主站1 + 跳转域名
telegramtghub.com          CNAME  cname.vercel-dns.com
www.telegramtghub.com      CNAME  cname.vercel-dns.com
globalinsighthub.xyz       CNAME  cname.vercel-dns.com

# 主站2 + 跳转域名
telegramupdatecenter.com   CNAME  cname.vercel-dns.com
www.telegramupdatecenter.com  CNAME  cname.vercel-dns.com
infostreammedia.xyz        CNAME  cname.vercel-dns.com

# 主站3 + 跳转域名
telegramtrendguide.com     CNAME  cname.vercel-dns.com
www.telegramtrendguide.com CNAME  cname.vercel-dns.com
adminapihub.xyz            CNAME  cname.vercel-dns.com

# Admin后台（如果部署在Vercel）
adminseohub.xyz            CNAME  cname.vercel-dns.com
```

### VPS A记录

```dns
# VPS 1 蜘蛛池 (95.111.231.110)
autopushnetwork.xyz        A  95.111.231.110
contentpoolzone.site       A  95.111.231.110
crawlboostnet.xyz          A  95.111.231.110

# VPS 2 蜘蛛池 (37.60.254.52)
crawlenginepro.xyz         A  37.60.254.52
linkpushmatrix.site        A  37.60.254.52
rankspiderchain.xyz        A  37.60.254.52

# VPS 3 蜘蛛池 (75.119.154.120)
seohubnetwork.xyz          A  75.119.154.120
spidertrackzone.xyz        A  75.119.154.120
trafficboostflow.site      A  75.119.154.120

# Admin后台（如果在VPS）
adminseohub.xyz            A  38.147.178.158
```

---

## 数据库初始化脚本更新

需要更新 `init-main-sites.ts` 以支持第3个跳转域名：

```typescript
{
  id: 'seo-website-tg',
  name: 'Telegram Trend Guide',
  domain: 'telegramtrendguide.com',
  // ... 其他配置
  redirectDomain: {
    domain: 'adminapihub.xyz',
    siteName: 'Admin API Hub',
    siteDescription: '跳转到 Telegram Trend Guide 主站',
    status: 'REDIRECT' as const,
  },
}
```

---

## 域名统计

| 类型 | 数量 | 说明 |
|------|------|------|
| 主站域名 | 3 | telegramtghub.com, telegramupdatecenter.com, telegramtrendguide.com |
| 跳转域名 | 3 | globalinsighthub.xyz, infostreammedia.xyz, **adminapihub.xyz** |
| 蜘蛛池域名 | 9 | 分布在3台VPS |
| Admin后台 | 1 | **adminseohub.xyz** |
| **总计** | **16** | - |

---

## 架构图示

```
                    ┌────────────────────────────┐
                    │   Supabase Database        │
                    │   bsuvzqihxbgoclfvgbhx     │
                    └─────────────┬──────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │   主站1 (V)     │ │   主站2 (V)     │ │   主站3 (V)     │
    │  tghub.com      │ │ updatecenter    │ │ trendguide      │
    │                 │ │                 │ │                 │
    │  跳转域名:      │ │  跳转域名:      │ │  跳转域名:      │
    │  globalinsight  │ │  infostream     │ │  adminapihub    │
    └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
             │                   │                   │
             └───────────────────┴───────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Admin Backend         │
                    │   adminseohub.xyz       │
                    │   (管理后台)            │
                    └────────────┬────────────┘
                                 │ API管理
                                 │
                    ┌────────────▼────────────┐
                    │   蜘蛛池域名组 (9个)   │
                    │   3台VPS               │
                    │   1350个页面           │
                    └────────────────────────┘
```

---

## 重要问题需要确认

### ❓ adminapihub.xyz 应该跳转到哪个主站？

**选项1**: 分配给主站3 (telegramtrendguide.com)
- 因为主站1和主站2已经有跳转域名了

**选项2**: 分配给主站1 (telegramtghub.com)
- 作为主站1的第二个跳转域名

**选项3**: 分配给主站2 (telegramupdatecenter.com)
- 作为主站2的第二个跳转域名

**请告诉我 adminapihub.xyz 应该跳转到哪个主站？**

---

## 快速部署命令

### 1. 更新数据库初始化脚本

需要手动编辑 `packages/database/scripts/init-main-sites.ts`，为第3个主站添加跳转域名。

### 2. 推送数据库Schema

```bash
cd /home/ubuntu/WebstormProjects/seo-admin/packages/database

export DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"

npm run db:push
```

### 3. 初始化主站点

```bash
npm run main-sites:init
```

**预期输出**:
```
✓ 创建网站: Telegram Hub
✓ 创建主域名: telegramtghub.com
✓ 创建跳转域名: globalinsighthub.xyz
✓ 创建网站: Telegram Update Center
✓ 创建主域名: telegramupdatecenter.com
✓ 创建跳转域名: infostreammedia.xyz
✓ 创建网站: Telegram Trend Guide
✓ 创建主域名: telegramtrendguide.com
✓ 创建跳转域名: adminapihub.xyz

总网站数: 3
总域名数: 6 (3个主域名 + 3个跳转)
```

---

## 成本估算

| 项目 | 数量 | 单价 | 月费用 |
|------|------|------|--------|
| Supabase (免费版) | 1 | $0 | $0 |
| Vercel Hobby | 1账号 | $0 | $0 |
| VPS (蜘蛛池) | 3台 | $5/月 | $15 |
| .com域名 | 3个 | $10/年 | ~$2.5 |
| .xyz域名 | 8个 | $5/年 | ~$3.5 |
| .site域名 | 2个 | $5/年 | ~$1 |
| **总计** | - | - | **~$22/月** |

---

## 已废弃域名

- ~~telegram1688.com~~ (旧跳转域名)
- ~~telegram2688.com~~ (旧跳转域名)
- ~~telegramcnfw.com~~ (旧跳转域名)

---

**状态**: ⚠️ 等待确认 adminapihub.xyz 跳转目标

**下一步**: 请确认 adminapihub.xyz 应该跳转到哪个主站，然后我会更新所有配置。
