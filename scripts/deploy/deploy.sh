#!/bin/bash

#############################################
# SEO Admin 自动化部署脚本
# 适用于：宝塔面板 + 现有数据库
#############################################

set -e  # 遇到错误立即停止

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_step() { echo -e "\n${BLUE}===> $1${NC}\n"; }

#############################################
# 配置区域 - 请修改这里的值
#############################################

# 数据库配置
DB_USER="seo_user"
DB_PASSWORD="tgseo123"
DB_NAME="seo_websites"
DB_HOST="localhost"
DB_PORT="5432"

# 服务器配置（重要！请修改为您的实际值）
SERVER_IP="your-server-ip"  # 修改为您的服务器 IP
# 或使用域名
# SERVER_DOMAIN="admin.yourdomain.com"

# 应用配置
APP_PORT="3100"
APP_DIR="/www/wwwroot/seo-admin"

# 是否备份数据库（推荐：yes）
BACKUP_DB="yes"
BACKUP_DIR="/tmp"

#############################################
# 自动生成的配置（无需修改）
#############################################

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

# 生成随机密钥
NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -d '\n')
SETTINGS_ENCRYPTION_KEY=$(openssl rand -hex 16 | tr -d '\n')

# 判断使用 IP 还是域名
if [ -n "$SERVER_DOMAIN" ]; then
    NEXTAUTH_URL="http://${SERVER_DOMAIN}:${APP_PORT}"
else
    NEXTAUTH_URL="http://${SERVER_IP}:${APP_PORT}"
fi

#############################################
# 函数定义
#############################################

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 未安装"
        return 1
    else
        print_success "$1 已安装"
        return 0
    fi
}

# 检查前置条件
check_prerequisites() {
    print_step "检查前置条件"

    local all_ok=true

    if ! check_command "node"; then all_ok=false; fi
    if ! check_command "npm"; then all_ok=false; fi
    if ! check_command "psql"; then all_ok=false; fi
    if ! check_command "git"; then all_ok=false; fi

    if [ "$all_ok" = false ]; then
        print_error "缺少必要软件，请先在宝塔面板安装："
        echo "  - Node.js 20+"
        echo "  - PostgreSQL 14+"
        echo "  - PM2 管理器"
        exit 1
    fi

    print_success "所有前置条件满足"
}

# 备份数据库
backup_database() {
    if [ "$BACKUP_DB" = "yes" ]; then
        print_step "备份数据库"

        BACKUP_FILE="${BACKUP_DIR}/seo_websites_backup_$(date +%Y%m%d_%H%M%S).sql"

        print_info "正在导出数据库到: $BACKUP_FILE"

        if PGPASSWORD="$DB_PASSWORD" pg_dump -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" > "$BACKUP_FILE"; then
            print_success "数据库备份成功: $BACKUP_FILE"
            print_info "备份大小: $(du -h $BACKUP_FILE | cut -f1)"
        else
            print_error "数据库备份失败"
            exit 1
        fi
    else
        print_warning "跳过数据库备份"
    fi
}

# 配置环境变量
configure_env() {
    print_step "配置环境变量"

    # 创建根目录 .env.local
    cat > "${APP_DIR}/.env.local" << EOF
# ==========================================
# SEO Admin 配置文件
# 自动生成于: $(date)
# ==========================================

# 数据库连接
DATABASE_URL="${DATABASE_URL}"

# NextAuth 配置
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
NEXTAUTH_URL="${NEXTAUTH_URL}"

# 加密密钥
SETTINGS_ENCRYPTION_KEY="${SETTINGS_ENCRYPTION_KEY}"

# 可选配置
OPENAI_API_KEY=""
VERCEL_API_TOKEN=""

# Node 环境
NODE_ENV="production"
EOF

    # 创建 packages/database/.env（Prisma 需要）
    print_info "配置 Prisma 环境变量..."
    mkdir -p "${APP_DIR}/packages/database"
    cat > "${APP_DIR}/packages/database/.env" << EOF
# Prisma 数据库连接
DATABASE_URL="${DATABASE_URL}"
EOF

    # 导出环境变量到当前 shell
    export DATABASE_URL="${DATABASE_URL}"
    export NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
    export NEXTAUTH_URL="${NEXTAUTH_URL}"
    export SETTINGS_ENCRYPTION_KEY="${SETTINGS_ENCRYPTION_KEY}"

    print_success "环境变量配置完成"
    print_info "NEXTAUTH_URL: $NEXTAUTH_URL"
    print_info "已创建 .env.local 和 packages/database/.env"
}

