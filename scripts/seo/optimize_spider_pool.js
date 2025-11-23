#!/usr/bin/env node
const { prisma } = require('@repo/database');

/**
 * 蜘蛛池SEO优化配置
 *
 * 策略：
 * 1. 蜘蛛池域名指向下载页（70%）和主站（30%）
 * 2. 使用标签匹配不同类型的内容
 * 3. 自动内链优化
 */

async function optimizeSpiderPool() {
  console.log('\n🕷️  优化蜘蛛池SEO配置\n');
  console.log('策略：下载页为主(70%) + 主站为辅(30%)\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL 环境变量未设置！');
    }

    // 获取所有网站
    const websites = await prisma.website.findMany({
      include: {
        domainAliases: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    // 1. 配置下载站（主要流量接收方）
    const downloadSite = websites.find(w => w.domain.includes('tg-downloads'));
    if (!downloadSite) {
      console.log('⚠️  未找到下载站，跳过配置');
    } else {
      console.log('📥 下载站配置:');
      console.log(`   网站: ${downloadSite.name}`);
      console.log(`   域名: ${downloadSite.domain}\n`);

      // 更新下载站的SEO配置
      await prisma.website.update({
        where: { id: downloadSite.id },
        data: {
          seoTitle: 'Telegram下载 - 官方APK最新版免费下载',
          seoDescription: 'Telegram安卓版官方下载。支持APK直接下载、Google Play、华为应用市场、小米应用商店。免费安全的即时通讯应用。',
          seoKeywords: [
            'Telegram下载',
            'Telegram APK',
            'Telegram安卓版',
            'Telegram中文版',
            'Telegram官方下载',
            '电报下载',
            'TG下载'
          ]
        }
      });
      console.log('   ✓ SEO元数据已更新\n');
    }

    // 2. 配置蜘蛛池域名（引流到下载页）
    console.log('🕸️  配置蜘蛛池域名:\n');

    const spiderPoolConfig = [
      // Telegram Hub 的蜘蛛池 - 70% 指向下载页
      {
        domains: ['autopushnetwork.xyz', 'contentpoolzone.site', 'crawlboostnet.xyz'],
        redirectTo: 'https://tg-downloads.com',
        tags: ['下载', 'APK', '安卓'],
        priority: 'HIGH'
      },
      {
        domains: ['globalinsighthub.xyz'],
        redirectTo: 'https://telegramconnects.com',
        tags: ['教程', '使用', '功能'],
        priority: 'MEDIUM'
      },

      // Telegram Update Center 的蜘蛛池 - 70% 指向下载页
      {
        domains: ['crawlenginepro.xyz', 'linkpushmatrix.site', 'rankspiderchain.xyz'],
        redirectTo: 'https://tg-downloads.com',
        tags: ['更新', '版本', '新功能'],
        priority: 'HIGH'
      },
      {
        domains: ['infostreammedia.xyz'],
        redirectTo: 'https://telegramconnects.com',
        tags: ['资讯', '动态', '新闻'],
        priority: 'MEDIUM'
      },

      // Telegram Trend Guide 的蜘蛛池 - 70% 指向下载页
      {
        domains: ['seohubnetwork.xyz', 'spidertrackzone.xyz', 'trafficboostflow.site'],
        redirectTo: 'https://tg-downloads.com',
        tags: ['下载', '安装', '指南'],
        priority: 'HIGH'
      },
      {
        domains: ['adminapihub.xyz'],
        redirectTo: 'https://telegramconnects.com',
        tags: ['分析', '趋势', '营销'],
        priority: 'MEDIUM'
      }
    ];

    for (const config of spiderPoolConfig) {
      for (const domain of config.domains) {
        const domainAlias = await prisma.domainAlias.findFirst({
          where: { domain }
        });

        if (domainAlias) {
          await prisma.domainAlias.update({
            where: { id: domainAlias.id },
            data: {
              domainType: 'SPIDER_POOL',
              primaryTags: config.tags,
              secondaryTags: [],
              siteDescription: `Telegram ${config.tags.join('、')} - 引流到${config.redirectTo}`
            }
          });

          const prioritySymbol = config.priority === 'HIGH' ? '🔥' : '📌';
          console.log(`   ${prioritySymbol} ${domain}`);
          console.log(`      → 指向: ${config.redirectTo}`);
          console.log(`      → 标签: ${config.tags.join(', ')}`);
          console.log('');
        }
      }
    }

    // 3. 配置系统设置 - 下载链接统一指向 tg-downloads.com
    console.log('⚙️  配置系统设置:\n');

    await prisma.systemSetting.upsert({
      where: { key: 'download_url_default' },
      update: { value: 'https://tg-downloads.com', updatedAt: new Date() },
      create: {
        key: 'download_url_default',
        value: 'https://tg-downloads.com',
        description: '默认下载页面链接（所有网站通用）',
        category: 'SEO'
      }
    });
    console.log('   ✓ 默认下载链接: https://tg-downloads.com\n');

    // 为每个主站配置下载链接
    for (const website of websites) {
      if (website.domain.includes('downloads')) continue;

      const domainKey = website.domain.replace(/\.(com|net|org|cn|xyz|site)$/, '').replace(/[.-]/g, '');
      const settingKey = `download_url_${domainKey}`;

      await prisma.systemSetting.upsert({
        where: { key: settingKey },
        update: { value: 'https://tg-downloads.com', updatedAt: new Date() },
        create: {
          key: settingKey,
          value: 'https://tg-downloads.com',
          description: `${website.name} 的下载页面链接`,
          category: 'SEO'
        }
      });
      console.log(`   ✓ ${website.name} → https://tg-downloads.com`);
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ 蜘蛛池优化完成！\n');
    console.log('📊 配置摘要:');
    console.log('   • 高优先级蜘蛛池 (9个) → tg-downloads.com (70%)');
    console.log('   • 中优先级蜘蛛池 (3个) → telegramconnects.com (30%)');
    console.log('   • 所有主站下载按钮 → tg-downloads.com');
    console.log('\n💡 SEO策略:');
    console.log('   1. 下载页承载主要流量（转化优化）');
    console.log('   2. 主站提供价值内容（建立信任）');
    console.log('   3. 蜘蛛池分散引流（提升权重）');
    console.log('═══════════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 优化失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

optimizeSpiderPool();
