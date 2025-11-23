#!/bin/bash
# 全能一键部署脚本 - 完整初始化SEO系统
# All-in-One Deployment Script

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📌 $1${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# 进度条
show_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((width * current / total))

    printf "\r${CYAN}Progress: [${NC}"
    printf "%${completed}s" | tr ' ' '='
    printf "%$((width - completed))s" | tr ' ' '-'
    printf "${CYAN}] ${percentage}%%${NC}"
}

# 检查前置条件
check_prerequisites() {
    log_step "Step 0: 检查环境"

    # 检查是否在正确的目录
    if [ ! -f "package.json" ]; then
        log_error "错误: 请在项目根目录运行此脚本"
        exit 1
    fi
    log_success "当前目录正确"

    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装"
        exit 1
    fi
    log_success "Node.js版本: $(node --version)"

    # 检查pnpm
    if command -v pnpm &> /dev/null; then
        log_success "pnpm版本: $(pnpm --version)"
    else
        log_warning "pnpm未安装，将使用npm"
    fi

    # 检查PM2
    if command -v pm2 &> /dev/null; then
        log_success "PM2版本: $(pm2 --version)"
    else
        log_warning "PM2未安装"
    fi

    # 检查.env.local
    if [ -f ".env.local" ]; then
        log_success "环境变量文件存在"
    else
        log_warning "未找到.env.local文件"
    fi
}

# 步骤1: 数据库检查
step1_check_database() {
    log_step "Step 1: 数据库连接检查"

    if node check_db.js; then
        log_success "数据库连接正常"
        return 0
    else
        log_error "数据库连接失败，请检查DATABASE_URL配置"
        return 1
    fi
}

# 步骤2: 系统初始化
step2_system_init() {
    log_step "Step 2: 系统基础配置"

    log_info "正在配置网站、域名、关键词..."
    if node setup-complete-system.js; then
        log_success "系统配置完成"
        return 0
    else
        log_warning "系统配置遇到问题，继续下一步"
        return 1
    fi
}

# 步骤3: 生成文章
step3_generate_articles() {
    log_step "Step 3: 批量生成文章"

    log_info "正在为所有网站生成高质量文章..."
    if node generate-articles.js; then
        log_success "文章生成完成"
        return 0
    else
        log_warning "文章生成遇到问题，继续下一步"
        return 1
    fi
}

# 步骤4: 蜘蛛池内容源
step4_spider_pool() {
    log_step "Step 4: 初始化蜘蛛池内容源"

    log_info "正在从文章中提取内容源..."
    if node init-spider-pool.js; then
        log_success "蜘蛛池内容源初始化完成"
        return 0
    else
        log_warning "蜘蛛池初始化遇到问题"
        return 1
    fi
}

# 步骤5: 构建项目
step5_build() {
    log_step "Step 5: 构建项目"

    log_info "正在构建Next.js应用..."
    export NODE_OPTIONS="--max-old-space-size=4096"

    if command -v pnpm &> /dev/null; then
        if pnpm build; then
            log_success "构建成功"
            return 0
        else
            log_error "构建失败"
            return 1
        fi
    else
        if npm run build; then
            log_success "构建成功"
            return 0
        else
            log_error "构建失败"
            return 1
        fi
    fi
}

# 步骤6: PM2管理
step6_pm2() {
    log_step "Step 6: PM2进程管理"

    if ! command -v pm2 &> /dev/null; then
        log_warning "PM2未安装，跳过此步骤"
        return 1
    fi

    # 检查进程是否存在
    if pm2 list | grep -q "seo-admin"; then
        log_info "重启现有PM2进程..."
        pm2 restart seo-admin
        log_success "PM2进程已重启"
    else
        log_info "启动新的PM2进程..."
        if [ -f "ecosystem.config.js" ]; then
            pm2 start ecosystem.config.js
            pm2 save
            log_success "PM2进程已启动"
        else
            log_warning "未找到ecosystem.config.js文件"
            return 1
        fi
    fi

    sleep 3
    pm2 list
    return 0
}

# 步骤7: 健康检查
step7_health_check() {
    log_step "Step 7: 应用健康检查"

    log_info "等待应用启动..."
    sleep 5

    if curl -f http://localhost:3100/api/health > /dev/null 2>&1; then
        log_success "✅ 应用运行正常！"
        echo ""
        curl -s http://localhost:3100/api/health | head -1
        return 0
    else
        log_warning "健康检查未通过，请查看日志"
        if command -v pm2 &> /dev/null; then
            echo ""
            log_info "最近的PM2日志："
            pm2 logs seo-admin --lines 20 --nostream
        fi
        return 1
    fi
}

