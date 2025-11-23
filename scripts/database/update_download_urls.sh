#!/bin/bash

##############################################
# 更新所有网站下载链接 - 完整脚本
# 将所有网站的下载链接更新为统一的纯净下载站
##############################################

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  ${YELLOW}📡 统一下载链接配置工具${NC}                                  ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

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
node scripts/database/update_download_urls.js

exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║${NC}  ${GREEN}🎉 全部完成！所有网站现在都使用统一的下载站${NC}          ${GREEN}║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}\n"
else
  echo -e "\n${RED}⚠️  脚本执行失败，请查看上方错误信息。${NC}\n"
fi

exit $exit_code
