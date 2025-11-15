/**
 * 更新关键词数据工具
 * 用于单独更新或批量更新关键词的搜索量、难度、CPC数据
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 更新单个关键词
 */
async function updateKeyword(keyword, updates) {
  const result = await prisma.keyword.updateMany({
    where: { keyword },
    data: updates
  });
  return result.count;
}

/**
 * 批量更新关键词
 */
async function batchUpdateKeywords(keywordsData) {
  console.log(`🔄 开始批量更新 ${keywordsData.length} 个关键词...\n`);

  let updated = 0;
  let notFound = 0;

  for (const kwData of keywordsData) {
    const { keyword, ...updates } = kwData;
    const count = await updateKeyword(keyword, updates);

    if (count > 0) {
      console.log(`✅ 更新 "${keyword}": ${count} 条记录`);
      if (updates.volume) console.log(`   搜索量: ${updates.volume.toLocaleString()}/月`);
      if (updates.difficulty) console.log(`   难度: ${updates.difficulty}/100`);
      if (updates.cpc) console.log(`   CPC: $${updates.cpc}`);
      updated += count;
    } else {
      console.log(`⚠️  未找到关键词: "${keyword}"`);
      notFound++;
    }
  }

  console.log(`\n✅ 更新完成！更新了 ${updated} 条记录，${notFound} 个关键词未找到`);
}

/**
 * 查看关键词当前数据
 */
async function viewKeywordData(keyword) {
  const keywords = await prisma.keyword.findMany({
    where: { keyword },
    include: {
      website: { select: { name: true, domain: true } }
    }
  });

  if (keywords.length === 0) {
    console.log(`❌ 未找到关键词: "${keyword}"`);
    return;
  }

  console.log(`\n📊 关键词 "${keyword}" 的数据:\n`);
  keywords.forEach((kw, i) => {
    console.log(`${i + 1}. ${kw.website.name} (${kw.website.domain})`);
    console.log(`   搜索量: ${kw.volume?.toLocaleString() || '未设置'}/月`);
    console.log(`   难度: ${kw.difficulty || '未设置'}/100`);
    console.log(`   CPC: $${kw.cpc || '未设置'}`);
    console.log('');
  });
}

// ==================== 使用示例 ====================

// 示例1: 更新单个关键词
async function example1() {
  await updateKeyword('Telegram', {
    volume: 2800000,  // 新的搜索量
    difficulty: 85,    // 新的难度
    cpc: 0.48         // 新的CPC
  });
}

// 示例2: 批量更新多个关键词
async function example2() {
  const updates = [
    { keyword: 'Telegram', volume: 2850000, difficulty: 83, cpc: 0.46 },
    { keyword: 'Telegram下载', volume: 460000, difficulty: 66, cpc: 0.36 },
    { keyword: 'Telegram中文版', volume: 170000, difficulty: 59, cpc: 0.39 }
  ];
  await batchUpdateKeywords(updates);
}

// 示例3: 查看关键词数据
async function example3() {
  await viewKeywordData('Telegram');
}

// ==================== 主程序 ====================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
📖 使用说明:

1. 查看关键词数据:
   node update-keyword-data.js view "关键词"

2. 更新单个关键词:
   node update-keyword-data.js update "关键词" 搜索量 难度 CPC

   示例:
   node update-keyword-data.js update "Telegram" 2850000 85 0.48

3. 使用预设的批量更新:
   编辑此文件，在 main() 函数中取消注释相应示例

当前数据库中的关键词统计:
`);

    const stats = await prisma.keyword.groupBy({
      by: ['websiteId'],
      _count: true
    });

    for (const stat of stats) {
      const website = await prisma.website.findUnique({
        where: { id: stat.websiteId },
        select: { name: true, domain: true }
      });
      console.log(`   ${website.name}: ${stat._count} 个关键词`);
    }

    const total = await prisma.keyword.count();
    console.log(`\n   总计: ${total} 个关键词\n`);

    return;
  }

  const command = args[0];

  try {
    if (command === 'view') {
      const keyword = args[1];
      if (!keyword) {
        console.log('❌ 请指定关键词');
        return;
      }
      await viewKeywordData(keyword);
    }
    else if (command === 'update') {
      const keyword = args[1];
      const volume = args[2] ? parseInt(args[2]) : undefined;
      const difficulty = args[3] ? parseInt(args[3]) : undefined;
      const cpc = args[4] ? parseFloat(args[4]) : undefined;

      if (!keyword) {
        console.log('❌ 请指定关键词');
        return;
      }

      const updates = {};
      if (volume) updates.volume = volume;
      if (difficulty) updates.difficulty = difficulty;
      if (cpc) updates.cpc = cpc;

      if (Object.keys(updates).length === 0) {
        console.log('❌ 请至少提供一个更新参数');
        return;
      }

      const count = await updateKeyword(keyword, updates);
      if (count > 0) {
        console.log(`✅ 成功更新 "${keyword}": ${count} 条记录`);
        await viewKeywordData(keyword);
      } else {
        console.log(`❌ 未找到关键词: "${keyword}"`);
      }
    }
    else {
      console.log(`❌ 未知命令: ${command}`);
      console.log('支持的命令: view, update');
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
