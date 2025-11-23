#!/bin/bash

# 🚀 服务器初始化脚本 - 在宝塔服务器上执行
# 用于首次部署或重新部署项目
# 使用方法:
#   1. 上传此脚本到服务器
#   2. chmod +x server-init-setup.sh
#   3. ./server-init-setup.sh

set -e  # 遇到错误立即退出

echo "================================================"
echo "🚀 SEO Admin 服务器初始化脚本"
echo "================================================"

# ==========================================
# 配置变量（可根据实际情况修改）
# ==========================================
PROJECT_NAME="seo-admin"
PROJECT_PATH="/www/wwwroot/seo-admin"
GITHUB_REPO="https://github.com/tgtgdeploy/seo-admin-backend.git"
GITHUB_BRANCH="main"
NODE_VERSION="18"  # 推荐 Node.js 版本
PM2_APP_NAME="seo-admin"
APP_PORT="3100"

echo ""
echo "📋 配置信息:"
echo "   项目名称: $PROJECT_NAME"
echo "   项目路径: $PROJECT_PATH"
echo "   仓库地址: $GITHUB_REPO"
echo "   分支: $GITHUB_BRANCH"
echo "   端口: $APP_PORT"
echo ""

read -p "是否继续？(y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 取消安装"
    exit 1
fi

# ==========================================
# 1. 检查必要的工具
# ==========================================
echo ""
echo "1️⃣  检查必要的工具..."

# 检查 Git
if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装，正在安装..."
    yum install -y git || apt-get install -y git
else
    echo "✅ Git 已安装: $(git --version)"
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js 未安装"
    echo "   请在宝塔面板安装 Node.js $NODE_VERSION"
    echo "   路径: 软件商店 → Node 版本管理"
    exit 1
else
    echo "✅ Node.js 已安装: $(node --version)"
fi

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 安装 pnpm..."
    npm install -g pnpm
else
    echo "✅ pnpm 已安装: $(pnpm --version)"
fi

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装 PM2..."
    npm install -g pm2
else
    echo "✅ PM2 已安装: $(pm2 --version)"
fi

# ==========================================
# 2. 备份旧项目（如果存在）
# ==========================================
echo ""
echo "2️⃣  检查现有项目..."

if [ -d "$PROJECT_PATH" ]; then
    BACKUP_PATH="${PROJECT_PATH}_backup_$(date +%Y%m%d_%H%M%S)"
    echo "⚠️  项目目录已存在，创建备份..."
    echo "   备份路径: $BACKUP_PATH"
    mv "$PROJECT_PATH" "$BACKUP_PATH"
    echo "✅ 备份完成"
fi

# ==========================================
# 3. 克隆项目
# ==========================================
echo ""
echo "3️⃣  克隆项目仓库..."

# 创建父目录
mkdir -p "$(dirname "$PROJECT_PATH")"

# 克隆仓库
echo "   从 GitHub 克隆..."
git clone -b "$GITHUB_BRANCH" "$GITHUB_REPO" "$PROJECT_PATH"

# 进入项目目录
cd "$PROJECT_PATH"

echo "✅ 项目克隆完成"
echo "   当前分支: $(git branch --show-current)"
echo "   最新提交: $(git log -1 --oneline)"

# ==========================================
# 4. 配置环境变量
# ==========================================
echo ""
echo "4️⃣  配置环境变量..."

if [ -f ".env.local" ]; then
    echo "✅ .env.local 已存在"
else
    echo "📝 创建 .env.local 文件..."

    # 从示例文件复制
    cp .env.example .env.local

    echo ""
    echo "⚠️  重要：请编辑 .env.local 文件，填写真实配置"
    echo ""
    echo "   vim .env.local"
    echo ""
    echo "需要配置的关键变量："
    echo "   - DATABASE_URL (数据库连接)"
    echo "   - DIRECT_URL (Prisma 直连)"
    echo "   - NEXTAUTH_SECRET (认证密钥)"
    echo "   - NEXTAUTH_URL (网站地址)"
    echo "   - NEXT_PUBLIC_SUPABASE_URL (Supabase URL)"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY (Supabase 密钥)"
    echo ""

    read -p "现在编辑配置文件？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        vim .env.local || nano .env.local
    else
        echo "⚠️  记得稍后编辑配置文件！"
    fi
fi

# ==========================================
# 5. 安装依赖
# ==========================================
echo ""
echo "5️⃣  安装项目依赖..."

pnpm install

echo "✅ 依赖安装完成"

# ==========================================
# 6. 生成 Prisma Client
# ==========================================
echo ""
echo "6️⃣  生成 Prisma Client..."

