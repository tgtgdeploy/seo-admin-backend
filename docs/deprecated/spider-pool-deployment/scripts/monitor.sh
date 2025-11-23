#!/bin/bash

#############################################
# 蜘蛛池监控脚本
# 用途: 监控所有域名的可用性和性能
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

# VPS编号
CURRENT_VPS=${1:-1}

# 域名配置
VPS1_DOMAINS=("autopushnetwork.xyz" "contentpoolzone.site" "crawlboostnet.xyz")
VPS2_DOMAINS=("crawlenginepro.xyz" "linkpushmatrix.site" "rankspiderchain.xyz")
VPS3_DOMAINS=("seohubnetwork.xyz" "spidertrackzone.xyz" "trafficboostflow.site")

get_domains() {
    case $CURRENT_VPS in
        1) echo "${VPS1_DOMAINS[@]}" ;;
        2) echo "${VPS2_DOMAINS[@]}" ;;
        3) echo "${VPS3_DOMAINS[@]}" ;;
        *) echo "${VPS1_DOMAINS[@]} ${VPS2_DOMAINS[@]} ${VPS3_DOMAINS[@]}" ;;
    esac
}

check_domain() {
    local domain=$1
    local protocol=${2:-https}
    local url="${protocol}://${domain}/"

    # 检查HTTP响应
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null)
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "$url" 2>/dev/null)

    if [ "$status" = "200" ]; then
        printf "%-30s ${GREEN}✓ OK${NC}     状态: %s  响应: %.2fs\n" "$domain" "$status" "$response_time"
        return 0
    else
        printf "%-30s ${RED}✗ FAIL${NC}   状态: %s\n" "$domain" "$status"
        return 1
    fi
}

check_sitemap() {
    local domain=$1
    local protocol=${2:-https}
    local url="${protocol}://${domain}/sitemap.xml"

    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null)

    if [ "$status" = "200" ]; then
        echo -e "  └─ Sitemap: ${GREEN}✓${NC}"
        return 0
    else
        echo -e "  └─ Sitemap: ${RED}✗ ($status)${NC}"
        return 1
    fi
}

check_ssl() {
    local domain=$1

    if echo | timeout 5 openssl s_client -connect ${domain}:443 -servername ${domain} 2>/dev/null | grep -q "Verify return code: 0"; then
        echo -e "  └─ SSL证书: ${GREEN}✓ 有效${NC}"
        return 0
    else
        echo -e "  └─ SSL证书: ${RED}✗ 无效或未配置${NC}"
        return 1
    fi
}

show_nginx_stats() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Nginx 状态"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    if systemctl is-active --quiet nginx; then
        print_success "Nginx运行中"
    else
        print_error "Nginx未运行"
    fi

    # 显示连接数
    local connections=$(ss -ant | grep ':80\|:443' | wc -l)
    print_info "当前连接数: $connections"
}

show_crawler_stats() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "最近24小时爬虫访问统计"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    if [ ! -d "/www/wwwlogs" ]; then
        print_warning "日志目录不存在"
        return
    fi

    # 统计各爬虫访问次数
    local log_files="/www/wwwlogs/*-access.log"

    echo ""
    echo "爬虫类型              访问次数"
    echo "─────────────────────────────"

    # Googlebot
    local google_count=$(grep -i "googlebot" $log_files 2>/dev/null | wc -l)
    printf "%-20s %s\n" "🔍 Googlebot" "$google_count"

    # Bingbot
    local bing_count=$(grep -i "bingbot" $log_files 2>/dev/null | wc -l)
    printf "%-20s %s\n" "🦅 Bingbot" "$bing_count"

    # Baiduspider
    local baidu_count=$(grep -i "baiduspider" $log_files 2>/dev/null | wc -l)
    printf "%-20s %s\n" "🐻 Baiduspider" "$baidu_count"

    # 其他
    local other_count=$(grep -iE "bot|crawl|spider" $log_files 2>/dev/null | grep -viE "googlebot|bingbot|baiduspider" | wc -l)
    printf "%-20s %s\n" "🤖 其他爬虫" "$other_count"

    echo ""
    local total=$((google_count + bing_count + baidu_count + other_count))
    print_info "总计: $total 次爬虫访问"
}

main() {
    clear
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "        蜘蛛池监控 - VPS $CURRENT_VPS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    local total=0
    local success=0
    local failed=0

    for domain in $(get_domains); do
        ((total++))

        # 先尝试HTTPS，失败则尝试HTTP
        if check_domain "$domain" "https"; then
            ((success++))
            check_ssl "$domain"
            check_sitemap "$domain" "https"
        elif check_domain "$domain" "http"; then
            ((success++))
            print_warning "  └─ 仅支持HTTP，建议配置SSL"
            check_sitemap "$domain" "http"
        else
            ((failed++))
            print_error "  └─ 域名无法访问"
        fi

        echo ""
    done

    # 统计
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "监控统计"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    printf "总域名数: %d  |  " "$total"
    printf "${GREEN}正常: %d${NC}  |  " "$success"
    printf "${RED}故障: %d${NC}\n" "$failed"

    if [ $failed -eq 0 ]; then
        print_success "所有域名运行正常"
    else
        print_warning "有 $failed 个域名存在问题"
    fi

    show_nginx_stats
    show_crawler_stats

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "监控时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

main
