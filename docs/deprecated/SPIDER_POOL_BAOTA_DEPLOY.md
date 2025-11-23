# 🕸️ 蜘蛛池宝塔面板部署指南

## 📋 部署概述

**方式**: 动态API方式（无需上传静态文件）
**Admin API**: https://adminseohub.xyz
**数据库**: Supabase（已配置完成）
**页面数**: 1,350个（9个域名 × 150页）

---

## ✅ 已完成的准备工作

- ✓ 数据库初始化完成
- ✓ 9个蜘蛛池域名配置完成
- ✓ 1,350个SEO页面生成完成
- ✓ 内容源提取完成（3个来源）
- ✓ Admin API已就绪

---

## 🚀 部署步骤

### **第一步：配置DNS解析**

在域名服务商（如Cloudflare、阿里云）添加A记录：

#### VPS 1 (95.111.231.110)
```
autopushnetwork.xyz      A记录 → 95.111.231.110
contentpoolzone.site     A记录 → 95.111.231.110
crawlboostnet.xyz        A记录 → 95.111.231.110
```

#### VPS 2 (75.119.154.120)
```
crawlenginepro.xyz       A记录 → 75.119.154.120
linkpushmatrix.site      A记录 → 75.119.154.120
rankspiderchain.xyz      A记录 → 75.119.154.120
```

#### VPS 3 (37.60.254.52)
```
seohubnetwork.xyz        A记录 → 37.60.254.52
spidertrackzone.xyz      A记录 → 37.60.254.52
trafficboostflow.site    A记录 → 37.60.254.52
```

**等待DNS生效**（通常5-30分钟）

---

### **第二步：在宝塔面板添加站点**

登录每台VPS的宝塔面板，为对应域名添加站点。

#### VPS 1 - 添加3个站点

1. 登录宝塔面板：http://95.111.231.110:8888
2. 进入 **网站** → **添加站点**
3. 按以下信息添加：

**站点1**:
- 域名：`autopushnetwork.xyz`
- 根目录：`/www/wwwroot/autopushnetwork.xyz`（任意，反向代理不使用）
- PHP版本：纯静态
- 数据库：不创建
- FTP：不创建

**站点2**: `contentpoolzone.site`（同上）
**站点3**: `crawlboostnet.xyz`（同上）

#### VPS 2 - 添加3个站点

登录：http://75.119.154.120:8888

添加：`crawlenginepro.xyz`, `linkpushmatrix.site`, `rankspiderchain.xyz`

#### VPS 3 - 添加3个站点

登录：http://37.60.254.52:8888

添加：`seohubnetwork.xyz`, `spidertrackzone.xyz`, `trafficboostflow.site`

---

### **第三步：配置Nginx反向代理**

为每个站点配置Nginx。

#### 配置方法

1. 在宝塔面板，进入 **网站**
2. 点击对应站点的 **设置**
3. 点击 **配置文件**
4. **替换整个配置文件**为对应的Nginx配置

#### Nginx配置文件

所有9个域名的Nginx配置已生成在：

```
/home/ubuntu/WebstormProjects/seo-admin/nginx-configs-for-baota.txt
```

**配置示例**（以autopushnetwork.xyz为例）：

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name autopushnetwork.xyz www.autopushnetwork.xyz;

    access_log /www/wwwlogs/autopushnetwork.xyz-access.log;
    error_log /www/wwwlogs/autopushnetwork.xyz-error.log;

    # 主页面代理
    location / {
        set $request_slug $uri;
        if ($request_slug = /) {
            set $request_slug /index;
        }

        proxy_pass https://adminseohub.xyz/api/p/autopushnetwork.xyz?slug=$request_slug;
        proxy_set_header Host adminseohub.xyz;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Original-Host $host;
        proxy_cache_valid 200 30m;
    }

    # Sitemap
    location = /sitemap.xml {
        proxy_pass https://adminseohub.xyz/api/p/autopushnetwork.xyz?type=sitemap;
        proxy_set_header Host adminseohub.xyz;
        add_header Content-Type application/xml;
    }

    # Robots.txt
    location = /robots.txt {
        proxy_pass https://adminseohub.xyz/api/p/autopushnetwork.xyz?type=robots;
        proxy_set_header Host adminseohub.xyz;
        add_header Content-Type text/plain;
    }
}
```

**重要**：
- 每个域名使用对应的配置
- 保存后点击 **重载配置**

---

### **第四步：申请SSL证书**

为每个站点申请Let's Encrypt免费SSL证书。

#### 操作步骤

1. 在宝塔面板，进入站点 **设置**
2. 点击 **SSL**
3. 选择 **Let's Encrypt**
4. 勾选域名和www子域名
5. 点击 **申请**

等待1-2分钟，证书自动配置完成。

**对所有9个域名重复此操作**。

---

### **第五步：测试访问**

#### 测试主页

```bash
# 测试HTTP（会自动跳转HTTPS）
curl -I http://autopushnetwork.xyz

# 测试HTTPS
curl -I https://autopushnetwork.xyz

