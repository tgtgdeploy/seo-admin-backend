# SSH 免密登录配置指南

> 用于配置本地到宝塔服务器的自动部署
> 服务器 IP: 38.147.178.158

---

## 🎯 目标

配置 SSH 免密登录后，可以使用一键部署脚本：

```bash
bash scripts/deploy/deploy-from-local.sh
```

自动完成：提交代码 → 推送 GitHub → 部署到服务器

---

## 📋 前提条件检查

### 1. 检查本地是否已有 SSH 密钥

```bash
# 检查 SSH 密钥
ls -la ~/.ssh/id_rsa*

# 如果看到以下文件，说明已有密钥
# ~/.ssh/id_rsa        (私钥)
# ~/.ssh/id_rsa.pub    (公钥)
```

### 2. 如果没有密钥，生成新的

```bash
# 生成 SSH 密钥对
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# 按提示操作：
# 1. 文件位置：直接回车（使用默认 ~/.ssh/id_rsa）
# 2. 密码：直接回车（不设置密码，才能免密登录）
# 3. 确认密码：直接回车
```

### 3. 测试服务器连接

```bash
# 测试是否能连接服务器（需要输入密码）
ssh root@38.147.178.158

# 如果连接成功，输入 exit 退出
exit
```

---

## 🚀 方法一：使用 ssh-copy-id（推荐）

**最简单的方法**，一条命令完成：

```bash
# 复制公钥到服务器
ssh-copy-id root@38.147.178.158

# 会提示输入服务器密码，输入后完成配置
```

**验证是否成功**：

```bash
# 尝试免密登录（不应要求输入密码）
ssh root@38.147.178.158 "echo '免密登录成功！'"

# 如果显示 "免密登录成功！" 说明配置正确
```

---

## 🔧 方法二：手动配置（如果方法一不可用）

### 步骤1: 复制公钥内容

```bash
# 显示公钥内容
cat ~/.ssh/id_rsa.pub

# 复制整行内容（以 ssh-rsa 开头）
```

### 步骤2: 登录服务器

```bash
# SSH 登录宝塔服务器
ssh root@38.147.178.158
```

### 步骤3: 添加公钥到服务器

```bash
# 在服务器上执行以下命令

# 创建 .ssh 目录（如果不存在）
mkdir -p ~/.ssh

# 设置权限
chmod 700 ~/.ssh

# 编辑 authorized_keys 文件
vim ~/.ssh/authorized_keys

# 或使用 nano（更简单）
nano ~/.ssh/authorized_keys
```

**在编辑器中**：
1. 按 `i` 进入编辑模式（vim）或直接编辑（nano）
2. 粘贴刚才复制的公钥内容（新起一行）
3. vim: 按 `ESC`，输入 `:wq` 保存退出
4. nano: 按 `Ctrl+O` 保存，`Ctrl+X` 退出

```bash
# 设置文件权限
chmod 600 ~/.ssh/authorized_keys

# 退出服务器
exit
```

### 步骤4: 测试免密登录

```bash
# 在本地执行（不应要求输入密码）
ssh root@38.147.178.158 "echo '免密登录成功！'"
```

---

## 🔐 方法三：通过宝塔面板配置

### 步骤1: 获取公钥

```bash
# 复制公钥内容到剪贴板
cat ~/.ssh/id_rsa.pub
# 或
cat ~/.ssh/id_rsa.pub | pbcopy  # macOS
cat ~/.ssh/id_rsa.pub | xclip   # Linux
```

### 步骤2: 在宝塔面板配置

1. 登录宝塔面板：`http://38.147.178.158:8888`
2. 进入 **安全** → **SSH 安全设置**
3. 找到 **authorized_keys** 管理
4. 添加你的公钥

### 步骤3: 测试连接

```bash
ssh root@38.147.178.158 "echo '免密登录成功！'"
```

---

## ✅ 配置完成后的使用

### 一键部署脚本

```bash
# 方式1: 自动提交当前修改并部署
bash scripts/deploy/deploy-from-local.sh

# 方式2: 如果代码已提交，只需远程部署
ssh root@38.147.178.158 'cd /www/wwwroot/seo-admin && bash scripts/deploy/deploy-production.sh'
```

### 快速推送脚本

```bash
# 只推送到 GitHub（不部署到服务器）
bash scripts/deploy/quick-deploy.sh "提交信息"
```

---

## 🔍 故障排查

### 问题1: 仍然要求输入密码

**检查权限**：

```bash
# 在服务器上检查文件权限
ssh root@38.147.178.158 "ls -la ~/.ssh"

# 正确的权限应该是：
# drwx------  .ssh/               (700)
# -rw-------  .ssh/authorized_keys (600)
```

**修复权限**：

```bash
ssh root@38.147.178.158 "chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
```

### 问题2: 公钥格式错误

**检查公钥格式**：

```bash
# 公钥应该是单行，以 ssh-rsa 或 ssh-ed25519 开头
cat ~/.ssh/id_rsa.pub
```

确保：
- 整个公钥在一行（不要有换行）
- 以 `ssh-rsa` 开头
- 末尾通常有邮箱或注释

### 问题3: 服务器 SSH 配置问题

**检查服务器 SSH 配置**：

```bash
# 在服务器上检查 sshd_config
ssh root@38.147.178.158 "cat /etc/ssh/sshd_config | grep PubkeyAuthentication"

# 应该看到：
# PubkeyAuthentication yes
```

**如果是 no，需要修改**：

```bash
# 编辑配置
sudo vim /etc/ssh/sshd_config

# 找到并修改：
PubkeyAuthentication yes

# 重启 SSH 服务
sudo systemctl restart sshd
```

### 问题4: 防火墙阻止

**检查宝塔防火墙**：
1. 登录宝塔面板
2. **安全** → **防火墙**
3. 确保 SSH 端口（默认 22）已开放

---

## 📊 验证清单

配置完成后，验证以下项目：

| 检查项 | 命令 | 预期结果 |
|--------|------|---------|
| SSH 密钥存在 | `ls ~/.ssh/id_rsa*` | 显示私钥和公钥文件 |
| 免密登录 | `ssh root@38.147.178.158 "echo 'OK'"` | 不要求密码，显示 OK |
| 远程命令 | `ssh root@38.147.178.158 "pwd"` | 显示服务器路径 |
| Git 拉取 | `ssh root@38.147.178.158 "cd /www/wwwroot/seo-admin && git status"` | 显示 Git 状态 |
| 一键部署 | `bash scripts/deploy/deploy-from-local.sh` | 自动完成部署 |

---

## 🎉 成功！

配置完成后，你可以：

✅ **快速部署**：
```bash
bash scripts/deploy/quick-deploy.sh "更新内容"
```

✅ **一键部署**：
```bash
bash scripts/deploy/deploy-from-local.sh
```

✅ **远程管理**：
```bash
# 查看日志
ssh root@38.147.178.158 "pm2 logs seo-admin --lines 20"

# 重启应用
ssh root@38.147.178.158 "pm2 restart seo-admin"

# 查看状态
ssh root@38.147.178.158 "pm2 list"
```

---

## 📚 相关文档

- [部署脚本使用指南](DEPLOY_SCRIPTS_GUIDE.md)
- [宝塔部署教程](../../BAOTA-DEPLOYMENT.md)
- [快速开始](../getting-started/QUICK_START.md)

---

生成时间: 2025-11-23
服务器 IP: 38.147.178.158
维护者: Claude Code
版本: 1.0.0
