# 服务器部署指南

## 快速部署（推荐）

代码已推送到GitHub仓库：`tgtgdeploy/seo-admin-backend`

### 在服务器上一键部署

```bash
# SSH连接到服务器
ssh root@adminseohub.xyz

# 进入项目目录
cd /www/wwwroot/seo-admin

# 运行部署脚本
bash SERVER_DEPLOY.sh
```

脚本会自动完成：
- ✅ 拉取最新代码
- ✅ 安装依赖
- ✅ 生成Prisma Client
- ✅ 构建项目
- ✅ 重启PM2进程
- ✅ 健康检查

---

## 手动部署步骤

如果你想手动控制每个步骤：

### 1. 连接到服务器

```bash
ssh root@adminseohub.xyz
# 或
ssh root@your-server-ip
```

### 2. 进入项目目录

```bash
cd /www/wwwroot/seo-admin
```

### 3. 检查当前状态

```bash
# 查看当前分支
git branch

# 查看是否有未提交的修改
git status
```

### 4. 拉取最新代码

```bash
# 如果有本地修改，先保存
git stash

# 拉取最新代码
git pull origin main

# 如果需要，恢复本地修改
git stash pop
```

### 5. 安装依赖

```bash
pnpm install
```

### 6. 生成Prisma Client

```bash
cd packages/database
pnpm db:generate
cd ../..
```

### 7. 构建项目

```bash
pnpm build
```

### 8. 重启应用

#### 方式A: 使用PM2（推荐）

```bash
# 如果PM2未安装
npm install -g pm2

# 重启应用
pm2 restart seo-admin

# 查看状态
pm2 status

# 查看日志
pm2 logs seo-admin --lines 50

# 如果是首次部署，启动应用
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 方式B: 使用宝塔面板

1. 登录宝塔面板
2. 网站 → 找到 seo-admin
3. 重启Node项目

#### 方式C: 手动启动

```bash
# 停止旧进程
pkill -f "next.*3100"

# 启动新进程（生产模式）
PORT=3100 NODE_ENV=production node_modules/.bin/next start &
```

### 9. 验证部署

```bash
# 检查应用是否运行
curl http://localhost:3100/api/health

# 应该返回类似：
# {"status":"ok","timestamp":"2025-11-15T..."}

# 检查PM2状态
pm2 status

# 查看最新日志
pm2 logs seo-admin --lines 20
```

### 10. 浏览器访问

访问管理后台：https://adminseohub.xyz

---

## 常见问题排查

### Q1: 拉取代码时提示冲突

```bash
# 方案1: 暂存本地修改
git stash
git pull origin main
git stash pop

# 方案2: 强制覆盖本地修改（谨慎使用）
git fetch origin
git reset --hard origin/main
```

### Q2: 构建失败

```bash
# 清理缓存重新构建
rm -rf .next
rm -rf node_modules/.cache
pnpm install
pnpm build
```

### Q3: PM2进程未响应

```bash
# 查看错误日志
pm2 logs seo-admin --err --lines 100

# 停止并重启
pm2 stop seo-admin
pm2 start ecosystem.config.js

# 或者删除并重新启动
pm2 delete seo-admin
pm2 start ecosystem.config.js
pm2 save
```

### Q4: 数据库连接错误

```bash
# 检查环境变量
cat .env.local | grep DATABASE_URL

# 测试数据库连接
node check_db.js

# 如果需要，重新生成Prisma Client
cd packages/database
pnpm db:generate
cd ../..
```

### Q5: 端口3100被占用

```bash
# 查找占用端口的进程
lsof -i :3100
# 或
netstat -tlnp | grep 3100

# 停止进程
kill -9 <PID>

# 或停止所有Node进程
pkill -f node
```

---

## 更新数据库Schema

如果更新了数据库Schema：

```bash
cd packages/database

# 同步到数据库
pnpm db:push

# 生成Prisma Client
pnpm db:generate

cd ../..

# 重新构建
pnpm build

# 重启应用
pm2 restart seo-admin
```

---

## 零停机部署（高级）

使用PM2集群模式实现零停机：

```bash
# 修改 ecosystem.config.js
instances: 2,          # 改为2个实例
exec_mode: 'cluster',  # 集群模式

# 重启时使用reload而不是restart
pm2 reload seo-admin

# reload会逐个重启实例，保证服务不中断
```

---

## 回滚到上一个版本

如果新版本有问题，快速回滚：

```bash
# 查看提交历史
git log --oneline -10

# 回滚到上一个提交
git reset --hard HEAD~1

# 重新构建和部署
pnpm install
pnpm build
pm2 restart seo-admin

# 或回滚到指定提交
git reset --hard <commit-hash>
```

---

## 监控和日志

### 实时监控

```bash
# PM2监控界面
pm2 monit

# 实时日志
pm2 logs seo-admin

# 只看错误日志
pm2 logs seo-admin --err
```

### 日志文件位置

```
PM2日志:
/var/log/pm2/seo-admin-error.log
/var/log/pm2/seo-admin-out.log

Nginx日志:
/www/wwwlogs/adminseohub.xyz.log
/www/wwwlogs/adminseohub.xyz.error.log
```

---

## 性能优化建议

### 1. 启用PM2集群模式

```javascript
// ecosystem.config.js
instances: "max",      // 或指定数字如 2, 4
exec_mode: "cluster"
```

### 2. 启用Nginx缓存

```nginx
# 在Nginx配置中添加
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;

location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 1h;
    proxy_pass http://127.0.0.1:3100;
}
```

### 3. 优化构建

```bash
# 使用环境变量优化构建
NODE_ENV=production pnpm build
```

---

## 安全检查清单

部署后检查：

- [ ] `.env.local` 文件权限设为600
- [ ] 数据库密码足够强
- [ ] NEXTAUTH_SECRET已更新
- [ ] API密钥已轮换
- [ ] SSL证书有效
- [ ] 防火墙规则正确
- [ ] 定期备份已设置

```bash
# 设置环境变量文件权限
chmod 600 .env.local

# 检查SSL证书有效期
openssl x509 -in /path/to/cert.pem -noout -dates
```

---

## 完整部署流程总结

```bash
# 1. SSH到服务器
ssh root@adminseohub.xyz

# 2. 进入项目目录
cd /www/wwwroot/seo-admin

# 3. 拉取最新代码
git pull origin main

# 4. 安装依赖
pnpm install

# 5. 生成Prisma
cd packages/database && pnpm db:generate && cd ../..

# 6. 构建
pnpm build

# 7. 重启
pm2 restart seo-admin

# 8. 验证
pm2 logs seo-admin --lines 20
curl http://localhost:3100/api/health
```

或者一行命令：

```bash
bash SERVER_DEPLOY.sh
```

---

## 需要帮助？

- 查看完整文档: `cat DEPLOYMENT_GUIDE.md`
- 查看快速指南: `cat QUICK_START.md`
- 查看架构说明: `cat ARCHITECTURE.md`
- 检查数据库: `node check_db.js`
- 创建管理员: `node create_admin.js`
