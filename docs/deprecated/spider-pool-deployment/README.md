# 🕸️ 蜘蛛池VPS部署包

这是一个**完整的部署包**，包含所有9个蜘蛛池域名的Nginx配置和自动化脚本。

## 📦 包含内容

```
spider-pool-deployment/
├── nginx-configs/          # Nginx配置文件（9个域名）
│   ├── autopushnetwork.xyz.conf
│   ├── contentpoolzone.site.conf
│   ├── crawlboostnet.xyz.conf
│   ├── crawlenginepro.xyz.conf
│   ├── linkpushmatrix.site.conf
│   ├── rankspiderchain.xyz.conf
│   ├── seohubnetwork.xyz.conf
│   ├── spidertrackzone.xyz.conf
│   └── trafficboostflow.site.conf
├── scripts/                # 自动化脚本
│   ├── deploy.sh          # 一键部署脚本
│   ├── ssl.sh             # SSL证书申请脚本
│   ├── monitor.sh         # 监控脚本
│   └── check-dns.sh       # DNS检查脚本
└── README.md              # 本文档
```

## 🎯 域名分配

### VPS 1 (3个域名)
- autopushnetwork.xyz
- contentpoolzone.site
- crawlboostnet.xyz

### VPS 2 (3个域名)
- crawlenginepro.xyz
- linkpushmatrix.site
- rankspiderchain.xyz

### VPS 3 (3个域名)
- seohubnetwork.xyz
- spidertrackzone.xyz
- trafficboostflow.site

## 🚀 快速部署

### 步骤1: 上传部署包到VPS

```bash
# 方法1: 使用scp上传（在本地执行）
cd /path/to/seo-admin
scp -r spider-pool-deployment root@your-vps-ip:/root/

# 方法2: 使用宝塔面板
# 在宝塔面板文件管理中，上传整个 spider-pool-deployment 文件夹到 /root/
```

### 步骤2: SSH登录VPS

```bash
ssh root@your-vps-ip
cd /root/spider-pool-deployment
```

### 步骤3: 赋予脚本执行权限

```bash
chmod +x scripts/*.sh
```

### 步骤4: 运行部署脚本

```bash
# VPS 1 执行:
bash scripts/deploy.sh 1

# VPS 2 执行:
bash scripts/deploy.sh 2

# VPS 3 执行:
bash scripts/deploy.sh 3
```

部署脚本会自动：
- ✅ 检查Nginx是否安装
- ✅ 备份现有配置
- ✅ 部署对应VPS的域名配置
- ✅ 测试Nginx配置
- ✅ 重载Nginx

### 步骤5: 配置DNS解析

将域名解析到对应的VPS IP：

**VPS 1 的域名** → 指向 95.111.231.110
```
autopushnetwork.xyz     → A → 95.111.231.110
contentpoolzone.site    → A → 95.111.231.110
crawlboostnet.xyz       → A → 95.111.231.110
```

**VPS 2 的域名** → 指向 37.60.254.52
```
crawlenginepro.xyz      → A → 37.60.254.52
linkpushmatrix.site     → A → 37.60.254.52
rankspiderchain.xyz     → A → 37.60.254.52
```

**VPS 3 的域名** → 指向 75.119.154.120
```
seohubnetwork.xyz       → A → 75.119.154.120
spidertrackzone.xyz     → A → 75.119.154.120
trafficboostflow.site   → A → 75.119.154.120
```

### 步骤6: 检查DNS解析

```bash
# VPS IP已配置为默认值:
# VPS1: 95.111.231.110
# VPS2: 37.60.254.52
# VPS3: 75.119.154.120

# 直接运行检查（使用默认IP）
bash scripts/check-dns.sh

# 或手动设置不同的IP
export VPS1_IP=95.111.231.110
export VPS2_IP=37.60.254.52
export VPS3_IP=75.119.154.120
bash scripts/check-dns.sh
```

### 步骤7: 申请SSL证书

等待DNS解析生效后（通常5-30分钟），申请SSL证书：

```bash
# VPS 1 执行:
bash scripts/ssl.sh 1 your-email@example.com

# VPS 2 执行:
bash scripts/ssl.sh 2 your-email@example.com

# VPS 3 执行:
bash scripts/ssl.sh 3 your-email@example.com
```

SSL脚本会自动：
- ✅ 安装Certbot（如未安装）
- ✅ 检查DNS解析
- ✅ 为所有域名申请证书（包括www子域名）
- ✅ 自动配置HTTPS
- ✅ 设置自动续期

## 🔍 监控和维护

### 运行监控脚本

```bash
# VPS 1 执行:
bash scripts/monitor.sh 1

# VPS 2 执行:
bash scripts/monitor.sh 2

# VPS 3 执行:
bash scripts/monitor.sh 3
```

监控脚本会显示：
- ✅ 所有域名的HTTP/HTTPS状态
- ✅ SSL证书有效性
- ✅ Sitemap可用性
- ✅ Nginx运行状态
- ✅ 最近24小时爬虫访问统计

### 设置定时监控（可选）

