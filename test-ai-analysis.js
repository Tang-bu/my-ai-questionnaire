#!/usr/bin/env node

/**
 * AI分析功能测试脚本
 * 用法：node test-ai-analysis.js
 *
 * 这个脚本测试实际的AI分析功能，绕过数据库
 */

require('dotenv').config({ path: '.env.local' });

console.log('=== AI分析功能测试（绕过数据库） ===\n');

async function testAIAnalysis() {
  try {
    console.log('1. 创建AI管理器实例...');

    // 直接创建AIManager实例，而不是通过example导入
    const { AIManager } = require('./app/lib/ai/ai-manager');
    const manager = new AIManager();

    console.log('1. 检查AI管理器...');
    const providers = manager.getAvailableProviders();
    console.log(`✅ 已加载 ${providers.length} 个AI提供商`);
    providers.forEach(p => console.log(`   - ${p.displayName} (${p.models.length}个模型)`));

    console.log('\n2. 测试硅基流动提供商...');
    const health = await manager.getAllProviderHealth();
    console.log('提供商健康状态:');
    Object.entries(health).forEach(([provider, isHealthy]) => {
      console.log(`   - ${provider}: ${isHealthy ? '✅ 健康' : '❌ 异常'}`);
    });

    console.log('\n3. 执行矿工问卷分析测试...');

    // 模拟矿工问卷数据
    const mockBasicInfo = {
      name: "张三",
      gender: "男",
      age: "35",
      jobType: "采煤工",
      workYears: "10",
      mineArea: "山西大同煤矿"
    };

    // 构建分析提示词
    const prompt = `请分析以下矿工的安全意识问卷：

## 矿工基本信息
- 姓名: 张三
- 性别: 男
- 年龄: 35岁
- 工种: 采煤工
- 工龄: 10年
- 所属矿区: 山西大同煤矿

## 问卷回答
问题 1: 我理解安全规范包括：下井前要检查装备，工作中要遵守操作规程，发现异常要立即报告。平时都会注意这些。
问题 2: 发现隐患我会立即停止作业，先确保自身安全，然后向班组长报告，必要时协助设置警示标志。
问题 3: 我认为最容易被忽视的是疲劳作业和心理松懈，尤其是交接班时段。
问题 4: 遇到突发情况，我首先确保自身安全，然后帮助周围同事，最后按应急预案上报。
问题 5: 我经常参加安全培训，也通过手机APP学习安全知识，还会和同事交流经验。
问题 6: 我会善意提醒同事，如果屡教不改会向上级反映，安全不能妥协。
问题 7: 安全意识强的员工通常责任心强、遵守规程、善于发现隐患、乐于帮助他人。
问题 8: 工作中设备老化和照明不足容易影响安全操作，还有生产压力大的时候。
问题 9: 我坚持安全第一原则，宁可慢一点也要确保安全，效率必须服从安全。
问题 10: 建议增加实操演练，定期检查设备，加强心理疏导，建立安全奖励机制。

## 分析要求
请基于矿工的回答，评估其安全意识水平，包括：
1. 对安全规范的理解程度
2. 隐患识别和处理能力
3. 应急响应意识
4. 安全学习和改进意愿
5. 具体风险点和改进建议

请按照以下格式返回结构化的JSON分析结果：
{
  "overallAssessment": "总体评估结论",
  "safetyLevel": "安全意识等级（高/中/低）",
  "score": 数值评分（0-100）,
  "strengths": ["优势1", "优势2"],
  "weaknesses": ["不足1", "不足2"],
  "keyRisks": ["风险1", "风险2"],
  "recommendations": ["建议1", "建议2"],
  "trainingNeeds": ["培训需求1", "培训需求2"],
  "urgentActions": ["紧急措施1", "紧急措施2"]
}

请确保分析专业、客观、有针对性，对矿工的安全提升有实际帮助。`;

    console.log('分析基本信息:');
    console.log(`   姓名: ${mockBasicInfo.name}, 工种: ${mockBasicInfo.jobType}, 工龄: ${mockBasicInfo.workYears}年`);

    console.log('\n开始AI分析... (这可能需要30-60秒)');

    const startTime = Date.now();

    // 直接使用AIManager分析
    const analysisRequest = {
      questionnaireId: 'test-' + Date.now(),
      provider: 'siliconflow',
      model: 'Qwen/Qwen2.5-14B-Instruct',  // 使用较小的模型以降低成本
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 2000,
    };

    const result = await manager.analyze(analysisRequest);
    const totalTime = Date.now() - startTime;

    console.log(`\n✅ 分析完成！总用时: ${totalTime}ms`);

    if (result.success) {
      console.log('\n=== AI分析结果 ===');
      console.log(`提供商: ${analysisResult.metadata.provider}`);
      console.log(`模型: ${analysisResult.metadata.model}`);
      console.log(`成本: ¥${analysisResult.metadata.cost?.toFixed(6) || '未知'}`);

      // 显示结构化结果
      const result = analysisResult.result;
      console.log('\n📋 评估结果:');
      console.log(`安全意识等级: ${result.safetyLevel || '未指定'}`);
      console.log(`评分: ${result.score || '未评分'}`);

      if (result.overallAssessment) {
        console.log(`\n📝 总体评估:`);
        console.log(result.overallAssessment);
      }

      if (result.strengths && result.strengths.length > 0) {
        console.log(`\n✅ 优势:`);
        result.strengths.forEach((strength, i) => console.log(`  ${i+1}. ${strength}`));
      }

      if (result.recommendations && result.recommendations.length > 0) {
        console.log(`\n💡 改进建议:`);
        result.recommendations.forEach((rec, i) => console.log(`  ${i+1}. ${rec}`));
      }

      // 保存结果到文件供参考
      const fs = require('fs');
      const outputFile = 'ai-analysis-result.json';
      fs.writeFileSync(outputFile, JSON.stringify(analysisResult, null, 2));
      console.log(`\n💾 分析结果已保存到: ${outputFile}`);

    } else {
      console.error('❌ 分析失败:', analysisResult.error);
    }

    console.log('\n4. 下一步建议:');
    console.log('   1. 访问 http://localhost:3000 测试前端界面');
    console.log('   2. 填写真实问卷测试完整流程');
    console.log('   3. 如果需要保存结果，需先解决Supabase连接问题');
    console.log('   4. 查看生成的文件: ai-analysis-result.json');

    console.log('\n=== 测试完成 ===');

  } catch (error) {
    console.error('测试过程中出错:', error);
    console.log('\n💡 问题诊断:');
    console.log('   1. 确保 .env.local 中有正确的硅基流动API密钥');
    console.log('   2. 确保开发服务器未运行 (npm run dev 会占用端口)');
    console.log('   3. 检查网络连接');
    process.exit(1);
  }
}

// 运行测试
testAIAnalysis().catch(console.error);