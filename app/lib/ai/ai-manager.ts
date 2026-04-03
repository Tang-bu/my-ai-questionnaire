import { AIProvider } from './providers/base-provider';
import { OpenAIProvider } from './providers/openai-provider';
import { DeepSeekProvider } from './providers/deepseek-provider';
import { QwenProvider } from './providers/qwen-provider';
import { SiliconFlowProvider } from './providers/siliconflow-provider';
import { MockProvider } from './providers/mock-provider';
import {
  AIAnalysisRequest,
  AIAnalysisResponse,
  AIProviderInfo,
  AIProviderError,
  AIServiceUnavailableError,
  AIUsageStatistics,
  CostEstimation,
  AIProvider as ProviderEnum,
} from './types';

export class AIManager {
  private providers: Map<string, AIProvider> = new Map();
  private usageStats: Map<string, AIUsageStatistics> = new Map();
  private defaultProvider: string = ProviderEnum.OPENAI;
  private fallbackOrder: string[] = [
    'siliconflow',     // 硅基流动 (您的首选)
    ProviderEnum.OPENAI,
    ProviderEnum.DEEPSEEK,
    ProviderEnum.QWEN,
    'mock',            // 模拟提供商作为最后保底
  ];

  constructor() {
    this.registerProviders();
    this.initializeUsageStats();
  }

  private registerProviders(): void {
    // 根据环境变量动态注册提供商
    // 注意：实际实现中会检查环境变量是否配置
    try {
      // 硅基流动 (优先，因为您已经有了这个API)
      if (process.env.SILICONFLOW_API_KEY) {
        const provider = new SiliconFlowProvider();
        this.providers.set(provider.name, provider);
        console.log(`Registered AI provider: ${provider.displayName}`);
        // 设置硅基流动为默认提供商
        this.defaultProvider = provider.name;
        this.fallbackOrder = [provider.name, ...this.fallbackOrder.filter(p => p !== provider.name)];
      }

      // OpenAI
      if (process.env.OPENAI_API_KEY) {
        const provider = new OpenAIProvider();
        this.providers.set(provider.name, provider);
        console.log(`Registered AI provider: ${provider.displayName}`);
      }

      // DeepSeek
      if (process.env.DEEPSEEK_API_KEY) {
        const provider = new DeepSeekProvider();
        this.providers.set(provider.name, provider);
        console.log(`Registered AI provider: ${provider.displayName}`);
      }

      // 通义千问
      if (process.env.QWEN_API_KEY) {
        const provider = new QwenProvider();
        this.providers.set(provider.name, provider);
        console.log(`Registered AI provider: ${provider.displayName}`);
      }

      // 如果没有注册任何提供商，使用模拟提供商
      if (this.providers.size === 0) {
        console.warn('No AI providers configured, using mock provider for development');
        const mockProvider = new MockProvider();
        this.providers.set(mockProvider.name, mockProvider);
        this.defaultProvider = mockProvider.name;
      }

      // 更新回退顺序，确保已注册的提供商在前
      this.fallbackOrder = this.fallbackOrder.filter(providerName =>
        this.providers.has(providerName)
      );

      console.log(`Registered ${this.providers.size} AI providers`);
      console.log(`Default provider: ${this.defaultProvider}`);
      console.log(`Fallback order: ${this.fallbackOrder.join(' -> ')}`);

    } catch (error) {
      console.error('Failed to register AI providers:', error);
      // 总是注册模拟提供商作为保底
      const mockProvider = new MockProvider();
      this.providers.set(mockProvider.name, mockProvider);
      this.defaultProvider = mockProvider.name;
    }
  }

  private initializeUsageStats(): void {
    for (const providerName of this.providers.keys()) {
      this.usageStats.set(providerName, {
        provider: providerName,
        model: 'unknown',
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalCost: 0,
        totalTokens: { input: 0, output: 0 },
        averageProcessingTime: 0,
      });
    }
  }

