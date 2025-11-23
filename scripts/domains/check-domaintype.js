const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const all = await prisma.domainAlias.findMany({
      select: { id: true, domain: true, domainType: true }
    });

    console.log('所有域名别名及domainType:');
    all.forEach(d => console.log(`  ${d.domain}: ${d.domainType || 'NULL'}`));

    const nullCount = all.filter(d => !d.domainType).length;
    console.log(`\n有 ${nullCount} 个记录的domainType为NULL`);
  } catch(e) {
    console.error('错误:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
