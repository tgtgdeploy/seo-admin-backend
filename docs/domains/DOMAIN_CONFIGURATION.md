# 域名配置总览

## 更新日期
2025-11-15

---

## 主站域名（3个）

### 1. Telegram Hub
- **主域名**: telegramtghub.com
- **跳转域名**: globalinsighthub.xyz → telegramtghub.com (301)
- **Vercel项目ID**: seo-website-1
- **SITE_ID**: seo-website-1
- **说明**: Telegram资源中心

### 2. Telegram Update Center
- **主域名**: telegramupdatecenter.com
- **跳转域名**: infostreammedia.xyz → telegramupdatecenter.com (301)
- **Vercel项目ID**: seo-website-2
- **SITE_ID**: seo-website-2
- **说明**: Telegram更新中心

### 3. Telegram Trend Guide
- **主域名**: telegramtrendguide.com
- **跳转域名**: 暂无
- **Vercel项目ID**: seo-website-tg
- **SITE_ID**: seo-website-tg
- **说明**: Telegram趋势指南

---

## 跳转域名配置

### 活跃跳转域名
1. **globalinsighthub.xyz** → telegramtghub.com
2. **infostreammedia.xyz** → telegramupdatecenter.com

### 已废弃跳转域名
- ~~telegram1688.com~~ (不再使用)
- ~~telegram2688.com~~ (不再使用)
- ~~telegramcnfw.com~~ (不再使用)

---

## 蜘蛛池域名（9个）

根据之前的配置，蜘蛛池使用以下9个域名：

### VPS 1 (95.111.231.110) - 3个域名
1. **autopushnetwork.xyz**
2. **contentpoolzone.site**
3. **crawlboostnet.xyz**

### VPS 2 (37.60.254.52) - 3个域名
4. **crawlenginepro.xyz**
5. **linkpushmatrix.site**
6. **rankspiderchain.xyz**

### VPS 3 (75.119.154.120) - 3个域名
7. **seohubnetwork.xyz**
8. **spidertrackzone.xyz**
9. **trafficboostflow.site**

**总计**: 9个域名，每个域名150个页面 = 1350个页面

---

## Admin后台域名

### 当前配置
- **域名**: adminapihub.xyz
- **部署**: VPS (38.147.178.158) with 宝塔面板
- **说明**: 统一管理后台和API服务

### 建议迁移
- **推荐**: 迁移到Vercel部署
- **优势**: 更快的访问速度，自动HTTPS
- **数据库**: 已迁移到Supabase

---

## DNS配置清单

### Vercel CNAME记录（主站 + 跳转域名）

```dns
# 主站1
telegramtghub.com          → CNAME → cname.vercel-dns.com
www.telegramtghub.com      → CNAME → cname.vercel-dns.com
globalinsighthub.xyz       → CNAME → cname.vercel-dns.com

# 主站2
telegramupdatecenter.com   → CNAME → cname.vercel-dns.com
www.telegramupdatecenter.com → CNAME → cname.vercel-dns.com
infostreammedia.xyz        → CNAME → cname.vercel-dns.com

# 主站3
telegramtrendguide.com     → CNAME → cname.vercel-dns.com
www.telegramtrendguide.com → CNAME → cname.vercel-dns.com

# Admin后台（如果在Vercel）
adminapihub.xyz            → CNAME → cname.vercel-dns.com
```

### VPS A记录（蜘蛛池域名）

```dns
# VPS 1 (95.111.231.110)
autopushnetwork.xyz        → A → 95.111.231.110
contentpoolzone.site       → A → 95.111.231.110
crawlboostnet.xyz          → A → 95.111.231.110

# VPS 2 (37.60.254.52)
crawlenginepro.xyz         → A → 37.60.254.52
linkpushmatrix.site        → A → 37.60.254.52
rankspiderchain.xyz        → A → 37.60.254.52

# VPS 3 (75.119.154.120)
seohubnetwork.xyz          → A → 75.119.154.120
spidertrackzone.xyz        → A → 75.119.154.120
trafficboostflow.site      → A → 75.119.154.120

# Admin后台（如果在VPS）
adminapihub.xyz            → A → 38.147.178.158
```

---

## Vercel项目配置

### 项目1: seo-website-1 (telegramtghub.com)

**域名绑定**:
- telegramtghub.com (主域名)
- www.telegramtghub.com
- globalinsighthub.xyz (跳转域名)

