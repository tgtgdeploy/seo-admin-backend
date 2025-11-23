#!/usr/bin/env node

/**
 * 更新所有网站的下载链接到统一的纯净站
 * 用法: node scripts/database/update_download_urls.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 新的下载页面 URL
const NEW_DOWNLOAD_URL = 'https://venerable-concha-42e618.netlify.app';

async function updateDownloadUrls() {
  console.log('\n🔗 开始更新所有网站的下载链接配置...\n');
  console.log(`📍 目标下载页面: ${NEW_DOWNLOAD_URL}\n`);

  try {
    // 检查环境变量
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL 环境变量未设置！请确保 .env.local 文件存在并已加载。');
    }

    // 获取所有活跃的网站
    const websites = await prisma.website.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, domain: true }
    });

    console.log(`✅ 找到 ${websites.length} 个活跃网站:\n`);
    websites.forEach((site, index) => {
      console.log(`   ${index + 1}. ${site.name} (${site.domain})`);
    });
    console.log('');

    // 更新每个网站的下载链接设置
    const updates = [];

    for (const website of websites) {
      // 生成设置key
      const domainKey = website.domain.replace(/\.(com|net|org|cn)$/, '').replace(/[.-]/g, '');
      const settingKey = `download_url_${domainKey}`;

      console.log(`⏳ 更新 ${website.name} (${settingKey})...`);

      // Upsert 设置
      const setting = await prisma.systemSetting.upsert({
        where: { key: settingKey },
        update: {
          value: NEW_DOWNLOAD_URL,
          updatedAt: new Date()
        },
        create: {
          key: settingKey,
          value: NEW_DOWNLOAD_URL,
          description: `${website.name} 的下载页面链接`,
          category: 'download'
        }
      });

      updates.push({ website: website.name, key: settingKey });
      console.log(`   ✓ ${settingKey} → ${NEW_DOWNLOAD_URL}`);
    }

    // 同时更新默认下载链接
    console.log(`\n⏳ 更新默认下载链接...`);
    await prisma.systemSetting.upsert({
      where: { key: 'download_url_default' },
      update: {
        value: NEW_DOWNLOAD_URL,
        updatedAt: new Date()
      },
      create: {
        key: 'download_url_default',
        value: NEW_DOWNLOAD_URL,
        description: '默认下载页面链接（当网站未配置特定链接时使用）',
        category: 'download'
      }
    });
    console.log(`   ✓ download_url_default → ${NEW_DOWNLOAD_URL}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ 所有下载链接配置更新成功！');
    console.log('='.repeat(60));
    console.log(`\n📊 更新统计:`);
    console.log(`   - 网站配置: ${updates.length} 个`);
    console.log(`   - 默认配置: 1 个`);
    console.log(`   - 总计: ${updates.length + 1} 个`);
    console.log('\n📝 更新的网站:');
    updates.forEach((update, index) => {
      console.log(`   ${index + 1}. ${update.website}`);
    });
    console.log('\n🎉 现在所有网站的下载链接都指向统一的纯净下载站！\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 更新失败:', error.message);
    console.error('\n可能的原因:');
    console.error('1. 环境变量未加载 - 请先运行: source <(cat .env.local | grep -v "^#" | sed "s/^/export /")');
    console.error('2. 数据库连接失败 - 请检查 DATABASE_URL 是否正确');
    console.error('3. 权限不足 - 请检查数据库用户权限\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateDownloadUrls();
