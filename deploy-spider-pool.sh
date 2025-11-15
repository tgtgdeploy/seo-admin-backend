#!/bin/bash

#############################################
# 蜘蛛池自动化部署脚本
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
# 配置区域
#############################################

# 服务器配置
SERVER_USER="root"
SERVER_HOST="your-server-ip"  # 修改为你的服务器IP
SERVER_PATH="/www/wwwroot/spider-pool"

# 本地路径
LOCAL_PATH="packages/database/spider-pool-pages"

# 域名配置（可选）
DOMAIN="spider1.yourdomain.com"  # 修改为你的域名

#############################################
# 函数定义
#############################################

# 检查本地文件
check_local_files() {
    print_step "检查本地文件"

    if [ ! -d "$LOCAL_PATH" ]; then
        print_error "蜘蛛池页面目录不存在: $LOCAL_PATH"
        print_info "请先运行: npx tsx packages/database/extract-html-to-spider-pool.ts"
        exit 1
    fi

    FILE_COUNT=$(ls -1 "$LOCAL_PATH"/*.html 2>/dev/null | wc -l)
    if [ "$FILE_COUNT" -eq 0 ]; then
        print_error "没有找到HTML文件"
        exit 1
    fi

    print_success "找到 $FILE_COUNT 个HTML文件"
}

# 创建服务器目录
create_remote_directory() {
    print_step "创建服务器目录"

    ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_PATH}" || {
        print_error "无法连接到服务器"
        exit 1
    }

    print_success "服务器目录已创建: $SERVER_PATH"
}

# 上传文件
upload_files() {
    print_step "上传文件到服务器"

    print_info "正在上传..."

    rsync -avz --progress ${LOCAL_PATH}/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/ || {
        print_error "文件上传失败"
        exit 1
    }

    print_success "文件上传完成"
}

# 设置权限
set_permissions() {
    print_step "设置文件权限"

    ssh ${SERVER_USER}@${SERVER_HOST} "chmod -R 755 ${SERVER_PATH}"

    print_success "权限设置完成"
}

# 生成 Nginx 配置
generate_nginx_config() {
    print_step "生成 Nginx 配置"

    local NGINX_CONFIG="/tmp/spider-pool-nginx.conf"

    cat > "$NGINX_CONFIG" << EOF
server {
    listen 80;
    server_name ${DOMAIN};

    root ${SERVER_PATH};
    index page-0001.html;

    # 自动索引
    autoindex on;
    autoindex_exact_size off;
    autoindex_localtime on;

    # 日志
    access_log /www/wwwlogs/spider-pool-access.log;
    error_log /www/wwwlogs/spider-pool-error.log;

    # Gzip 压缩
    gzip on;
    gzip_types text/html text/css application/javascript;
    gzip_comp_level 6;

    # 缓存控制
    location ~* \.(html)$ {
        expires 1d;
        add_header Cache-Control "public, must-revalidate";
    }

    # 404 随机跳转
    error_page 404 =200 /page-0001.html;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
}
EOF

    print_info "Nginx 配置已生成: $NGINX_CONFIG"
    print_info "请手动将此配置添加到 Nginx 或宝塔面板"
    cat "$NGINX_CONFIG"
}

# 生成 Sitemap
generate_sitemap() {
    print_step "生成 Sitemap"

    local SITEMAP_FILE="${LOCAL_PATH}/sitemap.xml"

    echo '<?xml version="1.0" encoding="UTF-8"?>' > "$SITEMAP_FILE"
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' >> "$SITEMAP_FILE"

    for file in ${LOCAL_PATH}/page-*.html; do
        filename=$(basename "$file")
        echo "  <url><loc>http://${DOMAIN}/${filename}</loc></url>" >> "$SITEMAP_FILE"
    done

    echo '</urlset>' >> "$SITEMAP_FILE"

    # 上传 sitemap
    scp "$SITEMAP_FILE" ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

    print_success "Sitemap 已生成并上传"
}

# 生成 robots.txt
generate_robots() {
    print_step "生成 robots.txt"

    local ROBOTS_FILE="${LOCAL_PATH}/robots.txt"

    cat > "$ROBOTS_FILE" << EOF
User-agent: *
Allow: /

Sitemap: http://${DOMAIN}/sitemap.xml
EOF

    # 上传 robots.txt
    scp "$ROBOTS_FILE" ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

    print_success "robots.txt 已生成并上传"
}

# 测试连接
test_deployment() {
    print_step "测试部署"

    print_info "等待3秒..."
    sleep 3

    if curl -s -f "http://${DOMAIN}/page-0001.html" > /dev/null; then
        print_success "部署测试通过"
    else
        print_warning "无法访问页面，请检查："
        print_info "  1. Nginx 配置是否正确"
        print_info "  2. 域名DNS是否指向服务器"
        print_info "  3. 防火墙是否开放 80 端口"
    fi
}

# 显示部署信息
show_deployment_info() {
    print_step "部署完成！"

    echo ""
    print_success "===================================="
    print_success "  🕷️  蜘蛛池部署成功！"
    print_success "===================================="
    echo ""

    print_info "访问地址:"
    echo "  - 主页: http://${DOMAIN}/page-0001.html"
    echo "  - Sitemap: http://${DOMAIN}/sitemap.xml"
    echo "  - Robots: http://${DOMAIN}/robots.txt"
    echo ""

    print_info "文件位置:"
    echo "  - 服务器路径: ${SERVER_PATH}"
    echo "  - 页面数量: $(ls -1 "$LOCAL_PATH"/*.html | wc -l)"
    echo ""

    print_info "下一步:"
    echo "  1. 配置 Nginx（见上方配置）"
    echo "  2. 提交 Sitemap 到 Google Search Console"
    echo "  3. 监控爬虫访问日志"
    echo "  4. 定期更新内容"
    echo ""

    print_warning "提醒:"
    echo "  - 请勿过度优化，避免被判定为垃圾页面"
    echo "  - 定期检查收录情况: site:${DOMAIN}"
    echo "  - 建议部署到多个服务器提升效果"
    echo ""
}

#############################################
# 主流程
#############################################

main() {
    echo ""
    print_info "===================================="
    print_info "  🕷️  蜘蛛池自动化部署脚本"
    print_info "===================================="
    echo ""

    # 显示配置信息
    print_info "配置信息:"
    echo "  - 服务器: ${SERVER_USER}@${SERVER_HOST}"
    echo "  - 路径: ${SERVER_PATH}"
    echo "  - 域名: ${DOMAIN}"
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
    create_remote_directory
    upload_files
    set_permissions
    generate_sitemap
    generate_robots
    generate_nginx_config
    test_deployment
    show_deployment_info

    print_success "🎉 部署流程全部完成！"
}

# 错误处理
trap 'print_error "部署过程中发生错误"; exit 1' ERR

# 运行主流程
main
