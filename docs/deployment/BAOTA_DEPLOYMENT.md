# 🎛️ 宝塔面板部署指南 - SEO Admin

完整的宝塔面板部署教程，从零开始部署 SEO Admin 后台。

---

## 📋 前置要求

- ✅ VPS 服务器（1GB+ 内存，推荐 2GB）
- ✅ Ubuntu 20.04+ / CentOS 7+
- ✅ 已安装宝塔面板 7.x+
- ✅ 域名（可选，推荐配置）

---

## 🚀 快速部署（5 步完成）

### Step 1: 安装必要软件

#### 1.1 登录宝塔面板

访问：`http://your-server-ip:8888`

#### 1.2 安装软件

在宝塔面板 → **软件商店**，安装以下软件：

| 软件 | 版本 | 说明 |
|------|------|------|
| **Nginx** | 1.22+ | Web 服务器 |
| **PostgreSQL** | 14+ | 数据库 |
| **PM2 管理器** | 最新版 | Node.js 进程管理 |
| **Node.js 版本管理器** | - | 管理 Node 版本 |

**安装步骤**：
1. 点击 **软件商店**
2. 搜索 "Nginx" → 点击 **安装**
3. 搜索 "PostgreSQL" → 点击 **安装**（选择 14.x 或更高版本）
4. 搜索 "PM2 管理器" → 点击 **安装**
5. 搜索 "Node.js 版本管理器" → 点击 **安装**

#### 1.3 安装 Node.js 20

1. 进入 **软件商店** → **Node.js 版本管理器** → **设置**
2. 点击 **安装 Node.js 版本**
3. 选择 **v20.x.x**（最新 LTS 版本）
4. 等待安装完成

#### 1.4 安装 pnpm

打开 **终端**（宝塔面板 → 终端）：

```bash
npm install -g pnpm@8.15.0
pnpm --version  # 验证安装
```

---

### Step 2: 创建 PostgreSQL 数据库

#### 2.1 创建数据库

1. 进入 **数据库** → **PostgreSQL**
2. 点击 **添加数据库**
3. 填写信息：
   - **数据库名**: `seo_admin`
   - **用户名**: `seo_admin`
   - **密码**: `your_secure_password`（记住这个密码）
4. 点击 **提交**

#### 2.2 记录连接信息

```bash
# 数据库连接 URL（后面要用）
postgresql://seo_admin:your_secure_password@localhost:5432/seo_admin
```

---

### Step 3: 部署项目

#### 3.1 克隆代码

在宝塔 **终端** 中执行：

```bash
# 进入网站目录
cd /www/wwwroot

# 克隆项目
git clone https://github.com/tgtgdeploy/seo-admin-backend.git seo-admin

# 进入项目
cd seo-admin

# 设置 Node 版本（使用宝塔安装的 Node 20）
export PATH="/www/server/nodejs/v20.x.x/bin:$PATH"
```

#### 3.2 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
nano .env.local
```

**编辑 `.env.local`**：

```bash
# 数据库配置（替换为您的实际密码）
DATABASE_URL="postgresql://seo_admin:your_secure_password@localhost:5432/seo_admin"

# 认证配置
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"  # 随机生成
NEXTAUTH_URL="http://your-domain.com:3100"            # 或 http://your-ip:3100

# 加密密钥（32位字符）
SETTINGS_ENCRYPTION_KEY="your-32-character-encryption-key"

# 可选：OpenAI API
OPENAI_API_KEY=""

# 可选：Vercel API
VERCEL_API_TOKEN=""
```

**生成随机密钥**：

```bash
# 生成 NEXTAUTH_SECRET
openssl rand -base64 32

# 生成 SETTINGS_ENCRYPTION_KEY
openssl rand -hex 16
```

保存并退出（Ctrl+X → Y → Enter）

#### 3.3 安装依赖

```bash
# 安装项目依赖
pnpm install

# 可能需要 5-10 分钟
```

#### 3.4 初始化数据库

```bash
# 生成 Prisma Client
pnpm run db:generate

# 推送数据库 schema
pnpm run db:push

# （可选）填充示例数据
pnpm run db:seed
```

#### 3.5 构建项目

```bash
# 构建生产版本
pnpm run build

