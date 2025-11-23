#!/bin/bash

# 🚀 从本地一键部署到生产服务器
# 使用方法: bash scripts/deploy/deploy-from-local.sh

set -e  # 遇到错误立即退出

# 配置变量（根据实际情况修改）
SERVER_USER="root"
SERVER_HOST="your-server-ip"  # 修改为你的服务器 IP 或域名
SERVER_PROJECT_PATH="/www/wwwroot/seo-admin"
SERVER_SSH_KEY="~/.ssh/id_rsa"  # 可选：指定 SSH 密钥路径

echo "================================================"
echo "🚀 开始从本地部署到生产服务器"
echo "================================================"

# 1. 检查当前目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 2. 显示当前 Git 状态
echo ""
echo "📊 当前 Git 状态:"
git status --short

# 3. 询问是否提交未保存的修改
if [[ -n $(git status -s) ]]; then
    echo ""
    echo "⚠️  检测到未提交的修改"
    read -p "是否提交这些修改？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "请输入提交信息: " commit_msg
        git add .
        git commit -m "$commit_msg

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
        echo "✅ 已提交修改"
    else
        echo "❌ 取消部署（有未提交的修改）"
        exit 1
    fi
fi

# 4. 推送到 GitHub
echo ""
echo "⬆️  推送代码到 GitHub..."
git push origin main
echo "✅ 代码已推送到 GitHub"

# 5. SSH 到服务器并执行部署
echo ""
echo "🔗 连接到生产服务器..."
echo "================================================"

ssh -t $SERVER_USER@$SERVER_HOST << 'ENDSSH'
    set -e

    echo "📍 切换到项目目录..."
    cd /www/wwwroot/seo-admin

    echo ""
    echo "⬇️  拉取最新代码..."
    git pull origin main

    echo ""
    echo "📦 安装依赖..."
    pnpm install

    echo ""
    echo "🔧 清理 Prisma 缓存..."
    rm -rf node_modules/@prisma node_modules/.prisma packages/database/node_modules/@prisma || true

    echo ""
    echo "🔧 重新生成 Prisma Client..."
    cd packages/database
    pnpm db:generate
    cd ../..

    echo ""
    echo "🏗️  构建项目..."
    pnpm build

    echo ""
    echo "🔄 重启 PM2 进程..."
    pm2 restart seo-admin
    pm2 save

    echo ""
    echo "✅ 服务器部署完成！"

    echo ""
    echo "📊 PM2 进程状态:"
    pm2 list

    echo ""
    echo "📝 最新日志（最后 20 行）:"
    pm2 logs seo-admin --lines 20 --nostream
ENDSSH

echo ""
echo "================================================"
echo "✅ 部署全部完成！"
echo "================================================"
echo ""
echo "📋 访问地址:"
echo "   https://adminseohub.xyz"
echo ""
echo "📋 查看日志（在服务器上）:"
echo "   ssh $SERVER_USER@$SERVER_HOST"
echo "   pm2 logs seo-admin"
echo ""
echo "================================================"
