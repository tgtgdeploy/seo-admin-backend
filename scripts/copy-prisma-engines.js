#!/usr/bin/env node

/**
 * Copy Prisma engines to .next/server for production deployment
 * This ensures the query engine is available at runtime
 */

const fs = require('fs');
const path = require('path');

const prismaClientPath = path.join(
  process.cwd(),
  'node_modules/.prisma/client'
);

const nextServerPath = path.join(process.cwd(), '.next/server');

if (!fs.existsSync(prismaClientPath)) {
  console.log('⚠️  Prisma client not found, skipping engine copy');
  process.exit(0);
}

if (!fs.existsSync(nextServerPath)) {
  console.log('⚠️  .next/server directory not found, skipping engine copy');
  process.exit(0);
}

// Find all .so.node files (engine binaries)
const files = fs.readdirSync(prismaClientPath);
const engineFiles = files.filter(file => file.endsWith('.so.node'));

if (engineFiles.length === 0) {
  console.log('⚠️  No Prisma engine files found');
  process.exit(0);
}

console.log('📦 Copying Prisma engines to .next/server...');

engineFiles.forEach(file => {
  const src = path.join(prismaClientPath, file);
  const dest = path.join(nextServerPath, file);

  try {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied ${file}`);
  } catch (error) {
    console.error(`✗ Failed to copy ${file}:`, error.message);
  }
});

console.log('✅ Prisma engines copied successfully');
