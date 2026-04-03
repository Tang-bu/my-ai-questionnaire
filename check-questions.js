#!/usr/bin/env node

/**
 * 检查数据库中是否有问卷题目
 */

require('dotenv').config({ path: '.env.local' });

const https = require('https');

async function checkQuestions() {
  console.log('=== 检查数据库中的问卷题目 ===\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase配置缺失');
    process.exit(1);
  }

  console.log('1. 检查环境配置...');
  console.log(`   Supabase URL: ${supabaseUrl.substring(0, 30)}...`);
  console.log(`   API Key长度: ${supabaseKey.length} 字符`);

  console.log('\n2. 查询数据库中的问卷题目...');

  // 构建Supabase REST API URL
  const url = new URL(supabaseUrl);
  const apiUrl = `${url.origin}/rest/v1/question_templates?select=*&order=order.asc&is_active=eq.true`;

  return new Promise((resolve, reject) => {
    const req = https.request(apiUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`   状态码: ${res.statusCode}`);

        if (res.statusCode === 200) {
          try {
            const questions = JSON.parse(data);
            console.log(`   找到 ${questions.length} 个题目`);

            if (questions.length > 0) {
              console.log('\n3. 题目列表:');
              questions.forEach((q, i) => {
                console.log(`   ${i+1}. [${q.order}] ${q.question_text.substring(0, 40)}...`);
              });
            } else {
              console.log('\n⚠️  数据库中没有题目，需要初始化数据');
              console.log('   执行初始化SQL（来自 SETUP-SUPABASE.md 第136-148行）');
            }

            resolve(questions);

          } catch (parseError) {
            console.error('❌ 解析响应失败:', parseError.message);
            console.log('原始响应:', data.substring(0, 200));
            reject(parseError);
          }
        } else if (res.statusCode === 404) {
          console.log('❌ question_templates 表可能不存在');
          console.log('   需要执行 SETUP-SUPABASE.md 中的SQL初始化脚本');
        } else {
          console.error(`❌ API请求失败: ${res.statusCode}`);
          console.log('响应:', data);
          reject(new Error(`API错误: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 请求失败:', error.message);
      reject(error);
    });

    req.end();
  });
}

// 运行检查
checkQuestions().catch(console.error);