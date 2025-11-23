# 宝塔服务器部署Admin后台教程

## 📋 前置要求

- 宝塔面板 7.x 或更高版本
- Node.js 18.x 或更高 (通过宝塔软件商店安装)
- PostgreSQL 数据库 (Supabase或自建)
- 域名已解析到服务器

---

## 🚀 部署步骤

### 1. 安装必要软件

登录宝塔面板 → **软件商店**

安装以下软件:
- ✅ **Nginx** (Web服务器)
- ✅ **PM2管理器** (Node.js进程管理)
- ✅ **Node.js版本管理器** (安装Node.js 18+)

### 2. 创建网站

进入 **网站** → **添加站点**

配置:
- **域名**: `adminseohub.xyz` (你的admin域名)
- **根目录**: `/www/wwwroot/seo-admin`
- **PHP版本**: 纯静态
- **数据库**: 不创建 (使用Supabase)

### 3. 上传代码

#### 方法A: Git克隆 (推荐)

在宝塔 **终端** 或SSH中执行:

```bash
cd /www/wwwroot
git clone https://github.com/tgtgdeploy/seo-admin-backend.git seo-admin
cd seo-admin
```

#### 方法B: 手动上传

在宝塔 **文件** 管理器中:
1. 进入 `/www/wwwroot/seo-admin`
2. 上传项目ZIP文件
3. 解压

### 4. 配置环境变量

在项目根目录创建 `.env` 文件:

```bash
cd /www/wwwroot/seo-admin
nano .env
```

填入以下内容:

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://bsuvzqihxbgoclfvgbhx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="你的SUPABASE_ANON_KEY"

# NextAuth
NEXTAUTH_URL="https://adminseohub.xyz"
NEXTAUTH_SECRET="生成一个随机密钥"

# Node Environment
NODE_ENV="production"
```

生成 `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 5. 安装依赖

使用pnpm (推荐) 或 npm:

```bash
# 如果没有pnpm,先安装


# 安装项目依赖
pnpm install
```

### 6. 初始化数据库

运行Prisma迁移:

```bash
# 生成Prisma Client
pnpm exec prisma generate --schema=packages/database/prisma/schema.prisma

# 推送数据库结构
pnpm exec prisma db push --schema=packages/database/prisma/schema.prisma
```

### 7. 构建项目

```bash
pnpm run build
```

构建成功后会生成 `.next` 目录。

### 8. 配置PM2

#### 创建PM2配置文件

创建 `ecosystem.config.js`:

```bash
nano ecosystem.config.js
```

内容:

```javascript
module.exports = {
  apps: [{
    name: 'seo-admin',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    cwd: '/www/wwwroot/seo-admin',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

#### 启动应用

在宝塔 **PM2管理器** 中:

1. 点击 **添加项目**
2. 选择配置文件: `/www/wwwroot/seo-admin/ecosystem.config.js`
3. 点击 **启动**

或者使用命令行:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

验证运行状态:
```bash
pm2 status
pm2 logs seo-admin
```

### 9. 配置Nginx反向代理

在宝塔 **网站设置** → **反向代理**

添加代理:

- **代理名称**: `seo-admin`
- **目标URL**: `http://127.0.0.1:3000`
- **发送域名**: `$host`

或者手动编辑Nginx配置:

```bash
nano /www/server/panel/vhost/nginx/adminseohub.xyz.conf
```

添加:

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name adminseohub.xyz;

    # SSL证书配置 (通过宝塔申请Let's Encrypt证书)
    ssl_certificate    /www/server/panel/vhost/cert/adminseohub.xyz/fullchain.pem;
    ssl_certificate_key    /www/server/panel/vhost/cert/adminseohub.xyz/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

重启Nginx:
```bash
nginx -t
nginx -s reload
```

### 10. 配置SSL证书

在宝塔 **网站设置** → **SSL**

- 选择 **Let's Encrypt**
- 勾选域名
- 点击 **申请**
- 开启 **强制HTTPS**

---

## 🔧 常见问题

### Q1: PM2启动失败

**检查端口占用**:
```bash
netstat -tlnp | grep 3000
```

**查看错误日志**:
```bash
pm2 logs seo-admin --err
```

### Q2: 数据库连接失败

**测试连接**:
```bash
pnpm exec prisma db execute --schema=packages/database/prisma/schema.prisma --stdin <<< "SELECT 1"
```

**检查防火墙**:
- Supabase默认端口: 5432 (Direct) / 6543 (Pooler)
- 确保服务器可以访问外部数据库

### Q3: 构建内存不足

修改 `.npmrc`:
```bash
echo "node-options=--max_old_space_size=4096" >> .npmrc
```

或使用swap:
```bash
# 创建2G swap
dd if=/dev/zero of=/swapfile bs=1M count=2048
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

### Q4: 更新代码

```bash
cd /www/wwwroot/seo-admin
git pull
pnpm install
pnpm run build
pm2 restart seo-admin
```

---

## 📊 监控和维护

### 查看应用状态

```bash
pm2 status
pm2 monit
```

### 查看日志

```bash
# 实时日志
pm2 logs seo-admin

# 错误日志
pm2 logs seo-admin --err

# 清除日志
pm2 flush
```

### 重启应用

```bash
pm2 restart seo-admin
pm2 reload seo-admin  # 零停机重启
```

### 设置日志轮转

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🚀 优化建议

### 1. 启用Nginx缓存

在Nginx配置中添加:

```nginx
# 静态资源缓存
location /_next/static {
    proxy_pass http://127.0.0.1:3000;
    proxy_cache_valid 200 60m;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. 开启Gzip压缩

在宝塔 **网站设置** → **配置文件** 中:

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
```

### 3. 配置自动备份

在宝塔 **计划任务** 中:
- 任务类型: **备份网站**
- 执行周期: 每天凌晨2点
- 备份到: **远程存储** (OSS/COS)

---

## ✅ 验证部署

访问以下URL确认服务正常:

1. **前端**: https://adminseohub.xyz
2. **API健康检查**: https://adminseohub.xyz/api/health
3. **Public API**: https://adminseohub.xyz/api/public/posts?domain=localhost:3000

---

## 📱 移动端访问

确保宝塔安全组/防火墙开放:
- **HTTP**: 80
- **HTTPS**: 443

---

生成时间: 2025-11-23
