/**
 * AI 智能文章生成器
 * 使用 Vercel AI Gateway + GPT-4 批量生成 SEO 优化文章
 *
 * 功能:
 * 1. 从数据库读取长尾关键词
 * 2. 使用 AI 生成高质量文章内容
 * 3. 自动优化 SEO meta 信息
 * 4. 生成内链建议
 * 5. 保存到数据库
 */

const { prisma } = require('@repo/database');
const { generateText } = require('ai');
const { createOpenAI } = require('@ai-sdk/openai');

// 配置 AI
const openai = createOpenAI({
  apiKey: process.env.VERCEL_AI_GATEWAY_KEY,
  baseURL: 'https://gateway.vercel.com/v1/openai',
});

const model = openai('gpt-4-turbo');

/**
 * 为关键词生成 SEO 优化文章
 */
async function generateArticleForKeyword(keyword, website) {
  console.log(`\n🤖 正在为关键词 "${keyword.keyword}" 生成文章...`);

  const prompt = `你是一位专业的 SEO 内容写作专家，专注于 Telegram 相关主题。

目标关键词: ${keyword.keyword}
网站名称: ${website.name}
网站定位: ${website.description || 'Telegram 中文资源平台'}

请创作一篇高质量的 SEO 优化文章，要求:

1. **标题** (50-60字符):
   - 必须包含目标关键词
   - 吸引点击，符合用户搜索意图
   - 示例: "【2024最新】telegram 纸飞机 下载完整教程"

2. **文章内容** (1500-2500字):
   - 结构清晰，使用 H2、H3 标题
   - 自然融入关键词，密度 2-3%
   - 包含实用信息和操作步骤
   - 使用 Markdown 格式
   - 包含列表、代码块等丰富元素
   - 适合中国用户阅读习惯

3. **SEO Meta 信息**:
   - Meta Description (150-160字符)
   - 5-7 个相关关键词
   - OG 标题和描述

4. **内链建议**:
   - 建议 3-5 个相关文章主题
   - 说明为什么需要内链到这些主题

请以 JSON 格式返回:
{
  "title": "文章标题",
  "slug": "url-friendly-slug",
  "excerpt": "文章摘要 (150字)",
  "content": "完整 Markdown 内容",
  "metaTitle": "SEO 标题",
  "metaDescription": "SEO 描述",
  "keywords": ["关键词1", "关键词2", ...],
  "internalLinks": [
    {"topic": "相关主题1", "reason": "链接原因"},
    {"topic": "相关主题2", "reason": "链接原因"}
  ],
  "tags": ["标签1", "标签2", ...]
}`;

  try {
    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.8,
      maxTokens: 4000,
    });

    // 解析 JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 未返回有效的 JSON');
    }

    const article = JSON.parse(jsonMatch[0]);

    console.log(`   ✅ 文章生成成功: ${article.title}`);
    console.log(`   📝 字数: ${article.content.length} 字符`);
    console.log(`   🔑 关键词: ${article.keywords.join(', ')}`);

    return article;
  } catch (error) {
    console.error(`   ❌ 生成失败:`, error.message);
    return null;
  }
}

/**
 * 将文章保存到数据库
 */
async function saveArticle(article, website, keyword) {
  try {
    const post = await prisma.post.create({
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        metaKeywords: article.keywords,
        tags: article.tags || [],
        status: 'DRAFT', // 先保存为草稿，人工审核后发布
        websiteId: website.id,
        authorName: 'AI Writer',
        viewCount: 0,
      },
    });

    // 更新关键词使用计数
    await prisma.keyword.update({
      where: { id: keyword.id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });

    console.log(`   💾 文章已保存到数据库 (ID: ${post.id})`);
    return post;
  } catch (error) {
    console.error(`   ❌ 保存失败:`, error.message);
    return null;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 AI 文章生成器启动...\n');

  // 检查 API Key
  if (!process.env.VERCEL_AI_GATEWAY_KEY) {
    console.error('❌ 错误: 请设置 VERCEL_AI_GATEWAY_KEY 环境变量');
    process.exit(1);
  }

  try {
    // 1. 获取所有主站
    const websites = await prisma.website.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    console.log(`📊 找到 ${websites.length} 个网站:\n`);
    websites.forEach(w => {
      console.log(`   - ${w.name}: ${w._count.posts} 篇文章`);
    });

    // 2. 获取未使用或使用次数少的长尾关键词
    const keywords = await prisma.keyword.findMany({
      where: {
        category: {
          in: ['download-combination', 'download-chinese', 'telegram-chinese',
               'features-combination', 'telegram-longtail']
        },
        usageCount: {
          lt: 2, // 使用次数少于 2 次
        },
      },
      orderBy: [
        { volume: 'desc' }, // 优先高搜索量
        { difficulty: 'asc' }, // 其次低难度
      ],
      take: 30, // 每次生成 30 篇
    });

    console.log(`\n🎯 找到 ${keywords.length} 个待优化关键词\n`);

    if (keywords.length === 0) {
      console.log('✅ 所有关键词都已使用！');
      return;
    }

    // 3. 为每个网站分配关键词并生成文章
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      const website = websites[i % websites.length]; // 轮流分配到各网站

      console.log(`\n[${i + 1}/${keywords.length}] 处理: ${keyword.keyword}`);
      console.log(`   目标网站: ${website.name}`);
      console.log(`   搜索量: ${keyword.volume}/月 | 难度: ${keyword.difficulty}`);

      // 生成文章
      const article = await generateArticleForKeyword(keyword, website);

      if (article) {
        // 保存文章
        const saved = await saveArticle(article, website, keyword);
        if (saved) {
          successCount++;
        } else {
          failCount++;
        }
      } else {
        failCount++;
      }

      // 避免 API 限流，每篇文章间隔 3 秒
      if (i < keywords.length - 1) {
        console.log('   ⏳ 等待 3 秒...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    console.log(`\n\n✅ 文章生成完成！`);
    console.log(`   成功: ${successCount} 篇`);
    console.log(`   失败: ${failCount} 篇`);
    console.log(`\n📝 文章已保存为草稿状态，请在后台审核后发布\n`);

  } catch (error) {
    console.error('\n❌ 发生错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行
main();
