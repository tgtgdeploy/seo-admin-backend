# 🚀 快速开始：连接 Vercel 网站到 Admin 后台

本指南帮助您在 10 分钟内将三个 Vercel 网站连接到 SEO Admin 后台。

---

## ✅ 前置条件

- [x] SEO Admin 项目已部署到 VPS
- [x] PostgreSQL 数据库已配置
- [x] 三个 Vercel 网站已部署（seo-website-1, seo-website-2, seo-website-tg）
- [x] Admin 后台可访问（如 `https://admin.yourdomain.com:3100`）

---

## 📋 步骤 1: 更新数据库架构

在 SEO Admin 项目目录运行：

```bash
cd /home/ubuntu/WebstormProjects/seo-admin

# 生成 Prisma Client（包含新的 apiKey 字段）
pnpm run db:generate

# 推送 schema 更新到数据库
pnpm run db:push

# 或使用迁移（推荐生产环境）
cd packages/database
pnpx prisma migrate dev --name add_api_key_to_websites
```

---

## 📋 步骤 2: 启动/重启 Admin 后台

### 使用 PM2（推荐）

```bash
# 首次启动
pnpm run build
pm2 start ecosystem.config.js

# 如果已运行，重启
pm2 restart seo-admin
pm2 logs seo-admin
```

### 使用 Docker（可选）

```bash
# 构建镜像
docker build -t seo-admin .

# 运行容器
docker run -d \
  --name seo-admin \
  -p 3100:3100 \
  --env-file .env.local \
  seo-admin
```

### 开发模式

```bash
pnpm run dev
```

---

## 📋 步骤 3: 创建网站并生成 API Key

### 方法 A: 通过浏览器（推荐）

1. 访问 Admin 后台: `http://your-vps-ip:3100`
2. 登录账号（默认: `admin@example.com`）
3. 进入 **Websites** 页面
4. 点击 **Add Website** 创建三个网站：

   | 网站名称 | 域名 |
   |---------|------|
   | SEO Website 1 | seo-website-1.vercel.app |
   | SEO Website 2 | seo-website-2.vercel.app |
   | SEO Website TG | seo-website-tg.vercel.app |

5. 对每个网站，点击 **Generate API Key**
6. 复制 API Key（格式：`sk_live_YOUR_KEY`）

### 方法 B: 使用数据库种子脚本

```bash
# 创建种子脚本（如果还没有）
cd packages/database

# 运行种子数据
pnpm run db:seed
```

### 方法 C: 使用 Prisma Studio

```bash
pnpm run db:studio
# 在浏览器中打开 http://localhost:5555
# 手动创建 Website 记录并生成 API Key
```

---

## 📋 步骤 4: 配置 Vercel 环境变量

对于每个 Vercel 网站（seo-website-1, seo-website-2, seo-website-tg）：

### 4.1 在 Vercel Dashboard 配置

1. 进入 Vercel 项目设置 → Environment Variables
2. 添加以下变量：

```bash
# Admin API 地址（替换为您的实际地址）
NEXT_PUBLIC_ADMIN_API_URL=https://admin.yourdomain.com:3100

# 对应网站的 API Key（从步骤 3 获取）
ADMIN_API_KEY=sk_live_YOUR_API_KEY_HERE

# 网站域名（用于匹配文章）
NEXT_PUBLIC_SITE_DOMAIN=seo-website-1.vercel.app
```

### 4.2 重新部署

```bash
# 触发重新部署以应用环境变量
vercel --prod
```

---

## 📋 步骤 5: 创建测试文章

### 方法 A: 通过 Admin 后台

1. 进入 **Posts** 页面
2. 点击 **New Post**
3. 填写文章信息：
   - **Title**: "测试文章 - SEO Website 1"
   - **Slug**: `test-article-1`
   - **Content**: 任意内容（至少 300 字）
   - **Website**: 选择 "SEO Website 1"
   - **Status**: 选择 **Published**
4. 点击 **Save**

重复创建 3-5 篇文章

### 方法 B: 使用 API

```bash
# 登录获取 session
curl -X POST http://localhost:3100/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'

# 创建文章
curl -X POST http://localhost:3100/api/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "title": "测试文章",
    "slug": "test-article",
    "content": "这是测试内容...",
    "websiteId": "YOUR_WEBSITE_ID",
    "status": "PUBLISHED",
    "metaTitle": "测试文章 - SEO",
    "metaDescription": "这是一篇测试文章"
  }'
```

---

## 📋 步骤 6: 测试 API 连接

### 6.1 测试 Admin API

```bash
# 获取文章列表
curl -X GET 'http://your-vps-ip:3100/api/public/posts?domain=seo-website-1.vercel.app' \
  -H 'x-api-key: sk_live_YOUR_API_KEY_HERE'

# 应该返回 JSON 格式的文章列表
```

### 6.2 测试 Vercel 网站

访问您的 Vercel 网站：
- `https://seo-website-1.vercel.app/blog`
- 应该能看到从 Admin 后台获取的文章列表

---

## 📋 步骤 7: 验证完整流程

### ✅ 检查清单

- [ ] Admin 后台可以正常访问
- [ ] 数据库包含 `apiKey` 字段
- [ ] 三个网站都已创建并有 API Key
- [ ] Vercel 环境变量已配置
- [ ] 至少有 3 篇已发布的文章
- [ ] Vercel 网站能显示文章列表
- [ ] 单篇文章详情页正常工作

---

## 🔧 故障排查

### 问题 1: "Failed to fetch posts"

**检查项**:
```bash
# 1. Admin 后台是否运行
pm2 status

# 2. 端口是否开放
netstat -tuln | grep 3100

# 3. 防火墙是否允许
sudo ufw status
sudo ufw allow 3100

# 4. 测试本地连接
curl http://localhost:3100/api/public/posts?domain=test.com \
  -H 'x-api-key: sk_live_YOUR_KEY'
```

### 问题 2: "返回空数组"

**检查项**:
```bash
# 检查数据库中的文章
pnpm run db:studio

# 确认有 status='PUBLISHED' 的文章
# 确认 websiteId 匹配
```

### 问题 3: "401 Unauthorized"

**原因**: API Key 不正确

**解决**:
```bash
# 重新生成 API Key
curl -X POST http://localhost:3100/api/websites/{websiteId}/api-key \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

---

## 📊 下一步优化

1. **配置自定义域名**: 将 Vercel 网站绑定到自己的域名
2. **启用 HTTPS**: 为 Admin 后台配置 SSL 证书
3. **设置 CDN**: 使用 Cloudflare 加速静态资源
4. **监控日志**: 配置日志收集和告警
5. **备份数据**: 设置数据库自动备份

---

## 📖 相关文档

- [API 集成指南](./API_INTEGRATION.md)
- [部署架构文档](./ARCHITECTURE.md)
- [完整 DevOps 指南](./DEVOPS_GUIDE.md)

---

## 🆘 获取帮助

遇到问题？检查日志：

```bash
# Admin 后台日志
pm2 logs seo-admin

# Nginx 日志（如果使用）
tail -f /var/log/nginx/error.log

# 数据库日志
sudo journalctl -u postgresql

# Vercel 部署日志
vercel logs
```

---

**预计完成时间**: 10-15 分钟
**难度等级**: ⭐⭐☆☆☆ (中等)
