#!/usr/bin/env node
const { prisma } = require('@repo/database');

async function fixWebsite2Blog() {
  console.log('\n🔧 修复 website-2 博客问题\n');

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL 环境变量未设置！');
    }

    // 1. 获取"中文纸飞机主站2"
    const website2 = await prisma.website.findFirst({
      where: { name: { contains: '中文纸飞机主站2' } }
    });

    if (!website2) {
      console.log('❌ 找不到"中文纸飞机主站2"网站');
      process.exit(1);
    }

    console.log('✅ 找到网站:', website2.name);
    console.log('   ID:', website2.id);
    console.log('   当前域名:', website2.domain);

    // 2. 添加 telegramconnects.com 作为域名别名
    console.log('\n📡 添加 telegramconnects.com 域名别名...');

    const existingAlias = await prisma.domainAlias.findFirst({
      where: {
        websiteId: website2.id,
        domain: 'telegramconnects.com'
      }
    });

    if (existingAlias) {
      console.log('   域名别名已存在，更新状态为 ACTIVE');
      await prisma.domainAlias.update({
        where: { id: existingAlias.id },
        data: { status: 'ACTIVE' }
      });
    } else {
      await prisma.domainAlias.create({
        data: {
          websiteId: website2.id,
          domain: 'telegramconnects.com',
          siteName: 'Telegram中文官网',
          siteDescription: 'Telegram中文官网 - 免费安全的即时通讯应用',
          status: 'ACTIVE',
          isPrimary: true,
          domainType: 'MAIN_SITE'
        }
      });
      console.log('✅ 成功添加域名别名: telegramconnects.com');
    }

    // 3. 获取 Telegram Update Center 的文章作为模板
    const updateCenter = await prisma.website.findFirst({
      where: { name: { contains: 'Update Center' } },
      include: {
        posts: {
          where: { status: 'PUBLISHED' },
          take: 11
        }
      }
    });

    if (!updateCenter || updateCenter.posts.length === 0) {
      console.log('\n⚠️  找不到模板文章，跳过复制');
    } else {
      console.log(`\n📝 复制 ${updateCenter.posts.length} 篇文章到 website-2...`);

      let copiedCount = 0;
      for (const post of updateCenter.posts) {
        // 检查是否已存在同样的文章
        const existing = await prisma.post.findFirst({
          where: {
            websiteId: website2.id,
            slug: post.slug
          }
        });

        if (!existing) {
          await prisma.post.create({
            data: {
              websiteId: website2.id,
              authorId: post.authorId,
              title: post.title,
              slug: post.slug,
              content: post.content,
              excerpt: post.excerpt,
              coverImage: post.coverImage,
              status: 'PUBLISHED',
              metaTitle: post.metaTitle,
              metaDescription: post.metaDescription,
              metaKeywords: post.metaKeywords,
              category: post.category,
              tags: post.tags,
              publishedAt: post.publishedAt
            }
          });
          copiedCount++;
        }
      }

      console.log(`✅ 成功复制 ${copiedCount} 篇文章`);
    }

    // 4. 验证结果
    const finalCount = await prisma.post.count({
      where: {
        websiteId: website2.id,
        status: 'PUBLISHED'
      }
    });

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ 修复完成！');
    console.log(`   网站名称: ${website2.name}`);
    console.log(`   域名别名: telegramconnects.com`);
    console.log(`   文章数量: ${finalCount} 篇`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 修复失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixWebsite2Blog();
