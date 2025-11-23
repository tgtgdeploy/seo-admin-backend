#!/bin/bash
# 服务器端部署脚本
# 用于在生产服务器上拉取最新代码并部署

set -e  # 遇到错误立即退出

echo "🚀 开始部署 SEO Admin 后台..."
echo "================================================"

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 1. 显示当前分支和状态
echo ""
echo "📊 当前Git状态:"
git branch
git status --short

# 2. 保存本地未提交的修改（如果有）
echo ""
echo "💾 保存本地修改..."
if [[ -n $(git status -s) ]]; then
    echo "检测到未提交的修改，创建备份..."
    git stash push -m "Deploy backup $(date +%Y%m%d_%H%M%S)"
    STASHED=true
else
    echo "没有未提交的修改"
    STASHED=false
fi

# 3. 拉取最新代码
echo ""
echo "⬇️  拉取最新代码..."
git pull origin main

# 4. 安装依赖
echo ""
echo "📦 安装依赖..."
pnpm install

# 5. 生成Prisma Client
echo ""
echo "🔧 生成Prisma Client..."
cd packages/database
pnpm db:generate
cd ../..

# 6. 构建项目
echo ""
echo "🏗️  构建项目..."
pnpm build

# 7. 重启PM2进程
echo ""
echo "🔄 重启应用..."
if command -v pm2 &> /dev/null; then
    # 检查进程是否存在
    if pm2 list | grep -q "seo-admin"; then
        echo "重启现有PM2进程..."
        pm2 restart seo-admin
    else
        echo "启动新的PM2进程..."
        pm2 start ecosystem.config.js
    fi
    pm2 save
else
    echo "⚠️  警告: PM2未安装，请手动重启应用"
    echo "   可以运行: pm2 restart seo-admin"
fi

# 8. 验证部署
echo ""
echo "✅ 检查应用状态..."
sleep 3
if command -v pm2 &> /dev/null; then
    pm2 list
    echo ""
    echo "📝 查看最新日志:"
    pm2 logs seo-admin --lines 20 --nostream
fi

# 9. 测试健康检查
echo ""
echo "🏥 健康检查..."
if curl -f http://localhost:3100/api/health > /dev/null 2>&1; then
    echo "✅ 应用运行正常！"
else
    echo "⚠️  警告: 健康检查失败，请查看日志"
    if command -v pm2 &> /dev/null; then
        pm2 logs seo-admin --err --lines 50
    fi
fi

echo ""
echo "================================================"
echo "✅ 部署完成！"
echo ""
echo "📋 后续操作:"
echo "   1. 访问管理后台: https://adminseohub.xyz"
echo "   2. 查看日志: pm2 logs seo-admin"
echo "   3. 查看状态: pm2 status"
echo "   4. 重启应用: pm2 restart seo-admin"
echo ""

if [ "$STASHED" = true ]; then
    echo "⚠️  注意: 本地修改已保存到stash"
    echo "   恢复修改: git stash pop"
    echo "   查看stash: git stash list"
fi

echo "================================================"