**环境变量**:
```bash
DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
NEXTAUTH_URL="https://telegramtghub.com"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="https://adminapihub.xyz"
SITE_ID="seo-website-1"
```

**vercel.json** (301重定向):
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

### 项目2: seo-website-2 (telegramupdatecenter.com)

**域名绑定**:
- telegramupdatecenter.com (主域名)
- www.telegramupdatecenter.com
- infostreammedia.xyz (跳转域名)

**环境变量**:
```bash
DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
NEXTAUTH_URL="https://telegramupdatecenter.com"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="https://adminapihub.xyz"
SITE_ID="seo-website-2"
```

**vercel.json** (301重定向):
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

### 项目3: seo-website-tg (telegramtrendguide.com)

**域名绑定**:
- telegramtrendguide.com (主域名)
- www.telegramtrendguide.com

**环境变量**:
```bash
DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
NEXTAUTH_URL="https://telegramtrendguide.com"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="https://adminapihub.xyz"
SITE_ID="seo-website-tg"
```

**vercel.json**: 无需配置（无跳转域名）

---

## 域名统计

| 类型 | 数量 | 说明 |
|------|------|------|
| 主站域名 | 3 | telegramtghub.com, telegramupdatecenter.com, telegramtrendguide.com |
| 跳转域名 | 2 | globalinsighthub.xyz, infostreammedia.xyz |
| 蜘蛛池域名 | 9 | 分布在3台VPS |
| Admin后台 | 1 | adminapihub.xyz |
| **总计** | **15** | - |

---

## 部署检查清单

### 域名DNS配置
- [ ] telegramtghub.com → Vercel CNAME
- [ ] telegramupdatecenter.com → Vercel CNAME
- [ ] telegramtrendguide.com → Vercel CNAME
- [ ] globalinsighthub.xyz → Vercel CNAME
- [ ] infostreammedia.xyz → Vercel CNAME
- [ ] 9个蜘蛛池域名 → VPS A记录
- [ ] adminapihub.xyz → VPS或Vercel

### Vercel项目配置
- [ ] 项目1绑定3个域名（主域名 + www + 跳转域名）
- [ ] 项目2绑定3个域名（主域名 + www + 跳转域名）
- [ ] 项目3绑定2个域名（主域名 + www）
- [ ] 项目1配置301重定向（vercel.json）
- [ ] 项目2配置301重定向（vercel.json）
- [ ] 所有项目环境变量配置正确

### 数据库初始化
- [ ] 运行 `npm run db:push` 推送Schema到Supabase
- [ ] 运行 `npm run main-sites:init` 初始化3个主站
- [ ] 运行 `npm run spider-pool:init` 初始化蜘蛛池

### 功能验证
- [ ] 访问 telegramtghub.com 正常
- [ ] 访问 telegramupdatecenter.com 正常
- [ ] 访问 telegramtrendguide.com 正常
- [ ] globalinsighthub.xyz → telegramtghub.com 301跳转正常
- [ ] infostreammedia.xyz → telegramupdatecenter.com 301跳转正常
- [ ] 所有主站无"不安全"警告
- [ ] Admin后台可以访问
- [ ] 蜘蛛池域名可以访问

---

## 下一步操作

### 1. 确认蜘蛛池域名
请确认以下9个蜘蛛池域名是否正确：
1. autopushnetwork.xyz
2. contentpoolzone.site
3. crawlboostnet.xyz
4. crawlenginepro.xyz
5. linkpushmatrix.site
6. rankspiderchain.xyz
7. seohubnetwork.xyz
8. spidertrackzone.xyz
9. trafficboostflow.site

如果有不同的域名，请告知我更新配置。

### 2. 完成Supabase迁移
参考：`SUPABASE_QUICK_START.md`

### 3. 配置DNS记录
根据上面的DNS配置清单，在域名管理后台配置记录。

### 4. 部署到Vercel
每个主站项目分别部署，并绑定对应域名。

### 5. 部署蜘蛛池到VPS
参考：`spider-pool-deployment/README.md`

---

## 相关文档

- 完整架构设计: `MULTI_SITE_ARCHITECTURE.md`
- 快速部署指南: `QUICK_DEPLOY_GUIDE.md`
- Supabase迁移: `SUPABASE_MIGRATION_GUIDE.md`
- 环境变量配置: `VERCEL_ENV_CONFIG.md`
- Vercel重定向示例: `vercel-redirect-example.json`

---

**更新时间**: 2025-11-15
**状态**: 跳转域名已更新，等待确认蜘蛛池域名
