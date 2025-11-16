const { prisma } = require('@repo/database');

async function testSEOHealth() {
  console.log('\n🧪 测试 SEO 监控数据...\n');

  try {
    // Test domainAlias query with domainType
    console.log('1️⃣ 测试获取域名数据...');
    const domains = await prisma.domainAlias.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        website: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
      orderBy: [
        { isPrimary: 'desc' },
        { domain: 'asc' },
      ],
    });

    console.log(`   ✅ 找到 ${domains.length} 个活跃域名\n`);

    // Display each domain
    for (const domain of domains) {
      console.log(`   📍 ${domain.domain}`);
      console.log(`      - 网站: ${domain.website.name}`);
      console.log(`      - 类型: ${domain.domainType}`);
      console.log(`      - 主域名: ${domain.isPrimary ? '是' : '否'}`);
      console.log(`      - 主标签: ${domain.primaryTags.join(', ')}`);
      console.log('');
    }

    // Test counting posts
    console.log('2️⃣ 测试统计文章数据...');
    const totalPosts = await prisma.post.count({
      where: {
        status: 'PUBLISHED',
      },
    });
    console.log(`   ✅ 总发布文章数: ${totalPosts}\n`);

    // Test spider logs
    console.log('3️⃣ 测试爬虫日志数据...');
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCrawls = await prisma.spiderLog.count({
      where: {
        createdAt: {
          gte: last24h,
        },
      },
    });
    console.log(`   ✅ 最近24小时爬虫访问: ${recentCrawls} 次\n`);

    // Test keyword rankings
    console.log('4️⃣ 测试关键词排名数据...');
    const rankings = await prisma.keywordRanking.count();
    console.log(`   ✅ 总关键词排名记录: ${rankings} 条\n`);

    console.log('✅ 所有测试通过！domainType 字段工作正常\n');
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.message.includes('domainType')) {
      console.error('\n⚠️  domainType 字段错误 - 需要重新生成 Prisma Client');
      console.error('   请运行: cd packages/database && npx prisma generate\n');
    }
    console.error('详细错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSEOHealth();
