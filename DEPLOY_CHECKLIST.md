# 📋 SEO Admin 部署检查清单

完成以下步骤后，您的 Vercel 网站将能显示来自 Admin 后台的博文。

---

## ⚡ 快速部署（5 步完成）

### ✅ Step 1: 更新数据库

```bash
cd /home/ubuntu/WebstormProjects/seo-admin

# 安装依赖（如果需要）
pnpm install

# 生成 Prisma Client（包含新的 apiKey 字段）
pnpm run db:generate

# 推送 schema 到数据库
pnpm run db:push

# 验证字段已添加
pnpm run db:studio
# 打开 http://localhost:5555，检查 Website 表是否有 apiKey 列
```

**预期结果**: Website 表新增 `apiKey`, `apiEnabled`, `isActive` 字段

---

### ✅ Step 2: 构建并重启 Admin

```bash
# 构建生产版本
pnpm run build

# 如果使用 PM2
pm2 restart seo-admin
pm2 logs seo-admin --lines 50

# 如果使用 npm/pnpm 直接运行
pnpm run start

# 如果使用 Docker
docker-compose up -d --build
```

**验证**:
```bash
# 测试健康检查
curl http://localhost:3100/api/health

# 应该返回:
# {"status":"healthy","database":"connected",...}
```

---

### ✅ Step 3: 创建网站并生成 API Key

#### 选项 A: 通过浏览器（推荐）

1. 访问: `http://your-vps-ip:3100`
2. 登录（默认账号: `admin@example.com`）
3. 点击 **Websites** → **Add Website**
4. 创建三个网站：

| 名称 | 域名 | 说明 |
|------|------|------|
| SEO Website 1 | seo-website-1.vercel.app | 模板 A |
| SEO Website 2 | seo-website-2.vercel.app | 模板 B |
| SEO Website TG | seo-website-tg.vercel.app | TG 模板 |

5. 对每个网站，点击 **Generate API Key**
6. 复制并保存 API Key（后面要用）

#### 选项 B: 使用 API（高级）

```bash
# 1. 登录获取 token
curl -X POST http://localhost:3100/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'

# 2. 创建网站（重复 3 次）
curl -X POST http://localhost:3100/api/websites \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "name": "SEO Website 1",
    "domain": "seo-website-1.vercel.app",
    "status": "ACTIVE"
  }'

# 3. 生成 API Key（记录 websiteId）
curl -X POST http://localhost:3100/api/websites/{websiteId}/api-key \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**保存输出**: 记录每个网站的 `id` 和 `apiKey`

---

### ✅ Step 4: 配置 Vercel 环境变量

对每个 Vercel 项目（seo-website-1, seo-website-2, seo-website-tg）：

1. 进入 Vercel Dashboard → 选择项目
2. 点击 **Settings** → **Environment Variables**
3. 添加以下变量（**所有环境**：Production, Preview, Development）：

```bash
# Admin API 地址（替换为实际 VPS IP 或域名）
NEXT_PUBLIC_ADMIN_API_URL=http://123.45.67.89:3100

# 网站专属 API Key（从 Step 3 获取）
ADMIN_API_KEY=sk_live_YOUR_API_KEY_HERE

# 网站域名（用于匹配文章，必须与 Admin 中的 domain 一致）
NEXT_PUBLIC_SITE_DOMAIN=seo-website-1.vercel.app
```

**重要**: 每个网站的 `ADMIN_API_KEY` 和 `NEXT_PUBLIC_SITE_DOMAIN` 都不同！

4. 点击 **Deployments** → 最新部署 → **Redeploy**

---

### ✅ Step 5: 创建测试文章

#### 通过 Admin 后台

1. 进入 **Posts** → **New Post**
2. 填写：
   - **Title**: `测试文章 - SEO Website 1`
   - **Slug**: `test-article-1`
   - **Content**: （至少 300 字）
   - **Website**: 选择 `SEO Website 1`
   - **Meta Title**: `测试文章 - SEO 优化`
   - **Meta Description**: `这是一篇测试文章，用于验证 API 集成`
   - **Status**: **Published** ⚠️ 必须选择 Published
3. 点击 **Save**

**重复步骤创建 3-5 篇文章**

---

## 🧪 测试验证

### 1. 测试 Admin API

```bash
# 获取文章列表
curl -X GET 'http://your-vps-ip:3100/api/public/posts?domain=seo-website-1.vercel.app' \
  -H 'x-api-key: sk_live_YOUR_API_KEY_HERE'

