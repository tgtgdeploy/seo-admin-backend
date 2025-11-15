# 快速部署指南 - 多站点 + 蜘蛛池架构

## 域名总览

### 主站点（Vercel）
1. **telegramtghub.com** - Telegram资源中心
2. **telegramupdatecenter.com** - Telegram更新中心
3. **telegramtrendguide.com** - Telegram趋势指南

### 跳转域名（301重定向）
- **globalinsighthub.xyz** → telegramtghub.com
- **infostreammedia.xyz** → telegramupdatecenter.com

**已废弃**: telegram1688.com, telegram2688.com, telegramcnfw.com

### 蜘蛛池域名（VPS）
9个域名，1350个页面

---

## 部署流程

### 第1步：数据库初始化

```bash
cd packages/database

# 1. 推送数据库schema
npm run db:push

# 2. 初始化3个主站点
npm run main-sites:init

# 3. 初始化蜘蛛池（9个域名，1350个页面）
npm run spider-pool:init
```

**预期输出：**
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
总域名数: 5 (3个主域名 + 2个跳转)
```

---

### 第2步：部署Admin后台（Vercel）

```bash
cd /path/to/seo-admin

# 部署到Vercel
vercel --prod

# 绑定域名
# Domain: adminseohub.xyz
```

**环境变量：**
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://adminseohub.xyz
NEXTAUTH_SECRET=your-secret
```

---

### 第3步：部署主站点（Vercel）

每个主站点需要单独部署为一个Vercel项目。

#### 站点1: telegramtghub.com

```bash
# 初始化新的Vercel项目
vercel

# 项目配置
Project Name: seo-website-1
Framework Preset: Next.js
Root Directory: ./
```

**环境变量：**
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://telegramtghub.com
NEXTAUTH_SECRET=your-secret
SITE_ID=seo-website-1
ADMIN_API_URL=https://adminseohub.xyz
```

**绑定域名：**
- Primary: telegramtghub.com
- Redirect: telegram1688.com

#### 站点2: telegramupdatecenter.com

```bash
vercel

# 项目配置
Project Name: seo-website-2
```

**环境变量：**
```bash
SITE_ID=seo-website-2
NEXTAUTH_URL=https://telegramupdatecenter.com
# ... 其他变量相同
```

**绑定域名：**
- Primary: telegramupdatecenter.com
- Redirect: telegram2688.com

#### 站点3: telegramtrendguide.com

```bash
vercel

# 项目配置
Project Name: seo-website-tg
```

**环境变量：**
```bash
SITE_ID=seo-website-tg
NEXTAUTH_URL=https://telegramtrendguide.com
# ... 其他变量相同
```

**绑定域名：**
- Primary: telegramtrendguide.com
- Redirect: telegramcnfw.com

---

### 第4步：配置301重定向

在每个Vercel项目根目录创建 `vercel.json`：

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "host",
          "value": "telegram1688.com"
        }
      ],
      "destination": "https://telegramtghub.com/:path*",
      "permanent": true,
      "statusCode": 301
    }
  ]
}
```

或者使用CloudFlare页面规则（更简单）。

---

### 第5步：部署蜘蛛池到VPS

```bash
# 上传部署包到3台VPS
cd /path/to/seo-admin
scp -r spider-pool-deployment root@95.111.231.110:/root/
scp -r spider-pool-deployment root@37.60.254.52:/root/
scp -r spider-pool-deployment root@75.119.154.120:/root/

# VPS 1
ssh root@95.111.231.110
cd /root/spider-pool-deployment
chmod +x scripts/*.sh
bash scripts/deploy.sh 1

# VPS 2
ssh root@37.60.254.52
cd /root/spider-pool-deployment
bash scripts/deploy.sh 2

# VPS 3
ssh root@75.119.154.120
cd /root/spider-pool-deployment
bash scripts/deploy.sh 3
```

---

### 第6步：配置DNS

#### Vercel主站（CNAME记录）

在域名DNS管理中添加：

```
# 站点1
telegramtghub.com          → CNAME → cname.vercel-dns.com
www.telegramtghub.com      → CNAME → cname.vercel-dns.com
telegram1688.com           → CNAME → cname.vercel-dns.com

# 站点2
telegramupdatecenter.com   → CNAME → cname.vercel-dns.com
www.telegramupdatecenter.com → CNAME → cname.vercel-dns.com
telegram2688.com           → CNAME → cname.vercel-dns.com

# 站点3
telegramtrendguide.com     → CNAME → cname.vercel-dns.com
www.telegramtrendguide.com → CNAME → cname.vercel-dns.com
telegramcnfw.com           → CNAME → cname.vercel-dns.com

# Admin后台
adminseohub.xyz            → CNAME → cname.vercel-dns.com
```

#### 蜘蛛池域名（A记录）

```
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
```

---

### 第7步：申请SSL证书（VPS）

等待DNS生效后（5-30分钟），在每台VPS上运行：

```bash
# VPS 1
bash scripts/ssl.sh 1 your-email@example.com

# VPS 2
bash scripts/ssl.sh 2 your-email@example.com

# VPS 3
bash scripts/ssl.sh 3 your-email@example.com
```

---

### 第8步：验证部署

#### 检查主站

