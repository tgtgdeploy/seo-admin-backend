# SEO Admin 后台管理系统

完整的SEO管理系统，用于管理Telegram主站、下载站、蜘蛛池等多个站点。

## 功能特点

- **域名管理**: 管理所有站点域名配置
- **文章管理**: 博客文章的增删改查
- **下载管理**: APK下载链接配置
- **蜘蛛池管理**: 多VPS蜘蛛池站点配置
- **SEO工具**: 关键词分析、排名监控
- **用户认证**: NextAuth.js 身份验证

## 技术栈

- Next.js 14 (App Router)
- Prisma ORM
- PostgreSQL (Supabase)
- NextAuth.js
- TailwindCSS
- TypeScript

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     SEO Admin 后台                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   域名管理    │  │   文章管理    │  │     下载管理          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   蜘蛛池管理  │  │   SEO工具     │  │     系统设置          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│                      ┌───────────────┐                          │
│                      │   Supabase    │                          │
│                      │  PostgreSQL   │                          │
│                      └───────────────┘                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`:

```bash
# 数据库
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://adminseohub.xyz"

# 加密密钥
SETTINGS_ENCRYPTION_KEY="your-encryption-key"

# 端口
PORT=3100
```

### 初始化数据库

```bash
cd packages/database
pnpm db:generate
pnpm db:push
```

### 开发模式

```bash
pnpm dev
```

### 构建

```bash
pnpm build
```

## 部署到VPS（宝塔面板）

### 1. 上传代码

```bash
cd /www/wwwroot
git clone https://github.com/tgtgdeploy/seo-admin-backend.git seo-admin
cd seo-admin
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
nano .env.local
```

### 4. 初始化数据库

```bash
cd packages/database
pnpm db:generate
pnpm db:push
cd ../..
```

### 5. 构建项目

```bash
pnpm build
```

### 6. PM2启动

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 7. Nginx配置

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name adminseohub.xyz;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

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

## 项目结构

```
seo-admin-backend/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   └── public/        # 公开API（下载配置等）
│   └── (dashboard)/       # 后台页面
├── packages/
│   └── database/          # Prisma数据库包
│       ├── prisma/        # Prisma schema
│       └── src/           # 数据库客户端
├── docs/                  # 文档
│   ├── deployment/        # 部署指南
│   ├── architecture/      # 架构文档
│   └── guides/            # 使用指南
└── ecosystem.config.js    # PM2配置
```

## API端点

### 公开API

- `GET /api/public/download-config` - 获取下载配置
- `GET /api/public/domain-config` - 获取域名配置

### 管理API（需认证）

- `GET/POST /api/articles` - 文章管理
- `GET/POST /api/downloads` - 下载管理
- `GET/POST /api/domains` - 域名管理
- `GET/POST /api/spider-pool` - 蜘蛛池管理

## 常用命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs seo-admin

# 重启
pm2 restart seo-admin

# 数据库管理
cd packages/database
pnpm db:studio    # 打开Prisma Studio
pnpm db:push      # 推送schema变更
```

## 环境变量说明

| 变量 | 说明 | 必填 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL连接字符串 | 是 |
| `NEXTAUTH_SECRET` | NextAuth密钥 | 是 |
| `NEXTAUTH_URL` | 网站URL | 是 |
| `SETTINGS_ENCRYPTION_KEY` | 设置加密密钥 | 是 |
| `PORT` | 服务端口 | 否(默认3100) |
| `TAVILY_API_KEY` | AI搜索API密钥 | 否 |

## 许可证

Private - All Rights Reserved
