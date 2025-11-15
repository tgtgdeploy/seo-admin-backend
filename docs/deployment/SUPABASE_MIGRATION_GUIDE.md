# Supabase数据库迁移指南

## 项目信息

- Supabase项目ID: `bsuvzqihxbgoclfvgbhx`
- 推荐区域: Singapore (最快连接中国和Vercel)

---

## 为什么迁移到Supabase？

### 当前VPS数据库的问题

```
Vercel主站（HTTPS） → VPS数据库（HTTP, 38.147.178.158:5432）
    ↓ 导致问题：
    ❌ "不安全"警告（Mixed Content）
    ❌ 需要配置SSL证书
    ❌ 端口5432暴露在公网（安全风险）
    ❌ 跨国连接延迟高
    ❌ 需要手动备份
```

### Supabase的优势

```
Vercel主站 ──┐
             ├─→ Supabase数据库（HTTPS自动配置）
Admin后台 ──┘
    ✅ 自动HTTPS（无需配置SSL）
    ✅ 全球CDN（低延迟）
    ✅ 自动备份
    ✅ 免费500MB存储 + 50万次请求/月
    ✅ 无需开放数据库端口
    ✅ Web界面管理
```

---

## 步骤1：获取Supabase连接字符串

### 1.1 登录Supabase Dashboard

访问：https://supabase.com/dashboard/project/bsuvzqihxbgoclfvgbhx

### 1.2 获取数据库连接信息

1. 进入项目页面
2. 左侧菜单点击 **Settings** → **Database**
3. 找到 **Connection string** 部分
4. 选择 **URI** 格式
5. 复制连接字符串（类似下面的格式）：

```
postgresql://postgres:[YOUR-PASSWORD]@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres
```

**重要**：
- `[YOUR-PASSWORD]` 是你创建Supabase项目时设置的数据库密码
- 如果忘记密码，在同一页面点击 **Reset Database Password** 重置

### 1.3 保存连接字符串

创建临时文件保存（本地，不要提交到Git）：

```bash
# /home/ubuntu/WebstormProjects/seo-admin/.env.supabase
DATABASE_URL="postgresql://postgres:你的密码@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
```

---

## 步骤2：推送数据库Schema到Supabase

### 2.1 更新本地环境变量

```bash
cd /home/ubuntu/WebstormProjects/seo-admin

# 临时使用Supabase连接字符串
export DATABASE_URL="postgresql://postgres:你的密码@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
```

### 2.2 推送Schema

```bash
cd packages/database

# 推送Prisma schema到Supabase
npm run db:push
```

**预期输出**：
```
✔ Generated Prisma Client
✔ Database synchronized with Prisma schema

✓ 创建了以下表：
  - User
  - Website
  - DomainAlias
  - Post
  - Keyword
  - KeywordRanking
  - Sitemap
  - SpiderLog
  - SpiderPoolPage
  - SpiderPoolSource
  - SystemSetting
```

### 2.3 验证表创建成功

在Supabase Dashboard查看：

1. 左侧菜单 → **Table Editor**
2. 应该看到所有表已创建
3. 点击任意表查看结构

---

## 步骤3：初始化数据

### 3.1 初始化3个主站点

```bash
cd /home/ubuntu/WebstormProjects/seo-admin/packages/database

# 初始化主站点
npm run main-sites:init
```

**预期输出**：
```
🚀 开始初始化主站点...

✓ 创建网站: Telegram Hub
  - 主域名: telegramtghub.com
  - 跳转域名: telegram1688.com → telegramtghub.com

✓ 创建网站: Telegram Update Center
  - 主域名: telegramupdatecenter.com
  - 跳转域名: telegram2688.com → telegramupdatecenter.com

✓ 创建网站: Telegram Trend Guide
  - 主域名: telegramtrendguide.com
  - 跳转域名: telegramcnfw.com → telegramtrendguide.com

✅ 初始化完成！
总网站数: 3
总域名数: 6 (3个主域名 + 3个跳转)
```

### 3.2 初始化蜘蛛池（可选）

```bash
# 初始化9个蜘蛛池域名和1350个页面
npm run spider-pool:init
```

**预期输出**：
```
🚀 开始初始化蜘蛛池...

✓ 创建蜘蛛池源域名: autopushnetwork.xyz
  - 生成150个页面
✓ 创建蜘蛛池源域名: contentpoolzone.site
  - 生成150个页面
...

✅ 蜘蛛池初始化完成！
总域名: 9
总页面: 1350
```

