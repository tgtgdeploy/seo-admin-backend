#!/bin/bash

# 🚀 快速部署脚本（推送代码到 GitHub）
# 使用方法: bash scripts/deploy/quick-deploy.sh "提交信息"

set -e

COMMIT_MSG="${1:-Update: deployment}"

echo "================================================"
echo "🚀 快速部署到 GitHub"
echo "================================================"

# 检查未提交的修改
if [[ -z $(git status -s) ]]; then
    echo "✅ 没有需要提交的修改"
    echo "📤 推送现有提交到 GitHub..."
    git push origin main
    echo ""
    echo "✅ 完成！"
    echo ""
    echo "⚠️  接下来请在服务器上执行:"
    echo "   cd /www/wwwroot/seo-admin"
    echo "   bash scripts/deploy/deploy-production.sh"
    exit 0
fi

# 显示要提交的文件
echo ""
echo "📝 将要提交的文件:"
git status --short

# 提交并推送
echo ""
echo "💾 提交修改..."
git add .
git commit -m "$COMMIT_MSG

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo ""
echo "📤 推送到 GitHub..."
git push origin main

echo ""
echo "================================================"
echo "✅ 代码已推送到 GitHub！"
echo "================================================"
echo ""
echo "⚠️  接下来请在服务器上执行:"
echo "   cd /www/wwwroot/seo-admin"
echo "   bash scripts/deploy/deploy-production.sh"
echo ""
echo "或者使用 SSH 远程执行:"
echo "   ssh root@your-server-ip 'cd /www/wwwroot/seo-admin && bash scripts/deploy/deploy-production.sh'"
echo ""
echo "================================================"
