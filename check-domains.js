const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAll() {
  const websites = await prisma.website.findMany({
    include: { domainAliases: true }
  })

  console.log('网站总数:', websites.length)
  for (const w of websites) {
    console.log('\n' + w.name, '- 域名别名:', w.domainAliases.length + '个')
  }

  const aliases = await prisma.domainAlias.findMany()
  console.log('\n总域名别名:', aliases.length)
}

checkAll().catch(console.error).finally(() => prisma.$disconnect())
