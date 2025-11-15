# Vercel环境变量配置清单

## 3个主站需要配置的环境变量

每个Vercel项目都需要配置以下环境变量：

---

## 必需的环境变量

### 1. 数据库连接

```bash
DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
```

**说明**：
- ✅ **推荐使用Supabase**（已配置，上面是实际连接字符串）
  - 自动HTTPS，解决"不安全"警告
  - 全球CDN，低延迟
  - 自动备份
  - 免费500MB存储
- ❌ **不推荐VPS数据库**（已废弃）
  - 需要配置SSL
  - 端口5432暴露风险
  - 跨国延迟高

**Supabase项目信息**：
- 项目ID: `bsuvzqihxbgoclfvgbhx`
- Dashboard: https://supabase.com/dashboard/project/bsuvzqihxbgoclfvgbhx
- 连接字符串格式：`postgresql://postgres:密码@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres`

---

### 2. 认证配置

```bash
# NextAuth URL（每个站点不同）
NEXTAUTH_URL="https://telegramtghub.com"

# NextAuth Secret（所有站点可以相同）
NEXTAUTH_SECRET="your-random-secret-key-here"
```

**生成NEXTAUTH_SECRET**：
```bash
# 方法1：使用openssl
openssl rand -base64 32

# 方法2：在线生成
# 访问：https://generate-secret.vercel.app/32
```

**注意**：
- 主站1：`NEXTAUTH_URL=https://telegramtghub.com`
- 主站2：`NEXTAUTH_URL=https://telegramupdatecenter.com`
- 主站3：`NEXTAUTH_URL=https://telegramtrendguide.com`

---

### 3. Admin后台API地址

```bash
# Admin后台API地址（HTTPS！）
NEXT_PUBLIC_API_URL="https://adminapihub.xyz"

# 或者用于服务端调用
ADMIN_API_URL="https://adminapihub.xyz"
```

**重要**：
- ✅ 必须是 `https://`（不是 `http://`）
- ✅ 不要以 `/` 结尾
- ✅ 域名已从 adminseohub.xyz 更新为 adminapihub.xyz

---

### 4. 站点标识

```bash
# 用于区分不同站点（每个站点不同）
SITE_ID="seo-website-1"
```

**各站点值**：
- 主站1：`SITE_ID=seo-website-1`
- 主站2：`SITE_ID=seo-website-2`
- 主站3：`SITE_ID=seo-website-tg`

---

## 可选的环境变量

### 5. Node环境

```bash
NODE_ENV="production"
```

**说明**：通常Vercel会自动设置，但可以手动确认。

---

### 6. OpenAI配置（如果使用AI功能）

```bash
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4-turbo"
```

**说明**：
- 如果不使用AI功能，可以不配置
- 从Admin后台Settings页面配置也可以

---

### 7. 搜索引擎API（可选）

```bash
# Google Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Bing Webmaster
BING_API_KEY="your-bing-key"

# Baidu Tongji
BAIDU_TONGJI_ID="your-baidu-id"
```

**说明**：这些可以在Admin后台Settings配置，不是必需的。

---

## 如何在Vercel配置环境变量

### 方法1：通过Vercel Dashboard（推荐）

1. 登录Vercel：https://vercel.com

2. 选择项目（例如：seo-website-1）

3. 点击 **Settings** 标签

4. 左侧菜单选择 **Environment Variables**

5. 添加变量：
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://...`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

6. 点击 **Save**

7. 重复添加所有必需变量

8. **重新部署**：
   - 进入 **Deployments** 标签
   - 点击最新部署右侧的 **⋮** 菜单
   - 选择 **Redeploy**

---

### 方法2：通过Vercel CLI

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 进入项目目录
cd /path/to/your/project

# 设置环境变量
vercel env add DATABASE_URL production
# 输入值：postgresql://...

# 查看所有环境变量
vercel env ls
```

---

## 环境变量配置清单

### 主站1 (telegramtghub.com)

```bash
# 必需
DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
NEXTAUTH_URL="https://telegramtghub.com"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="https://adminapihub.xyz"
SITE_ID="seo-website-1"

