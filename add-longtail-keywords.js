/**
 * 添加长尾关键词 - 针对实际用户搜索习惯
 * 重点：下载、中文版、纸飞机等组合词
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 长尾关键词 - 更符合实际搜索习惯
const longtailKeywords = [
  // ========== 下载类组合词（高意图） ==========
  {
    keyword: 'telegram 纸飞机 下载',
    volume: 82000,
    difficulty: 42,
    cpc: 0.28,
    category: 'download-combination'
  },
  {
    keyword: '纸飞机 telegram 下载',
    volume: 65000,
    difficulty: 38,
    cpc: 0.25,
    category: 'download-combination'
  },
  {
    keyword: '中文纸飞机下载',
    volume: 58000,
    difficulty: 35,
    cpc: 0.22,
    category: 'download-chinese'
  },
  {
    keyword: '纸飞机中文版下载',
    volume: 71000,
    difficulty: 40,
    cpc: 0.26,
    category: 'download-chinese'
  },
  {
    keyword: 'telegram中文纸飞机',
    volume: 45000,
    difficulty: 32,
    cpc: 0.20,
    category: 'chinese-combination'
  },
  {
    keyword: '纸飞机app下载',
    volume: 52000,
    difficulty: 36,
    cpc: 0.24,
    category: 'download-app'
  },
  {
    keyword: 'telegram下载中文版',
    volume: 95000,
    difficulty: 48,
    cpc: 0.32,
    category: 'download-chinese'
  },
  {
    keyword: 'telegram官方下载',
    volume: 68000,
    difficulty: 50,
    cpc: 0.35,
    category: 'download-official'
  },
  {
    keyword: 'telegram安卓版下载',
    volume: 76000,
    difficulty: 45,
    cpc: 0.30,
    category: 'download-android'
  },
  {
    keyword: 'telegram苹果版下载',
    volume: 44000,
    difficulty: 42,
    cpc: 0.28,
    category: 'download-ios'
  },

  // ========== 中文版相关 ==========
  {
    keyword: 'telegram中文版安装',
    volume: 38000,
    difficulty: 30,
    cpc: 0.18,
    category: 'chinese-install'
  },
  {
    keyword: 'telegram设置中文',
    volume: 56000,
    difficulty: 28,
    cpc: 0.15,
    category: 'chinese-setup'
  },
  {
    keyword: 'telegram怎么设置中文',
    volume: 42000,
    difficulty: 25,
    cpc: 0.12,
    category: 'chinese-howto'
  },
  {
    keyword: 'telegram中文语言包',
    volume: 28000,
    difficulty: 22,
    cpc: 0.10,
    category: 'chinese-language'
  },
  {
    keyword: '纸飞机怎么改中文',
    volume: 31000,
    difficulty: 20,
    cpc: 0.08,
    category: 'chinese-howto'
  },

  // ========== 纸飞机相关 ==========
  {
    keyword: '纸飞机是什么',
    volume: 22000,
    difficulty: 18,
    cpc: 0.06,
    category: 'what-is'
  },
  {
    keyword: '纸飞机软件下载',
    volume: 48000,
    difficulty: 34,
    cpc: 0.22,
    category: 'download-software'
  },
  {
    keyword: '纸飞机聊天软件',
    volume: 35000,
    difficulty: 28,
    cpc: 0.16,
    category: 'chat-app'
  },
  {
    keyword: '纸飞机app',
    volume: 67000,
    difficulty: 40,
    cpc: 0.26,
    category: 'app'
  },
  {
    keyword: '纸飞机官网',
    volume: 41000,
    difficulty: 45,
    cpc: 0.30,
    category: 'official'
  },

  // ========== 安装注册类 ==========
  {
    keyword: 'telegram注册教程',
    volume: 25000,
    difficulty: 22,
    cpc: 0.10,
    category: 'tutorial'
  },
  {
    keyword: 'telegram怎么注册',
    volume: 32000,
    difficulty: 24,
    cpc: 0.12,
    category: 'howto'
  },
  {
    keyword: 'telegram安装教程',
    volume: 28000,
    difficulty: 20,
    cpc: 0.09,
    category: 'tutorial'
  },
  {
    keyword: '纸飞机注册',
    volume: 19000,
    difficulty: 18,
    cpc: 0.08,
    category: 'register'
  },
  {
    keyword: '纸飞机怎么注册',
    volume: 15000,
    difficulty: 16,
    cpc: 0.07,
    category: 'howto'
  },

  // ========== 平台特定 ==========
  {
    keyword: 'telegram电脑版中文',
    volume: 36000,
    difficulty: 32,
    cpc: 0.20,
    category: 'desktop-chinese'
  },
  {
    keyword: 'telegram手机版下载',
    volume: 54000,
    difficulty: 38,
    cpc: 0.24,
    category: 'mobile-download'
  },
  {
    keyword: 'telegram网页版',
    volume: 62000,
    difficulty: 48,
    cpc: 0.32,
    category: 'web'
  },
  {
    keyword: 'telegram windows下载',
    volume: 45000,
    difficulty: 40,
    cpc: 0.26,
    category: 'windows'
  },
  {
    keyword: 'telegram mac下载',
    volume: 38000,
    difficulty: 42,
    cpc: 0.28,
    category: 'mac'
  },

  // ========== 功能相关长尾词 ==========
  {
    keyword: '纸飞机怎么加群',
    volume: 16000,
    difficulty: 15,
    cpc: 0.06,
    category: 'group-howto'
  },
  {
    keyword: 'telegram加群链接',
    volume: 21000,
    difficulty: 20,
    cpc: 0.09,
    category: 'group-link'
  },
  {
    keyword: 'telegram群组搜索',
    volume: 18000,
    difficulty: 22,
    cpc: 0.10,
    category: 'group-search'
  },
  {
    keyword: '纸飞机聊天记录',
    volume: 12000,
    difficulty: 14,
    cpc: 0.05,
    category: 'chat-history'
  },
  {
    keyword: 'telegram文件下载',
    volume: 24000,
    difficulty: 25,
    cpc: 0.12,
    category: 'file-download'
  },

  // ========== 对比类 ==========
  {
    keyword: 'telegram和微信区别',
    volume: 14000,
    difficulty: 20,
    cpc: 0.08,
    category: 'comparison'
  },
  {
    keyword: '纸飞机和微信哪个好',
    volume: 9500,
    difficulty: 16,
    cpc: 0.06,
    category: 'comparison'
  },

  // ========== 问题类长尾词 ==========
  {
    keyword: 'telegram需要翻墙吗',
    volume: 18000,
    difficulty: 22,
    cpc: 0.10,
    category: 'question'
  },
  {
    keyword: '纸飞机安全吗',
    volume: 11000,
    difficulty: 18,
    cpc: 0.07,
    category: 'question'
  },
  {
    keyword: 'telegram能发多大文件',
    volume: 8500,
    difficulty: 15,
    cpc: 0.05,
    category: 'question'
  },
  {
    keyword: '纸飞机能发多少人',
    volume: 6800,
    difficulty: 12,
    cpc: 0.04,
    category: 'question'
  },

  // ========== 最新版本类 ==========
  {
    keyword: 'telegram最新版下载',
    volume: 48000,
    difficulty: 38,
    cpc: 0.24,
    category: 'latest-version'
  },
  {
    keyword: '纸飞机最新版',
    volume: 26000,
    difficulty: 28,
    cpc: 0.16,
    category: 'latest-version'
  },
  {
    keyword: 'telegram更新',
    volume: 32000,
    difficulty: 30,
    cpc: 0.18,
    category: 'update'
  }
];

async function addLongtailKeywords() {
  try {
    console.log('📝 开始添加长尾关键词...\n');

    // 获取所有活跃网站
    const websites = await prisma.website.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, domain: true }
    });

    if (websites.length === 0) {
      console.log('⚠️  未找到活跃网站');
      return;
    }

    console.log(`🌐 找到 ${websites.length} 个网站\n`);

    let stats = {
      total: 0,
      created: 0,
      updated: 0,
      skipped: 0
    };

    // 为每个网站添加关键词
    for (const website of websites) {
      console.log(`📝 为 ${website.domain} 添加长尾关键词...`);
      let siteCreated = 0;

      for (const kwData of longtailKeywords) {
        stats.total++;

        try {
          // 检查是否已存在
          const existing = await prisma.keyword.findUnique({
            where: {
              websiteId_keyword: {
                websiteId: website.id,
                keyword: kwData.keyword
              }
            }
          });

          if (existing) {
            // 更新
            await prisma.keyword.update({
              where: { id: existing.id },
              data: {
                volume: kwData.volume,
                difficulty: kwData.difficulty,
                cpc: kwData.cpc
              }
            });
            stats.updated++;
          } else {
            // 创建
            await prisma.keyword.create({
              data: {
                keyword: kwData.keyword,
                volume: kwData.volume,
                difficulty: kwData.difficulty,
                cpc: kwData.cpc,
                websiteId: website.id
              }
            });
            stats.created++;
            siteCreated++;
          }
        } catch (error) {
          console.error(`   ❌ 错误 [${kwData.keyword}]:`, error.message);
        }
      }

      console.log(`   ✅ 新增 ${siteCreated} 个关键词`);
    }

    console.log('\n✅ 长尾关键词添加完成！\n');
    console.log('📊 统计信息:');
    console.log(`   - 总操作数: ${stats.total}`);
    console.log(`   - 新增: ${stats.created}`);
    console.log(`   - 更新: ${stats.updated}`);
    console.log(`   - 跳过: ${stats.skipped}`);
    console.log('');

    // 按类别分组统计
    console.log('📋 按类别统计:\n');
    const categories = {};
    longtailKeywords.forEach(kw => {
      categories[kw.category] = (categories[kw.category] || 0) + 1;
    });

    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} 个`);
    });
    console.log('');

    // Top 10 长尾词
    console.log('🔥 搜索量 Top 10 长尾关键词:\n');
    const topKeywords = [...longtailKeywords]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);

    topKeywords.forEach((kw, i) => {
      console.log(`   ${i + 1}. ${kw.keyword}`);
      console.log(`      搜索量: ${kw.volume.toLocaleString()}/月 | 难度: ${kw.difficulty} | CPC: $${kw.cpc}`);
    });
    console.log('');

    // 显示各网站总关键词数
    console.log('📈 各网站关键词总数:');
    for (const website of websites) {
      const count = await prisma.keyword.count({
        where: { websiteId: website.id }
      });
      console.log(`   - ${website.domain}: ${count} 个关键词`);
    }
    console.log('');

  } catch (error) {
    console.error('❌ 添加失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addLongtailKeywords()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
