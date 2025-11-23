# 部署脚本使用指南

> 生成时间: 2025-11-23
> 适用于: SEO Admin 后台系统

---

## 📋 脚本总览

| 脚本 | 位置 | 使用场景 |
|------|------|----------|
| `quick-deploy.sh` | 本地 | 快速提交并推送代码到 GitHub |
| `deploy-from-local.sh` | 本地 | 从本地一键部署到服务器（需配置 SSH） |
| `deploy-production.sh` | 服务器 | 在服务器上拉取最新代码并部署 |
| `SERVER_DEPLOY.sh` | 服务器 | 完整的服务器部署（包含健康检查） |
| `start.sh` | 服务器 | 启动应用（PM2） |

---

## 🚀 方案一：本地推送 + 服务器部署（推荐）

### 步骤1: 本地推送代码

```bash
# 在项目根目录执行
bash scripts/deploy/quick-deploy.sh "feat: 添加新功能"
```

**自动完成**：
- ✅ git add .
- ✅ git commit -m "提交信息"
- ✅ git push origin main

### 步骤2: 服务器部署

**选项 A - 登录服务器执行**：
```bash
# SSH 登录服务器
ssh root@your-server-ip

# 切换到项目目录
cd /www/wwwroot/seo-admin

# 执行部署脚本
bash scripts/deploy/deploy-production.sh
```

**选项 B - 远程执行（无需登录）**：
```bash
# 在本地直接远程执行
ssh root@your-server-ip 'cd /www/wwwroot/seo-admin && bash scripts/deploy/deploy-production.sh'
```

---

## ⚡ 方案二：一键自动部署（需配置）

### 前提条件

1. **配置 SSH 免密登录**（推荐）

```bash
# 在本地生成 SSH 密钥（如果没有）
ssh-keygen -t rsa -b 4096

# 复制公钥到服务器
ssh-copy-id root@your-server-ip

# 测试免密登录
ssh root@your-server-ip "echo '连接成功'"
```

2. **编辑部署脚本配置**

```bash
# 编辑 scripts/deploy/deploy-from-local.sh
vim scripts/deploy/deploy-from-local.sh

# 修改以下配置
SERVER_USER="root"                      # 服务器用户名
SERVER_HOST="123.45.67.89"              # 服务器 IP 或域名
SERVER_PROJECT_PATH="/www/wwwroot/seo-admin"  # 项目路径
```

### 使用方法

```bash
# 一键部署（自动提交、推送、远程部署）
bash scripts/deploy/deploy-from-local.sh
```

**自动完成**：
- ✅ 检查本地修改
- ✅ 提交并推送到 GitHub
- ✅ SSH 连接服务器
- ✅ 拉取最新代码
- ✅ 安装依赖
- ✅ 生成 Prisma Client
- ✅ 构建项目
- ✅ 重启 PM2 进程
- ✅ 显示日志

---

## 🔧 方案三：仅服务器部署

**场景**：代码已经推送到 GitHub，只需要服务器更新

### 使用 deploy-production.sh（快速）

```bash
# 登录服务器
ssh root@your-server-ip

# 切换目录
cd /www/wwwroot/seo-admin

# 快速部署
bash scripts/deploy/deploy-production.sh
```

**执行步骤**：
1. 停止 PM2 进程
2. 拉取最新代码
3. 清理 Prisma 缓存
4. 重新生成 Prisma Client
5. 安装/更新依赖
6. 构建生产版本
7. 重启 PM2 进程

### 使用 SERVER_DEPLOY.sh（完整）

```bash
# 登录服务器
cd /www/wwwroot/seo-admin

# 完整部署（包含健康检查）
bash scripts/deploy/SERVER_DEPLOY.sh
```

**额外功能**：
- 📊 显示 Git 状态
- 💾 自动备份本地修改（stash）
- 🏥 健康检查
- 📝 显示最新日志

---

## 📊 部署流程对比

| 方案 | 操作步数 | 自动化程度 | 需要配置 | 推荐场景 |
|------|---------|-----------|---------|---------|
| **方案一** | 2步 | ⭐⭐⭐ | 无 | 日常开发 |
| **方案二** | 1步 | ⭐⭐⭐⭐⭐ | SSH密钥 | 频繁部署 |
| **方案三** | 1步 | ⭐⭐ | 无 | 代码已推送 |

---

## 🎯 常用命令速查

### 本地开发

```bash
# 开发服务器
pnpm dev

# 构建
pnpm build

# 推送代码
bash scripts/deploy/quick-deploy.sh "提交信息"
```

### 服务器管理

```bash
# 部署
bash scripts/deploy/deploy-production.sh

# 查看 PM2 状态
pm2 list

# 查看日志
pm2 logs seo-admin

# 重启应用
pm2 restart seo-admin

# 停止应用
pm2 stop seo-admin

# 启动应用
pm2 start ecosystem.config.js
```

### 数据库管理

```bash
# 生成 Prisma Client
cd packages/database
pnpm db:generate

# 推送 Schema 到数据库
pnpm db:push

# 打开 Prisma Studio
pnpm db:studio
```

---

## ⚠️ 注意事项

### 1. 环境变量

确保服务器上有正确的 `.env.local` 文件：

```bash
# 检查环境变量文件
ls -la /www/wwwroot/seo-admin/.env.local

# 如果没有，从示例创建
cp .env.example .env.local
vim .env.local  # 填写真实配置
```

### 2. PM2 配置

确保 PM2 已正确安装和配置：

```bash
# 检查 PM2
pm2 -v

# 查看当前进程
pm2 list

# 如果没有进程，首次启动
cd /www/wwwroot/seo-admin
pm2 start ecosystem.config.js
pm2 save
```

### 3. 权限问题

如果遇到权限错误：

```bash
# 修复文件权限
cd /www/wwwroot/seo-admin
chown -R www:www .

# 修复脚本执行权限
chmod +x scripts/deploy/*.sh
```

### 4. 端口占用

如果端口 3100 被占用：

```bash
# 查找占用端口的进程
lsof -i :3100

# 或使用 netstat
netstat -tuln | grep 3100

# 停止占用的进程
pm2 stop seo-admin
```

---

## 🔍 故障排查

### 部署失败

```bash
# 1. 查看 PM2 错误日志
pm2 logs seo-admin --err --lines 50

# 2. 查看所有日志
pm2 logs seo-admin --lines 100

# 3. 重启并查看
pm2 restart seo-admin
pm2 logs seo-admin
```

### Git 拉取失败

```bash
# 检查 Git 状态
git status

# 放弃本地修改
git reset --hard HEAD

# 重新拉取
git pull origin main
```

### 构建失败

```bash
# 清理缓存重新构建
rm -rf .next
rm -rf node_modules
pnpm install
pnpm build
```

### Prisma 问题

```bash
# 清理 Prisma 缓存
rm -rf node_modules/@prisma
rm -rf node_modules/.prisma
rm -rf packages/database/node_modules/@prisma

# 重新生成
cd packages/database
pnpm db:generate
cd ../..
pnpm build
```

---

## 📚 相关文档

- [宝塔部署教程](../../BAOTA-DEPLOYMENT.md)
- [配置审查报告](../../CONFIG-AUDIT-REPORT.md)
- [故障排查指南](../getting-started/TROUBLESHOOT.md)
- [快速开始](../getting-started/QUICK_START.md)

---

生成时间: 2025-11-23
维护者: Claude Code
版本: 1.0.0
