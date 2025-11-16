#!/bin/bash

# 生产环境部署脚本
# 使用方法: 在生产服务器上执行此脚本

set -e  # 遇到错误立即退出

echo "========================================="
echo "开始部署 SEO Admin 到生产环境"
echo "========================================="

# 进入项目目录
cd /www/wwwroot/seo-admin

echo ""
echo "1️⃣  停止 PM2 进程..."
pm2 stop seo-admin || true

echo ""
echo "2️⃣  拉取最新代码..."
git pull origin main

echo ""
echo "3️⃣  清理 Prisma 缓存..."
rm -rf node_modules/@prisma node_modules/.prisma packages/database/node_modules/@prisma || true

echo ""
echo "4️⃣  重新生成 Prisma Client..."
cd packages/database
npx prisma generate
cd ../..

echo ""
echo "5️⃣  安装/更新依赖..."
pnpm install

echo ""
echo "6️⃣  构建生产版本..."
pnpm build

echo ""
echo "7️⃣  重启 PM2 进程..."
pm2 restart seo-admin

echo ""
echo "8️⃣  保存 PM2 配置..."
pm2 save

echo ""
echo "========================================="
echo "✅ 部署完成！"
echo "========================================="
echo ""
echo "查看运行状态:"
echo "  pm2 list"
echo ""
echo "查看日志:"
echo "  pm2 logs seo-admin --lines 50"
echo ""
echo "访问地址:"
echo "  https://adminseohub.xyz/ai-seo-tools"
echo ""
