# 🚀 快速开始指南

**更新时间**: 2025-11-15
**预计时间**: 15分钟
**难度**: ⭐⭐☆☆☆

本指南帮助你快速部署 SEO Admin 多站点系统（3个主站 + 3个跳转页 + 9个蜘蛛池 + 1个管理后台）。

---

## 📋 项目概览

### 域名配置（16个）
- **主站点（3个）**: telegramtghub.com, telegramupdatecenter.com, telegramtrendguide.com
- **跳转页（3个）**: globalinsighthub.xyz, infostreammedia.xyz, adminapihub.xyz
- **管理后台（1个）**: adminseohub.xyz
- **蜘蛛池（9个）**: 分布在3台VPS

### 技术栈
- **数据库**: Supabase (PostgreSQL) ✅
- **部署**: Vercel (主站 + Admin)
- **VPS**: 3台 (蜘蛛池)

---

## ✅ 前置条件

在开始之前，请确保：

- [ ] 已有 Supabase 账号（免费版即可）
- [ ] 已有 Vercel 账号（免费版即可）
- [ ] 已购买或准备好16个域名
- [ ] （可选）3台VPS用于蜘蛛池

---

## 🚀 快速开始（3步）

### 步骤1: 配置Supabase数据库

#### 1.1 创建Supabase项目

1. 访问 https://supabase.com
2. 创建新项目（建议选择Singapore区域）
3. 记录以下信息：
   - 项目ID: `bsuvzqihxbgoclfvgbhx`
   - 数据库密码: 你设置的密码

#### 1.2 获取连接字符串

Dashboard → Settings → Database → Connection string → URI

格式：
```
postgresql://postgres:你的密码@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres
```

#### 1.3 初始化数据库

```bash
cd /home/ubuntu/WebstormProjects/seo-admin/packages/database

# 设置环境变量
export DATABASE_URL="postgresql://postgres:你的密码@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"

# 推送Schema到Supabase
npm run db:push

# 初始化3个主站
npm run main-sites:init

# （可选）初始化蜘蛛池
npm run spider-pool:init
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
总域名数: 6
```

---

### 步骤2: 部署到Vercel

#### 2.1 部署Admin后台

```bash
cd /home/ubuntu/WebstormProjects/seo-admin

# 部署到Vercel
vercel --prod
```

**配置环境变量**（Vercel Dashboard → Settings → Environment Variables）:
```bash
DATABASE_URL="postgresql://postgres:你的密码@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
NEXTAUTH_URL="https://adminseohub.xyz"
NEXTAUTH_SECRET="运行 openssl rand -base64 32 生成"
```

**绑定域名**: adminseohub.xyz

#### 2.2 部署主站1 (telegramtghub.com)

创建新的Vercel项目：

**环境变量**:
```bash
DATABASE_URL="postgresql://postgres:你的密码@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
NEXTAUTH_URL="https://telegramtghub.com"
NEXTAUTH_SECRET="与Admin后台相同"
NEXT_PUBLIC_API_URL="https://adminseohub.xyz"
SITE_ID="seo-website-1"
```

**绑定域名**:
- telegramtghub.com
- www.telegramtghub.com
- globalinsighthub.xyz (跳转域名)

**创建 vercel.json**:
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

#### 2.3 部署主站2 (telegramupdatecenter.com)

重复上述步骤，修改：
- NEXTAUTH_URL="https://telegramupdatecenter.com"
- SITE_ID="seo-website-2"
- 绑定域名: telegramupdatecenter.com, infostreammedia.xyz
- vercel.json 中的跳转域名改为 infostreammedia.xyz

#### 2.4 部署主站3 (telegramtrendguide.com)

重复上述步骤，修改：
- NEXTAUTH_URL="https://telegramtrendguide.com"
- SITE_ID="seo-website-tg"
- 绑定域名: telegramtrendguide.com, adminapihub.xyz
- vercel.json 中的跳转域名改为 adminapihub.xyz

---

### 步骤3: 配置DNS

#### 3.1 Vercel域名（CNAME记录）

```dns
# 主站1
telegramtghub.com          CNAME  cname.vercel-dns.com
www.telegramtghub.com      CNAME  cname.vercel-dns.com
globalinsighthub.xyz       CNAME  cname.vercel-dns.com

# 主站2
telegramupdatecenter.com   CNAME  cname.vercel-dns.com
www.telegramupdatecenter.com  CNAME  cname.vercel-dns.com
infostreammedia.xyz        CNAME  cname.vercel-dns.com

# 主站3
telegramtrendguide.com     CNAME  cname.vercel-dns.com
www.telegramtrendguide.com CNAME  cname.vercel-dns.com
adminapihub.xyz            CNAME  cname.vercel-dns.com

# Admin后台
adminseohub.xyz            CNAME  cname.vercel-dns.com
```