```bash
# 主域名访问
curl -I https://telegramtghub.com
curl -I https://telegramupdatecenter.com
curl -I https://telegramtrendguide.com

# 跳转域名测试
curl -I https://telegram1688.com
# 应该返回 301 redirect 到 telegramtghub.com
```

#### 检查蜘蛛池

```bash
# 在VPS上运行监控
ssh root@95.111.231.110
cd /root/spider-pool-deployment
bash scripts/monitor.sh 1

# 浏览器访问
https://autopushnetwork.xyz
https://autopushnetwork.xyz/sitemap.xml
```

#### 检查Admin后台

访问：https://adminseohub.xyz
- Dashboard - 查看统计
- Websites - 确认3个主站已创建
- Spider Pool - 确认1350个页面已生成

---

## 架构图示

```
┌─────────────────────────────────────────────┐
│         Admin Backend (Vercel)              │
│         adminseohub.xyz                     │
│   ┌─────────────────────────────────┐       │
│   │ 统一管理后台                    │       │
│   │ - 3个主站内容                   │       │
│   │ - 9个蜘蛛池域名                 │       │
│   │ - 1350个动态页面                │       │
│   └─────────────────────────────────┘       │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴────────┬──────────────┐
       │                │              │
       ▼                ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   主站点1    │ │   主站点2    │ │   主站点3    │
│  tghub.com   │ │updatecenter  │ │trendguide    │
│  (Vercel)    │ │  (Vercel)    │ │  (Vercel)    │
│              │ │              │ │              │
│ 跳转域名:    │ │ 跳转域名:    │ │ 跳转域名:    │
│ 1688.com     │ │ 2688.com     │ │ cnfw.com     │
└──────────────┘ └──────────────┘ └──────────────┘
       │                │              │
       └────────────────┴──────────────┘
                        │
              内链引流  │
                        ▼
              ┌────────────────────┐
              │   蜘蛛池域名组     │
              │   9个域名          │
              │   1350个页面       │
              │   3台VPS           │
              └────────────────────┘
                        │
                        ▼
                  搜索引擎爬虫
```

---

## 功能流程

### 1. SEO优化流程

```
蜘蛛池页面 (1350个)
    ↓ 内链指向
主站页面 (3个站点)
    ↓ 提升权重
搜索引擎收录
    ↓ 获得排名
用户访问
```

### 2. 流量流向

```
方式1: 搜索引擎 → 蜘蛛池 → 内链 → 主站
方式2: 搜索引擎 → 主站 → 直接访问
方式3: 推广链接 (跳转域名) → 301 → 主站
```

### 3. 内容管理流程

```
Admin后台创建内容
    ↓
数据库存储
    ↓
┌───────┴────────┐
│                │
▼                ▼
主站调用        蜘蛛池API
(Vercel)        (VPS Nginx)
    ↓                ↓
展示给用户       动态生成HTML
```

---

## 监控和维护

### 日常检查

```bash
# 查看主站统计（Admin后台）
https://adminseohub.xyz/dashboard

# 查看蜘蛛池健康（VPS）
ssh root@95.111.231.110
bash /root/spider-pool-deployment/scripts/monitor.sh 1

# 查看DNS状态
bash /root/spider-pool-deployment/scripts/check-dns.sh
```

### 定期任务

- **每周**：检查SSL证书有效期
- **每月**：查看搜索引擎收录情况
- **每季度**：分析流量数据，优化内容

### 扩展建议

- 添加更多主站点（每个站点可服务不同关键词群）
- 增加蜘蛛池域名（提升SEO效果）
- 优化内链策略（提升页面权重分配）

---

## 故障排查

### 主站无法访问

1. 检查Vercel部署状态
2. 检查DNS解析：`nslookup telegramtghub.com`
3. 查看Vercel项目日志

### 跳转不工作

1. 检查vercel.json配置
2. 确认跳转域名已添加到Vercel项目
3. 清除浏览器缓存测试

### 蜘蛛池无法访问

1. 检查VPS Nginx状态：`systemctl status nginx`
2. 检查DNS解析：`dig autopushnetwork.xyz`
3. 查看Nginx日志：`tail -f /www/wwwlogs/*-error.log`

---

## 成本预估

| 项目 | 数量 | 单价 | 月费用 |
|------|------|------|--------|
| Vercel Hobby | 1账号 | $0 | $0 |
| VPS (5$/月) | 3台 | $5 | $15 |
| 域名 (.com) | 6个 | $10/年 | ~$5 |
| 域名 (.xyz/.site) | 9个 | $5/年 | ~$4 |
| **总计** | - | - | **~$24/月** |

如果使用Vercel Pro计划（推荐）：
- Vercel Pro: $20/月
- **总计**: ~$44/月

---

## 下一步优化

1. **内容优化**
   - 为每个主站创建独特内容
   - 优化蜘蛛池页面质量

2. **SEO优化**
   - 提交sitemap到搜索引擎
   - 建立外链
   - 优化内链结构

3. **性能优化**
   - 启用CDN（CloudFlare）
   - 图片优化
   - 缓存策略

4. **监控增强**
   - Google Analytics
   - Search Console
   - 定期备份数据库

---

## 联系和支持

- 📄 完整架构文档：`MULTI_SITE_ARCHITECTURE.md`
- 🔍 API审计报告：`API_AUDIT_REPORT.md`
- 🚀 VPS部署文档：`spider-pool-deployment/README.md`

**祝部署顺利！** 🎉
