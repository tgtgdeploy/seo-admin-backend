# Supabase快速迁移命令

## 你的Supabase信息

```bash
# 项目ID
bsuvzqihxbgoclfvgbhx

# 数据库连接字符串
DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"

# Dashboard地址
https://supabase.com/dashboard/project/bsuvzqihxbgoclfvgbhx
```

---

## 迁移步骤（复制粘贴即可）

### 步骤1：推送数据库Schema

```bash
# 进入数据库目录
cd /home/ubuntu/WebstormProjects/seo-admin/packages/database

# 设置Supabase连接字符串
export DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"

# 推送Schema到Supabase
npm run db:push
```

**预期输出**：
```
✔ Generated Prisma Client
✔ Database synchronized with Prisma schema
```

---

### 步骤2：初始化3个主站点

```bash
# 确保还在 packages/database 目录
npm run main-sites:init
```

**预期输出**：
```
🚀 开始初始化主站点...

✓ 创建网站: Telegram Hub (telegramtghub.com)
✓ 创建网站: Telegram Update Center (telegramupdatecenter.com)
✓ 创建网站: Telegram Trend Guide (telegramtrendguide.com)

✅ 初始化完成！
总网站数: 3
总域名数: 6
```

---

### 步骤3：（可选）初始化蜘蛛池

```bash
# 如果需要蜘蛛池功能
npm run spider-pool:init
```

**预期输出**：
```
🚀 开始初始化蜘蛛池...
✓ 创建9个蜘蛛池域名
✓ 生成1350个页面
```

---

## Vercel环境变量更新

### Admin后台项目

1. 打开：https://vercel.com/dashboard
2. 选择Admin项目
3. Settings → Environment Variables
4. 找到 `DATABASE_URL`，点击编辑
5. 更新为：
   ```
   postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres
   ```
6. 勾选：Production, Preview, Development
7. 点击 Save

### 主站1项目（telegramtghub.com）

重复上述步骤，更新 `DATABASE_URL`

### 主站2项目（telegramupdatecenter.com）

重复上述步骤，更新 `DATABASE_URL`

### 主站3项目（telegramtrendguide.com）

重复上述步骤，更新 `DATABASE_URL`

---

## 重新部署所有项目

### 方法1：Git推送（推荐）

```bash
cd /home/ubuntu/WebstormProjects/seo-admin

# 创建空提交触发部署
git commit --allow-empty -m "chore: 迁移到Supabase数据库"

git push origin main
```

所有项目会自动重新部署。

### 方法2：手动重新部署

每个Vercel项目：
1. Deployments 标签
2. 最新部署右侧 **⋮** 菜单
3. 点击 **Redeploy**

---

## 验证迁移成功

### 1. 检查Supabase Dashboard

访问：https://supabase.com/dashboard/project/bsuvzqihxbgoclfvgbhx

- Table Editor → 应该看到 `Website`, `DomainAlias` 等表
- 点击 `Website` 表 → 应该看到3条记录

### 2. 检查主站访问

```bash
# 测试主站1
curl -I https://telegramtghub.com

# 测试主站2
curl -I https://telegramupdatecenter.com

# 测试主站3
curl -I https://telegramtrendguide.com
```

所有应该返回 `200 OK`，无 "不安全" 警告。

### 3. 检查浏览器

打开每个主站，按 `F12`：

- **Console** 标签：无错误
- **Network** 标签：所有请求状态 200
- 地址栏：显示 🔒 锁图标
- 无 "不安全" 或 "Mixed Content" 警告

---

## 问题排查

### 如果 `npm run db:push` 失败

**错误示例**：`Can't reach database server`

**解决**：
1. 检查连接字符串是否正确
2. 检查Supabase项目是否暂停（免费版7天不活跃会暂停）
3. 访问 Dashboard 唤醒项目

### 如果主站仍显示"不安全"

**步骤**：
1. 确认所有Vercel项目的 `DATABASE_URL` 已更新
2. 确认已重新部署
3. 清除浏览器缓存
4. F12 → Console → 查看具体错误

### 如果数据初始化失败

**错误示例**：`Unique constraint failed`

**原因**：数据已存在

**解决**：
```bash
# 查看Supabase中的数据
# Dashboard → Table Editor → Website 表

# 如果有旧数据，可以清空后重新初始化
# 或者跳过初始化步骤
```

---

## 完成检查清单

- [ ] 已运行 `npm run db:push`（Schema推送成功）
- [ ] 已运行 `npm run main-sites:init`（3个网站创建成功）
- [ ] Admin项目环境变量已更新
- [ ] 主站1环境变量已更新
- [ ] 主站2环境变量已更新
- [ ] 主站3环境变量已更新
- [ ] 所有项目已重新部署
- [ ] 访问 telegramtghub.com 无"不安全"警告
- [ ] 访问 telegramupdatecenter.com 无"不安全"警告
- [ ] 访问 telegramtrendguide.com 无"不安全"警告
- [ ] Supabase Dashboard 可以看到数据

---

## 下一步

迁移完成后：

1. **测试Admin后台功能**
   - 登录 https://adminseohub.xyz
   - 创建测试文章
   - 查看Dashboard统计

2. **配置蜘蛛池**（如果需要）
   - 参考：`spider-pool-deployment/README.md`
   - 部署到3台VPS

3. **SEO优化**
   - 提交Sitemap到搜索引擎
   - 配置Google Analytics
   - 建立外链

---

## 相关文档

- 完整迁移指南：`SUPABASE_MIGRATION_GUIDE.md`
- 环境变量配置：`VERCEL_ENV_CONFIG.md`
- 快速部署指南：`QUICK_DEPLOY_GUIDE.md`
- 多站点架构：`MULTI_SITE_ARCHITECTURE.md`

---

**祝迁移顺利！有问题随时问我。** 🚀
