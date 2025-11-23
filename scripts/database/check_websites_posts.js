#!/usr/bin/env node
const { prisma } = require('@repo/database');

async function checkWebsitesAndPosts() {
  console.log('\n📊 检查数据库中的网站和文章配置\n');

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL 环境变量未设置！');
    }

    // 获取所有网站
    const websites = await prisma.website.findMany({
      include: {
        domainAliases: {
          where: { status: 'ACTIVE' }
        },
        _count: {
          select: { posts: true }
        }
      }
    });

    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`找到 ${websites.length} 个网站：\n`);

    for (const website of websites) {
      console.log(`🌐 网站: ${website.name}`);
      console.log(`   ID: ${website.id}`);
      console.log(`   主域名: ${website.domain}`);
      console.log(`   状态: ${website.status}`);
      console.log(`   文章数: ${website._count.posts}`);

      if (website.domainAliases.length > 0) {
        console.log(`   域名别名:`);
        website.domainAliases.forEach(alias => {
          console.log(`     - ${alias.domain} (标签: ${alias.tags})`);
        });
      }
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════════\n');

    // 获取每个网站的文章
    for (const website of websites) {
      const posts = await prisma.post.findMany({
        where: {
          websiteId: website.id,
          status: 'PUBLISHED'
        },
        select: {
          id: true,
          title: true,
          slug: true,
          metaKeywords: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      });

      if (posts.length > 0) {
        console.log(`📝 ${website.name} 的文章 (前3篇):\n`);
        posts.forEach(post => {
          console.log(`   - ${post.title}`);
          console.log(`     Slug: ${post.slug}`);
          console.log(`     关键词: ${post.metaKeywords}`);
          console.log(`     发布时间: ${post.createdAt.toLocaleDateString('zh-CN')}`);
          console.log('');
        });
      } else {
        console.log(`📝 ${website.name}: 暂无文章\n`);
      }
    }

    console.log('═══════════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 查询失败:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkWebsitesAndPosts();