# 预计 3-5 分钟
```

---

### Step 4: 配置 PM2

#### 4.1 使用宝塔 PM2 管理器

1. 进入宝塔面板 → **软件商店** → **PM2 管理器** → **设置**
2. 点击 **添加项目**
3. 填写配置：

```
项目名称: seo-admin
启动文件: node_modules/.bin/next
运行目录: /www/wwwroot/seo-admin
启动参数: start --port 3100
项目描述: SEO Admin 管理后台
```

4. 点击 **提交**
5. 点击 **启动** 按钮

#### 4.2 验证运行状态

```bash
# 查看进程
pm2 list

# 查看日志
pm2 logs seo-admin

# 应该看到：
# ready - started server on 0.0.0.0:3100
```

#### 4.3 测试访问

```bash
curl http://localhost:3100/api/health
```

应该返回：
```json
{"status":"healthy","database":"connected",...}
```

---

### Step 5: 配置 Nginx 反向代理

#### 5.1 创建网站

1. 进入宝塔面板 → **网站**
2. 点击 **添加站点**
3. 填写：
   - **域名**: `admin.yourdomain.com`（或直接用 IP）
   - **根目录**: `/www/wwwroot/seo-admin`
   - **PHP 版本**: 纯静态
4. 点击 **提交**

#### 5.2 配置反向代理

1. 找到刚创建的网站，点击 **设置**
2. 点击 **反向代理**
3. 点击 **添加反向代理**
4. 填写：

```
代理名称: seo-admin
目标URL: http://127.0.0.1:3100
发送域名: $host
```

5. 点击 **提交**

#### 5.3 高级配置（可选）

点击 **配置文件**，在 `location /` 中添加：

```nginx
location / {
    proxy_pass http://127.0.0.1:3100;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # 超时设置
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

保存配置。

---

### Step 6: 配置防火墙和端口

#### 6.1 开放端口

在宝塔面板 → **安全**：

| 端口 | 说明 | 操作 |
|------|------|------|
| 3100 | Node.js 应用 | 放行（仅内网） |
| 80 | HTTP | 放行 |
| 443 | HTTPS | 放行 |

**建议**：不要对外开放 3100 端口，只通过 Nginx 访问。

#### 6.2 配置 SSL（推荐）

1. 在网站设置中点击 **SSL**
2. 选择 **Let's Encrypt**
3. 勾选域名，点击 **申请**
4. 开启 **强制 HTTPS**

---

### Step 7: 验证部署

#### 7.1 访问测试

打开浏览器访问：
- **HTTP**: `http://admin.yourdomain.com`
- **HTTPS**: `https://admin.yourdomain.com`

应该看到登录页面。

#### 7.2 登录后台

默认账号：
- **邮箱**: `admin@example.com`
- **密码**: 查看 `packages/database/prisma/seed.ts` 中设置的密码

#### 7.3 检查健康状态

访问：`https://admin.yourdomain.com/api/health`

---

## 🔧 常用管理操作

### 查看日志

```bash
# 实时日志
pm2 logs seo-admin --lines 100

# 错误日志
pm2 logs seo-admin --err
```

### 重启应用

**方式一：宝塔面板**
1. 软件商店 → PM2 管理器 → 设置
2. 找到 seo-admin
3. 点击 **重启**

**方式二：命令行**
```bash
pm2 restart seo-admin
```

### 更新代码

```bash
cd /www/wwwroot/seo-admin

# 拉取最新代码
git pull

# 重新安装依赖（如果 package.json 有更新）
pnpm install

# 更新数据库（如果 schema 有更新）
pnpm run db:push

# 重新构建
pnpm run build

# 重启
pm2 restart seo-admin
```

### 备份数据库

**方式一：宝塔面板**
1. 数据库 → PostgreSQL
2. 找到 seo_admin
3. 点击 **备份**

**方式二：命令行**
```bash
# 导出数据库
pg_dump -U seo_admin -d seo_admin > /www/backup/seo-admin-$(date +%Y%m%d).sql

# 还原数据库
psql -U seo_admin -d seo_admin < /www/backup/seo-admin-20240115.sql
```

---

## 📊 性能优化

### 1. 启用 Nginx 缓存

在 Nginx 配置中添加：

```nginx
# 静态文件缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 2. 配置 PM2 自动重启

```bash
pm2 startup
pm2 save
```

### 3. 设置日志轮转

在 PM2 管理器中配置：
- 日志分割大小：10MB
- 保留日志天数：7 天

### 4. 监控资源

安装宝塔 **系统监控** 插件：
- CPU 使用率
- 内存使用率
- 磁盘使用率

---

## 🚨 故障排查

### 问题 1: PM2 启动失败

**检查**：
```bash
# 查看错误日志
pm2 logs seo-admin --err --lines 50

# 常见错误：
# - 端口被占用 → 修改端口或关闭占用进程
# - 数据库连接失败 → 检查 .env.local 中的 DATABASE_URL
# - 模块未安装 → 重新运行 pnpm install
```

**解决**：
```bash
# 检查端口占用
netstat -tuln | grep 3100

# 杀死占用进程
lsof -ti:3100 | xargs kill -9

# 重新启动
pm2 restart seo-admin
```

### 问题 2: 数据库连接失败

**检查 PostgreSQL 状态**：
```bash
# 宝塔面板查看
软件商店 → PostgreSQL → 服务状态

# 或命令行
systemctl status postgresql
```

**检查连接**：
```bash
psql -U seo_admin -d seo_admin -h localhost
# 输入密码
# 成功则显示 seo_admin=#
```

### 问题 3: Nginx 502 错误

**原因**：Node.js 应用未运行

**解决**：
```bash
# 检查 PM2 状态
pm2 list

# 如果显示 stopped，重启
pm2 restart seo-admin

# 检查 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

### 问题 4: 内存不足

**查看内存**：
```bash
free -h
```

**优化方案**：
```bash
# 限制 PM2 内存使用
pm2 delete seo-admin
pm2 start ecosystem.config.js --max-memory-restart 800M

# 或升级 VPS 内存
```

---

## 🔐 安全建议

### 1. 修改默认密码

登录后立即修改管理员密码：
- 进入 **Settings**
- 修改密码
- 退出重新登录

### 2. 配置防火墙

```bash
# 只允许特定 IP 访问 3100 端口
# 在宝塔安全设置中添加 IP 白名单
```

### 3. 定期更新

```bash
# 每周检查更新
cd /www/wwwroot/seo-admin
git fetch
git log HEAD..origin/main  # 查看新提交

# 有更新则执行
git pull
pnpm install
pnpm run build
pm2 restart seo-admin
```

### 4. 启用访问日志

在 Nginx 网站设置中：
- 访问日志：开启
- 错误日志：开启

---

## 📈 监控和维护

### 设置自动备份

1. 宝塔面板 → **计划任务**
2. 点击 **添加任务**
3. 选择 **备份数据库**
4. 选择 `seo_admin`
5. 执行周期：每天凌晨 2 点
6. 保留最新 7 份

### 设置告警

1. 宝塔面板 → **监控**
2. 配置告警：
   - CPU > 80%
   - 内存 > 80%
   - 磁盘 > 80%
   - 进程停止

---

## 🎯 完整部署检查清单

- [ ] 宝塔面板已安装
- [ ] Nginx 已安装并运行
- [ ] PostgreSQL 已安装并创建数据库
- [ ] Node.js 20 已安装
- [ ] pnpm 已安装
- [ ] 项目代码已克隆
- [ ] 环境变量已配置（.env.local）
- [ ] 依赖已安装（pnpm install）
- [ ] 数据库已初始化（db:push）
- [ ] 项目已构建（pnpm build）
- [ ] PM2 已启动应用
- [ ] Nginx 反向代理已配置
- [ ] 防火墙端口已开放
- [ ] SSL 证书已配置（可选）
- [ ] 可以通过域名/IP 访问
- [ ] 健康检查通过（/api/health）
- [ ] 可以登录管理后台
- [ ] 自动备份已设置

---

## 📞 需要帮助？

### 查看日志

```bash
# PM2 日志
pm2 logs seo-admin

# Nginx 日志
tail -f /www/wwwlogs/admin.yourdomain.com.log

# PostgreSQL 日志
tail -f /www/server/postgresql/14/data/pg_log/postgresql-*.log
```

### 重启所有服务

```bash
pm2 restart seo-admin
systemctl restart nginx
systemctl restart postgresql
```

---

## 🎉 部署完成！

访问您的 Admin 后台：
- **URL**: `https://admin.yourdomain.com`
- **账号**: 使用初始化的管理员账号

下一步：
1. 创建网站记录
2. 生成 API Key
3. 配置 Vercel 环境变量
4. 发布测试文章

查看 [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) 了解后续步骤。

---

**部署时间**: 约 30-45 分钟
**难度等级**: ⭐⭐⭐☆☆
**最后更新**: 2024-01-15
