# 蜘蛛池内容素材库

## 📁 文件夹说明

这个文件夹专门用于存放蜘蛛池的内容素材HTML文件。系统会自动从这里的HTML文件中提取：
- 📄 段落内容（paragraphs）
- 📝 标题文本（headings）
- 🔑 关键词（keywords）

## 🎯 使用方法

### 1. 添加HTML素材

将HTML文件放入此文件夹即可，支持：
- ✅ 下载的静态网页
- ✅ 导出的HTML文档
- ✅ 任何包含有价值内容的HTML文件

```bash
# 示例：复制HTML文件到素材库
cp /path/to/your/page.html /home/ubuntu/WebstormProjects/seo-admin/spider-pool-content/
```

### 2. 文件命名建议

建议使用有意义的文件名，系统会根据文件名自动生成关键词：

- `website-1-telegram.html` → 自动添加 "Telegram中文版", "TG纸飞机" 等关键词
- `website-2-zhifei.html` → 自动添加 "纸飞机", "TG飞机" 等关键词
- `something-download.html` → 自动添加 "Telegram下载", "安全即时通讯" 等关键词

### 3. 提取内容

在后台管理系统中：
1. 进入 **蜘蛛池管理** 页面
2. 切换到 **内容源** 标签
3. 点击 **🔄 重新提取内容源** 按钮

系统会自动扫描此文件夹中的所有 `.html` 文件并提取内容。

### 4. 生成蜘蛛池页面

内容源提取完成后：
1. 返回 **概览统计** 标签
2. 点击 **🔄 重新生成所有页面** 按钮
3. 系统会使用提取的内容生成 1,350 个SEO优化页面

## 📋 当前素材列表

```
website-1-telegram.html   - Telegram Hub 主站内容 (70KB)
website-2-zhifei.html     - Telegram Trend Guide 主站内容 (648KB)
website-tg-download.html  - Telegram Update Center 主站内容 (48KB)
```

## 💡 内容提取规则

系统会从HTML文件中提取：

1. **段落内容** - 从以下标签提取：
   - `<p>` 标签
   - `.content p`、`article p`、`.post-content p` 等常见内容区域
   - 长度 > 20 字符的文本

2. **标题文本** - 从以下标签提取：
   - `<h1>`、`<h2>`、`<h3>`、`<h4>`、`<h5>`、`<h6>`
   - 长度 0-200 字符之间的标题

3. **关键词** - 自动生成：
   - 基础关键词：Telegram、电报、TG、纸飞机、即时通讯
   - 根据文件名智能添加相关关键词

## 🌟 最佳实践

### 推荐素材来源

1. **您自己的网站** ✅
   - website-1、website-2、website-tg 的HTML导出
   - 质量高、相关性强

2. **行业相关网站** ✅
   - Telegram 官方博客
   - 技术教程网站
   - 行业资讯平台

3. **优质内容网站** ✅
   - 技术文档
   - 产品介绍页
   - 博客文章

### 避免的内容

- ❌ 垃圾内容或低质量页面
- ❌ 侵犯版权的内容
- ❌ 广告页面或纯推广内容
- ❌ 包含大量 JavaScript 的动态页面

### 如何下载网页

#### 方法1：浏览器保存（推荐）
```
1. 在浏览器中打开目标网页
2. 右键 → "另存为" → "网页，全部"
3. 保存为 .html 文件
4. 复制到 spider-pool-content 文件夹
```

#### 方法2：使用 wget
```bash
# 下载单个页面
wget -O spider-pool-content/example.html "https://example.com/page.html"

# 下载整个网站（谨慎使用）
wget -r -l 2 -k -p -np "https://example.com"
```

#### 方法3：使用 curl
```bash
curl "https://example.com/page.html" -o spider-pool-content/example.html
```

## 🔧 高级配置

如果需要自定义关键词，可以修改文件：
```
/home/ubuntu/WebstormProjects/seo-admin/packages/database/src/services/spider-pool.service.ts
```

在 `initializeContentSources` 函数中调整关键词生成逻辑。

## 📊 查看提取结果

在后台管理系统的 **蜘蛛池管理 → 内容源** 中可以看到：
- 📄 总段落数
- 📝 总标题数
- 🔑 总关键词数
- 📅 最后提取时间

## ⚠️ 注意事项

1. **文件大小**: 建议单个HTML文件不超过 2MB
2. **文件编码**: 确保HTML文件使用 UTF-8 编码
3. **内容质量**: 高质量的原始内容会生成更好的蜘蛛池页面
4. **定期更新**: 建议每月添加新素材并重新提取
5. **备份**: 建议备份重要的HTML素材文件

## 🚀 快速开始

```bash
# 1. 下载新的HTML素材
wget -O spider-pool-content/new-content.html "https://example.com/article.html"

# 2. 在后台管理系统中提取内容
#    蜘蛛池管理 → 内容源 → 重新提取内容源

# 3. 生成蜘蛛池页面
#    蜘蛛池管理 → 概览统计 → 重新生成所有页面
```

## 📞 技术支持

如有问题，请查看系统日志或联系技术支持。
