/**
 * 初始化蜘蛛池内容源
 * 从数据库文章中提取内容片段作为蜘蛛池的内容源
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initSpiderPoolSources() {
  try {
    console.log('🕷️ 开始初始化蜘蛛池内容源...\n');

    // 1. 获取所有已发布的文章
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        content: true,
        metaKeywords: true,
        website: {
          select: { name: true }
        }
      }
    });

    console.log(`📄 找到 ${posts.length} 篇已发布文章\n`);

    if (posts.length === 0) {
      console.log('⚠️  没有找到文章，请先运行:');
      console.log('   node setup-complete-system.js');
      console.log('   或');
      console.log('   node generate-articles.js');
      return;
    }

    // 2. 从文章中提取内容片段
    let totalParagraphs = 0;
    let totalHeadings = 0;
    let allKeywords = new Set();

    for (const post of posts) {
      const sourceName = `${post.website.name} - ${post.title}`;

      // 检查是否已存在
      const existing = await prisma.spiderPoolSource.findFirst({
        where: { name: sourceName }
      });

      if (existing) {
        console.log(`   ⏭️  跳过已存在: ${sourceName}`);
        continue;
      }

      // 提取段落（以换行分割）
      const paragraphs = post.content
        .split('\n')
        .filter(line => line.trim().length > 50) // 只保留长度>50的段落
        .filter(line => !line.trim().startsWith('#')) // 排除标题行
        .map(p => p.trim());

      // 提取标题（# 开头的行）
      const headings = post.content
        .split('\n')
        .filter(line => line.trim().startsWith('#'))
        .map(h => h.replace(/^#+\s*/, '').trim());

      // 收集关键词
      if (post.metaKeywords && post.metaKeywords.length > 0) {
        post.metaKeywords.forEach(kw => allKeywords.add(kw));
      }

      // 创建内容源
      await prisma.spiderPoolSource.create({
        data: {
          name: sourceName,
          description: `从文章《${post.title}》提取的内容`,
          content: paragraphs.join('\n\n'),
          keywords: Array.from(post.metaKeywords || []),
          paragraphs: paragraphs.length,
          headings: headings.length,
          totalWords: post.content.length,
          status: 'ACTIVE',
          isActive: true
        }
      });

      totalParagraphs += paragraphs.length;
      totalHeadings += headings.length;

      console.log(`   ✅ 创建: ${sourceName}`);
      console.log(`      - 段落: ${paragraphs.length}`);
      console.log(`      - 标题: ${headings.length}`);
      console.log(`      - 关键词: ${post.metaKeywords?.length || 0}`);
    }

    console.log('\n✅ 内容源初始化完成！\n');
    console.log('📊 统计信息:');
    console.log(`   - 内容源数量: ${posts.length}`);
    console.log(`   - 总段落数: ${totalParagraphs}`);
    console.log(`   - 总标题数: ${totalHeadings}`);
    console.log(`   - 独立关键词: ${allKeywords.size}`);
    console.log('\n');

    // 3. 显示蜘蛛池域名状态
    const spiderDomains = await prisma.domainAlias.findMany({
      where: {
        domain: {
          in: [
            'autopushnetwork.xyz',
            'contentpoolzone.site',
            'crawlboostnet.xyz',
            'crawlenginepro.xyz',
            'linkpushmatrix.site',
            'rankspiderchain.xyz',
            'seohubnetwork.xyz',
            'spidertrackzone.xyz',
            'trafficboostflow.site'
          ]
        }
      },
      select: {
        domain: true,
        siteName: true,
        status: true
      }
    });

    console.log(`🕸️ 蜘蛛池域名状态: ${spiderDomains.length}/9`);
    if (spiderDomains.length > 0) {
      spiderDomains.forEach(d => {
        console.log(`   ✅ ${d.domain} (${d.siteName}) - ${d.status}`);
      });
    }

    console.log('\n💡 下一步操作:');
    console.log('   1. 访问管理后台: https://adminseohub.xyz/spider-pool');
    console.log('   2. 点击"生成蜘蛛池页面"按钮');
    console.log('   3. 等待页面生成完成');
    console.log('\n');

  } catch (error) {
    console.error('❌ 初始化失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行初始化
initSpiderPoolSources()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
