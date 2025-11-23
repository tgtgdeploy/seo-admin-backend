# 常见构建问题排查

## 问题1: Cannot find module '@prisma/client'

### 错误信息
```
Type error: Cannot find module '@prisma/client' or its corresponding type declarations.
```

### 原因
Prisma Client未生成或依赖未正确安装。

### 解决方案（在服务器上执行）

#### 方案A：完整重装（推荐）

```bash
cd /www/wwwroot/seo-admin

# 1. 清理旧的依赖
rm -rf node_modules
rm -rf packages/database/node_modules
rm -rf .next

# 2. 清理锁文件（可选）
rm -f pnpm-lock.yaml

# 3. 重新安装所有依赖
pnpm install

# 4. 手动生成Prisma Client
cd packages/database
pnpm db:generate
cd ../..

# 5. 验证Prisma Client已生成
ls -la node_modules/@prisma/client/

# 6. 构建项目
pnpm build

# 7. 重启应用
pm2 restart seo-admin
```

#### 方案B：快速修复

```bash
cd /www/wwwroot/seo-admin

# 1. 安装依赖（如果没装过）
pnpm install

# 2. 生成Prisma Client
cd packages/database
pnpm db:generate
cd ../..

# 3. 构建
pnpm build

# 4. 重启
pm2 restart seo-admin
```

#### 方案C：使用npm代替pnpm

```bash
cd /www/wwwroot/seo-admin

# 1. 清理
rm -rf node_modules

# 2. 使用npm安装
npm install

# 3. 生成Prisma
cd packages/database
npm run db:generate
cd ../..

# 4. 构建
npm run build

# 5. 重启
pm2 restart seo-admin
```

---

## 问题2: 构建超时或内存不足

### 错误信息
```
ELIFECYCLE Command failed
JavaScript heap out of memory
```

### 解决方案

```bash
# 增加Node.js内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

# 然后重新构建
pnpm build
```

---

## 问题3: 端口被占用

### 错误信息
```
Error: listen EADDRINUSE: address already in use :::3100
```

### 解决方案

```bash
# 查找占用端口的进程
lsof -i :3100

# 或
netstat -tlnp | grep 3100

# 停止进程
kill -9 <PID>

# 或停止所有相关进程
pkill -f "next.*3100"

# 重新启动
pm2 restart seo-admin
```

---

## 问题4: PM2未找到

### 错误信息
```
pm2: command not found
```

### 解决方案

```bash
# 安装PM2
npm install -g pm2

# 验证安装
pm2 --version

# 启动应用
pm2 start ecosystem.config.js
pm2 save
```

---

## 问题5: 数据库连接失败

### 错误信息
```
Error: P1001: Can't reach database server
```

### 解决方案

```bash
# 1. 检查环境变量
cat .env.local | grep DATABASE_URL

# 2. 测试数据库连接
cd /www/wwwroot/seo-admin
node check_db.js

# 3. 如果连接失败，检查：
# - DATABASE_URL是否正确
# - 数据库是否在线
# - 防火墙是否允许连接
# - IP白名单是否包含服务器IP

# 4. 重新生成Prisma Client
cd packages/database
pnpm db:generate
cd ../..
```

---

## 问题6: Git拉取冲突

### 错误信息
```
error: Your local changes to the following files would be overwritten by merge
```

### 解决方案

```bash
# 方案A: 暂存本地修改
git stash
git pull origin main
git stash pop

# 方案B: 丢弃本地修改（谨慎）
git reset --hard HEAD
git pull origin main

# 方案C: 查看冲突并手动解决
git status
# 编辑冲突文件
git add .
git commit -m "Resolve conflicts"
```

---

## 问题7: 类型检查失败

### 错误信息
```
Type error: ...
```

### 解决方案

```bash
# 1. 确保依赖完整
pnpm install

# 2. 生成Prisma类型
cd packages/database
pnpm db:generate
cd ../..

# 3. 清理缓存
rm -rf .next
rm -rf node_modules/.cache

# 4. 重新构建
pnpm build
```

---

## 问题8: 权限错误

### 错误信息
```
EACCES: permission denied
```

### 解决方案

```bash
# 修复文件所有权
chown -R root:root /www/wwwroot/seo-admin

# 或使用当前用户
chown -R $USER:$USER /www/wwwroot/seo-admin

# 修复权限
chmod -R 755 /www/wwwroot/seo-admin
chmod 600 /www/wwwroot/seo-admin/.env.local
```

---

## 完整的故障排除流程

### 当任何问题发生时，按此顺序尝试：

```bash
# 1. 进入项目目录
cd /www/wwwroot/seo-admin

# 2. 查看当前状态
git status
git log --oneline -5

# 3. 停止应用
pm2 stop seo-admin

# 4. 清理所有缓存和依赖
rm -rf node_modules
rm -rf packages/*/node_modules
rm -rf .next
rm -rf packages/database/.next

# 5. 拉取最新代码
git stash  # 如果有本地修改
git pull origin main

# 6. 重新安装依赖
pnpm install

# 7. 生成Prisma Client
cd packages/database
pnpm db:generate
cd ../..

# 8. 验证Prisma Client
ls -la node_modules/@prisma/client/ | head -10
ls -la node_modules/.prisma/client/ | head -10

# 9. 构建项目
NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# 10. 启动应用
pm2 restart seo-admin

# 11. 查看日志
pm2 logs seo-admin --lines 50

# 12. 测试健康检查
sleep 3
curl http://localhost:3100/api/health
```

---

## 验证清单

构建成功后验证以下内容：

```bash
# ✅ Prisma Client已生成
ls -la node_modules/@prisma/client/

# ✅ 构建产物存在
ls -la .next/

# ✅ PM2进程运行中
pm2 status

# ✅ 端口正在监听
netstat -tlnp | grep 3100

# ✅ 健康检查通过
curl http://localhost:3100/api/health

# ✅ 日志无错误
pm2 logs seo-admin --err --lines 20 --nostream
```

---

## 获取帮助

如果以上方法都不能解决问题：

1. **查看完整日志**
   ```bash
   pm2 logs seo-admin --lines 200
   tail -f /var/log/pm2/seo-admin-error.log
   ```

2. **检查系统资源**
   ```bash
   free -h        # 内存使用
   df -h          # 磁盘空间
   top            # CPU使用
   ```

3. **查看Node版本**
   ```bash
   node --version  # 应该 >= 18.0.0
   pnpm --version
   ```

4. **导出环境信息**
   ```bash
   node --version > debug-info.txt
   pnpm --version >> debug-info.txt
   git log --oneline -5 >> debug-info.txt
   pm2 logs seo-admin --lines 50 --nostream >> debug-info.txt
   ```

5. **联系技术支持时提供**
   - 错误信息截图
   - debug-info.txt文件
   - .env.local文件（删除敏感信息）
