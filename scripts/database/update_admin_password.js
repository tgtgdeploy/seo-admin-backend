#!/usr/bin/env node

/**
 * 更新管理员密码脚本
 * 用法: node scripts/database/update_admin_password.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAdminPassword() {
  const email = 'admin@telegram1688.com';
  const newPassword = 'Admin123456!';

  console.log('\n🔐 开始更新管理员密码...\n');

  try {
    // 检查环境变量
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL 环境变量未设置！请确保 .env.local 文件存在并已加载。');
    }

    // 哈希密码
    console.log('⏳ 正在加密密码...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新用户密码
    console.log('⏳ 正在更新数据库...');
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log('\n✅ 密码更新成功！\n');
    console.log('==========================================');
    console.log('📧 邮箱:', user.email);
    console.log('🔑 新密码:', newPassword);
    console.log('🌐 登录地址: https://adminseohub.xyz');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 更新失败:', error.message);
    console.error('\n可能的原因:');
    console.error('1. 环境变量未加载 - 请先运行: source <(cat .env.local | grep -v "^#" | sed "s/^/export /")');
    console.error('2. 数据库连接失败 - 请检查 DATABASE_URL 是否正确');
    console.error('3. 用户不存在 - 请检查邮箱是否正确\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();
