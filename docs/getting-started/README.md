# SEO Admin 后台管理系统 - 完整部署指南

这是一个完整的 SEO 管理系统，包括管理后台、主站点、跳转站点和蜘蛛池站点的部署教程。

## 系统架构概览

### 域名分布

#### 管理后台（1个）
- **adminseohub.xyz** - 管理后台（部署在宝塔面板 VPS）

#### 主站点（3个）- 部署在 Vercel
- **telegramtghub.com** - Telegram Hub 主站
- **telegramupdatecenter.com** - Telegram Update Center 主站
- **telegramtrendguide.com** - Telegram Trend Guide 主站

#### 跳转站点（3个）
- **adminapihub.xyz** - API 跳转站
- **globalinsighthub.xyz** - 跳转到 telegramtghub.com
- **infostreammedia.xyz** - 跳转到 telegramupdatecenter.com

#### 蜘蛛池站点（9个域名，分布在3个VPS）

**VPS 1 (95.111.231.110)**
- autopushnetwork.xyz
- contentpoolzone.site
- crawlboostnet.xyz

**VPS 2 (75.119.154.120)**
- crawlenginepro.xyz
- linkpushmatrix.site
- rankspiderchain.xyz

**VPS 3 (37.60.254.52)**
- seohubnetwork.xyz
- spidertrackzone.xyz
- trafficboostflow.site

---

## 部署步骤

## 第一步：准备工作

### 1.1 数据库准备 - Supabase

