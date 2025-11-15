# 🚀 一键自动化部署指南

使用自动化脚本快速部署 SEO Admin，只需 3 步！

---

## ⚡ 快速开始（3 步完成）

### Step 1: 拉取代码

```bash
cd /www/wwwroot
git clone https://github.com/tgtgdeploy/seo-admin-backend.git seo-admin
cd seo-admin
```

### Step 2: 修改配置（重要！）

编辑部署脚本，修改配置区域：

```bash
vi deploy.sh
```

**找到这几行并修改**（按 `i` 进入编辑模式）：

```bash
#############################################
# 配置区域 - 请修改这里的值
#############################################

# 数据库配置（根据您的实际配置修改）
DB_USER="seo_user"
DB_PASSWORD="tgseo123"
DB_NAME="seo_websites"
DB_HOST="localhost"
DB_PORT="5432"

# 服务器配置（重要！必须修改）
SERVER_IP="123.45.67.89"  # ⚠️ 改为您的实际 IP

# 或使用域名（去掉注释）
# SERVER_DOMAIN="admin.yourdomain.com"

# 应用配置（通常不需要改）
APP_PORT="3100"
APP_DIR="/www/wwwroot/seo-admin"

# 是否备份数据库（推荐保持 yes）
BACKUP_DB="yes"
BACKUP_DIR="/tmp"
```

**保存并退出**：按 `Esc`，输入 `:wq`，按 `Enter`

### Step 3: 运行部署脚本

```bash
# 确保脚本可执行
chmod +x deploy.sh

# 运行部署（需要 10-15 分钟）
./deploy.sh
```

**脚本会自动完成**：
- ✅ 检查前置条件
- ✅ 备份数据库
- ✅ 配置环境变量
- ✅ 安装依赖
- ✅ 数据库迁移
- ✅ 构建项目
- ✅ 启动应用
- ✅ 验证部署

---

## 📊 脚本执行过程

运行后您会看到：

```
ℹ ===================================
ℹ   SEO Admin 自动化部署脚本
ℹ ===================================

ℹ 配置信息:
  - 数据库: seo_websites@localhost:5432
  - 应用端口: 3100
  - 安装目录: /www/wwwroot/seo-admin
  - 访问地址: http://123.45.67.89:3100

是否继续部署？(y/n)
```

**输入 `y` 继续**

---

## ✅ 部署成功标志

看到以下输出表示成功：

```
✓ ===================================
✓   SEO Admin 部署成功！
✓ ===================================

ℹ 访问地址:
  - 后台管理: http://your-ip:3100
  - 健康检查: http://your-ip:3100/api/health
  - 公开 API: http://your-ip:3100/api/public/posts

ℹ 默认账号:
  - 邮箱: admin@example.com
  - 密码: 查看 packages/database/prisma/seed.ts

ℹ 常用命令:
  - 查看日志: pm2 logs seo-admin
  - 重启应用: pm2 restart seo-admin
  - 查看状态: pm2 list
  - 停止应用: pm2 stop seo-admin

🎉 部署流程全部完成！
```

---

## 🧪 验证部署

### 1. 检查服务状态

```bash
pm2 list
```

应该看到 `seo-admin` 状态为 `online`

### 2. 测试健康检查

```bash
curl http://localhost:3100/api/health
```

应该返回：
```json
{
  "status": "healthy",
  "database": "connected",
  "stats": {
    "websites": 数量,
    "publishedPosts": 数量
  }
}
```

### 3. 浏览器访问

打开：`http://您的IP:3100`

应该看到登录页面！

---

## 🔧 常用命令

### 查看日志

```bash
# 实时日志
pm2 logs seo-admin

# 最近 100 行
pm2 logs seo-admin --lines 100

# 只看错误
pm2 logs seo-admin --err
```

### 重启应用

```bash
pm2 restart seo-admin
```

### 停止应用

```bash
pm2 stop seo-admin
```

### 查看详细信息

```bash
pm2 show seo-admin
```

### 监控资源

```bash
pm2 monit
```

---

