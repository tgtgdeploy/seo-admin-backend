# VPS 部署配置总结

## 生产环境VPS信息

### VPS 1 - 95.111.231.110
管理的蜘蛛池域名 (3个):
- autopushnetwork.xyz
- contentpoolzone.site
- crawlboostnet.xyz

### VPS 2 - 37.60.254.52
管理的蜘蛛池域名 (3个):
- crawlenginepro.xyz
- linkpushmatrix.site
- rankspiderchain.xyz

### VPS 3 - 75.119.154.120
管理的蜘蛛池域名 (3个):
- seohubnetwork.xyz
- spidertrackzone.xyz
- trafficboostflow.site

## 系统架构

```
┌─────────────────────────────────────────────┐
│         Admin Backend (Vercel)              │
│        adminseohub.xyz                      │
│  - 动态内容管理                             │
│  - Spider Pool API                          │
│  - PostgreSQL 数据库                        │
└──────────────┬──────────────────────────────┘
               │
               ├─────────────────┬─────────────────┬─────────────────┐
               │                 │                 │                 │
               ▼                 ▼                 ▼                 │
      ┌────────────────┐ ┌────────────────┐ ┌────────────────┐     │
      │  VPS 1 (Nginx) │ │  VPS 2 (Nginx) │ │  VPS 3 (Nginx) │     │
      │  95.111.231.110│ │  37.60.254.52  │ │ 75.119.154.120 │     │
      │   3个域名      │ │   3个域名      │ │   3个域名      │     │
      └────────────────┘ └────────────────┘ └────────────────┘     │
               │                 │                 │                 │
               └─────────────────┴─────────────────┴─────────────────┘
                                   │
                                   ▼
                         用户/搜索引擎爬虫访问
```

## DNS配置清单

在域名管理控制台（CloudFlare/阿里云等）配置以下A记录：

| 域名                    | 类型 | 目标IP          | VPS  |
|------------------------|------|-----------------|------|
| autopushnetwork.xyz    | A    | 95.111.231.110  | VPS1 |
| contentpoolzone.site   | A    | 95.111.231.110  | VPS1 |
| crawlboostnet.xyz      | A    | 95.111.231.110  | VPS1 |
| crawlenginepro.xyz     | A    | 37.60.254.52    | VPS2 |
| linkpushmatrix.site    | A    | 37.60.254.52    | VPS2 |
| rankspiderchain.xyz    | A    | 37.60.254.52    | VPS2 |
| seohubnetwork.xyz      | A    | 75.119.154.120  | VPS3 |
| spidertrackzone.xyz    | A    | 75.119.154.120  | VPS3 |
| trafficboostflow.site  | A    | 75.119.154.120  | VPS3 |

## 快速部署流程

### 1. 上传部署包到VPS

```bash
# 从本地上传到3台VPS
cd /path/to/seo-admin
scp -r spider-pool-deployment root@95.111.231.110:/root/
scp -r spider-pool-deployment root@37.60.254.52:/root/
scp -r spider-pool-deployment root@75.119.154.120:/root/
```

### 2. 在每台VPS上运行部署脚本

**VPS 1 (95.111.231.110):**
```bash
ssh root@95.111.231.110
cd /root/spider-pool-deployment
chmod +x scripts/*.sh
bash scripts/deploy.sh 1
```

**VPS 2 (37.60.254.52):**
```bash
ssh root@37.60.254.52
cd /root/spider-pool-deployment
chmod +x scripts/*.sh
bash scripts/deploy.sh 2
```

**VPS 3 (75.119.154.120):**
```bash
ssh root@75.119.154.120
cd /root/spider-pool-deployment
chmod +x scripts/*.sh
bash scripts/deploy.sh 3
```

### 3. 配置DNS

在域名注册商控制台配置上述A记录，等待5-30分钟生效。

### 4. 验证DNS解析

```bash
# 在任意VPS或本地执行
cd /root/spider-pool-deployment
bash scripts/check-dns.sh
```

### 5. 申请SSL证书

DNS生效后，在每台VPS上运行：

**VPS 1:**
```bash
bash scripts/ssl.sh 1 your-email@example.com
```

**VPS 2:**
```bash
bash scripts/ssl.sh 2 your-email@example.com
```

**VPS 3:**
```bash
bash scripts/ssl.sh 3 your-email@example.com
```

### 6. 测试访问

浏览器访问任意域名验证：
```
https://autopushnetwork.xyz
https://autopushnetwork.xyz/sitemap.xml
https://autopushnetwork.xyz/robots.txt
```

## 监控和维护

### 健康检查

在每台VPS上运行监控脚本：
```bash
# VPS 1
bash scripts/monitor.sh 1

# VPS 2
bash scripts/monitor.sh 2

# VPS 3
bash scripts/monitor.sh 3
```

### 查看日志

```bash
# 访问日志
tail -f /www/wwwlogs/*-access.log

# 错误日志
tail -f /www/wwwlogs/*-error.log

# 爬虫访问统计
tail -f /www/wwwlogs/*-access.log | grep -i bot
```

### 常用命令

```bash
# Nginx相关
systemctl status nginx      # 查看状态
nginx -t                    # 测试配置
nginx -s reload             # 重载配置
systemctl restart nginx     # 重启服务

# SSL证书相关
certbot certificates        # 查看证书
certbot renew              # 手动续期
certbot renew --dry-run    # 测试续期
```

## 性能数据

### 每个域名
- 页面数量: 150页
- 预计月流量: 150MB
- 页面大小: ~10KB/页

### 3台VPS总计
- 总域名数: 9个
- 总页面数: 1,350页
- 预计总流量: ~5GB/月

## 故障排查

### 域名无法访问
1. 检查Nginx状态: `systemctl status nginx`
2. 检查DNS解析: `dig domain.com`
3. 查看错误日志: `tail -f /www/wwwlogs/*-error.log`

### SSL证书申请失败
1. 确认DNS已解析: `bash scripts/check-dns.sh`
2. 检查80端口: `curl http://domain.com`
3. 查看详细错误: `certbot --nginx -d domain.com --dry-run`

### 页面返回404
1. 确认Admin Backend运行正常
2. 测试API: `curl https://adminseohub.xyz/api/p/autopushnetwork.xyz?slug=index`
3. 检查Nginx代理配置

## 安全注意事项

1. **防火墙配置**: 仅开放必要端口 (22, 80, 443)
2. **SSH安全**: 使用密钥认证，禁用密码登录
3. **定期更新**: 保持系统和Nginx版本最新
4. **备份配置**: 定期备份Nginx配置和SSL证书
5. **监控日志**: 定期检查访问和错误日志

## 联系信息

- Admin Backend: https://adminseohub.xyz
- 部署文档: `/spider-pool-deployment/docs/`
- 技术文档: `/docs/README.md`

---

最后更新: 2025-11-15