# 可选
NODE_ENV="production"
```

### 主站2 (telegramupdatecenter.com)

```bash
# 必需
DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
NEXTAUTH_URL="https://telegramupdatecenter.com"
NEXTAUTH_SECRET="your-secret-key"  # 可以和主站1相同
NEXT_PUBLIC_API_URL="https://adminapihub.xyz"
SITE_ID="seo-website-2"

# 可选
NODE_ENV="production"
```

### 主站3 (telegramtrendguide.com)

```bash
# 必需
DATABASE_URL="postgresql://postgres:TaWTI0x1PNOrpLlj@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres"
NEXTAUTH_URL="https://telegramtrendguide.com"
NEXTAUTH_SECRET="your-secret-key"  # 可以和主站1相同
NEXT_PUBLIC_API_URL="https://adminapihub.xyz"
SITE_ID="seo-website-tg"

# 可选
NODE_ENV="production"
```

---

## 验证环境变量

配置完成后，重新部署，然后检查：

### 1. 检查部署日志

Vercel → Deployments → 查看最新部署 → Deployment Logs

确保没有环境变量错误。

### 2. 测试数据库连接

访问主站的API端点：
```
https://telegramtghub.com/api/health
```

应该返回状态正常。

### 3. 测试Admin API调用

打开浏览器开发者工具（F12）→ Network标签

刷新页面，查看API调用：
- ✅ 状态码：200
- ✅ URL：https://adminseohub.xyz/api/...
- ❌ 如果是404/500，检查环境变量

---

## 常见问题

### Q1: 数据库连接失败

**错误**：`connect ECONNREFUSED` 或 `password authentication failed`

**解决**：
1. 检查DATABASE_URL是否正确
2. 确认数据库用户名和密码
3. 确认数据库允许远程连接（宝塔面板→数据库→权限设置）

### Q2: API调用被阻止

**错误**：`Mixed Content` 或 `CORS error`

**解决**：
1. 确保NEXT_PUBLIC_API_URL使用 `https://`
2. Admin后台配置CORS（允许Vercel域名）

### Q3: 认证失败

**错误**：`[next-auth][error]` 或登录后跳回登录页

**解决**：
1. 确认NEXTAUTH_URL正确（必须是实际域名）
2. 确认NEXTAUTH_SECRET已设置
3. 清除浏览器Cookie重试

---

## 使用Supabase的优势

现在使用Supabase托管数据库，无需担心：

- ✅ **无需配置防火墙**：Supabase自动管理访问控制
- ✅ **无需配置SSL**：自动HTTPS连接
- ✅ **无需手动备份**：每日自动备份
- ✅ **全球CDN**：低延迟访问
- ✅ **Web管理界面**：https://supabase.com/dashboard/project/bsuvzqihxbgoclfvgbhx
- ✅ **Admin API域名**：adminapihub.xyz（已从 adminseohub.xyz 更新）

如果需要查看或管理数据：
1. 访问 Supabase Dashboard
2. 左侧菜单 → **Table Editor** 查看数据
3. 左侧菜单 → **SQL Editor** 运行SQL查询
4. 左侧菜单 → **Database** → **Backups** 管理备份

---

## 环境变量优先级

```
1. Vercel Environment Variables（最高优先级）
2. .env.production
3. .env.local
4. .env
5. 代码中的默认值（最低优先级）
```

**重要**：
- ✅ 在Vercel配置环境变量（推荐）
- ❌ 不要提交 `.env` 文件到Git

---

## 检查清单

配置完成后，确认：

- [ ] DATABASE_URL已配置且正确
- [ ] NEXTAUTH_URL已配置（每个站点不同）
- [ ] NEXTAUTH_SECRET已配置
- [ ] NEXT_PUBLIC_API_URL使用HTTPS
- [ ] SITE_ID已配置（每个站点不同）
- [ ] 已重新部署Vercel项目
- [ ] 网站可以正常访问
- [ ] 浏览器无"不安全"警告
- [ ] API调用正常（F12查看Network）

---

需要我帮你检查具体的配置吗？或者有遇到什么错误？