# 安装依赖
install_dependencies() {
    print_step "安装依赖"

    cd "$APP_DIR"

    # 检查并安装 pnpm
    if ! command -v pnpm &> /dev/null; then
        print_info "安装 pnpm..."
        npm install -g pnpm@8.15.0
    fi

    # 清理旧的依赖和缓存
    print_info "清理旧的依赖和缓存..."
    rm -rf node_modules .next .pnpm-store packages/*/node_modules

    print_info "安装项目依赖（需要 5-10 分钟）..."
    pnpm install

    # 验证 workspace 依赖
    print_info "验证 workspace 链接..."
    if pnpm list @repo/database &> /dev/null; then
        print_success "Workspace 依赖链接成功"
    else
        print_warning "Workspace 依赖可能未正确链接"
    fi

    print_success "依赖安装完成"
}

# 数据库迁移
migrate_database() {
    print_step "数据库迁移"

    cd "$APP_DIR"

    # 确保环境变量已导出
    export DATABASE_URL="${DATABASE_URL}"

    print_info "生成 Prisma Client..."
    DATABASE_URL="${DATABASE_URL}" pnpm run db:generate

    print_info "同步数据库 Schema..."
    DATABASE_URL="${DATABASE_URL}" pnpm run db:push

    print_success "数据库迁移完成"
}

# 构建项目
build_project() {
    print_step "构建项目"

    cd "$APP_DIR"

    # 确保环境变量已设置
    export DATABASE_URL="${DATABASE_URL}"
    export NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
    export NEXTAUTH_URL="${NEXTAUTH_URL}"
    export SETTINGS_ENCRYPTION_KEY="${SETTINGS_ENCRYPTION_KEY}"

    # 再次验证 Prisma Client 已生成
    if [ ! -d "node_modules/.pnpm/@prisma+client*/node_modules/@prisma/client" ] && [ ! -d "node_modules/@prisma/client" ]; then
        print_warning "Prisma Client 未找到，重新生成..."
        DATABASE_URL="${DATABASE_URL}" pnpm run db:generate
    fi

    print_info "构建 Next.js 应用（需要 3-5 分钟）..."
    pnpm run build

    print_success "项目构建完成"
}

# 启动应用
start_application() {
    print_step "启动应用"

    cd "$APP_DIR"

    # 检查是否已经运行
    if pm2 list | grep -q "seo-admin"; then
        print_info "检测到已运行的实例，正在重启..."
        pm2 restart seo-admin
    else
        print_info "首次启动应用..."
        pm2 start ecosystem.config.js
    fi

    # 保存 PM2 配置
    pm2 save

    # 设置开机自启
    pm2 startup

    print_success "应用启动成功"
}

# 验证部署
verify_deployment() {
    print_step "验证部署"

    print_info "等待应用启动..."
    sleep 5

    # 检查 PM2 状态
    print_info "PM2 进程状态:"
    pm2 list | grep seo-admin || true

    # 健康检查
    print_info "执行健康检查..."

    HEALTH_URL="http://localhost:${APP_PORT}/api/health"

    if curl -s -f "$HEALTH_URL" > /dev/null; then
        print_success "健康检查通过"

        # 显示健康检查结果
        echo ""
        print_info "API 响应:"
        curl -s "$HEALTH_URL" | python3 -m json.tool 2>/dev/null || curl -s "$HEALTH_URL"
        echo ""
    else
        print_error "健康检查失败"
        print_info "查看日志:"
        pm2 logs seo-admin --lines 20
        exit 1
    fi
}

# 显示部署信息
show_deployment_info() {
    print_step "部署完成！"

    echo ""
    print_success "==================================="
    print_success "  SEO Admin 部署成功！"
    print_success "==================================="
    echo ""

    print_info "访问地址:"
    echo "  - 后台管理: ${NEXTAUTH_URL}"
    echo "  - 健康检查: ${NEXTAUTH_URL}/api/health"
    echo "  - 公开 API: ${NEXTAUTH_URL}/api/public/posts"
    echo ""

    print_info "默认账号:"
    echo "  - 邮箱: admin@example.com"
    echo "  - 密码: 查看 packages/database/prisma/seed.ts"
    echo ""

    print_info "常用命令:"
    echo "  - 查看日志: pm2 logs seo-admin"
    echo "  - 重启应用: pm2 restart seo-admin"
    echo "  - 查看状态: pm2 list"
    echo "  - 停止应用: pm2 stop seo-admin"
    echo ""

    if [ "$BACKUP_DB" = "yes" ]; then
        print_info "数据库备份:"
        echo "  - 位置: $BACKUP_FILE"
        echo "  - 恢复: psql -U $DB_USER -d $DB_NAME < $BACKUP_FILE"
        echo ""
    fi

    print_warning "下一步操作:"
    echo "  1. 访问后台管理界面"
    echo "  2. 为每个网站生成 API Key"
    echo "  3. 在 Vercel 配置环境变量"
    echo "  4. 发布测试文章"
    echo ""

    print_info "文档位置:"
    echo "  - API 集成: docs/API_INTEGRATION.md"
    echo "  - 部署清单: DEPLOY_CHECKLIST.md"
    echo "  - 宝塔部署: BAOTA_QUICK_START.md"
    echo ""
}

#############################################
# 主流程
#############################################

main() {
    echo ""
    print_info "==================================="
    print_info "  SEO Admin 自动化部署脚本"
    print_info "==================================="
    echo ""

    # 显示配置信息
    print_info "配置信息:"
    echo "  - 数据库: ${DB_NAME}@${DB_HOST}:${DB_PORT}"
    echo "  - 应用端口: ${APP_PORT}"
    echo "  - 安装目录: ${APP_DIR}"
    echo "  - 访问地址: ${NEXTAUTH_URL}"
    echo ""

    # 确认继续
    read -p "是否继续部署？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "部署已取消"
        exit 0
    fi

    # 执行部署步骤
    check_prerequisites
    backup_database
    configure_env
    install_dependencies
    migrate_database
    build_project
    start_application
    verify_deployment
    show_deployment_info

    print_success "🎉 部署流程全部完成！"
}

# 错误处理
trap 'print_error "部署过程中发生错误，请查看上面的错误信息"; exit 1' ERR

# 运行主流程
main
