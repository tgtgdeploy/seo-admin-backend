/**
 * PM2 Configuration for SEO Admin
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 restart seo-admin
 *   pm2 logs seo-admin
 *   pm2 monit
 */

module.exports = {
  apps: [
    {
      name: 'seo-admin',
      script: 'node_modules/.bin/next',
      args: 'start --port 3100',
      cwd: process.cwd(), // Use current working directory
      instances: 1, // Single instance (Next.js handles concurrency)
      exec_mode: 'fork', // Use 'cluster' for API-heavy workloads

      // Environment - Load from .env.local file
      env_file: '.env.local',
      env: {
        NODE_ENV: 'production',
        PORT: 3100,
        NEXT_TELEMETRY_DISABLED: 1,
      },

      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/pm2/seo-admin-error.log',
      out_file: '/var/log/pm2/seo-admin-out.log',
      log_file: '/var/log/pm2/seo-admin-combined.log',
      merge_logs: true,

      // Restart strategy
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Watch (disable in production)
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.next'],

      // Source map support
      source_map_support: true,

      // Time
      time: true,
    },
  ],
};
