/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/database', '@repo/seo-tools'],

  // Enable standalone output for Docker deployment
  output: 'standalone',

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
}

module.exports = nextConfig