# 测试首页内容
curl https://autopushnetwork.xyz | grep "<title>"
```

#### 测试Sitemap

```bash
curl https://autopushnetwork.xyz/sitemap.xml | head -20
```

#### 测试Robots.txt

```bash
curl https://autopushnetwork.xyz/robots.txt
```

#### 在浏览器测试

访问以下URL，应该能看到蜘蛛池页面：

```
https://autopushnetwork.xyz
https://autopushnetwork.xyz/page-0001.html
https://autopushnetwork.xyz/page-0050.html
https://autopushnetwork.xyz/sitemap.xml
https://autopushnetwork.xyz/robots.txt
```

**对所有9个域名重复测试**。

---

## 📊 部署完成验证

运行以下脚本验证所有域名：

```bash
cat > /tmp/test_spider_domains.sh << 'EOF'
#!/bin/bash

DOMAINS=(
    "autopushnetwork.xyz"
    "contentpoolzone.site"
    "crawlboostnet.xyz"
    "crawlenginepro.xyz"
    "linkpushmatrix.site"
    "rankspiderchain.xyz"
    "seohubnetwork.xyz"
    "spidertrackzone.xyz"
    "trafficboostflow.site"
)

echo "=== 蜘蛛池域名测试 ==="
echo ""

for domain in "${DOMAINS[@]}"; do
    echo -n "测试 $domain ... "

    # 测试HTTPS
    if curl -s -f -m 10 "https://$domain" > /dev/null 2>&1; then
        echo "✓ 可访问"
    else
        echo "✗ 不可访问"
    fi
done

echo ""
echo "=== Sitemap测试 ==="
for domain in "${DOMAINS[@]}"; do
    echo -n "$domain/sitemap.xml ... "
    if curl -s -f -m 10 "https://$domain/sitemap.xml" | grep -q "urlset"; then
        echo "✓ 正常"
    else
        echo "✗ 异常"
    fi
done
EOF

chmod +x /tmp/test_spider_domains.sh
/tmp/test_spider_domains.sh
```

---

## 🎯 提交到搜索引擎

### Google Search Console

1. 访问：https://search.google.com/search-console
2. 添加资源（每个域名）
3. 验证域名所有权（使用DNS验证或HTML文件验证）
4. 提交Sitemap：`https://[domain]/sitemap.xml`

### Bing Webmaster Tools

1. 访问：https://www.bing.com/webmasters
2. 添加站点
3. 提交Sitemap

### 百度站长平台

1. 访问：https://ziyuan.baidu.com
2. 添加站点
3. 提交Sitemap

---

## 📈 监控和维护

### 在Admin后台查看统计

访问：https://adminseohub.xyz/spider-pool

可以查看：
- 每个域名的页面数
- 总访问量
- 爬虫访问统计
- 最近被爬取的页面

### 更新蜘蛛池内容

如需更新蜘蛛池内容，在Admin后台：

1. 进入 `/spider-pool` 页面
2. 点击 "重新生成所有页面"
3. 内容立即生效，VPS无需任何操作

---

## 🔧 故障排查

### 问题1：域名无法访问

**检查**：
```bash
# 检查DNS解析
dig +short autopushnetwork.xyz

# 检查端口
nc -zv 95.111.231.110 80
nc -zv 95.111.231.110 443
```

**解决**：
- 确认DNS解析正确
- 检查VPS防火墙是否开放80/443端口
- 检查Nginx是否正常运行

### 问题2：页面显示502错误

**原因**：Admin API不可达

**检查**：
```bash
# 测试Admin API
curl https://adminseohub.xyz/api/p/autopushnetwork.xyz?slug=/index
```

**解决**：
- 确认Admin后台正常运行
- 检查Nginx proxy_pass配置是否正确

### 问题3：页面显示404

**原因**：蜘蛛池页面未生成或slug不正确

**检查**：
- 登录Admin后台查看页面是否存在
- 检查请求的slug是否正确

---

## 📝 域名分配清单

| VPS | IP地址 | 域名 | 主题 | 状态 |
|-----|--------|------|------|------|
| **VPS 1** | 95.111.231.110 | autopushnetwork.xyz | auto | ⏳ 待配置 |
| | | contentpoolzone.site | content | ⏳ 待配置 |
| | | crawlboostnet.xyz | crawl | ⏳ 待配置 |
| **VPS 2** | 75.119.154.120 | crawlenginepro.xyz | engine | ⏳ 待配置 |
| | | linkpushmatrix.site | link | ⏳ 待配置 |
| | | rankspiderchain.xyz | rank | ⏳ 待配置 |
| **VPS 3** | 37.60.254.52 | seohubnetwork.xyz | seo | ⏳ 待配置 |
| | | spidertrackzone.xyz | track | ⏳ 待配置 |
| | | trafficboostflow.site | traffic | ⏳ 待配置 |

---

## 🎉 部署完成标志

- [ ] DNS解析全部生效（9个域名）
- [ ] 宝塔面板站点全部创建（9个）
- [ ] Nginx配置全部完成（9个）
- [ ] SSL证书全部申请（9个）
- [ ] 主页全部可访问（9个）
- [ ] Sitemap全部正常（9个）
- [ ] 提交到Google Search Console
- [ ] 提交到Bing Webmaster

---

**配置文件位置**：
- Nginx配置：`/home/ubuntu/WebstormProjects/seo-admin/nginx-configs-for-baota.txt`
- 测试脚本：上面提供的bash脚本

**需要帮助？**
- Admin后台：https://adminseohub.xyz
- 蜘蛛池管理：https://adminseohub.xyz/spider-pool
- 数据库：Supabase Dashboard
