// AI服务使用示例
import { AIManager } from './ai-manager';
import { AIProvider } from './types';

// 创建一个全局的AI管理器实例
let aiManager: AIManager | null = null;

export function getAIManager(): AIManager {
  if (!aiManager) {
    aiManager = new AIManager();
  }
  return aiManager;
}

// 示例1: 基本使用
export async function exampleBasicUsage() {
  const manager = getAIManager();

  console.log('=== AI服务使用示例 ===');

  // 1. 获取可用提供商
  const providers = manager.getAvailableProviders();
  console.log('可用AI提供商:', providers.map(p => `${p.displayName} (${p.name})`));

  // 2. 获取推荐提供商
  const recommended = manager.getRecommendedProvider({ minCost: true });
  console.log('推荐提供商 (最低成本):', recommended);

  // 3. 获取使用统计
  const stats = manager.getUsageStatistics();
  console.log('使用统计:', stats);

  // 4. 检查提供商健康状态
  const health = await manager.getAllProviderHealth();
  console.log('提供商健康状态:', health);

  return { providers, recommended, stats, health };
}

// 示例2: 分析矿工问卷
export async function analyzeMinerQuestionnaire(
  basicInfo: any,
  answers: Record<string, string>,
  options?: {
    provider?: string;
    model?: string;
  }
) {
  const manager = getAIManager();

  // 构建分析提示词
  const prompt = buildAnalysisPrompt(basicInfo, answers);

  const analysisRequest = {
    questionnaireId: 'example-' + Date.now(),
    provider: options?.provider || AIProvider.SILICONFLOW,
    model: options?.model || 'Qwen/Qwen2.5-14B-Instruct',
    prompt,
    temperature: 0.7,
    maxTokens: 2000,
  };

  console.log('正在分析矿工问卷...');
  console.log('使用:', analysisRequest.provider, analysisRequest.model);

  try {
    const startTime = Date.now();
    const result = await manager.analyze(analysisRequest);
    const processingTime = Date.now() - startTime;

    console.log('分析完成!');
    console.log('处理时间:', processingTime + 'ms');
    console.log('成本估算:', result.cost ? `¥${result.cost.toFixed(6)}` : '未知');
    console.log('提供商:', result.provider);
    console.log('模型:', result.model);

    return {
      success: true,
      result: result.structuredResult,
      rawResponse: result.rawResponse,
      metadata: {
        provider: result.provider,
        model: result.model,
        cost: result.cost,
        processingTime,
        totalTime: result.processingTime,
      },
    };

  } catch (error: any) {
    console.error('分析失败:', error.message);
    return {
      success: false,
      error: error.message,
      details: error,
    };
  }
}

// 构建矿工安全意识分析提示词
function buildAnalysisPrompt(basicInfo: any, answers: Record<string, string>): string {
  return `请分析以下矿工的安全意识问卷：

## 矿工基本信息
- 姓名: ${basicInfo.name || '未提供'}
- 性别: ${basicInfo.gender || '未提供'}
- 年龄: ${basicInfo.age || '未提供'}岁
- 工种: ${basicInfo.jobType || '未提供'}
- 工龄: ${basicInfo.workYears || '未提供'}年
- 所属矿区: ${basicInfo.mineArea || '未提供'}

## 问卷回答
${Object.entries(answers)
  .map(([questionId, answer]) => `问题 ${questionId}: ${answer}`)
  .join('\n')}

## 分析要求
请基于矿工的回答，评估其安全意识水平，包括：
1. 对安全规范的理解程度
2. 隐患识别和处理能力
3. 应急响应意识
4. 安全学习和改进意愿
5. 具体风险点和改进建议

请提供专业、客观、有针对性的分析，帮助矿工提升安全意识。`;
}

// 示例3: 测试所有提供商
export async function testAllProviders() {
  const manager = getAIManager();
  const providers = manager.getAvailableProviders();

  console.log('=== 测试所有AI提供商 ===');

  const results = [];

  for (const provider of providers) {
    console.log(`\n测试提供商: ${provider.displayName}`);

    // 测试每个提供商的第一个模型
    const model = provider.models[0];
    if (!model) continue;

    const testRequest = {
      questionnaireId: 'provider-test-' + Date.now(),
      provider: provider.name,
      model,
      prompt: '请简要回答：什么是矿工最重要的安全意识？',
      maxTokens: 100,
    };

    try {
      const startTime = Date.now();
      const result = await manager.analyze(testRequest);
      const processingTime = Date.now() - startTime;

      console.log(`  ✓ ${provider.name} 测试成功`);
      console.log(`    模型: ${model}`);
      console.log(`    时间: ${processingTime}ms`);
      console.log(`    成本: ${result.cost ? `¥${result.cost.toFixed(6)}` : '未知'}`);

      results.push({
        provider: provider.name,
        model,
        success: true,
        processingTime,
        cost: result.cost,
      });

    } catch (error: any) {
      console.log(`  ✗ ${provider.name} 测试失败: ${error.message}`);
      results.push({
        provider: provider.name,
        model,
        success: false,
        error: error.message,
      });
    }
  }

  console.log('\n=== 测试摘要 ===');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`成功: ${successful}, 失败: ${failed}`);

  if (successful > 0) {
    const avgTime = results
      .filter(r => r.success && r.processingTime)
      .reduce((sum, r) => sum + (r.processingTime || 0), 0) / successful;
    console.log(`平均处理时间: ${avgTime.toFixed(0)}ms`);
  }

  return results;
}

// 示例4: 成本估算对比
export async function compareCosts(prompt: string) {
  const manager = getAIManager();
  const providers = manager.getAvailableProviders();

  console.log('=== 成本估算对比 ===');
  console.log('提示词长度:', prompt.length, '字符');

  const comparisons = [];

  for (const provider of providers) {
    for (const model of provider.models.slice(0, 2)) { // 只测试前两个模型
      const request = {
        questionnaireId: 'cost-estimate',
        provider: provider.name,
        model,
        prompt,
        maxTokens: 1500,
      };

      const estimate = manager.getCostEstimation(request);
      if (estimate) {
        console.log(`${provider.displayName} | ${model}: ¥${estimate.estimatedCost.toFixed(6)}`);
        comparisons.push({
          provider: provider.name,
          displayName: provider.displayName,
          model,
          estimatedCost: estimate.estimatedCost,
          currency: estimate.currency,
          inputTokens: estimate.inputTokens,
        });
      }
    }
  }

  // 按成本排序
  comparisons.sort((a, b) => a.estimatedCost - b.estimatedCost);

  console.log('\n=== 成本排序 (低到高) ===');
  comparisons.forEach((item, index) => {
    console.log(`${index + 1}. ${item.displayName} | ${item.model}: ¥${item.estimatedCost.toFixed(6)}`);
  });

  return comparisons;
}

// 导出常用函数
export default {
  getAIManager,
  exampleBasicUsage,
  analyzeMinerQuestionnaire,
  testAllProviders,
  compareCosts,
  buildAnalysisPrompt,
};