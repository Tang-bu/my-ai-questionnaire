#!/usr/bin/env node

/**
 * Supabase连接问题诊断
 */

require('dotenv').config({ path: '.env.local' });

const https = require('https');
const fetch = require('node-fetch');

async function diagnoseSupabase() {
  console.log('=== Supabase连接诊断 ===\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 1. 基本配置检查
  console.log('1. 检查基本配置:');
  console.log(`   URL: ${supabaseUrl ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`   Key: ${supabaseKey ? `✅ 已配置 (${supabaseKey.length}字符)` : '❌ 未配置'}`);

  if (!supabaseUrl || !supabaseKey) {
    console.log('\n❌ 配置不完整，无法继续诊断');
    return;
  }

  // 2. 检查URL格式
  console.log('\n2. 检查URL格式:');
  const urlObj = new URL(supabaseUrl);
  console.log(`   协议: ${urlObj.protocol} ${urlObj.protocol === 'https:' ? '✅' : '❌'}`);
  console.log(`   主机名: ${urlObj.hostname}`);

  if (urlObj.hostname.includes('.supabase.co')) {
    console.log('   域名格式: ✅ 看起来是Supabase官方域名');
  } else {
    console.log('   域名格式: ⚠️  非标准Supabase域名');
  }

  // 3. 测试API连通性
  console.log('\n3. 测试API连通性:');

  try {
    console.log('   a) 测试健康检查端点...');
    const healthUrl = `${supabaseUrl}/rest/v1/`;
    const response = await fetch(healthUrl, {
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    }).catch(err => {
      console.log(`      ❌ 请求失败: ${err.message}`);
      return null;
    });

    if (response) {
      console.log(`      状态码: ${response.status}`);
      if (response.status === 200) {
        console.log('      连接: ✅ 成功');

        // 尝试获取数据库信息
        console.log('\n   b) 测试数据库查询...');
        try {
          const dbUrl = `${supabaseUrl}/rest/v1/profiles?select=count`;
          const dbResponse = await fetch(dbUrl, {
            headers: {
              'apikey': supabaseKey,
              'Content-Type': 'application/json'
            }
          });

          if (dbResponse.status === 200) {
            console.log('      ✅ 数据库查询成功');
          } else if (dbResponse.status === 404) {
            console.log('      ⚠️  表可能不存在 (404)');
          } else if (dbResponse.status === 401 || dbResponse.status === 403) {
            console.log('      ❌ 权限不足 (可能需要RLS策略调整)');
          } else {
            console.log(`      ⚠️  意外的状态码: ${dbResponse.status}`);
          }
        } catch (dbError) {
          console.log(`      ❌ 数据库查询失败: ${dbError.message}`);
        }
      } else if (response.status === 401) {
        console.log('      ❌ API密钥无效');
      } else if (response.status === 404) {
        console.log('      ⚠️  项目可能不存在或已删除');
      } else {
        console.log(`      ⚠️  意外状态码: ${response.status}`);
      }
    }

  } catch (error) {
    console.log(`   ❌ 测试失败: ${error.message}`);
  }

  // 4. 网络诊断
  console.log('\n4. 网络诊断:');

  try {
    const pingTest = () => new Promise((resolve) => {
      const req = https.request({
        hostname: urlObj.hostname,
        port: 443,
        path: '/',
        method: 'HEAD',
        timeout: 5000
      }, (res) => {
        resolve(true);
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => resolve(false));

      req.end();
    });

    const isReachable = await pingTest();
    console.log(`   可达性: ${isReachable ? '✅ 可达' : '❌ 不可达'}`);

  } catch (error) {
    console.log(`   网络测试异常: ${error.message}`);
  }

  // 5. 项目状态检查建议
  console.log('\n5. 诊断建议:');
  console.log('   如果连接失败，请检查:');
  console.log('   a) Supabase项目是否暂停？');
  console.log('      登录Supabase仪表板，检查项目状态');
  console.log('      https://supabase.com/dashboard');
  console.log('   b) 项目是否在免费计划且已暂停？');
  console.log('      免费计划的项目在无活动时会暂停');
  console.log('      需要手动恢复');
  console.log('   c) 网络防火墙/代理是否阻止连接？');
  console.log('      尝试在其他网络环境测试');
  console.log('   d) CORS设置是否正确？');
  console.log('      Supabase项目设置中需要配置CORS');
  console.log('      应包括: http://localhost:3000');

  // 6. 快速修复步骤
  console.log('\n6. 快速修复步骤:');
  console.log('   1. 登录 Supabase 仪表板');
  console.log('   2. 检查项目状态是否为 "Paused"');
  console.log('   3. 如果是暂停状态，点击 "Resume project"');
  console.log('   4. 等待1-2分钟让项目恢复');
  console.log('   5. 在 Settings > API 中检查CORS配置');
  console.log('   6. 确保包含: http://localhost:3000');
  console.log('   7. 重启开发服务器');

  console.log('\n=== 诊断完成 ===');
}

diagnoseSupabase().catch(console.error);