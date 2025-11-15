# 🕷️ 蜘蛛池部署指南

## 项目概述

从三个主站（website-1, website-2, website-tg）的 HTML 文件中提取文章和关键词，生成100个静态 SEO 蜘蛛池页面，用于提升主站的搜索引擎爬取频率和权重。

## 已生成内容

### 数据统计
- ✅ **网站数量**: 3个
- ✅ **总段落数**: 36段
- ✅ **总关键词**: 84个
- ✅ **生成页面**: 100个HTML页面
- ✅ **文件大小**: 每页约3-4KB

### 生成文件位置
```
packages/database/
├── spider-pool-data.json       # 提取的原始数据
└── spider-pool-pages/          # 100个HTML页面
    ├── page-0001.html
    ├── page-0002.html
    └── ... (共100个)
```

### 页面特性
- ✅ 包含真实文章内容（从主站提取）
- ✅ 丰富的关键词布局
- ✅ 响应式设计
- ✅ 每页底部链接到三个主站
- ✅ SEO友好的 meta 标签
- ✅ 随机化内容避免重复

## 部署方案

### 方案 1: 单服务器部署（推荐用于测试）

在一台服务器上部署所有100个页面：

```bash
# 1. 上传到服务器
scp -r packages/database/spider-pool-pages root@your-server:/www/wwwroot/spider-pool

# 2. 配置 Nginx
# 见下方 Nginx 配置示例
```

### 方案 2: 多服务器部署（推荐用于生产）

将页面分散到多个服务器，提升SEO效果：

**服务器 1** (蜘蛛池A - 40页)
```bash
scp packages/database/spider-pool-pages/page-{0001..0040}.html \
    root@server1:/www/wwwroot/spider-pool-a/
```

**服务器 2** (蜘蛛池B - 40页)
```bash
scp packages/database/spider-pool-pages/page-{0041..0080}.html \
    root@server2:/www/wwwroot/spider-pool-b/
```

**服务器 3** (蜘蛛池C - 20页)
```bash
scp packages/database/spider-pool-pages/page-{0081..0100}.html \
    root@server3:/www/wwwroot/spider-pool-c/
```

## Nginx 配置

### 配置示例 1: 独立域名

```nginx
server {
    listen 80;
    server_name spider1.yourdomain.com;

    root /www/wwwroot/spider-pool;
    index page-0001.html;

    # 自动索引（可选）
    autoindex on;
    autoindex_exact_size off;
    autoindex_localtime on;

    # 日志
    access_log /www/wwwlogs/spider-pool-access.log;
    error_log /www/wwwlogs/spider-pool-error.log;

    # Gzip 压缩
    gzip on;
    gzip_types text/html text/css application/javascript;

    # 缓存控制
    location ~* \.(html)$ {
        expires 1d;
        add_header Cache-Control "public, must-revalidate";
    }

    # 404 随机跳转到其他页面
    error_page 404 =200 /page-0001.html;
}
```

### 配置示例 2: 子目录部署

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 蜘蛛池目录
    location /spider/ {
        alias /www/wwwroot/spider-pool/;
        index page-0001.html;
        autoindex on;
    }

    # 主站配置...
}
```

## 自动化部署脚本

创建 `deploy-spider-pool.sh`:

```bash
#!/bin/bash

# 配置
SERVER_USER="root"
SERVER_HOST="your-server-ip"
SERVER_PATH="/www/wwwroot/spider-pool"
LOCAL_PATH="packages/database/spider-pool-pages"

echo "🕷️  开始部署蜘蛛池..."

# 1. 创建服务器目录
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_PATH}"

# 2. 上传文件
echo "📤 上传页面文件..."
rsync -avz --progress ${LOCAL_PATH}/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

# 3. 设置权限
ssh ${SERVER_USER}@${SERVER_HOST} "chmod -R 755 ${SERVER_PATH}"

# 4. 重载 Nginx
echo "🔄 重载 Nginx..."
ssh ${SERVER_USER}@${SERVER_HOST} "nginx -t && nginx -s reload"