# 应该返回 JSON 格式的文章数组
```

**预期输出**:
```json
{
  "posts": [
    {
      "id": "cm...",
      "title": "测试文章 - SEO Website 1",
      "slug": "test-article-1",
      "content": "...",
      ...
    }
  ],
  "pagination": {
    "total": 3,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### 2. 测试 Vercel 网站

访问以下 URL（根据您的项目路由）：

```
https://seo-website-1.vercel.app/blog
https://seo-website-1.vercel.app/blog/test-article-1
```

**预期结果**: 能看到从 Admin 后台获取的文章

### 3. 检查 Vercel 日志

```bash
# 查看部署日志
vercel logs seo-website-1

# 检查是否有 API 调用错误
```

---

## ✅ 完整检查清单

### 数据库配置
- [ ] `pnpm run db:push` 成功执行
- [ ] Website 表包含 `apiKey` 字段
- [ ] 至少创建了 3 个网站记录
- [ ] 每个网站都有 API Key
- [ ] 至少有 3 篇 `status='PUBLISHED'` 的文章

### Admin 后台
- [ ] 构建成功 (`pnpm run build`)
- [ ] 服务运行正常 (端口 3100)
- [ ] 健康检查通过 (`/api/health` 返回 200)
- [ ] 公开 API 可访问 (`/api/public/posts`)
- [ ] 能通过浏览器访问管理界面

### Vercel 配置
- [ ] `NEXT_PUBLIC_ADMIN_API_URL` 已设置
- [ ] `ADMIN_API_KEY` 已设置（每个网站不同）
- [ ] `NEXT_PUBLIC_SITE_DOMAIN` 已设置
- [ ] 环境变量应用到所有环境（Production, Preview, Development）
- [ ] 重新部署已完成

### 功能验证
- [ ] API 返回正确的文章列表
- [ ] Vercel 网站能显示文章
- [ ] 文章详情页正常工作
- [ ] 图片和样式正常加载
- [ ] SEO meta 标签正确显示

---

## 🚨 常见问题解决

### 问题 1: API 返回 401 Unauthorized

**原因**: API Key 不正确或过期

**解决**:
```bash
# 重新生成 API Key
curl -X POST http://localhost:3100/api/websites/{websiteId}/api-key \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# 更新 Vercel 环境变量
vercel env rm ADMIN_API_KEY production
vercel env add ADMIN_API_KEY production
# 输入新的 API Key
```

### 问题 2: API 返回空数组 `{"posts":[]}`

**检查**:
1. 数据库是否有文章？
   ```bash
   pnpm run db:studio
   # 检查 Post 表，确认有 status='PUBLISHED' 的记录
   ```

2. `domain` 参数是否匹配？
   ```bash
   # Admin 中的 Website.domain 必须与请求参数一致
   # 比如: seo-website-1.vercel.app (不要加 https://)
   ```

3. Website 是否激活？
   ```sql
   -- 在 Prisma Studio 检查
   SELECT * FROM websites WHERE domain = 'seo-website-1.vercel.app';
   -- 确保 isActive = true
   ```

### 问题 3: Vercel 网站显示 "Failed to fetch"

**检查**:
1. Admin 后台是否可访问？
   ```bash
   curl http://your-vps-ip:3100/api/health
   ```

2. 防火墙是否开放端口？
   ```bash
   sudo ufw allow 3100
   sudo ufw status
   ```

3. Vercel 环境变量是否正确？
   ```bash
   vercel env ls
   ```

4. 查看 Vercel 函数日志：
   ```bash
   vercel logs --follow
   ```

### 问题 4: CORS 错误

**已处理**: API 已配置 CORS 允许所有域名

如果仍有问题，检查：
- Admin 是否使用 HTTPS（生产环境推荐）
- Vercel 网站是否也使用 HTTPS

### 问题 5: 部署后环境变量不生效

**解决**:
```bash
# 清除构建缓存并重新部署
vercel --force --prod
```

---

## 📊 监控和维护

### 日志查看

```bash
# PM2 日志
pm2 logs seo-admin --lines 100

# 错误日志
pm2 logs seo-admin --err --lines 50

# 实时监控
pm2 monit
```

### 数据库备份

```bash
# 导出数据库
pg_dump -U postgres seo_admin > backup_$(date +%Y%m%d).sql

# 还原数据库
psql -U postgres seo_admin < backup_20240115.sql
```

### API 使用统计

在 Admin 后台查看：
- 总 API 调用次数
- 每个网站的文章数量
- 发布文章的频率

---

## 🎯 下一步优化

### 立即优化
- [ ] 为 Admin 配置域名（如 `admin.yourdomain.com`）
- [ ] 启用 HTTPS（Let's Encrypt）
- [ ] 配置 Nginx 反向代理
- [ ] 设置数据库自动备份

### 性能优化
- [ ] 启用 Redis 缓存
- [ ] 配置 CDN（Cloudflare）
- [ ] 优化数据库查询（添加索引）
- [ ] 使用 Vercel Edge Functions

### 安全加固
- [ ] 定期轮换 API Key
- [ ] 启用 API 访问日志
- [ ] 配置 Rate Limiting
- [ ] 添加 IP 白名单

---

## 📚 相关文档

- [API 集成指南](./docs/API_INTEGRATION.md) - 完整 API 文档
- [快速开始](./docs/QUICK_START.md) - 详细配置步骤
- [解决方案总结](./docs/SOLUTION_SUMMARY.md) - 问题分析和方案

---

## 🎉 完成！

完成以上步骤后，您的架构应该如下：

```
Admin (VPS:3100)  →  PostgreSQL (文章数据)
       ↓ API
   ┌───┴────┬────────┐
   │        │        │
Website-1  Website-2  Website-TG (Vercel)
   ↓        ↓        ↓
  用户看到博文内容
```

**预计完成时间**: 15-20 分钟
**难度**: ⭐⭐☆☆☆

---

**最后更新**: 2024-01-15
**版本**: 1.0.0
