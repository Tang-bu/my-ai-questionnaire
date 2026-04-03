#!/usr/bin/env node

/**
 * 测试增强版问卷提交API
 */

require('dotenv').config({ path: '.env.local' });

console.log('=== 测试增强版问卷提交API（集成AI分析） ===\n');

async function testEnhancedAPI() {
  try {
    console.log('1. 准备测试数据...');

    const testData = {
      basicInfo: {
        name: "李四",
        gender: "男",
        age: "38",
        jobType: "通风技术员",
        workYears: "12",
        mineArea: "内蒙古鄂尔多斯煤矿"
      },
      answers: {
        "1": "我理解安全规范是煤矿安全生产的基石，包括通风系统检查、瓦斯监测、设备维护等各个方面。",
        "2": "发现通风系统异常时，我会立即检查检测仪器，分析原因，并按照应急预案进行处理和上报。",
        "3": "最容易被忽视的是长期安全运行后的麻痹心理，以及细节管理上的松懈。",
        "4": "遇到通风故障，首先确保区域安全，然后检查备用系统，同时报告控制中心并疏散相关人员。",
        "5": "我经常学习通风安全新技术，参加行业交流，关注最新的安全标准和案例。",
        "6": "对于不规范操作，我会立即制止并解释风险，必要时向上级汇报，确保问题得到解决。",
        "7": "安全意识强的员工通常责任心强、技术过硬、善于发现问题、严格遵守规程。",
        "8": "设备老化、维护不及时、人员变动频繁会影响通风系统的安全运行。",
        "9": "我始终坚持安全优先原则，宁可降低效率也要保证通风系统的可靠性。",
        "10": "建议加强系统巡检、更新老化设备、强化应急演练、建立安全绩效考核。"
      }
    };

    console.log(`   测试用户: ${testData.basicInfo.name}`);
    console.log(`   工种: ${testData.basicInfo.jobType}`);
    console.log(`   回答数: ${Object.keys(testData.answers).length}`);

    console.log('\n2. 发送API请求... (请等待，AI分析需要30-60秒)');

    const startTime = Date.now();

    // 使用内置的https模块
    const https = require('https');

    const requestData = JSON.stringify(testData);

    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/questionnaire/submit',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestData)
        },
        rejectUnauthorized: false
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            elapsedTime: Date.now() - startTime
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

      req.setTimeout(120000); // 2分钟超时
      req.write(requestData);
      req.end();
    });

    console.log(`\n✅ API响应，总用时: ${response.elapsedTime}ms`);
    console.log(`状态码: ${response.statusCode}`);

    try {
      const result = JSON.parse(response.data);

      if (result.success === true) {
        console.log('\n🎉 问卷提交成功！');

        console.log(`问卷ID: ${result.data?.questionnaireId}`);
        console.log(`消息: ${result.message}`);

        if (result.data?.hasAIAnalysis) {
          console.log('✅ AI分析已集成');
          console.log(`AI用时: ${result.data?.aiProcessingTime}ms`);
          console.log(`AI模型: ${result.data?.aiModel}`);

          if (result.aiAnalysis?.success) {
            console.log('\n📊 AI分析结果:');
            console.log(`   安全意识等级: ${result.aiAnalysis.safetyLevel}`);
            console.log(`   评分: ${result.aiAnalysis.score}`);

            if (result.aiAnalysis.overallAssessment) {
              console.log(`   总体评估: ${result.aiAnalysis.overallAssessment.substring(0, 100)}...`);
            }

            if (result.aiAnalysis.recommendations && result.aiAnalysis.recommendations.length > 0) {
              console.log(`   建议数: ${result.aiAnalysis.recommendations.length}`);
              result.aiAnalysis.recommendations.slice(0, 2).forEach((rec, i) => {
                console.log(`     ${i+1}. ${rec}`);
              });
            }

            console.log('\n💡 提示: AI分析结果已经包含在API响应中，前端可以直接使用！');

          } else {
            console.log('⚠️  AI分析部分失败');
            console.log(`   错误: ${result.aiAnalysis?.error}`);
          }
        } else {
          console.log('⚠️  未包含AI分析结果');
          console.log(`   原因: ${result.data?.aiError || '未知'}`);
        }

      } else {
        console.error('❌ 问卷提交失败:', result.error);
        console.log('详细:', result.message);
        if (result.details) {
          console.log('详情:', JSON.stringify(result.details, null, 2));
        }
      }

      // 保存结果
      const fs = require('fs');
      fs.writeFileSync('enhanced-api-test-result.json', JSON.stringify({
        request: testData,
        response: result,
        metadata: {
          elapsedTime: response.elapsedTime,
          timestamp: new Date().toISOString(),
          statusCode: response.statusCode
        }
      }, null, 2));

      console.log('\n💾 测试结果已保存到: enhanced-api-test-result.json');

    } catch (parseError) {
      console.error('❌ 解析JSON失败:', parseError.message);
      console.log('原始响应数据:', response.data.substring(0, 200));
    }

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);

    console.log('\n💡 可能的问题:');
    console.log('1. 开发服务器未运行: 确保已运行 npm run dev');
    console.log('2. API端点路径错误: 检查路由文件是否存在');
    console.log('3. 网络问题: 检查localhost:3001是否可达');
    console.log('4. 服务器错误: 查看开发服务器的控制台输出');

    process.exit(1);
  }
}

// 运行测试
testEnhancedAPI().catch(console.error);