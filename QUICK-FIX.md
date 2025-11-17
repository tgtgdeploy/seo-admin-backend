# 🚀 生产环境快速修复指南

## 当前问题

SEO 健康度监控页面空白，PM2 日志显示错误：
```
The column `domain_aliases.domainType` does not exist in the current database.
```

## 原因

Prisma Client 缓存过期，需要重新生成。

## 解决方案（3 步）

### 步骤 1: 登录生产服务器

```bash
ssh root@your-server-ip
```

### 步骤 2: 执行部署脚本

```bash
cd /www/wwwroot/seo-admin
bash deploy-production.sh
```

等待 3-5 分钟完成部署。

### 步骤 3: 验证修复结果

```bash
node verify-deployment.js
```

看到 "✅ 验证完成！所有检查通过！" 即表示修复成功。

## 验证页面

浏览器访问以下地址确认正常：
- https://adminseohub.xyz/seo-dashboard
- https://adminseohub.xyz/ai-seo-tools

## 如果还有问题

查看详细部署指南：
```bash
cat DEPLOYMENT.md
```

或联系技术支持。
