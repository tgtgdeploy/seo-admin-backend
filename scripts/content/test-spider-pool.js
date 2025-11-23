const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSpiderPool() {
  console.log('\n🧪 测试蜘蛛池功能...\n');

  try {
    // 1. 测试domainType字段
    console.log('1️⃣ 测试 domainType 字段访问...');
    const domain = await prisma.domainAlias.findFirst({
      where: { domainType: 'SPIDER_POOL' }
    });
    console.log(`   ✅ 成功读取: ${domain.domain} (${domain.domainType})`);

    // 2. 测试内容源
    console.log('\n2️⃣ 测试内容源...');
    const sources = await prisma.spiderPoolSource.findMany({
      where: { isActive: true }
    });
    console.log(`   ✅ 找到 ${sources.length} 个激活的内容源`);
    sources.forEach(s => {
      console.log(`      - ${s.name}: ${s.totalParagraphs}段落, ${s.totalHeadings}标题`);
    });

    // 3. 测试蜘蛛池页面
    console.log('\n3️⃣ 测试蜘蛛池页面...');
    const pageCount = await prisma.spiderPoolPage.count();
    console.log(`   ✅ 当前有 ${pageCount} 个蜘蛛池页面`);

    console.log('\n✅ 所有测试通过！蜘蛛池功能正常\n');
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSpiderPool();