---

## 步骤4：更新Vercel环境变量

所有Vercel项目都需要更新 `DATABASE_URL`。

### 4.1 Admin后台 (adminseohub.xyz)

1. Vercel Dashboard → Admin项目 → **Settings** → **Environment Variables**

2. 找到 `DATABASE_URL`，点击编辑

3. 更新为Supabase连接串：
   ```
   postgresql://postgres:你的密码@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres
   ```

4. 勾选所有环境：Production, Preview, Development

5. 点击 **Save**

### 4.2 主站1 (telegramtghub.com)

重复上述步骤，更新 `DATABASE_URL`

其他环境变量保持不变：
```bash
NEXTAUTH_URL="https://telegramtghub.com"
NEXTAUTH_SECRET="你的secret"
NEXT_PUBLIC_API_URL="https://adminseohub.xyz"
SITE_ID="seo-website-1"
```

### 4.3 主站2 (telegramupdatecenter.com)

更新 `DATABASE_URL` 为Supabase连接串

其他环境变量：
```bash
NEXTAUTH_URL="https://telegramupdatecenter.com"
NEXTAUTH_SECRET="你的secret"
NEXT_PUBLIC_API_URL="https://adminseohub.xyz"
SITE_ID="seo-website-2"
```

### 4.4 主站3 (telegramtrendguide.com)

更新 `DATABASE_URL` 为Supabase连接串

其他环境变量：
```bash
NEXTAUTH_URL="https://telegramtrendguide.com"
NEXTAUTH_SECRET="你的secret"
NEXT_PUBLIC_API_URL="https://adminseohub.xyz"
SITE_ID="seo-website-tg"
```

---

## 步骤5：重新部署所有Vercel项目

环境变量更新后，需要重新部署才能生效。

### 方法1：通过Vercel Dashboard

每个项目：
1. **Deployments** 标签
2. 找到最新部署
3. 点击右侧 **⋮** 菜单
4. 选择 **Redeploy**
5. 勾选 **Use existing Build Cache**（可选，更快）
6. 点击 **Redeploy**

### 方法2：通过Git推送（推荐）

```bash
cd /home/ubuntu/WebstormProjects/seo-admin

# 创建一个空提交触发部署
git commit --allow-empty -m "chore: 更新数据库连接到Supabase"

git push origin main
```

所有连接到该仓库的Vercel项目会自动重新部署。

---

## 步骤6：验证迁移成功

### 6.1 检查Admin后台

访问：https://adminseohub.xyz

1. 登录后台
2. 进入 **Websites** 页面
3. 应该看到3个网站：
   - Telegram Hub (telegramtghub.com)
   - Telegram Update Center (telegramupdatecenter.com)
   - Telegram Trend Guide (telegramtrendguide.com)

### 6.2 检查主站点

访问每个主站：
- https://telegramtghub.com
- https://telegramupdatecenter.com
- https://telegramtrendguide.com

**确认**：
- ✅ 页面正常加载
- ✅ 无"不安全"警告
- ✅ 地址栏显示 🔒 锁图标
- ✅ API调用成功

### 6.3 检查浏览器Console

打开任意主站，按 `F12` 打开开发者工具：

1. **Console** 标签 - 应该没有错误
2. **Network** 标签 - 刷新页面，查看API请求
   - 所有请求应该是 `https://`
   - 状态码应该是 200
   - 无Mixed Content警告

### 6.4 测试数据库连接

在Supabase Dashboard：

1. **Table Editor** → 选择 `Website` 表
2. 应该看到3条记录
3. **SQL Editor** → 运行测试查询：

```sql
SELECT
  w.name,
  w.domain,
  COUNT(d.id) as domain_count
FROM "Website" w
LEFT JOIN "DomainAlias" d ON d."websiteId" = w.id
GROUP BY w.id, w.name, w.domain;
```

**预期结果**：
```
Telegram Hub              | telegramtghub.com           | 2
Telegram Update Center    | telegramupdatecenter.com    | 2
Telegram Trend Guide      | telegramtrendguide.com      | 2
```

---

## 步骤7：清理VPS数据库（可选）

迁移成功后，VPS上的PostgreSQL可以关闭。

### 7.1 备份旧数据（以防万一）

