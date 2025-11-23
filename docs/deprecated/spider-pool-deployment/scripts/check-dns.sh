#!/bin/bash

#############################################
# DNS解析检查脚本
# 用途: 检查所有域名的DNS解析是否正确
#############################################

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }

# 所有域名
ALL_DOMAINS=(
    # VPS 1
    "autopushnetwork.xyz"
    "contentpoolzone.site"
    "crawlboostnet.xyz"
    # VPS 2
    "crawlenginepro.xyz"
    "linkpushmatrix.site"
    "rankspiderchain.xyz"
    # VPS 3
    "seohubnetwork.xyz"
    "spidertrackzone.xyz"
    "trafficboostflow.site"
)

# VPS IP配置（实际生产环境IP）
VPS1_IP="${VPS1_IP:-95.111.231.110}"
VPS2_IP="${VPS2_IP:-37.60.254.52}"
VPS3_IP="${VPS3_IP:-75.119.154.120}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "        DNS 解析检查工具"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

print_info "VPS IP配置:"
echo "  VPS 1: $VPS1_IP"
echo "  VPS 2: $VPS2_IP"
echo "  VPS 3: $VPS3_IP"
echo ""

if [ "$VPS1_IP" == "未配置" ]; then
    print_warning "使用默认IP地址，或设置环境变量自定义:"
    echo "  export VPS1_IP=your-vps1-ip"
    echo "  export VPS2_IP=your-vps2-ip"
    echo "  export VPS3_IP=your-vps3-ip"
    echo ""
fi

echo "域名                          解析IP              期望IP          状态"
echo "────────────────────────────────────────────────────────────────────"

check_domain() {
    local domain=$1
    local expected_ip=$2

    # 获取DNS解析结果
    local resolved_ip=$(dig +short $domain | head -n1)

    if [ -z "$resolved_ip" ]; then
        printf "%-28s %-18s %-15s ${RED}✗ 未解析${NC}\n" "$domain" "无" "$expected_ip"
        return 1
    elif [ "$resolved_ip" == "$expected_ip" ]; then
        printf "%-28s %-18s %-15s ${GREEN}✓ 正确${NC}\n" "$domain" "$resolved_ip" "$expected_ip"
        return 0
    else
        printf "%-28s %-18s %-15s ${YELLOW}⚠ 不匹配${NC}\n" "$domain" "$resolved_ip" "$expected_ip"
        return 1
    fi
}

# VPS 1 域名
for domain in "autopushnetwork.xyz" "contentpoolzone.site" "crawlboostnet.xyz"; do
    check_domain "$domain" "$VPS1_IP"
done

# VPS 2 域名
for domain in "crawlenginepro.xyz" "linkpushmatrix.site" "rankspiderchain.xyz"; do
    check_domain "$domain" "$VPS2_IP"
done

# VPS 3 域名
for domain in "seohubnetwork.xyz" "spidertrackzone.xyz" "trafficboostflow.site"; do
    check_domain "$domain" "$VPS3_IP"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "检查完成: $(date '+%Y-%m-%d %H:%M:%S')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

print_info "提示:"
echo "  - DNS解析需要时间传播，通常5-30分钟"
echo "  - 使用 dig 命令手动检查: dig domain.com"
echo "  - 检查NS服务器: dig NS domain.com"
echo ""
