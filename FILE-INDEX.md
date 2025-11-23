# Admin 后台文件索引

> 整理完成时间: 2025-11-23
> 新的文件架构让项目更清晰、更易维护

---

## 📁 目录结构

```
seo-admin/
├── app/                    # Next.js 应用代码
├── packages/               # Monorepo 包
├── scripts/                # 所有脚本工具 (新)
│   ├── deploy/            # 部署脚本
│   ├── database/          # 数据库工具
│   ├── domains/           # 域名管理
│   ├── content/           # 内容生成
│   ├── seo/               # SEO 工具
│   ├── downloads/         # 下载管理
│   └── utils/             # 实用工具
├── docs/                   # 所有文档 (优化)
│   ├── getting-started/   # 入门指南
│   ├── guides/            # 使用手册
│   ├── deployment/        # 部署文档
│   ├── architecture/      # 架构设计
│   ├── domains/           # 域名配置
│   └── deprecated/        # 废弃文档
├── spider-pool-content/    # 蜘蛛池内容模板
├── [配置文件]             # next.config.js, ecosystem.config.js等
└── [文档文件]             # README.md, BAOTA-DEPLOYMENT.md等
```

---

## 🔧 Scripts 目录

### scripts/deploy/ (7个脚本)

| 文件 | 用途 | 使用方法 |
|------|------|---------|
| `deploy.sh` | 通用部署脚本 | `bash scripts/deploy/deploy.sh` |
| `deploy-production.sh` | 生产环境部署 | `bash scripts/deploy/deploy-production.sh` |
| `deploy-all.sh` | 部署所有服务 | `bash scripts/deploy/deploy-all.sh` |
| `deploy-spider-pool.sh` | 部署蜘蛛池 | `bash scripts/deploy/deploy-spider-pool.sh` |
| `deploy-multi-spiders.sh` | 部署多个蜘蛛池 | `bash scripts/deploy/deploy-multi-spiders.sh` |
| `SERVER_DEPLOY.sh` | 服务器部署 | `bash scripts/deploy/SERVER_DEPLOY.sh` |
| `start.sh` | 启动服务 | `bash scripts/deploy/start.sh` |

### scripts/database/ (7个脚本)

| 文件 | 用途 | 使用方法 |
|------|------|---------|
| `check_db.js` | 检查数据库连接和数据 | `node scripts/database/check_db.js` |
| `check-detail.js` | 检查数据详情 | `node scripts/database/check-detail.js` |
| `check-posts.js` | 检查文章数据 | `node scripts/database/check-posts.js` |
| `create_admin.js` | 创建管理员账号 | `node scripts/database/create_admin.js` |
| `setup-complete-system.js` | 完整系统设置 | `node scripts/database/setup-complete-system.js` |
| `fix-prisma.sh` | 修复 Prisma 问题 | `bash scripts/database/fix-prisma.sh` |
| `init-system.sh` | 初始化系统 | `bash scripts/database/init-system.sh` |

### scripts/domains/ (11个脚本)

| 文件 | 用途 | 使用方法 |
|------|------|---------|
| `check-domains.js` | 检查域名配置 | `node scripts/domains/check-domains.js` |
| `check-domaintype.js` | 检查域名类型 | `node scripts/domains/check-domaintype.js` |
| `classify-domains.js` | 分类域名 | `node scripts/domains/classify-domains.js` |
| `cleanup-domain-aliases.js` | 清理域名别名 | `node scripts/domains/cleanup-domain-aliases.js` |
| `fix-domain-aliases.js` | 修复域名别名 | `node scripts/domains/fix-domain-aliases.js` |
| `redistribute-domains.js` | 重新分配域名 | `node scripts/domains/redistribute-domains.js` |
| `setup-domains-final.js` | 最终域名设置 | `node scripts/domains/setup-domains-final.js` |
| `setup-domains.js` | 域名设置 | `node scripts/domains/setup-domains.js` |
| `setup-domains-simple.mjs` | 简单域名设置 | `node scripts/domains/setup-domains-simple.mjs` |
| `verify-domains.js` | 验证域名 | `node scripts/domains/verify-domains.js` |
| `test-all-spider-domains.sh` | 测试蜘蛛池域名 | `bash scripts/domains/test-all-spider-domains.sh` |

### scripts/content/ (8个脚本)

| 文件 | 用途 | 使用方法 |
|------|------|---------|
| `ai-generate-articles.js` | AI 生成文章 | `node scripts/content/ai-generate-articles.js` |
| `ai-optimize-existing-content.js` | AI 优化现有内容 | `node scripts/content/ai-optimize-existing-content.js` |
| `generate-articles.js` | 生成文章 | `node scripts/content/generate-articles.js` |
| `generate-more-articles.js` | 生成更多文章 | `node scripts/content/generate-more-articles.js` |
| `sync-all-posts.js` | 同步所有文章 | `node scripts/content/sync-all-posts.js` |
| `init-spider-pool.js` | 初始化蜘蛛池 | `node scripts/content/init-spider-pool.js` |
| `regenerate-optimized-spider-pools.js` | 重新生成优化蜘蛛池 | `node scripts/content/regenerate-optimized-spider-pools.js` |
| `test-spider-pool.js` | 测试蜘蛛池 | `node scripts/content/test-spider-pool.js` |

