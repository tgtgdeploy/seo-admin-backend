# SEO管理系统完整部署指南

## 系统架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                   用户/搜索引擎爬虫访问                        │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   蜘蛛池域名    主站点        跳转站点
   (9个VPS)    (Vercel)    (Nginx反向代理)
        │            │            │
        │            │            └─► 301跳转到主站点
        │            │
        │            └─► 调用Admin API获取内容
        │
        └─► Nginx反向代理到Admin API
                     │
                     ▼
        ┌────────────────────────┐
        │ Admin Backend          │
        │ adminseohub.xyz:3100   │
        │ - 管理界面              │
        │ - API: /api/p/[domain] │
        │ - 内容管理              │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  PostgreSQL 数据库      │
        │  (Supabase)            │
        │  - 网站配置             │
        │  - 文章内容             │
        │  - 蜘蛛池页面           │
        │  - 访问日志             │
        └────────────────────────┘
```

## 核心概念

### 三种站点类型

1. **管理后台 (Admin Backend)**
   - 域名：adminseohub.xyz
   - 功能：管理所有站点、内容、数据
   - 部署：宝塔面板VPS + PM2
   - 端口：3100

2. **主站点 (Main Sites)**
   - 数量：3个
   - 功能：展示内容，供用户访问
   - 部署：Vercel
   - 示例：telegramtghub.com

3. **蜘蛛池站点 (Spider Pool Sites)**
   - 数量：9个
   - 功能：SEO优化，吸引搜索引擎爬虫
   - 部署：3个VPS（每个VPS 3个域名）
   - 技术：Nginx反向代理到Admin API

---

## 第一步：准备工作

### 1.1 域名准备

**需要准备的域名：**

```
管理后台域名（1个）：
└─ adminseohub.xyz

主站点域名（3个）：
├─ telegramtghub.com
├─ telegramupdatecenter.com
└─ telegramtrendguide.com

跳转站点域名（3个，可选）：
├─ globalinsighthub.xyz → telegramtghub.com
├─ infostreammedia.xyz → telegramupdatecenter.com
└─ adminapihub.xyz → telegramtrendguide.com

蜘蛛池域名（9个）：
VPS1 (IP: 95.111.231.110):
├─ autopushnetwork.xyz
├─ contentpoolzone.site
└─ crawlboostnet.xyz

VPS2 (IP: 75.119.154.120):
├─ crawlenginepro.xyz
├─ linkpushmatrix.site
└─ rankspiderchain.xyz

VPS3 (IP: 37.60.254.52):
├─ seohubnetwork.xyz
├─ spidertrackzone.xyz
└─ trafficboostflow.site
```

### 1.2 服务器准备

**需要的服务器：**

1. **管理后台服务器（必须）**
   - 1台VPS
   - 推荐：宝塔面板
   - 配置：2核4G起步
   - 系统：Ubuntu 20.04+

2. **蜘蛛池服务器（可选，建议）**
   - 3台VPS
   - 只需Nginx，配置要求低
   - 配置：1核1G即可
   - 系统：Ubuntu/Debian

### 1.3 数据库准备

**使用Supabase（推荐）：**

1. 访问 https://supabase.com
2. 创建新项目
3. 记录数据库连接字符串：
   ```
   postgresql://postgres:[密码]@db.[项目ID].supabase.co:5432/postgres
   ```

### 1.4 生成密钥

```bash
# 生成NEXTAUTH_SECRET
openssl rand -base64 32

# 生成SETTINGS_ENCRYPTION_KEY
openssl rand -base64 32
```

---

## 第二步：部署管理后台（核心）

### 2.1 服务器环境安装

**在宝塔面板中安装：**

```bash
# 1. Node.js 18+
# 在宝塔面板 -> 软件商店 -> 搜索"Node" -> 安装

# 2. Nginx
# 在宝塔面板 -> 软件商店 -> 搜索"Nginx" -> 安装

# 3. PM2（通过SSH）
npm install -g pm2
pm2 startup
pm2 save
```

### 2.2 上传代码

```bash
# SSH连接到服务器
ssh root@adminseohub.xyz

# 创建项目目录
mkdir -p /www/wwwroot/seo-admin
cd /www/wwwroot/seo-admin

# 上传代码（或通过Git克隆）
# 方式1：Git克隆
git clone https://github.com/your-repo/seo-admin.git .

# 方式2：使用宝塔面板的文件管理器上传
```

### 2.3 配置环境变量

```bash
# 创建 .env.local 文件
cd /www/wwwroot/seo-admin
nano .env.local
```

**填写以下内容：**

```bash
# 数据库配置（必须）
DATABASE_URL="postgresql://postgres:密码@db.xxx.supabase.co:5432/postgres?schema=public&pgbouncer=true"

