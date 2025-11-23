# 快速部署指南

## 最小化部署（5分钟快速启动）

### 1. 只部署Admin后台（最基础）

```bash
# 1. 克隆代码
git clone https://github.com/your-repo/seo-admin.git
cd seo-admin

# 2. 配置环境变量
cp .env.example .env.local
nano .env.local  # 修改数据库连接等配置

# 3. 安装依赖
pnpm install

# 4. 初始化数据库
cd packages/database
pnpm db:push
cd ../..

# 5. 构建和启动
pnpm build
pm2 start ecosystem.config.js

# 6. 配置Nginx（宝塔面板操作）
# - 添加站点：adminseohub.xyz
# - 反向代理：http://127.0.0.1:3100
# - 申请SSL证书

# 完成！访问 https://adminseohub.xyz
```

---

## 标准部署（30分钟）

### 架构：Admin后台 + 主站点 + 蜘蛛池

```
准备清单：
□ 1个Admin服务器（宝塔VPS）
□ 1-3个蜘蛛池VPS（可选）
□ Vercel账号
□ Supabase数据库
□ 域名（至少1个Admin域名）
```

### 步骤1：部署Admin后台（10分钟）

```bash
# 环境准备
ssh root@your-admin-server

# 安装依赖
apt update
apt install nginx nodejs npm -y
npm install -g pnpm pm2

# 上传代码并配置
cd /www/wwwroot
git clone https://github.com/your-repo/seo-admin.git
cd seo-admin

# 配置.env.local（参考上面）
cp .env.example .env.local
nano .env.local

# 安装和构建
pnpm install
cd packages/database
pnpm db:push
pnpm db:generate
cd ../..
pnpm build

# 启动
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Nginx配置模板：**

```nginx
server {
    listen 80;
    server_name adminseohub.xyz;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 步骤2：部署主站点到Vercel（5分钟）

1. **连接GitHub仓库**
   - 登录 https://vercel.com
   - Import Project
   - 选择主站点仓库

2. **配置环境变量**
   ```
   NEXT_PUBLIC_ADMIN_API_URL=https://adminseohub.xyz
   ADMIN_API_KEY=<从Admin后台获取>
   ```

3. **添加自定义域名**
   - Settings → Domains
   - 添加域名并配置DNS

4. **部署**
   - 点击Deploy

### 步骤3：部署蜘蛛池（15分钟）

```bash
# 在Admin服务器上打包部署文件
cd /www/wwwroot/seo-admin
tar -czf spider-pool-deployment.tar.gz spider-pool-deployment/

# 上传到蜘蛛池VPS
scp spider-pool-deployment.tar.gz root@spider-vps:/root/

# 在蜘蛛池VPS上
ssh root@spider-vps
cd /root
tar -xzf spider-pool-deployment.tar.gz
cd spider-pool-deployment

# 安装Nginx（如果未安装）
apt install nginx -y

# 一键部署（VPS1为例）
bash scripts/deploy.sh 1

# 申请SSL
bash scripts/ssl.sh 1 your-email@example.com

# 配置DNS A记录
# autopushnetwork.xyz → VPS IP
```

### 步骤4：初始化数据（5分钟）

```bash
# 在Admin服务器上
cd /www/wwwroot/seo-admin/packages/database

# 1. 提取HTML内容到数据库
dotenv -e ../../.env.local -- npx tsx save-html-to-db.ts

# 2. 生成蜘蛛池页面
dotenv -e ../../.env.local -- npx tsx scripts/generate-spider-pool-pages.ts

# 3. 验证
dotenv -e ../../.env.local -- npx tsx verify-spider-pool-sources.ts
```

### 验证部署

```bash
# 测试Admin后台
curl https://adminseohub.xyz/api/health

# 测试蜘蛛池
curl http://autopushnetwork.xyz/

# 测试Sitemap
curl http://autopushnetwork.xyz/sitemap.xml
```

---

## 域名配置速查表

| 域名类型 | 数量 | DNS配置 | 部署位置 |
|---------|------|---------|----------|
| Admin后台 | 1 | A记录 → Admin VPS IP | 宝塔VPS |
| 主站点 | 1-3 | A记录 → Vercel IP<br>CNAME → vercel-dns.com | Vercel |
| 跳转站点 | 0-N | 配置在主站点项目 | Vercel |
| 蜘蛛池 | 9 | A记录 → 对应VPS IP | 蜘蛛池VPS |

---

## 环境变量速查表

### Admin后台必需变量

```bash
DATABASE_URL="postgresql://..."           # Supabase连接
NEXTAUTH_SECRET="32字节随机密钥"           # openssl rand -base64 32
NEXTAUTH_URL="https://adminseohub.xyz"    # Admin域名
SETTINGS_ENCRYPTION_KEY="32字节随机密钥"   # openssl rand -base64 32
NODE_ENV="production"
PORT=3100
```

### 主站点必需变量

```bash
NEXT_PUBLIC_ADMIN_API_URL="https://adminseohub.xyz"
ADMIN_API_KEY="从Admin后台获取"
```

---

## 常用命令速查

### PM2管理

```bash
pm2 start ecosystem.config.js    # 启动
pm2 restart seo-admin           # 重启
pm2 stop seo-admin              # 停止
pm2 logs seo-admin              # 查看日志
pm2 monit                       # 监控
pm2 save                        # 保存配置
pm2 startup                     # 开机自启
```

### Nginx管理

```bash
nginx -t                        # 测试配置
systemctl reload nginx          # 重载配置
systemctl restart nginx         # 重启Nginx
systemctl status nginx          # 查看状态
tail -f /var/log/nginx/error.log  # 查看错误日志
```

### 数据库管理

```bash
cd packages/database
pnpm db:push                    # 同步schema到数据库
pnpm db:generate                # 生成Prisma Client
pnpm db:studio                  # 打开数据库管理界面
```

---

## 端口使用说明

| 服务 | 端口 | 说明 |
|------|------|------|
| Admin应用 | 3100 | PM2启动的Next.js应用 |
| Nginx | 80/443 | HTTP/HTTPS |
| PostgreSQL | 5432 | 数据库（Supabase） |

---

## 文件路径速查

### 关键配置文件

```
/www/wwwroot/seo-admin/
├── .env.local                          # 环境变量
├── ecosystem.config.js                 # PM2配置
├── next.config.js                      # Next.js配置
├── packages/database/
│   ├── prisma/schema.prisma           # 数据库Schema
│   ├── save-html-to-db.ts             # HTML提取脚本
│   └── scripts/
│       ├── generate-spider-pool-pages.ts  # 生成蜘蛛池页面
│       └── init-spider-pool.ts            # 初始化蜘蛛池
└── spider-pool-deployment/
    ├── nginx-configs/                  # 9个域名的Nginx配置
    └── scripts/
        ├── deploy.sh                   # 部署脚本
        └── ssl.sh                      # SSL申请脚本
```

### 日志文件

```
PM2日志：
/var/log/pm2/seo-admin-error.log
/var/log/pm2/seo-admin-out.log

Nginx日志：
/www/wwwlogs/adminseohub.xyz.log
/var/log/nginx/access.log
/var/log/nginx/error.log
```

---

## 故障排查

### Admin后台无法访问

```bash
# 1. 检查PM2进程
pm2 status
pm2 logs seo-admin --err --lines 50

# 2. 检查端口
netstat -tlnp | grep 3100

# 3. 检查Nginx
nginx -t
systemctl status nginx

# 4. 检查防火墙
ufw status
```

### 蜘蛛池返回502

```bash
# 1. 检查Admin API
curl https://adminseohub.xyz/api/health

# 2. 检查Nginx配置
nginx -t
cat /etc/nginx/sites-available/autopushnetwork.xyz.conf

# 3. 测试反向代理
curl -I "https://adminseohub.xyz/api/p/autopushnetwork.xyz?slug=index"

# 4. 查看错误日志
tail -f /var/log/nginx/error.log
```

### 数据库连接失败

```bash
# 1. 检查DATABASE_URL配置
cat .env.local | grep DATABASE_URL

# 2. 测试连接
cd packages/database
dotenv -e ../../.env.local -- npx prisma db pull

# 3. 检查Supabase状态
# 登录Supabase控制台查看项目状态
```

---

## 性能优化建议

### Admin后台优化

```bash
# 1. 启用Nginx缓存
# 在Nginx配置中添加：
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;
proxy_cache my_cache;
proxy_cache_valid 200 1h;

# 2. 启用Gzip压缩
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# 3. PM2集群模式
# 修改ecosystem.config.js:
instances: "max",
exec_mode: "cluster"
```

### 蜘蛛池优化

```bash
# 1. 增加缓存时间
# 修改Nginx配置:
proxy_cache_valid 200 24h;  # 首页缓存24小时

# 2. 启用HTTP/2
listen 443 ssl http2;

# 3. 优化连接超时
proxy_connect_timeout 5s;
proxy_read_timeout 10s;
```

---

## 安全加固

```bash
# 1. 限制Admin后台访问IP（可选）
# Nginx配置添加：
allow 你的IP;
deny all;

# 2. 配置fail2ban防止暴力破解
apt install fail2ban -y

# 3. 定期更新
apt update && apt upgrade -y
pnpm update

# 4. 启用UFW防火墙
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

---

## 备份脚本

```bash
#!/bin/bash
# backup.sh - 每日自动备份

BACKUP_DIR="/backup/seo-admin"
DATE=$(date +%Y%m%d)

# 备份代码
tar -czf $BACKUP_DIR/code-$DATE.tar.gz /www/wwwroot/seo-admin

# 备份数据库（Supabase自动备份，无需手动）

# 备份Nginx配置
tar -czf $BACKUP_DIR/nginx-$DATE.tar.gz /etc/nginx

# 删除30天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

添加到crontab：
```bash
crontab -e
# 每天凌晨2点执行备份
0 2 * * * /root/backup.sh
```

---

## 监控脚本

```bash
#!/bin/bash
# monitor.sh - 服务监控

# 检查PM2进程
if ! pm2 list | grep -q "seo-admin.*online"; then
    echo "Admin服务异常，尝试重启..."
    pm2 restart seo-admin
fi

# 检查Nginx
if ! systemctl is-active --quiet nginx; then
    echo "Nginx异常，尝试重启..."
    systemctl restart nginx
fi

# 检查磁盘空间
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "磁盘使用率超过80%: $DISK_USAGE%"
fi

# 检查内存使用
MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ $MEM_USAGE -gt 85 ]; then
    echo "内存使用率超过85%: $MEM_USAGE%"
fi
```

---

## 下一步

✅ 完成基础部署
📝 在Admin后台创建内容
🚀 提交Sitemap到Google Search Console
📊 监控爬虫访问和SEO效果
🔄 定期更新内容保持活跃度

**需要帮助？**
- 查看详细文档：DEPLOYMENT_GUIDE.md
- 查看API文档：docs/api/
- 查看架构设计：docs/architecture/
