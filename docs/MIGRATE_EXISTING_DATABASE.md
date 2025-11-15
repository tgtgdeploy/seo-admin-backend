# 🔄 现有数据库迁移指南

安全地将现有数据库升级到新版本，保留所有数据。

---

## 📊 您的数据库信息

```bash
数据库名：seo_websites
用户名：seo_user
密码：tgseo123
Schema：public
```

---

## ⚠️ 迁移前准备（重要！）

### Step 1: 备份现有数据库

**必须先备份！**

```bash
# 导出整个数据库
pg_dump -U seo_user -d seo_websites > /tmp/seo_websites_backup_$(date +%Y%m%d_%H%M%S).sql

# 或使用宝塔面板备份
# 数据库 → PostgreSQL → seo_websites → 备份
```

**验证备份**：
```bash
ls -lh /tmp/seo_websites_backup_*.sql
# 应该看到备份文件，大小 > 0
```

---

## 🔍 Step 2: 检查现有表结构

```bash
# 连接数据库
psql -U seo_user -d seo_websites

# 查看所有表
\dt

# 查看 Website 表结构（如果存在）
\d websites

# 退出
\q
```

**记录输出**，稍后可能需要对比。

---

## 🚀 Step 3: 配置项目使用现有数据库

### 3.1 修改 .env.local

```bash
cd /www/wwwroot/seo-admin

# 编辑环境变量
vi .env.local
```

**完整配置**：

```bash
# 使用您现有的数据库（完全匹配您提供的连接串）
DATABASE_URL="postgresql://seo_user:tgseo123@localhost:5432/seo_websites?schema=public"

# 认证配置
NEXTAUTH_SECRET="change-this-to-random-32-chars-min"
NEXTAUTH_URL="http://your-server-ip:3100"

# 加密密钥
SETTINGS_ENCRYPTION_KEY="change-this-to-32-characters-"

# 可选配置
OPENAI_API_KEY=""
VERCEL_API_TOKEN=""
```

保存并退出。

---

## 📦 Step 4: 生成 Prisma Client

```bash
cd /www/wwwroot/seo-admin

# 生成 Prisma Client（基于 schema.prisma）
pnpm run db:generate
```

---

## 🔄 Step 5: 应用数据库迁移（两种方式）

### 方式 A: 自动迁移（推荐，较安全）

```bash
# 创建迁移文件
cd packages/database
pnpx prisma migrate dev --name add_api_key_fields

# Prisma 会：
# 1. 对比当前数据库和 schema.prisma
# 2. 生成 SQL 迁移脚本
# 3. 询问您是否应用（先查看脚本再确认）
```

**如果提示 "是否应用"**，先输入 `n`（不应用），检查生成的 SQL：

```bash
# 查看生成的迁移 SQL
cat packages/database/prisma/migrations/*/migration.sql

# 确认 SQL 安全后，手动应用
pnpx prisma migrate deploy
```

### 方式 B: 手动迁移（更安全，推荐有经验用户）

#### B.1 导出新 Schema SQL

```bash
cd packages/database

# 生成 SQL 脚本（不实际执行）
pnpx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource postgresql://seo_user:tgseo123@localhost:5432/seo_websites?schema=public \
  --script > /tmp/migration.sql

# 查看生成的 SQL
cat /tmp/migration.sql
```

#### B.2 审查 SQL 脚本

**重点检查**：
- 是否有 `DROP TABLE`（删除表）- 如果有，**停止！**
- 是否有 `DROP COLUMN`（删除列）- 如果有，**检查是否必要**
- 主要应该是 `ALTER TABLE ADD COLUMN`（添加列）

#### B.3 手动执行 SQL

```bash
# 测试 SQL（在事务中）
psql -U seo_user -d seo_websites << EOF
BEGIN;
-- 粘贴 migration.sql 的内容
-- 检查输出，如果正常则：
COMMIT;
-- 如果有问题则：
-- ROLLBACK;
EOF
```

---

## ✅ Step 6: 验证迁移结果

### 6.1 检查新字段

```bash
psql -U seo_user -d seo_websites -c "\d websites"
```

**应该看到新增字段**：
- `apiKey` (text)
- `apiEnabled` (boolean)
- `isActive` (boolean)

### 6.2 检查数据完整性

```bash
# 检查表数量
psql -U seo_user -d seo_websites -c "SELECT count(*) FROM websites;"

# 对比备份前的数量，应该一致
```

### 6.3 使用 Prisma Studio 检查

```bash
cd /www/wwwroot/seo-admin
pnpm run db:studio

# 打开 http://localhost:5555
# 检查所有表和数据
```

