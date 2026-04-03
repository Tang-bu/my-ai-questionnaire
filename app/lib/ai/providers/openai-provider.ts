import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { AIProvider } from './base-provider';
import {
  AIAnalysisRequest,
  AIAnalysisResponse,
  AIProviderInfo,
  AIModelInfo,
  CostEstimation,
  AIProvider as ProviderEnum,
  AIModel,
} from '../types';

export class OpenAIProvider extends AIProvider {
  name = ProviderEnum.OPENAI;
  displayName = 'OpenAI';

  private client: OpenAI;

  constructor() {
    super();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    this.client = new OpenAI({
      apiKey,
      // 可选的配置
      // timeout: 30000, // 30秒超时
      // maxRetries: 3,  // 最大重试次数
    });
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const startTime = Date.now();

    try {
      this.validateRequest(request);

      const completion = await this.client.chat.completions.create({
        model: request.model,
        messages: [
          {
            role: 'system',
            content: '你是一名矿工安全意识评估分析助手，需要对用户的问卷回答进行专业分析。',
          },
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 1500,
        top_p: request.topP,
        frequency_penalty: request.frequencyPenalty,
        presence_penalty: request.presencePenalty,
        response_format: { type: 'json_object' }, // 要求JSON格式响应
      });

      const processingTime = Date.now() - startTime;
      const rawResponse = completion.choices[0]?.message?.content || '';

      // 计算成本
      const cost = this.calculateCost(completion.usage);

      return this.createResponse(
        rawResponse,
        request,
        processingTime,
        cost,
        {
          usage: completion.usage,
          finishReason: completion.choices[0]?.finish_reason,
        }
      );
    } catch (error: any) {
      return this.handleError(error, request);
    }
  }

  getAvailableModels(): string[] {
    return [
      AIModel.GPT4_O,
      AIModel.GPT4_TURBO,
      AIModel.GPT4,
      AIModel.GPT3_5_TURBO,
      // 更多模型可以在这里添加
    ];
  }

  getProviderInfo(): AIProviderInfo {
    return {
      name: this.name,
      displayName: 'OpenAI',
      description: '领先的人工智能研究和部署公司，提供GPT系列模型',
      models: this.getAvailableModels(),
      defaultModel: AIModel.GPT4_O,
      supportsTemperature: true,
      supportsTopP: true,
      supportsMaxTokens: true,
      costEstimation: {
        perInputToken: 0.000005,  // 每输入token $0.000005
        perOutputToken: 0.000015, // 每输出token $0.000015
      },
    };
  }

  getModelInfo(model: string): AIModelInfo | null {
    const modelInfo: Record<string, AIModelInfo> = {
      [AIModel.GPT4_O]: {
        name: AIModel.GPT4_O,
        displayName: 'GPT-4o',
        description: 'OpenAI最先进的模型，速度快，成本低，支持128K上下文',
        contextWindow: 128000,
        maxOutputTokens: 4096,
        trainingCutoff: '2023-10',
        capabilities: ['vision', 'json-mode', 'function-calling'],
      },
      [AIModel.GPT4_TURBO]: {
        name: AIModel.GPT4_TURBO,
        displayName: 'GPT-4 Turbo',
        description: 'GPT-4的优化版本，支持128K上下文',
        contextWindow: 128000,
        maxOutputTokens: 4096,
        trainingCutoff: '2023-04',
        capabilities: ['json-mode', 'function-calling'],
      },
      [AIModel.GPT4]: {
        name: AIModel.GPT4,
        displayName: 'GPT-4',
        description: 'OpenAI的GPT-4模型',
        contextWindow: 8192,
        maxOutputTokens: 4096,
        trainingCutoff: '2023-04',
        capabilities: ['json-mode', 'function-calling'],
      },
      [AIModel.GPT3_5_TURBO]: {
        name: AIModel.GPT3_5_TURBO,
        displayName: 'GPT-3.5 Turbo',
        description: '速度快，成本低的模型，适合一般任务',
        contextWindow: 16384,
        maxOutputTokens: 4096,
        trainingCutoff: '2023-04',
        capabilities: ['json-mode', 'function-calling'],
      },
    };

    return modelInfo[model] || null;
  }

  getCostEstimation(request: AIAnalysisRequest): CostEstimation | null {
    // 估算输入token数
    const inputTokens = this.estimateTokens(request.prompt);
    const outputTokens = request.maxTokens || 1500; // 假设最大输出

    // OpenAI定价（每千token）
    const pricing: Record<string, { input: number; output: number }> = {
      [AIModel.GPT4_O]: { input: 0.005, output: 0.015 },
      [AIModel.GPT4_TURBO]: { input: 0.01, output: 0.03 },
      [AIModel.GPT4]: { input: 0.03, output: 0.06 },
      [AIModel.GPT3_5_TURBO]: { input: 0.0005, output: 0.0015 },
    };

    const modelPricing = pricing[request.model];
    if (!modelPricing) return null;

    const inputCost = (inputTokens / 1000) * modelPricing.input;
    const outputCost = (outputTokens / 1000) * modelPricing.output;
    const estimatedCost = inputCost + outputCost;

    return {
      provider: this.name,
      model: request.model,
      estimatedCost,
      currency: 'USD',
      inputTokens,
      outputTokens,
      details: {
        inputCost,
        outputCost,
      },
    };
  }

  private calculateCost(usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  }): number {
    if (!usage) return 0;

    const { prompt_tokens = 0, completion_tokens = 0 } = usage;

    // 根据模型类型计算成本
    // 注意：这是一个简化版本，实际应该根据具体模型定价计算
    const inputRate = 0.000005;  // $0.000005 per input token
    const outputRate = 0.000015; // $0.000015 per output token

    const cost = prompt_tokens * inputRate + completion_tokens * outputRate;
    return parseFloat(cost.toFixed(6)); // 保留6位小数
  }

  // OpenAI特定的错误处理
  protected handleError(error: any, request: AIAnalysisRequest): AIAnalysisResponse {
    // 首先调用基类错误处理
    try {
      return super.handleError(error, request);
    } catch (e: any) {
      // 基类可能抛出特定错误，直接重新抛出
      throw e;
    }
  }

  // 重写验证方法，添加OpenAI特定的验证
  protected validateRequest(request: AIAnalysisRequest): void {
    super.validateRequest(request);

    // 验证模型是否可用
    const availableModels = this.getAvailableModels();
    if (!availableModels.includes(request.model)) {
      throw new Error(`Model ${request.model} is not available for OpenAI provider`);
    }

    // OpenAI特定限制
    if (request.maxTokens && request.maxTokens > 4096) {
      throw new Error('OpenAI models have a maximum of 4096 output tokens');
    }
  }
}