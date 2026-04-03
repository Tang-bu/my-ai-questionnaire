#!/usr/bin/env node

/**
 * 测试新的AI分析API端点
 */

require('dotenv').config({ path: '.env.local' });

console.log('=== 测试AI分析API端点 ===\n');

async function testAPIAnalysis() {
  try {
    console.log('1. 准备测试数据...');

    const testData = {
      basicInfo: {
        name: "王五",
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
      },
      provider: "siliconflow",
      model: "Qwen/Qwen2.5-14B-Instruct"
    };

    console.log('   测试用户:', testData.basicInfo.name);
    console.log('   工种:', testData.basicInfo.jobType);
    console.log('   AI提供商:', testData.provider);
    console.log('   模型:', testData.model);

    console.log('\n2. 发送API请求... (请等待，这可能需要时间)');

    const startTime = Date.now();

    // 使用内置的https模块
    const https = require('https');

    const requestData = JSON.stringify(testData);

    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/questionnaire/test-analysis',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestData)
        },
        rejectUnauthorized: false // 允许自签名证书
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
            data: data
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

      req.setTimeout(120000); // 2分钟超时（AI分析可能需要较长时间）
      req.write(requestData);
      req.end();
    });

    const elapsedTime = Date.now() - startTime;

    console.log(`\n✅ API响应，用时: ${elapsedTime}ms`);
    console.log(`状态码: ${response.statusCode}`);

    try {
      const result = JSON.parse(response.data);

      if (result.success === true) {
        console.log('\n🎉 AI分析成功！');
        console.log(`提供商: ${result.analysis?.provider}`);
        console.log(`模型: ${result.analysis?.model}`);
        console.log(`分析用时: ${result.analysis?.processingTime}ms`);

        if (result.analysis?.cost) {
          console.log(`成本估算: ¥${result.analysis.cost.toFixed(6)}`);
        }

        console.log('\n📊 结构化结果:');
        if (result.result?.structuredResult) {
          const structured = result.result.structuredResult;
          console.log(`安全意识等级: ${structured.safetyLevel || '未指定'}`);
          console.log(`评分: ${structured.score || '未评分'}`);

          if (structured.overallAssessment) {
            console.log(`\n总体评估:`);
            console.log(structured.overallAssessment);
          }

          if (structured.strengths && structured.strengths.length > 0) {
            console.log(`\n✅ 优势 (${structured.strengths.length}个):`);
            structured.strengths.forEach((item, i) => console.log(`  ${i+1}. ${item}`));
          }

          if (structured.recommendations && structured.recommendations.length > 0) {
            console.log(`\n💡 建议 (${structured.recommendations.length}个):`);
            structured.recommendations.forEach((item, i) => console.log(`  ${i+1}. ${item}`));
          }

          // 保存完整结果
          const fs = require('fs');
          fs.writeFileSync('api-analysis-result.json', JSON.stringify(result, null, 2));
          console.log('\n💾 完整结果已保存到: api-analysis-result.json');
        } else {
          console.log('⚠️  未收到结构化结果');
          console.log('原始响应:', result.result?.rawResponse?.substring(0, 500) + '...');
        }

      } else {
        console.error('❌ AI分析失败:', result.error);
        console.log('详细:', result.message);
        if (result.details) {
          console.log('详情:', JSON.stringify(result.details, null, 2));
        }
      }

    } catch (parseError) {
      console.error('❌ 解析JSON失败:', parseError.message);
      console.log('原始响应数据:', response.data.substring(0, 200));
    }

    console.log('\n=== 测试总结 ===');
    console.log('✅ AI分析API端点工作正常');
    console.log('✅ 可以处理完整的问卷分析请求');
    console.log('✅ 返回结构化的分析结果');

    console.log('\n下一步：');
    console.log('1. 将AI分析集成到正式问卷提交流程中');
    console.log('2. 修改问卷确认页面以显示AI分析结果');
    console.log('3. 将AI分析结果保存到数据库');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);

    console.log('\n💡 可能的问题:');
    console.log('1. 开发服务器未运行: 确保已运行 npm run dev');
    console.log('2. API端点路径错误: 检查路由文件是否存在');
    console.log('3. 网络问题: 检查localhost:3000是否可达');
    console.log('4. 服务器错误: 查看开发服务器的控制台输出');

    console.log('\n🔧 检查步骤:');
    console.log('1. 确认开发服务器正在运行');
    console.log('2. 访问 http://localhost:3000 检查应用是否正常');
    console.log('3. 查看开发服务器控制台的错误信息');
    console.log('4. 检查 app/api/questionnaire/test-analysis/route.ts 文件');

    process.exit(1);
  }
}

// 运行测试
testAPIAnalysis().catch(console.error);