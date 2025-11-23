# 自动部署完整指南

> 从零开始：克隆新仓库 → 配置自动化部署
> 服务器: 38.147.178.158 (宝塔面板)

---

## 🎯 目标

实现：**本地 push 到 GitHub → 服务器自动部署**

---

## 📋 方案对比

| 方案 | 触发方式 | 延迟 | 优点 | 缺点 |
|------|---------|------|------|------|
| **GitHub Webhook** | GitHub push | 即时 | 实时更新、最快 | 需要公网访问 |
| **定时拉取 (Cron)** | 定时任务 | 分钟级 | 简单可靠 | 有延迟 |
| **手动部署** | SSH 执行 | 手动 | 完全可控 | 需要手动操作 |

**推荐**: GitHub Webhook（最快、最自动化）

---

## 🚀 完整部署流程

### 阶段一：服务器初始化

#### 步骤1: 登录服务器

```bash
# 从本地 SSH 登录
ssh root@38.147.178.158
```

#### 步骤2: 下载初始化脚本

**方式 A - 直接从 GitHub 下载**：

```bash
# 下载脚本
cd /tmp
curl -O https://raw.githubusercontent.com/tgtgdeploy/seo-admin-backend/main/scripts/deploy/server-init-setup.sh

# 添加执行权限
chmod +x server-init-setup.sh

# 运行初始化
./server-init-setup.sh
```

**方式 B - 手动克隆项目**：

```bash
# 克隆项目
cd /www/wwwroot
git clone https://github.com/tgtgdeploy/seo-admin-backend.git seo-admin

# 进入目录
cd seo-admin

# 运行初始化脚本
bash scripts/deploy/server-init-setup.sh
```

#### 步骤3: 配置环境变量

初始化脚本会提示你编辑 `.env.local`，填写以下关键配置：

```env
# 数据库（Supabase）
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?schema=public&pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# Supabase Client
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"  # 使用 openssl rand -base64 32 生成
NEXTAUTH_URL="https://adminseohub.xyz"

# 其他配置
SETTINGS_ENCRYPTION_KEY="your-encryption-key"
NODE_ENV="production"
PORT=3100
```

#### 步骤4: 完成初始化

脚本会自动完成：
- ✅ 安装依赖
- ✅ 生成 Prisma Client
- ✅ 构建项目
- ✅ 配置 PM2
- ✅ 启动应用

---

### 阶段二：配置 Nginx 反向代理

#### 在宝塔面板操作：

1. **网站** → 找到你的域名（或添加新站点）
2. **设置** → **反向代理**
3. **添加反向代理**：
   ```
   代理名称: seo-admin
   目标 URL: http://127.0.0.1:3100
   发送域名: $host
   ```
4. **启用缓存**（可选）
5. **保存配置**

#### 测试访问

```bash
# 在服务器上测试
curl http://localhost:3100

# 通过域名访问
curl https://adminseohub.xyz
```

---

### 阶段三：配置自动部署

#### 方案 A: GitHub Webhook（推荐）⭐

**优势**: 实时自动部署，push 后立即生效

##### 1. 配置宝塔 Webhook

**在宝塔面板**：

1. **网站** → 你的域名 → **设置**
2. **Webhook** → **添加**
3. 填写信息：
   ```
   名称: SEO Admin Auto Deploy
   脚本类型: Shell
   脚本内容: （见下方）
   ```

**Webhook 脚本内容**：

```bash
#!/bin/bash
echo "开始部署..."
cd /www/wwwroot/seo-admin
bash scripts/deploy/webhook-deploy.sh
echo "部署完成！"
```

4. **保存**，复制生成的 **Webhook URL**

##### 2. 配置 GitHub Webhook

**在 GitHub 仓库**（`tgtgdeploy/seo-admin-backend`）：

1. **Settings** → **Webhooks** → **Add webhook**
2. 填写信息：
   ```
   Payload URL: [粘贴宝塔的 Webhook URL]
   Content type: application/json
   Secret: （留空或设置密钥）
   ```
3. **Which events would you like to trigger this webhook?**
   - 选择 **Just the push event**
4. **Active**: ✅ 勾选
5. **Add webhook**

##### 3. 测试 Webhook

```bash
# 在本地推送测试
git commit --allow-empty -m "test: 测试 Webhook 自动部署"
git push origin main

# 观察宝塔 Webhook 日志
# 宝塔面板 → Webhook → 查看日志
```

**或在服务器查看部署日志**：

```bash
tail -f /www/wwwroot/seo-admin/webhook-deploy.log
```

---

#### 方案 B: 定时拉取（Cron）

**优势**: 简单可靠，不需要公网 Webhook

##### 在宝塔面板配置：

1. **计划任务** → **添加计划任务**
2. 填写信息：
   ```
   任务类型: Shell脚本
   任务名称: SEO Admin 自动部署
   执行周期: 每30分钟 或 自定义
   脚本内容: （见下方）
   ```

