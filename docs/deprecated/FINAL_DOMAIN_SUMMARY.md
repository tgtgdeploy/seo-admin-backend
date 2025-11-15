# 最终域名配置总结

**更新时间**: 2025-11-15
**状态**: ✅ 已确认所有15个域名

---

## 完整域名列表（15个）

| # | 域名 | 用途 | 部署位置 | 状态 |
|---|------|------|----------|------|
| 1 | **telegramtghub.com** | 主站点1 | Vercel | ✅ 活跃 |
| 2 | **telegramupdatecenter.com** | 主站点2 | Vercel | ✅ 活跃 |
| 3 | **telegramtrendguide.com** | 主站点3 | Vercel | ✅ 活跃 |
| 4 | **globalinsighthub.xyz** | 跳转页 → 主站1 | Vercel | ✅ 301重定向 |
| 5 | **infostreammedia.xyz** | 跳转页 → 主站2 | Vercel | ✅ 301重定向 |
| 6 | **adminapihub.xyz** | 管理后台 | VPS/Vercel | ✅ 活跃 |
| 7 | **autopushnetwork.xyz** | 蜘蛛池 | VPS1 (95.111.231.110) | ✅ 活跃 |
| 8 | **contentpoolzone.site** | 蜘蛛池 | VPS1 (95.111.231.110) | ✅ 活跃 |
| 9 | **crawlboostnet.xyz** | 蜘蛛池 | VPS1 (95.111.231.110) | ✅ 活跃 |
| 10 | **crawlenginepro.xyz** | 蜘蛛池 | VPS2 (37.60.254.52) | ✅ 活跃 |
| 11 | **linkpushmatrix.site** | 蜘蛛池 | VPS2 (37.60.254.52) | ✅ 活跃 |
| 12 | **rankspiderchain.xyz** | 蜘蛛池 | VPS2 (37.60.254.52) | ✅ 活跃 |
| 13 | **seohubnetwork.xyz** | 蜘蛛池 | VPS3 (75.119.154.120) | ✅ 活跃 |
| 14 | **spidertrackzone.xyz** | 蜘蛛池 | VPS3 (75.119.154.120) | ✅ 活跃 |
| 15 | **trafficboostflow.site** | 蜘蛛池 | VPS3 (75.119.154.120) | ✅ 活跃 |

---

## 域名分组

### 主站点（3个 - Vercel）
1. **telegramtghub.com** (seo-website-1)
2. **telegramupdatecenter.com** (seo-website-2)
3. **telegramtrendguide.com** (seo-website-tg)

### 跳转域名（2个 - Vercel 301重定向）
- **globalinsighthub.xyz** → telegramtghub.com
- **infostreammedia.xyz** → telegramupdatecenter.com

### 管理后台（1个）
- **adminapihub.xyz** (统一管理后台和API)

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

## 已废弃域名

这些域名不再使用：
- ~~telegram1688.com~~ (旧跳转域名)
- ~~telegram2688.com~~ (旧跳转域名)
- ~~telegramcnfw.com~~ (旧跳转域名)
- ~~adminseohub.xyz~~ (旧管理后台域名，已改为 adminapihub.xyz)

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

# 主站3
telegramtrendguide.com     CNAME  cname.vercel-dns.com
www.telegramtrendguide.com CNAME  cname.vercel-dns.com

# Admin后台（如果部署在Vercel）
adminapihub.xyz            CNAME  cname.vercel-dns.com
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
adminapihub.xyz            A  38.147.178.158
```

---

## 环境变量配置

### 所有Vercel项目通用

**数据库连接**:
```bash
DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
```

**Admin API地址**:
```bash
NEXT_PUBLIC_API_URL="https://adminapihub.xyz"
```

### 主站1 (telegramtghub.com)

```bash
DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
NEXTAUTH_URL="https://telegramtghub.com"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="https://adminapihub.xyz"
SITE_ID="seo-website-1"
```

**Vercel域名绑定**: telegramtghub.com, www.telegramtghub.com, globalinsighthub.xyz

### 主站2 (telegramupdatecenter.com)

```bash
DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
NEXTAUTH_URL="https://telegramupdatecenter.com"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="https://adminapihub.xyz"
SITE_ID="seo-website-2"
```

**Vercel域名绑定**: telegramupdatecenter.com, www.telegramupdatecenter.com, infostreammedia.xyz

### 主站3 (telegramtrendguide.com)

```bash
DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
NEXTAUTH_URL="https://telegramtrendguide.com"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="https://adminapihub.xyz"
SITE_ID="seo-website-tg"
```

**Vercel域名绑定**: telegramtrendguide.com, www.telegramtrendguide.com

---

## Vercel 301重定向配置

### 主站1项目 (vercel.json)

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "host",
          "value": "globalinsighthub.xyz"
        }
      ],
      "destination": "https://telegramtghub.com/:path*",
      "permanent": true,
      "statusCode": 301
    }
  ]
}
```

