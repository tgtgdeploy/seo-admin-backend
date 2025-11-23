#!/bin/bash

# 🔗 GitHub Webhook 部署脚本
# 用于宝塔面板的 Webhook 配置
# 当 GitHub 收到 push 事件时自动执行此脚本

set -e  # 遇到错误立即退出

# 日志文件
LOG_FILE="/www/wwwroot/seo-admin/webhook-deploy.log"
LOCK_FILE="/tmp/seo-admin-deploy.lock"

# 函数：记录日志
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 检查是否有部署正在进行
if [ -f "$LOCK_FILE" ]; then
    log "⚠️  检测到部署正在进行中，跳过本次部署"
    exit 0
fi

# 创建锁文件
touch "$LOCK_FILE"

# 清理函数
cleanup() {
    rm -f "$LOCK_FILE"
}

# 确保锁文件在脚本退出时被删除
trap cleanup EXIT

log "================================================"
log "🚀 开始 Webhook 自动部署"
log "================================================"

# 进入项目目录
cd /www/wwwroot/seo-admin || {
    log "❌ 错误: 项目目录不存在"
    exit 1
}

# 显示当前状态
log "📊 当前 Git 状态:"
git status --short | tee -a "$LOG_FILE"

# 保存本地修改（如果有）
if [[ -n $(git status -s) ]]; then
    log "💾 保存本地修改到 stash..."
    git stash push -m "Auto-stash before webhook deploy $(date +%Y%m%d_%H%M%S)"
fi

# 拉取最新代码
log "⬇️  拉取最新代码..."
git pull origin main 2>&1 | tee -a "$LOG_FILE"

# 检查是否有更新
if git diff HEAD@{1} HEAD --quiet; then
    log "ℹ️  没有新的更新，跳过构建"
    exit 0
fi

log "✅ 代码已更新，开始构建..."

# 安装/更新依赖
log "📦 安装依赖..."
pnpm install 2>&1 | tee -a "$LOG_FILE"

# 清理 Prisma 缓存
log "🧹 清理 Prisma 缓存..."
rm -rf node_modules/@prisma node_modules/.prisma packages/database/node_modules/@prisma 2>&1 | tee -a "$LOG_FILE" || true

# 生成 Prisma Client
log "🔧 生成 Prisma Client..."
cd packages/database
pnpm db:generate 2>&1 | tee -a "$LOG_FILE"
cd ../..

# 构建项目
log "🏗️  构建项目..."
pnpm build 2>&1 | tee -a "$LOG_FILE"

# 重启 PM2
log "🔄 重启 PM2 进程..."
pm2 restart seo-admin 2>&1 | tee -a "$LOG_FILE"

# 等待应用启动
log "⏳ 等待应用启动..."
sleep 3

# 检查应用状态
if pm2 list | grep -q "seo-admin.*online"; then
    log "✅ 应用运行正常"
else
    log "⚠️  警告: 应用可能未正常启动"
    pm2 logs seo-admin --err --lines 20 --nostream | tee -a "$LOG_FILE"
fi

# 显示最新日志
log "📝 应用最新日志:"
pm2 logs seo-admin --lines 10 --nostream | tee -a "$LOG_FILE"

log "================================================"
log "✅ Webhook 部署完成！"
log "================================================"

# 显示部署信息
log "📊 部署统计:"
log "   提交哈希: $(git rev-parse --short HEAD)"
log "   提交信息: $(git log -1 --pretty=%B | head -1)"
log "   提交时间: $(git log -1 --pretty=%cd)"

# 清理旧日志（保留最近100行）
tail -n 100 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"

exit 0
