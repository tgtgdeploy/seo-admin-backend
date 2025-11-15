# Vercel 域名自动同步 - 快速开始

## 🚀 一键同步 Vercel 域名到 Admin

已配置好 3 个项目的 ID，只需设置 API Token 即可自动同步！

---

## 📋 操作步骤

### 步骤 1：获取 Vercel API Token

1. 访问 https://vercel.com/account/tokens
2. 点击 "Create Token"
3. Token Name: `SEO-Admin-Sync`
4. Scope: `Full Access`
5. 复制生成的 Token（格式：`vercel_xxxxx...`）

### 步骤 2：设置环境变量

**方式 A：临时设置（测试用）**
```bash
export VERCEL_API_TOKEN="vercel_你的token"
```

**方式 B：永久设置（推荐）**
```bash
# 编辑 .env.local
cd /home/ubuntu/WebstormProjects/seo-websites-monorepo
nano .env.local

# 在文件末尾添加
VERCEL_API_TOKEN=vercel_你的token

# 如果是团队项目，还需添加
VERCEL_TEAM_ID=team_xxxxx
```

### 步骤 3：测试 API 连接

```bash
cd /home/ubuntu/WebstormProjects/seo-websites-monorepo/packages/database

# 测试连接
dotenv -e ../../.env.local -- npx tsx test-vercel-api.ts
```

**预期输出：**
```
✅ VERCEL_API_TOKEN 已设置
✅ 成功访问所有项目
✅ 显示每个项目的域名列表
```

### 步骤 4：同步域名

```bash
# 运行同步脚本
dotenv -e ../../.env.local -- npx tsx sync-vercel-domains.ts
```

**同步内容：**
- 从 3 个 Vercel 项目读取自定义域名
- 自动过滤 `.vercel.app` 域名
- 创建域名别名记录到 Admin 数据库
- 自动设置默认标签

### 步骤 5：验证结果

```bash
# 查看同步的域名
dotenv -e ../../.env.local -- npx tsx list-domains.ts

# 或在 Admin 后台查看
# http://localhost:3100 → 网站管理 → 域名管理
```

---

## 🎯 已配置的项目

| Project ID | 项目名称 | 对应网站 | 默认主标签 |
|-----------|---------|---------|-----------|
| `prj_aN8JC3AfUyQsnTZVdpO84Pf5SPvH` | website-tg | TG中文纸飞机 | telegram |
| `prj_dGal6NS8cuRCsXBHRysQ4rMUARWH` | website-1 | Demo Website 1 | demo |
| `prj_UCOP3BYbuHIu9QmVjSN70mzH1bFm` | website-2 | Demo Website 2 | demo |

---

## 📝 可用脚本

### 1. test-vercel-api.ts
**用途**: 测试 Vercel API 连接和权限

```bash
dotenv -e ../../.env.local -- npx tsx test-vercel-api.ts
```

**功能**:
- 验证 API Token 有效性
- 检查项目访问权限
- 列出每个项目的域名

### 2. sync-vercel-domains.ts
**用途**: 从 Vercel 同步域名到 Admin

```bash
dotenv -e ../../.env.local -- npx tsx sync-vercel-domains.ts
```

**功能**:
- 自动读取 Vercel 项目域名
- 过滤自定义域名
- 创建域名别名记录
- 设置默认标签

### 3. list-domains.ts
**用途**: 查看 Admin 中的域名配置

```bash
dotenv -e ../../.env.local -- npx tsx list-domains.ts
```

**功能**:
- 显示所有网站
- 列出域名别名
- 显示主/副标签

### 4. add-demo-domains.ts
**用途**: 添加示例域名（不依赖 Vercel API）

```bash
dotenv -e ../../.env.local -- npx tsx add-demo-domains.ts
```

**功能**:
- 为 TG中文纸飞机 添加 4 个示例域名
- 不需要 Vercel API Token

---

## 🔍 常见问题

### Q: API Token 在哪里找？
A: https://vercel.com/account/tokens → Create Token

### Q: 是否需要 Team ID？
A: 只有团队项目需要，个人项目不需要

### Q: 如何修改默认标签？
A: 编辑 `sync-vercel-domains.ts` 中的 `PROJECT_MAPPINGS` 配置，或在 Admin 后台手动修改

### Q: 同步后可以修改标签吗？
A: 可以，在 Admin 后台 → 网站管理 → 域名管理 → 编辑域名

### Q: 会同步 .vercel.app 域名吗？
A: 不会，脚本会自动过滤，只同步自定义域名

### Q: 已存在的域名会被覆盖吗？
A: 不会，脚本会跳过已存在的域名

---

## 🎨 自定义配置

### 修改项目映射

编辑 `sync-vercel-domains.ts`:

```typescript
const PROJECT_MAPPINGS: ProjectMapping[] = [
  {
    vercelProjectId: 'prj_aN8JC3AfUyQsnTZVdpO84Pf5SPvH',
    vercelProjectName: 'website-tg',
    websiteName: 'TG中文纸飞机',
    defaultPrimaryTag: 'telegram',           // 修改默认主标签
    defaultSecondaryTags: ['app', 'guide']   // 修改默认副标签
  },
  // ...
]
```

### 添加新项目

```typescript
{
  vercelProjectId: 'prj_新项目ID',
  vercelProjectName: '新项目名称',
  websiteName: 'Admin中的网站名称',
  defaultPrimaryTag: '主标签',
  defaultSecondaryTags: ['副标签1', '副标签2']
}
```

---

## ✅ 完整操作清单

- [ ] 获取 Vercel API Token
- [ ] 设置 VERCEL_API_TOKEN 环境变量
- [ ] （可选）设置 VERCEL_TEAM_ID（团队项目）
- [ ] 运行 test-vercel-api.ts 测试连接
- [ ] 运行 sync-vercel-domains.ts 同步域名
- [ ] 运行 list-domains.ts 验证结果
- [ ] 在 Admin 后台查看域名配置
- [ ] 根据需要调整标签配置

---

## 📚 相关文档

- [VERCEL-API-SYNC-GUIDE.md](../../VERCEL-API-SYNC-GUIDE.md) - 详细使用指南
- [DOMAIN-SETUP-GUIDE.md](../../DOMAIN-SETUP-GUIDE.md) - 域名配置指南
- [VERCEL-TO-ADMIN-SYNC.md](../../VERCEL-TO-ADMIN-SYNC.md) - 手动同步指南

---

**最后更新**: 2025-01-08
**脚本位置**: `/packages/database/`