### scripts/seo/ (8个脚本)

| 文件 | 用途 | 使用方法 |
|------|------|---------|
| `add-longtail-keywords.js` | 添加长尾关键词 | `node scripts/seo/add-longtail-keywords.js` |
| `check-keywords.js` | 检查关键词 | `node scripts/seo/check-keywords.js` |
| `init-keywords-with-real-data.js` | 初始化关键词数据 | `node scripts/seo/init-keywords-with-real-data.js` |
| `optimize-keywords.js` | 优化关键词 | `node scripts/seo/optimize-keywords.js` |
| `sync-keywords.js` | 同步关键词 | `node scripts/seo/sync-keywords.js` |
| `update-keyword-data.js` | 更新关键词数据 | `node scripts/seo/update-keyword-data.js` |
| `test-seo-health.js` | 测试 SEO 健康 | `node scripts/seo/test-seo-health.js` |
| `submit-to-search-engines.js` | 提交搜索引擎 | `node scripts/seo/submit-to-search-engines.js` |

### scripts/downloads/ (2个脚本)

| 文件 | 用途 | 使用方法 |
|------|------|---------|
| `add-download-links.js` | 添加下载链接 | `node scripts/downloads/add-download-links.js` |
| `update-download-links.js` | 更新下载链接 | `node scripts/downloads/update-download-links.js` |

### scripts/utils/ (2个脚本)

| 文件 | 用途 | 使用方法 |
|------|------|---------|
| `verify-deployment.js` | 验证部署 | `node scripts/utils/verify-deployment.js` |
| `copy-prisma-engines.js` | 复制 Prisma 引擎 | `node scripts/copy-prisma-engines.js` |

---

## 📚 Docs 目录

### docs/getting-started/ (入门指南)

| 文件 | 内容 |
|------|------|
| `README.md` | 项目总览和快速开始 |
| `QUICK_START.md` | 快速开始指南 |
| `TROUBLESHOOT.md` | 故障排查手册 |

### docs/guides/ (使用手册)

| 文件 | 内容 |
|------|------|
| `AI_SEO_QUICK_START.md` | AI SEO 快速开始 |
| `AI_SEO_STRATEGY.md` | AI SEO 策略指南 |
| `AI_TOOLS_USER_GUIDE.md` | AI 工具使用手册 |
| `KEYWORD_DATA_GUIDE.md` | 关键词数据指南 |
| `DOWNLOAD_LINKS_GUIDE.md` | 下载链接管理指南 |
| `API_INTEGRATION.md` | API 集成指南 |
| `I18N-GUIDE.md` | 国际化指南 |

### docs/deployment/ (部署文档)

| 文件 | 内容 |
|------|------|
| `BAOTA_DEPLOYMENT.md` | 宝塔部署完整教程 |
| `BAOTA_QUICK_START.md` | 宝塔快速开始 |
| `BAOTA_SSL_QUICK_FIX.md` | 宝塔 SSL 快速修复 |
| `ADMIN_VPS_HTTPS_FIX.md` | VPS HTTPS 修复 |
| `QUICK_DEPLOY_GUIDE.md` | 快速部署指南 |
| `DEPLOY_CHECKLIST.md` | 部署检查清单 |
| `SUPABASE_MIGRATION_GUIDE.md` | Supabase 迁移指南 |
| `SUPABASE_QUICK_START.md` | Supabase 快速开始 |
| `VERCEL_ENV_CONFIG.md` | Vercel 环境配置 |
| `VPS_DEPLOYMENT_SUMMARY.md` | VPS 部署总结 |
| `MIGRATE_EXISTING_DATABASE.md` | 数据库迁移指南 |

### docs/architecture/ (架构设计)

| 文件 | 内容 |
|------|------|
| `ARCHITECTURE.md` | 系统架构设计 |
| `API_AUDIT_REPORT.md` | API 审查报告 |
| `DYNAMIC_SPIDER_POOL.md` | 动态蜘蛛池架构 |
| `MULTI_SITE_ARCHITECTURE.md` | 多站点架构 |

### docs/domains/ (域名配置)

| 文件 | 内容 |
|------|------|
| `CORRECT_DOMAIN_SUMMARY.md` | 正确的域名总结 |
| `DOMAIN_CONFIGURATION.md` | 域名配置指南 |

### docs/deprecated/ (废弃文档)

