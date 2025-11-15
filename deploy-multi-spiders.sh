#!/bin/bash

#############################################
# 9域名分布式蜘蛛池自动化部署脚本
# 部署到3台VPS服务器
#############################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_step() { echo -e "\n${PURPLE}===> $1${NC}\n"; }

#############################################
# 配置区域 - 请修改为你的VPS信息
#############################################

# VPS 1 配置
VPS1_USER="root"
VPS1_HOST="your-vps1-ip"  # 修改为VPS1的IP
VPS1_DOMAINS=(
    "autopushnetwork.xyz"
    "contentpoolzone.site"
    "crawlboostnet.xyz"
)

# VPS 2 配置
VPS2_USER="root"
VPS2_HOST="your-vps2-ip"  # 修改为VPS2的IP
VPS2_DOMAINS=(
    "crawlenginepro.xyz"
    "linkpushmatrix.site"
    "rankspiderchain.xyz"
)

# VPS 3 配置
VPS3_USER="root"
VPS3_HOST="your-vps3-ip"  # 修改为VPS3的IP
VPS3_DOMAINS=(
    "seohubnetwork.xyz"
    "spidertrackzone.xyz"
    "trafficboostflow.site"
)

# 本地路径
LOCAL_PATH="packages/database/multi-spider-pools"
REMOTE_PATH="/www/wwwroot"

#############################################
# 函数定义
#############################################

