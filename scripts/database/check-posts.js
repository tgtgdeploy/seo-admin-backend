const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkPosts() {
  console.log('\n📝 检查网站文章数量...\n')

  const websites = await prisma.website.findMany({
    include: {
      posts: {
        select: {
          id: true,
          title: true,
          status: true,
          publishedAt: true
        }
      }
    }
  })

  for (const website of websites) {
    const totalPosts = website.posts.length
    const publishedPosts = website.posts.filter(p => p.status === 'PUBLISHED').length
    const draftPosts = website.posts.filter(p => p.status === 'DRAFT').length

    console.log(`\n${website.name} (${website.domain})`)
    console.log(`  总文章数: ${totalPosts}`)
    console.log(`  已发布: ${publishedPosts}`)
    console.log(`  草稿: ${draftPosts}`)

    if (totalPosts > 0) {
      console.log(`  最近文章:`)
      website.posts.slice(0, 3).forEach(post => {
        console.log(`    - ${post.title} [${post.status}]`)
      })
    }
  }

  console.log('\n')
}

checkPosts()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
