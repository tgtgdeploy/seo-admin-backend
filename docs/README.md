
# SEO Admin 项目文档中心

**更新时间**: 2025-11-15
**文档状态**: ✅ 已整理完毕

欢迎来到 SEO Admin 项目文档中心。所有文档已按类别组织，便于查找和维护。

---

## 📋 快速导航

### 🚀 新手入门
- **[快速开始指南](QUICK_START.md)** - 5分钟快速了解项目
- **[解决方案总结](SOLUTION_SUMMARY.md)** - 项目整体解决方案概述

### 🌐 域名配置
- **[域名配置总结](domains/CORRECT_DOMAIN_SUMMARY.md)** ⭐ **最新** - 16个域名完整配置
- **[域名详细配置](domains/DOMAIN_CONFIGURATION.md)** - Vercel + DNS 详细配置

### 🏗️ 架构设计
- **[多站点架构](architecture/MULTI_SITE_ARCHITECTURE.md)** - 3主站 + 3跳转 + 9蜘蛛池架构
- **[动态蜘蛛池](architecture/DYNAMIC_SPIDER_POOL.md)** - 蜘蛛池动态管理方案
- **[API审计报告](architecture/API_AUDIT_REPORT.md)** - 后端API完整审计

### 📦 部署指南
- **[快速部署指南](deployment/QUICK_DEPLOY_GUIDE.md)** - 完整部署流程
- **[Supabase快速开始](deployment/SUPABASE_QUICK_START.md)** ⭐ **推荐** - 数据库迁移命令
- **[Supabase迁移指南](deployment/SUPABASE_MIGRATION_GUIDE.md)** - 详细迁移步骤
- **[Vercel环境变量](deployment/VERCEL_ENV_CONFIG.md)** - 环境变量完整配置
- **[宝塔SSL快速配置](deployment/BAOTA_SSL_QUICK_FIX.md)** - 5分钟SSL配置
- **[Admin VPS HTTPS修复](deployment/ADMIN_VPS_HTTPS_FIX.md)** - VPS HTTPS配置
- **[VPS部署总结](deployment/VPS_DEPLOYMENT_SUMMARY.md)** - VPS部署要点
- **[宝塔部署指南](deployment/BAOTA_DEPLOYMENT.md)** - 宝塔面板部署
- **[宝塔快速开始](deployment/BAOTA_QUICK_START.md)** - 宝塔快速配置
- **[部署检查清单](deployment/DEPLOY_CHECKLIST.md)** - 部署前检查
- **[迁移现有数据库](deployment/MIGRATE_EXISTING_DATABASE.md)** - 数据库迁移

### 📚 开发指南
- **[国际化指南](guides/I18N-GUIDE.md)** - i18n 实现指南
- **[API集成指南](guides/API_INTEGRATION.md)** - API集成说明

### 🗄️ 已废弃文档
- [多蜘蛛池部署](deprecated/MULTI_SPIDER_DEPLOYMENT.md) - 已废弃
- [蜘蛛池部署](deprecated/SPIDER_POOL_DEPLOYMENT.md) - 已废弃
- [旧域名总结](deprecated/FINAL_DOMAIN_SUMMARY.md) - 已被CORRECT_DOMAIN_SUMMARY.md替代

---

## 📁 文档结构

```
docs/
├── README.md                 # 本文件 - 文档索引
├── QUICK_START.md           # 快速开始
├── SOLUTION_SUMMARY.md      # 解决方案总结
│
├── domains/                 # 域名配置
│   ├── CORRECT_DOMAIN_SUMMARY.md      # ⭐ 最新域名配置（16个）
│   └── DOMAIN_CONFIGURATION.md        # 域名详细配置
│
├── architecture/            # 架构设计
│   ├── MULTI_SITE_ARCHITECTURE.md     # 多站点架构
│   ├── DYNAMIC_SPIDER_POOL.md         # 动态蜘蛛池
│   └── API_AUDIT_REPORT.md            # API审计报告
│
├── deployment/              # 部署指南
│   ├── QUICK_DEPLOY_GUIDE.md          # 快速部署
│   ├── SUPABASE_QUICK_START.md        # ⭐ Supabase快速开始
│   ├── SUPABASE_MIGRATION_GUIDE.md    # Supabase迁移
│   ├── VERCEL_ENV_CONFIG.md           # Vercel环境变量
│   ├── BAOTA_SSL_QUICK_FIX.md         # 宝塔SSL配置
│   ├── ADMIN_VPS_HTTPS_FIX.md         # VPS HTTPS修复
│   ├── VPS_DEPLOYMENT_SUMMARY.md      # VPS部署总结
│   ├── BAOTA_DEPLOYMENT.md            # 宝塔部署
│   ├── BAOTA_QUICK_START.md           # 宝塔快速开始
│   ├── DEPLOY_CHECKLIST.md            # 部署检查清单
│   └── MIGRATE_EXISTING_DATABASE.md   # 数据库迁移
│
├── guides/                  # 开发指南
│   ├── I18N-GUIDE.md                  # 国际化指南
│   └── API_INTEGRATION.md             # API集成
│
└── deprecated/              # 已废弃文档
    ├── MULTI_SPIDER_DEPLOYMENT.md
    ├── SPIDER_POOL_DEPLOYMENT.md
    └── FINAL_DOMAIN_SUMMARY.md
```

---

## 🎯 常见任务快速链接

### 初次部署
1. 阅读 **[快速开始](QUICK_START.md)**
2. 查看 **[域名配置总结](domains/CORRECT_DOMAIN_SUMMARY.md)**
3. 按照 **[Supabase快速开始](deployment/SUPABASE_QUICK_START.md)** 配置数据库
4. 使用 **[Vercel环境变量](deployment/VERCEL_ENV_CONFIG.md)** 配置环境
5. 参考 **[快速部署指南](deployment/QUICK_DEPLOY_GUIDE.md)** 完成部署