1. 登录 [Supabase](https://supabase.com)
2. 创建新项目或使用现有项目
3. 获取数据库连接字符串：
   - 格式：`postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
   - 示例：`postgresql://postgres:bBUoi3ezVB5pRvXY@db.bsuvzqihxbgoclfvgbhx.supabase.co:5432/postgres`

### 1.2 克隆代码仓库

```bash
git clone https://github.com/tgtgdeploy/seo-admin-backend.git
cd seo-admin-backend
```

### 1.3 安装依赖

```bash
# 安装 pnpm（如果没有）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

---

## 第二步：部署管理后台（宝塔面板 VPS）

### 2.1 服务器环境准备

在宝塔面板中安装：
- Node.js (v18 或更高版本)
- PM2 管理器
- Nginx

### 2.2 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# 数据库配置（Supabase）
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@[SUPABASE_HOST]:5432/postgres?schema=public&pgbouncer=true&connection_limit=1"

# NextAuth 配置
NEXTAUTH_SECRET="[生成一个随机密钥]"
NEXTAUTH_URL="https://adminseohub.xyz"

# 系统设置加密密钥
SETTINGS_ENCRYPTION_KEY="[生成一个随机密钥]"

# AI API 配置（可选）
TAVILY_API_KEY="your-tavily-api-key"

# 站点配置
NEXT_PUBLIC_SITE_NAME="SEO 管理后台"

# 主站点 URL
NEXT_PUBLIC_WEBSITE1_URL="https://telegramtghub.com"
NEXT_PUBLIC_WEBSITE1_NAME="Telegram Hub"

NEXT_PUBLIC_WEBSITE2_URL="https://telegramupdatecenter.com"
NEXT_PUBLIC_WEBSITE2_NAME="Telegram Update Center"

NEXT_PUBLIC_WEBSITE_TG_URL="https://telegramtrendguide.com"
NEXT_PUBLIC_WEBSITE_TG_NAME="Telegram Trend Guide"

# 生产环境配置
NODE_ENV="production"
PORT=3100
```

生成随机密钥命令：
```bash
openssl rand -base64 32
```

### 2.3 初始化数据库

```bash
# 进入 database 包目录
cd packages/database

# 生成 Prisma Client
pnpm db:generate

# 推送数据库 schema
pnpm db:push

# 初始化主站点配置
pnpm main-sites:init

# 初始化蜘蛛池配置
pnpm spider-pool:init
```

### 2.4 构建项目

```bash
# 返回项目根目录
cd ../..

# 构建项目
pnpm build
```

### 2.5 配置 PM2

创建 `ecosystem.config.js` 文件（如果不存在）：

```javascript
module.exports = {
  apps: [{
    name: 'seo-admin',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3100',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3100
    }
  }]
}
```

启动应用：

```bash
# 启动应用
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

### 2.6 配置 Nginx

在宝塔面板中添加网站：

1. 域名：`adminseohub.xyz`
2. 创建站点后，修改 Nginx 配置：

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name adminseohub.xyz;

    # SSL 配置
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. 申请 SSL 证书
4. 重启 Nginx

### 2.7 DNS 配置

在域名服务商处添加 A 记录：
```
adminseohub.xyz  →  [宝塔服务器IP]
```

---

## 第三步：部署主站点（Vercel）

### 3.1 准备三个 Next.js 项目

确保你有三个独立的 Next.js 项目：
- `seo-website-1` (telegramtghub.com)
- `seo-website-2` (telegramupdatecenter.com)
- `seo-website-tg` (telegramtrendguide.com)

### 3.2 部署到 Vercel

为每个主站点执行以下步骤：

#### 1. 登录 Vercel
```bash
npm i -g vercel
vercel login
```

#### 2. 部署项目

```bash
# 进入项目目录
cd seo-website-1

# 部署到 Vercel
vercel --prod
```

#### 3. 在 Vercel 控制台配置

对每个项目：

1. **项目设置** → **Domains** → 添加自定义域名
   - Project 1: 添加 `telegramtghub.com`
   - Project 2: 添加 `telegramupdatecenter.com`
   - Project 3: 添加 `telegramtrendguide.com`

2. **环境变量配置**：
```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@[SUPABASE_HOST]:5432/postgres?schema=public&pgbouncer=true&connection_limit=1"
NEXT_PUBLIC_API_URL="https://adminseohub.xyz/api"
```

### 3.3 DNS 配置

在域名服务商处添加 CNAME 记录（根据 Vercel 提示）：

```
telegramtghub.com           →  cname.vercel-dns.com
telegramupdatecenter.com    →  cname.vercel-dns.com
telegramtrendguide.com      →  cname.vercel-dns.com
```

---

## 第四步：配置跳转站点

### 4.1 配置 globalinsighthub.xyz → telegramtghub.com

#### 方案 A：在 Vercel 中配置（推荐）

1. 在 `seo-website-1` 项目的 Vercel 设置中
2. **Domains** → 添加 `globalinsighthub.xyz`
3. 创建 `vercel.json` 或修改 `next.config.js` 添加重定向：

```javascript
// next.config.js
module.exports = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'globalinsighthub.xyz',
          },
        ],
        destination: 'https://telegramtghub.com/:path*',
        permanent: true,
      },
    ]
  },
}
```

#### 方案 B：使用独立 Nginx 服务器

```nginx
server {
    listen 80;
    server_name globalinsighthub.xyz;
    return 301 https://telegramtghub.com$request_uri;
}
```

### 4.2 配置 infostreammedia.xyz → telegramupdatecenter.com

在 `seo-website-2` 项目中重复上述步骤。

### 4.3 配置 adminapihub.xyz

根据需求配置为 API 跳转站或管理后台入口。

### 4.4 DNS 配置

```
globalinsighthub.xyz     →  cname.vercel-dns.com (或 Nginx 服务器 IP)
infostreammedia.xyz      →  cname.vercel-dns.com (或 Nginx 服务器 IP)
adminapihub.xyz          →  [目标服务器 IP]
```

---

## 第五步：部署蜘蛛池站点（3个VPS）

蜘蛛池使用动态生成的静态页面，通过 Nginx 提供服务。

### 5.1 VPS 1 部署 (95.111.231.110)

#### 1. SSH 登录服务器

```bash
ssh root@95.111.231.110
```

#### 2. 安装 Nginx

```bash
# Ubuntu/Debian
apt update
apt install nginx -y

# CentOS
yum install nginx -y
```

#### 3. 生成蜘蛛池页面

在管理后台服务器上运行：

```bash
cd /path/to/seo-admin
node packages/database/generate-multi-spider-pools.ts
```

这将在 `packages/database/multi-spider-pools/` 目录下生成所有域名的静态页面。

#### 4. 上传静态文件到 VPS

```bash
# 压缩文件
cd packages/database
tar -czf spider-pools-vps1.tar.gz \
  multi-spider-pools/autopushnetwork.xyz \
  multi-spider-pools/contentpoolzone.site \
  multi-spider-pools/crawlboostnet.xyz

