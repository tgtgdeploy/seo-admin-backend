/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/database', '@repo/seo-tools'],

  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3100'],
    },
  },

  // Optimize for production
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Production source maps (disable for smaller builds)
  productionBrowserSourceMaps: false,

  // Webpack configuration for Prisma
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fix for Prisma Client in production
      config.externals = [...(config.externals || []), '@prisma/client']
    }
    return config
  },
}

module.exports = nextConfig
