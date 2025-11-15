/**
 * 批量同步所有文章到所有网站
 * Sync all posts to all websites
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncAllPosts() {
  try {
    console.log('🔄 开始批量同步文章...\n');

    // 获取所有活跃网站
    const websites = await prisma.website.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, domain: true }
    });

    console.log(`🌐 找到 ${websites.length} 个网站:\n`);
    websites.forEach((site, i) => {
      console.log(`   ${i + 1}. ${site.name} (${site.domain})`);
    });

    // 获取作者
    const author = await prisma.user.findFirst();
    if (!author) {
      console.log('\n⚠️  未找到作者');
      return;
    }

    console.log(`\n👤 使用作者: ${author.name || author.email}\n`);

    // 获取所有已发布的文章（去重，按slug分组）
    const allPosts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        website: true
      }
    });

    // 按slug去重，保留最新的
    const uniquePosts = new Map();
    allPosts.forEach(post => {
      if (!uniquePosts.has(post.slug) ||
          post.updatedAt > uniquePosts.get(post.slug).updatedAt) {
        uniquePosts.set(post.slug, post);
      }
    });

    console.log(`📄 找到 ${uniquePosts.size} 篇独立文章\n`);

    let stats = {
      total: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };

    // 为每个网站同步所有文章
    for (const website of websites) {
      console.log(`\n📝 同步到 ${website.domain}...`);
      let siteCreated = 0;
      let siteUpdated = 0;
      let siteSkipped = 0;

      for (const [slug, sourcePost] of uniquePosts) {
        stats.total++;

        try {
          // 检查文章是否已存在
          const existingPost = await prisma.post.findFirst({
            where: {
              slug: slug,
              websiteId: website.id
            }
          });

          if (existingPost) {
            // 如果是同一篇文章，跳过
            if (existingPost.id === sourcePost.id) {
              siteSkipped++;
              stats.skipped++;
              continue;
            }

            // 更新现有文章
            await prisma.post.update({
              where: { id: existingPost.id },
              data: {
                title: sourcePost.title,
                content: sourcePost.content,
                excerpt: sourcePost.excerpt,
                coverImage: sourcePost.coverImage,
                metaTitle: sourcePost.metaTitle,
                metaDescription: sourcePost.metaDescription,
                metaKeywords: sourcePost.metaKeywords,
                category: sourcePost.category,
                tags: sourcePost.tags,
                status: sourcePost.status,
                publishedAt: sourcePost.publishedAt,
                updatedAt: new Date()
              }
            });
            siteUpdated++;
            stats.updated++;
          } else {
            // 创建新文章
            await prisma.post.create({
              data: {
                title: sourcePost.title,
                slug: sourcePost.slug,
                content: sourcePost.content,
                excerpt: sourcePost.excerpt,
                coverImage: sourcePost.coverImage,
                metaTitle: sourcePost.metaTitle,
                metaDescription: sourcePost.metaDescription,
                metaKeywords: sourcePost.metaKeywords,
                category: sourcePost.category,
                tags: sourcePost.tags,
                websiteId: website.id,
                authorId: author.id,
                status: sourcePost.status,
                publishedAt: sourcePost.publishedAt || new Date()
              }
            });
            siteCreated++;
            stats.created++;
          }
        } catch (error) {
          console.error(`   ❌ 错误 [${slug}]:`, error.message);
          stats.errors++;
        }
      }

      console.log(`   ✅ 创建: ${siteCreated}, 更新: ${siteUpdated}, 跳过: ${siteSkipped}`);
    }

    // 更新sitemap
    console.log('\n🗺️  更新网站地图...');
    for (const website of websites) {
      const postCount = await prisma.post.count({
        where: {
          websiteId: website.id,
          status: 'PUBLISHED'
        }
      });

      const urlCount = 1 + postCount;

      const existingSitemap = await prisma.sitemap.findFirst({
        where: {
          websiteId: website.id,
          type: 'POSTS'
        }
      });

      if (existingSitemap) {
        await prisma.sitemap.update({
          where: { id: existingSitemap.id },
          data: {
            urls: urlCount,
            lastModified: new Date()
          }
        });
      } else {
        await prisma.sitemap.create({
          data: {
            websiteId: website.id,
            url: '/sitemap.xml',
            type: 'POSTS',
            urls: urlCount
          }
        });
      }

      console.log(`   ✅ ${website.domain}: ${urlCount} URLs`);
    }

    console.log('\n✅ 批量同步完成！\n');
    console.log('📊 同步统计:');
    console.log(`   - 总操作数: ${stats.total}`);
    console.log(`   - 新增文章: ${stats.created}`);
    console.log(`   - 更新文章: ${stats.updated}`);
    console.log(`   - 跳过文章: ${stats.skipped}`);
    console.log(`   - 错误数量: ${stats.errors}`);
    console.log('\n');

    // 显示每个网站的文章数
    console.log('📈 各网站文章统计:');
    for (const website of websites) {
      const count = await prisma.post.count({
        where: {
          websiteId: website.id,
          status: 'PUBLISHED'
        }
      });
      console.log(`   - ${website.domain}: ${count} 篇`);
    }
    console.log('\n');

  } catch (error) {
    console.error('❌ 同步失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

syncAllPosts()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
