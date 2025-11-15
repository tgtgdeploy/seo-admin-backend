/**
 * 完整系统初始化脚本
 * Complete System Initialization Script
 *
 * 一键配置:
 * - 3个主站网站
 * - 示例文章
 * - 关键词追踪
 * - 网站地图
 * - 9个蜘蛛池域名
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 3个主站配置
const websites = [
  {
    name: 'Telegram TG Hub',
    domain: 'telegramtghub.com',
    seoTitle: 'Telegram官网 - TG中文版下载 | 电报最新版本',
    seoDescription: 'Telegram官方网站提供最新TG中文版下载，支持iOS、Android、Windows、Mac等全平台。了解Telegram最新功能和使用技巧。',
    seoKeywords: 'Telegram,TG,电报,Telegram中文版,TG下载,电报下载',
    aliases: ['www.telegramtghub.com']
  },
  {
    name: 'Telegram Update Center',
    domain: 'telegramupdatecenter.com',
    seoTitle: 'Telegram更新中心 - 最新版本下载与功能介绍',
    seoDescription: 'Telegram官方更新中心，第一时间发布TG最新版本、新功能介绍和使用教程。跟踪Telegram所有重要更新。',
    seoKeywords: 'Telegram更新,TG新版本,Telegram功能,电报更新',
    aliases: ['www.telegramupdatecenter.com']
  },
  {
    name: 'Telegram Trend Guide',
    domain: 'telegramtrendguide.com',
    seoTitle: 'Telegram趋势指南 - 热门频道与使用技巧',
    seoDescription: 'Telegram趋势分析和使用指南，发现热门TG频道、群组，掌握高级使用技巧，提升Telegram体验。',
    seoKeywords: 'Telegram频道,TG群组,Telegram技巧,电报使用',
    aliases: ['www.telegramtrendguide.com']
  }
];

// 示例文章（每个网站1-2篇）
const posts = [
  {
    domain: 'telegramtghub.com',
    title: 'Telegram中文版完整下载指南 - 支持所有平台',
    slug: 'telegram-download-guide',
    content: `
# Telegram中文版完整下载指南

Telegram是全球领先的即时通讯应用，以其安全性、速度和功能丰富而著称。本指南将帮助你在各个平台上下载和安装Telegram中文版。

## iOS平台下载

1. 打开App Store
2. 搜索"Telegram"
3. 点击"获取"下载安装
4. 打开应用后可在设置中切换为中文界面

## Android平台下载

可以通过以下方式下载：
- Google Play商店搜索"Telegram"
- 访问Telegram官网下载APK文件
- 从华为应用市场等第三方商店下载

## Windows/Mac桌面版

访问Telegram官网下载对应系统的桌面客户端，支持：
- Windows 7及以上版本
- macOS 10.12及以上版本
- Linux各主流发行版

## 网页版使用

如果不想安装客户端，可以直接使用Telegram网页版：web.telegram.org

## 常见问题

**Q: Telegram安全吗？**
A: Telegram采用端到端加密，所有消息都经过加密传输，非常安全。

**Q: 如何切换中文界面？**
A: Settings → Language → 简体中文

立即下载Telegram，体验更安全、更快速的即时通讯！
    `,
    excerpt: 'Telegram中文版下载完整指南，支持iOS、Android、Windows、Mac等所有平台。了解如何下载安装和使用Telegram。',
    featuredImage: '/images/telegram-download.jpg',
    seoTitle: 'Telegram中文版下载 - iOS/Android/PC全平台安装指南',
    seoDescription: 'Telegram官方中文版下载教程，支持iPhone、Android手机、Windows电脑、Mac等全平台。安全、快速、免费的即时通讯工具。',
    seoKeywords: 'Telegram下载,TG下载,电报下载,Telegram中文版,TG中文版'
  },
  {
    domain: 'telegramtghub.com',
    title: 'Telegram vs WhatsApp - 哪个更好？完整对比',
    slug: 'telegram-vs-whatsapp',
    content: `
# Telegram vs WhatsApp - 深度对比

在选择即时通讯应用时，Telegram和WhatsApp是最受欢迎的两个选择。本文将详细对比两者的优缺点。

## 隐私和安全性

**Telegram优势：**
- 可选的端到端加密（秘密聊天）
- 服务器端加密所有消息
- 不要求提供真实手机号（可用用户名）
- 支持自毁消息

**WhatsApp优势：**
- 默认端到端加密所有对话
- 被Facebook收购后的强大后盾

## 功能对比

**Telegram独有功能：**
- 频道（无限订阅者）
- 机器人API
- 云端存储（跨设备同步）
- 支持2GB大文件传输
- 更强大的群组管理（20万成员）

**WhatsApp独有功能：**
- 语音和视频通话更稳定
- 状态功能
- 商业账户支持

## 用户基数

- WhatsApp: 约20亿月活用户
- Telegram: 约7亿月活用户

## 结论

如果你注重隐私、需要强大的群组功能和云存储，选择Telegram。如果你的朋友都在用WhatsApp，且主要需求是语音视频通话，选择WhatsApp。

很多用户选择同时使用两者，发挥各自优势。
    `,
    excerpt: 'Telegram和WhatsApp哪个更好？从隐私、功能、用户基数等多个维度深度对比两大即时通讯应用。',
    seoTitle: 'Telegram vs WhatsApp对比 - 哪个即时通讯工具更好？',
    seoDescription: 'Telegram和WhatsApp功能对比，从安全性、隐私保护、功能特性等方面分析两者优劣，帮助你选择最适合的即时通讯工具。'
  },
  {
    domain: 'telegramupdatecenter.com',
    title: 'Telegram 2024年最新功能更新汇总',
    slug: 'telegram-2024-updates',
    content: `
# Telegram 2024年最新功能更新

Telegram在2024年推出了许多令人兴奋的新功能，让通讯体验更加完善。

## 主要新功能

### 1. 故事功能（Stories）
类似Instagram和WhatsApp的故事功能，可以分享24小时后自动消失的内容。

### 2. 增强的频道功能
- 频道可以设置多个管理员
- 新增频道统计数据
- 改进的内容推荐算法

### 3. 改进的语音消息
- 支持2倍速播放
- 语音消息转文字（部分语言）
- 波形可视化

### 4. 表情回应升级
- 支持自定义表情回应
- 可以看到谁给消息点了什么反应

### 5. 主题和界面优化
- 新增多个官方主题
- 支持更细致的聊天背景自定义
- 改进的暗黑模式

## 安全性更新

- 增强的两步验证
- 设备管理改进
- 新的隐私设置选项

## 性能优化

- 启动速度提升30%
- 消息加载更快
- 降低电池消耗

## 如何更新

访问应用商店或Telegram官网下载最新版本，立即体验这些新功能！

持续关注Telegram更新中心，第一时间了解最新功能。
    `,
    excerpt: 'Telegram 2024年度重大更新汇总，包括故事功能、频道增强、语音消息改进等多项新特性。',
    seoTitle: 'Telegram 2024最新版本功能更新 - 新特性全面解析',
    seoDescription: 'Telegram 2024年最新功能更新详解，包括Stories故事、频道增强、语音转文字等，了解TG最新特性。'
  },
  {
    domain: 'telegramtrendguide.com',
    title: 'Telegram热门中文频道推荐 - 2024精选',
    slug: 'top-chinese-telegram-channels',
    content: `
# Telegram热门中文频道推荐

Telegram的频道功能让你可以订阅感兴趣的内容。以下是2024年最受欢迎的中文频道。

## 科技类频道

### 1. 科技资讯速递
分享最新科技新闻、产品评测和行业动态。
订阅者：10万+

### 2. 程序员技术分享
编程技巧、开源项目、技术文章精选。
订阅者：5万+

## 新闻资讯

### 3. 每日新闻精选
每天推送重要新闻摘要，快速了解时事。
订阅者：15万+

### 4. 财经观察
股市、加密货币、经济分析。
订阅者：8万+

## 学习成长

### 5. 英语学习日课
每天分享英语学习资源和技巧。
订阅者：12万+

### 6. 读书笔记
好书推荐和阅读分享。
订阅者：6万+

## 生活娱乐

### 7. 美食探店
各地美食推荐和探店体验。
订阅者：7万+

### 8. 影视推荐
电影、剧集推荐和影评。
订阅者：9万+

## 如何寻找频道

1. 使用Telegram内置搜索
2. 访问频道导航网站
3. 加入频道分享群组
4. 关注感兴趣的公众人物

## 订阅建议

- 不要订阅太多频道，保持信息质量
- 定期清理不活跃的频道
- 开启重要频道的消息通知

开始探索Telegram丰富的中文内容生态吧！
    `,
    excerpt: '2024年Telegram最受欢迎的中文频道推荐，涵盖科技、新闻、学习、娱乐等各个领域。',
    seoTitle: 'Telegram中文频道推荐 - 2024热门TG频道精选',
    seoDescription: 'Telegram优质中文频道推荐，包括科技、新闻、学习、娱乐等类型，帮助你发现有价值的TG内容。'
  },
  {
    domain: 'telegramtrendguide.com',
    title: 'Telegram高级使用技巧 - 提升效率的10个方法',
    slug: 'telegram-advanced-tips',
    content: `
# Telegram高级使用技巧

掌握这些技巧，让你的Telegram使用体验提升10倍！

## 1. 使用文件夹整理聊天

创建多个文件夹，将聊天分类管理：
- 工作相关
- 家人朋友
- 频道订阅
- 机器人

设置方法：Settings → Folders → Create New Folder

## 2. 保存重要消息

长按消息 → Bookmark，收藏的消息会保存在"Saved Messages"中，可以跨设备同步。

## 3. 使用机器人提高效率

推荐机器人：
- @DownloadBot - 下载各平台视频
- @TranslateBot - 即时翻译
- @ReminderBot - 设置提醒

## 4. 创建投票和测验

在群组中快速创建投票：
点击附件 → Poll → 设置问题和选项

## 5. 使用搜索过滤器

在搜索框使用：
- from:用户名 - 搜索特定用户的消息
- #标签 - 搜索包含标签的消息

## 6. 自定义通知

为不同聊天设置不同的通知音：
聊天设置 → Notifications → Sound

## 7. 使用代理保护隐私

Settings → Data and Storage → Proxy Settings
添加SOCKS5或MTProto代理

## 8. 批量转发消息

长按消息 → 选择多条 → 转发
可以一次转发最多100条消息

## 9. 使用草稿功能

开始输入消息但不发送，会自动保存为草稿，切换聊天也不会丢失。

## 10. 启用慢速模式（群管理）

在大型群组中启用慢速模式，限制发言频率，保持讨论质量。

掌握这些技巧，成为Telegram高手！
    `,
    excerpt: '10个Telegram高级使用技巧，包括文件夹整理、机器人使用、搜索技巧等，显著提升使用效率。',
    seoTitle: 'Telegram使用技巧 - 10个提升效率的高级方法',
    seoDescription: 'Telegram进阶使用教程，文件夹管理、机器人、搜索过滤、通知自定义等高级技巧，让你成为TG使用专家。'
  }
];

// 关键词配置
const keywords = [
  { keyword: 'Telegram下载', targetUrl: 'https://telegramtghub.com/telegram-download-guide' },
  { keyword: 'TG中文版', targetUrl: 'https://telegramtghub.com' },
  { keyword: 'Telegram更新', targetUrl: 'https://telegramupdatecenter.com/telegram-2024-updates' },
  { keyword: 'Telegram频道', targetUrl: 'https://telegramtrendguide.com/top-chinese-telegram-channels' },
  { keyword: 'Telegram技巧', targetUrl: 'https://telegramtrendguide.com/telegram-advanced-tips' },
  { keyword: '电报中文版', targetUrl: 'https://telegramtghub.com' },
  { keyword: 'TG下载', targetUrl: 'https://telegramtghub.com/telegram-download-guide' }
];

// 9个蜘蛛池域名配置
const spiderPoolDomains = [
  { domain: 'tgspider1.xyz', description: '蜘蛛池站点1' },
  { domain: 'tgspider2.xyz', description: '蜘蛛池站点2' },
  { domain: 'tgspider3.xyz', description: '蜘蛛池站点3' },
  { domain: 'telegrampool1.com', description: '蜘蛛池站点4' },
  { domain: 'telegrampool2.com', description: '蜘蛛池站点5' },
  { domain: 'telegrampool3.com', description: '蜘蛛池站点6' },
  { domain: 'tghub-pool1.net', description: '蜘蛛池站点7' },
  { domain: 'tghub-pool2.net', description: '蜘蛛池站点8' },
  { domain: 'tghub-pool3.net', description: '蜘蛛池站点9' }
];

async function initializeSystem() {
  try {
    console.log('🚀 开始初始化系统...\n');

    // 1. 创建主站网站
    console.log('📝 创建主站网站...');
    for (const site of websites) {
      const { aliases, ...siteData } = site;

      // 检查网站是否已存在
      const existing = await prisma.website.findUnique({
        where: { domain: site.domain }
      });

      let website;
      if (existing) {
        console.log(`   ✓ 网站 ${site.domain} 已存在，更新信息`);
        website = await prisma.website.update({
          where: { domain: site.domain },
          data: {
            ...siteData,
            status: 'ACTIVE',
            updatedAt: new Date()
          }
        });
      } else {
        console.log(`   ✓ 创建网站 ${site.domain}`);
        website = await prisma.website.create({
          data: {
            ...siteData,
            status: 'ACTIVE'
          }
        });
      }

      // 创建域名别名
      for (const alias of aliases) {
        const existingAlias = await prisma.domainAlias.findFirst({
          where: { alias, websiteId: website.id }
        });

        if (!existingAlias) {
          await prisma.domainAlias.create({
            data: {
              alias,
              websiteId: website.id
            }
          });
          console.log(`     - 添加别名: ${alias}`);
        }
      }
    }

    // 2. 创建示例文章
    console.log('\n📄 创建示例文章...');
    for (const post of posts) {
      const website = await prisma.website.findUnique({
        where: { domain: post.domain }
      });

      if (!website) {
        console.log(`   ⚠️  网站 ${post.domain} 不存在，跳过文章`);
        continue;
      }

      const existingPost = await prisma.post.findFirst({
        where: { slug: post.slug, websiteId: website.id }
      });

      if (existingPost) {
        console.log(`   ✓ 文章 "${post.title}" 已存在`);
      } else {
        await prisma.post.create({
          data: {
            ...post,
            websiteId: website.id,
            status: 'PUBLISHED',
            publishedAt: new Date()
          }
        });
        console.log(`   ✓ 创建文章: ${post.title}`);
      }
    }

    // 3. 创建关键词
    console.log('\n🔑 配置关键词追踪...');
    for (const kw of keywords) {
      const existing = await prisma.keyword.findFirst({
        where: { keyword: kw.keyword }
      });

      if (existing) {
        console.log(`   ✓ 关键词 "${kw.keyword}" 已存在`);
      } else {
        await prisma.keyword.create({
          data: kw
        });
        console.log(`   ✓ 添加关键词: ${kw.keyword}`);
      }
    }

    // 4. 生成网站地图
    console.log('\n🗺️  生成网站地图...');
    for (const site of websites) {
      const website = await prisma.website.findUnique({
        where: { domain: site.domain }
      });

      if (!website) continue;

      // 获取该网站的所有已发布文章
      const posts = await prisma.post.findMany({
        where: {
          websiteId: website.id,
          status: 'PUBLISHED'
        },
        select: {
          slug: true,
          updatedAt: true
        }
      });

      // 构建sitemap XML
      const urls = [
        {
          loc: `https://${site.domain}`,
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
          priority: '1.0'
        },
        ...posts.map(post => ({
          loc: `https://${site.domain}/${post.slug}`,
          lastmod: post.updatedAt.toISOString(),
          changefreq: 'weekly',
          priority: '0.8'
        }))
      ];

      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

      const existingSitemap = await prisma.sitemap.findFirst({
        where: { websiteId: website.id }
      });

      if (existingSitemap) {
        await prisma.sitemap.update({
          where: { id: existingSitemap.id },
          data: {
            content: sitemapXml,
            urlCount: urls.length,
            updatedAt: new Date()
          }
        });
        console.log(`   ✓ 更新 ${site.domain} 的sitemap (${urls.length} URLs)`);
      } else {
        await prisma.sitemap.create({
          data: {
            websiteId: website.id,
            content: sitemapXml,
            urlCount: urls.length
          }
        });
        console.log(`   ✓ 生成 ${site.domain} 的sitemap (${urls.length} URLs)`);
      }
    }

    // 5. 配置蜘蛛池域名
    console.log('\n🕷️  配置蜘蛛池域名...');
    for (const spiderDomain of spiderPoolDomains) {
      const existing = await prisma.spiderPoolDomain.findUnique({
        where: { domain: spiderDomain.domain }
      });

      if (existing) {
        await prisma.spiderPoolDomain.update({
          where: { domain: spiderDomain.domain },
          data: {
            description: spiderDomain.description,
            status: 'ACTIVE',
            updatedAt: new Date()
          }
        });
        console.log(`   ✓ 更新蜘蛛池域名: ${spiderDomain.domain}`);
      } else {
        await prisma.spiderPoolDomain.create({
          data: {
            ...spiderDomain,
            status: 'ACTIVE'
          }
        });
        console.log(`   ✓ 添加蜘蛛池域名: ${spiderDomain.domain}`);
      }
    }

    console.log('\n✅ 系统初始化完成！\n');
    console.log('📊 初始化统计:');
    console.log(`   - 网站: ${websites.length} 个`);
    console.log(`   - 文章: ${posts.length} 篇`);
    console.log(`   - 关键词: ${keywords.length} 个`);
    console.log(`   - 蜘蛛池域名: ${spiderPoolDomains.length} 个`);
    console.log('\n🌐 访问管理后台查看: https://adminseohub.xyz\n');

  } catch (error) {
    console.error('❌ 初始化失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行初始化
initializeSystem()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