# NextAuth 配置（必须）
NEXTAUTH_SECRET="刚才生成的密钥1"
NEXTAUTH_URL="https://adminseohub.xyz"

# 加密密钥（必须）
SETTINGS_ENCRYPTION_KEY="刚才生成的密钥2"

# OpenAI API（可选）
OPENAI_API_KEY="sk-your-key"
OPENAI_MODEL="gpt-4-turbo"

# 网站配置
NEXT_PUBLIC_SITE_NAME="SEO 管理后台"
NEXT_PUBLIC_WEBSITE1_URL="https://telegramtghub.com"
NEXT_PUBLIC_WEBSITE2_URL="https://telegramupdatecenter.com"
NEXT_PUBLIC_WEBSITE_TG_URL="https://telegramtrendguide.com"

# 生产环境
NODE_ENV="production"
PORT=3100
```

### 2.4 安装依赖和初始化

```bash
# 安装pnpm
npm install -g pnpm

# 安装依赖
pnpm install

# 初始化数据库
cd packages/database
pnpm db:push

# 生成Prisma Client
pnpm db:generate

# 返回项目根目录
cd ../..

# 构建项目
pnpm build
```

### 2.5 启动应用

```bash
# 使用PM2启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs seo-admin

# 保存PM2配置（开机自启）
pm2 save
```

### 2.6 配置Nginx

**在宝塔面板中配置：**

1. 网站 -> 添加站点
   - 域名：adminseohub.xyz
   - 根目录：/www/wwwroot/seo-admin
   - PHP版本：纯静态

2. 配置反向代理：
   - 点击站点设置 -> 反向代理
   - 目标URL：http://127.0.0.1:3100
   - 或手动编辑配置文件：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name adminseohub.xyz;

    # 反向代理到PM2应用
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

    # 日志
    access_log /www/wwwlogs/adminseohub.xyz.log;
    error_log /www/wwwlogs/adminseohub.xyz.error.log;
}
```

3. 申请SSL证书
   - 点击SSL -> Let's Encrypt
   - 勾选域名 -> 申请

### 2.7 验证部署

```bash
# 测试访问
curl http://localhost:3100/api/health

# 浏览器访问
https://adminseohub.xyz

# 默认登录账号（首次需要创建）
# 访问管理后台创建管理员账号
```

---

## 第三步：部署主站点（Vercel）

### 3.1 准备主站点代码

主站点应该是独立的Next.js项目，调用Admin API获取内容。

**主站点项目结构：**

```typescript
// app/page.tsx - 首页
export default async function Home() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADMIN_API_URL}/api/public/posts`,
    {
      headers: {
        'x-api-key': process.env.ADMIN_API_KEY!,
      },
    }
  )
  const posts = await response.json()

  return <PostList posts={posts} />
}

// app/posts/[slug]/page.tsx - 文章详情
export default async function PostPage({ params }) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADMIN_API_URL}/api/public/posts/${params.slug}`,
    {
      headers: {
        'x-api-key': process.env.ADMIN_API_KEY!,
      },
    }
  )
  const post = await response.json()

  return <Post post={post} />
}
```

### 3.2 Vercel部署步骤

1. **连接GitHub仓库**
   - 访问 https://vercel.com
   - 导入Git仓库
   - 选择主站点项目

2. **配置环境变量**
   ```
   NEXT_PUBLIC_ADMIN_API_URL=https://adminseohub.xyz
   ADMIN_API_KEY=从Admin后台获取
   ```

3. **配置自定义域名**
   - Settings -> Domains
   - 添加：telegramtghub.com
   - 配置DNS：
     ```
     A记录: @ -> 76.76.21.21
     CNAME: www -> cname.vercel-dns.com
     ```

4. **部署**
   - 点击Deploy
   - 等待构建完成

5. **重复步骤** 为另外两个主站点重复上述步骤

---

## 第四步：配置跳转站点（可选）

### 方式1：在Vercel中配置（推荐）

**在主站点项目的 next.config.js 中添加：**

```javascript
module.exports = {
  async redirects() {
    return [
      // globalinsighthub.xyz 跳转到 telegramtghub.com
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'globalinsighthub.xyz',
          },
        ],
        destination: 'https://telegramtghub.com/:path*',
        permanent: true, // 301永久重定向
      },
      // infostreammedia.xyz 跳转到 telegramupdatecenter.com
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'infostreammedia.xyz',
          },
        ],
        destination: 'https://telegramupdatecenter.com/:path*',
        permanent: true,
      },
    ]
  },
}
```

**然后在Vercel中添加跳转域名：**
- Settings -> Domains -> Add
- 输入跳转域名并配置DNS

### 方式2：独立Nginx配置