```bash
# SSH登录VPS
ssh root@38.147.178.158

# 备份数据库
pg_dump -U postgres seo_admin > /root/seo_admin_backup_$(date +%Y%m%d).sql

# 下载到本地
exit
scp root@38.147.178.158:/root/seo_admin_backup_*.sql ~/backups/
```

### 7.2 关闭PostgreSQL（可选）

如果VPS只用于数据库，可以停止PostgreSQL：

```bash
# 宝塔面板
# 软件商店 → PostgreSQL → 停止

# 或命令行
systemctl stop postgresql
systemctl disable postgresql
```

### 7.3 关闭5432端口（安全）

宝塔面板 → **安全** → 删除规则 `5432`

---

## 迁移对比

### 迁移前（VPS数据库）

```
连接字符串:
DATABASE_URL="postgresql://postgres:password@38.147.178.158:5432/seo_admin?sslmode=require"

问题:
❌ "不安全"警告
❌ 需要配置SSL
❌ 端口5432暴露
❌ 手动备份
❌ 跨国延迟高
```

### 迁移后（Supabase）

```
连接字符串:
DATABASE_URL="postgresql://postgres:password@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"

优势:
✅ 自动HTTPS，无"不安全"警告
✅ 无需配置SSL
✅ 无需开放端口
✅ 自动每日备份
✅ 全球CDN，低延迟
✅ Web界面管理
✅ 免费500MB + 50万请求/月
```

---

## 常见问题

### Q1: 迁移会丢失数据吗？

**A**: 不会。我们是创建新数据库并初始化，不会影响VPS上的旧数据。建议迁移成功后再删除旧数据。

### Q2: 免费额度够用吗？

**A**: 对于3个主站 + 9个蜘蛛池域名：
- 数据库大小：预计 < 100MB（远低于500MB限制）
- API请求：预计 < 10万次/月（远低于50万限制）
- 完全够用

超出限制后，Supabase会暂停服务，不会自动收费。

### Q3: 如果Supabase有问题怎么办？

**A**:
1. VPS上的备份仍然保留
2. 可以随时切换回VPS数据库
3. 只需更新环境变量并重新部署

### Q4: Supabase在哪个地区？

**A**: 项目创建时选择的区域。推荐：
- Singapore（新加坡）- 中国访问最快
- Tokyo（东京）- 备选

查看方法：Supabase Dashboard → Settings → General → Region

### Q5: 还会显示"不安全"吗？

**A**: 不会。Supabase使用 `*.supabase.co` 域名，自带SSL证书。所有连接自动HTTPS，浏览器不会警告。

---

## 下一步优化

迁移完成后，可以进一步优化：

### 1. 启用Row Level Security (RLS)

Supabase支持行级安全策略，保护数据：

```sql
-- 示例：只允许认证用户访问
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users"
ON "Post" FOR SELECT
TO authenticated
USING (true);
```

### 2. 配置自动备份

Supabase自动每日备份，但可以手动触发：

Dashboard → **Database** → **Backups** → **Create Backup**

### 3. 监控数据库性能

Dashboard → **Database** → **Query Performance**

查看慢查询并优化。

### 4. 使用Supabase Storage（可选）

如果需要存储图片、文件：

Dashboard → **Storage** → 创建Bucket

---

## 检查清单

迁移完成后确认：

- [ ] Supabase项目已创建
- [ ] 获取到数据库连接字符串
- [ ] Schema推送成功（`npm run db:push`）
- [ ] 主站点初始化成功（3个网站 + 6个域名）
- [ ] 蜘蛛池初始化成功（可选）
- [ ] Admin后台环境变量已更新
- [ ] 主站1环境变量已更新
- [ ] 主站2环境变量已更新
- [ ] 主站3环境变量已更新
- [ ] 所有项目已重新部署
- [ ] Admin后台可以访问，无"不安全"警告
- [ ] 主站1可以访问，无"不安全"警告
- [ ] 主站2可以访问，无"不安全"警告
- [ ] 主站3可以访问，无"不安全"警告
- [ ] 浏览器Console无错误
- [ ] Supabase Dashboard可以看到数据
- [ ] VPS数据库已备份（可选）

---

## 支持

如果迁移过程中遇到问题：

1. 检查Vercel部署日志：Deployments → View Function Logs
2. 检查Supabase日志：Dashboard → Logs → Postgres Logs
3. 提供错误信息，我可以帮你排查

**迁移成功后，"不安全"警告将彻底解决！** 🎉
