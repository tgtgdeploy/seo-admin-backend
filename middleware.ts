import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/websites/:path*',
    '/posts/:path*',
    '/keywords/:path*',
    '/sitemaps/:path*',
    '/spider/:path*',
  ],
}
