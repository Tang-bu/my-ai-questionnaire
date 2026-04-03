#!/usr/bin/env node

/**
 * API集成测试脚本
 * 用法：node test-api.js
 */

require('dotenv').config({ path: '.env.local' });

const https = require('https');
const http = require('http');

console.log('=== API集成测试 ===\n');

async function testHealthApi() {
  console.log('1. 测试健康检查API...');

  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log(`   ✅ 健康检查API正常 (状态: ${result.status})`);
            console.log(`   - 响应时间: ${result.responseTime}`);
            console.log(`   - 服务状态:`);
            Object.entries(result.services || {}).forEach(([service, info]) => {
              console.log(`     ${service}: ${info.status}`);
            });
          } else {
            console.log(`   ⚠️  健康检查API返回 ${res.statusCode}`);
          }
        } catch (error) {
          console.log(`   ❌ 解析响应失败: ${error.message}`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        console.log('   ⚠️  开发服务器未运行，请先执行: npm run dev');
      } else {
        console.log(`   ❌ 连接失败: ${error.message}`);
      }
      resolve();
    });

    req.on('timeout', () => {
      console.log('   ⚠️  请求超时');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function testSiliconFlowApi() {
  console.log('\n2. 测试硅基流动API...');

  if (!process.env.SILICONFLOW_API_KEY) {
    console.log('   ⚠️  SILICONFLOW_API_KEY 未配置，跳过API测试');
    return;
  }

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.siliconflow.cn',
      port: 443,
      path: '/v1/models',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const models = JSON.parse(data);
            console.log(`   ✅ 硅基流动API连接成功`);
            console.log(`   - 可用模型数量: ${models.data?.length || '未知'}`);

            // 显示一些常用模型
            const popularModels = models.data?.slice(0, 3) || [];
            popularModels.forEach(model => {
              console.log(`     • ${model.id}`);
            });
          } catch (error) {
            console.log(`   ✅ 硅基流动API连接成功 (无法解析响应)`);
          }
        } else if (res.statusCode === 401) {
          console.log('   ❌ API密钥无效或无权限');
        } else {
          console.log(`   ⚠️  API响应状态码: ${res.statusCode}`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ 连接失败: ${error.message}`);
      console.log('   提示: 检查网络连接或API密钥');
      resolve();
    });

    req.on('timeout', () => {
      console.log('   ⚠️  连接超时');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function testSupabaseConnection() {
  console.log('\n3. 测试Supabase连接...');

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('   ⚠️  Supabase URL 未配置，跳过测试');
    return;
  }

  // 简单测试Supabase REST API
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const apiUrl = new URL(supabaseUrl);

  return new Promise((resolve) => {
    const options = {
      hostname: apiUrl.hostname,
      port: apiUrl.port || 443,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    };

    const protocol = apiUrl.protocol === 'https:' ? https : http;

    const req = protocol.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 401) {
        // 401是正常的，因为需要认证才能访问具体数据
        console.log(`   ✅ Supabase连接成功`);
        console.log(`   - 服务状态: 可访问`);
      } else {
        console.log(`   ⚠️  Supabase响应状态码: ${res.statusCode}`);
      }
      resolve();
    });

    req.on('error', (error) => {
      console.log(`   ❌ Supabase连接失败: ${error.message}`);
      console.log('   提示: 检查Supabase项目状态和网络连接');
      resolve();
    });

    req.on('timeout', () => {
      console.log('   ⚠️  Supabase连接超时');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function checkEnvironment() {
  console.log('0. 检查环境配置...');

  const requiredConfigs = {
    'NEXT_PUBLIC_SUPABASE_URL': 'Supabase项目URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase匿名密钥',
    'SILICONFLOW_API_KEY': '硅基流动API密钥',
  };

  const missingConfigs = [];
  const validConfigs = [];

  Object.entries(requiredConfigs).forEach(([key, description]) => {
    if (process.env[key]) {
      validConfigs.push(`${description}: ✅ 已配置`);
    } else {
      missingConfigs.push(`${description}: ❌ 未配置`);
    }
  });

  console.log('   环境配置状态:');
  validConfigs.forEach(config => console.log(`   ${config}`));
  missingConfigs.forEach(config => console.log(`   ${config}`));

  if (missingConfigs.length > 0) {
    console.log('\n   🚨 警告: 部分配置缺失，某些功能可能无法正常工作');
    console.log('   请检查 .env.local 文件');
  }

  return missingConfigs.length === 0;
}

async function runAllTests() {
  console.log('开始运行集成测试...');
  console.log('='.repeat(50) + '\n');

  const envOk = await checkEnvironment();

  await testHealthApi();
  await testSiliconFlowApi();
  await testSupabaseConnection();

  console.log('\n' + '='.repeat(50));
  console.log('测试完成！\n');

  console.log('📋 下一步建议:');

  if (!envOk) {
    console.log('1. 🔧 完善环境配置');
    console.log('   编辑 .env.local 文件，添加缺失的配置项');
    console.log('   参考 SETUP-SUPABASE.md 和 SETUP-SILICONFLOW.md');
  }

  console.log('2. 🚀 启动开发服务器');
  console.log('   npm run dev');
  console.log('   然后访问 http://localhost:3000');

  console.log('3. 📝 测试用户流程');
  console.log('   - 注册账号: http://localhost:3000/register');
  console.log('   - 登录账号: http://localhost:3000/login');
  console.log('   - 提交问卷: 从首页开始');

  console.log('4. 🔍 测试API端点');
  console.log('   - 健康检查: curl http://localhost:3000/api/health');
  console.log('   - 详细检查: curl -X POST http://localhost:3000/api/health -d \'{"detailed": true}\'');

  console.log('\n💡 提示:');
  console.log('   - 如果遇到问题，查看控制台日志');
  console.log('   - AI功能需要硅基流动API密钥');
  console.log('   - 数据库功能需要Supabase正确配置');
}

// 运行所有测试
runAllTests().catch(console.error);