  private updateUsageStats(
    provider: string,
    model: string,
    success: boolean,
    processingTime: number,
    cost?: number,
    inputTokens?: number,
    outputTokens?: number
  ): void {
    const stats = this.usageStats.get(provider) || {
      provider,
      model,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalCost: 0,
      totalTokens: { input: 0, output: 0 },
      averageProcessingTime: 0,
      lastUsedAt: new Date(),
    };

    stats.totalRequests++;
    stats.model = model;
    stats.lastUsedAt = new Date();

    if (success) {
      stats.successfulRequests++;
    } else {
      stats.failedRequests++;
    }

    if (cost !== undefined) {
      stats.totalCost += cost;
    }

    if (inputTokens !== undefined) {
      stats.totalTokens.input += inputTokens;
    }

    if (outputTokens !== undefined) {
      stats.totalTokens.output += outputTokens;
    }

    // 更新平均处理时间
    const totalSuccessful = stats.successfulRequests;
    if (totalSuccessful > 0) {
      stats.averageProcessingTime =
        (stats.averageProcessingTime * (totalSuccessful - 1) + processingTime) / totalSuccessful;
    }

    this.usageStats.set(provider, stats);
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const startTime = Date.now();
    let attempt = 0;
    const maxAttempts = this.fallbackOrder.length;

    // 如果指定了提供商，优先使用
    if (request.provider && this.providers.has(request.provider)) {
      try {
        const provider = this.providers.get(request.provider)!;
        const response = await provider.analyze(request);
        const processingTime = Date.now() - startTime;

        this.updateUsageStats(
          request.provider,
          request.model,
          true,
          processingTime,
          response.cost
        );

        return response;
      } catch (error) {
        console.error(`Analysis failed with provider ${request.provider}:`, error);
        // 如果指定提供商失败，回退到故障转移逻辑
        return this.failoverAnalysis(request, startTime);
      }
    }

    // 如果没有指定提供商或指定提供商不存在，使用故障转移逻辑
    return this.failoverAnalysis(request, startTime);
  }

  private async failoverAnalysis(
    originalRequest: AIAnalysisRequest,
    startTime: number
  ): Promise<AIAnalysisResponse> {
    let lastError: any;

    // 按照回退顺序尝试各个提供商
    for (const providerName of this.fallbackOrder) {
      if (!this.providers.has(providerName)) continue;

      const provider = this.providers.get(providerName)!;
      const request = { ...originalRequest, provider: providerName };

      try {
        const response = await provider.analyze(request);
        const processingTime = Date.now() - startTime;

        this.updateUsageStats(
          providerName,
          request.model,
          true,
          processingTime,
          response.cost
        );

        // 记录成功的提供商，供下次优先使用
        if (providerName !== this.defaultProvider) {
          console.log(`Switched to ${providerName} after failover`);
        }

        return response;
      } catch (error: any) {
        lastError = error;
        console.error(`Analysis failed with provider ${providerName}:`, error.message);

        // 如果是配额用尽错误，暂时禁用该提供商
        if (error instanceof AIProviderError && error.name === 'AIQuotaExceededError') {
          this.temporarilyDisableProvider(providerName);
        }

        continue; // 尝试下一个提供商
      }
    }

    // 所有提供商都失败
    const processingTime = Date.now() - startTime;
    this.updateUsageStats(
      'unknown',
      originalRequest.model,
      false,
      processingTime
    );

    throw new AIServiceUnavailableError(
      'All AI providers are unavailable',
      originalRequest.model
    );
  }

  private temporarilyDisableProvider(providerName: string): void {
    console.warn(`Temporarily disabling AI provider: ${providerName}`);
    // 在实际实现中，可以设置一个禁用时间窗口
    // 或者降低其在回退顺序中的优先级
  }

  getAvailableProviders(): Array<{
    name: string;
    displayName: string;
    models: string[];
    info?: AIProviderInfo;
    enabled: boolean;
  }> {
    const result = [];

    for (const [name, provider] of this.providers.entries()) {
      const info = provider.getProviderInfo();
      result.push({
        name,
        displayName: provider.displayName,
        models: provider.getAvailableModels(),
        info,
        enabled: true,
      });
    }

    return result;
  }

  getProviderInfo(providerName: string): AIProviderInfo | null {
    const provider = this.providers.get(providerName);
    return provider ? provider.getProviderInfo() : null;
  }

  getModelInfo(providerName: string, model: string) {
    const provider = this.providers.get(providerName);
    return provider ? provider.getModelInfo(model) : null;
  }