echo "✅ 部署完成！"
echo "🌐 访问: http://${SERVER_HOST}/page-0001.html"
```

## 宝塔面板部署步骤

### 1. 创建网站
1. 登录宝塔面板
2. 网站 → 添加站点
3. 域名: `spider1.yourdomain.com`
4. 根目录: `/www/wwwroot/spider-pool`
5. PHP版本: 纯静态

### 2. 上传文件
方法一：使用宝塔文件管理器
- 进入 `/www/wwwroot/spider-pool`
- 上传 `spider-pool-pages` 文件夹内的所有HTML文件

方法二：使用 FTP/SFTP
```bash
scp -r packages/database/spider-pool-pages/* \
    root@your-server:/www/wwwroot/spider-pool/
```

### 3. 配置伪静态（可选）
在宝塔面板的网站设置中添加：

```nginx
# 随机跳转404到其他页面
error_page 404 =200 /page-0001.html;

# 或者使用重写规则
if (!-e $request_filename) {
    rewrite ^/(.*)$ /page-0001.html last;
}
```

### 4. 开启 GZIP 压缩
- 网站设置 → 性能调优 → 开启 Gzip

### 5. 配置 SSL（可选）
- 网站设置 → SSL → Let's Encrypt → 申请

## SEO 优化建议

### 1. Sitemap 生成
创建 `sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>http://spider1.yourdomain.com/page-0001.html</loc></url>
  <url><loc>http://spider1.yourdomain.com/page-0002.html</loc></url>
  <!-- ... 其他页面 -->
</urlset>
```

### 2. robots.txt 配置
```txt
User-agent: *
Allow: /

Sitemap: http://spider1.yourdomain.com/sitemap.xml
```

### 3. 内链策略
- ✅ 每个页面底部已包含三个主站链接
- ✅ 可以添加蜘蛛池页面之间的相互链接
- ✅ 定期更新内容避免被判定为低质量页面

### 4. 监控爬虫访问
在 Nginx 配置中添加：

```nginx
# 记录蜘蛛访问
if ($http_user_agent ~* "googlebot|bingbot|baiduspider") {
    access_log /www/wwwlogs/spider-bot-access.log;
}
```

## 扩展方案

### 1. 生成更多页面
修改脚本中的页面数量：

```typescript
// 在 extract-html-to-spider-pool.ts 中
generateSpiderPoolHTML(data, 1000)  // 生成1000个页面
```

### 2. 定期更新内容
创建定时任务：

```bash
# 每周重新生成页面
0 0 * * 0 cd /www/wwwroot/seo-admin && npx tsx packages/database/extract-html-to-spider-pool.ts
```

### 3. 添加更多主站
在 `extract-html-to-spider-pool.ts` 中添加更多 HTML 文件路径：

```typescript
const HTML_FILES = [
  { name: 'website-1', path: '...', keywords: [...] },
  { name: 'website-2', path: '...', keywords: [...] },
  { name: 'website-3', path: '...', keywords: [...] },
  { name: 'website-4', path: '...', keywords: [...] },  // 新增
]
```

## 监控和维护

### 1. 检查收录情况
```bash
# Google
site:spider1.yourdomain.com

# 百度
site:spider1.yourdomain.com
```

### 2. 分析爬虫日志
```bash
# 统计蜘蛛访问次数
grep -E "googlebot|bingbot|baiduspider" /www/wwwlogs/spider-pool-access.log | wc -l

# 查看最常访问的页面
grep "GET /page-" /www/wwwlogs/spider-pool-access.log | \
  awk '{print $7}' | sort | uniq -c | sort -rn | head -10
```

### 3. 性能监控
```bash
# 检查响应时间
curl -o /dev/null -s -w "Time: %{time_total}s\n" http://spider1.yourdomain.com/page-0001.html
```

## 故障排除

### 问题 1: 页面无法访问
**检查**:
- Nginx 配置是否正确
- 文件权限是否为 755
- 防火墙是否开放 80/443 端口

### 问题 2: SEO 效果不明显
**优化**:
- 增加页面数量（100 → 1000+）
- 分散到多个域名/服务器
- 添加更多原创内容
- 定期更新页面

### 问题 3: 被判定为垃圾页面
**改进**:
- 提高内容质量
- 增加段落长度
- 减少关键词密度
- 添加图片和多媒体内容

## 下一步计划

- [ ] 部署到第一台服务器
- [ ] 配置 Nginx 和 SSL
- [ ] 提交 Sitemap 到搜索引擎
- [ ] 监控爬虫访问情况
- [ ] 根据效果扩展到多服务器
- [ ] 定期更新和维护内容

## 技术支持

如有问题，请查看：
- `packages/database/extract-html-to-spider-pool.ts` - 生成脚本源码
- `packages/database/spider-pool-data.json` - 提取的原始数据
- Nginx 官方文档: https://nginx.org/
