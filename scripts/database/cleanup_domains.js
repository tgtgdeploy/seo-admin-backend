#!/usr/bin/env node
const { prisma } = require('@repo/database');

async function cleanupDomains() {
  console.log('\n🧹 清理域名配置 - 保留蜘蛛池域名\n');

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL 环境变量未设置！');
    }

    // 获取所有网站
    const websites = await prisma.website.findMany({
      include: {
        domainAliases: true
      }
    });

    console.log('═══════════════════════════════════════════════════════════════\n');

    for (const website of websites) {
      console.log(`🌐 网站: ${website.name}`);
      console.log(`   当前主域名: ${website.domain}`);
      console.log(`   域名别名数: ${website.domainAliases.length}\n`);

      // 蜘蛛池域名特征：.xyz 或 .site 结尾
      const spiderPoolDomains = website.domainAliases.filter(alias =>
        alias.domain.endsWith('.xyz') || alias.domain.endsWith('.site')
      );

      const otherDomains = website.domainAliases.filter(alias =>
        !alias.domain.endsWith('.xyz') && !alias.domain.endsWith('.site')
      );

      console.log('   🕷️  蜘蛛池域名 (保留):');
      spiderPoolDomains.forEach(alias => {
        console.log(`      ✓ ${alias.domain} (${alias.domainType})`);
      });

      if (spiderPoolDomains.length > 0) {
        // 更新蜘蛛池域名类型
        for (const alias of spiderPoolDomains) {
          await prisma.domainAlias.update({
            where: { id: alias.id },
            data: {
              domainType: 'SPIDER_POOL',
              status: 'ACTIVE'
            }
          });
        }
      }

      console.log('\n   🗑️  其他域名 (将删除):');
      if (otherDomains.length > 0) {
        otherDomains.forEach(alias => {
          console.log(`      ✗ ${alias.domain} (${alias.domainType})`);
        });

        // 删除非蜘蛛池域名
        for (const alias of otherDomains) {
          await prisma.domainAlias.delete({
            where: { id: alias.id }
          });
        }
        console.log(`   ✅ 删除了 ${otherDomains.length} 个非蜘蛛池域名`);
      } else {
        console.log('      (无)');
      }

      console.log('\n');
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ 清理完成！\n');
    console.log('📋 清理后的配置：\n');

    // 显示清理后的结果
    const updatedWebsites = await prisma.website.findMany({
      include: {
        domainAliases: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    for (const website of updatedWebsites) {
      console.log(`🌐 ${website.name}`);
      console.log(`   主域名: ${website.domain}`);
      console.log(`   蜘蛛池域名: ${website.domainAliases.length} 个`);
      website.domainAliases.forEach(alias => {
        console.log(`      - ${alias.domain}`);
      });
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('💡 下一步：为每个网站配置新的主域名\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 清理失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDomains();
