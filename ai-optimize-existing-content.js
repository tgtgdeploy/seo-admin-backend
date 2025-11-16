/**
 * AI 内容优化器
 * 优化现有文章的 SEO 表现
 */

const { prisma } = require('@repo/database');
const { generateText } = require('ai');
const { createOpenAI } = require('@ai-sdk/openai');

const openai = createOpenAI({
  apiKey: process.env.VERCEL_AI_GATEWAY_KEY,
  baseURL: 'https://gateway.vercel.com/v1/openai',
});

const model = openai('gpt-4-turbo');

/**
 * AI 分析并优化文章
 */
async function optimizeArticle(post) {
  console.log(`\n🔍 分析文章: ${post.title}`);

  const prompt = `你是 SEO 专家。请分析以下文章并提供优化建议:

**当前标题**: ${post.title}
**当前 Meta Description**: ${post.metaDescription || '无'}
**当前关键词**: ${post.metaKeywords?.join(', ') || '无'}
**内容片段** (前 500 字):
${post.content.substring(0, 500)}...

**文章总字数**: ${post.content.length} 字符

请提供:
1. 优化后的 SEO 标题（更吸引点击）
2. 优化后的 Meta Description（150-160字符）
3. 提取/补充 5-7 个核心关键词
4. 内容优化建议（3-5 条具体建议）
5. 内链建议（建议链接到哪些相关主题）
6. 缺失的元素（如:图片、列表、FAQ等）

返回 JSON:
{
  "optimizedTitle": "优化标题",
  "optimizedMetaDescription": "优化描述",
  "optimizedKeywords": ["关键词1", "关键词2", ...],
  "contentSuggestions": ["建议1", "建议2", ...],
  "internalLinks": ["主题1", "主题2", ...],
  "missingElements": ["缺失元素1", "缺失元素2", ...]
}`;

  try {
    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 未返回有效的 JSON');
    }

    const optimization = JSON.parse(jsonMatch[0]);

    // 应用优化
    await prisma.post.update({
      where: { id: post.id },
      data: {
        metaTitle: optimization.optimizedTitle,
        metaDescription: optimization.optimizedMetaDescription,
        metaKeywords: optimization.optimizedKeywords,
      },
    });

    console.log(`   ✅ 优化完成`);
    console.log(`   📊 建议:\n`);
    optimization.contentSuggestions.forEach((s, i) => {
      console.log(`      ${i + 1}. ${s}`);
    });

    return optimization;
  } catch (error) {
    console.error(`   ❌ 优化失败:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 AI 内容优化器启动...\n');

  // 获取所有已发布但 Meta 信息不完整的文章
  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { metaTitle: null },
        { metaDescription: null },
        { metaKeywords: { isEmpty: true } },
      ],
    },
    take: 20, // 每次优化 20 篇
  });

  console.log(`📊 找到 ${posts.length} 篇需要优化的文章\n`);

  let successCount = 0;

  for (let i = 0; i < posts.length; i++) {
    console.log(`\n[${i + 1}/${posts.length}]`);
    const result = await optimizeArticle(posts[i]);

    if (result) {
      successCount++;
    }

    // 避免 API 限流
    if (i < posts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n\n✅ 优化完成！`);
  console.log(`   成功: ${successCount}/${posts.length} 篇\n`);

  await prisma.$disconnect();
}

main();
