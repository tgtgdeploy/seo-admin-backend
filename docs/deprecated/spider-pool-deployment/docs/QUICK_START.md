# 🚀 蜘蛛池快速部署指南

## 5分钟快速部署

### 准备工作

**你需要：**
- ✅ 3台VPS服务器（已安装Nginx或宝塔面板）
- ✅ 9个域名（已购买）
- ✅ Admin Backend已部署并运行 (adminseohub.xyz)
- ✅ SSH访问权限

**VPS要求：**
- 系统: Ubuntu 18.04+ / CentOS 7+ / Debian 9+
- 内存: 512MB+
- 端口: 80, 443 开放

## 步骤1: 上传部署包 (2分钟)

### 方法A: 使用SCP（推荐）

```bash
# 在本地电脑执行（替换IP为你的VPS IP）
cd /path/to/seo-admin
scp -r spider-pool-deployment root@VPS1_IP:/root/
scp -r spider-pool-deployment root@VPS2_IP:/root/
scp -r spider-pool-deployment root@VPS3_IP:/root/
```

### 方法B: 使用宝塔面板

1. 登录宝塔面板
2. 文件管理 → 上传 `spider-pool-deployment` 文件夹到 `/root/`
3. 在终端中执行后续命令

## 步骤2: VPS部署 (每台1分钟)

### VPS 1

```bash
ssh root@VPS1_IP
cd /root/spider-pool-deployment
chmod +x scripts/*.sh
bash scripts/deploy.sh 1
```

输出应该显示：
```
✓ Nginx 已安装
✓ 已创建日志目录
✓ 已复制: autopushnetwork.xyz.conf
✓ 已复制: contentpoolzone.site.conf
✓ 已复制: crawlboostnet.xyz.conf
✓ Nginx配置测试通过
✓ Nginx已重载
🎉 部署完成！
```

### VPS 2

```bash
ssh root@VPS2_IP
cd /root/spider-pool-deployment
chmod +x scripts/*.sh
bash scripts/deploy.sh 2
```

### VPS 3

```bash
ssh root@VPS3_IP
cd /root/spider-pool-deployment
chmod +x scripts/*.sh
bash scripts/deploy.sh 3
```

## 步骤3: 配置DNS (5分钟)

在你的域名提供商（如CloudFlare, 阿里云）配置A记录：

### VPS 1 的域名 (IP: 95.111.231.110)
```
autopushnetwork.xyz     → A → 95.111.231.110
contentpoolzone.site    → A → 95.111.231.110
crawlboostnet.xyz       → A → 95.111.231.110
```

### VPS 2 的域名 (IP: 37.60.254.52)
```
crawlenginepro.xyz      → A → 37.60.254.52
linkpushmatrix.site     → A → 37.60.254.52
rankspiderchain.xyz     → A → 37.60.254.52
```

### VPS 3 的域名 (IP: 75.119.154.120)
```
seohubnetwork.xyz       → A → 75.119.154.120
spidertrackzone.xyz     → A → 75.119.154.120
trafficboostflow.site   → A → 75.119.154.120
```

## 步骤4: 检查DNS (可选)

```bash
# 在任意VPS上执行（IP已预配置）
bash scripts/check-dns.sh

# 当前VPS IP配置:
# VPS1: 95.111.231.110
# VPS2: 37.60.254.52
# VPS3: 75.119.154.120
```

等待DNS生效（5-30分钟）。

## 步骤5: 申请SSL证书 (每台2分钟)

等DNS生效后：

### VPS 1
```bash
bash scripts/ssl.sh 1 your-email@example.com
```

### VPS 2
```bash
bash scripts/ssl.sh 2 your-email@example.com
```

### VPS 3
```bash
bash scripts/ssl.sh 3 your-email@example.com
```

## 步骤6: 测试访问

在浏览器访问：
```
https://autopushnetwork.xyz
https://autopushnetwork.xyz/sitemap.xml
https://autopushnetwork.xyz/robots.txt
```

应该能看到页面和内容。

## 步骤7: 提交Sitemap

所有域名的sitemap：
```
https://autopushnetwork.xyz/sitemap.xml
https://contentpoolzone.site/sitemap.xml
https://crawlboostnet.xyz/sitemap.xml
https://crawlenginepro.xyz/sitemap.xml
https://linkpushmatrix.site/sitemap.xml
https://rankspiderchain.xyz/sitemap.xml
https://seohubnetwork.xyz/sitemap.xml
https://spidertrackzone.xyz/sitemap.xml
https://trafficboostflow.site/sitemap.xml
```

提交到：
- Google Search Console
- Bing Webmaster Tools
- 百度站长平台

## 完成！🎉

现在你有：
- ✅ 9个蜘蛛池域名正在运行
- ✅ 1,350个SEO优化页面
- ✅ HTTPS加密
- ✅ 自动爬虫追踪

## 日常维护

### 查看监控
```bash
bash scripts/monitor.sh 1  # 在VPS1上
bash scripts/monitor.sh 2  # 在VPS2上
bash scripts/monitor.sh 3  # 在VPS3上
```

### 更新内容
在Admin后台 (adminseohub.xyz/spider-pool) 点击 "重新生成所有页面"

### 查看爬虫访问
```bash
tail -f /www/wwwlogs/*-access.log | grep -i bot
```

## 故障排查

### 域名无法访问？
```bash
# 1. 检查Nginx
systemctl status nginx

# 2. 检查DNS
dig autopushnetwork.xyz

# 3. 查看日志
tail -f /www/wwwlogs/*-error.log
```

### SSL证书失败？
```bash
# 确保DNS已解析
bash scripts/check-dns.sh

# 确保80端口开放
curl http://autopushnetwork.xyz
```

### 页面404？
检查Admin Backend是否正常运行：
```bash
curl https://adminseohub.xyz/api/p/autopushnetwork.xyz?slug=index
```

## 需要帮助？

查看完整文档: `README.md`
