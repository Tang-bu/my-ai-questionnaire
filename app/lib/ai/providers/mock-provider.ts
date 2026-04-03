import { v4 as uuidv4 } from 'uuid';
import { AIProvider } from './base-provider';
import {
  AIAnalysisRequest,
  AIAnalysisResponse,
  AIProviderInfo,
  AIModelInfo,
  CostEstimation,
  AIProvider as ProviderEnum,
} from '../types';

export class MockProvider extends AIProvider {
  name = 'mock';
  displayName = 'Mock AI Provider (开发用)';

  private simulationDelay = 1000; // 1秒延迟模拟网络请求

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const startTime = Date.now();

    try {
      this.validateRequest(request);

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, this.simulationDelay));

      const processingTime = Date.now() - startTime;

      // 生成模拟响应（基于矿工安全意识评估）
      const rawResponse = this.generateMockResponse(request);

      // 模拟成本
      const cost = Math.random() * 0.01; // 随机小成本

      return this.createResponse(
        rawResponse,
        request,
        processingTime,
        cost,
        {
          simulated: true,
          requestId: uuidv4(),
        }
      );
    } catch (error: any) {
      return this.handleError(error, request);
    }
  }

  private generateMockResponse(request: AIAnalysisRequest): string {
    // 根据问卷内容生成模拟分析结果
    const mockResult = {
      综合评估结论: "该矿工对安全规范有基本的理解和认识，但在实际应用和应急处理方面仍有提升空间。整体安全意识处于中等水平。",
      安全意识等级: "中等",
      主要表现: [
        "对常规安全操作规程有一定了解",
        "能够识别常见的安全隐患",
        "在安全培训参与度方面表现良好"
      ],
      问题分析: [
        "对突发情况的应急处理流程不够熟悉",
        "对特定作业环境下的特殊风险认识不足",
        "在日常工作中的安全细节关注不够"
      ],
      改进建议: [
        "加强应急演练和突发事件处理培训",
        "开展针对特定工种的专业安全培训",
        "建立日常安全自查机制",
        "鼓励安全经验分享和案例学习"
      ],
      风险评估: {
        个人防护: "中等风险",
        作业环境: "中等风险",
        设备操作: "低风险",
        应急处理: "高风险"
      },
      得分详情: {
        安全知识掌握: 75,
        安全行为习惯: 68,
        应急处理能力: 62,
        安全主动性: 70,
        综合得分: 68.75
      },
      建议培训计划: [
        "应急处理专项培训（优先）",
        "岗位安全操作规程培训",
        "安全隐患识别与报告培训"
      ]
    };

    return JSON.stringify(mockResult, null, 2);
  }

  getAvailableModels(): string[] {
    return [
      'mock-gpt-4',
      'mock-deepseek',
      'mock-qwen',
    ];
  }

  getProviderInfo(): AIProviderInfo {
    return {
      name: this.name,
      displayName: this.displayName,
      description: '用于开发和测试的模拟AI提供商，无需API密钥',
      models: this.getAvailableModels(),
      defaultModel: 'mock-gpt-4',
      supportsTemperature: true,
      supportsTopP: true,
      supportsMaxTokens: true,
      costEstimation: {
        perInputToken: 0,
        perOutputToken: 0,
        perRequest: 0,
      },
    };
  }

  getModelInfo(model: string): AIModelInfo | null {
    const modelInfo: Record<string, AIModelInfo> = {
      'mock-gpt-4': {
        name: 'mock-gpt-4',
        displayName: 'Mock GPT-4',
        description: '模拟的GPT-4模型，用于开发和测试',
        contextWindow: 8000,
        maxOutputTokens: 4000,
        trainingCutoff: '2023-10',
        capabilities: ['json-mode', 'function-calling', 'mock'],
      },
      'mock-deepseek': {
        name: 'mock-deepseek',
        displayName: 'Mock DeepSeek',
        description: '模拟的DeepSeek模型，用于开发和测试',
        contextWindow: 32000,
        maxOutputTokens: 4000,
        trainingCutoff: '2024-01',
        capabilities: ['json-mode', 'mock'],
      },
      'mock-qwen': {
        name: 'mock-qwen',
        displayName: 'Mock Qwen',
        description: '模拟的通义千问模型，用于开发和测试',
        contextWindow: 32000,
        maxOutputTokens: 4000,
        trainingCutoff: '2023-12',
        capabilities: ['json-mode', 'mock'],
      },
    };

    return modelInfo[model] || null;
  }

  getCostEstimation(request: AIAnalysisRequest): CostEstimation | null {
    // 模拟成本始终为0
    const inputTokens = this.estimateTokens(request.prompt);
    const outputTokens = request.maxTokens || 1500;

    return {
      provider: this.name,
      model: request.model,
      estimatedCost: 0,
      currency: 'CNY',
      inputTokens,
      outputTokens,
      details: {
        inputCost: 0,
        outputCost: 0,
        requestCost: 0,
      },
    };
  }

  // 设置模拟延迟（用于测试）
  setSimulationDelay(delayMs: number): void {
    this.simulationDelay = delayMs;
  }

  // 模拟错误（用于测试错误处理）
  setShouldFail(failRate: number = 0): void {
    // 在实际实现中，可以设置失败率来测试错误处理
  }

  // 模拟服务不可用（用于测试故障转移）
  setServiceUnavailable(unavailable: boolean = false): void {
    // 在实际实现中，可以模拟服务不可用状态
  }
}