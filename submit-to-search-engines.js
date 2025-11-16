/**
 * 搜索引擎提交工具
 * 自动提交网站和文章到 Google、Bing、百度
 */

const { prisma } = require('@repo/database');

/**
 * 提交到 Google
 */
async function submitToGoogle(url) {
  const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(url)}`;

  try {
    const response = await fetch(pingUrl);
    console.log(`   ${response.ok ? '✅' : '❌'} Google: ${url}`);
    return response.ok;
  } catch (error) {
    console.error(`   ❌ Google 提交失败:`, error.message);
    return false;
  }
}

/**
 * 提交到 Bing
 */
async function submitToBing(url) {
  // Bing 使用 IndexNow 协议
  const indexNowUrl = 'https://www.bing.com/indexnow';

  try {
    const response = await fetch(indexNowUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: new URL(url).hostname,
        key: 'your-indexnow-key', // 需要在 Bing Webmaster Tools 生成
        keyLocation: `${new URL(url).origin}/indexnow-key.txt`,
        urlList: [url],
      }),
    });

    console.log(`   ${response.ok ? '✅' : '❌'} Bing: ${url}`);
    return response.ok;
  } catch (error) {
    console.error(`   ❌ Bing 提交失败:`, error.message);
    return false;
  }
}

/**
 * 百度链接提交
 * 需要在百度站长平台获取 token
 */
async function submitToBaidu(url, site, token) {
  const baiduUrl = `http://data.zz.baidu.com/urls?site=${site}&token=${token}`;

  try {
    const response = await fetch(baiduUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: url,
    });

    const data = await response.json();
    console.log(`   ${data.success > 0 ? '✅' : '❌'} 百度: ${url} (成功: ${data.success || 0})`);
    return data.success > 0;
  } catch (error) {
    console.error(`   ❌ 百度提交失败:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 搜索引擎提交工具启动...\n');

  try {
    // 1. 获取所有主站
    const websites = await prisma.website.findMany({
      where: { status: 'ACTIVE' },
      include: {
        domainAliases: {
          where: {
            isPrimary: true,
            status: 'ACTIVE',
          },
        },
      },
    });

    console.log(`📊 找到 ${websites.length} 个网站\n`);

    // 2. 提交所有网站的 sitemap
    for (const website of websites) {
      if (website.domainAliases.length === 0) {
        console.log(`⚠️  ${website.name}: 没有主域名`);
        continue;
      }

      const domain = website.domainAliases[0].domain;
      const sitemapUrl = `https://${domain}/sitemap.xml`;

      console.log(`\n📍 ${website.name} (${domain})`);
      console.log(`   Sitemap: ${sitemapUrl}`);

      // 提交到 Google
      await submitToGoogle(sitemapUrl);

      // 等待 1 秒避免限流
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 3. 获取最近发布的文章
    const recentPosts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 最近 7 天
        },
      },
      include: {
        website: {
          include: {
            domainAliases: {
              where: { isPrimary: true },
            },
          },
        },
      },
      take: 50, // 最多提交 50 篇
    });

    if (recentPosts.length > 0) {
      console.log(`\n\n📝 提交最近 ${recentPosts.length} 篇文章:\n`);

      for (const post of recentPosts) {
        if (post.website.domainAliases.length === 0) continue;

        const domain = post.website.domainAliases[0].domain;
        const postUrl = `https://${domain}/blog/${post.slug}`;

        console.log(`\n📄 ${post.title}`);
        console.log(`   URL: ${postUrl}`);

        await submitToGoogle(postUrl);

        // 等待 1 秒
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n\n✅ 提交完成！\n`);
    console.log(`提示:`);
    console.log(`1. Google 会在几小时到几天内索引`);
    console.log(`2. 建议也在 Google Search Console 手动提交`);
    console.log(`3. 百度需要在站长平台获取 token 后使用\n`);

  } catch (error) {
    console.error('\n❌ 发生错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