**Cron 脚本内容**：

```bash
#!/bin/bash
cd /www/wwwroot/seo-admin

# 检查是否有更新
git fetch origin main

if git diff HEAD origin/main --quiet; then
    echo "没有更新"
    exit 0
fi

echo "发现更新，开始部署..."
bash scripts/deploy/deploy-production.sh
```

3. **保存**

##### 测试定时任务

在宝塔面板点击 **执行** 按钮测试

---

#### 方案 C: 手动部署

**优势**: 完全可控，适合重要更新

```bash
# 方式1: 在服务器上执行
ssh root@38.147.178.158
cd /www/wwwroot/seo-admin
bash scripts/deploy/deploy-production.sh

# 方式2: 使用全局命令
ssh root@38.147.178.158 "deploy-seo-admin"

# 方式3: 从本地远程执行
ssh root@38.147.178.158 'cd /www/wwwroot/seo-admin && bash scripts/deploy/deploy-production.sh'
```

---

## 📊 完整工作流程

### 使用 Webhook 自动部署

```mermaid
graph LR
    A[本地开发] --> B[git commit]
    B --> C[git push]
    C --> D[GitHub 仓库]
    D --> E[触发 Webhook]
    E --> F[宝塔服务器]
    F --> G[执行部署脚本]
    G --> H[拉取代码]
    H --> I[安装依赖]
    I --> J[构建项目]
    J --> K[重启 PM2]
    K --> L[部署完成]
```

**实际操作**：

```bash
# 在本地开发
vim app/page.tsx

# 提交修改
git add .
git commit -m "feat: 添加新功能"
git push origin main

# 🎉 自动部署！无需其他操作
# 10-30秒后，服务器自动更新
```

---

## 🔍 监控和调试

### 查看部署日志

**Webhook 日志**：

```bash
# 在服务器上
tail -f /www/wwwroot/seo-admin/webhook-deploy.log
```

**宝塔面板日志**：
- 宝塔面板 → **Webhook** → **日志**

**PM2 日志**：

```bash
# 实时日志
pm2 logs seo-admin

# 错误日志
pm2 logs seo-admin --err

# 最近 50 行
pm2 logs seo-admin --lines 50
```

### 查看应用状态

```bash
# PM2 进程列表
pm2 list

# 详细信息
pm2 info seo-admin

# 监控面板
pm2 monit
```

### 健康检查

```bash
# 测试端口
netstat -tuln | grep 3100

# 测试 API
curl http://localhost:3100/api/health

# 测试域名
curl https://adminseohub.xyz
```

---

## ⚠️ 故障排查

### Webhook 未触发

**检查清单**：
- [ ] GitHub Webhook 配置正确
- [ ] Webhook URL 可访问
- [ ] 宝塔防火墙允许
- [ ] GitHub 能访问你的服务器

**查看 GitHub Webhook 日志**：
1. GitHub 仓库 → Settings → Webhooks
2. 点击 Webhook → **Recent Deliveries**
3. 查看请求和响应

### 部署失败

**查看详细错误**：

```bash
# 查看 Webhook 日志
cat /www/wwwroot/seo-admin/webhook-deploy.log

# 查看 PM2 错误
pm2 logs seo-admin --err --lines 100

# 手动执行部署脚本查看错误
cd /www/wwwroot/seo-admin
bash scripts/deploy/deploy-production.sh
```

### Git 拉取失败

```bash
# 重置本地修改
cd /www/wwwroot/seo-admin
git reset --hard HEAD
git pull origin main
```

### PM2 重启失败

```bash
# 删除旧进程
pm2 delete seo-admin

# 重新启动
cd /www/wwwroot/seo-admin
pm2 start ecosystem.config.js
pm2 save
```

---

## 📚 相关文档

- [服务器初始化脚本](../../scripts/deploy/server-init-setup.sh)
- [Webhook 部署脚本](../../scripts/deploy/webhook-deploy.sh)
- [部署脚本使用指南](DEPLOY_SCRIPTS_GUIDE.md)
- [宝塔部署教程](../../BAOTA-DEPLOYMENT.md)

---

## 🎯 快速命令参考

```bash
# === 服务器管理 ===
ssh root@38.147.178.158                    # 登录服务器
cd /www/wwwroot/seo-admin                  # 进入项目
git pull origin main                       # 拉取代码
pm2 restart seo-admin                      # 重启应用
pm2 logs seo-admin                         # 查看日志

# === 部署命令 ===
bash scripts/deploy/deploy-production.sh   # 手动部署
deploy-seo-admin                           # 全局部署命令
tail -f webhook-deploy.log                 # 查看 Webhook 日志

# === 开发命令 ===
pnpm dev                                   # 本地开发
pnpm build                                 # 构建
git push origin main                       # 推送（触发自动部署）
```

---

生成时间: 2025-11-23
服务器: 38.147.178.158
仓库: tgtgdeploy/seo-admin-backend
维护者: Claude Code
版本: 1.0.0