# 上传到服务器
scp spider-pools-vps1.tar.gz root@95.111.231.110:/var/www/
```

#### 5. 在 VPS 上解压

```bash
ssh root@95.111.231.110
cd /var/www
tar -xzf spider-pools-vps1.tar.gz
```

#### 6. 配置 Nginx

创建配置文件 `/etc/nginx/sites-available/spider-pools`：

```nginx
# autopushnetwork.xyz
server {
    listen 80;
    server_name autopushnetwork.xyz www.autopushnetwork.xyz;
    root /var/www/multi-spider-pools/autopushnetwork.xyz;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/html text/css application/javascript;
}

# contentpoolzone.site
server {
    listen 80;
    server_name contentpoolzone.site www.contentpoolzone.site;
    root /var/www/multi-spider-pools/contentpoolzone.site;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    gzip on;
    gzip_types text/html text/css application/javascript;
}

# crawlboostnet.xyz
server {
    listen 80;
    server_name crawlboostnet.xyz www.crawlboostnet.xyz;
    root /var/www/multi-spider-pools/crawlboostnet.xyz;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    gzip on;
    gzip_types text/html text/css application/javascript;
}
```

#### 7. 启用配置并重启 Nginx

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/spider-pools /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

#### 8. 配置 SSL 证书（Let's Encrypt）

```bash
# 安装 certbot
apt install certbot python3-certbot-nginx -y

# 为每个域名申请证书
certbot --nginx -d autopushnetwork.xyz -d www.autopushnetwork.xyz
certbot --nginx -d contentpoolzone.site -d www.contentpoolzone.site
certbot --nginx -d crawlboostnet.xyz -d www.crawlboostnet.xyz
```

#### 9. DNS 配置

在域名服务商处添加 A 记录：

```
autopushnetwork.xyz      →  95.111.231.110
contentpoolzone.site     →  95.111.231.110
crawlboostnet.xyz        →  95.111.231.110
```

### 5.2 VPS 2 部署 (75.119.154.120)

重复 VPS 1 的步骤，部署以下域名：
- crawlenginepro.xyz
- linkpushmatrix.site
- rankspiderchain.xyz

```bash
# 生成压缩包
tar -czf spider-pools-vps2.tar.gz \
  multi-spider-pools/crawlenginepro.xyz \
  multi-spider-pools/linkpushmatrix.site \
  multi-spider-pools/rankspiderchain.xyz

# 上传
scp spider-pools-vps2.tar.gz root@75.119.154.120:/var/www/
```

DNS 配置：
```
crawlenginepro.xyz       →  75.119.154.120
linkpushmatrix.site      →  75.119.154.120
rankspiderchain.xyz      →  75.119.154.120
```

### 5.3 VPS 3 部署 (37.60.254.52)

重复 VPS 1 的步骤，部署以下域名：
- seohubnetwork.xyz
- spidertrackzone.xyz
- trafficboostflow.site

```bash
# 生成压缩包
tar -czf spider-pools-vps3.tar.gz \
  multi-spider-pools/seohubnetwork.xyz \
  multi-spider-pools/spidertrackzone.xyz \
  multi-spider-pools/trafficboostflow.site

# 上传
scp spider-pools-vps3.tar.gz root@37.60.254.52:/var/www/
```

DNS 配置：
```
seohubnetwork.xyz        →  37.60.254.52
spidertrackzone.xyz      →  37.60.254.52
trafficboostflow.site    →  37.60.254.52
```

---

## 第六步：验证部署

### 6.1 检查管理后台

访问：`https://adminseohub.xyz`

- 检查登录功能
- 确认数据库连接正常
- 测试管理功能

### 6.2 检查主站点

访问以下域名，确认正常显示：
- https://telegramtghub.com
- https://telegramupdatecenter.com
- https://telegramtrendguide.com

### 6.3 检查跳转站点

- `https://globalinsighthub.xyz` → 应跳转到 `https://telegramtghub.com`
- `https://infostreammedia.xyz` → 应跳转到 `https://telegramupdatecenter.com`