| 文件 | 说明 |
|------|------|
| `FINAL_DOMAIN_SUMMARY.md` | 旧的域名总结 |
| `MULTI_SPIDER_DEPLOYMENT.md` | 旧的蜘蛛池部署 |
| `SPIDER_POOL_DEPLOYMENT.md` | 旧的蜘蛛池部署 |
| `SPIDER_POOL_BAOTA_DEPLOY.md` | 旧的宝塔部署 |
| `spider-pool-deployment/` | 旧的部署目录 |
| `DEPLOYMENT.md` | 旧的部署文档 |
| `DEPLOYMENT_GUIDE.md` | 旧的部署指南 |
| `DEPLOY_TO_SERVER.md` | 旧的服务器部署 |

---

## 📄 根目录重要文档

| 文件 | 用途 |
|------|------|
| `README.md` | 项目说明文档 |
| `BAOTA-DEPLOYMENT.md` | **最新** 宝塔部署教程 |
| `ADMIN-DEBUG-SUMMARY.md` | 调试和配置总结 |
| `CONFIG-AUDIT-REPORT.md` | 配置审查报告 |
| `FILE-ORGANIZATION-PLAN.md` | 文件组织计划 |
| `FILE-INDEX.md` | 本文件索引 (你在这里) |
| `ADMIN-FEATURES-ANALYSIS.md` | 功能分析报告 |
| `SEO_OPTIMIZATION_SUMMARY.md` | SEO 优化总结 |
| `QUICK-FIX.md` | 快速修复指南 |

---

## 🎯 常用命令速查

### 开发环境

```bash
# 启动开发服务器
pnpm dev

# 构建项目
pnpm build

# 运行生产环境
pnpm start

# Prisma 相关
pnpm exec prisma studio                    # 打开数据库管理界面
pnpm exec prisma db push                   # 推送 schema 到数据库
pnpm exec prisma generate                  # 生成 Prisma Client
```

### 部署相关

```bash
# 生产环境部署
bash scripts/deploy/deploy-production.sh

# 启动服务
bash scripts/deploy/start.sh

# 验证部署
node scripts/utils/verify-deployment.js
```

### 数据库管理

```bash
# 检查数据库
node scripts/database/check_db.js

# 创建管理员
node scripts/database/create_admin.js

# 完整系统设置
node scripts/database/setup-complete-system.js
```

### SEO 工具

```bash
# 测试 SEO 健康
node scripts/seo/test-seo-health.js

# 提交搜索引擎
node scripts/seo/submit-to-search-engines.js
```

### 内容管理

```bash
# AI 生成文章
node scripts/content/ai-generate-articles.js

# 同步所有文章
node scripts/content/sync-all-posts.js
```

---

## 📊 文件统计

| 类别 | 数量 |
|------|------|
| Shell 脚本 | 10 个 |
| JavaScript 工具 | 34 个 |
| 文档 (docs/) | 32 个 |
| 根目录文档 | 8 个 |
| **总计** | **84 个文件** |

---

## 🔍 查找文件技巧

### 按功能查找

- **部署相关**: 查看 `scripts/deploy/` 或 `docs/deployment/`
- **数据库操作**: 查看 `scripts/database/`
- **域名管理**: 查看 `scripts/domains/` 或 `docs/domains/`
- **内容生成**: 查看 `scripts/content/`
- **SEO 优化**: 查看 `scripts/seo/`
- **使用教程**: 查看 `docs/guides/`

### 按阶段查找

- **新手入门**: `docs/getting-started/`
- **日常使用**: `docs/guides/`
- **部署上线**: `docs/deployment/` + `scripts/deploy/`
- **问题排查**: `docs/getting-started/TROUBLESHOOT.md`

---

## ⚡ 快速链接

### 最常用文档

1. [快速开始](docs/getting-started/QUICK_START.md)
2. [宝塔部署](BAOTA-DEPLOYMENT.md)
3. [配置审查报告](CONFIG-AUDIT-REPORT.md)
4. [故障排查](docs/getting-started/TROUBLESHOOT.md)
5. [API 集成](docs/guides/API_INTEGRATION.md)

### 最常用脚本

1. [部署生产环境](scripts/deploy/deploy-production.sh)
2. [检查数据库](scripts/database/check_db.js)
3. [生成文章](scripts/content/ai-generate-articles.js)
4. [测试 SEO](scripts/seo/test-seo-health.js)

---

## 🔄 更新日志

### 2025-11-23

**文件整理**:
- ✅ 创建标准目录结构
- ✅ 移动 10 个 Shell 脚本到 `scripts/`
- ✅ 移动 34 个 JavaScript 工具到 `scripts/`
- ✅ 移动和整理 32 个文档到 `docs/`
- ✅ 删除重复和废弃文件
- ✅ 创建本索引文档

**改进**:
- 文件组织更清晰
- 更容易找到需要的工具
- 减少根目录混乱
- 统一的目录结构

---

生成时间: 2025-11-23
维护者: Claude Code
版本: 1.0.0