### 域名配置
1. **[域名配置总结](domains/CORRECT_DOMAIN_SUMMARY.md)** - 查看16个域名完整列表
2. **[域名详细配置](domains/DOMAIN_CONFIGURATION.md)** - DNS + Vercel详细配置

### SSL/HTTPS问题
1. **[宝塔SSL快速配置](deployment/BAOTA_SSL_QUICK_FIX.md)** - 5分钟解决
2. **[Admin VPS HTTPS修复](deployment/ADMIN_VPS_HTTPS_FIX.md)** - VPS HTTPS配置

### 数据库迁移
1. **[Supabase快速开始](deployment/SUPABASE_QUICK_START.md)** - 推荐方案
2. **[Supabase迁移指南](deployment/SUPABASE_MIGRATION_GUIDE.md)** - 详细步骤
3. **[迁移现有数据库](deployment/MIGRATE_EXISTING_DATABASE.md)** - 现有数据迁移

### 架构理解
1. **[多站点架构](architecture/MULTI_SITE_ARCHITECTURE.md)** - 整体架构设计
2. **[动态蜘蛛池](architecture/DYNAMIC_SPIDER_POOL.md)** - 蜘蛛池管理
3. **[API审计报告](architecture/API_AUDIT_REPORT.md)** - API功能说明

---

## 📊 项目概览

### 域名配置（16个）

**主站点（3个）**:
- telegramtghub.com
- telegramupdatecenter.com
- telegramtrendguide.com

**跳转页（3个）**:
- globalinsighthub.xyz → 主站
- infostreammedia.xyz → 主站
- adminapihub.xyz → 主站

**管理后台（1个）**:
- **adminseohub.xyz** ⭐ 重要！

**蜘蛛池（9个）**:
- **VPS1** (95.111.231.110): autopushnetwork.xyz, contentpoolzone.site, crawlboostnet.xyz
- **VPS2** (37.60.254.52): crawlenginepro.xyz, linkpushmatrix.site, rankspiderchain.xyz
- **VPS3** (75.119.154.120): seohubnetwork.xyz, spidertrackzone.xyz, trafficboostflow.site

### 技术栈

- **前端**: Next.js 14 (App Router), React 18, TailwindCSS
- **数据库**: Supabase (PostgreSQL), Prisma ORM
- **部署**: Vercel (主站 + Admin), VPS (蜘蛛池)
- **认证**: NextAuth.js
- **国际化**: 6种语言 (en, zh, th, bm, ko, ja)
- **VPS**: Nginx反向代理, Let's Encrypt SSL

---

## 🔄 文档更新记录

### 2025-11-15
- ✅ 整理所有MD文档到docs目录
- ✅ 创建清晰的文件夹结构 (domains/ architecture/ deployment/ guides/ deprecated/)
- ✅ 更新域名配置文档（16个域名）
- ✅ 移动过时文档到deprecated目录
- ✅ 创建主索引文件
- ✅ 统一文档命名规范

### 重要更新
- ⭐ 管理后台域名: **adminseohub.xyz** (不是 adminapihub.xyz)
- ⭐ adminapihub.xyz 是跳转页，不是管理后台
- ⭐ 数据库已迁移到 Supabase
- ⭐ 新增第3个跳转域名

---

## 💡 文档维护规范

### 新增文档时
1. **确定文档类别**：域名配置/架构设计/部署指南/开发指南
2. **放到对应文件夹**：domains/ architecture/ deployment/ guides/
3. **更新本README.md**：在对应章节添加链接
4. **使用清晰文件名**：全大写+下划线，例如：FEATURE_GUIDE.md
5. **文档顶部注明**：创建时间和用途说明

### 更新现有文档时
1. 在文档顶部更新"更新时间"
2. 如果内容大幅变更，在文档中标注"更新说明"
3. 如果替代了旧文档，将旧文档移到deprecated/

### 废弃文档时
1. 移动到 `deprecated/` 文件夹
2. 在文档顶部添加醒目的废弃说明
3. 指向新的替代文档链接
4. 在本README中更新状态

### 文档命名规范
- **英文全大写+下划线**：DOMAIN_CONFIGURATION.md
- **简洁明确**：说明文档用途
- **避免版本号**：用文件夹区分（deprecated/ 而不是 V1_GUIDE.md）

---

## 📞 获取帮助

如果文档中有不清楚的地方：

1. **快速入门** → [快速开始](QUICK_START.md)
2. **域名问题** → [域名配置总结](domains/CORRECT_DOMAIN_SUMMARY.md)
3. **部署问题** → [Supabase快速开始](deployment/SUPABASE_QUICK_START.md)
4. **架构问题** → [多站点架构](architecture/MULTI_SITE_ARCHITECTURE.md)
5. **历史文档** → [已废弃文档](deprecated/)

---

## 🔗 外部资源

### Spider Pool 部署包
项目根目录下的 `spider-pool-deployment/` 包含：
- Nginx配置文件（9个域名）
- 自动化部署脚本
- SSL证书申请脚本
- 健康监控脚本

参考：`spider-pool-deployment/docs/QUICK_START.md`

### 数据库相关
- Supabase Dashboard: https://supabase.com/dashboard/project/bsuvzqihxbgoclfvgbhx
- 数据库包说明: `packages/database/VERCEL-SYNC-README.md`

---

**文档中心状态**: ✅ 已整理完毕，结构清晰
**文档总数**: 20+ 文档
**最后整理**: 2025-11-15
**维护者**: SEO Admin Team