# 显示最终报告
show_final_report() {
    echo ""
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 部署完成！${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # 统计信息
    echo -e "${CYAN}📊 系统统计:${NC}"
    echo ""

    # 使用Node.js快速查询
    node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    (async () => {
      try {
        const [websites, posts, keywords, spiderDomains, sources] = await Promise.all([
          prisma.website.count({ where: { status: 'ACTIVE' } }),
          prisma.post.count({ where: { status: 'PUBLISHED' } }),
          prisma.keyword.count(),
          prisma.domainAlias.count({
            where: {
              domain: {
                in: [
                  'autopushnetwork.xyz', 'contentpoolzone.site', 'crawlboostnet.xyz',
                  'crawlenginepro.xyz', 'linkpushmatrix.site', 'rankspiderchain.xyz',
                  'seohubnetwork.xyz', 'spidertrackzone.xyz', 'trafficboostflow.site'
                ]
              }
            }
          }),
          prisma.spiderPoolSource.count({ where: { status: 'ACTIVE' } })
        ]);

        console.log('   🌐 活跃网站:', websites, '个');
        console.log('   📝 已发布文章:', posts, '篇');
        console.log('   🔑 关键词:', keywords, '个');
        console.log('   🕷️  蜘蛛池域名:', spiderDomains + '/9');
        console.log('   📚 内容源:', sources, '个');

        await prisma.\$disconnect();
      } catch (error) {
        console.log('   ⚠️  无法获取统计信息');
        process.exit(0);
      }
    })();
    " 2>/dev/null || echo "   ⚠️  统计信息获取失败"

    echo ""
    echo -e "${CYAN}🔗 访问链接:${NC}"
    echo "   • 管理后台: ${GREEN}https://adminseohub.xyz${NC}"
    echo "   • 主站1: ${GREEN}https://telegramtghub.com${NC}"
    echo "   • 主站2: ${GREEN}https://telegramupdatecenter.com${NC}"
    echo "   • 主站3: ${GREEN}https://telegramtrendguide.com${NC}"
    echo ""

    echo -e "${CYAN}📋 常用命令:${NC}"
    echo "   • 查看日志: ${YELLOW}pm2 logs seo-admin${NC}"
    echo "   • 查看状态: ${YELLOW}pm2 status${NC}"
    echo "   • 重启应用: ${YELLOW}pm2 restart seo-admin${NC}"
    echo "   • 数据库检查: ${YELLOW}node check_db.js${NC}"
    echo ""

    echo -e "${CYAN}📖 后续操作:${NC}"
    echo "   1. 登录管理后台"
    echo "   2. 在【蜘蛛池管理】中点击【生成页面】"
    echo "   3. 在【SEO监控】中查看关键词排名"
    echo "   4. 在【爬虫监控】中查看搜索引擎访问"
    echo ""

    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 主流程
main() {
    clear
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║                                                      ║"
    echo "║           SEO Admin 全能一键部署系统                 ║"
    echo "║                                                      ║"
    echo "║      Complete Deployment & Initialization Tool      ║"
    echo "║                                                      ║"
    echo "╚══════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"

    # 记录开始时间
    START_TIME=$(date +%s)

    # 执行步骤
    local steps_total=7
    local steps_completed=0
    local steps_failed=0

    check_prerequisites
    ((steps_completed++))
    show_progress $steps_completed $steps_total

    if step1_check_database; then
        ((steps_completed++))
    else
        ((steps_failed++))
        log_error "数据库检查失败，终止部署"
        exit 1
    fi
    show_progress $steps_completed $steps_total

    if step2_system_init; then
        ((steps_completed++))
    else
        ((steps_failed++))
    fi
    show_progress $steps_completed $steps_total

    if step3_generate_articles; then
        ((steps_completed++))
    else
        ((steps_failed++))
    fi
    show_progress $steps_completed $steps_total

    if step4_spider_pool; then
        ((steps_completed++))
    else
        ((steps_failed++))
    fi
    show_progress $steps_completed $steps_total

    if step5_build; then
        ((steps_completed++))
    else
        ((steps_failed++))
        log_error "构建失败，终止部署"
        exit 1
    fi
    show_progress $steps_completed $steps_total

    if step6_pm2; then
        ((steps_completed++))
    else
        ((steps_failed++))
    fi
    show_progress $steps_completed $steps_total

    if step7_health_check; then
        ((steps_completed++))
    else
        ((steps_failed++))
    fi
    echo "" # 换行

    # 计算耗时
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))

    # 显示最终报告
    show_final_report

    echo -e "${CYAN}⏱️  总耗时: ${DURATION}秒${NC}"
    echo -e "${CYAN}📊 成功步骤: ${steps_completed}/${steps_total}${NC}"

    if [ $steps_failed -gt 0 ]; then
        echo -e "${YELLOW}⚠️  失败步骤: ${steps_failed}${NC}"
    fi

    echo ""
}

# 运行主流程
main "$@"
