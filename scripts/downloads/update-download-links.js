/**
 * 更新下载链接为正确的地址
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDownloadLinks() {
  try {
    console.log('🔄 更新下载链接...\n');

    // 使用原来的 GitHub 链接
    const githubApkUrl = 'https://github.com/onedeploy1010/seo-websites-monorepo/releases/download/v1.0.8/app.2.apk';

    const updates = [
      { key: 'download_url_telegramtghub', value: githubApkUrl },
      { key: 'download_url_telegramtrendguide', value: githubApkUrl },
      { key: 'download_url_telegramupdatecenter', value: githubApkUrl },
      { key: 'download_url_default', value: githubApkUrl }
    ];

    for (const update of updates) {
      await prisma.systemSetting.update({
        where: { key: update.key },
        data: { value: update.value }
      });
      console.log(`✅ ${update.key} = ${update.value}`);
    }

    console.log('\n✅ 所有下载链接已更新！\n');

  } catch (error) {
    console.error('❌ 错误:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateDownloadLinks()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