### 主站2项目 (vercel.json)

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "host",
          "value": "infostreammedia.xyz"
        }
      ],
      "destination": "https://telegramupdatecenter.com/:path*",
      "permanent": true,
      "statusCode": 301
    }
  ]
}
```

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
    │  globalinsight  │ │  infostream     │ │  (无)           │
    └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
             │                   │                   │
             └───────────────────┴───────────────────┘
                                 │
                    内链引流 + SEO优化
                                 │
                    ┌────────────▼────────────┐
                    │   Admin API Backend     │
                    │   adminapihub.xyz       │
                    └────────────┬────────────┘
                                 │
                                 │ API管理
                                 │
                    ┌────────────▼────────────┐
                    │   蜘蛛池域名组 (9个)   │
                    │   3台VPS               │
                    │   1350个页面           │
                    │                        │
                    │  VPS1: 3个域名         │
                    │  VPS2: 3个域名         │
                    │  VPS3: 3个域名         │
                    └────────────────────────┘
                                 │
                                 ▼
                           搜索引擎爬虫
```

**说明**:
- (V) = Vercel部署
- VPS = VPS服务器部署
- 所有连接使用HTTPS（通过Supabase和Vercel自动SSL）

---

## 部署检查清单

### DNS配置
- [ ] 3个主站域名 CNAME → Vercel
- [ ] 2个跳转域名 CNAME → Vercel
- [ ] 9个蜘蛛池域名 A记录 → 各自VPS IP
- [ ] adminapihub.xyz CNAME → Vercel 或 A记录 → VPS

### Vercel项目
- [ ] 项目1绑定3个域名 (主站1 + www + 跳转域名)
- [ ] 项目2绑定3个域名 (主站2 + www + 跳转域名)
- [ ] 项目3绑定2个域名 (主站3 + www)
- [ ] 项目1配置vercel.json (301重定向)
- [ ] 项目2配置vercel.json (301重定向)
- [ ] 所有项目环境变量正确配置

### 数据库
- [ ] Supabase项目已创建
- [ ] Schema已推送 (npm run db:push)
- [ ] 主站点已初始化 (npm run main-sites:init)
- [ ] 蜘蛛池已初始化 (npm run spider-pool:init)

### VPS蜘蛛池
- [ ] VPS1部署完成 (3个域名)
- [ ] VPS2部署完成 (3个域名)
- [ ] VPS3部署完成 (3个域名)
- [ ] Nginx配置正确
- [ ] SSL证书已申请

### 功能验证
- [ ] telegramtghub.com 可访问
- [ ] telegramupdatecenter.com 可访问
- [ ] telegramtrendguide.com 可访问
- [ ] globalinsighthub.xyz → telegramtghub.com (301)
- [ ] infostreammedia.xyz → telegramupdatecenter.com (301)
- [ ] adminapihub.xyz 可访问
- [ ] 9个蜘蛛池域名可访问
- [ ] 所有HTTPS连接无"不安全"警告

---

## 快速部署命令

### 1. 推送数据库Schema

```bash
cd /home/ubuntu/WebstormProjects/seo-admin/packages/database

export DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"

npm run db:push
```

### 2. 初始化主站点

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
ℹ️  该站点暂无跳转域名

总网站数: 3
总域名数: 5
```

### 3. 初始化蜘蛛池

```bash
npm run spider-pool:init
```

### 4. 部署到Vercel

```bash
cd /home/ubuntu/WebstormProjects/seo-admin

# 触发所有项目重新部署
git commit --allow-empty -m "chore: 更新域名配置"
git push origin main
```

---

## 成本估算

| 项目 | 数量 | 单价 | 月费用 |
|------|------|------|--------|
| Supabase (免费版) | 1 | $0 | $0 |
| Vercel Hobby | 1账号 | $0 | $0 |
| VPS (蜘蛛池) | 3台 | $5/月 | $15 |
| .com域名 | 3个 | $10/年 | ~$2.5 |
| .xyz域名 | 7个 | $5/年 | ~$3 |
| .site域名 | 2个 | $5/年 | ~$1 |
| **总计** | - | - | **~$21.5/月** |

**如果升级Vercel Pro**: 约 $41.5/月

---

## 相关文档

- 完整域名配置: `DOMAIN_CONFIGURATION.md`
- 架构设计: `MULTI_SITE_ARCHITECTURE.md`
- 快速部署: `QUICK_DEPLOY_GUIDE.md`
- 环境变量: `VERCEL_ENV_CONFIG.md`
- Supabase迁移: `SUPABASE_MIGRATION_GUIDE.md`
- Supabase快速开始: `SUPABASE_QUICK_START.md`
- 蜘蛛池部署: `spider-pool-deployment/README.md`

---

## 重要变更记录

### 2025-11-15
- ✅ 更新跳转域名: globalinsighthub.xyz, infostreammedia.xyz
- ✅ 废弃旧跳转域名: telegram1688.com, telegram2688.com, telegramcnfw.com
- ✅ 更新Admin后台域名: adminseohub.xyz → adminapihub.xyz
- ✅ 确认9个蜘蛛池域名配置
- ✅ 所有文档已更新

---

**状态**: ✅ 配置完成，可以开始部署

**下一步**: 参考 `SUPABASE_QUICK_START.md` 完成数据库迁移和主站点初始化