# 检查本地文件
check_local_files() {
    print_step "检查本地文件"

    if [ ! -d "$LOCAL_PATH" ]; then
        print_error "蜘蛛池目录不存在: $LOCAL_PATH"
        print_info "请先运行: npx tsx packages/database/generate-multi-spider-pools.ts"
        exit 1
    fi

    DOMAIN_COUNT=$(ls -1d ${LOCAL_PATH}/* 2>/dev/null | wc -l)
    if [ "$DOMAIN_COUNT" -ne 9 ]; then
        print_error "应该有9个域名目录，但只找到 $DOMAIN_COUNT 个"
        exit 1
    fi

    print_success "找到 $DOMAIN_COUNT 个域名目录"
}

# 测试VPS连接
test_vps_connection() {
    local vps_host=$1
    local vps_name=$2

    print_info "测试 $vps_name 连接..."

    if ssh -o ConnectTimeout=5 -o BatchMode=yes ${VPS1_USER}@${vps_host} "echo 'OK'" &>/dev/null; then
        print_success "$vps_name 连接正常"
        return 0
    else
        print_error "$vps_name 连接失败"
        print_warning "请确保："
        print_info "  1. VPS IP 正确"
        print_info "  2. SSH密钥已配置"
        print_info "  3. 防火墙允许SSH连接"
        return 1
    fi
}

# 部署到单个VPS
deploy_to_vps() {
    local vps_user=$1
    local vps_host=$2
    local vps_name=$3
    shift 3
    local domains=("$@")

    print_step "部署到 $vps_name ($vps_host)"

    for domain in "${domains[@]}"; do
        print_info "部署 $domain..."

        # 创建远程目录
        ssh ${vps_user}@${vps_host} "mkdir -p ${REMOTE_PATH}/${domain}"

        # 上传文件
        rsync -avz --progress \
            ${LOCAL_PATH}/${domain}/ \
            ${vps_user}@${vps_host}:${REMOTE_PATH}/${domain}/ || {
            print_error "$domain 上传失败"
            continue
        }

        # 设置权限
        ssh ${vps_user}@${vps_host} "chmod -R 755 ${REMOTE_PATH}/${domain}"

        print_success "$domain 部署完成"
    done
}

# 生成Nginx配置
generate_nginx_config() {
    local domain=$1
    local vps_host=$2

    cat > "/tmp/${domain}.conf" << EOF
# Nginx configuration for ${domain}
# Generated on $(date)

server {
    listen 80;
    server_name ${domain} www.${domain};

    root ${REMOTE_PATH}/${domain};
    index index.html;

    # 日志
    access_log /www/wwwlogs/${domain}-access.log;
    error_log /www/wwwlogs/${domain}-error.log;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/html text/css application/javascript application/xml application/json;

    # 缓存控制
    location ~* \\.html\$ {
        expires 12h;
        add_header Cache-Control "public, must-revalidate";
    }

    location ~* \\.(xml|txt)\$ {
        expires 1d;
    }

    # 静态文件
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 404 处理
    error_page 404 /index.html;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 禁止访问隐藏文件
    location ~ /\\. {
        deny all;
    }
}

# SSL 配置 (使用 certbot 自动配置)
# certbot --nginx -d ${domain} -d www.${domain}
EOF

    print_success "已生成 ${domain} 的Nginx配置: /tmp/${domain}.conf"
}

# 显示Nginx配置说明
show_nginx_instructions() {
    print_step "Nginx 配置说明"

    print_info "已为所有域名生成Nginx配置文件到 /tmp/ 目录"
    echo ""
    print_warning "请在每台VPS上执行以下操作："
    echo ""
    print_info "方法 1: 使用宝塔面板"
    echo "  1. 登录宝塔面板"
    echo "  2. 网站 → 添加站点"
    echo "  3. 输入域名，选择纯静态"
    echo "  4. 重复9次，为所有域名添加"
    echo ""
    print_info "方法 2: 手动配置Nginx"
    echo "  1. 将 /tmp/*.conf 上传到 VPS"
    echo "  2. 复制到 /etc/nginx/sites-available/"
    echo "  3. 创建软链接到 /etc/nginx/sites-enabled/"
    echo "  4. nginx -t 测试配置"
    echo "  5. nginx -s reload 重载配置"
    echo ""
}

# 显示DNS配置说明
show_dns_instructions() {
    print_step "DNS 配置说明"

    echo ""
    print_info "请在域名DNS提供商配置A记录："
    echo ""

    print_warning "VPS 1 ($VPS1_HOST):"
    for domain in "${VPS1_DOMAINS[@]}"; do
        echo "  ${domain} → A → ${VPS1_HOST}"
    done
    echo ""

    print_warning "VPS 2 ($VPS2_HOST):"
    for domain in "${VPS2_DOMAINS[@]}"; do
        echo "  ${domain} → A → ${VPS2_HOST}"
    done
    echo ""

    print_warning "VPS 3 ($VPS3_HOST):"
    for domain in "${VPS3_DOMAINS[@]}"; do
        echo "  ${domain} → A → ${VPS3_HOST}"
    done
    echo ""
}

# 测试部署结果
test_deployment() {
    print_step "测试部署"

    local all_domains=(
        "${VPS1_DOMAINS[@]}"
        "${VPS2_DOMAINS[@]}"
        "${VPS3_DOMAINS[@]}"
    )

    print_info "等待5秒..."
    sleep 5

    for domain in "${all_domains[@]}"; do
        if curl -s -f "http://${domain}" > /dev/null 2>&1; then
            print_success "${domain}: 可访问"
        else
            print_warning "${domain}: 暂时无法访问（可能DNS未生效）"
        fi
    done
}

# 显示部署总结
show_summary() {
    print_step "部署完成总结"

    echo ""
    print_success "===================================="
    print_success "  🕷️  蜘蛛池部署成功！"
    print_success "===================================="
    echo ""

    print_info "部署统计:"
    echo "  - 域名数量: 9个"
    echo "  - VPS数量: 3台"
    echo "  - 总页面数: 1,350页"
    echo ""

    print_info "域名列表:"
    for domain in "${VPS1_DOMAINS[@]}" "${VPS2_DOMAINS[@]}" "${VPS3_DOMAINS[@]}"; do
        echo "  - https://${domain}"
    done
    echo ""

    print_warning "下一步操作:"
    echo "  1. ✅ 配置DNS (见上方说明)"
    echo "  2. ✅ 配置Nginx (见上方说明)"
    echo "  3. ✅ 申请SSL证书"
    echo "  4. ✅ 提交Sitemap到搜索引擎"
    echo "  5. ✅ 监控爬虫访问日志"
    echo ""

    print_info "SSL 证书申请:"
    echo "  certbot --nginx -d autopushnetwork.xyz -d www.autopushnetwork.xyz"
    echo "  # 对所有9个域名重复执行"
    echo ""

    print_info "Sitemap 地址:"
    for domain in "${VPS1_DOMAINS[@]}" "${VPS2_DOMAINS[@]}" "${VPS3_DOMAINS[@]}"; do
        echo "  - https://${domain}/sitemap.xml"
    done
    echo ""
}

#############################################
# 主流程
#############################################

main() {
    echo ""
    print_info "===================================="
    print_info "  🕷️  分布式蜘蛛池部署脚本"
    print_info "===================================="
    echo ""

    # 显示配置信息
    print_info "配置信息:"
    echo "  VPS 1: $VPS1_HOST (${#VPS1_DOMAINS[@]}个域名)"
    echo "  VPS 2: $VPS2_HOST (${#VPS2_DOMAINS[@]}个域名)"
    echo "  VPS 3: $VPS3_HOST (${#VPS3_DOMAINS[@]}个域名)"
    echo ""

    # 确认继续
    read -p "是否继续部署？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "部署已取消"
        exit 0
    fi

    # 执行部署步骤
    check_local_files

    # 测试连接
    test_vps_connection "$VPS1_HOST" "VPS 1" || print_warning "VPS 1 连接失败，将跳过"
    test_vps_connection "$VPS2_HOST" "VPS 2" || print_warning "VPS 2 连接失败，将跳过"
    test_vps_connection "$VPS3_HOST" "VPS 3" || print_warning "VPS 3 连接失败，将跳过"

    # 部署到各个VPS
    deploy_to_vps "$VPS1_USER" "$VPS1_HOST" "VPS 1" "${VPS1_DOMAINS[@]}"
    deploy_to_vps "$VPS2_USER" "$VPS2_HOST" "VPS 2" "${VPS2_DOMAINS[@]}"
    deploy_to_vps "$VPS3_USER" "$VPS3_HOST" "VPS 3" "${VPS3_DOMAINS[@]}"

    # 生成Nginx配置
    print_step "生成Nginx配置文件"
    for domain in "${VPS1_DOMAINS[@]}" "${VPS2_DOMAINS[@]}" "${VPS3_DOMAINS[@]}"; do
        generate_nginx_config "$domain" "$VPS1_HOST"
    done

    # 显示配置说明
    show_nginx_instructions
    show_dns_instructions

    # 测试部署
    test_deployment

    # 显示总结
    show_summary

    print_success "🎉 部署流程全部完成！"
}

# 错误处理
trap 'print_error "部署过程中发生错误"; exit 1' ERR

# 运行主流程
main
