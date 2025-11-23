#!/bin/bash

#############################################
# SSL证书自动申请脚本（Let's Encrypt）
# 用途: 为蜘蛛池域名批量申请SSL证书
#############################################

set -e

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
print_step() { echo -e "\n${BLUE}===> $1${NC}\n"; }

#############################################
# 配置
#############################################

# VPS编号
CURRENT_VPS=${1:-1}

# VPS 1 的域名
VPS1_DOMAINS=(
    "autopushnetwork.xyz"
    "contentpoolzone.site"
    "crawlboostnet.xyz"
)

# VPS 2 的域名
VPS2_DOMAINS=(
    "crawlenginepro.xyz"
    "linkpushmatrix.site"
    "rankspiderchain.xyz"
)

# VPS 3 的域名
VPS3_DOMAINS=(
    "seohubnetwork.xyz"
    "spidertrackzone.xyz"
    "trafficboostflow.site"
)

# 邮箱（用于证书通知）
EMAIL="${2:-admin@example.com}"

#############################################
# 函数定义
#############################################

get_domains_for_vps() {
    case $CURRENT_VPS in
        1) echo "${VPS1_DOMAINS[@]}" ;;
        2) echo "${VPS2_DOMAINS[@]}" ;;
        3) echo "${VPS3_DOMAINS[@]}" ;;
        *)
            print_error "无效的VPS编号: $CURRENT_VPS"
            exit 1
            ;;
    esac
}

check_certbot() {
    print_step "检查Certbot"

    if ! command -v certbot &> /dev/null; then
        print_warning "Certbot 未安装，正在安装..."

        # Ubuntu/Debian
        if command -v apt &> /dev/null; then
            apt update
            apt install -y certbot python3-certbot-nginx
        # CentOS/RHEL
        elif command -v yum &> /dev/null; then
            yum install -y certbot python3-certbot-nginx
        else
            print_error "无法自动安装Certbot，请手动安装"
            exit 1
        fi
    fi

    print_success "Certbot 已安装: $(certbot --version)"
}

check_dns() {
    print_step "检查DNS解析"

    local server_ip=$(curl -s https://api.ipify.org)
    print_info "当前服务器IP: $server_ip"
    echo ""

    for domain in $(get_domains_for_vps); do
        local dns_ip=$(dig +short $domain | head -n1)

        if [ "$dns_ip" == "$server_ip" ]; then
            print_success "${domain} DNS解析正确 → $dns_ip"
        else
            print_warning "${domain} DNS解析不正确 → $dns_ip (应为 $server_ip)"
        fi
    done

    echo ""
    read -p "DNS解析检查完成，是否继续申请证书? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "已取消"
        exit 0
    fi
}

apply_ssl_certificates() {
    print_step "申请SSL证书"

    for domain in $(get_domains_for_vps); do
        print_info "正在为 ${domain} 申请证书..."

        # 申请证书（包括www子域名）
        if certbot --nginx \
            -d ${domain} \
            -d www.${domain} \
            --non-interactive \
            --agree-tos \
            --email ${EMAIL} \
            --redirect \
            --hsts; then

            print_success "${domain} 证书申请成功"
        else
            print_error "${domain} 证书申请失败"
            print_warning "可能原因:"
            echo "  1. DNS未正确解析"
            echo "  2. 80端口未开放"
            echo "  3. Nginx配置有误"
            echo "  4. 域名已达Let's Encrypt速率限制"
        fi

        echo ""
    done
}

setup_auto_renewal() {
    print_step "设置自动续期"

    # 测试续期命令
    if certbot renew --dry-run &> /dev/null; then
        print_success "证书续期测试通过"
    else
        print_warning "证书续期测试失败"
    fi

    # 添加cron任务（每天检查一次）
    local cron_cmd="0 3 * * * certbot renew --quiet --post-hook 'nginx -s reload'"

    if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
        (crontab -l 2>/dev/null; echo "$cron_cmd") | crontab -
        print_success "已添加自动续期定时任务"
    else
        print_info "自动续期定时任务已存在"
    fi
}

show_certificate_info() {
    print_step "证书信息"

    echo ""
    print_info "已颁发的证书:"
    certbot certificates 2>/dev/null | grep -E "(Certificate Name:|Domains:|Expiry Date:)" || true
    echo ""
}

show_completion_info() {
    print_step "SSL配置完成"

    echo ""
    print_success "====================================="
    print_success "  SSL证书配置成功！"
    print_success "====================================="
    echo ""

    print_info "VPS $CURRENT_VPS 的HTTPS域名:"
    for domain in $(get_domains_for_vps); do
        echo "  - https://${domain}"
    done
    echo ""

    print_info "证书自动续期:"
    echo "  - Certbot会自动续期（每天检查）"
    echo "  - 手动续期: certbot renew"
    echo "  - 查看证书: certbot certificates"
    echo ""

    print_warning "测试HTTPS:"
    for domain in $(get_domains_for_vps | head -n1); do
        echo "  curl https://${domain}/sitemap.xml"
        break
    done
    echo ""
}

#############################################
# 主流程
#############################################

main() {
    echo ""
    print_info "====================================="
    print_info "  SSL证书自动申请脚本"
    print_info "  VPS: $CURRENT_VPS"
    print_info "  邮箱: $EMAIL"
    print_info "====================================="
    echo ""

    # 检查root权限
    if [ "$EUID" -ne 0 ]; then
        print_error "请使用root用户运行"
        print_info "使用: sudo bash $0 $CURRENT_VPS your-email@example.com"
        exit 1
    fi

    # 提示修改邮箱
    if [ "$EMAIL" == "admin@example.com" ]; then
        print_warning "使用默认邮箱，建议修改为您的真实邮箱"
        print_info "使用: bash $0 $CURRENT_VPS your-email@example.com"
        echo ""
    fi

    check_certbot
    check_dns
    apply_ssl_certificates
    setup_auto_renewal
    show_certificate_info
    show_completion_info

    print_success "🎉 所有操作完成！"
}

# 错误处理
trap 'print_error "SSL配置过程中发生错误"; exit 1' ERR

# 运行
main
