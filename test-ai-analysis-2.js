#!/usr/bin/env node

/**
 * 简单的AI分析功能测试
 */

require('dotenv').config({ path: '.env.local' });

console.log('=== 简单AI分析测试 ===\n');

async function runTest() {
  try {
    console.log('1. 检查环境变量...');
    if (!process.env.SILICONFLOW_API_KEY) {
      console.error('❌ 错误: SILICONFLOW_API_KEY 未配置');
      process.exit(1);
    }
    console.log('✅ 硅基流动API密钥已配置');

    console.log('\n2. 创建AI管理器...');
    // 使用CommonJS方式导入
    const AIManager = require('./app/lib/ai/ai-manager').AIManager;
    const manager = new AIManager();

    console.log('✅ AI管理器创建成功');

    console.log('\n3. 测试AI分析...');
    const prompt = `您是一名专业的矿工安全意识评估专家。请分析以下矿工的回答：

矿工基本信息：
- 姓名：张三
- 工种：采煤工
- 工龄：10年

问卷回答：
1. 我理解安全规范包括：下井前要检查装备，工作中遵守操作规程，发现异常立即报告。
2. 发现隐患我会立即停止作业，先确保自身安全，然后向班组长报告。
3. 我认为最容易被忽视的是疲劳作业和心理松懈。
4. 遇到突发情况，我首先确保自身安全，然后帮助周围同事。
5. 我经常参加安全培训，也通过手机APP学习安全知识。
6. 我会善意提醒同事注意安全。
7. 安全意识强的员工通常责任心强、遵守规程、善于发现隐患。
8. 工作中设备老化和照明不足容易影响安全操作。
9. 我坚持安全第一原则，宁可慢一点也要确保安全。
10. 建议增加实操演练，定期检查设备。

请返回JSON格式的分析结果：{
  "overallAssessment": "总体评估",
  "safetyLevel": "安全意识等级（高/中/低）",
  "score": 85,
  "strengths": ["优势1", "优势2"],
  "weaknesses": ["不足1", "不足2"],
  "recommendations": ["建议1", "建议2"]
}`;

    console.log('发送分析请求... (请等待30-60秒)');

    const request = {
      questionnaireId: 'test-' + Date.now(),
      provider: 'siliconflow',
      model: 'Qwen/Qwen2.5-14B-Instruct',
      prompt: prompt,
      maxTokens: 1000,
    };

    const startTime = Date.now();
    let result;

    try {
      result = await manager.analyze(request);
      const elapsedTime = Date.now() - startTime;

      console.log(`\n✅ 分析成功！用时: ${elapsedTime}ms`);
      console.log(`提供商: ${result.provider}`);
      console.log(`模型: ${result.model}`);

      if (result.cost) {
        console.log(`成本: ¥${result.cost.toFixed(6)}`);
      }

      console.log('\n原始响应:');
      console.log(result.rawResponse.substring(0, 500) + '...');

      if (result.structuredResult) {
        console.log('\n结构化结果:');
        console.log(JSON.stringify(result.structuredResult, null, 2));

        // 保存结果
        const fs = require('fs');
        fs.writeFileSync('ai-test-result.json', JSON.stringify(result, null, 2));
        console.log('\n💾 结果已保存到: ai-test-result.json');
      }

    } catch (error) {
      console.error('❌ 分析失败:', error.message);
      console.error('详细错误:', error);
      console.log('\n💡 调试建议:');
      console.log('1. 检查API密钥是否有效');
      console.log('2. 检查网络连接');
      console.log('3. 检查硅基流动账户余额');
      process.exit(1);
    }

    console.log('\n4. 测试其他基本信息...');
    const providers = manager.getAvailableProviders();
    console.log(`可用提供商: ${providers.length}个`);
    providers.forEach(p => {
      console.log(`  - ${p.displayName}: ${p.models.length}个模型`);
    });

    console.log('\n✅ 测试完成！');
    console.log('\n下一步:');
    console.log('1. 访问 http://localhost:3000 查看前端');
    console.log('2. 填写问卷测试完整流程');
    console.log('3. 检查 ai-test-result.json 查看完整结果');

  } catch (error) {
    console.error('测试过程中出错:', error);
    console.log('\n💡 可能的问题:');
    console.log('1. 确保 .env.local 文件配置正确');
    console.log('2. 确保API密钥有余额');
    console.log('3. 尝试重启开发服务器');
    process.exit(1);
  }
}

// 运行测试
runTest().catch(console.error);