  getCostEstimation(request: AIAnalysisRequest): CostEstimation | null {
    const provider = this.providers.get(request.provider);
    if (!provider) return null;

    return provider.getCostEstimation(request);
  }

  getUsageStatistics(): AIUsageStatistics[] {
    return Array.from(this.usageStats.values());
  }

  getProviderUsage(providerName: string): AIUsageStatistics | null {
    return this.usageStats.get(providerName) || null;
  }

  // 重置使用统计
  resetUsageStatistics(providerName?: string): void {
    if (providerName) {
      const stats = this.usageStats.get(providerName);
      if (stats) {
        this.usageStats.set(providerName, {
          ...stats,
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          totalCost: 0,
          totalTokens: { input: 0, output: 0 },
          averageProcessingTime: 0,
        });
      }
    } else {
      for (const [name, stats] of this.usageStats.entries()) {
        this.usageStats.set(name, {
          ...stats,
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          totalCost: 0,
          totalTokens: { input: 0, output: 0 },
          averageProcessingTime: 0,
        });
      }
    }
  }

  // 设置默认提供商
  setDefaultProvider(providerName: string): boolean {
    if (this.providers.has(providerName)) {
      this.defaultProvider = providerName;
      // 将该提供商移动到回退顺序的第一个
      this.fallbackOrder = [
        providerName,
        ...this.fallbackOrder.filter(p => p !== providerName),
      ];
      return true;
    }
    return false;
  }

  // 设置回退顺序
  setFallbackOrder(order: string[]): void {
    // 只保留实际存在的提供商
    this.fallbackOrder = order.filter(providerName =>
      this.providers.has(providerName)
    );

    // 确保默认提供商在第一个
    if (!this.fallbackOrder.includes(this.defaultProvider)) {
      this.fallbackOrder.unshift(this.defaultProvider);
    }
  }

  // 检查提供商可用性
  async checkProviderHealth(providerName: string): Promise<boolean> {
    const provider = this.providers.get(providerName);
    if (!provider) return false;

    try {
      // 发送一个简单的测试请求
      const testRequest: AIAnalysisRequest = {
        provider: providerName,
        model: provider.getAvailableModels()[0] || 'unknown',
        prompt: 'Hello, are you working?',
        questionnaireId: 'health-check',
        maxTokens: 10,
      };

      await provider.analyze(testRequest);
      return true;
    } catch (error) {
      console.error(`Health check failed for ${providerName}:`, error);
      return false;
    }
  }

  // 获取所有提供商健康状态
  async getAllProviderHealth(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {};

    for (const providerName of this.providers.keys()) {
      healthStatus[providerName] = await this.checkProviderHealth(providerName);
    }

    return healthStatus;
  }

  // 获取推荐提供商（基于成本、性能等）
  getRecommendedProvider(criteria?: {
    minCost?: boolean;
    maxSpeed?: boolean;
    maxReliability?: boolean;
  }): string | null {
    if (this.providers.size === 0) return null;

    // 简单的推荐逻辑
    if (criteria?.minCost) {
      // 在实际实现中，可以根据成本统计数据选择最便宜的
      return this.defaultProvider;
    }

    if (criteria?.maxSpeed) {
      // 根据平均处理时间选择最快的
      let fastestProvider = this.defaultProvider;
      let fastestTime = Infinity;

      for (const [name, stats] of this.usageStats.entries()) {
        if (stats.averageProcessingTime > 0 && stats.averageProcessingTime < fastestTime) {
          fastestTime = stats.averageProcessingTime;
          fastestProvider = name;
        }
      }

      return fastestProvider;
    }

    if (criteria?.maxReliability) {
      // 根据成功率选择最可靠的
      let mostReliableProvider = this.defaultProvider;
      let highestSuccessRate = 0;

      for (const [name, stats] of this.usageStats.entries()) {
        if (stats.totalRequests > 0) {
          const successRate = stats.successfulRequests / stats.totalRequests;
          if (successRate > highestSuccessRate) {
            highestSuccessRate = successRate;
            mostReliableProvider = name;
          }
        }
      }

      return mostReliableProvider;
    }

    // 默认返回配置的默认提供商
    return this.defaultProvider;
  }
}