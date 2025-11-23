#!/bin/bash
# 一键初始化整个SEO系统
# One-click initialization for complete SEO system

set -e

echo "🚀 开始初始化SEO管理系统..."
echo "================================================"

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 1. 检查数据库连接
echo ""
echo "📊 检查数据库连接..."
node check_db.js

# 2. 运行完整系统配置
echo ""
echo "🔧 配置系统数据..."
node setup-complete-system.js

# 3. 重启PM2应用
echo ""
echo "🔄 重启应用..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "seo-admin"; then
        pm2 restart seo-admin
        sleep 3
        pm2 logs seo-admin --lines 10 --nostream
    else
        echo "⚠️  PM2进程未找到，请手动启动: pm2 start ecosystem.config.js"
    fi
else
    echo "⚠️  PM2未安装，请手动重启应用"
fi

# 4. 健康检查
echo ""
echo "🏥 健康检查..."
sleep 2
if curl -f http://localhost:3100/api/health > /dev/null 2>&1; then
    echo "✅ 应用运行正常！"
else
    echo "⚠️  警告: 健康检查失败"
fi

echo ""
echo "================================================"
echo "✅ 系统初始化完成！"
echo ""
echo "📋 已配置:"
echo "   ✓ 3个主站网站 (telegramtghub.com, telegramupdatecenter.com, telegramtrendguide.com)"
echo "   ✓ 5篇示例文章"
echo "   ✓ 7个关键词追踪"
echo "   ✓ 网站地图生成"
echo "   ✓ 9个蜘蛛池域名配置"
echo ""
echo "🌐 访问管理后台:"
echo "   https://adminseohub.xyz"
echo ""
echo "📝 查看日志:"
echo "   pm2 logs seo-admin"
echo ""
echo "================================================"
