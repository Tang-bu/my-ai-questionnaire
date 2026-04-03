#!/usr/bin/env node

/**
 * 检查环境变量配置
 */

require('dotenv').config({ path: '.env.local' });

console.log('=== 环境变量检查 ===\n');

console.log('1. Supabase配置:');
console.log(`   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ 未配置'}`);
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL.includes('yzvbkqzzblsmtmolbgrw')) {
    console.log('   ⚠️  注意: URL包含示例项目标识符');
  }
}
console.log(`   Key长度: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0} 字符`);
if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('sb_publishable')) {
    console.log('   ⚠️  注意: 密钥包含示例前缀');
  }
}

console.log('\n2. AI提供商配置:');
console.log(`   硅基流动API密钥: ${process.env.SILICONFLOW_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
console.log(`   OpenAI API密钥: ${process.env.OPENAI_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
console.log(`   DeepSeek API密钥: ${process.env.DEEPSEEK_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);

console.log('\n3. 应用配置:');
console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ 已配置' : '❌ 未配置'}`);
console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || '未配置'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || '未配置'}`);

console.log('\n4. 环境变量总数:');
const envVars = Object.keys(process.env).filter(key =>
  key.startsWith('NEXT_PUBLIC_') ||
  key.includes('API_KEY') ||
  key.includes('SUPABASE')
);
console.log(`   相关环境变量: ${envVars.length}个`);

console.log('\n=== 诊断建议 ===\n');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('❌ Supabase配置不完整');
  console.log('   请在 .env.local 文件中配置:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
}

if (!process.env.SILICONFLOW_API_KEY) {
  console.log('❌ 硅基流动API密钥未配置');
  console.log('   虽然应用可以运行，但AI分析功能无法工作');
}

// 简单的Supabase连接测试
console.log('\n5. 基本连接测试:');
console.log('   从您的环境变量判断，可能存在配置问题。');

// 检查URL格式
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  console.log(`   Supabase URL格式: ${supabaseUrl.startsWith('https://') ? '✅ 正确' : '❌ 应以https://开头'}`);
  console.log(`   URL以 .supabase.co 结尾: ${supabaseUrl.includes('.supabase.co') ? '✅ 是' : '❌ 可能不正确'}`);
}

console.log('\n=== 下一步操作 ===\n');
console.log('1. 确保 Supabase 项目URL和密钥正确');
console.log('2. 如果需要获取新的Supabase配置:');
console.log('   a. 登录 https://supabase.com/dashboard');
console.log('   b. 进入您的项目');
console.log('   c. 在 Settings > API 页面查看配置');
console.log('3. 复制正确的 URL 和 anon key 到 .env.local 文件');
console.log('4. 重启开发服务器: npm run dev');