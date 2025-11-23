#!/bin/bash

##############################################
# 更新管理员密码 - 完整脚本
# 自动加载环境变量并更新密码
##############################################

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔐 管理员密码更新工具${NC}\n"

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ 错误: 请在项目根目录运行此脚本${NC}"
  echo "当前目录: $(pwd)"
  exit 1
fi

# 检查 .env.local 文件是否存在
if [ ! -f ".env.local" ]; then
  echo -e "${RED}❌ 错误: .env.local 文件不存在${NC}"
  exit 1
fi

echo -e "${GREEN}✓ 找到 .env.local 文件${NC}"

# 加载环境变量
echo -e "${YELLOW}⏳ 加载环境变量...${NC}"
source <(cat .env.local | grep -v '^#' | grep -v '^$' | sed 's/^/export /')

# 验证关键环境变量
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ 错误: DATABASE_URL 未设置${NC}"
  exit 1
fi

echo -e "${GREEN}✓ 环境变量加载成功${NC}\n"

# 运行 Node.js 脚本
node scripts/database/update_admin_password.js

exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo -e "\n${GREEN}🎉 全部完成！现在可以使用新密码登录了。${NC}\n"
else
  echo -e "\n${RED}⚠️  脚本执行失败，请查看上方错误信息。${NC}\n"
fi

exit $exit_code