cd packages/database
pnpm db:generate
cd ../..

echo "✅ Prisma Client 生成完成"

# ==========================================
# 7. 构建项目
# ==========================================
echo ""
echo "7️⃣  构建生产版本..."

pnpm build

echo "✅ 项目构建完成"

# ==========================================
# 8. 配置 PM2
# ==========================================
echo ""
echo "8️⃣  配置 PM2 进程管理..."

# 检查是否已有 PM2 进程
if pm2 list | grep -q "$PM2_APP_NAME"; then
    echo "⚠️  PM2 进程已存在，删除旧进程..."
    pm2 delete "$PM2_APP_NAME"
fi

# 启动新进程
echo "   启动 PM2 进程..."
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup

echo "✅ PM2 配置完成"

# ==========================================
# 9. 配置 Nginx（宝塔）
# ==========================================
echo ""
echo "9️⃣  配置 Nginx 反向代理..."

echo ""
echo "⚠️  请在宝塔面板配置反向代理："
echo ""
echo "   1. 打开 宝塔面板 → 网站"
echo "   2. 找到你的域名（adminseohub.xyz）"
echo "   3. 点击 设置 → 反向代理"
echo "   4. 添加反向代理："
echo "      - 代理名称: $PM2_APP_NAME"
echo "      - 目标 URL: http://127.0.0.1:$APP_PORT"
echo "      - 发送域名: \$host"
echo "   5. 保存配置"
echo ""

# ==========================================
# 10. 测试应用
# ==========================================
echo ""
echo "🔟  测试应用..."

sleep 3

# 检查端口
if netstat -tuln | grep -q ":$APP_PORT"; then
    echo "✅ 应用已在端口 $APP_PORT 运行"
else
    echo "⚠️  端口 $APP_PORT 未监听，检查日志"
fi

# 显示 PM2 状态
echo ""
echo "📊 PM2 进程状态:"
pm2 list

# 显示日志
echo ""
echo "📝 最新日志:"
pm2 logs "$PM2_APP_NAME" --lines 20 --nostream

# ==========================================
# 11. 配置自动部署
# ==========================================
echo ""
echo "1️⃣1️⃣  配置自动部署..."

# 创建部署脚本软链接
if [ ! -f "/usr/local/bin/deploy-seo-admin" ]; then
    ln -s "$PROJECT_PATH/scripts/deploy/deploy-production.sh" /usr/local/bin/deploy-seo-admin
    chmod +x /usr/local/bin/deploy-seo-admin
    echo "✅ 创建全局部署命令: deploy-seo-admin"
fi

echo ""
echo "自动部署选项："
echo ""
echo "方案A - GitHub Webhook (推荐):"
echo "   1. 在宝塔面板 → 网站 → 设置 → Webhook"
echo "   2. 添加 Git Webhook"
echo "   3. 脚本内容:"
echo "      cd $PROJECT_PATH"
echo "      git pull origin main"
echo "      pnpm install"
echo "      cd packages/database && pnpm db:generate && cd ../.."
echo "      pnpm build"
echo "      pm2 restart $PM2_APP_NAME"
echo "   4. 复制 Webhook URL"
echo "   5. 在 GitHub 仓库设置中添加 Webhook"
echo ""
echo "方案B - 定时拉取 (Cron):"
echo "   在宝塔面板 → 计划任务 → Shell脚本"
echo "   名称: 自动部署 SEO Admin"
echo "   执行周期: 每小时 或 每天"
echo "   脚本内容: /usr/local/bin/deploy-seo-admin"
echo ""

# ==========================================
# 完成
# ==========================================
echo ""
echo "================================================"
echo "✅ 服务器初始化完成！"
echo "================================================"
echo ""
echo "📋 项目信息:"
echo "   项目路径: $PROJECT_PATH"
echo "   运行端口: $APP_PORT"
echo "   PM2 进程: $PM2_APP_NAME"
echo ""
echo "📋 常用命令:"
echo "   查看状态: pm2 list"
echo "   查看日志: pm2 logs $PM2_APP_NAME"
echo "   重启应用: pm2 restart $PM2_APP_NAME"
echo "   手动部署: deploy-seo-admin"
echo "   或: cd $PROJECT_PATH && bash scripts/deploy/deploy-production.sh"
echo ""
echo "📋 访问地址:"
echo "   https://adminseohub.xyz"
echo ""
echo "📋 下一步:"
echo "   1. 配置 Nginx 反向代理（见上方说明）"
echo "   2. 配置自动部署（Webhook 或 Cron）"
echo "   3. 测试访问网站"
echo ""
echo "================================================"
