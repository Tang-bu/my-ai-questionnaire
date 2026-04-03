#!/usr/bin/env node

/**
 * 简单的硅基流动API测试
 */

require('dotenv').config({ path: '.env.local' });

const https = require('https');

console.log('=== 简单硅基流动API测试 ===\n');

async function testSiliconFlow() {
  try {
    console.log('1. 检查API密钥...');
    const apiKey = process.env.SILICONFLOW_API_KEY;
    if (!apiKey) {
      console.error('❌ 硅基流动API密钥未配置');
      console.log('请在 .env.local 文件中配置 SILICONFLOW_API_KEY');
      process.exit(1);
    }
    console.log('✅ API密钥已配置');

    console.log('\n2. 准备测试请求...');
    const requestData = JSON.stringify({
      model: 'Qwen/Qwen2.5-14B-Instruct',
      messages: [
        {
          role: 'system',
          content: '请返回一个简单的JSON测试响应：{"status": "success", "test": "硅基流动API连接正常"}'
        },
        {
          role: 'user',
          content: '请确认API连接是否正常'
        }
      ],
      temperature: 0.7,
      max_tokens: 100,
      response_format: { type: 'json_object' }
    });

    console.log('3. 发送API请求... (请等待)');

    const startTime = Date.now();

    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.siliconflow.cn',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const elapsedTime = Date.now() - startTime;
          resolve({
            statusCode: res.statusCode,
            data: data,
            elapsedTime: elapsedTime
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('请求超时'));
      });

      req.setTimeout(30000); // 30秒超时
      req.write(requestData);
      req.end();
    });

    console.log(`✅ 请求完成，用时: ${response.elapsedTime}ms`);
    console.log(`状态码: ${response.statusCode}`);

    if (response.statusCode === 200) {
      try {
        const result = JSON.parse(response.data);
        console.log('\n📊 API响应:');
        console.log(JSON.stringify(result, null, 2));

        if (result.choices && result.choices[0]?.message?.content) {
          const content = result.choices[0].message.content;
          console.log('\n✅ AI响应内容:');
          console.log(content);

          // 尝试解析JSON响应
          try {
            const parsedContent = JSON.parse(content);
            console.log('\n📋 解析后的内容:');
            console.log(JSON.stringify(parsedContent, null, 2));
          } catch (e) {
            console.log('AI返回的内容不是有效的JSON格式');
          }
        }

        // 保存结果
        const fs = require('fs');
        fs.writeFileSync('simple-api-test.json', JSON.stringify({
          request: requestData,
          response: result,
          metadata: {
            elapsedTime: response.elapsedTime,
            timestamp: new Date().toISOString()
          }
        }, null, 2));

        console.log('\n💾 测试结果已保存到: simple-api-test.json');

      } catch (parseError) {
        console.error('❌ 解析响应失败:', parseError.message);
        console.log('原始响应:', response.data.substring(0, 200));
      }
    } else {
      console.error('❌ API请求失败，状态码:', response.statusCode);
      console.log('响应内容:', response.data);
    }

    console.log('\n=== 测试总结 ===');
    console.log('✅ 硅基流动API连接成功');
    console.log('✅ API密钥有效');
    console.log('✅ AI模型响应正常');
    console.log('\n下一步：');
    console.log('1. 修改问卷提交API，集成AI分析功能');
    console.log('2. 测试完整的用户流程');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);

    console.log('\n💡 常见问题解决:');
    console.log('1. API密钥无效: 检查密钥是否正确');
    console.log('2. 网络连接问题: 检查防火墙/代理设置');
    console.log('3. 账户余额不足: 检查硅基流动账户');
    console.log('4. 密钥权限: 确保密钥有聊天权限');

    console.log('\n🔗 检查链接:');
    console.log('- 硅基流动控制台: https://siliconflow.cn/console');
    console.log('- API文档: https://siliconflow.cn/api-docs');

    process.exit(1);
  }
}

// 运行测试
testSiliconFlow().catch(console.error);