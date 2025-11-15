/**
 * 添加下载链接到系统设置
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDownloadLinks() {
  try {
    console.log('📥 开始添加下载链接配置...\n');

    // 下载链接配置
    const downloadLinks = [
      {
        key: 'download_url_telegramtghub',
        value: 'https://telegram.org/android',
        description: 'Telegram Hub 下载链接',
        category: 'GENERAL'
      },
      {
        key: 'download_url_telegramtrendguide',
        value: 'https://telegram.org/android',
        description: 'Telegram Trend Guide 下载链接',
        category: 'GENERAL'
      },
      {
        key: 'download_url_telegramupdatecenter',
        value: 'https://telegram.org/android',
        description: 'Telegram Update Center 下载链接',
        category: 'GENERAL'
      },
      {
        key: 'download_url_default',
        value: 'https://telegram.org/android',
        description: '默认下载链接（官方）',
        category: 'GENERAL'
      }
    ];

    let created = 0;
    let updated = 0;

    for (const link of downloadLinks) {
      const existing = await prisma.systemSetting.findUnique({
        where: { key: link.key }
      });

      if (existing) {
        await prisma.systemSetting.update({
          where: { key: link.key },
          data: {
            value: link.value,
            description: link.description,
            category: link.category
          }
        });
        console.log(`✅ 更新: ${link.key} = ${link.value}`);
        updated++;
      } else {
        await prisma.systemSetting.create({
          data: link
        });
        console.log(`✅ 创建: ${link.key} = ${link.value}`);
        created++;
      }
    }

    console.log(`\n📊 完成！创建 ${created} 个，更新 ${updated} 个\n`);
    console.log('💡 提示：您可以在后台管理系统中修改这些下载链接');
    console.log('   或直接在数据库的 system_settings 表中修改\n');

  } catch (error) {
    console.error('❌ 错误:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addDownloadLinks()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