```nginx
server {
    listen 80;
    server_name globalinsighthub.xyz;

    return 301 https://telegramtghub.com$request_uri;
}
```

---

## 第五步：部署蜘蛛池站点（核心SEO优化）

### 5.1 理解蜘蛛池工作原理

```
用户访问: autopushnetwork.xyz/page-0001
        ↓
Nginx反向代理: adminseohub.xyz/api/p/autopushnetwork.xyz?slug=page-0001
        ↓
Admin API查询数据库获取页面内容
        ↓
返回HTML内容给用户
        ↓
记录访问日志（爬虫检测）
```

### 5.2 在Admin后台初始化蜘蛛池数据

**SSH连接到Admin服务器：**

```bash
ssh root@adminseohub.xyz
cd /www/wwwroot/seo-admin/packages/database

# 1. 初始化域名别名（DomainAlias）
dotenv -e ../../.env.local -- npx tsx scripts/init-spider-pool.ts

# 2. 生成蜘蛛池页面内容
dotenv -e ../../.env.local -- npx tsx scripts/generate-spider-pool-pages.ts

# 3. 验证数据
dotenv -e ../../.env.local -- npx tsx verify-spider-pool-sources.ts
```

### 5.3 部署蜘蛛池VPS

**准备部署包：**

```bash
# 在本地或Admin服务器上
cd /www/wwwroot/seo-admin
tar -czf spider-pool-deployment.tar.gz spider-pool-deployment/

# 上传到各个VPS
scp spider-pool-deployment.tar.gz root@95.111.231.110:/root/
scp spider-pool-deployment.tar.gz root@75.119.154.120:/root/
scp spider-pool-deployment.tar.gz root@37.60.254.52:/root/
```

**在每个VPS上执行：**

```bash
# VPS1: 95.111.231.110
ssh root@95.111.231.110

# 解压部署包
cd /root
tar -xzf spider-pool-deployment.tar.gz
cd spider-pool-deployment

# 安装Nginx（如果未安装）
apt update
apt install nginx -y

# 一键部署VPS1的3个域名
bash scripts/deploy.sh 1

# 查看部署结果
nginx -t
systemctl status nginx

# 申请SSL证书
bash scripts/ssl.sh 1 your-email@example.com
```

**重复上述步骤** 在VPS2和VPS3上执行（修改VPS编号为2和3）

### 5.4 配置DNS

**为每个蜘蛛池域名添加A记录：**

```
VPS1域名（95.111.231.110）：
autopushnetwork.xyz         A    95.111.231.110
contentpoolzone.site        A    95.111.231.110
crawlboostnet.xyz           A    95.111.231.110

VPS2域名（75.119.154.120）：
crawlenginepro.xyz          A    75.119.154.120
linkpushmatrix.site         A    75.119.154.120
rankspiderchain.xyz         A    75.119.154.120

VPS3域名（37.60.254.52）：
seohubnetwork.xyz           A    37.60.254.52
spidertrackzone.xyz         A    37.60.254.52
trafficboostflow.site       A    37.60.254.52
```

### 5.5 验证蜘蛛池部署

```bash
# 测试Nginx配置
curl -I http://autopushnetwork.xyz

# 测试API反向代理
curl http://autopushnetwork.xyz/

# 测试Sitemap
curl http://autopushnetwork.xyz/sitemap.xml

# 测试robots.txt
curl http://autopushnetwork.xyz/robots.txt

# 查看日志
tail -f /www/wwwlogs/autopushnetwork.xyz.log
```

---

## 第六步：在Admin后台管理所有站点

### 6.1 登录管理后台

访问：https://adminseohub.xyz

### 6.2 管理网站

**导航：网站管理 -> 网站列表**

1. **添加主站点**
   - 点击"添加网站"
   - 填写：
     - 名称：Telegram TG Hub
     - 域名：telegramtghub.com
     - SEO标题、描述、关键词
   - 生成API密钥（供主站点调用）

2. **查看蜘蛛池域名**
   - 导航：网站管理 -> 域名管理
   - 查看9个蜘蛛池域名
   - 配置主关键词和次关键词

### 6.3 管理文章

**导航：内容管理 -> 文章管理**

1. **创建文章**
   - 点击"新建文章"
   - 填写标题、内容、SEO信息
   - 选择目标网站
   - 发布

2. **同步到主站点**
   - 勾选文章
   - 点击"同步到网站"
   - 主站点通过API自动获取

### 6.4 管理蜘蛛池

**导航：SEO工具 -> 蜘蛛池管理**

1. **查看内容源**
   - 查看从HTML提取的内容
   - 管理段落、标题、关键词

2. **查看蜘蛛池页面**
   - 查看已生成的页面
   - 编辑页面内容
   - 查看访问统计