### 6.4 检查蜘蛛池站点

访问所有9个蜘蛛池域名，确认：
- 页面正常显示
- SSL 证书正常
- sitemap.xml 可访问
- robots.txt 可访问

```bash
# 批量测试（在本地执行）
for domain in autopushnetwork.xyz contentpoolzone.site crawlboostnet.xyz \
              crawlenginepro.xyz linkpushmatrix.site rankspiderchain.xyz \
              seohubnetwork.xyz spidertrackzone.xyz trafficboostflow.site; do
    echo "Testing $domain..."
    curl -I https://$domain
    curl -I https://$domain/sitemap.xml
done
```

---

## 第七步：SEO 优化和提交

### 7.1 提交 Sitemap 到搜索引擎

#### Google Search Console

1. 访问 [Google Search Console](https://search.google.com/search-console)
2. 为每个域名添加资源
3. 提交 sitemap：`https://[domain]/sitemap.xml`

#### Bing Webmaster Tools

1. 访问 [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. 添加所有站点
3. 提交 sitemap

### 7.2 蜘蛛池内容更新

定期在管理后台执行内容更新：

```bash
# SSH 到管理后台服务器
cd /path/to/seo-admin/packages/database

# 重新生成蜘蛛池页面
node generate-multi-spider-pools.ts

# 重新部署到各个 VPS
# （重复第五步的上传步骤）
```

### 7.3 监控和维护

使用管理后台的监控功能：
- 查看爬虫访问日志
- 监控关键词排名
- 检查网站健康状态

---

## 故障排查

### 管理后台无法访问

```bash
# 检查 PM2 状态
pm2 status

# 查看日志
pm2 logs seo-admin

# 重启应用
pm2 restart seo-admin
```

### 数据库连接失败

检查 `.env.local` 中的 `DATABASE_URL` 是否正确：
```bash
# 测试数据库连接
cd packages/database
npx prisma db push
```

### 蜘蛛池站点 404

```bash
# 检查 Nginx 配置
nginx -t

# 检查文件权限
ls -la /var/www/multi-spider-pools/

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

### SSL 证书问题

```bash
# 续订证书
certbot renew

# 检查证书状态
certbot certificates
```

---

## 常用命令速查

### 管理后台维护

```bash
# 更新代码
git pull origin main

# 安装依赖
pnpm install

# 重新构建
pnpm build

# 重启应用
pm2 restart seo-admin

# 查看日志
pm2 logs seo-admin --lines 100
```

### 数据库维护

```bash
cd packages/database

# 生成 Prisma Client
pnpm db:generate

# 推送 schema 变更
pnpm db:push

# 打开数据库管理界面
pnpm db:studio
```

### 蜘蛛池内容更新

```bash
# 生成新页面
node generate-multi-spider-pools.ts

# 打包并上传到 VPS 1
tar -czf vps1.tar.gz multi-spider-pools/{autopushnetwork.xyz,contentpoolzone.site,crawlboostnet.xyz}
scp vps1.tar.gz root@95.111.231.110:/var/www/
```

---

## 安全建议

1. **定期更新系统**
   ```bash
   apt update && apt upgrade -y
   ```

2. **配置防火墙**
   ```bash
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw allow 22/tcp
   ufw enable
   ```

3. **使用强密码**
   - 数据库密码至少 32 字符
   - 定期更换密钥

4. **启用自动备份**
   - Supabase 自动备份
   - VPS 定期备份静态文件

5. **监控日志**
   ```bash
   # 查看访问日志
   tail -f /var/log/nginx/access.log

   # 查看错误日志
   tail -f /var/log/nginx/error.log
   ```

---

## 联系支持

如有问题，请：
1. 查看文档目录下的详细指南
2. 检查 GitHub Issues
3. 联系技术支持

---

## 附录

### A. 环境变量完整列表

参考 `.env.example` 文件。

### B. Nginx 配置模板

参考 `docs/deployment/` 目录下的配置文件。

### C. 域名清单

完整的域名配置列表和用途说明。

---

**最后更新时间**: 2025-01-15
**版本**: 2.0.0
