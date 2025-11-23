# VPS 服务器要求

## 最低配置

### 硬件要求
- **CPU**: 1核心
- **内存**: 512MB (推荐1GB+)
- **硬盘**: 10GB
- **带宽**: 1Mbps (推荐5Mbps+)

### 系统要求
支持的操作系统：
- Ubuntu 18.04 / 20.04 / 22.04 ✅
- Debian 9 / 10 / 11 ✅
- CentOS 7 / 8 ✅
- AlmaLinux 8+ ✅

### 网络要求
- ✅ 80端口开放（HTTP）
- ✅ 443端口开放（HTTPS）
- ✅ 22端口开放（SSH）
- ✅ 独立公网IP

## 推荐配置

### 标准配置
- **CPU**: 2核心
- **内存**: 2GB
- **硬盘**: 20GB SSD
- **带宽**: 5Mbps
- **流量**: 500GB/月

### 性能优化配置
- **CPU**: 4核心
- **内存**: 4GB
- **硬盘**: 40GB SSD
- **带宽**: 10Mbps
- **流量**: 1TB/月

## 软件依赖

### 必需软件
- ✅ **Nginx** 1.18+ 或 **宝塔面板** 7.0+
- ✅ **Certbot** (用于SSL证书)
- ✅ **Curl** (用于测试)
- ✅ **Dig** (用于DNS检查)

### 自动安装
部署脚本会自动检查并提示安装缺失的软件。

## VPS提供商推荐

### 国外VPS
| 提供商 | 价格/月 | 配置 | 适用场景 |
|--------|---------|------|----------|
| Vultr | $5 | 1核1GB | 入门 |
| DigitalOcean | $6 | 1核1GB | 推荐 |
| Linode | $5 | 1核1GB | 稳定 |
| AWS Lightsail | $3.5 | 512MB | 预算有限 |

### 国内VPS
| 提供商 | 价格/月 | 配置 | 适用场景 |
|--------|---------|------|----------|
| 阿里云 | ¥50+ | 1核2GB | 国内优化 |
| 腾讯云 | ¥45+ | 1核2GB | 国内优化 |
| 华为云 | ¥50+ | 1核2GB | 稳定 |

## 成本估算

### 最小部署（3台VPS）
- **VPS**: $5 × 3 = $15/月
- **域名**: $10 × 9 = $90/年 ≈ $7.5/月
- **总计**: ~$22.5/月

### 推荐部署（3台VPS）
- **VPS**: $6 × 3 = $18/月
- **域名**: $10 × 9 = $90/年 ≈ $7.5/月
- **CDN**: CloudFlare免费版
- **总计**: ~$25.5/月

## 性能预估

### 流量预估（每个域名）
- **HTML页面**: 150页 × 10KB = 1.5MB
- **日访问量**: 500次
- **日流量**: 500 × 10KB = 5MB
- **月流量**: 5MB × 30 = 150MB

### 3台VPS总流量
- **9个域名**: 150MB × 9 = 1.35GB/月
- **包含爬虫**: 约 5GB/月
- **安全余量**: 建议选择20GB+流量套餐

## 宝塔面板说明

### 推荐使用宝塔面板的情况
- ✅ 不熟悉Linux命令行
- ✅ 需要图形化管理界面
- ✅ 需要管理多个网站
- ✅ 需要监控和统计

### 安装宝塔面板
```bash
# Ubuntu/Debian
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh

# CentOS
yum install -y wget && wget -O install.sh https://download.bt.cn/install/install_6.0.sh && sh install.sh
```

### 使用宝塔面板部署
1. 安装宝塔面板
2. 安装Nginx
3. 上传deployment包到 `/www/server/panel/vhost/nginx/`
4. 运行部署脚本

## 防火墙配置

### UFW (Ubuntu/Debian)
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### Firewalld (CentOS/RHEL)
```bash
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

### 云服务商安全组
在云服务商控制台开放：
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)

## 存储空间规划

```
/www/wwwlogs/              # 日志文件 (每月约100MB)
/etc/nginx/                # Nginx配置 (约10MB)
/etc/letsencrypt/          # SSL证书 (约50MB)
/var/cache/nginx/          # Nginx缓存 (可选，最多1GB)
```

**总计**: 约200MB - 1.2GB

## 检查VPS是否满足要求

运行以下命令检查VPS配置：

```bash
# CPU核心数
nproc

# 内存大小
free -h

# 硬盘空间
df -h

# 系统版本
cat /etc/os-release

# 检查Nginx
nginx -v

# 检查端口
netstat -tulpn | grep ':80\|:443'
```

## 性能优化建议

### Nginx优化
编辑 `/etc/nginx/nginx.conf`:
```nginx
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
gzip_types text/plain text/css application/json;
```

### 系统优化
```bash
# 增加文件描述符限制
echo "* soft nofile 65535" >> /etc/security/limits.conf
echo "* hard nofile 65535" >> /etc/security/limits.conf

# 优化TCP参数
sysctl -w net.core.somaxconn=1024
sysctl -w net.ipv4.tcp_max_syn_backlog=2048
```

## FAQ

**Q: 可以用同一台VPS部署所有9个域名吗？**
A: 可以，但不推荐。分散部署到3台VPS可以：
   - 提高可用性
   - 分散爬虫注意力
   - 避免IP被标记

**Q: 需要独立IP吗？**
A: 是的，每台VPS需要独立公网IP用于DNS解析。

**当前生产环境VPS IP：**
- VPS 1: 95.111.231.110
- VPS 2: 37.60.254.52
- VPS 3: 75.119.154.120

**Q: 可以使用共享虚拟主机吗？**
A: 不推荐。需要Nginx反向代理功能，共享主机通常不支持。

**Q: 内存512MB够用吗？**
A: 对于纯Nginx反向代理，512MB够用。但推荐1GB+以获得更好性能。

**Q: 需要安装Node.js或其他运行时吗？**
A: 不需要。VPS上只需要Nginx，内容由Admin Backend提供。