## 🔄 重新部署（更新代码）

```bash
cd /www/wwwroot/seo-admin

# 拉取最新代码
git pull

# 重新运行部署脚本
./deploy.sh
```

---

## 🚨 遇到问题？

### 问题 1: 权限不足

```bash
# 添加执行权限
chmod +x deploy.sh

# 或使用 root 运行
sudo ./deploy.sh
```

### 问题 2: 数据库连接失败

**检查配置**：
```bash
# 测试数据库连接
psql -U seo_user -d seo_websites -h localhost

# 如果失败，检查 deploy.sh 中的数据库配置
```

### 问题 3: 端口被占用

```bash
# 检查端口
netstat -tuln | grep 3100

# 杀死占用进程
lsof -ti:3100 | xargs kill -9

# 重新运行脚本
./deploy.sh
```

### 问题 4: 构建失败

**查看详细日志**：
```bash
pm2 logs seo-admin --err --lines 50
```

**常见原因**：
- 内存不足 → 升级服务器或添加 swap
- Node 版本不对 → 确保使用 Node 20+
- 依赖安装失败 → 删除 node_modules 重新安装

**解决方案**：
```bash
# 清理并重试
rm -rf node_modules .next
pnpm install
pnpm run build
```

---

## 📝 脚本功能说明

### 自动化内容

| 功能 | 说明 |
|------|------|
| ✅ 前置检查 | 检查 Node.js、PostgreSQL、PM2 等 |
| ✅ 数据库备份 | 自动备份到 /tmp 目录 |
| ✅ 环境配置 | 自动生成随机密钥 |
| ✅ 依赖安装 | pnpm install |
| ✅ 数据库迁移 | Prisma migrate |
| ✅ 项目构建 | Next.js build |
| ✅ 应用启动 | PM2 启动 |
| ✅ 健康检查 | 自动验证部署 |

### 手动配置项

只需要修改 `deploy.sh` 中的：
- `SERVER_IP` - 您的服务器 IP（必须）
- `DB_PASSWORD` - 数据库密码（如果不同）
- `DB_NAME` - 数据库名（如果不同）

其他都自动处理！

---

## 🎯 下一步

部署成功后：

1. **访问后台**
   - URL: `http://您的IP:3100`
   - 登录账号

2. **生成 API Key**
   - Websites → 选择网站 → Generate API Key
   - 复制 API Key

3. **配置 Vercel**
   - 在 Vercel 项目添加环境变量：
     ```bash
     NEXT_PUBLIC_ADMIN_API_URL=http://您的IP:3100
     ADMIN_API_KEY=sk_live_xxxxx
     NEXT_PUBLIC_SITE_DOMAIN=your-site.vercel.app
     ```

4. **发布文章**
   - Posts → New Post → 填写内容 → Status: Published → Save

5. **测试 Vercel 网站**
   - 访问 `https://your-site.vercel.app/blog`
   - 应该能看到文章列表！

---

## 📚 相关文档

- **完整部署指南**: `DEPLOY_CHECKLIST.md`
- **宝塔快速部署**: `BAOTA_QUICK_START.md`
- **API 集成文档**: `docs/API_INTEGRATION.md`
- **数据库迁移**: `docs/MIGRATE_EXISTING_DATABASE.md`

---

## 🔒 安全建议

部署完成后，建议：

1. **修改默认密码**
2. **配置 Nginx 反向代理**
3. **启用 HTTPS（Let's Encrypt）**
4. **设置防火墙规则**
5. **定期备份数据库**

---

## 💡 提示

- 脚本会自动生成随机密钥（NEXTAUTH_SECRET、SETTINGS_ENCRYPTION_KEY）
- 数据库会自动备份到 `/tmp/seo_websites_backup_*.sql`
- 所有步骤都有彩色输出和进度提示
- 遇到错误会自动停止并显示错误信息

---

**部署时间**: 10-15 分钟
**难度等级**: ⭐☆☆☆☆（最简单）
**适用场景**: 宝塔面板 + 现有数据库

**开始部署吧！** 🚀
