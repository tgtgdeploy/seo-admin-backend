#!/usr/bin/env node
const { prisma } = require('@repo/database');

async function updateWebsite2Domains() {
  console.log('\n🌐 更新 website-2 域名配置\n');

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL 环境变量未设置！');
    }

    // 1. 获取 website-2
    const website2 = await prisma.website.findFirst({
      where: { name: { contains: '中文纸飞机主站2' } },
      include: { domainAliases: true }
    });

    if (!website2) {
      console.log('❌ 找不到"中文纸飞机主站2"');
      process.exit(1);
    }

    console.log('✅ 找到网站:', website2.name);
    console.log('   当前主域名:', website2.domain);
    console.log('\n📋 当前域名别名:');
    website2.domainAliases.forEach(alias => {
      console.log(`   - ${alias.domain} (${alias.status})`);
    });

    // 2. 更新主域名
    console.log('\n🔄 更新主域名...');
    await prisma.website.update({
      where: { id: website2.id },
      data: {
        domain: 'telegramconnects.com'
      }
    });
    console.log('✅ 主域名更新为: telegramconnects.com');

    // 3. 主站域名列表
    const mainDomains = [
      {
        domain: 'telegramconnects.com',
        siteName: 'Telegram中文官网',
        siteDescription: 'Telegram官方中文网站 - 免费安全的即时通讯应用',
        isPrimary: true,
        domainType: 'MAIN_SITE'
      },
      {
        domain: 'www.telegramconnects.com',
        siteName: 'Telegram中文官网',
        siteDescription: 'Telegram官方中文网站 - 免费安全的即时通讯应用',
        isPrimary: false,
        domainType: 'MAIN_SITE'
      },
      {
        domain: 'tgservice2.netlify.app',
        siteName: 'Telegram中文官网',
        siteDescription: 'Telegram官方中文网站 - 免费安全的即时通讯应用',
        isPrimary: false,
        domainType: 'MAIN_SITE'
      }
    ];

    console.log('\n📡 配置主站域名别名...');
    for (const domainConfig of mainDomains) {
      const existing = await prisma.domainAlias.findFirst({
        where: {
          websiteId: website2.id,
          domain: domainConfig.domain
        }
      });

      if (existing) {
        await prisma.domainAlias.update({
          where: { id: existing.id },
          data: {
            siteName: domainConfig.siteName,
            siteDescription: domainConfig.siteDescription,
            isPrimary: domainConfig.isPrimary,
            domainType: domainConfig.domainType,
            status: 'ACTIVE'
          }
        });
        console.log(`   ✓ 更新: ${domainConfig.domain}`);
      } else {
        await prisma.domainAlias.create({
          data: {
            websiteId: website2.id,
            domain: domainConfig.domain,
            siteName: domainConfig.siteName,
            siteDescription: domainConfig.siteDescription,
            isPrimary: domainConfig.isPrimary,
            domainType: domainConfig.domainType,
            status: 'ACTIVE'
          }
        });
        console.log(`   ✓ 新增: ${domainConfig.domain}`);
      }
    }

    // 4. 下载页域名（需要关联到下载站 website）
    console.log('\n📥 检查下载页域名配置...');

    // 查找或创建下载站 website
    let downloadSite = await prisma.website.findFirst({
      where: {
        OR: [
          { name: { contains: '下载' } },
          { domain: { contains: 'tg-downloads.com' } }
        ]
      }
    });

    if (!downloadSite) {
      console.log('   创建新的下载站配置...');
      downloadSite = await prisma.website.create({
        data: {
          name: 'Telegram下载站',
          domain: 'tg-downloads.com',
          status: 'ACTIVE',
          description: 'Telegram官方下载页 - 支持Android APK、iOS等多平台下载'
        }
      });
      console.log('   ✓ 创建下载站:', downloadSite.name);
    }

    const downloadDomains = [
      {
        domain: 'tg-downloads.com',
        siteName: 'Telegram下载',
        siteDescription: 'Telegram官方下载页 - APK/Android/iOS下载',
        isPrimary: true,
        domainType: 'REDIRECT_PAGE'
      },
      {
        domain: 'www.tg-downloads.com',
        siteName: 'Telegram下载',
        siteDescription: 'Telegram官方下载页 - APK/Android/iOS下载',
        isPrimary: false,
        domainType: 'REDIRECT_PAGE'
      }
    ];

    for (const domainConfig of downloadDomains) {
      const existing = await prisma.domainAlias.findFirst({
        where: {
          websiteId: downloadSite.id,
          domain: domainConfig.domain
        }
      });

      if (existing) {
        await prisma.domainAlias.update({
          where: { id: existing.id },
          data: {
            siteName: domainConfig.siteName,
            siteDescription: domainConfig.siteDescription,
            isPrimary: domainConfig.isPrimary,
            domainType: domainConfig.domainType,
            status: 'ACTIVE'
          }
        });
        console.log(`   ✓ 更新: ${domainConfig.domain}`);
      } else {
        await prisma.domainAlias.create({
          data: {
            websiteId: downloadSite.id,
            domain: domainConfig.domain,
            siteName: domainConfig.siteName,
            siteDescription: domainConfig.siteDescription,
            isPrimary: domainConfig.isPrimary,
            domainType: domainConfig.domainType,
            status: 'ACTIVE'
          }
        });
        console.log(`   ✓ 新增: ${domainConfig.domain}`);
      }
    }

    // 5. 验证结果
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ 域名配置更新完成！\n');

    const updatedWebsite = await prisma.website.findUnique({
      where: { id: website2.id },
      include: { domainAliases: { where: { status: 'ACTIVE' } } }
    });

    console.log('📌 Website-2 (主站) 域名:');
    console.log(`   主域名: ${updatedWebsite.domain}`);
    updatedWebsite.domainAliases.forEach(alias => {
      const primary = alias.isPrimary ? ' [主要]' : '';
      console.log(`   - ${alias.domain}${primary}`);
    });

    const updatedDownload = await prisma.website.findUnique({
      where: { id: downloadSite.id },
      include: { domainAliases: { where: { status: 'ACTIVE' } } }
    });

    console.log('\n📥 下载站域名:');
    console.log(`   主域名: ${updatedDownload.domain}`);
    updatedDownload.domainAliases.forEach(alias => {
      const primary = alias.isPrimary ? ' [主要]' : '';
      console.log(`   - ${alias.domain}${primary}`);
    });

    console.log('═══════════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 更新失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateWebsite2Domains();
