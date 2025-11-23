const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Checking active domains...\n')

  const count = await prisma.domainAlias.count({
    where: { status: 'ACTIVE' }
  })

  console.log(`Total active domains: ${count}`)

  if (count > 0) {
    const domains = await prisma.domainAlias.findMany({
      where: { status: 'ACTIVE' },
      include: {
        website: {
          select: { name: true, domain: true }
        }
      }
    })

    console.log('\nDomains:')
    domains.forEach(d => {
      console.log(`  - ${d.domain} (${d.siteName}) [${d.domainType}]`)
      console.log(`    Website: ${d.website.name}`)
    })
  } else {
    console.log('\n⚠️  No active domains found!')
    console.log('   The SEO dashboard will be empty.')
    console.log('\n   To fix this:')
    console.log('   1. Go to /websites page')
    console.log('   2. Add a new website')
    console.log('   3. Add domain aliases to that website')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