---

## 🏗️ Step 7: 构建并启动应用

### 7.1 安装依赖（如果还没有）

```bash
cd /www/wwwroot/seo-admin

# 安装 pnpm
npm install -g pnpm@8.15.0

# 安装项目依赖
pnpm install
```

### 7.2 构建项目

```bash
pnpm run build
```

### 7.3 启动应用

**使用宝塔 PM2 管理器**：
1. 软件商店 → PM2 管理器 → 添加项目
2. 配置：
   - 项目名称：`seo-admin`
   - 运行目录：`/www/wwwroot/seo-admin`
   - 启动文件：`node_modules/.bin/next`
   - 启动参数：`start --port 3100`
3. 点击提交 → 启动

**或使用命令行**：
```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## 🧪 Step 8: 测试验证

### 8.1 健康检查

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

### 8.2 登录后台

浏览器访问：`http://your-ip:3100`

使用现有账号登录，检查：
- ✅ 网站列表是否显示
- ✅ 文章数据是否完整
- ✅ 可以正常操作

### 8.3 生成 API Key

1. 进入 Websites 页面
2. 选择一个网站
3. 点击 "Generate API Key"
4. 验证 API Key 生成成功

---

## 🔧 常见问题处理

### 问题 1: "表已存在"错误

**原因**：数据库中已有同名表

**解决**：
```bash
# 检查哪些表已存在
psql -U seo_user -d seo_websites -c "\dt"

# 如果表结构基本一致，使用 db:push（会同步差异）
pnpm run db:push
```

### 问题 2: "列不存在"错误

**原因**：旧表缺少新字段

**解决**：
```bash
# 手动添加缺失的字段
psql -U seo_user -d seo_websites << EOF
ALTER TABLE websites ADD COLUMN IF NOT EXISTS "apiKey" TEXT;
ALTER TABLE websites ADD COLUMN IF NOT EXISTS "apiEnabled" BOOLEAN DEFAULT true;
ALTER TABLE websites ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE websites ADD CONSTRAINT "websites_apiKey_key" UNIQUE ("apiKey");
EOF
```

### 问题 3: 迁移失败，需要回滚

**回滚到备份**：
```bash
# 删除当前数据库
psql -U seo_user -d postgres -c "DROP DATABASE seo_websites;"

# 重新创建
psql -U seo_user -d postgres -c "CREATE DATABASE seo_websites;"

# 恢复备份
psql -U seo_user -d seo_websites < /tmp/seo_websites_backup_YYYYMMDD_HHMMSS.sql
```

### 问题 4: 权限不足

**解决**：
```bash
# 授予用户权限
psql -U postgres -d seo_websites << EOF
GRANT ALL PRIVILEGES ON DATABASE seo_websites TO seo_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO seo_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO seo_user;
EOF
```

---

## 📊 迁移前后对比

### 旧版本 Schema（估计）
```
- websites (基本字段)
- posts
- keywords
- sitemaps
- ... 其他表
```

### 新版本 Schema（新增）
```
websites 表新增字段：
  ✅ apiKey (TEXT, UNIQUE)
  ✅ apiEnabled (BOOLEAN, DEFAULT true)
  ✅ isActive (BOOLEAN, DEFAULT true)

其他表：
  ✅ 保持不变或兼容性更新
```

---

## ✅ 迁移检查清单

迁移完成后，确认以下项目：

- [ ] 数据库已备份
- [ ] 新字段已添加（apiKey, apiEnabled, isActive）
- [ ] 旧数据完整无丢失
- [ ] 应用可以正常启动
- [ ] `/api/health` 返回健康状态
- [ ] 可以登录后台
- [ ] 现有数据正常显示
- [ ] 可以生成 API Key
- [ ] 公开 API 可以调用

---

## 🎯 下一步

迁移成功后：

1. ✅ 为每个网站生成 API Key
2. ✅ 测试公开 API 端点
3. ✅ 配置 Vercel 环境变量
4. ✅ 验证 Vercel 网站可以获取文章

---

## 🆘 需要帮助？

### 查看日志

```bash
# 应用日志
pm2 logs seo-admin

# 数据库日志
tail -f /www/server/postgresql/14/data/pg_log/postgresql-*.log
```

### 回滚方案

如果迁移出现严重问题，可以：
1. 停止应用：`pm2 stop seo-admin`
2. 恢复备份（见"问题 3"）
3. 检查问题原因
4. 重新尝试迁移

---

**迁移预计时间**: 15-30 分钟
**风险等级**: ⭐⭐☆☆☆（已备份则低风险）
**最后更新**: 2024-01-15
