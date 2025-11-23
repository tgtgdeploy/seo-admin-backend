# 下载链接动态管理指南

## 概述

所有三个网站的下载链接现在都从数据库动态加载，不再硬编码在代码中。

## 优势

✅ **更安全**: 不容易被浏览器标记为不安全
✅ **易管理**: 无需修改代码和重新部署即可更新链接
✅ **灵活配置**: 每个网站可以有不同的下载链接

## 数据库配置

下载链接存储在 `system_settings` 表中，配置键名：

- `download_url_telegramtghub` - Telegram Hub 的下载链接
- `download_url_telegramtrendguide` - Telegram Trend Guide 的下载链接
- `download_url_telegramupdatecenter` - Telegram Update Center 的下载链接
- `download_url_default` - 默认下载链接（当找不到特定配置时使用）

## 如何更新下载链接

### 方法1：直接修改数据库

```sql
-- 更新 Telegram Hub 的下载链接
UPDATE system_settings
SET value = 'https://your-new-download-url.com/telegram.apk'
WHERE key = 'download_url_telegramtghub';

-- 更新默认下载链接
UPDATE system_settings
SET value = 'https://telegram.org/android'
WHERE key = 'download_url_default';
```

### 方法2：使用 Node.js 脚本

创建一个更新脚本 `update-download-link.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDownloadLink(key, newUrl) {
  await prisma.systemSetting.update({
    where: { key },
    data: { value: newUrl }
  });
  console.log(`✅ 已更新 ${key} = ${newUrl}`);
}

// 使用示例
updateDownloadLink('download_url_telegramtghub', 'https://new-url.com/app.apk')
  .then(() => prisma.$disconnect())
  .catch(console.error);
```

## 网站实现原理

### seo-website-1 和 seo-website-2

使用两部分组件：

1. **服务器组件** (`app/download/page.tsx`):
   - 从数据库获取下载链接
   - 根据域名自动匹配正确的配置

2. **客户端组件** (`app/download/DownloadClient.tsx`):
   - 接收下载链接参数
   - 自动跳转到下载页面

### seo-website-tg

使用服务器组件 (`components/DownloadSection.tsx`):
- 从数据库获取Android APK下载链接
- 动态注入到下载按钮中
- 其他平台链接保持官方地址

## 公开API端点

也提供了公开API供外部调用：

```
GET /api/public/download-url?domain=telegramtghub.com
```

响应:
```json
{
  "downloadUrl": "https://telegram.org/android",
  "domain": "telegramtghub.com",
  "websiteName": "Telegram Hub"
}
```

## 查看当前配置

运行以下命令查看所有下载链接配置：

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const settings = await prisma.systemSetting.findMany({
    where: { key: { startsWith: 'download_url_' } }
  });
  settings.forEach(s => console.log(\`\${s.key}: \${s.value}\`));
  await prisma.\$disconnect();
})();
"
```

## 注意事项

1. **默认链接**: 如果找不到特定网站的配置，会使用 `download_url_default`
2. **官方链接**: 默认配置使用 Telegram 官方 Android 下载页: `https://telegram.org/android`
3. **自动部署**: 更新数据库后，Vercel 会在下次访问时自动使用新链接，无需重新部署

## 维护建议

- 定期检查下载链接是否有效
- 更新链接时先测试新URL是否可用
- 考虑为不同地区配置不同的下载镜像链接