```bash
# 添加cron任务，每小时执行一次监控
crontab -e

# 添加以下行（替换VPS编号）
0 * * * * /root/spider-pool-deployment/scripts/monitor.sh 1 >> /var/log/spider-pool-monitor.log 2>&1
```

## 📋 常用命令

### Nginx相关

```bash
# 查看Nginx状态
systemctl status nginx

# 测试Nginx配置
nginx -t

# 重载Nginx
nginx -s reload

# 重启Nginx
systemctl restart nginx

# 查看错误日志
tail -f /www/wwwlogs/*-error.log

# 查看访问日志
tail -f /www/wwwlogs/*-access.log
```

### 证书相关

```bash
# 查看已安装的证书
certbot certificates

# 手动续期证书
certbot renew

# 测试续期（不会真正续期）
certbot renew --dry-run
```

### 测试域名

```bash
# 测试HTTP
curl -I http://autopushnetwork.xyz

# 测试HTTPS
curl -I https://autopushnetwork.xyz

# 测试Sitemap
curl https://autopushnetwork.xyz/sitemap.xml

# 测试Robots.txt
curl https://autopushnetwork.xyz/robots.txt
```

## 🔧 故障排查

### 问题1: 域名无法访问

**检查步骤：**
```bash
# 1. 检查Nginx是否运行
systemctl status nginx

# 2. 检查DNS解析
dig autopushnetwork.xyz

# 3. 检查端口是否开放
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# 4. 查看Nginx错误日志
tail -50 /www/wwwlogs/*-error.log
```

**解决方案：**
- DNS未解析 → 检查域名DNS设置
- 端口未开放 → 开放防火墙80/443端口
- Nginx未运行 → `systemctl start nginx`

### 问题2: SSL证书申请失败

**常见原因：**
1. DNS未正确解析到当前VPS
2. 80端口被防火墙阻止
3. Nginx配置错误
4. 达到Let's Encrypt速率限制

**解决方案：**
```bash
# 检查DNS
bash scripts/check-dns.sh

# 检查端口
curl http://autopushnetwork.xyz

# 检查Nginx配置
nginx -t

# 查看详细错误
certbot --nginx -d autopushnetwork.xyz --dry-run
```

### 问题3: 页面返回404

**原因：**
Admin Backend API未正确响应

**解决方案：**
```bash
# 测试Admin Backend API
curl https://adminseohub.xyz/api/p/autopushnetwork.xyz?slug=index

# 如果Admin Backend未运行，请检查admin项目
```

### 问题4: 爬虫不访问

**检查步骤：**
```bash
# 1. 检查robots.txt
curl https://autopushnetwork.xyz/robots.txt

# 2. 检查sitemap.xml
curl https://autopushnetwork.xyz/sitemap.xml

# 3. 提交sitemap到搜索引擎
# - Google Search Console
# - Bing Webmaster Tools
```

## 🌐 完整架构

```
用户/爬虫访问
    ↓
蜘蛛池域名 (autopushnetwork.xyz)
    ↓
VPS Nginx (反向代理)
    ↓
Admin Backend API (adminseohub.xyz)
    ↓
PostgreSQL 数据库
    ↓
返回动态生成的HTML
```

## 📊 性能优化

### 启用Nginx缓存（可选）

编辑 `/etc/nginx/nginx.conf`，在 `http {}` 块中添加：

```nginx
# 缓存路径配置
proxy_cache_path /var/cache/nginx/spider-pool
    levels=1:2
    keys_zone=spider_cache:10m
    max_size=1g
    inactive=24h;
```

然后在域名配置中启用缓存：

```nginx
location / {
    proxy_cache spider_cache;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    proxy_cache_valid 200 1h;
    # ... 其他配置
}
```

### 启用CloudFlare CDN（可选）

1. 添加域名到CloudFlare
2. 将域名NS改为CloudFlare提供的NS
3. 在CloudFlare中设置DNS记录
4. 开启CDN加速

## 📝 日志管理

### 日志位置

- 访问日志: `/www/wwwlogs/{domain}-access.log`
- 错误日志: `/www/wwwlogs/{domain}-error.log`

### 日志轮转（避免日志文件过大）

创建 `/etc/logrotate.d/spider-pool`：

```
/www/wwwlogs/*-access.log /www/wwwlogs/*-error.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

## 🎯 下一步

部署完成后：

1. ✅ **提交Sitemap** - 到Google Search Console和Bing Webmaster
2. ✅ **监控收录** - 使用 `site:domain.com` 检查收录情况
3. ✅ **分析爬虫** - 定期查看 `scripts/monitor.sh` 的统计
4. ✅ **内容更新** - 在Admin后台重新生成页面内容

## 📞 技术支持

如遇问题，请检查：
1. Nginx错误日志: `/www/wwwlogs/*-error.log`
2. Admin Backend日志
3. DNS解析: `bash scripts/check-dns.sh`
4. 域名可用性: `bash scripts/monitor.sh`

---

**总结**: 这个部署包让你可以在3台VPS上快速部署9个蜘蛛池域名，所有内容由Admin Backend动态管理，无需在VPS上部署代码！🚀