3. **查看爬虫日志**
   - 查看Google、Bing、Baidu爬虫访问记录
   - 分析爬取频率
   - 监控SEO效果

### 6.5 监控和统计

**导航：仪表盘**

- 总访问量
- 爬虫访问统计
- 关键词排名
- 文章发布数量

---

## 第七步：SEO优化配置

### 7.1 提交Sitemap

**Google Search Console：**

1. 访问 https://search.google.com/search-console
2. 添加资源（每个域名）
3. 验证所有权
4. 提交Sitemap：
   ```
   https://autopushnetwork.xyz/sitemap.xml
   https://telegramtghub.com/sitemap.xml
   ```

**Bing Webmaster Tools：**

1. 访问 https://www.bing.com/webmasters
2. 添加站点
3. 提交Sitemap

### 7.2 配置robots.txt

所有蜘蛛池域名的robots.txt已自动配置：

```
User-agent: *
Allow: /

Sitemap: https://autopushnetwork.xyz/sitemap.xml
```

### 7.3 监控爬虫访问

**在Admin后台查看：**

- SEO工具 -> 蜘蛛日志
- 实时查看爬虫访问
- 分析爬取频率

---

## 第八步：日常运维

### 8.1 更新内容

```bash
# SSH到Admin服务器
ssh root@adminseohub.xyz
cd /www/wwwroot/seo-admin

# 拉取最新代码
git pull

# 重新构建
pnpm build

# 重启应用
pm2 restart seo-admin
```

### 8.2 查看日志

```bash
# PM2日志
pm2 logs seo-admin

# Nginx访问日志
tail -f /www/wwwlogs/adminseohub.xyz.log

# Nginx错误日志
tail -f /www/wwwlogs/adminseohub.xyz.error.log
```

### 8.3 数据库备份

```bash
# Supabase会自动备份
# 也可以手动导出：

cd /www/wwwroot/seo-admin/packages/database
dotenv -e ../../.env.local -- npx prisma db pull
```

### 8.4 监控蜘蛛池VPS

```bash
# 使用提供的监控脚本
ssh root@95.111.231.110
cd /root/spider-pool-deployment
bash scripts/monitor.sh 1
```

---

## 常见问题

### Q1: Admin后台无法访问？

**检查清单：**
```bash
# 1. PM2进程是否运行
pm2 status

# 2. 端口是否监听
netstat -tlnp | grep 3100

# 3. Nginx配置是否正确
nginx -t

# 4. 查看错误日志
pm2 logs seo-admin --err --lines 50
```

### Q2: 蜘蛛池域名返回502？

**检查清单：**
```bash
# 1. Admin后台API是否正常
curl https://adminseohub.xyz/api/health

# 2. Nginx配置是否正确
nginx -t

# 3. DNS是否解析正确
nslookup autopushnetwork.xyz

# 4. 查看Nginx错误日志
tail -f /var/log/nginx/error.log
```

### Q3: 如何添加新的蜘蛛池域名？

1. 在Admin后台添加域名别名
2. 生成蜘蛛池页面内容
3. 在VPS上添加Nginx配置
4. 配置DNS A记录
5. 申请SSL证书

### Q4: 主站点无法获取文章？

**检查：**
```bash
# 1. API密钥是否正确
# 在Admin后台：网站管理 -> 查看API密钥

# 2. API是否启用
# 在Admin后台：网站管理 -> 编辑网站 -> 启用API

# 3. 测试API
curl -H "x-api-key: YOUR_KEY" \
  https://adminseohub.xyz/api/public/posts
```

---

## 安全建议

1. **定期更新密钥**
   - 定期更换NEXTAUTH_SECRET
   - 更换API密钥

2. **限制访问**
   - 使用强密码
   - 启用2FA（如果支持）
   - 限制管理后台IP访问

3. **监控异常**
   - 定期查看访问日志
   - 监控异常请求
   - 设置告警

4. **备份数据**
   - 定期备份数据库
   - 备份配置文件
   - 备份代码

---

## 总结

通过以上步骤，你已经完成了：

✅ 部署Admin管理后台（adminseohub.xyz）
✅ 部署3个主站点（Vercel）
✅ 配置3个跳转站点（可选）
✅ 部署9个蜘蛛池站点（3个VPS）
✅ 集中管理所有站点内容
✅ 实现SEO优化和爬虫吸引

**管理流程：**
```
1. 在Admin后台创建/编辑内容
   ↓
2. 内容自动同步到数据库
   ↓
3. 主站点通过API获取内容
   ↓
4. 蜘蛛池通过Nginx反向代理获取内容
   ↓
5. 搜索引擎爬虫访问蜘蛛池
   ↓
6. 在Admin后台查看爬虫日志和统计
```

所有站点都通过Admin后台集中管理，无需在每个服务器上部署代码！
