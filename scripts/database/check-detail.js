const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
  const websites = await prisma.website.findMany({
    include: {
      domainAliases: {
        select: {
          domain: true,
          siteName: true,
          domainType: true,
          isPrimary: true
        }
      }
    }
  })

  for (const w of websites) {
    console.log('\n===', w.name, '===')
    w.domainAliases.forEach(a => {
      console.log('  -', a.domain, '[' + a.domainType + ']', a.isPrimary ? '主域名' : '')
    })
  }
}

check().catch(console.error).finally(() => prisma.$disconnect())
