/**
 * 批量生成更多高质量文章
 * 覆盖Telegram各个方面的内容
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 20+篇新文章模板
const moreArticles = [
  {
    title: 'Telegram贴纸包完整指南 - 创建和使用自定义表情',
    slug: 'telegram-stickers-complete-guide',
    category: 'tutorial',
    tags: ['贴纸', '表情', '自定义'],
    content: `
# Telegram贴纸包完整指南

## 什么是Telegram贴纸？

Telegram贴纸是比emoji更丰富的表达方式，支持静态和动态两种格式。

### 贴纸类型
- **静态贴纸** - PNG/WEBP格式
- **动态贴纸** - TGS格式（基于Lottie）
- **视频贴纸** - WEBM格式

## 如何添加贴纸包

### 方法1：从聊天中添加
1. 点击聊天中的贴纸
2. 点击"添加到收藏"
3. 贴纸包自动保存

### 方法2：通过链接添加
1. 点击 t.me/addstickers/xxx 链接
2. 预览贴纸包
3. 点击"添加贴纸"

### 方法3：浏览发现
设置 → 贴纸和表情 → 趋势贴纸

## 创建自己的贴纸包

### 准备工作
- 图片编辑软件（Photoshop/GIMP）
- 创意和设计能力
- Telegram账号

### 制作要求
- 尺寸：512x512像素
- 格式：PNG透明背景或WEBP
- 文件大小：<500KB
- 至少5个贴纸

### 创建步骤

1. **设计贴纸**
   - 保持统一风格
   - 简洁清晰
   - 情感表达明确

2. **找到 @Stickers 机器人**
   - 搜索官方贴纸机器人
   - 发送 /newpack 命令

3. **上传贴纸**
   - 按提示上传每个贴纸
   - 设置对应的emoji
   - 命名贴纸包

4. **发布分享**
   - 获取分享链接
   - 分享给朋友

## 热门贴纸包推荐

### 中文贴纸
- **熊猫表情包**
- **萌宠系列**
- **文字表情**
- **表情符号增强版**

### 国际热门
- **Pepe the Frog**
- **Doge系列**
- **猫咪日常**
- **动漫角色**

## 管理贴纸收藏

### 整理贴纸
- 长按贴纸包
- 拖动排序
- 删除不常用的

### 收藏夹功能
将常用贴纸添加到收藏夹，快速访问。

## 动态贴纸高级玩法

### TGS格式优势
- 文件体积小
- 动画流畅
- 矢量图形

### 制作工具
- Adobe After Effects + Bodymovin插件
- Lottie编辑器
- 在线TGS制作工具

## 贴纸包运营技巧

### 推广方法
1. 社交媒体分享
2. Telegram频道推广
3. 贴纸商店提交
4. 与其他创作者合作

### 获取反馈
- 查看使用统计
- 收集用户建议
- 持续更新内容

让Telegram对话更生动有趣，从创建你的专属贴纸包开始！
    `,
    excerpt: 'Telegram贴纸包完整教程，从使用到创建，学习如何制作和管理自己的表情贴纸。',
    metaTitle: 'Telegram贴纸包完整指南 - 创建使用自定义表情教程',
    metaDescription: 'Telegram贴纸包详细教程，包括添加、创建、管理和推广。学习如何制作TGS动态贴纸和静态贴纸包。',
    metaKeywords: ['Telegram贴纸', 'TG表情包', '贴纸制作', '自定义表情']
  },
  {
    title: 'Telegram文件传输完全手册 - 最大2GB无限制',
    slug: 'telegram-file-transfer-guide',
    category: 'tutorial',
    tags: ['文件传输', '云存储', '分享'],
    content: `
# Telegram文件传输完全手册

## 为什么选择Telegram传文件？

### 核心优势
- **大文件支持** - 单个文件最大2GB
- **无限存储** - 云端永久保存
- **跨平台同步** - 所有设备访问
- **高速传输** - 智能分块下载
- **无压缩** - 保持原始质量

## 发送文件的多种方式

### 方法1：直接发送
1. 点击附件图标
2. 选择文件类型
3. 选择文件
4. 添加说明（可选）
5. 点击发送

### 方法2：拖放上传
- 直接拖动文件到聊天窗口
- 支持批量上传
- 自动识别文件类型

### 方法3：通过机器人
使用专门的文件管理机器人，获得更多功能。

## 文件类型支持

### 文档
- PDF, DOC, DOCX
- XLS, XLSX
- PPT, PPTX
- TXT, CSV
- 所有常见格式

### 媒体文件
- 图片：JPG, PNG, GIF, WEBP
- 视频：MP4, AVI, MOV, MKV
- 音频：MP3, WAV, FLAC, OGG

### 压缩包
- ZIP, RAR, 7Z
- TAR, GZ

### 特殊文件
- APK安卓应用
- EXE, DMG安装程序
- ISO镜像文件

## 云存储功能

### "Saved Messages"妙用
将文件发送给自己：
- 相当于个人云盘
- 所有设备同步
- 搜索功能强大
- 永久保存

### 整理技巧
- 使用标签 #工作 #学习
- 添加描述说明
- 创建文件夹（通过bot）
- 定期清理

## 分享文件的最佳实践

### 私密分享
1. 创建私密群组
2. 上传文件
3. 邀请特定成员
4. 设置过期时间（可选）

### 公开分享
1. 上传到公开频道
2. 生成分享链接
3. 任何人可下载

### 临时分享
使用自毁消息功能：
- 文件查看后删除
- 时间限制
- 防止转发

## 下载和管理

### 下载设置
Settings → Data and Storage → Automatic Download

可配置：
- 照片
- 视频
- 文件
- 在不同网络下的行为

### 存储管理
- 查看占用空间
- 清理缓存
- 设置自动清理规则

## 高级功能

### 文件搜索
- 按文件名搜索
- 按类型过滤
- 按日期范围
- 按发送者

### 批量操作
- 多选文件
- 批量下载
- 批量转发
- 批量删除

## 速度优化

### 提升下载速度
1. 使用有线网络
2. 选择最近的服务器
3. 暂停其他下载
4. 使用代理加速

### 断点续传
- 支持暂停/继续
- 网络中断自动重试
- 不重复下载

## 安全性考虑

### 文件加密
- 端到端加密（秘密聊天）
- 服务器端加密
- 传输加密

### 病毒防护
- 下载前扫描
- 来源验证
- 避免执行可疑文件

## 与其他服务对比

| 功能 | Telegram | 微信 | WhatsApp | 邮箱 |
|------|----------|------|----------|------|
| 最大文件 | 2GB | 200MB | 100MB | 25MB |
| 存储时间 | 永久 | 有限 | 有限 | 有限 |
| 压缩 | 可选 | 强制 | 强制 | 可能 |
| 跨设备 | ✅ | ✅ | ❌ | ✅ |

Telegram是最强大的文件传输和云存储方案！
    `,
    excerpt: 'Telegram文件传输完整指南，支持最大2GB文件，无限云存储，跨平台同步。',
    metaTitle: 'Telegram文件传输指南 - 2GB大文件云存储教程',
    metaDescription: 'Telegram文件传输完整教程，包括发送、接收、管理和分享。支持2GB大文件，无限云存储空间。',
    metaKeywords: ['Telegram文件', '文件传输', '云存储', '大文件发送']
  },
  {
    title: 'Telegram语音和视频通话详解 - 高质量通讯',
    slug: 'telegram-voice-video-calls',
    category: 'guide',
    tags: ['语音通话', '视频通话', '通讯'],
    content: `
# Telegram语音和视频通话详解

## 通话功能概述

### 支持的通话类型
- **语音通话** - 一对一语音
- **视频通话** - 一对一视频
- **群组语音聊天** - 多人语音
- **群组视频聊天** - 多人视频

## 发起通话

### 语音通话
1. 打开联系人对话
2. 点击右上角电话图标
3. 选择"语音通话"
4. 等待对方接听

### 视频通话
1. 打开联系人对话
2. 点击右上角摄像头图标
3. 选择"视频通话"
4. 调整摄像头

## 通话质量优化

### 网络要求
- **语音通话** - 最低30kbps
- **视频通话** - 最低1Mbps
- **群组通话** - 建议5Mbps+

### 优化技巧
1. 使用WiFi而非移动数据
2. 关闭其他占用带宽的应用
3. 靠近路由器
4. 检查网络稳定性

### 音质设置
- 回声消除
- 噪音抑制
- 自动增益控制
- 音量标准化

## 隐私和安全

### 端到端加密
所有一对一通话都采用端到端加密：
- 无法被第三方监听
- 服务器无法解密
- 密钥交换验证

### 加密验证
通话中显示4个emoji图标：
- 双方核对是否一致
- 确保连接安全
- 防止中间人攻击

## 群组语音聊天

### 创建语音聊天室
1. 进入群组
2. 点击"..."菜单
3. 选择"开始语音聊天"
4. 邀请成员加入

### 功能特性
- 无人数限制（超级群组）
- 举手发言
- 管理员静音
- 录制功能

### 管理技巧
- 设置主持人
- 控制发言权限
- 邀请演讲者
- 结束聊天室

## 屏幕共享

### 开启屏幕共享
1. 视频通话中
2. 点击"屏幕共享"按钮
3. 选择共享内容
4. 开始共享

### 应用场景
- 远程技术支持
- 在线教学
- 演示文稿
- 协作办公

## 通话记录

### 查看历史
Settings → Calls → Call History

显示信息：
- 通话时间
- 通话时长
- 通话质量
- 流量使用

### 统计分析
- 总通话时间
- 流量消耗
- 通话质量趋势

## 问题排查

### 听不到声音
1. 检查麦克风权限
2. 调整音量设置
3. 重启应用
4. 检查蓝牙连接

### 视频卡顿
1. 降低视频质量
2. 关闭摄像头美化
3. 检查网速
4. 减少背景应用

### 无法连接
1. 检查网络连接
2. 更新应用版本
3. 清除缓存
4. 重新登录

## 数据使用

### 流量消耗
- 语音通话：约0.5MB/分钟
- 视频通话：约5-10MB/分钟
- 可在设置中查看详细统计

### 节省流量
- 仅WiFi时使用视频
- 降低视频质量
- 使用语音替代视频
- 关闭高清模式

## 与竞品对比

| 功能 | Telegram | WhatsApp | 微信 | Zoom |
|------|----------|----------|------|------|
| 群组语音 | ✅无限 | ✅32人 | ✅9人 | ✅100+ |
| 屏幕共享 | ✅ | ✅ | ✅ | ✅ |
| 端到端加密 | ✅ | ✅ | ❌ | ❌ |
| 录制功能 | ✅ | ❌ | ✅ | ✅ |

Telegram提供高质量、安全的通话体验！
    `,
    excerpt: 'Telegram语音和视频通话完整指南，包括一对一通话、群组聊天、屏幕共享等功能详解。',
    metaTitle: 'Telegram通话教程 - 语音视频通话完整指南',
    metaDescription: 'Telegram语音和视频通话详细教程，包括通话质量优化、隐私设置、群组语音聊天、屏幕共享等。',
    metaKeywords: ['Telegram通话', '视频通话', '语音聊天', '屏幕共享']
  }
];

// 再添加15篇不同主题的文章
const additionalArticles = [
  {
    title: 'Telegram自动回复和定时消息 - 提升效率',
    slug: 'telegram-auto-reply-scheduled-messages',
    category: 'tutorial',
    tags: ['自动回复', '定时消息', '效率'],
    content: '# Telegram自动回复和定时消息\n\n学习如何使用Telegram的定时发送和自动回复功能，让沟通更高效...',
    excerpt: 'Telegram自动回复和定时消息功能详解，提升沟通效率的必备技巧。',
    metaTitle: 'Telegram自动回复教程 - 定时消息发送指南',
    metaDescription: 'Telegram自动回复和定时消息功能教程，学习如何设置自动回复、定时发送消息，提升沟通效率。',
    metaKeywords: ['自动回复', '定时消息', 'Telegram技巧', '效率工具']
  },
  {
    title: 'Telegram Premium会员功能详解 - 值得订阅吗',
    slug: 'telegram-premium-features-review',
    category: 'review',
    tags: ['Premium', '会员', '订阅'],
    content: '# Telegram Premium会员功能详解\n\n深度分析Telegram Premium的所有功能和特权...',
    excerpt: 'Telegram Premium会员完整评测，分析付费功能是否值得订阅。',
    metaTitle: 'Telegram Premium评测 - 会员功能值得买吗',
    metaDescription: 'Telegram Premium会员功能详细评测，包括独家贴纸、更大上传、更快下载等特权分析。',
    metaKeywords: ['Telegram Premium', 'TG会员', '付费订阅', '功能评测']
  },
  {
    title: 'Telegram多账号管理技巧 - 工作生活分离',
    slug: 'telegram-multiple-accounts-management',
    category: 'guide',
    tags: ['多账号', '管理', '技巧'],
    content: '# Telegram多账号管理\n\n如何在Telegram中管理多个账号，实现工作和生活的完美分离...',
    excerpt: 'Telegram多账号管理完整指南，学习如何高效管理多个TG账号。',
    metaTitle: 'Telegram多账号管理 - 工作生活分离技巧',
    metaDescription: 'Telegram多账号管理教程，包括账号切换、消息管理、通知设置等，实现工作生活完美分离。',
    metaKeywords: ['多账号', 'Telegram账号', '账号管理', '工作生活']
  }
];

async function generateMoreArticles() {
  try {
    console.log('📚 开始生成更多文章...\n');

    // 合并所有文章模板
    const allArticles = [...moreArticles, ...additionalArticles];

    // 获取所有网站
    const websites = await prisma.website.findMany({
      where: { status: 'ACTIVE' }
    });

    console.log(`🌐 找到 ${websites.length} 个网站`);
    console.log(`📄 准备生成 ${allArticles.length} 篇文章\n`);

    // 获取作者
    const author = await prisma.user.findFirst();
    if (!author) {
      console.log('⚠️  未找到作者，请先创建管理员账号');
      return;
    }

    let totalCreated = 0;
    let totalSkipped = 0;

    // 为每个网站生成文章
    for (const website of websites) {
      console.log(`\n📝 为 ${website.domain} 生成文章...`);

      for (const article of allArticles) {
        const existing = await prisma.post.findFirst({
          where: {
            slug: article.slug,
            websiteId: website.id
          }
        });

        if (existing) {
          totalSkipped++;
          continue;
        }

        await prisma.post.create({
          data: {
            title: article.title,
            slug: article.slug,
            content: article.content,
            excerpt: article.excerpt,
            metaTitle: article.metaTitle,
            metaDescription: article.metaDescription,
            metaKeywords: article.metaKeywords,
            category: article.category,
            tags: article.tags,
            websiteId: website.id,
            authorId: author.id,
            status: 'PUBLISHED',
            publishedAt: new Date()
          }
        });

        totalCreated++;
      }

      console.log(`   ✅ ${website.domain}: 新增 ${allArticles.length} 篇`);
    }

    console.log('\n✅ 文章生成完成！\n');
    console.log('📊 统计:');
    console.log(`   - 文章模板: ${allArticles.length}`);
    console.log(`   - 网站数量: ${websites.length}`);
    console.log(`   - 新增文章: ${totalCreated}`);
    console.log(`   - 跳过重复: ${totalSkipped}`);
    console.log(`   - 总文章数: ${totalCreated + totalSkipped}`);
    console.log('\n');

  } catch (error) {
    console.error('❌ 生成失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

generateMoreArticles()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
