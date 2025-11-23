#!/bin/bash

#############################################
# 蜘蛛池 Nginx 自动部署脚本
# 用途: 一键部署所有域名的Nginx配置
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
# 当前VPS需要部署的域名（根据VPS修改）
#############################################

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

#############################################
# 配置 - 请根据实际情况修改
#############################################

# 选择当前VPS（1, 2 或 3）
CURRENT_VPS=${1:-1}

# Nginx配置目录
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"

# 如果使用宝塔面板，路径可能是：
# NGINX_SITES_AVAILABLE="/www/server/panel/vhost/nginx"

#############################################
# 函数定义
#############################################

get_domains_for_vps() {
    case $CURRENT_VPS in
        1)
            echo "${VPS1_DOMAINS[@]}"
            ;;
        2)
            echo "${VPS2_DOMAINS[@]}"
            ;;
        3)
            echo "${VPS3_DOMAINS[@]}"
            ;;
        *)
            print_error "无效的VPS编号: $CURRENT_VPS"
            exit 1
            ;;
    esac
}

check_nginx() {
    print_step "检查Nginx"

    if ! command -v nginx &> /dev/null; then
        print_error "Nginx 未安装"
        print_info "请先安装Nginx: apt install nginx 或使用宝塔面板"
        exit 1
    fi

    print_success "Nginx 已安装: $(nginx -v 2>&1)"
}

backup_existing_configs() {
    print_step "备份现有配置"

    local backup_dir="/root/nginx-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"

    for domain in $(get_domains_for_vps); do
        if [ -f "${NGINX_SITES_AVAILABLE}/${domain}.conf" ]; then
            cp "${NGINX_SITES_AVAILABLE}/${domain}.conf" "$backup_dir/"
            print_info "备份: ${domain}.conf"
        fi
    done

    print_success "配置已备份到: $backup_dir"
}

deploy_nginx_configs() {
    print_step "部署Nginx配置"

    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
    local config_dir="${script_dir}/nginx-configs"

    for domain in $(get_domains_for_vps); do
        local config_file="${config_dir}/${domain}.conf"

        if [ ! -f "$config_file" ]; then
            print_warning "配置文件不存在: ${domain}.conf"
            continue
        fi

        # 复制到 sites-available
        cp "$config_file" "${NGINX_SITES_AVAILABLE}/${domain}.conf"
        print_success "已复制: ${domain}.conf"

        # 创建软链接到 sites-enabled
        if [ -d "$NGINX_SITES_ENABLED" ]; then
            ln -sf "${NGINX_SITES_AVAILABLE}/${domain}.conf" "${NGINX_SITES_ENABLED}/${domain}.conf"
            print_success "已启用: ${domain}.conf"
        fi
    done
}

test_nginx_config() {
    print_step "测试Nginx配置"

    if nginx -t 2>&1; then
        print_success "Nginx配置测试通过"
        return 0
    else
        print_error "Nginx配置测试失败"
        print_warning "请检查配置文件并修复错误"
        return 1
    fi
}

reload_nginx() {
    print_step "重载Nginx"

    if systemctl reload nginx 2>&1; then
        print_success "Nginx已重载"
    elif service nginx reload 2>&1; then
        print_success "Nginx已重载"
    else
        print_error "Nginx重载失败"
        print_warning "请手动执行: nginx -s reload"
        return 1
    fi
}

create_log_directory() {
    print_step "创建日志目录"

    if [ ! -d "/www/wwwlogs" ]; then
        mkdir -p /www/wwwlogs
        print_success "已创建日志目录: /www/wwwlogs"
    else
        print_info "日志目录已存在: /www/wwwlogs"
    fi
}

show_deployment_info() {
    print_step "部署完成"

    echo ""
    print_success "====================================="
    print_success "  蜘蛛池Nginx部署成功！"
    print_success "====================================="
    echo ""

    print_info "VPS $CURRENT_VPS 已部署的域名:"
    for domain in $(get_domains_for_vps); do
        echo "  - http://${domain}"
    done
    echo ""

    print_warning "下一步操作:"
    echo "  1. 配置DNS - 将域名解析到当前VPS的IP"
    echo "  2. 申请SSL证书 - 运行: bash scripts/ssl.sh $CURRENT_VPS"
    echo "  3. 测试访问 - 在浏览器访问域名"
    echo "  4. 提交sitemap - 访问: http://域名/sitemap.xml"
    echo ""

    print_info "有用的命令:"
    echo "  - 查看Nginx状态: systemctl status nginx"
    echo "  - 查看访问日志: tail -f /www/wwwlogs/*.log"
    echo "  - 重载Nginx: nginx -s reload"
    echo "  - 测试配置: nginx -t"
    echo ""
}

#############################################
# 主流程
#############################################

main() {
    echo ""
    print_info "====================================="
    print_info "  蜘蛛池Nginx自动部署脚本"
    print_info "  当前VPS: $CURRENT_VPS"
    print_info "====================================="
    echo ""

    # 检查是否为root用户
    if [ "$EUID" -ne 0 ]; then
        print_error "请使用root用户运行此脚本"
        print_info "使用: sudo bash $0 $CURRENT_VPS"
        exit 1
    fi

    # 确认部署
    print_warning "即将为VPS $CURRENT_VPS 部署 $(get_domains_for_vps | wc -w) 个域名的Nginx配置"
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "部署已取消"
        exit 0
    fi

    # 执行部署步骤
    check_nginx
    create_log_directory
    backup_existing_configs
    deploy_nginx_configs

    if test_nginx_config; then
        reload_nginx
        show_deployment_info
    else
        print_error "部署失败，配置未应用"
        exit 1
    fi

    print_success "🎉 部署完成！"
}

# 错误处理
trap 'print_error "部署过程中发生错误"; exit 1' ERR

# 运行主流程
main
