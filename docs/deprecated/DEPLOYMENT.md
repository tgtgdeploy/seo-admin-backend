# 生产环境部署指南

## 问题诊断

如果遇到以下错误：
```
PrismaClientKnownRequestError:
Invalid `prisma.domainAlias.findMany()` invocation:
The column `domain_aliases.domainType` does not exist in the current database.
code: 'P2022'
```

**原因**: Prisma Client 缓存过期，需要重新生成。

## 部署步骤

### 1️⃣ 登录生产服务器

```bash
ssh root@your-server-ip
```

### 2️⃣ 执行部署脚本

```bash
cd /www/wwwroot/seo-admin
bash deploy-production.sh
```

部署脚本会自动执行以下操作：
- 停止 PM2 进程
- 拉取最新代码
- 清理 Prisma 缓存
- 重新生成 Prisma Client
- 安装/更新依赖
- 构建生产版本
- 重启 PM2 进程

### 3️⃣ 验证部署结果

```bash
cd /www/wwwroot/seo-admin
node verify-deployment.js
```

验证脚本会检查：
- ✅ 数据库连接
- ✅ domainType 字段可用性
- ✅ 活跃域名统计
- ✅ 网站配置
- ✅ 蜘蛛池页面

### 4️⃣ 查看运行状态

```bash
# 查看 PM2 进程列表
pm2 list

# 查看应用日志
pm2 logs seo-admin --lines 50

# 如果有错误，查看错误日志
pm2 logs seo-admin --err --lines 50
```

## 常见问题

### Q1: 部署后仍然报 domainType 错误

**解决方案**:
```bash
cd /www/wwwroot/seo-admin

# 完全清理 Prisma 缓存
rm -rf node_modules/@prisma
rm -rf node_modules/.prisma
rm -rf packages/database/node_modules/@prisma
rm -rf packages/database/node_modules/.prisma

# 重新生成
cd packages/database
npx prisma generate
cd ../..

# 重新构建
pnpm build

# 重启
pm2 restart seo-admin
```

### Q2: SEO 健康度页面仍然空白

1. 检查域名数据是否存在：
```bash
node verify-deployment.js
```

2. 如果没有域名数据，运行设置脚本：
```bash
node setup-domains.js
```

3. 刷新浏览器页面（清除缓存）

### Q3: AI 工具显示"AI API 未配置"

在生产服务器上编辑 `.env.local`：
```bash
cd /www/wwwroot/seo-admin
nano .env.local
```

添加：
```
VERCEL_AI_GATEWAY_KEY=your-gateway-key-here
```

然后重启：
```bash
pm2 restart seo-admin
```

## 验证清单

部署后访问以下页面确认正常：

- [ ] SEO 健康度监控: https://adminseohub.xyz/seo-dashboard
- [ ] AI SEO 工具: https://adminseohub.xyz/ai-seo-tools
- [ ] 蜘蛛池管理: https://adminseohub.xyz/spider-pool
- [ ] 域名管理: https://adminseohub.xyz/domains

## 日志位置

```bash
# PM2 日志
~/.pm2/logs/seo-admin-out.log  # 标准输出
~/.pm2/logs/seo-admin-error.log  # 错误日志

# 实时监控
pm2 monit
```

## 紧急回滚

如果部署出现严重问题：

```bash
cd /www/wwwroot/seo-admin
git reset --hard HEAD~1  # 回退到上一个提交
pnpm install
pnpm build
pm2 restart seo-admin
```
