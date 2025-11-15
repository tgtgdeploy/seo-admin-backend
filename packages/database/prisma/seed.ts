import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminEmail = 'admin@example.com'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  let admin
  if (!existingAdmin) {
    const hashedPassword = await hash('admin123', 10)
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
      },
    })
    console.log('✅ Created admin user:', adminEmail)
    console.log('   Password: admin123')
  } else {
    admin = existingAdmin
    console.log('ℹ️  Admin user already exists:', adminEmail)
  }

  // Create demo websites
  const website1 = await prisma.website.upsert({
    where: { domain: 'localhost:3001' },
    update: {},
    create: {
      name: 'Demo Website 1',
      domain: 'localhost:3001',
      description: 'First demo website for testing',
      status: 'ACTIVE',
      seoTitle: 'Demo Website 1 - SEO Management Platform',
      seoDescription:
        'A demonstration website showcasing the SEO management platform capabilities',
      seoKeywords: ['seo', 'demo', 'website', 'nextjs'],
    },
  })
  console.log('✅ Created/Updated website:', website1.name)

  const website2 = await prisma.website.upsert({
    where: { domain: 'localhost:3002' },
    update: {
      name: 'Telegram中文官网',
      description: 'Telegram中文官网 - 即时通讯，高效安全，强悍的聊天交友工具',
      seoTitle: 'Telegram中文官网 - TG中文版下载 | 纸飞机中文版',
      seoDescription:
        'Telegram中文官网提供TG中文版、纸飞机中文版下载。支持iOS、Android、Windows、Mac全平台，安全加密的即时通讯工具。',
      seoKeywords: ['telegram', 'tg', '纸飞机', 'telegram中文', '电报', 'telegram下载'],
    },
    create: {
      name: 'Telegram中文官网',
      domain: 'localhost:3002',
      description: 'Telegram中文官网 - 即时通讯，高效安全，强悍的聊天交友工具',
      status: 'ACTIVE',
      seoTitle: 'Telegram中文官网 - TG中文版下载 | 纸飞机中文版',
      seoDescription:
        'Telegram中文官网提供TG中文版、纸飞机中文版下载。支持iOS、Android、Windows、Mac全平台，安全加密的即时通讯工具。',
      seoKeywords: ['telegram', 'tg', '纸飞机', 'telegram中文', '电报', 'telegram下载'],
    },
  })
  console.log('✅ Created/Updated website:', website2.name)

  const websiteTG = await prisma.website.upsert({
    where: { domain: 'localhost:3003' },
    update: {},
    create: {
      name: 'TG中文纸飞机',
      domain: 'localhost:3003',
      description: 'Telegram中文官网 - 即时通讯，高效安全',
      status: 'ACTIVE',
      seoTitle: 'Telegram中文官网 - TG中文版下载 | 纸飞机中文版',
      seoDescription:
        'Telegram中文官网提供TG中文版、纸飞机中文版下载。支持iOS、Android、Windows、Mac全平台，安全加密的即时通讯工具。',
      seoKeywords: ['telegram', 'tg', '纸飞机', 'telegram中文', '电报', 'telegram下载'],
    },
  })
  console.log('✅ Created/Updated website:', websiteTG.name)

  // Create demo blog posts
  const post1 = await prisma.post.upsert({
    where: {
      websiteId_slug: {
        websiteId: website1.id,
        slug: 'welcome-to-our-platform',
      },
    },
    update: {},
    create: {
      title: 'Welcome to Our SEO Management Platform',
      slug: 'welcome-to-our-platform',
      content: `Welcome to our comprehensive SEO management platform! This is your one-stop solution for managing multiple websites, optimizing content, and tracking search engine performance.

Our platform offers powerful features including:
- Multi-website management
- Blog post synchronization across sites
- Keyword ranking tracking
- Spider pool monitoring
- Automated sitemap generation and submission

Whether you're managing a single blog or a network of websites, our platform provides all the tools you need to succeed in SEO.

Get started today and take your SEO efforts to the next level!`,
      metaTitle: 'Welcome to Our SEO Management Platform',
      metaDescription:
        'Discover how our SEO management platform can help you manage multiple websites, optimize content, and track performance.',
      metaKeywords: ['seo', 'platform', 'management', 'optimization'],
      status: 'PUBLISHED',
      websiteId: website1.id,
      authorId: admin.id,
    },
  })
  console.log('✅ Created/Updated post:', post1.title)

  const post2 = await prisma.post.upsert({
    where: {
      websiteId_slug: {
        websiteId: website1.id,
        slug: 'seo-best-practices-2025',
      },
    },
    update: {},
    create: {
      title: 'SEO Best Practices for 2025',
      slug: 'seo-best-practices-2025',
      content: `Search engine optimization continues to evolve, and staying up-to-date with best practices is crucial for success. Here are the top SEO strategies for 2025:

1. Quality Content First
Create valuable, original content that serves your audience's needs. Search engines prioritize content that provides real value.

2. Mobile-First Approach
Ensure your website is fully responsive and provides an excellent mobile experience.

3. Page Speed Optimization
Fast-loading pages improve user experience and search rankings.

4. Structured Data
Implement schema markup to help search engines understand your content better.

5. E-A-T Signals
Demonstrate expertise, authoritativeness, and trustworthiness in your content.

6. User Experience (UX)
Focus on creating intuitive navigation and engaging user experiences.

Follow these practices to improve your search rankings and drive more organic traffic!`,
      metaTitle: 'SEO Best Practices for 2025 - Complete Guide',
      metaDescription:
        'Learn the latest SEO best practices for 2025 including content strategy, mobile optimization, and user experience improvements.',
      metaKeywords: ['seo', 'best practices', '2025', 'optimization', 'ranking'],
      status: 'PUBLISHED',
      websiteId: website1.id,
      authorId: admin.id,
    },
  })
  console.log('✅ Created/Updated post:', post2.title)

  const post3 = await prisma.post.upsert({
    where: {
      websiteId_slug: {
        websiteId: website1.id,
        slug: 'content-syndication-guide',
      },
    },
    update: {},
    create: {
      title: 'The Complete Guide to Content Syndication',
      slug: 'content-syndication-guide',
      content: `Content syndication is a powerful strategy for expanding your reach and driving more traffic to your websites. Here's everything you need to know:

What is Content Syndication?
Content syndication involves republishing your content on third-party websites to reach a broader audience.

Benefits of Content Syndication:
- Increased brand visibility
- More backlinks to your site
- Greater audience reach
- Enhanced thought leadership

Best Practices:
1. Choose reputable syndication partners
2. Use canonical tags to avoid duplicate content issues
3. Track performance metrics
4. Maintain consistent branding

Our platform makes content syndication easy by allowing you to manage and sync posts across multiple websites from a single dashboard.

Start syndicating your content today and watch your reach grow!`,
      metaTitle: 'Content Syndication Guide - How to Expand Your Reach',
      metaDescription:
        'Learn how to effectively syndicate your content across multiple platforms to increase visibility and drive more traffic.',
      metaKeywords: [
        'content syndication',
        'content marketing',
        'distribution',
        'reach',
      ],
      status: 'PUBLISHED',
      websiteId: website1.id,
      authorId: admin.id,
      syncedWebsites: [website1.id, website2.id],
    },
  })
  console.log('✅ Created/Updated post:', post3.title)

  // Create posts for website2 (Telegram官网)
  const postW2_1 = await prisma.post.upsert({
    where: {
      websiteId_slug: {
        websiteId: website2.id,
        slug: 'telegram-introduction',
      },
    },
    update: {},
    create: {
      title: 'Telegram中文版完整介绍 - 功能、特点与优势',
      slug: 'telegram-introduction',
      content: `Telegram是一款全球领先的即时通讯应用，以其强大的功能、极致的安全性和卓越的用户体验而闻名。

## 核心特点

**1. 安全加密**
- 采用MTProto加密协议
- 支持端到端加密的秘密聊天
- 消息可设置自毁功能

**2. 云端同步**
- 消息存储在云端
- 支持多设备同时登录
- 跨平台无缝切换

**3. 功能强大**
- 支持最大2GB的文件传输
- 群组成员可达20万人
- 频道支持无限订阅者`,
      metaTitle: 'Telegram中文版完整介绍 - TG功能特点与优势',
      metaDescription:
        'Telegram中文版详细介绍，了解TG的核心功能、安全特性和使用优势，包括端到端加密、云同步、大文件传输等特点。',
      metaKeywords: ['telegram', 'telegram中文', 'tg介绍', 'telegram功能'],
      status: 'PUBLISHED',
      websiteId: website2.id,
      authorId: admin.id,
    },
  })
  console.log('✅ Created/Updated website2 post:', postW2_1.title)

  const postW2_2 = await prisma.post.upsert({
    where: {
      websiteId_slug: {
        websiteId: website2.id,
        slug: 'telegram-download-all-platforms',
      },
    },
    update: {},
    create: {
      title: 'Telegram全平台下载指南 - Windows/Mac/iOS/Android',
      slug: 'telegram-download-all-platforms',
      content: `本指南将帮助您在各种设备上下载和安装 Telegram。

## Windows 电脑版下载

1. 访问官方网站
2. 点击"下载 Windows 版"
3. 运行安装程序
4. 完成安装向导

## Mac 电脑版下载

1. 访问官方网站或App Store
2. 下载Mac版本
3. 拖拽到应用程序文件夹
4. 打开并登录

## Android 手机下载

1. 打开 Google Play 商店
2. 搜索"Telegram"
3. 点击安装
4. 等待下载完成

## iOS iPhone/iPad 下载

1. 打开 App Store
2. 搜索"Telegram"
3. 点击获取
4. 输入 Apple ID 密码确认`,
      metaTitle: 'Telegram下载 - TG全平台下载安装指南',
      metaDescription:
        'Telegram官方下载指南，支持Windows、Mac、iOS、Android全平台，提供详细的下载和安装步骤。',
      metaKeywords: ['telegram下载', 'tg下载', 'telegram安装', '纸飞机下载'],
      status: 'PUBLISHED',
      websiteId: website2.id,
      authorId: admin.id,
    },
  })
  console.log('✅ Created/Updated website2 post:', postW2_2.title)

  const postW2_3 = await prisma.post.upsert({
    where: {
      websiteId_slug: {
        websiteId: website2.id,
        slug: 'telegram-vs-wechat',
      },
    },
    update: {},
    create: {
      title: 'Telegram vs 微信：哪个更适合你？',
      slug: 'telegram-vs-wechat',
      content: `Telegram和微信都是流行的即时通讯应用，但它们在功能、隐私保护和使用场景上有很大差异。

## 隐私和安全

**Telegram优势：**
- 端到端加密的秘密聊天
- 无需实名制
- 可设置消息自毁
- 开源代码可审计

**微信特点：**
- 国内主流社交工具
- 集成支付功能
- 小程序生态丰富

## 功能对比

**Telegram：**
- 大文件传输（2GB）
- 超大群组（20万人）
- 机器人和API支持
- 跨平台同步

**微信：**
- 朋友圈社交
- 微信支付
- 公众号和小程序
- 本地化服务`,
      metaTitle: 'Telegram vs 微信对比 - 选择最适合你的通讯工具',
      metaDescription:
        '详细对比Telegram和微信的功能、隐私、安全性等方面，帮助你选择最适合的即时通讯应用。',
      metaKeywords: ['telegram', '微信', 'telegram对比', 'tg vs wechat'],
      status: 'PUBLISHED',
      websiteId: website2.id,
      authorId: admin.id,
    },
  })
  console.log('✅ Created/Updated website2 post:', postW2_3.title)

  // 添加从 HTML 提取的更多 website2 博文
  const postW2_4 = await prisma.post.upsert({
    where: {
      websiteId_slug: {
        websiteId: website2.id,
        slug: 'telegram-mute-notifications',
      },
    },
    update: {},
    create: {
      title: '电报（Telegram）怎么设置免打扰？',
      slug: 'telegram-mute-notifications',
      content: `在Telegram中设置免打扰，打开目标聊天或群组，点击右上角联系人/群组名称，进入设置页面。

## 设置免打扰的步骤

1. 打开目标聊天
2. 点击右上角的联系人/群组名称
3. 找到"通知"选项
4. 选择静音时长（1小时、8小时、2天或永久）

## 自定义通知设置

您还可以：
- 为特定联系人或群组设置自定义通知音
- 关闭消息预览
- 设置智能通知（仅在被@时通知）

免打扰功能帮助您在需要专注时避免被打扰，同时不会错过重要消息。`,
      metaTitle: '电报（Telegram）怎么设置免打扰 - 完整教程',
      metaDescription:
        '在Telegram中设置免打扰，打开目标聊天或群组，点击右上角联系人/群组名称，进入通知设置选择静音时长。',
      metaKeywords: ['telegram免打扰', 'telegram静音', 'telegram通知设置', 'tg免打扰'],
      status: 'PUBLISHED',
      websiteId: website2.id,
      authorId: admin.id,
    },
  })
  console.log('✅ Created/Updated website2 post:', postW2_4.title)

  const postW2_5 = await prisma.post.upsert({
    where: {
      websiteId_slug: {
        websiteId: website2.id,
        slug: 'telegram-pip-mode',
      },
    },
    update: {},
    create: {
      title: 'Telegram移动端如何开启画中画模式？',
      slug: 'telegram-pip-mode',
      content: `在Telegram移动端，您可以通过播放视频→点击画中画图标或在系统设置中为Telegram启用画中画权限来使用这个功能。

## Android 设备开启画中画

1. 播放视频时，点击画中画图标
2. 或在系统设置中为 Telegram 启用画中画权限
3. 视频将以小窗口形式显示在屏幕上

## iOS 设备开启画中画

1. 播放视频
2. 按下Home键或上滑
3. 视频会自动缩小到画中画模式

画中画模式让您可以在使用其他应用时继续观看视频，提高多任务处理效率。`,
      metaTitle: 'Telegram画中画模式设置 - 移动端教程',
      metaDescription:
        'Telegram移动端画中画模式开启方法：播放视频→点击画中画图标或在系统设置中启用权限。',
      metaKeywords: ['telegram画中画', 'telegram pip', 'telegram视频', 'tg画中画模式'],
      status: 'PUBLISHED',
      websiteId: website2.id,
      authorId: admin.id,
    },
  })
  console.log('✅ Created/Updated website2 post:', postW2_5.title)

  const postW2_6 = await prisma.post.upsert({
    where: {
      websiteId_slug: {
        websiteId: website2.id,
        slug: 'telegram-favorites',
      },
    },
    update: {},
    create: {
      title: '电报（Telegram）如何使用收藏夹？',
      slug: 'telegram-favorites',
      content: `在Telegram中使用收藏夹功能：长按任意消息，选择"添加到收藏夹"，即可保存重要信息供日后查看。

## 使用收藏夹的方法

1. **保存消息**：长按任意消息
2. **选择收藏**：点击"添加到收藏夹"
3. **查看收藏**：在主界面左上角菜单找到"收藏夹"

## 收藏夹的优势

- 快速保存重要信息
- 跨设备同步
- 支持各种类型的消息（文本、图片、文件）
- 方便整理和搜索

收藏夹是Telegram中最实用的功能之一，帮助您更好地管理重要信息。`,
      metaTitle: '电报（Telegram）收藏夹使用指南',
      metaDescription:
        '在Telegram中使用收藏夹功能：长按任意消息，选择"添加到收藏夹"，即可保存重要信息供日后查看。',
      metaKeywords: ['telegram收藏夹', 'telegram保存消息', 'tg收藏', 'telegram书签'],
      status: 'PUBLISHED',
      websiteId: website2.id,
      authorId: admin.id,
    },
  })
  console.log('✅ Created/Updated website2 post:', postW2_6.title)

  const postW2_7 = await prisma.post.upsert({
    where: {
      websiteId_slug: {
        websiteId: website2.id,
        slug: 'telegram-themes',
      },
    },
    update: {},
    create: {
      title: '电报（Telegram）怎么使用主题？',
      slug: 'telegram-themes',
      content: `在Telegram中，您可通过设置→外观（Settings→Chat Settings→Appearance）来选择和自定义主题，让您的Telegram界面更加个性化。

## 更换主题的步骤

1. 打开设置（Settings）
2. 选择"外观"（Chat Settings → Appearance）
3. 从预设主题中选择
4. 或创建自定义主题

## 主题类型

- **内置主题**：Telegram提供多种预设主题
- **第三方主题**：从主题商店下载
- **自定义主题**：完全自定义颜色和样式

## 高级功能

- 日夜模式自动切换
- 为不同聊天设置不同主题
- 分享您的主题给其他人

主题功能让Telegram的使用体验更加舒适和个性化。`,
      metaTitle: '电报（Telegram）主题设置完整教程',
      metaDescription:
        'Telegram主题设置方法：进入设置→外观，可选择预设主题或创建自定义主题，让界面更个性化。',
      metaKeywords: ['telegram主题', 'telegram外观', 'tg主题', 'telegram个性化'],
      status: 'PUBLISHED',
      websiteId: website2.id,
      authorId: admin.id,
    },
  })
  console.log('✅ Created/Updated website2 post:', postW2_7.title)

  const postW2_8 = await prisma.post.upsert({
    where: {
      websiteId_slug: {
        websiteId: website2.id,
        slug: 'telegram-login-without-phone',
      },
    },
    update: {},
    create: {
      title: 'Telegram手机号不用了如何登陆？',
      slug: 'telegram-login-without-phone',
      content: `当您的原手机号已停用时，可通过输入两步验证密码或向邮箱接收的验证码来跳过短信验证步骤，从而成功登录账号。

## 解决方案

### 方法一：使用两步验证密码

如果您之前设置了两步验证：
1. 尝试登录
2. 跳过短信验证
3. 输入两步验证密码即可登录

### 方法二：通过邮箱验证

1. 选择"通过邮箱恢复"
2. 查收邮箱中的验证码
3. 输入验证码完成登录

### 方法三：联系客服

如果上述方法都不可行：
1. 通过官方渠道联系Telegram客服
2. 提供账号相关信息
3. 等待人工审核恢复

## 预防措施

- 设置两步验证密码
- 绑定邮箱
- 定期更新联系方式

提前设置安全选项可以避免因手机号失效而无法登录的问题。`,
      metaTitle: 'Telegram手机号停用后如何登录 - 完整解决方案',
      metaDescription:
        '原手机号停用后登录Telegram的方法：使用两步验证密码或通过邮箱验证码跳过短信验证步骤成功登录。',
      metaKeywords: ['telegram手机号', 'telegram登录', 'tg手机号停用', 'telegram恢复账号'],
      status: 'PUBLISHED',
      websiteId: website2.id,
      authorId: admin.id,
    },
  })
  console.log('✅ Created/Updated website2 post:', postW2_8.title)

  const postW2_9 = await prisma.post.upsert({
    where: {
      websiteId_slug: {
        websiteId: website2.id,
        slug: 'what-is-telegram-chinese',
      },
    },
    update: {},
    create: {
      title: '什么是电报（Telegram）中文版？',
      slug: 'what-is-telegram-chinese',
      content: `Telegram中文版是指支持中文界面和功能的Telegram应用版本，允许用户使用中文进行操作和沟通。

## Telegram 简介

Telegram是一款全球领先的即时通讯应用，以其强大的功能、极致的安全性和卓越的用户体验而闻名。

### 核心特点

**1. 安全加密**
- 采用MTProto加密协议
- 支持端到端加密的秘密聊天
- 消息可设置自毁功能

**2. 云端同步**
- 消息存储在云端
- 支持多设备同时登录
- 跨平台无缝切换

**3. 功能强大**
- 支持最大2GB的文件传输
- 群组成员可达20万人
- 频道支持无限订阅者

## 中文版优势

- 完整的中文界面
- 中文输入法优化
- 本地化的使用习惯
- 中文客服支持

Telegram中文版保留了所有原版功能，同时提供更适合中文用户的体验。`,
      metaTitle: '什么是Telegram中文版 - 完整介绍',
      metaDescription:
        'Telegram中文版是支持中文界面的Telegram应用，提供端到端加密、云同步、大文件传输等强大功能。',
      metaKeywords: ['telegram中文版', 'telegram是什么', 'tg中文', '电报中文'],
      status: 'PUBLISHED',
      websiteId: website2.id,
      authorId: admin.id,
    },
  })
  console.log('✅ Created/Updated website2 post:', postW2_9.title)

  // Create posts for TG website
  const postTG1 = await prisma.post.upsert({
    where: {
      websiteId_slug: {
        websiteId: websiteTG.id,
        slug: 'what-is-telegram',
      },
    },
    update: {},
    create: {
      title: '什么是 Telegram（电报）中文版？',
      slug: 'what-is-telegram',
      content: `Telegram中文版是指支持中文界面和功能的Telegram应用版本，允许用户使用中文进行操作和沟通。

## Telegram简介

Telegram是一款全球领先的即时通讯应用，以其强大的功能、极致的安全性和卓越的用户体验而闻名。

### 核心特点

**1. 安全加密**
- 采用MTProto加密协议
- 支持端到端加密的秘密聊天
- 消息可设置自毁功能

**2. 云端同步**
- 消息存储在云端
- 支持多设备同时登录
- 跨平台无缝切换

**3. 功能强大**
- 支持最大2GB的文件传输
- 群组成员可达20万人
- 频道支持无限订阅者`,
      metaTitle: '什么是 Telegram 中文版 - TG 中文纸飞机官网',
      metaDescription:
        'Telegram中文版完整介绍，了解TG的核心功能、安全特性和使用优势。',
      metaKeywords: ['telegram', 'telegram中文', 'tg', '什么是telegram'],
      status: 'PUBLISHED',
      websiteId: websiteTG.id,
      authorId: admin.id,
    },
  })
  console.log('✅ Created/Updated TG post:', postTG1.title)

  const postTG2 = await prisma.post.upsert({
    where: {
      websiteId_slug: {
        websiteId: websiteTG.id,
        slug: 'telegram-download-guide',
      },
    },
    update: {},
    create: {
      title: 'Telegram 下载安装完整指南',
      slug: 'telegram-download-guide',
      content: `本指南将帮助您在各种设备上下载和安装 Telegram。

## Windows 电脑版下载

1. 访问官方网站
2. 点击"下载 Windows 版"
3. 运行安装程序
4. 完成安装向导

## Android 手机下载

1. 打开 Google Play 商店
2. 搜索"Telegram"
3. 点击安装
4. 等待下载完成

## iOS iPhone/iPad 下载

1. 打开 App Store
2. 搜索"Telegram"
3. 点击获取
4. 输入 Apple ID 密码确认`,
      metaTitle: 'Telegram 下载 - TG 中文版全平台下载指南',
      metaDescription:
        'Telegram 官方下载指南，支持 Windows、Mac、iOS、Android 全平台。',
      metaKeywords: ['telegram下载', 'tg下载', 'telegram安装', '纸飞机下载'],
      status: 'PUBLISHED',
      websiteId: websiteTG.id,
      authorId: admin.id,
    },
  })
  console.log('✅ Created/Updated TG post:', postTG2.title)

  const postTG3 = await prisma.post.upsert({
    where: {
      websiteId_slug: {
        websiteId: websiteTG.id,
        slug: 'telegram-features',
      },
    },
    update: {},
    create: {
      title: 'Telegram 核心功能详解',
      slug: 'telegram-features',
      content: `深入了解 Telegram 的强大功能。

## 1. 秘密聊天
端到端加密，确保绝对隐私

## 2. 群组功能
支持多达 20 万成员的超大群组

## 3. 频道广播
创建无限订阅者的公开频道

## 4. 文件传输
支持任何格式，最大 2GB

## 5. 机器人
强大的自动化工具生态

## 6. 贴纸和GIF
丰富的表情包和动图`,
      metaTitle: 'Telegram 功能 - TG 强大功能完整介绍',
      metaDescription:
        'Telegram 核心功能详解：秘密聊天、群组、频道、文件传输、机器人等。',
      metaKeywords: ['telegram功能', 'tg功能', 'telegram特点', '电报功能'],
      status: 'PUBLISHED',
      websiteId: websiteTG.id,
      authorId: admin.id,
      syncedWebsites: [websiteTG.id],
    },
  })
  console.log('✅ Created/Updated TG post:', postTG3.title)

  // Create keywords for tracking
  const keyword1 = await prisma.keyword.upsert({
    where: {
      websiteId_keyword: {
        websiteId: website1.id,
        keyword: 'seo management platform',
      },
    },
    update: {},
    create: {
      keyword: 'seo management platform',
      volume: 1200,
      difficulty: 65,
      cpc: 2.5,
      websiteId: website1.id,
    },
  })
  console.log('✅ Created/Updated keyword:', keyword1.keyword)

  const keyword2 = await prisma.keyword.upsert({
    where: {
      websiteId_keyword: {
        websiteId: website1.id,
        keyword: 'content syndication',
      },
    },
    update: {},
    create: {
      keyword: 'content syndication',
      volume: 800,
      difficulty: 45,
      cpc: 1.8,
      websiteId: website1.id,
    },
  })
  console.log('✅ Created/Updated keyword:', keyword2.keyword)

  // Website2 (Telegram) keywords
  const keywordW2_1 = await prisma.keyword.upsert({
    where: {
      websiteId_keyword: {
        websiteId: website2.id,
        keyword: 'telegram中文',
      },
    },
    update: {},
    create: {
      keyword: 'telegram中文',
      volume: 5000,
      difficulty: 58,
      cpc: 0.8,
      websiteId: website2.id,
    },
  })
  console.log('✅ Created/Updated website2 keyword:', keywordW2_1.keyword)

  const keywordW2_2 = await prisma.keyword.upsert({
    where: {
      websiteId_keyword: {
        websiteId: website2.id,
        keyword: 'telegram下载',
      },
    },
    update: {},
    create: {
      keyword: 'telegram下载',
      volume: 8000,
      difficulty: 62,
      cpc: 1.2,
      websiteId: website2.id,
    },
  })
  console.log('✅ Created/Updated website2 keyword:', keywordW2_2.keyword)

  const keywordW2_3 = await prisma.keyword.upsert({
    where: {
      websiteId_keyword: {
        websiteId: website2.id,
        keyword: 'tg中文版',
      },
    },
    update: {},
    create: {
      keyword: 'tg中文版',
      volume: 3500,
      difficulty: 52,
      cpc: 0.9,
      websiteId: website2.id,
    },
  })
  console.log('✅ Created/Updated website2 keyword:', keywordW2_3.keyword)

  // TG website keywords
  const keywordTG1 = await prisma.keyword.upsert({
    where: {
      websiteId_keyword: {
        websiteId: websiteTG.id,
        keyword: 'telegram中文',
      },
    },
    update: {},
    create: {
      keyword: 'telegram中文',
      volume: 5000,
      difficulty: 58,
      cpc: 0.8,
      websiteId: websiteTG.id,
    },
  })
  console.log('✅ Created/Updated TG keyword:', keywordTG1.keyword)

  const keywordTG2 = await prisma.keyword.upsert({
    where: {
      websiteId_keyword: {
        websiteId: websiteTG.id,
        keyword: 'telegram下载',
      },
    },
    update: {},
    create: {
      keyword: 'telegram下载',
      volume: 8000,
      difficulty: 62,
      cpc: 1.2,
      websiteId: websiteTG.id,
    },
  })
  console.log('✅ Created/Updated TG keyword:', keywordTG2.keyword)

  // Create sitemap entries
  const existingSitemap1 = await prisma.sitemap.findFirst({
    where: { websiteId: website1.id },
  })
  if (!existingSitemap1) {
    await prisma.sitemap.create({
      data: {
        url: 'http://localhost:3001/sitemap.xml',
        websiteId: website1.id,
        type: 'POSTS',
        urls: 0,
        submitted: false,
      },
    })
    console.log('✅ Created sitemap for:', website1.name)
  }

  const existingSitemap2 = await prisma.sitemap.findFirst({
    where: { websiteId: website2.id },
  })
  if (!existingSitemap2) {
    await prisma.sitemap.create({
      data: {
        url: 'http://localhost:3002/sitemap.xml',
        websiteId: website2.id,
        type: 'POSTS',
        urls: 0,
        submitted: false,
      },
    })
    console.log('✅ Created sitemap for:', website2.name)
  }

  const existingSitemapTG = await prisma.sitemap.findFirst({
    where: { websiteId: websiteTG.id },
  })
  if (!existingSitemapTG) {
    await prisma.sitemap.create({
      data: {
        url: 'http://localhost:3003/sitemap.xml',
        websiteId: websiteTG.id,
        type: 'POSTS',
        urls: 0,
        submitted: false,
      },
    })
    console.log('✅ Created sitemap for:', websiteTG.name)
  }

  // Create some spider logs for demo
  const spiderBots = ['googlebot', 'bingbot', 'baiduspider', 'yandexbot']
  const websites = [website1.id, website2.id, websiteTG.id]
  for (let i = 0; i < 15; i++) {
    const bot = spiderBots[Math.floor(Math.random() * spiderBots.length)]
    const websiteId = websites[Math.floor(Math.random() * websites.length)]
    await prisma.spiderLog.create({
      data: {
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: `Mozilla/5.0 (compatible; ${bot}/2.1)`,
        url: '/',
        bot,
        statusCode: 200,
        websiteId,
        createdAt: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
      },
    })
  }
  console.log('✅ Created demo spider logs')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📝 Login credentials:')
  console.log('   Email: admin@example.com')
  console.log('   Password: admin123')
  console.log('\n🌐 Demo websites:')
  console.log('   - http://localhost:3001 (Demo Website 1)')
  console.log('   - http://localhost:3002 (Demo Website 2)')
  console.log('\n🔧 Admin panel:')
  console.log('   - http://localhost:3100')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