#### 3.2 蜘蛛池域名（A记录）- 可选

如果要部署蜘蛛池：

```dns
# VPS 1 (95.111.231.110)
autopushnetwork.xyz        A  95.111.231.110
contentpoolzone.site       A  95.111.231.110
crawlboostnet.xyz          A  95.111.231.110

# VPS 2, 3 同理...
```

---

## ✅ 验证部署

### 1. 检查数据库

访问 Supabase Dashboard:
- Table Editor → 应该看到 `Website`, `DomainAlias` 等表
- `Website` 表应该有3条记录

### 2. 检查主站

访问以下网址，应该都能正常打开：
- https://telegramtghub.com
- https://telegramupdatecenter.com
- https://telegramtrendguide.com

### 3. 检查跳转

访问跳转域名，应该301重定向到主站：
- https://globalinsighthub.xyz → telegramtghub.com
- https://infostreammedia.xyz → telegramupdatecenter.com
- https://adminapihub.xyz → telegramtrendguide.com

### 4. 检查Admin后台

访问 https://adminseohub.xyz
- 应该能看到登录页
- 登录后能看到Dashboard
- Websites页面应该显示3个网站

### 5. 检查HTTPS

所有网站地址栏应该显示 🔒 锁图标，无"不安全"警告。

---

## 🔧 故障排查

### 问题1: 网站显示"不安全"

**原因**: 数据库连接或API使用了HTTP

**解决**:
1. 检查所有环境变量中的 `NEXT_PUBLIC_API_URL` 是否使用 HTTPS
2. 确认 DATABASE_URL 连接到Supabase（自动HTTPS）
3. 清除浏览器缓存重试

### 问题2: 数据库连接失败

**错误**: `Can't reach database server`

**解决**:
1. 检查 DATABASE_URL 是否正确
2. 检查Supabase项目是否暂停（免费版7天不活跃会暂停）
3. 访问Supabase Dashboard唤醒项目

### 问题3: 跳转域名不工作

**原因**: vercel.json未配置或域名未绑定

**解决**:
1. 确认已在项目根目录创建 vercel.json
2. 确认跳转域名已在Vercel项目中绑定
3. 重新部署项目

### 问题4: Admin后台无法访问

**检查项**:
1. Vercel部署是否成功
2. DNS是否生效（`nslookup adminseohub.xyz`）
3. 环境变量是否配置正确

---

## 📊 下一步

### 必做
- [ ] 生成NEXTAUTH_SECRET: `openssl rand -base64 32`
- [ ] 配置所有域名的DNS记录
- [ ] 在Supabase中验证数据

### 推荐
- [ ] 配置Google Analytics
- [ ] 提交Sitemap到搜索引擎
- [ ] 配置备份策略

### 可选
- [ ] 部署蜘蛛池到3台VPS
- [ ] 配置CloudFlare CDN
- [ ] 启用Vercel Analytics

---

## 📖 相关文档

### 详细配置
- **[域名配置总结](domains/CORRECT_DOMAIN_SUMMARY.md)** - 16个域名完整配置
- **[Vercel环境变量](deployment/VERCEL_ENV_CONFIG.md)** - 环境变量详细说明
- **[Supabase快速开始](deployment/SUPABASE_QUICK_START.md)** - Supabase详细配置

### 架构理解
- **[多站点架构](architecture/MULTI_SITE_ARCHITECTURE.md)** - 架构设计
- **[动态蜘蛛池](architecture/DYNAMIC_SPIDER_POOL.md)** - 蜘蛛池说明

### 部署指南
- **[快速部署指南](deployment/QUICK_DEPLOY_GUIDE.md)** - 完整部署流程
- **[部署检查清单](deployment/DEPLOY_CHECKLIST.md)** - 部署前检查

---

## 🆘 获取帮助

### 检查日志

**Vercel部署日志**:
- Vercel Dashboard → Deployments → 查看日志

**Supabase日志**:
- Supabase Dashboard → Logs → Postgres Logs

**浏览器控制台**:
- 按 F12 → Console 标签 → 查看错误

### 常见错误

| 错误 | 原因 | 解决方法 |
|------|------|----------|
| Mixed Content | API使用HTTP | 检查 NEXT_PUBLIC_API_URL |
| Database connection failed | 连接字符串错误 | 验证 DATABASE_URL |
| 401 Unauthorized | 认证失败 | 检查 NEXTAUTH_SECRET |
| 404 Not Found | 路由错误 | 检查 Vercel 部署 |

---

**完成时间**: 15-20分钟（不含DNS传播）
**成功标志**: 所有3个主站可访问，Admin后台可登录，无"不安全"警告

**下一步**: 查看 [域名配置总结](domains/CORRECT_DOMAIN_SUMMARY.md) 了解完整配置
