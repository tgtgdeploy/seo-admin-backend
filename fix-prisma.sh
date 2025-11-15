#!/bin/bash
# Prisma Client 问题彻底修复脚本

set -e

echo "🔍 诊断Prisma Client问题..."
echo "================================================"

# 1. 检查当前目录
echo ""
echo "1️⃣ 当前目录:"
pwd

# 2. 检查package.json是否存在
echo ""
echo "2️⃣ 检查项目文件:"
ls -la package.json packages/database/package.json 2>/dev/null || echo "❌ package.json缺失"

# 3. 检查node_modules/@prisma/client
echo ""
echo "3️⃣ 检查@prisma/client安装状态:"
if [ -d "node_modules/@prisma/client" ]; then
    echo "✅ node_modules/@prisma/client 存在"
    ls -la node_modules/@prisma/client/ | head -10
else
    echo "❌ node_modules/@prisma/client 不存在"
fi

if [ -d "node_modules/.prisma/client" ]; then
    echo "✅ node_modules/.prisma/client 存在"
    ls -la node_modules/.prisma/client/ | head -10
else
    echo "❌ node_modules/.prisma/client 不存在"
fi

# 4. 检查packages/database/node_modules
echo ""
echo "4️⃣ 检查database包的node_modules:"
if [ -d "packages/database/node_modules/@prisma/client" ]; then
    echo "✅ packages/database/node_modules/@prisma/client 存在"
else
    echo "❌ packages/database/node_modules/@prisma/client 不存在"
fi

# 5. 检查Prisma schema
echo ""
echo "5️⃣ 检查Prisma schema:"
if [ -f "packages/database/prisma/schema.prisma" ]; then
    echo "✅ schema.prisma 存在"
    head -20 packages/database/prisma/schema.prisma
else
    echo "❌ schema.prisma 不存在"
fi

echo ""
echo "================================================"
echo "🔧 开始修复..."
echo "================================================"

# 清理
echo ""
echo "1️⃣ 清理旧文件..."
rm -rf node_modules
rm -rf packages/database/node_modules
rm -rf .next
rm -rf packages/database/.next
rm -rf node_modules/.cache
echo "✅ 清理完成"

# 安装依赖
echo ""
echo "2️⃣ 安装依赖..."
pnpm install
echo "✅ 依赖安装完成"

# 检查@prisma/client是否在package.json中
echo ""
echo "3️⃣ 检查依赖配置..."
if grep -q "@prisma/client" packages/database/package.json; then
    echo "✅ packages/database/package.json 中有 @prisma/client"
else
    echo "⚠️  packages/database/package.json 中没有 @prisma/client"
    echo "正在添加..."
    cd packages/database
    pnpm add @prisma/client
    cd ../..
fi

# 生成Prisma Client
echo ""
echo "4️⃣ 生成Prisma Client..."
cd packages/database
pnpm prisma generate
cd ../..
echo "✅ Prisma Client 生成完成"

# 验证安装
echo ""
echo "5️⃣ 验证安装..."
if [ -d "node_modules/@prisma/client" ]; then
    echo "✅ node_modules/@prisma/client 已安装"
    ls -la node_modules/@prisma/client/ | head -5
else
    echo "❌ node_modules/@prisma/client 仍然缺失"
    echo "尝试手动安装..."
    pnpm add @prisma/client
fi

if [ -d "node_modules/.prisma/client" ]; then
    echo "✅ node_modules/.prisma/client 已生成"
    ls -la node_modules/.prisma/client/ | head -5
else
    echo "❌ node_modules/.prisma/client 仍然缺失"
fi

# 检查是否可以导入
echo ""
echo "6️⃣ 测试Prisma Client导入..."
cat > test-prisma.js << 'EOF'
try {
  const { PrismaClient } = require('@prisma/client');
  console.log('✅ Prisma Client 导入成功');
  console.log('✅ PrismaClient:', typeof PrismaClient);
} catch (error) {
  console.log('❌ Prisma Client 导入失败:', error.message);
}
EOF

node test-prisma.js
rm test-prisma.js

echo ""
echo "================================================"
echo "7️⃣ 开始构建..."
echo "================================================"

# 设置内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

# 构建
pnpm build

echo ""
echo "================================================"
echo "✅ 修复完成！"
echo "================================================"
echo ""
echo "下一步:"
echo "  pm2 restart seo-admin"
echo "  pm2 logs seo-admin"
echo ""
